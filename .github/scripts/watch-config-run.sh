#!/usr/bin/env bash
# Wait for a vps192-k8s-config workflow run on one commit, then follow it to completion.
# Uses the Actions API only: fine-grained tokens cannot read PR check runs, so this
# needs just "Actions: Read" on the config repo. Exits non-zero if the run fails.
#
# Usage: watch-config-run.sh <workflow-file> <commit-sha> <event> [github-output-key]
# When github-output-key is given, the run URL is written to $GITHUB_OUTPUT under that key
# before watching, so callers can link to it even when the run fails.
set -euo pipefail

workflow="${1:?workflow file required}"
commit="${2:?commit sha required}"
event="${3:?event required}"
output_key="${4:-}"
repo="${CONFIG_REPO:?CONFIG_REPO must be set}"

run_id=""
for _ in $(seq 1 30); do
  run_id=$(gh run list --repo "$repo" --workflow "$workflow" --commit "$commit" --event "$event" \
    --json databaseId --jq '.[0].databaseId // empty')
  [ -n "$run_id" ] && break
  sleep 10
done
if [ -z "$run_id" ]; then
  echo "::error::No $workflow run ($event) found for $repo@$commit after 5 minutes"
  exit 1
fi

run_url="https://github.com/$repo/actions/runs/$run_id"
echo "Watching $workflow: $run_url"
if [ -n "$output_key" ] && [ -n "${GITHUB_OUTPUT:-}" ]; then
  echo "$output_key=$run_url" >> "$GITHUB_OUTPUT"
fi
gh run watch "$run_id" --repo "$repo" --exit-status --interval 15
