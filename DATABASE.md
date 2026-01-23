## Что есть в системе (сущности):

Note - заметки
User — владелец маршрутов, автор, голосующий
Trip_Route — сам маршрут (может быть приватным или публичным)
Tag — метки (многие-ко-многим с Trip_Route)
Vote — голос пользователя за публичный маршрут (уникально: один пользователь → один голос на промт)
(опционально) Collection / Folder — папки/коллекции для организации
(опционально) Trip_RouteVersion — версии маршрута (история изменений)

## Ключевые правила:

- Публичность — это свойство Trip_Route (visibility)
- Голосовать можно только по публичным (проверяется на уровне приложения; можно усилить триггером/констрейнтом позже)
- Голос уникален: (userId, Trip_RouteId) — уникальный индекс

## Схема базы данных
- Note: id, ownerId -> User, title, createdAt
- User: id (cuid), email unique, name optional, createdAt
- Trip_Route: id, ownerId -> User, title, content, description optional, categoryId -> Category,
  visibility (PRIVATE|PUBLIC, default PRIVATE), createdAt, updatedAt, publishedAt nullable
- Vote: id, userId -> User, Trip_RouteId -> Trip_Route, value int default 1, createdAt
- Category: id, category
- Ограничение: один пользователь может проголосовать за промт только один раз:
  UNIQUE(userId, Trip_RouteId)
- Индексы:
  Trip_Route(ownerId, updatedAt)
  Trip_Route(visibility, createdAt)
  Vote(Trip_RouteId)
  Vote(userId)
- onDelete: Cascade для связей
