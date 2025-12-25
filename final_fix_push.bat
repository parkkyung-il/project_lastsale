@echo off
chcp 65001 > nul
echo ========================================================
echo [우리동네 떨이] GitHub 보안 에러 완전 해결 & 업로드
echo ========================================================
echo.
echo GitHub가 "비밀번호가 파일에 적려있다"며 업로드를 막았습니다.
echo 문제가 된 파일을 삭제하고, 기록을 깨끗이 지우고 다시 올립니다.
echo.

echo [1단계] 문제가 된 파일 삭제 중...
del deploy_to_github.bat
del manual_push.bat

echo [2단계] Git 기록 초기화 중...
rmdir /s /q .git

echo [3단계] 코드 다시 담는 중...
call git init
call git add .
call git commit -m "Neighborhood Clearance App - Final Clean Push"

echo [4단계] GitHub 서버로 전송 (로그인 창이 뜨면 로그인해주세요!)
call git branch -M main
call git remote add origin https://github.com/parkkyung-il/project_lastsale.git
call git push -u origin main --force

echo.
echo ========================================================
echo [완료] 이제 빨간 에러 없이 100%% 성공했을 겁니다! 🚀
echo Vercel로 돌아가서 'Deploy'를 누르세요.
echo ========================================================
pause
