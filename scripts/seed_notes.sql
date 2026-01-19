CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS "Note" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "title" text NOT NULL,
  "createdAt" timestamptz(3) NOT NULL DEFAULT now()
);

INSERT INTO "Note" ("title") VALUES
  ('Марокко'),
  ('Стамбул'),
  ('Перу');
