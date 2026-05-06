#!/bin/zsh

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
exec "$PROJECT_DIR/scripts/launch-focus-projects.sh" --foreground
