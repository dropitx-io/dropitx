#!/usr/bin/env bash
# Post one message to Slack through an incoming webhook.
# Never fails the caller: a missing webhook or a Slack outage only logs a warning,
# so notifications can never block or fail a deploy.
set -uo pipefail

message="${1:?usage: notify-slack.sh <message>}"

if [ -z "${SLACK_WEBHOOK_URL:-}" ]; then
  echo "SLACK_WEBHOOK_URL is not set; skipping Slack notification"
  exit 0
fi

payload=$(jq -n --arg text "$message" '{text: $text}')
if ! curl --fail --silent --show-error --max-time 10 \
  --header 'Content-Type: application/json' \
  --data "$payload" "$SLACK_WEBHOOK_URL" >/dev/null; then
  echo "::warning::Slack notification failed"
fi
exit 0
