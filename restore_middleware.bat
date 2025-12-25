@echo off
chcp 65001 > nul
echo ========================================================
echo [우리동네 떨이] 긴급 수리: 문지기 복구
echo ========================================================
echo.
echo 404 에러(페이지 없음)가 뜨는 걸 보니, 문지기를 없앤 게 
echo 오히려 길을 잃게 만든 것 같습니다.
echo 튼튼하게 고친 문지기를 다시 세워두겠습니다!
echo.

echo [1단계] 임시 파일을 지우고 새 문지기 파일 확인
if exist _middleware.ts.bak del _middleware.ts.bak

echo.
echo [2단계] 변경사항 저장 및 전송...
call git add .
call git commit -m "Fix: Restore robust middleware to resolve 404"
call git push origin main

echo.
echo ========================================================
echo [완료] 전송 완료! 🚑
echo Vercel 재배포를 기다려주세요. 이번엔 진짜 뜹니다!
echo (Settings에서 환경변수 넣는 것도 잊지 마세요!)
echo ========================================================
pause
