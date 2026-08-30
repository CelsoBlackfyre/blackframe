#!/usr/bin/env sh
set -eu

lock_hash="$(sha256sum package-lock.json | cut -d ' ' -f 1)"
stamp_file="node_modules/.blackframe-package-lock"

if [ ! -x node_modules/.bin/vite ] || [ ! -f "$stamp_file" ] || [ "$(cat "$stamp_file" 2>/dev/null || true)" != "$lock_hash" ]; then
    npm ci --no-audit --no-fund
    printf '%s\n' "$lock_hash" > "$stamp_file"
fi

exec npm run dev -- --host 0.0.0.0 --port "${VITE_PORT:-5173}" --strictPort
