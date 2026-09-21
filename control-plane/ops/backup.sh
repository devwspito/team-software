#!/usr/bin/env bash
set -euo pipefail

readonly backup_root=/var/backups/developer-control-plane
readonly container=control-plane-database-1
readonly stamp="$(date -u +%Y%m%dT%H%M%SZ)"
readonly destination="${backup_root}/developer-${stamp}.pgdump"
readonly temporary="${destination}.partial"

umask 077
install -d -o root -g root -m 0700 "${backup_root}"
docker exec "${container}" pg_dump -U developer -d developer -Fc > "${temporary}"
test -s "${temporary}"
mv "${temporary}" "${destination}"
find "${backup_root}" -maxdepth 1 -type f -name 'developer-*.pgdump' -mtime +14 -delete
printf 'backup=%s\n' "${destination}"
