@echo off
chcp 65001 > nul
echo ========================================================
echo [우리동네 떨이] 긴급 수리: 코드 오타 수정
echo ========================================================
echo.
echo "판매 완료" 표시 기능에서 오타가 발견되어 수정했습니다.
echo 이 수정본을 GitHub로 보냅니다!
echo.

echo [1단계] 수정된 내용 저장...
call git add .
call git commit -m "Fix: Add missing type definition for is_sold_out"

echo.
echo [2단계] GitHub로 전송
call git push origin main

echo.
echo ========================================================
echo [완료] 수정본 전송 완료! 🚑
echo Vercel에서 자동으로 다시 배포될 겁니다.
echo ========================================================
pause
