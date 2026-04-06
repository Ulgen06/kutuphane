@echo off
title Kutuphane APK Olusturucu
echo.
echo ==========================================================
echo   KUTUPHANE KRALLIGI: MOBIL APK OLUSTURUCU (V15)
echo ==========================================================
echo.
echo Bu islem sirasinda:
echo 1. Gerekli mobil araclar kontrol edilecek.
echo 2. APK bulutta (Expo Cloud) hazirlanacak.
echo 3. Bittiginde telefonuna indirmen icin sana bir LINK verecek.
echo.
echo Lutfen bekleyin, baslatiliyor...
echo.

cd /d "d:\projelerim\kutuphane"

:: Node.js Yolunu ekle
set PATH=%PATH%;"C:\Program Files\nodejs"

:: EAS CLI yukle (Eger yoksa)
echo [1/2] Mobil araclar hazirlaniyor...
call npm install -g eas-cli --silent

:: Build baslat
echo.
echo [2/2] APK Bulutta Hazirlaniyor... 
echo (Bu islem bitince ekranda bir link cikacak, ona basip indirebilirsin.)
echo.
call eas build -p android --profile preview

echo.
echo Islem tamamlandi! Ekranda cikan linkten APK'ni indirebilirsin kanka.
pause
