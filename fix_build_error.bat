@echo off
chcp 65001 > nul
echo ========================================================
echo [우리동네 떨이] 긴급 수리: 누락된 파일 추가
echo ========================================================
echo.
echo Vercel에서 에러가 났던 "뱃지(Badge) 부품"을 만들었습니다.
echo 이 파일을 서버로 다시 보냅니다!
echo.

echo [1단계] 수정된 내용 저장...
call git add .
call git commit -m "Fix: Add missing Badge component"

echo.
echo [2단계] GitHub로 전송 (로그인 창이 뜨면 로그인!)
call git push origin main

echo.
echo ========================================================
echo [완료] 수정본 전송 완료! 🚑
echo Vercel에서 자동으로 다시 배포될 겁니다. (잠시 기다려보세요!)
echo ========================================================
pause
