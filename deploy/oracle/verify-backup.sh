#!/usr/bin/env bash
set -Eeuo pipefail

if [[ $# -ne 2 ]]; then
    echo "Usage: $0 <database.dump> <media.tar.gz>" >&2
    exit 1
fi

database_dump=$1
media_archive=$2
project_dir=${BLACKFRAME_PROJECT_DIR:-/opt/blackframe}
production_data_root=${BLACKFRAME_DATA_ROOT:-/srv/blackframe-data}
env_file=${BLACKFRAME_ENV_FILE:-$production_data_root/config/app.env}

if [[ ! -f "$database_dump" || ! -f "$media_archive" ]]; then
    echo "Both backup files must exist." >&2
    exit 1
fi

temporary_parent=${TMPDIR:-/tmp}
verify_root=$(mktemp -d "$temporary_parent/blackframe-restore.XXXXXX")
verify_project="blackframe-restore-$$"

case "$verify_root" in
    "$temporary_parent"/blackframe-restore.*) ;;
    *)
        echo "Temporary restore path is outside the expected directory." >&2
        exit 1
        ;;
esac

export BLACKFRAME_DATA_ROOT="$verify_root"
export BLACKFRAME_ENV_FILE="$env_file"
compose=(docker compose --project-name "$verify_project" --env-file "$env_file" --project-directory "$project_dir" -f "$project_dir/compose.production.yaml")

cleanup() {
    "${compose[@]}" down --volumes --remove-orphans >/dev/null 2>&1 || true
    rm -rf -- "$verify_root"
}
trap cleanup EXIT

tar -tzf "$media_archive" >/dev/null
"${compose[@]}" up -d --wait postgres

# The quoted variables are expanded by the shell inside the container.
# shellcheck disable=SC2016
"${compose[@]}" exec -T postgres sh -c \
    'pg_restore --exit-on-error --no-owner --username "$POSTGRES_USER" --dbname "$POSTGRES_DB"' \
    <"$database_dump"

# shellcheck disable=SC2016
table_count=$("${compose[@]}" exec -T postgres sh -c \
    'psql --tuples-only --no-align --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" --command "select count(*) from pg_catalog.pg_tables where schemaname = '\''public'\'';"')

echo "Backup verified in an isolated PostgreSQL volume ($table_count public tables)."
