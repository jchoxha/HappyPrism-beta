@echo off
setlocal enabledelayedexpansion

:: Build the project
call npm run build
if %errorlevel% neq 0 (
    echo Build failed.
    exit /b %errorlevel%
)

:: Add all changes to git
git add .
if %errorlevel% neq 0 (
    echo Git add failed.
    exit /b %errorlevel%
)

:: Get the commit message from the command line, or use 'deploy' if none is provided
set "commit_message=%~1"
if "%commit_message%"=="" set "commit_message=deploy"

:: Get the current time in the desired format
for /f "tokens=1-5 delims=/:. " %%d in ("%date% %time%") do (
    set year=%%d
    set month=%%e
    set day=%%f
    set hour=%%g
    set minute=%%h
)
set current_time=%year%-%month%-%day% %hour%:%minute%

:: Append the current time to the commit message
set "full_commit_message=%commit_message% (@%current_time%)"

:: Commit with the provided message or default to 'deploy' and append the current time
git commit -m "!full_commit_message!"
if %errorlevel% neq 0 (
    echo Git commit failed.
    exit /b %errorlevel%
)

:: Push changes to the main branch
git push origin main
if %errorlevel% neq 0 (
    echo Git push failed.
    exit /b %errorlevel%
)

:: Open the app on Heroku
heroku open
if %errorlevel% neq 0 (
    echo Heroku open failed.
    exit /b %errorlevel%
)
