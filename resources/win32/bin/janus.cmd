@echo off
setlocal
set "SCRIPT_DIR=%~dp0"
for %%I in ("%SCRIPT_DIR%..") do set "RESOURCES_DIR=%%~fI"
REM Why: once %%~fI canonicalizes RESOURCES_DIR it no longer ends with a slash,
REM so Windows batch needs an explicit "\.." segment here. Without it this
REM compatibility launcher resolves APP_DIR back to resources/ and cannot find
REM Janus Code.exe on packaged Windows installs.
for %%I in ("%RESOURCES_DIR%\..") do set "APP_DIR=%%~fI"
set "ELECTRON=%APP_DIR%\Janus Code.exe"

if not exist "%ELECTRON%" (
  echo Unable to locate Janus Code.exe next to "%RESOURCES_DIR%" 1>&2
  exit /b 1
)

set "CLI=%RESOURCES_DIR%\app.asar.unpacked\out\cli\index.js"

set "JANUS_NODE_OPTIONS=%NODE_OPTIONS%"
set "JANUS_NODE_REPL_EXTERNAL_MODULE=%NODE_REPL_EXTERNAL_MODULE%"
set "ORCA_NODE_OPTIONS=%NODE_OPTIONS%"
set "ORCA_NODE_REPL_EXTERNAL_MODULE=%NODE_REPL_EXTERNAL_MODULE%"
set NODE_OPTIONS=
set NODE_REPL_EXTERNAL_MODULE=
set ELECTRON_RUN_AS_NODE=1

"%ELECTRON%" "%CLI%" %*
