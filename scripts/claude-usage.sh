#!/bin/bash
# Claude Code /usage 자동 실행 스크립트
# iTerm2에서 claude를 실행하고 사용량을 출력 후 창을 닫는다

OUTPUT_FILE="/tmp/claude_usage_capture.txt"
rm -f "$OUTPUT_FILE"

# AppleScript: iTerm2 열기 → cd → claude 실행 → /usage → 텍스트 캡처 → 창 닫기
USAGE_TEXT=$(osascript << 'APPLESCRIPT'
tell application "iTerm2"
    activate
    set newWin to (create window with default profile)
    tell newWin
        tell current session
            write text "cd /Users/gk/workspace"
            delay 0.5
            write text "claude"
            delay 6
            write text "/usage"
            delay 5
        end tell
    end tell

    -- 화면 텍스트 캡처
    set captured to ""
    tell window 1
        tell current session
            set captured to text of it
        end tell
    end tell

    -- claude 종료 후 창 닫기
    tell window 1
        tell current session
            write text "/exit"
        end tell
    end tell
    delay 2
    close window 1

    return captured
end tell
APPLESCRIPT
)

# 숫자와 리셋 시간 파싱
SESSION_PCT=$(echo "$USAGE_TEXT" | grep -A2 "Current session" | grep -oE '[0-9]+%' | head -1 | tr -d '%')
SESSION_RESETS=$(echo "$USAGE_TEXT" | grep -A3 "Current session" | grep "Resets" | grep -oE '[0-9]+[ap]m' | head -1)

WEEK_PCT=$(echo "$USAGE_TEXT" | grep -A2 "Current week" | grep -oE '[0-9]+%' | head -1 | tr -d '%')
WEEK_RESETS=$(echo "$USAGE_TEXT" | grep -A3 "Current week" | grep "Resets" | grep -oE '[0-9]+[ap]m' | head -1)

# JSON 출력
cat << JSON
{
  "current_session": {
    "used_percent": ${SESSION_PCT:-0},
    "resets": "${SESSION_RESETS:-unknown}"
  },
  "current_week": {
    "used_percent": ${WEEK_PCT:-0},
    "resets": "${WEEK_RESETS:-unknown}"
  }
}
JSON
