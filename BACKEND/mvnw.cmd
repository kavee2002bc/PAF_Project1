@REM ----------------------------------------------------------------------------
@REM Licensed to the Apache Software Foundation (ASF) under one
@REM or more contributor license agreements.  See the NOTICE file
@REM distributed with this work for additional information
@REM regarding copyright ownership...
@REM ----------------------------------------------------------------------------

@echo off
setlocal

set DIRNAME=%~dp0
if "%DIRNAME%" == "" set DIRNAME=.
set APP_BASE_NAME=%~n0
set APP_HOME=%DIRNAME%

set MAVEN_OPTS=%MAVEN_OPTS% -Dfile.encoding=UTF-8 -Dmaven.multiModuleProjectDirectory="%APP_HOME:~0,-1%"

if defined JAVA_HOME goto findJavaFromJavaHome

set JAVA_EXE=java.exe
%JAVA_EXE% -version >NUL 2>&1
if "%ERRORLEVEL%" == "0" goto init

echo ERROR: JAVA_HOME is not set and no 'java' command could be found in your PATH.
goto fail

:findJavaFromJavaHome
set JAVA_HOME=%JAVA_HOME:"=%
set JAVA_EXE=%JAVA_HOME%/bin/java.exe
if exist "%JAVA_EXE%" goto init

echo ERROR: JAVA_HOME is set to an invalid directory: %JAVA_HOME%
goto fail

:init
if not "%OS%" == "Windows_NT" goto execute
set CMD_LINE_ARGS=%*
goto execute

:execute
set WRAPPER_JAR="%APP_HOME%\.mvn\wrapper\maven-wrapper.jar"
set WRAPPER_LAUNCHER=org.apache.maven.wrapper.MavenWrapperMain

if exist %WRAPPER_JAR% goto runWrapper
echo Downloading maven-wrapper.jar...
powershell -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.2.0/maven-wrapper-3.2.0.jar -OutFile %WRAPPER_JAR% -UseBasicParsing"

:runWrapper
"%JAVA_EXE%" %MAVEN_OPTS% -classpath %WRAPPER_JAR% %WRAPPER_LAUNCHER% %CMD_LINE_ARGS%
if ERRORLEVEL 1 goto fail

:success
exit /b 0

:fail
exit /b 1
