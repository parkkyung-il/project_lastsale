@echo off
chcp 65001 > nul
echo ========================================================
echo [우리동네 떨이] 긴급 수리: 입구컷 해결
echo ========================================================
echo.
echo "문지기(Middleware)"가 다른 파일이랑 꼬여서 에러가 났네요.
echo 문지기 기능을 한 파일로 합쳐서 간단하게 만들었습니다.
echo 이 수정본을 GitHub로 보냅니다!
echo.

echo [1단계] 수정된 내용 저장...
call git add .
call git commit -m "Fix: Inline middleware logic to avoid Edge Runtime issues"

echo.
echo [2단계] GitHub로 전송
call git push origin main

echo.
echo ========================================================
echo [완료] 수정본 전송 완료! 🚑
echo Vercel에서 자동으로 다시 배포될 겁니다.
echo ========================================================
pause
