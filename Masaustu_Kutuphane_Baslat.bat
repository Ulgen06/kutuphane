@echo off
title Kutuphane App
echo "Kutuphane uygulamasi baslatiliyor... Lutfen bekleyin."
cd /d "d:\projelerim\kutuphane"
set PATH=%PATH%;"C:\Program Files\nodejs"

:: Web uygulamasını başlat (Pencerenin kapanmaması için cmd /k kullanıyoruz)
cmd /k npm run web
