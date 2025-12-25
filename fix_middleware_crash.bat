@echo off
chcp 65001 > nul
echo ========================================================
echo [우리동네 떨이] 긴급 수리: 안전장치 추가
echo ========================================================
echo.
echo "비밀번호가 없어도 일단 문은 열어주게" 고쳤습니다.
echo 이제 500 에러 대신 화면이 뜰 겁니다!
echo.

echo [1단계] 수정된 내용 저장...
call git add .
call git commit -m "Fix: Make middleware robust against missing env vars"

echo.
echo [2단계] GitHub로 전송
call git push origin main

echo.
echo ========================================================
echo [완료] 전송 완료! 🚑
echo Vercel이 잠시 후 자동으로 'Redeploy'를 시작합니다.
echo 기다리시면 화면이 뜰 겁니다!
echo ========================================================
pause
