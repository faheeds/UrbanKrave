"use client";

import { useState } from "react";
import { ExternalLink } from "lucide-react";
import AdminHeader from "./AdminHeader";
import { formatCents } from "@/lib/ordering-menu";
import { deliveryPartners, deliveryStageLabels, deliveryStages, type DeliveryAdminSettings, type DeliveryStage, type DirectDeliveryProvider } from "@/lib/delivery-admin";

type DeliverySettingsResponse = { settings?: DeliveryAdminSettings; settingsAvailable?: boolean; warning?: string; error?: string; apiConnected?: boolean; canResume?: boolean };

function ProviderSection({ provider, stage, onStageChange, disabled }: {
  provider: (typeof deliveryPartners)[number];
  stage: DeliveryStage;
  onStageChange: (stage: DeliveryStage) => void;
  disabled: boolean;
}) {
  return <section className="delivery-provider" aria-labelledby={`${provider.id}-title`}>
    <div className="delivery-provider-name">
      <h2 id={`${provider.id}-title`}>{provider.name}</h2>
      <span className="delivery-status">API not connected</span>
    </div>
    <div className="delivery-provider-steps">
      <h3>Setup checklist</h3>
      <ol>{provider.steps.map((step) => <li key={step}>{step}</li>)}</ol>
      <label className="delivery-stage">Your onboarding progress
        <select value={stage} onChange={(event) => onStageChange(event.target.value as DeliveryStage)} disabled={disabled}>
          {deliveryStages.map((value) => <option key={value} value={value}>{deliveryStageLabels[value]}</option>)}
        </select>
      </label>
      <p className="delivery-stage-help">This is your note, not a verified API connection.</p>
    </div>
    <a className="delivery-provider-link" href={provider.url} target="_blank" rel="noopener noreferrer">{provider.action}<ExternalLink size={15} aria-hidden="true" /></a>
  </section>;
}

export default function DeliveryPartners() {
  const [credentials, setCredentials] = useState("");
  const [settings, setSettings] = useState<DeliveryAdminSettings | null>(null);
  const [settingsAvailable, setSettingsAvailable] = useState(false);
  const [settingsWarning, setSettingsWarning] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uberVerified, setUberVerified] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState("");
  const [verificationError, setVerificationError] = useState("");
  const [quoteResult, setQuoteResult] = useState<{ feeCents: number; expires: string } | null>(null);
  const [quoteError, setQuoteError] = useState("");

  async function load(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setError(""); setSaved(false);
    const values = new FormData(event.currentTarget);
    const authorization = btoa(`${values.get("user")}:${values.get("password")}`);
    try {
      const response = await fetch("/api/admin/delivery-settings", { headers: { Authorization: `Basic ${authorization}` }, cache: "no-store" });
      const body = await response.json() as DeliverySettingsResponse;
      if (!response.ok || !body.settings) throw new Error(body.error || "Delivery settings could not be loaded.");
      setCredentials(authorization);
      setSettings(body.settings);
      setSettingsAvailable(Boolean(body.settingsAvailable));
      setSettingsWarning(body.warning || "");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Delivery settings could not be loaded."); }
    setBusy(false);
  }

  async function save(change: Partial<Omit<DeliveryAdminSettings, "updatedAt">>) {
    if (!settings || !settingsAvailable || busy) return;
    setBusy(true); setError(""); setSaved(false);
    try {
      const response = await fetch("/api/admin/delivery-settings", {
        method: "PATCH",
        headers: { Authorization: `Basic ${credentials}`, "Content-Type": "application/json" },
        body: JSON.stringify({ paused: settings.paused, preferredProvider: settings.preferredProvider, doordashStage: settings.doordashStage, uberStage: settings.uberStage, ...change }),
      });
      const body = await response.json() as DeliverySettingsResponse;
      if (!response.ok || !body.settings) throw new Error(body.error || "Delivery settings could not be saved.");
      setSettings(body.settings);
      setSaved(true);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Delivery settings could not be saved."); }
    setBusy(false);
  }

  async function initializeSettings() {
    if (!credentials || busy) return;
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/admin/delivery-settings/setup", { method: "POST", headers: { Authorization: `Basic ${credentials}` }, cache: "no-store" });
      const body = await response.json() as DeliverySettingsResponse;
      if (!response.ok || !body.settings) throw new Error(body.error || "Delivery settings could not be initialized.");
      setSettings(body.settings);
      setSettingsAvailable(true);
      setSettingsWarning("");
      setSaved(true);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Delivery settings could not be initialized."); }
    setBusy(false);
  }

  async function verifyUber() {
    if (!credentials || busy) return;
    setBusy(true); setVerificationError(""); setVerificationMessage(""); setUberVerified(false);
    try {
      const response = await fetch("/api/admin/uber-direct/verify", {
        method: "POST",
        headers: { Authorization: `Basic ${credentials}` },
        cache: "no-store",
      });
      const body = await response.json() as { verified?: boolean; message?: string; error?: string };
      if (!response.ok || !body.verified) throw new Error(body.error || "Uber Direct could not be verified.");
      setUberVerified(true);
      setVerificationMessage(body.message || "Uber Direct credentials accepted.");
    } catch (cause) { setVerificationError(cause instanceof Error ? cause.message : "Uber Direct could not be verified."); }
    setBusy(false);
  }

  async function testQuote(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!credentials || busy) return;
    setBusy(true); setQuoteError(""); setQuoteResult(null);
    const values = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/admin/uber-direct/quote", {
        method: "POST",
        headers: { Authorization: `Basic ${credentials}`, "Content-Type": "application/json" },
        body: JSON.stringify({ line1: values.get("line1"), line2: values.get("line2"), city: values.get("city"), state: values.get("state"), postalCode: values.get("postalCode") }),
        cache: "no-store",
      });
      const body = await response.json() as { feeCents?: number; expires?: string; error?: string };
      if (!response.ok || typeof body.feeCents !== "number" || !body.expires) throw new Error(body.error || "Uber Direct could not provide a quote.");
      setQuoteResult({ feeCents: body.feeCents, expires: body.expires });
    } catch (cause) { setQuoteError(cause instanceof Error ? cause.message : "Uber Direct could not provide a quote."); }
    setBusy(false);
  }

  return <div className="delivery-admin-shell">
    <AdminHeader active="delivery" />
    <main className="delivery-admin-page">
      <div className="delivery-admin-intro">
        <h1>Delivery partners</h1>
        <p>Website delivery is paused. No provider is connected.</p>
      </div>
      <p className="delivery-admin-note">Create each account with the provider. Billing, agreements, and API approval stay in their portals. Your onboarding progress below is a private tracking note.</p>
      <section className="delivery-admin-access" aria-labelledby="delivery-admin-access-title">
        <h2 id="delivery-admin-access-title">Manage setup progress</h2>
        {!settings ? <form onSubmit={load} className="kitchen-login"><label>Username<input name="user" autoComplete="username" required /></label><label>Password<input name="password" type="password" autoComplete="current-password" required /></label><button className="button primary" disabled={busy}>{busy ? "Checking…" : "Sign in to manage"}</button></form> : <div className="delivery-session"><p>Signed in. You can verify Uber Direct credentials and test a quote below.</p><button type="button" className="button secondary" onClick={() => { setCredentials(""); setSettings(null); setSettingsAvailable(false); setSettingsWarning(""); setSaved(false); setUberVerified(false); setVerificationMessage(""); setVerificationError(""); setQuoteResult(null); setQuoteError(""); }}>Sign out</button></div>}
        {settingsWarning && <p role="status" className="delivery-warning">{settingsWarning}</p>}
        {credentials && !settingsAvailable && <button type="button" className="button secondary" onClick={initializeSettings} disabled={busy}>{busy ? "Setting up…" : "Finish delivery settings setup"}</button>}
        {error && <p role="alert" className="checkout-error">{error}</p>}
        {saved && <p role="status" className="delivery-saved">Settings saved.</p>}
      </section>
      <div className="delivery-providers">
        <ProviderSection provider={deliveryPartners[0]} stage={settings?.doordashStage || "not_started"} onStageChange={(stage) => save({ doordashStage: stage })} disabled={!settingsAvailable || busy} />
        <ProviderSection provider={deliveryPartners[1]} stage={settings?.uberStage || "account_created"} onStageChange={(stage) => save({ uberStage: stage })} disabled={!settingsAvailable || busy} />
      </div>
      <section className="delivery-verification" aria-labelledby="uber-verification-title">
        <div><h2 id="uber-verification-title">Uber Direct credentials</h2><p>Checks the Client ID and Client Secret saved in Vercel. This does not request a courier or start a delivery.</p></div>
        <div><button type="button" className="button secondary" onClick={verifyUber} disabled={!credentials || busy}>{busy ? "Checking…" : "Verify credentials"}</button><p role="status" className={uberVerified ? "delivery-saved" : "delivery-verification-note"}>{verificationMessage || (credentials ? "No connection check has been run this session." : "Sign in below to run the check.")}</p>{verificationError && <p role="alert" className="checkout-error">{verificationError}</p>}</div>
      </section>
      <section className="delivery-verification" aria-labelledby="uber-quote-title">
        <div><h2 id="uber-quote-title">Test a delivery quote</h2><p>Pickup: 515 Broadway E, Seattle, WA 98102. Enter a delivery address to check price and serviceability. A quote does not dispatch a courier.</p></div>
        <form className="delivery-quote-form" onSubmit={testQuote}>
          <label>Delivery street address<input name="line1" autoComplete="street-address" required disabled={!credentials || busy} /></label>
          <label>Apartment or suite<input name="line2" autoComplete="address-line2" disabled={!credentials || busy} /></label>
          <div className="delivery-quote-row"><label>City<input name="city" autoComplete="address-level2" defaultValue="Seattle" required disabled={!credentials || busy} /></label><label>State<input name="state" autoComplete="address-level1" defaultValue="WA" maxLength={2} required disabled={!credentials || busy} /></label><label>ZIP code<input name="postalCode" autoComplete="postal-code" pattern="[0-9]{5}(-[0-9]{4})?" required disabled={!credentials || busy} /></label></div>
          <button type="submit" className="button secondary" disabled={!credentials || busy}>{busy ? "Checking…" : "Get test quote"}</button>
          {quoteResult && <p role="status" className="delivery-saved">Estimated delivery fee: {formatCents(quoteResult.feeCents)}. Quote expires {new Date(quoteResult.expires).toLocaleString()}.</p>}
          {quoteError && <p role="alert" className="checkout-error">{quoteError}</p>}
          {!credentials && <p className="delivery-verification-note">Sign in below to test a quote.</p>}
        </form>
      </section>
      <section className="delivery-settings" aria-labelledby="delivery-settings-title">
        <div><h2 id="delivery-settings-title">Operational settings</h2><p>Dispatch controls unlock after verified API access and a successful test delivery.</p></div>
        <div className="delivery-settings-controls">
          <label>Planned primary service
            <select value={settings?.preferredProvider || ""} onChange={(event) => save({ preferredProvider: (event.target.value || null) as DirectDeliveryProvider | null })} disabled={!settingsAvailable || busy}>
              <option value="">None selected</option>
              <option value="doordash_drive">DoorDash Drive</option>
              <option value="uber_direct">Uber Direct</option>
            </select>
          </label>
          <div className="delivery-pause"><span>Pause website delivery</span><strong>Paused</strong><p>Cannot be resumed until a provider is connected and verified.</p></div>
        </div>
      </section>
    </main>
  </div>;
}
