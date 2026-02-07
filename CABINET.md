# Личный кабинет — реализация и проверка

## Переменные окружения

- `DATABASE_URL` — строка подключения к PostgreSQL (для приложения).
- Для миграций через Prisma на Supabase: при необходимости используйте `PRISMA_CLI_DATABASE_URL` / `PRISMA_CLI_DIRECT_URL` (см. README).
- Auth: `AUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`.

## Миграция БД

- Применить все миграции (в т.ч. таблицу Favorite):
  ```powershell
  npx prisma migrate deploy
  ```
- Или вручную выполнить SQL из `prisma/migrations/20260221120000_add_favorite/migration.sql` (если миграция ещё не применялась).

## Созданные/изменённые файлы (личный кабинет)

- **Схема и БД:** `prisma/schema.prisma` (модель Favorite, связи User/Trip_Route), `prisma/migrations/20260221120000_add_favorite/`.
- **Layout и навигация:** `app/dashboard/layout.tsx`, `app/dashboard/components/DashboardSidebar.tsx`.
- **Загрузка:** `app/dashboard/loading.tsx`, `app/dashboard/public/loading.tsx`, `app/dashboard/favorites/loading.tsx`, `app/dashboard/components/RouteListSkeleton.tsx`.
- **Компоненты:** `app/dashboard/components/PromptCard.tsx`, `app/dashboard/components/PromptDialog.tsx` (shadcn Dialog, Input, Label), `app/dashboard/components/SearchInput.tsx`, `app/dashboard/components/MyRoutesContent.tsx`, `app/dashboard/components/PublicRoutesContent.tsx`, `app/dashboard/components/FavoritesContent.tsx`.
- **Действия:** `app/dashboard/actions.ts` (createRoute, updateRoute, deleteRoute, toggleVisibility, toggleFavorite; валидация zod).
- **Страницы:** `app/dashboard/page.tsx`, `app/dashboard/public/page.tsx`, `app/dashboard/favorites/page.tsx`, `app/dashboard/history/page.tsx`, `app/dashboard/settings/page.tsx`.
- **UI (shadcn):** `components/ui/dialog.tsx`, `components/ui/input.tsx`, `components/ui/label.tsx` (и имеющиеся button, card и т.д.).

## Пошаговая проверка функциональности

1. **Вход:** открыть `/login`, войти через Google. После входа редирект (или переход на `/dashboard`).
2. **Мои маршруты:** на `/dashboard` нажать «+ Новый маршрут», заполнить заголовок и описание, выбрать «Приватный» или «Публичный», сохранить. Убедиться, что маршрут появился в списке.
3. **Редактирование:** на карточке своего маршрута нажать иконку карандаша, изменить заголовок/описание/видимость, сохранить. Проверить, что изменения отображаются.
4. **Публичный/приватный:** на карточке нажать иконку Globe/Lock и убедиться, что видимость переключается (на «Публичные маршруты» маршрут появляется или исчезает).
5. **Избранное:** на любой карточке (своей или чужой на «Публичные маршруты») нажать звезду — маршрут должен появиться в «Избранное» (`/dashboard/favorites`). Повторное нажатие убирает из избранного.
6. **Удаление:** на своей карточке нажать иконку корзины, подтвердить удаление. Маршрут исчезает из списка.
7. **Поиск:** на «Мои маршруты» ввести текст в поле поиска; список фильтруется по названию/описанию (с задержкой ~300 ms).
8. **Пагинация:** при числе маршрутов > 10 проверить кнопки «Назад»/«Вперёд» и корректность смены страниц.
9. **История и Настройки:** открыть `/dashboard/history` и `/dashboard/settings` — отображаются заголовки и текст «Скоро».

После выполнения шагов 1–9 личный кабинет считается проверенным.
