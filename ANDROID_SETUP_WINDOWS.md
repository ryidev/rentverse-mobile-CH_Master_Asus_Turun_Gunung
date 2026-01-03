# 🪟 Setup Android Development di Windows

Panduan lengkap untuk setup environment React Native development di Windows untuk build aplikasi Android.

---

## 📋 Prerequisites

### 1. **Node.js**

- Download dari: https://nodejs.org/
- Versi minimum: **Node 20** atau lebih tinggi
- Verifikasi instalasi:
  ```cmd
  node -v
  npm -v
  ```

### 2. **Java Development Kit (JDK)**

- Download: **JDK 17** (LTS) dari https://adoptium.net/
- Install dan set JAVA_HOME

**Set Environment Variables:**

1. Buka **System Properties** → **Environment Variables**
2. Tambahkan variable baru:
   - Variable name: `JAVA_HOME`
   - Variable value: `C:\Program Files\Eclipse Adoptium\jdk-17.0.x-hotspot` (sesuaikan path)
3. Edit **Path**, tambahkan: `%JAVA_HOME%\bin`

**Verifikasi:**

```cmd
java -version
javac -version
```

### 3. **Android Studio**

Download dari: https://developer.android.com/studio

**Install Components:**

- Android SDK
- Android SDK Platform
- Android Virtual Device (AVD)

---

## ⚙️ Konfigurasi Android Studio

### 1. Install Android SDK

1. Buka **Android Studio**
2. Klik **More Actions** → **SDK Manager**
3. Di tab **SDK Platforms**, install:

   - ✅ **Android 14 (UpsideDownCake)** atau versi terbaru
   - ✅ Show Package Details, centang:
     - Android SDK Platform 34
     - Intel x86 Atom_64 System Image atau Google APIs Intel x86 Atom System Image

4. Di tab **SDK Tools**, install:
   - ✅ Android SDK Build-Tools 34.0.0
   - ✅ Android SDK Command-line Tools
   - ✅ Android Emulator
   - ✅ Android SDK Platform-Tools
   - ✅ Google Play services

### 2. Set Environment Variables

**ANDROID_HOME:**

1. Buka **System Properties** → **Environment Variables**
2. Tambahkan variable baru:
   - Variable name: `ANDROID_HOME`
   - Variable value: `C:\Users\YOUR_USERNAME\AppData\Local\Android\Sdk`

**Update Path:**
Tambahkan ke **Path**:

```
%ANDROID_HOME%\platform-tools
%ANDROID_HOME%\emulator
%ANDROID_HOME%\tools
%ANDROID_HOME%\tools\bin
```

**Verifikasi:**

```cmd
adb version
```

---

## 📱 Setup Android Emulator

### Cara 1: Via Android Studio (Recommended)

1. Buka **Android Studio**
2. Klik **More Actions** → **Virtual Device Manager**
3. Klik **Create Device**
4. Pilih device (contoh: **Pixel 5**)
5. Pilih system image: **Android 14 (API 34)**
6. Download jika belum tersedia
7. Klik **Finish**

### Cara 2: Via Command Line

```cmd
# List available devices
avdmanager list

# Create AVD
avdmanager create avd -n Pixel_5_API_34 -k "system-images;android-34;google_apis;x86_64" -d "pixel_5"
```

### Jalankan Emulator

**Via Android Studio:**

- Virtual Device Manager → Klik ▶️ Play

**Via Command Line:**

```cmd
emulator -avd Pixel_5_API_34
```

---

## 🚀 Clone & Setup Project

### 1. Clone Repository (atau Copy Project)

```cmd
cd C:\Users\YOUR_USERNAME\Documents
# Jika dari repository:
git clone YOUR_REPO_URL
cd testApp

# Atau copy folder project ke directory ini
```

### 2. Install Dependencies

```cmd
npm install
```

**Jika ada error, coba:**

```cmd
npm install --legacy-peer-deps
```

### 3. Verify Setup

```cmd
npx react-native doctor
```

Tool ini akan check apakah semua requirements sudah terpenuhi.

---

## 🏃 Running the App

### Method 1: Two Terminals (Recommended)

**Terminal 1 - Start Metro Bundler:**

```cmd
npm start
adb reverse tcp:8081 tcp:8081
```

atau

```cmd
npx react-native start
```

**Terminal 2 - Run Android App:**

```cmd
npm run android
```

atau

```cmd
npx react-native run-android
```

### Method 2: One Command

```cmd
npm run android
```

Metro bundler akan start otomatis.

---

## 🐛 Troubleshooting

### Error: "SDK location not found"

**Fix:**

1. Buat file `local.properties` di folder `android/`
2. Isi dengan:
   ```properties
   sdk.dir=C:\\Users\\YOUR_USERNAME\\AppData\\Local\\Android\\Sdk
   ```
   (Ganti `YOUR_USERNAME` dengan username Windows Anda)

### Error: "JAVA_HOME is not set"

**Fix:**

```cmd
# Check Java
java -version

# Set JAVA_HOME (temporary)
set JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17.0.x-hotspot

# Permanent: Set via System Environment Variables
```

### Error: "adb: command not found"

**Fix:**
Tambahkan ke Path:

```
C:\Users\YOUR_USERNAME\AppData\Local\Android\Sdk\platform-tools
```

Restart Command Prompt setelah update Path.

### Error: Port 8081 Already in Use

**Fix:**

```cmd
# Kill process on port 8081
netstat -ano | findstr :8081
taskkill /PID <PID_NUMBER> /F

# Or change port
npx react-native start --port 8082
```

### Build Error: "Could not resolve all files"

**Fix:**

```cmd
cd android
gradlew clean
cd ..
npm run android
```

### Emulator Slow

**Fix:**

1. Enable **Hardware Acceleration (HAXM)**
   - Install via Android Studio → SDK Manager → SDK Tools → Intel HAXM
2. Allocate more RAM to emulator:
   - Edit AVD → Advanced Settings → RAM: 2048MB atau lebih

### Metro Bundler Issues

**Fix:**

```cmd
# Clear cache
npx react-native start --reset-cache

# Or
npm start -- --reset-cache
```

---

## 🔧 Development Tools

### React Native Debugger

Download dari: https://github.com/jhen0409/react-native-debugger/releases

### Flipper (Optional)

Download dari: https://fbflipper.com/

---

## 📝 Gradle Configuration (Optional)

Untuk mempercepat build, edit `android/gradle.properties`:

```properties
# Enable Gradle Daemon
org.gradle.daemon=true

# Increase memory
org.gradle.jvmargs=-Xmx4096m -XX:MaxMetaspaceSize=512m

# Enable parallel
org.gradle.parallel=true

# Enable caching
org.gradle.caching=true
```

---

## 🎯 Quick Commands Reference

| Task           | Command                        |
| -------------- | ------------------------------ |
| Start Metro    | `npm start`                    |
| Run Android    | `npm run android`              |
| List devices   | `adb devices`                  |
| List emulators | `emulator -list-avds`          |
| Start emulator | `emulator -avd EMULATOR_NAME`  |
| Clear cache    | `npm start -- --reset-cache`   |
| Clean build    | `cd android && gradlew clean`  |
| Check setup    | `npx react-native doctor`      |
| View logs      | `npx react-native log-android` |

---

## 🔐 Connect Physical Device

### Enable Developer Mode:

1. Settings → About phone
2. Tap **Build number** 7 kali
3. Developer options akan muncul
4. Enable **USB Debugging**

### Connect via USB:

```cmd
# Check connection
adb devices

# Should show:
# List of devices attached
# XXXXXX    device
```

### Run on Device:

```cmd
npm run android
```

### Connect via WiFi (Optional):

```cmd
# 1. Connect device via USB first
# 2. Get device IP: Settings → About → Status → IP address

# 3. Connect via TCP/IP
adb tcpip 5555
adb connect DEVICE_IP:5555

# 4. Disconnect USB
# 5. Run app
npm run android
```

---

## 📦 Build APK for Testing

### Debug APK:

```cmd
cd android
gradlew assembleDebug
```

Output: `android/app/build/outputs/apk/debug/app-debug.apk`

### Release APK (Unsigned):

```cmd
cd android
gradlew assembleRelease
```

Output: `android/app/build/outputs/apk/release/app-release-unsigned.apk`

---

## ✅ Checklist Setup

Pastikan semua ini sudah terinstall:

- [ ] Node.js (v20+)
- [ ] Java JDK 17
- [ ] Android Studio
- [ ] Android SDK (API 34)
- [ ] Android SDK Build-Tools
- [ ] Android Emulator atau Physical Device
- [ ] JAVA_HOME environment variable
- [ ] ANDROID_HOME environment variable
- [ ] Platform-tools di Path
- [ ] npm dependencies terinstall
- [ ] `npx react-native doctor` menunjukkan ✓ semua

---

## 🆘 Need Help?

1. **React Native Docs:** https://reactnative.dev/docs/environment-setup
2. **Android Studio Guide:** https://developer.android.com/studio/intro
3. **Stack Overflow:** https://stackoverflow.com/questions/tagged/react-native

---

## 💡 Tips

1. **Use PowerShell or CMD as Administrator** saat install tools
2. **Restart terminal** setelah set environment variables
3. **Close Android Studio** saat running app (bisa konflik)
4. **Enable Hyper-V** di Windows untuk emulator lebih cepat (Windows 10/11 Pro)
5. **Allocate sufficient RAM** untuk emulator (minimum 2GB)

---

**Setup selesai! Ready untuk develop!** 🎉

Untuk memulai development:

```cmd
npm start
npm run android
```
