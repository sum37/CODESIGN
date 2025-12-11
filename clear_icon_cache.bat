@echo off
echo Windows 아이콘 캐시를 클리어하는 중...
taskkill /f /im explorer.exe
del /a /q "%localappdata%\IconCache.db"
del /a /f /q "%localappdata%\Microsoft\Windows\Explorer\iconcache*"
start explorer.exe
echo 아이콘 캐시 클리어 완료!

