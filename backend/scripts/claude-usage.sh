#!/bin/bash
# Claude Code /usage 자동 실행 스크립트
# iTerm2에서 claude를 실행하고 사용량을 출력 후 창을 닫는다

OUTPUT_FILE="/tmp/claude_usage_capture.txt"
rm -f "$OUTPUT_FILE"

# iTerm2가 실행 중이 아니면 먼저 실행 후 완전히 뜰 때까지 대기
if ! pgrep -x "iTerm2" > /dev/null; then
    open -a iTerm
    for i in $(seq 1 10); do
        sleep 1
        pgrep -x "iTerm2" > /dev/null && break
    done
fi

# AppleScript: iTerm2 열기 → cd → claude 실행 → /usage → 텍스트 캡처 → 창 닫기
USAGE_TEXT=$(osascript << 'APPLESCRIPT'
tell application "iTerm2"
    activate
    set newWin to (create window with default profile)
    tell newWin
        tell current session
            set columns to 150
            set rows to 40
            write text "n"
            delay 1
            write text "cd /Users/gk/workspace"
            delay 1
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
echo "{"
echo "  \"current_session\": {"
echo "    \"used_percent\": ${SESSION_PCT:-0},"
echo "    \"resets\": \"${SESSION_RESETS:-unknown}\""
echo "  },"
echo "  \"current_week\": {"
echo "    \"used_percent\": ${WEEK_PCT:-0},"
echo "    \"resets\": \"${WEEK_RESETS:-unknown}\""
echo "  }"
echo "}"
