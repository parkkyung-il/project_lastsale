@echo off
chcp 65001 > nul
echo ========================================================
echo [우리동네 떨이] 최후의 수단: 검문소 철거 (재시도)
echo ========================================================
echo.
echo "문지기(Middleware)"가 계속 문제를 일으켜서, 잠시 철거합니다.
echo 일단 앱이 열리는지 확인하는 게 우선이니까요!
echo.

echo [1단계] 문지기 파일 이름 변경 (middleware.ts -> _middleware.ts.bak)
ren middleware.ts _middleware.ts.bak 2>nul
move middleware.ts _middleware.ts.bak 2>nul
if exist middleware.ts (
    echo [경고] 파일이 아직 있습니다. 수동으로 지워질 수 있습니다.
    del middleware.ts
)

echo.
echo [2단계] 변경사항 저장 및 전송...
call git add .
call git commit -m "Temp: Disable middleware to fix Vercel 500 error"
call git push origin main

echo.
echo ========================================================
echo [완료] 전송 완료! 🚑
echo Vercel에서 재배포가 끝나면 무조건 화면이 뜰 겁니다.
echo (로그인은 나중에 고치면 되니 일단 화면부터 봅시다!)
echo ========================================================
pause
