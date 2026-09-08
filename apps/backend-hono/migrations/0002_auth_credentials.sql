-- Migración 0002: credenciales de autenticación (email+contraseña, Google OAuth, favoritos)
--
-- Expande la tabla users con campos opcionales de credenciales.
-- Crea tabla password_reset_tokens y user_favorites.
-- Todos los campos son nullable para respetar usuarios existentes (expand, no contract).

-- 1. Expandir users
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS password_hash text,
  ADD COLUMN IF NOT EXISTS google_id text,
  ADD COLUMN IF NOT EXISTS email_verified boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS avatar_url text;

CREATE UNIQUE INDEX IF NOT EXISTS users_google_id_idx ON users (google_id) WHERE google_id IS NOT NULL;

-- 2. Tabla de tokens de reset de contraseña (time-to-live + marcado de uso)
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash  text NOT NULL UNIQUE,
  expires_at  timestamp NOT NULL,
  used        boolean NOT NULL DEFAULT false,
  created_at  timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS prt_user_id_idx ON password_reset_tokens (user_id);

-- 3. Tabla de favoritos de usuario (juego + número)
CREATE TABLE IF NOT EXISTS user_favorites (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  game       game_type NOT NULL,
  number     text NOT NULL,
  note       text,
  created_at timestamp NOT NULL DEFAULT now(),
  UNIQUE (user_id, game, number)
);

CREATE INDEX IF NOT EXISTS uf_user_id_idx ON user_favorites (user_id);
