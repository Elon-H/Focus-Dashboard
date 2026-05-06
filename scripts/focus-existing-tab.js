#!/bin/zsh

APP_URL="${1:-http://127.0.0.1:5173/}"

# ChatGPT Atlas bundle id: com.openai.atlas.web.
RESULT="$(/usr/bin/osascript \
  -e 'on run argv' \
  -e 'set targetUrl to item 1 of argv' \
  -e 'set targetBase to my stripTrailingSlash(targetUrl)' \
  -e 'using terms from application "Google Chrome"' \
  -e 'tell application id "com.openai.atlas.web"' \
  -e 'if not running then return "not-found"' \
  -e 'repeat with windowIndex from 1 to count windows' \
  -e 'repeat with tabIndex from 1 to count tabs of window windowIndex' \
  -e 'set browserTab to item tabIndex of tabs of window windowIndex' \
  -e 'set tabUrl to URL of browserTab' \
  -e 'if tabUrl is targetBase or tabUrl starts with targetBase & "/" or tabUrl starts with targetBase & "#" or tabUrl starts with targetBase & "?" then' \
  -e 'set active tab index of window windowIndex to tabIndex' \
  -e 'set index of window windowIndex to 1' \
  -e 'activate' \
  -e 'return "focused"' \
  -e 'end if' \
  -e 'end repeat' \
  -e 'end repeat' \
  -e 'end tell' \
  -e 'end using terms from' \
  -e 'return "not-found"' \
  -e 'end run' \
  -e 'on stripTrailingSlash(valueText)' \
  -e 'set valueText to valueText as text' \
  -e 'if valueText ends with "/" then return text 1 thru -2 of valueText' \
  -e 'return valueText' \
  -e 'end stripTrailingSlash' \
  "$APP_URL" 2>/dev/null || true)"

if [ "$RESULT" = "focused" ]; then
  echo "focused"
else
  echo "not-found"
fi
