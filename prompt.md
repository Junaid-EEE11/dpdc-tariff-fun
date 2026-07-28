# Codex Build Prompt — Billwise DPDC Tariff Calculator

Copy the complete prompt below into Codex in an empty project directory. It is intentionally self-contained so the application can be recreated without access to the original repository.

---

## Prompt

You are Codex working in a local project directory. Build a complete, production-ready consumer electricity tariff calculator named **Billwise** for Dhaka Power Distribution Company Limited (DPDC), Bangladesh.

Do not stop at a plan or provide only sample code. Create all required files, install dependencies when needed, implement the complete application, run lint and the production build, fix any issues, and leave the directory ready for deployment.

Make reasonable implementation decisions without asking questions unless progress is genuinely impossible. Inspect existing files before editing and preserve unrelated user work. Do not add a backend—the finished product must be a static, client-side React application.

## 1. Product outcome

Create a polished, responsive, bilingual electricity bill estimator that helps a consumer understand an estimated DPDC bill before it arrives.

The application must support:

- all 23 consumer categories listed later in this prompt;
- LT, MT, HT, and EHT voltage groups;
- residential lifeline and progressive slab billing;
- flat-rate metering;
- time-of-use metering with off-peak and peak registers;
- super off-peak registers where the selected tariff defines that rate;
- direct monthly kWh input;
- current and previous cumulative meter readings;
- sanctioned load in kW;
- monthly kVARh and automatic power-factor calculation;
- automatic power-factor surcharge explanation;
- an optional 4% transformer-loss calculation;
- transformer rent;
- meter/service charge;
- signed old-meter or unit adjustment;
- optional VAT;
- optional late-payment estimation;
- English and Bangla interface copy;
- a detailed itemized result and visible formulas; and
- an in-page tariff reference for the selected consumer category.

The result is an independent estimate, not an official DPDC bill. State that clearly in the interface.

Do **not** implement sample-bill upload, bill import, OCR, account lookup, or sample-bill validation. Any archived DPDC HTML pages that happen to exist in the directory are reference material only and must not be imported into the runtime bundle.

## 2. Official source and tariff metadata

Use this DPDC page as the official source link:

<https://dpdc.gov.bd/pages/static-pages/6922de6f933eb65569e1a9c4>

Create a centralized configuration containing:

```js
source: {
  authority: "Dhaka Power Distribution Company Limited (DPDC)",
  url: "https://dpdc.gov.bd/pages/static-pages/6922de6f933eb65569e1a9c4",
  effectiveBillMonth: "2026-06",
  checkedOn: "2026-07-28",
  currency: "BDT"
}
```

Show the effective bill month near the page introduction, the checked date in the footer, and the source link in the header, tariff section, and footer. Open source links in a new tab with safe `rel` attributes.

## 3. Required technology

Use:

- React 19;
- React DOM 19;
- Vite 6;
- JavaScript with JSX, not TypeScript;
- Lucide React icons;
- Supabase JavaScript for hosted authentication;
- plain CSS;
- ESLint 9 with React, hooks, and refresh plugins.

Use the following package identity and scripts:

```json
{
  "name": "billwise-dpdc-tariff-calculator",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint ."
  }
}
```

Use compatible pinned dependency versions. A known working set is:

```json
"dependencies": {
  "@supabase/supabase-js": "2.78.0",
  "lucide-react": "1.27.0",
  "react": "19.2.8",
  "react-dom": "19.2.8"
},
"devDependencies": {
  "@eslint/js": "9.39.2",
  "@vitejs/plugin-react": "4.3.4",
  "eslint": "9.39.2",
  "eslint-plugin-react": "7.37.5",
  "eslint-plugin-react-hooks": "7.0.1",
  "eslint-plugin-react-refresh": "0.4.26",
  "globals": "17.3.0",
  "vite": "6.1.0"
}
```

The application must have no custom backend, application database, or runtime tariff API. Use Supabase Auth as the hosted authentication backend. Require only a project URL and browser-safe publishable key through Vite environment variables. Never use a service-role or secret key in the frontend.

## 4. Required file structure

Create this concise structure:

```text
.
├── .env.example
├── .gitignore
├── AUTH_SETUP.md
├── index.html
├── package.json
├── package-lock.json
├── eslint.config.js
├── vite.config.js
└── src/
    ├── auth/
    │   ├── AuthContext.jsx
    │   ├── AuthGate.jsx
    │   ├── auth.css
    │   ├── rateLimit.js
    │   └── supabaseClient.js
    ├── main.jsx
    ├── styles.css
    └── tariffConfig.js
```

Responsibilities:

- `src/tariffConfig.js`: the only source of tariff numbers and billing-rule inputs;
- `src/auth`: Supabase client, session context, protected UI, and client cooldowns;
- `src/main.jsx`: React components, localization copy, state, calculations, and rendering;
- `src/styles.css`: the complete visual and responsive system;
- `index.html`: metadata, title, and `#root` mount point;
- `eslint.config.js`: browser/React lint configuration.
- `vite.config.js`: enables the official Vite React plugin and automatic JSX runtime.

If archived files matching `CMS __ DPDC*` exist, exclude them and their resource directories from ESLint along with `dist`.

## 5. Central tariff configuration

Export exactly one named object from `src/tariffConfig.js`:

```js
export const TARIFF_CONFIG = { ... };
```

Add a short file comment explaining that this is the single source of truth. Do not duplicate tariff amounts in `main.jsx` or CSS.

### Billing rules

Configure these exact inputs:

```js
billingRules: {
  vatRate: 0.05,
  latePaymentRate: 0.05,
  powerFactor: {
    threshold: 0.95,
    surchargePerPoint: 0.0075,
    pointSize: 0.01,
    formula: "kWh / sqrt(kWh^2 + kVARh^2)",
    surchargeBase: "energyCharge"
  },
  transformerLoss: {
    defaultRate: 0.04,
    optional: true,
    unitBasis: "meteredEnergyByRatePeriod"
  },
  demandChargeBasis: "sanctionedLoadKw"
}
```

### Voltage metadata

```js
voltageLevels: {
  LT: {
    label: "Low tension",
    voltage: "230 / 400 V",
    limits: "0–80 kW",
    frequencyHz: 50
  },
  MT: {
    label: "Medium tension",
    voltage: "11 kV",
    limits: ">50 kW–5 MW",
    frequencyHz: 50
  },
  HT: {
    label: "High tension",
    voltage: "33 kV",
    limits: ">5–30 MW",
    frequencyHz: 50
  },
  EHT: {
    label: "Extra high tension",
    voltage: "132 / 230 kV",
    limits: "20 MW+",
    frequencyHz: 50
  }
}
```

Display these values as information. Do not reject a user's load merely because it is outside the descriptive range.

### Residential tariffs

Configure the lifeline rate:

```js
residentialLifeline: { maxUnits: 50, rate: 4.63 }
```

Configure progressive slabs:

```js
residentialSlabs: [
  { min: 0,   max: 75,   rate: 5.26,  label: "0–75" },
  { min: 76,  max: 200,  rate: 8.50,  label: "76–200" },
  { min: 201, max: 300,  rate: 9.10,  label: "201–300" },
  { min: 301, max: 400,  rate: 9.62,  label: "301–400" },
  { min: 401, max: 600,  rate: 15.01, label: "401–600" },
  { min: 601, max: null, rate: 17.35, label: "601+" }
]
```

`null` marks the open-ended maximum. Convert it to `Infinity` in the calculation adapter rather than storing `Infinity` in config.

### Category object schema

Every category must contain:

```js
{
  level: "LT" | "MT" | "HT" | "EHT",
  code: "tariff code",
  icon: "serializable icon name",
  name: { en: "English name", bn: "Bangla name" },
  detail: { en: "English description", bn: "Bangla description" },
  demandRate: number,
  type: "slab" | "flat" | "tou",
  rates: {
    flat: number,
    offPeak: number,
    superOffPeak: number,
    peak: number
  }
}
```

Omit `rates` for the residential slab category. Omit any rate period that does not apply.

### Complete category dataset

Implement all of the following. Energy rates are taka per kWh and demand rates are taka per kW per month.

| Key | Level | Code | English name | Bangla name | Icon | Type | Flat | Off-peak | Super off-peak | Peak | Demand |
| --- | --- | --- | --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: |
| `residential` | LT | LT-A | Residential | আবাসিক | house | slab | — | — | — | — | 42 |
| `agriculture` | LT | LT-B | Agriculture | সেচ / কৃষিকাজ | sprout | flat | 6.04 | — | — | — | 42 |
| `smallIndustry` | LT | LT-C1 | Small industry | ক্ষুদ্র শিল্প | factory | tou | 12.73 | 11.45 | — | 15.27 | 48 |
| `construction` | LT | LT-C2 | Construction | নির্মাণ | building | flat | 18.09 | — | — | — | 120 |
| `institution` | LT | LT-D1 | Institution | প্রতিষ্ঠান | education | flat | 9.05 | — | — | — | 60 |
| `publicService` | LT | LT-D2 | Public service | জনসেবা | light | flat | 11.46 | — | — | — | 90 |
| `charging` | LT | LT-D3 | EV charging | ইভি চার্জিং | charging | tou | 11.36 | 10.22 | 9.09 | 14.20 | 90 |
| `commercial` | LT | LT-E | Commercial | বাণিজ্যিক | building | tou | 15.36 | 13.82 | — | 18.43 | 90 |
| `temporary` | LT | LT-T | Temporary | অস্থায়ী | zap | flat | 23.81 | — | — | — | 120 |
| `mtResidential` | MT | MT-1 | Residential | আবাসিক | house | tou | 12.50 | 11.25 | — | 15.62 | 90 |
| `mtCommercial` | MT | MT-2 | Commercial & office | বাণিজ্যিক ও অফিস | building | tou | 13.93 | 12.54 | — | 17.41 | 90 |
| `mtIndustry` | MT | MT-3 | Industry | শিল্প | factory | tou | 12.85 | 11.56 | — | 16.06 | 90 |
| `mtConstruction` | MT | MT-4 | Construction | নির্মাণ | building | tou | 17.16 | 15.44 | — | 21.45 | 120 |
| `mtGeneral` | MT | MT-5 | General | সাধারণ | activity | tou | 12.58 | 11.32 | — | 15.72 | 90 |
| `mtTemporary` | MT | MT-6 | Temporary | অস্থায়ী | zap | flat | 22.56 | — | — | — | 120 |
| `mtCharging` | MT | MT-7 | EV charging | ইভি চার্জিং | charging | tou | 11.31 | 10.18 | 9.05 | 14.14 | 90 |
| `mtAgriculture` | MT | MT-8 | Agriculture | সেচ / কৃষিকাজ | sprout | tou | 7.38 | 6.64 | — | 9.23 | 90 |
| `htGeneral` | HT | HT-1 | General | সাধারণ | activity | tou | 12.54 | 11.28 | — | 15.67 | 90 |
| `htCommercial` | HT | HT-2 | Commercial & office | বাণিজ্যিক ও অফিস | building | tou | 13.64 | 12.28 | — | 17.05 | 90 |
| `htIndustry` | HT | HT-3 | Industry | শিল্প | factory | tou | 12.75 | 11.47 | — | 15.93 | 90 |
| `htConstruction` | HT | HT-4 | Construction | নির্মাণ | building | tou | 15.96 | 14.36 | — | 19.95 | 90 |
| `ehtGeneral1` | EHT | EHT-1 | General | সাধারণ | activity | tou | 12.66 | 11.39 | — | 15.82 | 90 |
| `ehtGeneral2` | EHT | EHT-2 | General | সাধারণ | activity | tou | 12.61 | 11.35 | — | 15.76 | 90 |

Add useful bilingual category details. Use these English meanings:

- Residential LT: Homes & apartments
- Agriculture LT: Irrigation pumps
- Small industry: Flat or time-of-use
- Construction LT: Construction supply
- Institution: Education, charity & hospital
- Public service: Street lights & water pumps
- EV charging: EV & battery stations
- Commercial LT: Business & offices
- Temporary LT: Temporary connections
- MT entries: identify the corresponding 11 kV supply
- HT entries: identify the corresponding 33 kV supply
- EHT-1: 132/230 kV, up to 140 MW
- EHT-2: 132/230 kV, above 140 MW

## 6. Application data adapters

In `main.jsx`:

1. Import `TARIFF_CONFIG`.
2. Import suitable Lucide components.
3. Create `iconMap` for `activity`, `building`, `charging`, `education`, `factory`, `house`, `light`, `sprout`, and `zap`.
4. Create an adapted `categories` object that replaces each config icon string with its React component.
5. Convert residential slab `max: null` to `Infinity` in an adapted array.
6. Create short aliases for the source URL, residential lifeline, voltage information, and billing rules.

Do not mutate `TARIFF_CONFIG`.

## 7. Localization requirements

Create one `copy` object in `main.jsx` with matching `en` and `bn` keys. Every important consumer-facing phrase must be bilingual, including:

- official source and language toggle;
- headline and introduction;
- effective month;
- bill calculator and consumer category;
- supply voltage;
- view all/show fewer categories;
- energy consumption;
- direct units and meter-reading modes;
- current/previous reading;
- monthly units and sanctioned load;
- flat and time-of-use metering;
- off-peak, super off-peak, and peak units;
- bill adjustments;
- old-meter/unit adjustment and negative-credit hint;
- reactive consumption and kVARh hint;
- calculated power factor and formula;
- power-factor surcharge and explanation;
- transformer loss, rent, and toggle;
- meter/service charge;
- VAT and current principal;
- late payment and after-due language;
- reset;
- energy, demand, total, and result headings;
- formula and usage-insight text;
- lifeline, next slab, highest slab, flat, and ToU insights;
- tariff table and demand/voltage facts;
- FAQ questions and answers;
- invalid meter reading error;
- independent-estimate disclaimer; and
- footer message.

Use natural Bangla. At minimum the main headline should communicate “Know your bill before it arrives,” and the disclaimer must make it clear that this is not an official DPDC bill.

Use `Intl.NumberFormat` with `en-BD` and `bn-BD` so the number system changes with language. The currency formatter must use BDT, display `৳`, and always show two decimal places.

## 8. Required functions and components

Implement these named functions/components in `src/main.jsx`:

### `formatMoney(value, lang = "en")`

- Use `Intl.NumberFormat`.
- Select `bn-BD` for Bangla and `en-BD` otherwise.
- Use BDT currency style.
- Show exactly two decimal places.
- Treat a missing/falsy numeric value as zero.
- Replace `BDT` text with `৳` if needed.

### `formatNumber(value, lang = "en", digits = 0)`

- Use the appropriate Bangladesh locale.
- Treat missing/falsy values as zero.
- Use `digits` as `maximumFractionDigits`.

### `calculateResidential(units)`

Make this a pure helper returning:

```js
{
  total: number,
  rows: [
    { label, units, rate, amount }
  ]
}
```

Rules:

- zero or negative units return `{ total: 0, rows: [] }`;
- at or below 50 kWh, apply the lifeline rate to every unit;
- above 50 kWh, do not use the lifeline rate;
- allocate units progressively through each slab;
- charge only the units inside each slab at that slab's rate;
- include each occupied slab in `rows`.

### `NumberInput(props)`

Create a reusable controlled field accepting:

- `label`;
- string `value`;
- `onChange` callback receiving the raw string;
- `suffix`;
- optional `hint`;
- optional `min`, defaulting to zero; and
- optional `error`.

Use `type="number"`, `step="any"`, and `inputMode="decimal"`. Place the suffix inside the styled input shell. Render hint and error only when supplied.

### `CategoryPicker(props)`

Accept `active`, `onSelect`, `lang`, `t`, `level`, and `onLevelChange`.

- Render four voltage tabs.
- Filter categories by the selected voltage level.
- Initially show only the first three category cards.
- If more than three exist, offer view-all/show-fewer behavior.
- Own a local `expanded` boolean.
- Collapse the expanded list when voltage changes.
- Show localized name/detail, code, icon, and selected checkmark.
- Add `aria-pressed` to category buttons.

### `BreakdownRow(props)`

Accept `icon`, `label`, optional `detail`, formatted `value`, and optional `strong`. It must render one presentational charge line and emphasize the total when `strong` is true.

### `App()`

This root component owns state, derives normalized values, performs the memoized bill calculation, produces the usage insight, handles reset, and renders the whole page.

Mount it with `createRoot` inside `React.StrictMode`.

## 9. Exact state defaults

Use controlled state with these defaults:

```js
lang = "en"
categoryKey = "residential"
entryMode = "units"
billingMode = "flat"
unitsInput = "275"
currentReading = "12450"
previousReading = "12175"
loadInput = "3"
meterChargeInput = "40"
unitAdjustmentInput = "0"
reactiveUnitsInput = "0"
transformerRentInput = "0"
includeTransformerLoss = false
includeVat = true
includeLatePayment = false
showAdjustments = false
touUnits = {
  offPeak: "180",
  superOffPeak: "0",
  peak: "95"
}
openFaq = 0
```

Keep editable numeric values as strings in state and convert them only for derived calculations. This allows controlled inputs to remain empty while being edited.

The Reset action must restore all calculator state shown above except language and FAQ state.

## 10. Input and mode behavior

Implement these rules exactly:

- `readingInvalid` is true only when entry mode is `reading` and current reading is lower than previous reading.
- In reading mode, `directUnits = max(0, current − previous)`.
- In direct mode, `directUnits = max(0, unitsInput)`.
- `unitAdjustment` is signed and can be negative.
- Flat-mode billed units are `max(0, directUnits + unitAdjustment)`.
- Clamp load, meter charge, reactive units, transformer rent, and each ToU register to zero or above for calculation.
- Sum non-negative ToU register values as `timeOfUseUnits`.
- For a ToU-capable category in ToU mode, `totalUnits = timeOfUseUnits`.
- Hide and do not apply the unit adjustment in ToU mode.
- When changing category or voltage level, reset billing mode to `flat`.
- When changing voltage, select the first configured category in that voltage group.
- Show metering-method controls only for a category with `type: "tou"`.
- Show super off-peak input only if `category.rates.superOffPeak` is defined.
- In non-ToU mode, allow direct units or current/previous readings.
- Show an error under current reading when current is below previous.
- Results must update immediately without a Calculate button.

## 11. Exact bill calculation

Put the main bill calculation in a `useMemo` and keep itemized `energyRows`.

### Energy charge

If category type is `slab`, call `calculateResidential(totalUnits)`.

If category type is `tou` and billing mode is `tou`:

1. iterate through the ToU state entries;
2. keep only keys defined in `category.rates`;
3. clamp each used value to zero;
4. create rows `{ label, units, rate, amount }`; and
5. sum their amounts.

Otherwise:

```text
energyCharge = totalUnits × category.rates.flat
```

Create one `flat` energy row.

### Demand

```text
demandCharge = nonNegativeLoadKw × category.demandRate
```

### Power factor

Power factor must be derived automatically from monthly active and reactive energy. Never ask the user to enter PF directly.

Use raw metered active energy:

```text
pfEnergyUnits = timeOfUseUnits in ToU mode, otherwise directUnits
reactiveUnits = max(0, entered kVARh)
```

Do not include the signed unit adjustment in PF energy.

Calculate:

```text
if pfEnergyUnits > 0:
    powerFactor = pfEnergyUnits / sqrt(pfEnergyUnits² + reactiveUnits²)
else:
    powerFactor = 1
```

### Power-factor surcharge

If `powerFactor >= threshold`, steps are zero.

Otherwise:

```js
pfSteps = Math.ceil(
  (threshold - powerFactor) / pointSize - 0.000001
);
pfSurchargeRate = pfSteps * surchargePerPoint;
pfSurcharge = energyCharge * pfSurchargeRate;
```

The `0.000001` tolerance is required to avoid floating-point over-counting at exact boundaries.

Show the complete PF derivation and surcharge derivation in the visible formula area:

```text
kWh ÷ √(kWh² + kVARh²) = PF
max(0, 0.95 − PF) ÷ 0.01 = step count
step count × 0.75% = surcharge rate
energy charge × surcharge rate = PF surcharge
```

### Transformer loss

When enabled:

```text
transformerLossUnitCount = totalUnits × 4%
transformerLossCharge = energyCharge × 4%
```

This method preserves the effective rate mix for slabs and each ToU period. Show equivalent loss kWh, percentage, and taka charge in the results and formula. When disabled, both values are zero and the breakdown row is hidden.

Transformer rent is a separate fixed taka input and must not be multiplied by units.

### Principal, VAT, and late payment

Use this exact order:

```text
principal =
    energyCharge
  + demandCharge
  + transformerLossCharge
  + transformerRent
  + meterCharge
  + pfSurcharge

vat = includeVat ? principal × vatRate : 0
currentTotal = principal + vat
latePaymentCharge = principal × latePaymentRate
afterDueTotal = currentTotal + latePaymentCharge
total = currentTotal + (includeLatePayment ? latePaymentCharge : 0)
```

Late payment is calculated from principal, not principal plus VAT.

Return from the calculation memo:

```js
{
  energyCharge,
  energyRows,
  demandCharge,
  transformerLossCharge,
  transformerLossUnitCount,
  pfSteps,
  pfSurcharge,
  pfSurchargeRate,
  principal,
  vat,
  currentTotal,
  latePaymentCharge,
  afterDueTotal,
  total
}
```

Keep every calculation dependency in the `useMemo` dependency list.

## 12. Usage insight behavior

Create a second `useMemo` for explanatory insight only.

- For a non-residential category, return `tou` when ToU mode is active, otherwise `flat`.
- At or below the residential lifeline limit, return `lifeline`.
- In a finite residential slab, return `remaining` with the units left before its maximum.
- In the final residential slab, return `highest`.

Also derive an `activeSlabIndex` for highlighting the current residential tariff row. Use `-1` during lifeline usage.

## 13. Page content and interaction design

Build the page in this order.

### Header

- Billwise brand with an electricity/activity icon.
- Small subtitle: “DPDC tariff calculator”.
- Official-source link with status dot and external-link icon.
- English/Bangla toggle.
- Sticky behavior is not required.

### Hero

- Dark forest-green rounded panel.
- Eyebrow about making electricity understandable.
- Large editorial heading: “Know your bill before it arrives.”
- Use an italic serif treatment for the second line to create visual contrast.
- Short explanation mentioning LT, MT, HT, EHT and itemized charges.
- Effective-month pill sourced from config.
- On desktop, add a decorative energy orb made with CSS circles, subtle orbit nodes, and a lightning icon. Hide it on smaller screens.

### Calculator shell

Create a prominent card overlapping the bottom of the hero. It has two main columns on desktop:

- light form panel on the left;
- dark results panel on the right.

Stack them on mobile.

The form panel must contain:

1. section heading “Bill calculator”;
2. voltage tabs and category picker;
3. flat/ToU segmented control when applicable;
4. energy input mode and fields;
5. sanctioned-load input;
6. a collapsible “Bill adjustments” section; and
7. a lightweight Reset estimate action.

The adjustment section must contain:

- signed old-meter/unit adjustment except in ToU mode;
- monthly kVARh;
- a calculated PF panel that turns amber when below threshold;
- transformer-loss toggle showing the configured 4%;
- transformer-rent input;
- meter/service input;
- VAT toggle showing the configured percentage; and
- after-due toggle showing the configured late percentage.

### Results panel

Add `aria-live="polite"` and display:

- selected tariff code;
- total kWh and sanctioned kW;
- large estimated monthly total;
- approximate daily total as `total / 30`;
- energy charge;
- demand charge with `load × demand rate` detail;
- transformer loss only when nonzero;
- transformer rent only when nonzero;
- PF surcharge only when nonzero;
- meter/service charge;
- VAT, showing zero when excluded;
- late payment only when enabled; and
- a visually emphasized total row.

Below the charge list, create an open-by-default `<details>` formula panel. It must list every energy row and show exact input × rate = amount arithmetic. Always show the PF formula and PF surcharge steps. Show transformer-loss arithmetic only when enabled.

Add a green-lime insight card and an independent-estimate disclaimer with an info icon.

### Tariff reference section

Below the calculator, show:

- selected category code, name, and “Tariff guide” heading;
- an official-source link;
- for residential: lifeline row plus all progressive slabs;
- for non-residential: all configured flat/ToU rate rows;
- the units assigned to an active calculated row where applicable;
- visual highlighting for the current slab or rate mode;
- demand rate per kW per month;
- voltage and 50 Hz fact; and
- configured load limit, category code, and detail.

### FAQ

Create a three-question accordion, one item open at a time:

1. Why might my actual bill differ?
2. What is sanctioned load?
3. How do residential slabs work?

Explain that account-specific rent, arrears, adjustments, rebates, PF penalties, and billing-period differences may change the official bill; sanctioned load is the approved maximum in kW; and progressive bands apply higher rates only to units inside that band.

### Footer

- Repeat Billwise branding.
- Show the localized consumer-focused footer sentence.
- Show “Tariff data checked” and `checkedOn`.
- Link to the official DPDC tariff schedule.

## 14. Visual specification

Create a modern editorial-fintech appearance, not a generic dashboard.

Use these CSS design tokens:

```css
:root {
  color: #173429;
  background: #f4f2e9;
  --forest: #11382b;
  --forest-2: #194d3b;
  --green: #23a66d;
  --green-light: #c8f169;
  --ink: #173429;
  --muted: #698078;
  --line: #d9ded5;
  --paper: #fbfaf5;
  --white: #ffffff;
  --amber: #f4b942;
  --shadow: 0 18px 60px rgba(22, 53, 42, 0.1);
}
```

Typography:

- Import DM Sans weights 400, 500, 600, and 700.
- Import Noto Sans Bengali weights 400, 500, 600, and 700.
- Use DM Sans by default.
- Use Noto Sans Bengali first when the root app language is Bangla.
- Use an available serif fallback for the italic hero accent.

General style:

- warm paper background with a very subtle 42 px grid;
- dark green hero and result surfaces;
- lime accent used sparingly for selected or important elements;
- rounded cards and controls;
- restrained 1 px borders and soft shadows;
- compact uppercase/letter-spaced section markers such as 01, 02, and 03;
- clear hierarchy and generous whitespace;
- input values large and bold;
- smooth 160 ms transitions;
- no gradients that make text hard to read;
- no stock images are needed.

Desktop layout targets:

- main/header maximum width around 1180 px;
- hero as text plus decorative visual;
- calculator overlap around 60 px;
- calculator columns approximately 60/40;
- category grid with three columns;
- inputs generally in two columns.

Responsive breakpoints:

- near `1000px`: narrow padding, two-column category grid;
- near `780px`: stack calculator/results, hide hero visual, stack tariff layout and footer;
- near `520px`: single-column category and input grids, simplify tariff table to two visible columns.

Support a minimum page width of 320 px without horizontal overflow.

## 15. Accessibility requirements

Implement:

- semantic headings and sections;
- visible `:focus-visible` outlines for buttons, links, inputs, and details summary;
- actual labels for every number input;
- `aria-label` for voltage navigation and utility navigation;
- `aria-pressed` on category choices;
- `aria-expanded` on adjustments and FAQ controls;
- `aria-live="polite"` on results;
- decorative visuals marked `aria-hidden="true"`;
- sufficient text/background contrast;
- keyboard-operable controls; and
- a `prefers-reduced-motion: reduce` block that effectively disables animation, smooth scrolling, and transitions.

Do not hide the native checkbox in a way that prevents keyboard focus. A visually styled toggle is acceptable if the associated label remains operable.

## 16. HTML metadata

Set:

- language to English in the document shell;
- UTF-8 charset;
- responsive viewport;
- theme color `#12372a`;
- title `Billwise — DPDC tariff calculator`;
- a concise description mentioning an official June 2026 DPDC tariff estimate; and
- Open Graph title and description.

The body must contain `<div id="root"></div>` and load `/src/main.jsx` as a module.

## 17. ESLint configuration

Use ESLint flat config with:

- `@eslint/js` recommended;
- React flat recommended and JSX runtime configs;
- React hooks recommended;
- React refresh Vite config;
- browser globals;
- ECMAScript 2022/latest module parsing;
- React version detection;
- `react/prop-types` disabled;
- `react-refresh/only-export-components` disabled; and
- ignore patterns for `dist`, `CMS __ DPDC*`, and `CMS __ DPDC*_files/**`.

## 18. Required calculation checks

Verify at least these cases manually or with a temporary script. Do not leave temporary test files unless you intentionally add a proper test setup.

### Default residential example

For 275 kWh, 3 kW sanctioned load, ৳40 meter charge, VAT enabled, and all other adjustments disabled:

```text
75 × 5.26   = 394.50
125 × 8.50  = 1,062.50
75 × 9.10   = 682.50
energy      = 2,139.50
demand      = 3 × 42 = 126.00
meter       = 40.00
principal   = 2,305.50
VAT         = 115.275
total       = 2,420.775
display     = ৳2,420.78
```

### Other important checks

- 0 residential kWh produces zero energy charge.
- 50 residential kWh uses 4.63 for all units.
- 51 residential kWh uses progressive slabs, not the lifeline rate.
- Current reading below previous shows an error and derives zero direct units.
- A negative unit adjustment can reduce billed units but never below zero.
- ToU totals equal the sum of the visible applicable registers.
- EV charging categories display and calculate super off-peak.
- kWh greater than zero with zero kVARh produces PF 1 and no surcharge.
- PF exactly 0.95 produces zero surcharge steps.
- PF 0.93 produces two surcharge steps and a 1.50% energy surcharge.
- 800 kWh and 600 kVARh produce PF 0.8, 15 steps, and an 11.25% energy surcharge.
- Transformer loss displays 4% of units and 4% of the energy charge.
- Transformer rent is added as a fixed principal item.
- VAT off makes VAT zero.
- Late payment on adds 5% of principal after current total is formed.
- Language toggling changes labels and number formatting without resetting the calculator.

## 19. Quality and production requirements

- Keep the implementation concise and understandable.
- Do not use `dangerouslySetInnerHTML`.
- Do not embed secrets.
- Require only `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`; never expose a secret or service-role key.
- Do not fetch tariff data at runtime.
- Do not hard-code tariff rates outside `TARIFF_CONFIG`.
- Do not use placeholder text or unfinished TODOs.
- Do not add a Calculate button; calculations are reactive.
- Do not use browser alerts for validation.
- Do not add sample-bill validation.
- Ensure every configured category can be selected.
- Ensure all optional charges are understandable in the visible formula or breakdown.
- Preserve full numeric precision internally and round only during formatting.
- Avoid mutating React state or config objects.
- Ensure lists have stable keys and controls have explicit `type="button"` where relevant.

## 20. Completion procedure

After implementing:

1. install dependencies if necessary;
2. run `npm run lint`;
3. run `npm run build`;
4. fix all application errors;
5. confirm the optimized bundle is created in `dist`;
6. if browser inspection is available, open the app and verify desktop and mobile layouts plus several calculations; and
7. verify the missing-environment setup state, login/signup switching, cooldown UI, password recovery, protected calculator, and sign-out behavior; and
8. report the created files, key functionality, and verification results.

The task is complete only when the full working application exists in the directory and both lint and production build succeed.

## 21. Hosted authentication system

Protect the entire calculator with Supabase email/password authentication. Create a free-tier-ready implementation, but do not attempt to create a third-party account on the user's behalf.

Required behavior:

- use `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`;
- if either value is missing, show a clear setup screen and do not render the calculator;
- configure the browser client with persistent session, automatic token refresh, and auth callback detection;
- create exactly one auth-state subscription and unsubscribe on cleanup;
- support sign in, account creation, email confirmation, forgot-password email, new-password callback, and local-session sign out;
- require at least 10 password characters and a matching confirmation during signup/reset;
- normalize email with trim and lowercase;
- keep provider errors safe and user-friendly, with a generic invalid-credentials message;
- never reveal whether a recovery email belongs to an existing account;
- show the authenticated email and a sign-out button in the application header;
- retain calculator protection during session restoration;
- use an open, modern auth card that visually matches the forest/lime Billwise design;
- make auth forms keyboard accessible with labels, autocomplete values, alerts, busy states, and password visibility controls.

Add client cooldowns stored in local storage so page refresh does not immediately repeat an action:

```text
sign in:         3 seconds
signup email:   60 seconds
recovery email: 60 seconds
password update: 5 seconds
```

Start a cooldown before sending the request, disable duplicate submission, display remaining seconds, and extend to 60 seconds after a provider rate-limit response. Treat status 429, rate-limit codes, and matching messages as rate limiting. The client cooldown is only a usability measure; Supabase's server-side limits remain authoritative.

Create `.env.example` with placeholders and `.gitignore` rules for real environment files. Create `AUTH_SETUP.md` explaining free-project creation, Email provider/email confirmation, Site URL and redirect allowlist, publishable-key safety, custom SMTP for production, provider rate-limit settings, and the need for RLS if database tables are later added.

---

End of prompt.
