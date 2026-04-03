-- Add delivery_partner as an allowed value for users.role
-- Fixes: new row for relation "users" violates check constraint "users_role_check"

BEGIN;

ALTER TABLE users
  DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE users
  ADD CONSTRAINT users_role_check
  CHECK ((role)::text = ANY ((ARRAY[
    'customer'::character varying,
    'provider'::character varying,
    'admin'::character varying,
    'delivery_partner'::character varying
  ])::text[]));

COMMIT;
