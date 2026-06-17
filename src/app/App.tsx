import { useState, useCallback } from "react";
import { snapdom } from "@zumer/snapdom";

type Tab = "lite" | "business" | "compare";

const NAVY = "#0d1226";
const ORANGE = "#e84a1f";
const GREEN = "#15803d";

const LITE = { monthly: 39, yearly: 399 };
const BUSINESS = { monthly: 79, yearly: 813.61 };

type CurrencyCode = "USD" | "INR" | "AED";
interface Currency {
  code: CurrencyCode;
  label: string;
  symbol: string;
  rate: number;
}

const CURRENCIES: Record<CurrencyCode, Currency> = {
  USD: { code: "USD", label: "USD ($)", symbol: "$", rate: 1 },
  INR: { code: "INR", label: "INR (₹)", symbol: "₹", rate: 83.5 },
  AED: { code: "AED", label: "AED (د.إ)", symbol: "د.إ", rate: 3.67 },
};

function fmtPrice(amountInUSD: number, currency: Currency) {
  const converted = amountInUSD * currency.rate;
  return `${currency.symbol}${converted.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function calcDiscount(yearly: number, pct: number) {
  const discountedYearly = yearly * (1 - pct / 100);
  const discountedMonthly = discountedYearly / 12;
  const savings = yearly - discountedYearly;
  return { discountedYearly, discountedMonthly, savings };
}

function Divider({ className = "" }: { className?: string }) {
  return <div className={`w-full h-px bg-black/10 ${className}`} />;
}

function CheckRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-1.5">
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="mt-0.5 shrink-0">
        <circle cx="9" cy="9" r="9" fill={GREEN} />
        <path d="M5 9l3 3 5-5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="text-sm leading-snug" style={{ fontFamily: "'DM Sans', sans-serif" }}>{children}</span>
    </div>
  );
}

/* ─── Discount input strip ──────────────────────────────────────────────── */
function DiscountBar({
  discount,
  onChange,
  promoCode,
  onCodeChange,
  currencyCode,
  onCurrencyChange,
}: {
  discount: number;
  onChange: (v: number) => void;
  promoCode: string;
  onCodeChange: (v: string) => void;
  currencyCode: CurrencyCode;
  onCurrencyChange: (c: CurrencyCode) => void;
}) {
  const presets = [50, 60, 70, 76, 80];

  return (
    <div
      className="sticky top-[61px] z-10 border-b border-black/10"
      style={{ background: "#fffef9" }}
    >
      <div className="max-w-[800px] mx-auto px-6 py-4 flex flex-wrap items-center gap-4">
        {/* Currency selector */}
        <div className="flex items-center gap-2">
          <label
            className="text-xs font-bold tracking-widest uppercase whitespace-nowrap"
            style={{ fontFamily: "'DM Mono', monospace", color: "rgba(13,18,38,0.5)" }}
          >
            Currency
          </label>
          <select
            value={currencyCode}
            onChange={(e) => onCurrencyChange(e.target.value as CurrencyCode)}
            className="text-xs font-bold rounded-sm border py-1.5 px-2 focus:outline-none focus:ring-1 bg-white cursor-pointer"
            style={{
              fontFamily: "'DM Mono', monospace",
              color: NAVY,
              borderColor: "rgba(13,18,38,0.2)",
            }}
          >
            {Object.values(CURRENCIES).map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div className="w-px h-6 bg-black/10 hidden sm:block" />

        {/* Slider + number */}
        <div className="flex items-center gap-3 flex-1 min-w-[220px]">
          <label
            className="text-xs font-bold tracking-widest uppercase whitespace-nowrap"
            style={{ fontFamily: "'DM Mono', monospace", color: "rgba(13,18,38,0.5)" }}
          >
            Discount %
          </label>
          <input
            type="range"
            min={0}
            max={99}
            step={1}
            value={discount}
            onChange={(e) => onChange(Number(e.target.value))}
            className="flex-1 accent-orange-500 cursor-pointer"
            style={{ accentColor: ORANGE }}
          />
          <div className="relative">
            <input
              type="number"
              min={0}
              max={99}
              value={discount}
              onChange={(e) => onChange(Math.min(99, Math.max(0, Number(e.target.value))))}
              className="w-16 text-center text-sm font-bold rounded-sm border border-black/15 py-1 pr-1 pl-2 focus:outline-none focus:ring-1"
              style={{
                fontFamily: "'DM Mono', monospace",
                color: ORANGE,
                borderColor: "rgba(232,74,31,0.4)",
              }}
            />
            <span
              className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold pointer-events-none"
              style={{ color: ORANGE, fontFamily: "'DM Mono', monospace" }}
            >
              %
            </span>
          </div>
        </div>

        {/* Preset pills */}
        <div className="flex gap-1.5 flex-wrap">
          {presets.map((p) => (
            <button
              key={p}
              onClick={() => onChange(p)}
              className="text-xs px-3 py-1 rounded-sm font-bold transition-all duration-150"
              style={{
                fontFamily: "'DM Mono', monospace",
                background: discount === p ? ORANGE : "rgba(232,74,31,0.08)",
                color: discount === p ? "white" : ORANGE,
                border: `1px solid ${discount === p ? ORANGE : "rgba(232,74,31,0.25)"}`,
              }}
            >
              {p}%
            </button>
          ))}
        </div>

        <div className="w-px h-6 bg-black/10 hidden sm:block" />

        {/* Promo code label */}
        <div className="flex items-center gap-2">
          <label
            className="text-xs font-bold tracking-widest uppercase whitespace-nowrap"
            style={{ fontFamily: "'DM Mono', monospace", color: "rgba(13,18,38,0.5)" }}
          >
            Code
          </label>
          <input
            type="text"
            value={promoCode}
            onChange={(e) => onCodeChange(e.target.value.toUpperCase())}
            placeholder="e.g. 70OFF"
            className="w-24 text-xs font-bold rounded-sm border py-1.5 px-2 focus:outline-none focus:ring-1 uppercase"
            style={{
              fontFamily: "'DM Mono', monospace",
              color: NAVY,
              borderColor: "rgba(13,18,38,0.2)",
            }}
          />
        </div>
      </div>
    </div>
  );
}

/* ─── Promo card ─────────────────────────────────────────────────────────── */
function PromoCard({
  code,
  yearlyPrice,
  monthlyPrice,
  savings,
  highlight = false,
  discount,
  currency,
}: {
  code: string;
  yearlyPrice: number;
  monthlyPrice: number;
  savings: number;
  highlight?: boolean;
  discount: number;
  currency: Currency;
}) {
  return (
    <div
      className="flex-1 rounded-sm p-5 flex flex-col gap-3"
      style={{ background: highlight ? ORANGE : NAVY, color: "white" }}
    >
      <div className="flex items-center justify-between">
        <span
          className="text-xs font-bold tracking-widest uppercase px-2 py-0.5 rounded-sm"
          style={{
            fontFamily: "'DM Mono', monospace",
            background: "rgba(255,255,255,0.18)",
          }}
        >
          {code || `${discount}%OFF`}
        </span>
        {highlight && (
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-sm"
            style={{ fontFamily: "'DM Sans', sans-serif", background: "rgba(255,255,255,0.25)" }}
          >
            Active Code
          </span>
        )}
      </div>

      <div>
        <div
          className="text-3xl font-bold leading-none"
          style={{ fontFamily: "'DM Mono', monospace" }}
        >
          {fmtPrice(yearlyPrice, currency)}
          <span className="text-sm font-normal opacity-70">/year</span>
        </div>
        <div
          className="text-sm opacity-80 mt-1"
          style={{ fontFamily: "'DM Mono', monospace" }}
        >
          {fmtPrice(monthlyPrice, currency)}/month
        </div>
      </div>

      <div className="mt-auto pt-3 border-t border-white/20">
        <div className="flex items-center gap-1.5">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M2 6.5l4 4 5-7" stroke="#4ade80" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span
            className="text-xs font-semibold"
            style={{ fontFamily: "'DM Sans', sans-serif", color: "#4ade80" }}
          >
            Save {fmtPrice(savings, currency)}/year
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─── Poster shell ───────────────────────────────────────────────────────── */
function PosterShell({ children, badge }: { children: React.ReactNode; badge?: string }) {
  return (
    <div className="flex justify-center px-4 py-10">
      <div
        id="poster-export"
        className="w-full max-w-[640px] bg-card rounded-sm overflow-hidden"
        style={{ boxShadow: "0 20px 60px rgba(13,18,38,0.18)" }}
      >
        {badge && (
          <div
            className="w-full text-center text-xs font-bold tracking-widest uppercase py-2"
            style={{ fontFamily: "'DM Mono', monospace", background: ORANGE, color: "white", letterSpacing: "0.2em" }}
          >
            {badge}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

/* ─── Lite Poster ────────────────────────────────────────────────────────── */
function LitePoster({ discount, promoCode, currency }: { discount: number; promoCode: string; currency: Currency }) {
  const { discountedYearly, discountedMonthly, savings } = calcDiscount(LITE.yearly, discount);
  const hasDiscount = discount > 0;

  return (
    <PosterShell badge="Perfect for Startups & Small Teams">
      <div className="px-10 pt-10 pb-8" style={{ background: NAVY }}>
        <div
          className="text-xs font-semibold tracking-widest uppercase mb-3"
          style={{ fontFamily: "'DM Mono', monospace", color: "rgba(255,255,255,0.5)" }}
        >
          MeqOS
        </div>
        <h1
          className="text-5xl font-black leading-none mb-4"
          style={{ fontFamily: "'Playfair Display', serif", color: "white", letterSpacing: "-0.02em" }}
        >
          Lite
        </h1>
        <p
          className="text-sm mb-8 opacity-60"
          style={{ fontFamily: "'DM Sans', sans-serif", color: "white" }}
        >
          Everything you need to start converting leads visually.
        </p>

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-sm p-4" style={{ background: "rgba(255,255,255,0.08)" }}>
            <div
              className="text-xs uppercase tracking-widest mb-2 opacity-50"
              style={{ fontFamily: "'DM Mono', monospace", color: "white" }}
            >
              Monthly
            </div>
            <div
              className="text-4xl font-bold text-white leading-none"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              {fmtPrice(LITE.monthly, currency)}
              <span className="text-base font-normal opacity-60">/mo</span>
            </div>
          </div>
          <div
            className="rounded-sm p-4"
            style={{ background: "rgba(232,74,31,0.25)", border: `1px solid ${ORANGE}` }}
          >
            <div
              className="text-xs uppercase tracking-widest mb-2"
              style={{ fontFamily: "'DM Mono', monospace", color: ORANGE }}
            >
              Yearly 🔥
            </div>
            <div
              className="text-4xl font-bold text-white leading-none"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              {fmtPrice(LITE.yearly, currency)}
              <span className="text-base font-normal opacity-60">/yr</span>
            </div>
            <div
              className="text-xs mt-1 font-semibold"
              style={{ fontFamily: "'DM Sans', sans-serif", color: "#4ade80" }}
            >
              Save {fmtPrice(LITE.monthly * 12 - LITE.yearly, currency)} vs monthly
            </div>
          </div>
        </div>
      </div>

      {/* Promo */}
      <div className="px-10 py-8">
        {hasDiscount ? (
          <>
            <div
              className="text-xs font-bold tracking-widest uppercase mb-5"
              style={{ fontFamily: "'DM Mono', monospace", color: ORANGE }}
            >
              ⚡ {discount}% Discount Applied
            </div>
            <div className="flex gap-4">
              <PromoCard
                code={promoCode || `${discount}OFF`}
                yearlyPrice={discountedYearly}
                monthlyPrice={discountedMonthly}
                savings={savings}
                highlight={true}
                discount={discount}
                currency={currency}
              />
              <div
                className="flex-1 rounded-sm p-5 flex flex-col gap-2 border border-dashed border-black/15"
                style={{ background: "#fafaf9" }}
              >
                <div
                  className="text-xs font-bold tracking-widest uppercase mb-1"
                  style={{ fontFamily: "'DM Mono', monospace", color: "rgba(13,18,38,0.4)" }}
                >
                  Without Discount
                </div>
                <div
                  className="text-3xl font-bold leading-none line-through opacity-40"
                  style={{ fontFamily: "'DM Mono', monospace", color: NAVY }}
                >
                  {fmtPrice(LITE.yearly, currency)}
                  <span className="text-sm font-normal">/year</span>
                </div>
                <div
                  className="text-sm opacity-40"
                  style={{ fontFamily: "'DM Mono', monospace", color: NAVY }}
                >
                  {fmtPrice(LITE.monthly, currency)}/month
                </div>
                <div
                  className="mt-auto text-xs font-semibold"
                  style={{ fontFamily: "'DM Sans', sans-serif", color: ORANGE }}
                >
                  You save {fmtPrice(savings, currency)}/year 🎉
                </div>
              </div>
            </div>
          </>
        ) : (
          <div
            className="rounded-sm p-5 text-center border border-dashed border-black/15"
            style={{ background: "#fafaf9" }}
          >
            <div
              className="text-sm font-medium opacity-50"
              style={{ fontFamily: "'DM Sans', sans-serif", color: NAVY }}
            >
              Use the slider above to apply a discount and see updated pricing
            </div>
          </div>
        )}
      </div>

      <Divider />

      <div className="px-10 py-8">
        <div
          className="text-xs font-bold tracking-widest uppercase mb-4"
          style={{ fontFamily: "'DM Mono', monospace", color: "rgba(13,18,38,0.45)" }}
        >
          Plan Includes
        </div>
        <CheckRow><strong>2 Free Users</strong> included with every plan</CheckRow>
        <CheckRow>Additional users at <strong>{fmtPrice(12, currency)}/user</strong> per month</CheckRow>
        <CheckRow>Full access to all Lite features</CheckRow>
        <CheckRow>Priority email support</CheckRow>
      </div>

      <div
        className="px-10 py-4 text-xs text-center"
        style={{
          fontFamily: "'DM Sans', sans-serif",
          color: "rgba(13,18,38,0.35)",
          borderTop: "1px solid rgba(13,18,38,0.08)",
          background: "#f9f8f6",
        }}
      >
        visualout.com · Prices in {currency.code} · Offer valid while codes are active
      </div>
    </PosterShell>
  );
}

/* ─── Business Poster ────────────────────────────────────────────────────── */
function BusinessPoster({ discount, promoCode, currency }: { discount: number; promoCode: string; currency: Currency }) {
  const { discountedYearly, discountedMonthly, savings } = calcDiscount(BUSINESS.yearly, discount);
  const hasDiscount = discount > 0;

  return (
    <PosterShell badge="Built for Growing Teams">
      <div className="px-10 pt-10 pb-8" style={{ background: "#1a1060" }}>
        <div
          className="text-xs font-semibold tracking-widest uppercase mb-3"
          style={{ fontFamily: "'DM Mono', monospace", color: "rgba(255,255,255,0.5)" }}
        >
          MeqOS
        </div>
        <h1
          className="text-5xl font-black leading-none mb-4"
          style={{ fontFamily: "'Playfair Display', serif", color: "white", letterSpacing: "-0.02em" }}
        >
          Business
        </h1>
        <p
          className="text-sm mb-8 opacity-60"
          style={{ fontFamily: "'DM Sans', sans-serif", color: "white" }}
        >
          Scale your team with advanced collaboration and more users.
        </p>

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-sm p-4" style={{ background: "rgba(255,255,255,0.08)" }}>
            <div
              className="text-xs uppercase tracking-widest mb-2 opacity-50"
              style={{ fontFamily: "'DM Mono', monospace", color: "white" }}
            >
              Monthly
            </div>
            <div
              className="text-4xl font-bold text-white leading-none"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              {fmtPrice(BUSINESS.monthly, currency)}
              <span className="text-base font-normal opacity-60">/mo</span>
            </div>
          </div>
          <div
            className="rounded-sm p-4"
            style={{ background: "rgba(232,74,31,0.25)", border: `1px solid ${ORANGE}` }}
          >
            <div
              className="text-xs uppercase tracking-widest mb-2"
              style={{ fontFamily: "'DM Mono', monospace", color: ORANGE }}
            >
              Yearly 🔥
            </div>
            <div
              className="text-4xl font-bold text-white leading-none"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              {fmtPrice(BUSINESS.yearly, currency)}
              <span className="text-base font-normal opacity-60">/yr</span>
            </div>
            <div
              className="text-xs mt-1 font-semibold"
              style={{ fontFamily: "'DM Sans', sans-serif", color: "#4ade80" }}
            >
              Save {fmtPrice(BUSINESS.monthly * 12 - BUSINESS.yearly, currency)} vs monthly
            </div>
          </div>
        </div>
      </div>

      {/* Promo */}
      <div className="px-10 py-8">
        {hasDiscount ? (
          <>
            <div
              className="text-xs font-bold tracking-widest uppercase mb-5"
              style={{ fontFamily: "'DM Mono', monospace", color: ORANGE }}
            >
              ⚡ {discount}% Discount Applied
            </div>
            <div className="flex gap-4">
              <PromoCard
                code={promoCode || `${discount}OFF`}
                yearlyPrice={discountedYearly}
                monthlyPrice={discountedMonthly}
                savings={savings}
                highlight={true}
                discount={discount}
                currency={currency}
              />
              <div
                className="flex-1 rounded-sm p-5 flex flex-col gap-2 border border-dashed border-black/15"
                style={{ background: "#fafaf9" }}
              >
                <div
                  className="text-xs font-bold tracking-widest uppercase mb-1"
                  style={{ fontFamily: "'DM Mono', monospace", color: "rgba(13,18,38,0.4)" }}
                >
                  Without Discount
                </div>
                <div
                  className="text-3xl font-bold leading-none line-through opacity-40"
                  style={{ fontFamily: "'DM Mono', monospace", color: NAVY }}
                >
                  {fmtPrice(BUSINESS.yearly, currency)}
                  <span className="text-sm font-normal">/year</span>
                </div>
                <div
                  className="text-sm opacity-40"
                  style={{ fontFamily: "'DM Mono', monospace", color: NAVY }}
                >
                  {fmtPrice(BUSINESS.monthly, currency)}/month
                </div>
                <div
                  className="mt-auto text-xs font-semibold"
                  style={{ fontFamily: "'DM Sans', sans-serif", color: ORANGE }}
                >
                  You save {fmtPrice(savings, currency)}/year 🎉
                </div>
              </div>
            </div>
          </>
        ) : (
          <div
            className="rounded-sm p-5 text-center border border-dashed border-black/15"
            style={{ background: "#fafaf9" }}
          >
            <div
              className="text-sm font-medium opacity-50"
              style={{ fontFamily: "'DM Sans', sans-serif", color: NAVY }}
            >
              Use the slider above to apply a discount and see updated pricing
            </div>
          </div>
        )}
      </div>

      <Divider />

      <div className="px-10 py-8">
        <div
          className="text-xs font-bold tracking-widest uppercase mb-4"
          style={{ fontFamily: "'DM Mono', monospace", color: "rgba(13,18,38,0.45)" }}
        >
          Plan Includes
        </div>
        <CheckRow><strong>10 Free Users</strong> included with every plan</CheckRow>
        <CheckRow>Additional users at <strong>{fmtPrice(74, currency)}/user</strong> per month</CheckRow>
        <CheckRow>Advanced collaboration &amp; analytics</CheckRow>
        <CheckRow>Dedicated account support</CheckRow>
      </div>

      <div
        className="px-10 py-4 text-xs text-center"
        style={{
          fontFamily: "'DM Sans', sans-serif",
          color: "rgba(13,18,38,0.35)",
          borderTop: "1px solid rgba(13,18,38,0.08)",
          background: "#f9f8f6",
        }}
      >
        visualout.com · Prices in {currency.code} · Offer valid while codes are active
      </div>
    </PosterShell>
  );
}

/* ─── Comparison / WhatsApp poster ──────────────────────────────────────── */
function ComparisonPoster({ discount, promoCode, currency }: { discount: number; promoCode: string; currency: Currency }) {
  const lite = calcDiscount(LITE.yearly, discount);
  const biz = calcDiscount(BUSINESS.yearly, discount);
  const code = promoCode || (discount > 0 ? `${discount}OFF` : null);

  return (
    <PosterShell>
      <div className="px-10 pt-10 pb-8" style={{ background: NAVY }}>
        <div
          className="text-xs font-semibold tracking-widest uppercase mb-3"
          style={{ fontFamily: "'DM Mono', monospace", color: "rgba(255,255,255,0.5)" }}
        >
          MeqOS · Pricing Overview
        </div>
        <h1
          className="text-5xl font-black leading-none"
          style={{ fontFamily: "'Playfair Display', serif", color: "white", letterSpacing: "-0.02em" }}
        >
          Compare Plans
        </h1>
        {discount > 0 && (
          <div
            className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-sm text-sm font-bold"
            style={{ background: ORANGE, color: "white", fontFamily: "'DM Mono', monospace" }}
          >
            ⚡ {discount}% discount active
            {code && <span className="opacity-75">· Code: {code}</span>}
          </div>
        )}
      </div>

      {/* Standard Pricing */}
      <div className="px-10 py-8">
        <div
          className="text-xs font-bold tracking-widest uppercase mb-5"
          style={{ fontFamily: "'DM Mono', monospace", color: "rgba(13,18,38,0.45)" }}
        >
          Standard Pricing
        </div>

        <div className="rounded-sm overflow-hidden border border-black/10">
          <div
            className="grid grid-cols-4 text-xs font-bold tracking-wider uppercase px-4 py-3"
            style={{ fontFamily: "'DM Mono', monospace", background: NAVY, color: "rgba(255,255,255,0.6)" }}
          >
            <div>Plan</div>
            <div className="text-right">Monthly</div>
            <div className="text-right">Yearly</div>
            <div className="text-right">Eff. Monthly</div>
          </div>

          {[
            { name: "Lite", sub: "2 users incl.", monthly: LITE.monthly, yearly: LITE.yearly },
            { name: "Business", sub: "10 users incl.", monthly: BUSINESS.monthly, yearly: BUSINESS.yearly },
          ].map((row, i) => (
            <div
              key={row.name}
              className="grid grid-cols-4 px-4 py-4 items-center"
              style={{
                borderTop: i > 0 ? "1px solid rgba(13,18,38,0.08)" : undefined,
                background: i % 2 === 1 ? "#fafaf9" : "white",
              }}
            >
              <div>
                <div className="font-bold text-sm" style={{ fontFamily: "'DM Sans', sans-serif", color: NAVY }}>
                  {row.name}
                </div>
                <div className="text-xs mt-0.5" style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(13,18,38,0.45)" }}>
                  {row.sub}
                </div>
              </div>
              <div className="text-right text-sm font-semibold" style={{ fontFamily: "'DM Mono', monospace", color: NAVY }}>
                {fmtPrice(row.monthly, currency)}
              </div>
              <div className="text-right text-sm font-semibold" style={{ fontFamily: "'DM Mono', monospace", color: NAVY }}>
                {fmtPrice(row.yearly, currency)}
              </div>
              <div className="text-right text-sm font-semibold" style={{ fontFamily: "'DM Mono', monospace", color: GREEN }}>
                {fmtPrice(row.yearly / 12, currency)}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4">
          {[
            { label: "Lite yearly saves", val: `${fmtPrice(LITE.monthly * 12 - LITE.yearly, currency)}/yr` },
            { label: "Business yearly saves", val: `${fmtPrice(BUSINESS.monthly * 12 - BUSINESS.yearly, currency)}/yr` },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-sm px-4 py-3 flex items-center justify-between"
              style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}
            >
              <span className="text-xs font-medium" style={{ fontFamily: "'DM Sans', sans-serif", color: GREEN }}>
                {s.label}
              </span>
              <span className="text-base font-bold" style={{ fontFamily: "'DM Mono', monospace", color: GREEN }}>
                {s.val}
              </span>
            </div>
          ))}
        </div>
      </div>

      <Divider />

      {/* Discounted Pricing */}
      <div className="px-10 py-8">
        <div
          className="text-xs font-bold tracking-widest uppercase mb-5"
          style={{ fontFamily: "'DM Mono', monospace", color: ORANGE }}
        >
          {discount > 0 ? `⚡ ${discount}% Off — Promotional Pricing` : "⚡ Promotional Pricing (set discount above)"}
        </div>

        <div className="rounded-sm overflow-hidden border border-black/10">
          <div
            className="grid grid-cols-4 text-xs font-bold tracking-wider uppercase px-4 py-3"
            style={{ fontFamily: "'DM Mono', monospace", background: ORANGE, color: "rgba(255,255,255,0.85)" }}
          >
            <div>Plan</div>
            <div className="text-right">Code</div>
            <div className="text-right">Price/Year</div>
            <div className="text-right">Price/Month</div>
          </div>

          {[
            { name: "Lite", d: lite },
            { name: "Business", d: biz },
          ].map((row, i) => (
            <div
              key={row.name}
              className="grid grid-cols-4 px-4 py-4 items-center"
              style={{
                borderTop: i > 0 ? "1px solid rgba(13,18,38,0.08)" : undefined,
                background: i % 2 === 1 ? "#fafaf9" : "white",
              }}
            >
              <div className="font-bold text-sm" style={{ fontFamily: "'DM Sans', sans-serif", color: NAVY }}>
                {row.name}
              </div>
              <div
                className="text-right text-xs font-bold px-2 py-0.5 rounded-sm justify-self-end"
                style={{
                  fontFamily: "'DM Mono', monospace",
                  background: discount > 0 ? "rgba(232,74,31,0.1)" : "rgba(13,18,38,0.06)",
                  color: discount > 0 ? ORANGE : "rgba(13,18,38,0.4)",
                }}
              >
                {code ?? "—"}
              </div>
              <div
                className="text-right text-sm font-bold"
                style={{ fontFamily: "'DM Mono', monospace", color: discount > 0 ? ORANGE : "rgba(13,18,38,0.3)" }}
              >
                {discount > 0 ? fmtPrice(row.d.discountedYearly, currency) : "—"}
              </div>
              <div
                className="text-right text-sm font-semibold"
                style={{ fontFamily: "'DM Mono', monospace", color: discount > 0 ? NAVY : "rgba(13,18,38,0.3)" }}
              >
                {discount > 0 ? fmtPrice(row.d.discountedMonthly, currency) : "—"}
              </div>
            </div>
          ))}
        </div>

        {discount > 0 && (
          <div className="grid grid-cols-2 gap-3 mt-4">
            {[
              { label: "Lite saves", val: `${fmtPrice(lite.savings, currency)}/yr` },
              { label: "Business saves", val: `${fmtPrice(biz.savings, currency)}/yr` },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-sm px-4 py-3 flex items-center justify-between"
                style={{ background: "rgba(232,74,31,0.06)", border: `1px solid rgba(232,74,31,0.2)` }}
              >
                <span className="text-xs font-medium" style={{ fontFamily: "'DM Sans', sans-serif", color: ORANGE }}>
                  {s.label}
                </span>
                <span className="text-base font-bold" style={{ fontFamily: "'DM Mono', monospace", color: ORANGE }}>
                  {s.val}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <Divider />

      {/* WhatsApp message */}
      <div className="px-10 py-8">
        <div
          className="text-xs font-bold tracking-widest uppercase mb-5"
          style={{ fontFamily: "'DM Mono', monospace", color: "rgba(13,18,38,0.45)" }}
        >
          WhatsApp Sales Message
        </div>

        <div
          className="rounded-sm p-5 text-sm leading-relaxed"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            background: "#f0f7f0",
            border: "1px solid #c6e6c6",
            color: NAVY,
          }}
        >
          <p className="font-bold mb-2">MeqOS Lite</p>
          <p className="mb-1 opacity-70">Regular: {fmtPrice(LITE.yearly, currency)}/year</p>
          {discount > 0 ? (
            <p className="mb-3">
              🔥 <strong>{code}</strong> → {fmtPrice(lite.discountedYearly, currency)}/year ({fmtPrice(lite.discountedMonthly, currency)}/month)
            </p>
          ) : (
            <p className="mb-3 opacity-40 italic">Set discount to see promo price</p>
          )}
          <p className="mb-4 text-xs opacity-60">Includes 2 users · {fmtPrice(12, currency)} per additional user</p>

          <div className="h-px bg-green-200 mb-4" />

          <p className="font-bold mb-2">MeqOS Business</p>
          <p className="mb-1 opacity-70">Regular: {fmtPrice(BUSINESS.yearly, currency)}/year</p>
          {discount > 0 ? (
            <p className="mb-3">
              🔥 <strong>{code}</strong> → {fmtPrice(biz.discountedYearly, currency)}/year ({fmtPrice(biz.discountedMonthly, currency)}/month)
            </p>
          ) : (
            <p className="mb-3 opacity-40 italic">Set discount to see promo price</p>
          )}
          <p className="text-xs opacity-60">Includes 10 users · {fmtPrice(74, currency)} per additional user</p>
        </div>
      </div>

      <div
        className="px-10 py-4 text-xs text-center"
        style={{
          fontFamily: "'DM Sans', sans-serif",
          color: "rgba(13,18,38,0.35)",
          borderTop: "1px solid rgba(13,18,38,0.08)",
          background: "#f9f8f6",
        }}
      >
        visualout.com · Prices in {currency.code} · Offer valid while codes are active
      </div>
    </PosterShell>
  );
}

/* ─── Root ───────────────────────────────────────────────────────────────── */
const TABS: { id: Tab; label: string }[] = [
  { id: "lite", label: "Lite Plan" },
  { id: "business", label: "Business Plan" },
  { id: "compare", label: "Comparison Sheet" },
];

export default function App() {
  const [active, setActive] = useState<Tab>("lite");
  const [discount, setDiscount] = useState(0);
  const [promoCode, setPromoCode] = useState("");
  const [currencyCode, setCurrencyCode] = useState<CurrencyCode>("USD");

  const handleDiscount = useCallback((v: number) => setDiscount(v), []);
  const handleCode = useCallback((v: string) => setPromoCode(v), []);

  const handleDownload = async () => {
    const el = document.getElementById("poster-export");
    if (!el) return;
    try {
      // Ensure web fonts are fully loaded so text metrics/layout are correct.
      await document.fonts.ready;
      await snapdom.download(el, {
        format: "png",
        filename: `meqos-${active}-poster`,
        scale: 2,
        embedFonts: true,
        backgroundColor: "#ffffff",
      });
    } catch (err) {
      console.error("Failed to generate image", err);
    }
  };

  const currency = CURRENCIES[currencyCode];

  return (
    <div className="min-h-screen bg-background">
      {/* Top nav */}
      <div
        className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 border-b border-black/10"
        style={{ background: NAVY }}
      >
        <div className="flex items-center gap-3">
          <span
            className="text-white font-black text-lg tracking-tight"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Visualout
          </span>
          <span
            className="text-xs px-2 py-0.5 rounded-sm font-semibold tracking-widest uppercase"
            style={{ fontFamily: "'DM Mono', monospace", background: ORANGE, color: "white" }}
          >
            Sales Kit
          </span>
        </div>

        <div className="flex gap-1 p-1 rounded-sm" style={{ background: "rgba(255,255,255,0.08)" }}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className="px-4 py-1.5 text-sm rounded-sm transition-all duration-200"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: active === tab.id ? 600 : 400,
                background: active === tab.id ? "white" : "transparent",
                color: active === tab.id ? NAVY : "rgba(255,255,255,0.65)",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Discount calculator bar */}
      <DiscountBar
        discount={discount}
        onChange={handleDiscount}
        promoCode={promoCode}
        onCodeChange={handleCode}
        currencyCode={currencyCode}
        onCurrencyChange={setCurrencyCode}
      />

      {/* Poster content */}
      <div className="py-4">
        {active === "lite" && <LitePoster discount={discount} promoCode={promoCode} currency={currency} />}
        {active === "business" && <BusinessPoster discount={discount} promoCode={promoCode} currency={currency} />}
        {active === "compare" && <ComparisonPoster discount={discount} promoCode={promoCode} currency={currency} />}
      </div>

      <div
        className="text-center pb-8 text-xs flex flex-col items-center gap-4"
        style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(13,18,38,0.35)" }}
      >
        <button
          onClick={handleDownload}
          className="px-6 py-2 text-sm font-bold text-white rounded-sm shadow-sm hover:opacity-90 transition-opacity"
          style={{ background: ORANGE }}
        >
          Download as Image
        </button>
        <span>Use browser Print (⌘P) → Save as PDF to export each poster</span>
      </div>
    </div>
  );
}
