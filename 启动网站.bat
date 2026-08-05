@echo off
chcp 65001 >nul
cd /d "%~dp0"

where node >nul 2>nul
if %errorlevel%==0 (
  echo [伊斯特拉国际] 使用系统 Node.js 启动...
  node scripts\serve.js
  exit /b
)

if exist "%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" (
  echo [伊斯特拉国际] 使用内置 Node.js 启动...
  "%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" scripts\serve.js
  exit /b
)

echo [提示] 未找到 Node.js。
echo 您也可以直接双击打开 index.html 预览首页（部分动效可能受限）。
pause
