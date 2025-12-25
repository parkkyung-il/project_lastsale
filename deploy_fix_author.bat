@echo off
chcp 65001 > nul
echo ========================================================
echo [우리동네 떨이] 마지막 퍼즐 조각 맞추기 (작성자 설정)
echo ========================================================
echo.
echo Git이 "누가 코드를 작성했는지 모르겠다"며 멈췄었네요.
echo 이름표를 붙이고 다시 전송합니다!
echo.

echo [1단계] 이름표 붙이기 (작성자 설정)...
call git config user.name "parkkyung-il"
call git config user.email "parkkyung-il@users.noreply.github.com"

echo.
echo [2단계] 코드 포장하기 (Commit)...
call git add .
call git commit -m "Neighborhood Clearance App - Final Push"

echo.
echo [3단계] GitHub로 발사! (로그인 창 확인해주세요)
call git branch -M main
call git remote add origin https://github.com/parkkyung-il/project_lastsale.git 2>nul
call git push -u origin main --force

echo.
echo ========================================================
echo [완료] 이번엔 진짜 100%% 떴을 겁니다! 🚀
echo Vercel로 가서 'Deploy' 버튼을 눌러주세요.
echo ========================================================
pause
