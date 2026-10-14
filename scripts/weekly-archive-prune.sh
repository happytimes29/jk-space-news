#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="/Users/jk_sapce/Projects/JKSpaceNews/jk-space-news"
LOG_DIR="/Users/jk_sapce/Library/Logs/jk-space-news"
LOCK_DIR="/tmp/jk-space-news-weekly-archive.lock"
PATH="/opt/homebrew/bin:/opt/homebrew/sbin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"

mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/weekly-archive-prune.log"

exec >>"$LOG_FILE" 2>&1

echo "[$(date '+%Y-%m-%d %H:%M:%S %Z %z')] weekly archive prune started"

if ! mkdir "$LOCK_DIR" 2>/dev/null; then
  echo "Another weekly archive prune is already running; exiting."
  exit 0
fi
trap 'rmdir "$LOCK_DIR"' EXIT

cd "$PROJECT_DIR"

if [[ "${DRY_RUN:-0}" == "1" ]]; then
  npm run archive:prune:dry
else
  npm run archive:prune
  npm run verify:content
fi

echo "[$(date '+%Y-%m-%d %H:%M:%S %Z %z')] weekly archive prune finished"
