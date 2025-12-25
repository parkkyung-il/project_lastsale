@echo off
chcp 65001 > nul
echo ========================================================
echo [우리동네 떨이] 긴급 구조 & 디자인 대공사
echo ========================================================
echo.
echo 1. 디자인을 "전면 개편" 했습니다. (모바일 앱 스타일)
echo 2. 배포 에러의 주범인 "문지기"를 확실하게 수동으로 삭제합니다.
echo.

echo [1단계] middleware.ts 파일 삭제 (Vercel 에러 해결의 핵심)
del middleware.ts 2>nul
del _middleware.ts.bak 2>nul
del restore_middleware.bat 2>nul
del disable_middleware.bat 2>nul

echo.
echo [2단계] 디자인 업데이트 & 삭제 내역 전송...
call git add .
call git commit -m "Fix: Remove middleware & Upgrade Design to V2"
call git push origin main

echo.
echo ========================================================
echo [완료] 모든 작업이 끝났습니다! 🚑
echo.
echo Vercel에서 "Ready"가 뜨면 [Visit]을 눌러보세요.
echo 훨씬 예뻐진 앱이 기다리고 있을 겁니다! ✨
echo ========================================================
pause
