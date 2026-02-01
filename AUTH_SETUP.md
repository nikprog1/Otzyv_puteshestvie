# Как получить GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET и AUTH_SECRET

## 1) Google OAuth (Client ID / Client Secret)
1. Откройте Google Cloud Console: https://console.cloud.google.com/
2. Создайте проект или выберите существующий.
3. Перейдите в **APIs & Services → OAuth consent screen**.
4. Настройте экран согласия (минимум: название приложения, email, домен).
5. Перейдите в **APIs & Services → Credentials**.
6. Нажмите **Create Credentials → OAuth client ID**.
7. Выберите тип **Web application**.
8. Заполните:
   - **Authorized JavaScript origins**:
     - `http://localhost:3000`
     - `https://<ваш-домен-на-vercel>`
   - **Authorized redirect URIs**:
     - `http://localhost:3000/api/auth/callback/google`
     - `https://<ваш-домен-на-vercel>/api/auth/callback/google`
9. Нажмите **Create** и скопируйте:
   - `Client ID` → `GOOGLE_CLIENT_ID`
   - `Client Secret` → `GOOGLE_CLIENT_SECRET`

## 2) AUTH_SECRET
Секрет должен быть длинной случайной строкой.

### Вариант 1 (Node.js)
```
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Вариант 2 (OpenSSL)
```
openssl rand -base64 32
```

### Вариант 3 (PowerShell)
```powershell
$bytes = New-Object byte[] 32
[System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
[BitConverter]::ToString($bytes).Replace('-','').ToLower()
```

Скопируйте значение в `.env` как `AUTH_SECRET`.

## 3) Пример .env
```
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
AUTH_SECRET="..."
DATABASE_URL="..."
```
