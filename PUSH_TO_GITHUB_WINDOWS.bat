@echo off
setlocal
cd /d %~dp0
where git >nul 2>nul
if errorlevel 1 (
  echo Git for Windows is needed. Install from https://git-scm.com/downloads/win
  pause
  exit /b 1
)
if not exist .git (git init -b main)
git add .
git -c user.name="Dreeydesigns Content Studio" -c user.email="content@local.invalid" commit -m "Publish BILAN November 2026 review site"
git branch -M main
git remote remove origin >nul 2>nul
git remote add origin https://github.com/dreeydesigns/bilan-november-2026-review.git
ECHO Ensure that the GitHub repository dreeydesigns/bilan-november-2026-review exists before continuing.
git push -u origin main
if errorlevel 1 (
  echo Push was not successful. Check the repository has been created and that you are signed in to Git.
) else (
  echo Push succeeded. Connect the repository to the Vercel project: bilan-november-2026-review.
)
pause
