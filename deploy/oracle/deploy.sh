#!/usr/bin/env bash
set -Eeuo pipefail

project_dir=${BLACKFRAME_PROJECT_DIR:-/opt/blackframe}
data_root=${BLACKFRAME_DATA_ROOT:-/srv/blackframe-data}
env_file=${BLACKFRAME_ENV_FILE:-$data_root/config/app.env}
branch=${BLACKFRAME_DEPLOY_BRANCH:-main}
health_url=${BLACKFRAME_HEALTHCHECK_URL:-http://127.0.0.1:8080/up}
health_host=${BLACKFRAME_HEALTHCHECK_HOST:-127.0.0.1}

for command in curl docker git; do
    if ! command -v "$command" >/dev/null 2>&1; then
        echo "Required command '$command' is not installed." >&2
        exit 1
    fi
done

if [[ ! -d "$project_dir/.git" ]]; then
    echo "$project_dir is not a Git checkout." >&2
    exit 1
fi

if [[ ! -f "$env_file" ]]; then
    echo "Production environment file not found: $env_file" >&2
    exit 1
fi

if [[ -n $(git -C "$project_dir" status --porcelain) ]]; then
    echo "Deployment checkout has uncommitted changes; refusing to overwrite them." >&2
    exit 1
fi

export BLACKFRAME_DATA_ROOT="$data_root"
export BLACKFRAME_ENV_FILE="$env_file"

compose=(docker compose --env-file "$env_file" --project-directory "$project_dir" -f "$project_dir/compose.production.yaml")

git -C "$project_dir" fetch --prune origin "$branch"
git -C "$project_dir" checkout "$branch"
git -C "$project_dir" merge --ff-only "origin/$branch"

revision=$(git -C "$project_dir" rev-parse --short=12 HEAD)
echo "Deploying revision $revision"

"${compose[@]}" config --quiet
"${compose[@]}" pull postgres caddy
"${compose[@]}" build --pull web
"${compose[@]}" up -d postgres

for attempt in {1..30}; do
    # The quoted variables are expanded by the shell inside the container.
    # shellcheck disable=SC2016
    if "${compose[@]}" exec -T postgres sh -c 'pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB"' >/dev/null 2>&1; then
        break
    fi

    if [[ $attempt -eq 30 ]]; then
        echo "PostgreSQL did not become ready." >&2
        exit 1
    fi

    sleep 2
done

BLACKFRAME_PROJECT_DIR="$project_dir" \
BLACKFRAME_DATA_ROOT="$data_root" \
BLACKFRAME_ENV_FILE="$env_file" \
    "$project_dir/deploy/oracle/backup.sh"

"${compose[@]}" run --rm --no-deps web php artisan migrate --force --no-interaction
"${compose[@]}" up -d --remove-orphans

for attempt in {1..30}; do
    if curl --fail --silent --show-error --header "Host: $health_host" "$health_url" >/dev/null; then
        echo "Revision $revision is healthy at $health_url"
        "${compose[@]}" ps
        exit 0
    fi

    if [[ $attempt -eq 30 ]]; then
        echo "Deployment started, but the health check failed: $health_url" >&2
        "${compose[@]}" ps >&2
        "${compose[@]}" logs --tail=100 web caddy >&2
        exit 1
    fi

    sleep 2
done
