@echo off
echo [TEMIZLIK] Eski bozuk dosyalar temizleniyor... Lutfen bekleyin.
cd /d d:\projelerim\kutuphane
if exist node_modules (rd /s /q node_modules)
if exist package-lock.json (del package-lock.json)

echo [KURULUM] Yeni ve STABIL (SDK 52) paketler yukleniyor...
echo Bu islem internet hiziniza gore 2-5 dakika surebilir. Lutfen kapatmayin!
call npm install --legacy-peer-deps

echo.
echo [TAMAMLANDI] Her sey hazir kanka! Simdi Masaustu_Kutuphane_Baslat.bat'a basabilirsin.
pause
