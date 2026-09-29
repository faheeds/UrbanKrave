CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL CHECK (status IN ('pending_payment', 'paid', 'accepted', 'preparing', 'ready', 'cancelled', 'refunded')),
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  address jsonb NOT NULL,
  items jsonb NOT NULL,
  instructions text,
  subtotal_cents integer NOT NULL CHECK (subtotal_cents >= 0),
  delivery_fee_cents integer NOT NULL CHECK (delivery_fee_cents >= 0),
  stripe_session_id text UNIQUE,
  stripe_payment_intent_id text UNIQUE
);
CREATE INDEX IF NOT EXISTS orders_status_created_idx ON orders (status, created_at DESC);
