import { orderDb } from "./orders-db";
import type { DeliveryAdminSettings } from "./delivery-admin";

type SettingsRow = {
  paused: boolean;
  preferred_provider: DeliveryAdminSettings["preferredProvider"];
  doordash_stage: DeliveryAdminSettings["doordashStage"];
  uber_stage: DeliveryAdminSettings["uberStage"];
  updated_at: string;
};

function fromRow(row: SettingsRow): DeliveryAdminSettings {
  return {
    paused: row.paused,
    preferredProvider: row.preferred_provider,
    doordashStage: row.doordash_stage,
    uberStage: row.uber_stage,
    updatedAt: row.updated_at,
  };
}

export async function getDeliverySettings(): Promise<DeliveryAdminSettings> {
  const sql = orderDb();
  const rows = await sql`SELECT paused, preferred_provider, doordash_stage, uber_stage, updated_at FROM delivery_admin_settings WHERE id = 1` as SettingsRow[];
  if (!rows[0]) throw new Error("Delivery settings migration has not been applied.");
  return fromRow(rows[0]);
}

export async function saveDeliverySettings(settings: Omit<DeliveryAdminSettings, "updatedAt">): Promise<DeliveryAdminSettings> {
  const sql = orderDb();
  const rows = await sql`UPDATE delivery_admin_settings SET
    paused = ${settings.paused},
    preferred_provider = ${settings.preferredProvider},
    doordash_stage = ${settings.doordashStage},
    uber_stage = ${settings.uberStage},
    updated_at = now()
    WHERE id = 1
    RETURNING paused, preferred_provider, doordash_stage, uber_stage, updated_at` as SettingsRow[];
  if (!rows[0]) throw new Error("Delivery settings migration has not been applied.");
  return fromRow(rows[0]);
}

export async function initializeDeliverySettings(): Promise<DeliveryAdminSettings> {
  const sql = orderDb();
  await sql`CREATE TABLE IF NOT EXISTS delivery_admin_settings (
    id smallint PRIMARY KEY CHECK (id = 1),
    paused boolean NOT NULL DEFAULT true,
    preferred_provider text CHECK (preferred_provider IN ('doordash_drive', 'uber_direct')),
    doordash_stage text NOT NULL DEFAULT 'not_started' CHECK (doordash_stage IN ('not_started', 'account_created', 'applied', 'sandbox_access', 'production_approved')),
    uber_stage text NOT NULL DEFAULT 'account_created' CHECK (uber_stage IN ('not_started', 'account_created', 'applied', 'sandbox_access', 'production_approved')),
    updated_at timestamptz NOT NULL DEFAULT now()
  )`;
  await sql`INSERT INTO delivery_admin_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING`;
  return getDeliverySettings();
}
