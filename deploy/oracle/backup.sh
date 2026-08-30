#!/usr/bin/env bash
set -Eeuo pipefail

umask 077

backup_config=${BLACKFRAME_BACKUP_CONFIG:-/srv/blackframe-data/config/backup.env}

if [[ -f "$backup_config" ]]; then
    # This file contains deployment settings, not application secrets.
    # shellcheck disable=SC1090
    source "$backup_config"
fi

project_dir=${BLACKFRAME_PROJECT_DIR:-/opt/blackframe}
data_root=${BLACKFRAME_DATA_ROOT:-/srv/blackframe-data}
env_file=${BLACKFRAME_ENV_FILE:-$data_root/config/app.env}
backup_dir=$data_root/backups
retention_days=${LOCAL_BACKUP_RETENTION_DAYS:-7}
object_prefix=${OCI_BACKUP_PREFIX:-blackframe}

if [[ ! -f "$project_dir/compose.production.yaml" || ! -f "$env_file" ]]; then
    echo "Production compose or environment file is missing." >&2
    exit 1
fi

case "$backup_dir" in
    "$data_root"/backups) ;;
    *)
        echo "Backup directory escaped the configured data root." >&2
        exit 1
        ;;
esac

if [[ ! $retention_days =~ ^[0-9]+$ ]] || (( retention_days < 1 )); then
    echo "LOCAL_BACKUP_RETENTION_DAYS must be a positive integer." >&2
    exit 1
fi

mkdir -p "$backup_dir"
work_dir=$(mktemp -d "$backup_dir/.pending.XXXXXX")
trap 'rm -rf -- "$work_dir"' EXIT

timestamp=$(date -u +%Y%m%dT%H%M%SZ)
database_name="blackframe-database-$timestamp.dump"
media_name="blackframe-media-$timestamp.tar.gz"
manifest_name="blackframe-$timestamp.sha256"

export BLACKFRAME_DATA_ROOT="$data_root"
export BLACKFRAME_ENV_FILE="$env_file"
compose=(docker compose --env-file "$env_file" --project-directory "$project_dir" -f "$project_dir/compose.production.yaml")

# The quoted variables are expanded by the shell inside the container.
# shellcheck disable=SC2016
"${compose[@]}" exec -T postgres sh -c \
    'pg_dump --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" --format=custom --compress=9' \
    >"$work_dir/$database_name"

tar -C "$data_root" -czf "$work_dir/$media_name" post-media public-media

(
    cd "$work_dir"
    sha256sum "$database_name" "$media_name" >"$manifest_name"
)

mv "$work_dir/$database_name" "$backup_dir/$database_name"
mv "$work_dir/$media_name" "$backup_dir/$media_name"
mv "$work_dir/$manifest_name" "$backup_dir/$manifest_name"

if [[ -n ${OCI_BUCKET:-} ]]; then
    if ! command -v oci >/dev/null 2>&1; then
        echo "OCI_BUCKET is set, but the OCI CLI is unavailable." >&2
        exit 1
    fi

    object_path="$object_prefix/$timestamp"
    for file_name in "$database_name" "$media_name" "$manifest_name"; do
        oci_args=(
            os object put
            --auth instance_principal
            --bucket-name "$OCI_BUCKET"
            --name "$object_path/$file_name"
            --file "$backup_dir/$file_name"
            --force
        )

        if [[ -n ${OCI_NAMESPACE:-} ]]; then
            oci_args+=(--namespace-name "$OCI_NAMESPACE")
        fi

        oci "${oci_args[@]}"
    done
fi

find "$backup_dir" -maxdepth 1 -type f \
    \( -name 'blackframe-database-*.dump' -o -name 'blackframe-media-*.tar.gz' -o -name 'blackframe-*.sha256' \) \
    -mtime "+$retention_days" -delete

echo "Backup completed: $timestamp"
