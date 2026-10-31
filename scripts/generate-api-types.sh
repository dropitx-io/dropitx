#!/bin/bash
# Generate TypeScript types from the FastAPI OpenAPI spec.
# Usage: bash scripts/generate-api-types.sh [API_URL]
set -euo pipefail

API_URL="${1:-${API_URL:-http://localhost:8000}}"
OUTPUT="lib/api-types.ts"

cd "$(dirname "$0")/.."

# Keep the spec under the repo (gitignored) instead of the shared system temp dir.
mkdir -p .tmp
SPEC_DIR="$(mktemp -d .tmp/openapi.XXXXXX)"
SPEC_FILE="$SPEC_DIR/openapi.json"
trap 'rm -rf "$SPEC_DIR"' EXIT

echo "Fetching OpenAPI spec from ${API_URL}/openapi.json ..."
curl -sf "${API_URL}/openapi.json" -o "$SPEC_FILE" || {
  echo "Error: Could not fetch OpenAPI spec from ${API_URL}" >&2
  exit 1
}

echo "Generating TypeScript types..."
# --no-install: use the pinned local dev dependency, never fetch a different version.
npx --no-install openapi-typescript "$SPEC_FILE" -o "$OUTPUT"

echo "Done -> ${OUTPUT}"
