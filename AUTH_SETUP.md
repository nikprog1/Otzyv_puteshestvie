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
**Vercel:** В Project → Settings → Environment Variables обязательно задайте `AUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `DATABASE_URL` для Production. Без `AUTH_SECRET` на Vercel будут 500 на `/api/auth/session` и ошибка «Configuration» при входе. См. также connect_to_Vercel.md.

Для localhost можно добавить:
```
AUTH_URL="http://localhost:3000"
```
или (для NextAuth v4):
```
NEXTAUTH_URL="http://localhost:3000"
```

## 4) Тестирование на localhost

### Пошаговая проверка
1. Убедитесь, что в `.env` заданы `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `AUTH_SECRET`, `DATABASE_URL`.
2. Запустите сервер: `npm run dev`.
3. Откройте в браузере: `http://localhost:3000/login`.
4. Нажмите «Войти через Google».
5. После успешного входа должен быть редирект на `/dashboard`.

### Ожидаемый поток
- Запрос к Google → редирект на `http://localhost:3000/api/auth/callback/google?code=...` → создание сессии → редирект на `/dashboard`.

### Проверка сессии
- `GET http://localhost:3000/api/auth/session` (в браузере или через fetch) должен вернуть объект с полями `user` (id, email, name и т.д.) при активной сессии.

### Проверка сохранения пользователя в БД
После первого входа проверьте таблицы `User`, `Account`, `Session` (через Prisma Studio или view-db): должна появиться запись пользователя и сессии.

## 5) Советы по отладке

- **redirect_uri_mismatch**  
  В Google Cloud Console в «Authorized redirect URIs» должна быть **точно** строка:  
  `http://localhost:3000/api/auth/callback/google` (без слэша в конце, тот же порт).

- **401 / пустая сессия**  
  Проверьте наличие `AUTH_SECRET` в `.env`. Без него подпись cookie не работает.

- **Ошибка при запуске dev**  
  В консоли при старте выводится предупреждение, если не заданы `AUTH_SECRET`, `GOOGLE_CLIENT_ID` или `GOOGLE_CLIENT_SECRET`. Исправьте `.env` и перезапустите.

- **Сеть**  
  Во вкладке Network (DevTools) проверьте запрос к `/api/auth/callback/google`: статус должен быть 302 (редирект), при ошибке — 500 или редирект на `/login?error=...`.

- **Ошибка на странице логина**  
  При редиректе с `?error=...` на странице `/login` отображается сообщение «Ошибка входа. Попробуйте снова.».

- **Can't reach database server at ... pooler.supabase.com:5432 (или :6543)**  
  Приложение не может достучаться до БД Supabase с вашей машины (сеть, файрвол, VPN). Что проверить:
  1. Доступ в интернет и отсутствие блокировки исходящих подключений к `aws-1-eu-west-1.pooler.supabase.com` на портах 5432 и 6543.
  2. Корпоративный файрвол/VPN — разрешите исходящие подключения к этому хосту или используйте VPN, с которого Supabase доступен.
  3. Локальная разработка без доступа к Supabase: поднимите локальный PostgreSQL, выполните миграции (`npx prisma migrate deploy`), укажите в `.env` `DATABASE_URL` на локальную БД — тогда вход через Google будет работать с локальной БД.
  4. Проверка доступности: в PowerShell выполните  
     `Test-NetConnection -ComputerName aws-1-eu-west-1.pooler.supabase.com -Port 5432`  
     Если TcpTestSucceeded = False, хост с вашей сети недоступен.
