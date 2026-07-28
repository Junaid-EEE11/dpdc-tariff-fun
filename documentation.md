# Billwise DPDC Tariff Calculator — Technical Documentation

## 1. Purpose

Billwise is a consumer-facing, browser-based electricity bill estimator for Dhaka Power Distribution Company Limited (DPDC) retail tariffs. It supports all configured low-, medium-, high-, and extra-high-tension consumer categories and explains the estimated bill as a set of visible charge components.

The application can calculate:

- progressive residential energy charges;
- flat-rate energy charges;
- time-of-use (off-peak, super off-peak, and peak) charges;
- demand charges from sanctioned load;
- power factor from monthly kWh and kVARh;
- a power-factor surcharge when PF is below the configured threshold;
- optional transformer loss and transformer rent;
- meter or service charges;
- optional VAT; and
- optional late-payment surcharge.

The current configuration is based on the DPDC tariff source recorded in `src/tariffConfig.js`:

- Authority: Dhaka Power Distribution Company Limited (DPDC)
- Official source: <https://dpdc.gov.bd/pages/static-pages/6922de6f933eb65569e1a9c4>
- Effective bill month: June 2026 (`2026-06`)
- Data checked: July 28, 2026 (`2026-07-28`)
- Currency: Bangladeshi taka (`BDT`, displayed as `৳`)

> Billwise is an independent estimator. It does not generate an official DPDC bill, query a DPDC account, or replace the amount printed by DPDC.

## 2. Technology and runtime model

The project is a small React single-page application built by Vite.

| Technology | Version | Purpose |
| --- | ---: | --- |
| React | 19.2.8 | Components, state, and reactive rendering |
| React DOM | 19.2.8 | Mounts the application in the browser |
| Vite | 6.1.0 | Development server and production bundling |
| Lucide React | 1.27.0 | Interface icons |
| Supabase JavaScript | 2.78.0 | Hosted email/password authentication and sessions |
| ESLint | 9.39.2 | Static code checks |

Tariff calculation remains entirely client-side and has no custom backend or application database. Authentication is delegated to a configured Supabase project. Supabase stores login records and the browser client persists the signed-in session locally; tariff inputs remain in React state and reset to their defaults when the page is reloaded.

The only normal external browser requests are:

- Google Fonts, imported from `src/styles.css`; and
- Supabase Auth, for session restoration and explicit account actions; and
- the DPDC page, only when the user follows an official-source link.

## 3. Project layout

```text
tariff-app/
├── .env.example             # Public Supabase environment variable template
├── .gitignore               # Excludes credentials, dependencies, and builds
├── AUTH_SETUP.md            # Supabase project and production-security setup
├── documentation.md        # This document
├── index.html              # HTML shell, metadata, and React mount point
├── package.json            # Dependencies and npm commands
├── package-lock.json        # Reproducible dependency versions
├── eslint.config.js         # ESLint rules and archived-file exclusions
├── vite.config.js           # React JSX transform and Fast Refresh plugin
└── src/
    ├── auth/
    │   ├── AuthContext.jsx  # Single auth subscription and account actions
    │   ├── AuthGate.jsx     # Setup, login, signup, recovery, and protected gate
    │   ├── auth.css         # Authentication interface styling
    │   ├── rateLimit.js     # Client cooldowns and safe error mapping
    │   └── supabaseClient.js # Public client creation and redirect URL
    ├── main.jsx             # UI, state, calculations, and rendering
    ├── styles.css           # Visual system and responsive layouts
    └── tariffConfig.js      # Single source of truth for tariff inputs
```

The repository also contains archived copies of DPDC bill pages named `CMS __ DPDC...`. They are reference artifacts only. They are excluded from linting and are not imported by the application.

## 4. Running the application

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Before authentication can run, copy `.env.example` to `.env`, add the Supabase project URL and publishable key, and configure the project's allowed redirect URLs. See `AUTH_SETUP.md`. Without these values the app intentionally renders a setup screen instead of exposing the calculator.

Create an optimized production bundle:

```bash
npm run build
```

Preview the production bundle locally:

```bash
npm run preview
```

Run static checks:

```bash
npm run lint
```

The production build is written to `dist/`. Deploy that directory to any static host. Because the app has one page and no client-side route hierarchy, it does not require special route-rewrite rules.

## 5. Application architecture

The data flows in one direction:

```text
environment configuration
        ▼
Supabase browser client
        ▼
AuthProvider → AuthGate
        │
        ├── setup/login/signup/recovery when no valid user session exists
        └── protected calculator when a session exists
        ▼
src/tariffConfig.js
        │
        ├── tariff categories, rates, slabs, and billing rules
        ▼
src/main.jsx module adapters
        │
        ├── icon names become Lucide components
        └── open-ended slab max becomes Infinity
        ▼
React input state in App
        │
        ├── normalized numeric inputs
        ├── selected category and meter mode
        └── enabled bill adjustments
        ▼
derived usage and power factor
        ▼
calculation useMemo
        │
        ├── energy
        ├── demand
        ├── transformer loss/rent
        ├── PF surcharge
        ├── meter/service
        ├── VAT
        └── late-payment surcharge
        ▼
results panel, formula explanation, tariff table, and usage insight
```

`src/tariffConfig.js` owns tariff policy. `src/main.jsx` owns calculation behavior and presentation. `src/styles.css` owns layout and appearance.

## 6. Configuration reference (`src/tariffConfig.js`)

`TARIFF_CONFIG` is the application's single tariff-data export. Tariff values should be changed here, not duplicated in JSX.

### 6.1 `source`

| Field | Type | Meaning |
| --- | --- | --- |
| `authority` | string | Organization that published the tariff |
| `url` | string | Official reference linked throughout the UI |
| `effectiveBillMonth` | `YYYY-MM` string | Bill month shown in the hero section |
| `checkedOn` | `YYYY-MM-DD` string | Last tariff verification date shown in the footer |
| `currency` | string | Currency metadata; currently `BDT` |

### 6.2 `billingRules`

| Field | Current value | Meaning and use |
| --- | ---: | --- |
| `vatRate` | `0.05` | VAT is 5% of current principal when enabled |
| `latePaymentRate` | `0.05` | Late charge is 5% of current principal when enabled |
| `powerFactor.threshold` | `0.95` | PF below this level creates surcharge steps |
| `powerFactor.surchargePerPoint` | `0.0075` | Each PF step adds 0.75% of energy charge |
| `powerFactor.pointSize` | `0.01` | One PF step is a 0.01 shortfall |
| `powerFactor.formula` | formula string | Human-readable policy metadata |
| `powerFactor.surchargeBase` | `energyCharge` | Documents that the surcharge is based on energy charge |
| `transformerLoss.defaultRate` | `0.04` | Optional transformer loss is 4% |
| `transformerLoss.optional` | `true` | Documents that the user controls this charge |
| `transformerLoss.unitBasis` | `meteredEnergyByRatePeriod` | Documents that loss follows metered energy and its rates |
| `demandChargeBasis` | `sanctionedLoadKw` | Documents the demand-charge input basis |

The descriptive `formula`, `surchargeBase`, `optional`, `unitBasis`, and `demandChargeBasis` fields make the policy explicit. The current calculation directly reads the numeric rate and threshold fields.

### 6.3 `voltageLevels`

Each voltage key provides a human-readable `label`, nominal `voltage`, indicative `limits`, and `frequencyHz`.

| Key | Label | Voltage | Configured limit | Frequency |
| --- | --- | --- | --- | ---: |
| `LT` | Low tension | 230 / 400 V | 0–80 kW | 50 Hz |
| `MT` | Medium tension | 11 kV | >50 kW–5 MW | 50 Hz |
| `HT` | High tension | 33 kV | >5–30 MW | 50 Hz |
| `EHT` | Extra high tension | 132 / 230 kV | 20 MW+ | 50 Hz |

These values inform the category selector and tariff facts. The app does not enforce the limits against the entered load.

### 6.4 Residential slab configuration

`residentialLifeline` applies one rate to all consumption when monthly billed units are at or below the lifeline maximum:

```js
{ maxUnits: 50, rate: 4.63 }
```

Above 50 units, `residentialSlabs` are progressive:

| Band | Rate (৳/kWh) |
| --- | ---: |
| 0–75 | 5.26 |
| 76–200 | 8.50 |
| 201–300 | 9.10 |
| 301–400 | 9.62 |
| 401–600 | 15.01 |
| 601+ | 17.35 |

`max: null` marks the open-ended final band. `main.jsx` converts it to JavaScript `Infinity` before calculation.

### 6.5 Consumer category schema

Every entry in `categories` uses this shape:

```js
categoryKey: {
  level: "LT" | "MT" | "HT" | "EHT",
  code: "official tariff code",
  icon: "iconMap key",
  name: { en: "English name", bn: "বাংলা নাম" },
  detail: { en: "English detail", bn: "বাংলা বিবরণ" },
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

- `slab` uses `residentialSlabs` and does not need `rates`.
- `flat` uses `rates.flat`.
- `tou` always offers `rates.flat` and can also use `offPeak`, `peak`, and optional `superOffPeak` when time-of-use mode is selected.
- `demandRate` is in taka per kW per month.
- The icon string must exist in `iconMap` in `main.jsx`.

### 6.6 Configured categories and rates

All numbers below are taka per kWh except demand, which is taka per kW per month.

| Level | Code | Category | Type | Flat | Off-peak | Super off-peak | Peak | Demand |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: |
| LT | LT-A | Residential | Slab | — | — | — | — | 42 |
| LT | LT-B | Agriculture | Flat | 6.04 | — | — | — | 42 |
| LT | LT-C1 | Small industry | ToU | 12.73 | 11.45 | — | 15.27 | 48 |
| LT | LT-C2 | Construction | Flat | 18.09 | — | — | — | 120 |
| LT | LT-D1 | Institution | Flat | 9.05 | — | — | — | 60 |
| LT | LT-D2 | Public service | Flat | 11.46 | — | — | — | 90 |
| LT | LT-D3 | EV charging | ToU | 11.36 | 10.22 | 9.09 | 14.20 | 90 |
| LT | LT-E | Commercial | ToU | 15.36 | 13.82 | — | 18.43 | 90 |
| LT | LT-T | Temporary | Flat | 23.81 | — | — | — | 120 |
| MT | MT-1 | Residential | ToU | 12.50 | 11.25 | — | 15.62 | 90 |
| MT | MT-2 | Commercial & office | ToU | 13.93 | 12.54 | — | 17.41 | 90 |
| MT | MT-3 | Industry | ToU | 12.85 | 11.56 | — | 16.06 | 90 |
| MT | MT-4 | Construction | ToU | 17.16 | 15.44 | — | 21.45 | 120 |
| MT | MT-5 | General | ToU | 12.58 | 11.32 | — | 15.72 | 90 |
| MT | MT-6 | Temporary | Flat | 22.56 | — | — | — | 120 |
| MT | MT-7 | EV charging | ToU | 11.31 | 10.18 | 9.05 | 14.14 | 90 |
| MT | MT-8 | Agriculture | ToU | 7.38 | 6.64 | — | 9.23 | 90 |
| HT | HT-1 | General | ToU | 12.54 | 11.28 | — | 15.67 | 90 |
| HT | HT-2 | Commercial & office | ToU | 13.64 | 12.28 | — | 17.05 | 90 |
| HT | HT-3 | Industry | ToU | 12.75 | 11.47 | — | 15.93 | 90 |
| HT | HT-4 | Construction | ToU | 15.96 | 14.36 | — | 19.95 | 90 |
| EHT | EHT-1 | General, up to 140 MW | ToU | 12.66 | 11.39 | — | 15.82 | 90 |
| EHT | EHT-2 | General, above 140 MW | ToU | 12.61 | 11.35 | — | 15.76 | 90 |

## 7. Input model and state

`App` stores editable values as strings. This is deliberate: a controlled numeric input must temporarily support an empty value while the user edits it. Values are converted with `Number(value || 0)` only when the calculator derives a result.

| State | Default | Purpose |
| --- | --- | --- |
| `lang` | `"en"` | Selects English or Bangla copy and number formatting |
| `categoryKey` | `"residential"` | Selects an entry from configured categories |
| `entryMode` | `"units"` | Chooses direct kWh or meter-reading difference |
| `billingMode` | `"flat"` | Chooses flat or ToU calculation for ToU-capable categories |
| `unitsInput` | `"275"` | Direct monthly kWh |
| `currentReading` | `"12450"` | Current cumulative meter reading |
| `previousReading` | `"12175"` | Previous cumulative meter reading |
| `loadInput` | `"3"` | Sanctioned load in kW |
| `meterChargeInput` | `"40"` | Meter/service charge in taka |
| `unitAdjustmentInput` | `"0"` | Signed old-meter or unit adjustment in kWh |
| `reactiveUnitsInput` | `"0"` | Monthly reactive energy in kVARh |
| `transformerRentInput` | `"0"` | Fixed transformer rent in taka |
| `includeTransformerLoss` | `false` | Enables configured transformer loss |
| `includeVat` | `true` | Enables VAT |
| `includeLatePayment` | `false` | Adds the after-due-date surcharge |
| `showAdjustments` | `false` | Opens or closes advanced adjustments |
| `touUnits.offPeak` | `"180"` | Off-peak monthly kWh |
| `touUnits.superOffPeak` | `"0"` | Super off-peak monthly kWh |
| `touUnits.peak` | `"95"` | Peak monthly kWh |
| `openFaq` | `0` | Index of the expanded FAQ; `-1` means none |

### Input normalization rules

- Direct units, ToU registers, sanctioned load, meter charge, reactive units, and transformer rent are clamped to zero or above during calculation.
- The old-meter/unit adjustment may be negative.
- In reading mode, `directUnits = max(0, currentReading - previousReading)`.
- If current reading is below previous reading, the input displays an error and calculated direct units become zero.
- ToU billed units are the sum of the applicable entered time registers.
- In flat mode, billed units are `max(0, directUnits + unitAdjustment)`.
- Unit adjustment is intentionally not included in the raw kWh used to calculate PF.
- Empty or non-numeric-looking empty state is treated as zero by the calculation.

## 8. Calculation pipeline

The calculator recomputes immediately whenever a relevant state value changes.

### 8.1 Select raw energy input

For direct entry:

```text
directUnits = max(0, entered monthly kWh)
```

For meter readings:

```text
directUnits = max(0, current reading − previous reading)
```

For time-of-use mode:

```text
timeOfUseUnits = Σ max(0, each register's kWh)
```

### 8.2 Determine billed units

```text
if category supports ToU and ToU mode is selected:
    totalUnits = timeOfUseUnits
else:
    totalUnits = max(0, directUnits + signed unit adjustment)
```

The signed adjustment is hidden in ToU mode and is not applied to ToU units.

### 8.3 Calculate energy charge

Residential lifeline:

```text
if totalUnits ≤ 50:
    energyCharge = totalUnits × ৳4.63
```

Residential progressive slabs above 50 units:

```text
energyCharge = Σ(units inside each occupied band × that band's rate)
```

Only the units inside a band use that band's rate. The highest reached rate is not applied to all units.

Flat category or flat mode:

```text
energyCharge = totalUnits × category.rates.flat
```

Time-of-use mode:

```text
energyCharge =
    offPeakUnits      × offPeakRate
  + superOffPeakUnits × superOffPeakRate   // only when configured
  + peakUnits         × peakRate
```

The calculator also creates `energyRows`. Each row records the period or slab label, units, rate, and amount. The results formula and tariff table render these same rows, so the explanation follows the calculated values.

### 8.4 Calculate sanctioned-load demand charge

```text
demandCharge = max(0, sanctionedLoadKw) × category.demandRate
```

The category demand rate comes from `TARIFF_CONFIG.categories`. The calculator does not infer load from energy usage and does not enforce voltage-level load limits.

### 8.5 Calculate monthly power factor

PF uses raw monthly active energy and reactive energy:

```text
PF = kWh / √(kWh² + kVARh²)
```

Where:

- `kWh` is `timeOfUseUnits` in ToU mode, otherwise `directUnits`;
- `kVARh` is the non-negative reactive-consumption input; and
- when kWh is zero, PF defaults to `1` to avoid division by zero.

The unit adjustment does not change PF because it is not a new raw monthly meter observation.

### 8.6 Calculate the PF surcharge

The configured threshold is 0.95. If PF is at or above the threshold, the number of surcharge steps is zero.

Below the threshold:

```text
pfSteps = ceil((0.95 − PF) / 0.01)
pfSurchargeRate = pfSteps × 0.0075
pfSurcharge = energyCharge × pfSurchargeRate
```

In percentage language, every full or partial 0.01 shortfall adds 0.75% of the energy charge. For example, PF 0.93 produces two steps and a 1.50% surcharge.

The code subtracts `0.000001` immediately before `Math.ceil`. This small tolerance prevents a mathematically exact boundary such as two steps from becoming three because of binary floating-point noise.

Example with `800 kWh` and `600 kVARh`:

```text
PF = 800 / √(800² + 600²) = 0.800
shortfall = 0.95 − 0.80 = 0.15
steps = ceil(0.15 / 0.01) = 15
surcharge rate = 15 × 0.75% = 11.25%
surcharge = energyCharge × 11.25%
```

### 8.7 Calculate optional transformer loss

When enabled:

```text
transformerLossUnitCount = totalUnits × 4%
transformerLossCharge = energyCharge × 4%
```

Multiplying the already period-rated energy charge by 4% preserves the underlying slab or ToU price mix. For a ToU customer, this is equivalent to taking 4% of each metered rate-period unit total and charging those loss units at that period's rate.

Transformer loss and transformer rent are independent:

- transformer loss is the configured percentage of energy;
- transformer rent is a fixed taka amount entered from the bill or agreement.

### 8.8 Build current principal

```text
principal =
    energyCharge
  + demandCharge
  + transformerLossCharge
  + transformerRent
  + meterCharge
  + pfSurcharge
```

### 8.9 Calculate VAT

When VAT is enabled:

```text
vat = principal × 5%
currentTotal = principal + vat
```

When disabled, VAT is zero and `currentTotal` equals principal.

### 8.10 Calculate late payment

```text
latePaymentCharge = principal × 5%
afterDueTotal = currentTotal + latePaymentCharge
```

The calculation always derives these values, but the displayed estimate adds the late-payment charge only when “Estimate payment after due date” is enabled:

```text
total = currentTotal + (includeLatePayment ? latePaymentCharge : 0)
```

The late charge is based on principal, not on principal plus VAT.

### 8.11 Default worked example

With the default state—residential, 275 kWh, 3 kW load, ৳40 meter charge, VAT on, and all other adjustments off:

```text
0–75:    75 × 5.26 = 394.50
76–200: 125 × 8.50 = 1,062.50
201–300: 75 × 9.10 = 682.50
energy charge              = 2,139.50
demand: 3 × 42             =   126.00
meter/service              =    40.00
principal                  = 2,305.50
VAT: 5%                    =   115.28 (display-rounded)
estimated current total    = ৳2,420.78
```

Internal arithmetic keeps JavaScript's full numeric precision. Currency is rounded to two decimal places only for display.

## 9. Function and component reference (`src/main.jsx`)

### 9.1 Module-level data adapters

#### `iconMap`

Maps serializable icon names from tariff configuration to imported Lucide React components. Keeping component objects out of the config makes tariff data easier to audit and edit.

#### `categories`

Uses `Object.entries`, `map`, and `Object.fromEntries` to clone every configured category and replace its icon string with the corresponding component from `iconMap`. The rest of the UI reads this adapted object.

#### `residentialSlabs`

Clones the configured slabs and changes a `null` maximum to `Infinity`. That lets comparisons and capacity calculations treat the last slab like an ordinary numeric range.

#### `SOURCE_URL`, `residentialLifeline`, `voltageInfo`, and `billingRules`

These are local aliases to frequently used configuration branches. They avoid repeated long property paths and do not copy or alter values.

#### `copy`

Contains all English (`en`) and Bangla (`bn`) interface strings. `App` selects `copy[lang]` as `t`, and components access text through keys such as `t.energy` or `t.powerFactor`. Tariff numbers do not live in this object.

### 9.2 `formatMoney(value, lang = "en")`

Formats a numeric value as BDT currency with exactly two decimal places.

Behavior:

1. Selects `bn-BD` for Bangla or `en-BD` for English.
2. Uses `Intl.NumberFormat` with currency style and `BDT`.
3. Treats a falsy value as zero.
4. Replaces the textual currency code `BDT` with `৳`.

Example result: `৳2,420.78` in English formatting. The function is for display only and does not change stored values.

### 9.3 `formatNumber(value, lang = "en", digits = 0)`

Formats a normal number using English or Bangla digits and grouping. `digits` is the maximum number of fractional digits. A falsy value displays as zero.

It is used for units, load, PF, percentages, and rates. It does not append a unit suffix.

### 9.4 `calculateResidential(units)`

Pure helper that calculates residential energy only. It has no React state and no side effects.

Return shape:

```js
{
  total: number,
  rows: Array<{
    label: string,
    units: number,
    rate: number,
    amount: number
  }>
}
```

Control flow:

1. At zero or below, return zero and no rows.
2. At or below the lifeline maximum, price every unit at the lifeline rate and return one row.
3. Otherwise, walk through the progressive slabs.
4. Determine each slab's capacity from its maximum and the previous maximum.
5. Allocate the smaller of remaining units or slab capacity.
6. Multiply allocated units by the slab rate, append a row, and subtract them from `remaining`.
7. Return the accumulated amount and itemized rows.

The input passed by `App` is already clamped to a non-negative value.

### 9.5 `NumberInput(props)`

Reusable controlled numeric-input component.

| Prop | Meaning |
| --- | --- |
| `label` | Text displayed above the control |
| `value` | Current string value from parent state |
| `onChange` | Receives the new raw input string |
| `suffix` | Unit displayed inside the field, such as `kWh`, `kW`, `kVARh`, or `৳` |
| `hint` | Optional helper text |
| `min` | HTML minimum; defaults to zero |
| `error` | Optional error message and error class |

The input uses `type="number"`, `step="any"`, and decimal input mode. It deliberately sends a string upward so editing remains smooth. The parent calculation performs numeric conversion and clamping.

### 9.6 `CategoryPicker(props)`

Renders voltage tabs and category cards.

| Prop | Meaning |
| --- | --- |
| `active` | Selected category key |
| `onSelect` | Called with a selected category key |
| `lang` | Selects localized category name and detail |
| `t` | Selected interface copy object |
| `level` | Active voltage level |
| `onLevelChange` | Called with `LT`, `MT`, `HT`, or `EHT` |

The component owns one local state value, `expanded`. It initially shows the first three categories for the selected voltage level. “View all categories” reveals the remaining entries. Changing voltage collapses the list and asks `App` to select the first category in the new level.

Category buttons use `aria-pressed`; voltage and category selection are therefore exposed to assistive technology.

### 9.7 `BreakdownRow(props)`

Renders one line in the results breakdown.

| Prop | Meaning |
| --- | --- |
| `icon` | Lucide component to render |
| `label` | Charge name |
| `detail` | Optional secondary calculation detail |
| `value` | Already formatted display amount |
| `strong` | Applies the emphasized total-row style |

The component is presentational and does not calculate or alter values.

### 9.8 `App()`

`App` is the root application component. It coordinates five concerns:

1. owns all calculator and UI state;
2. normalizes input strings into safe numeric values;
3. derives total usage and PF;
4. memoizes the bill and usage insight; and
5. renders the header, hero, calculator, results, tariff reference, FAQ, and footer.

Important derived values inside `App`:

| Value | Definition |
| --- | --- |
| `t` | Translation object for the active language |
| `category` | Selected adapted category |
| `readingInvalid` | True only when reading mode has current < previous |
| `directUnits` | Direct input or non-negative reading difference |
| `unitAdjustment` | Signed numeric unit adjustment |
| `timeOfUseUnits` | Sum of non-negative ToU register values |
| `totalUnits` | Units actually sent to energy pricing |
| `load` | Non-negative sanctioned load |
| `meterCharge` | Non-negative fixed meter/service amount |
| `transformerRent` | Non-negative fixed transformer amount |
| `pfEnergyUnits` | Raw active energy used in PF |
| `reactiveUnits` | Non-negative kVARh |
| `powerFactor` | Derived monthly PF, or 1 when kWh is zero |
| `activeSlabIndex` | Residential slab row highlighted in the tariff table |

#### `calculation` memo

The first `useMemo` is the bill engine. It follows the pipeline in section 8 and returns:

| Field | Meaning |
| --- | --- |
| `energyCharge` | Total slab, flat, or ToU energy amount |
| `energyRows` | Itemized units, rate, and amount used to build energy charge |
| `demandCharge` | Sanctioned-load charge |
| `transformerLossCharge` | Optional 4% energy amount |
| `transformerLossUnitCount` | Optional 4% equivalent kWh |
| `pfSteps` | Count of 0.01 PF shortfall steps |
| `pfSurchargeRate` | Decimal surcharge rate across all steps |
| `pfSurcharge` | Energy charge multiplied by surcharge rate |
| `principal` | Sum before VAT and late payment |
| `vat` | Optional VAT amount |
| `currentTotal` | Principal plus VAT |
| `latePaymentCharge` | Configured percentage of principal |
| `afterDueTotal` | Current total plus late charge |
| `total` | Currently selected payable estimate |

Its dependency list contains every state or derived object used by the calculation. React recomputes it when those dependencies change and reuses the last result otherwise.

#### `insight` memo

The second `useMemo` selects one consumer hint:

- `lifeline` when residential units are within the lifeline maximum;
- `remaining` with units left in the active residential band;
- `highest` in the final residential band;
- `tou` for a non-residential ToU calculation; or
- `flat` for a non-residential flat calculation.

This memo affects explanatory text only; it does not affect the bill.

#### `reset()`

Restores all calculator controls to the defaults listed in section 7. It does not change the current language or the open FAQ index. It also does not reload the page.

#### Inline interaction handlers

Small handlers are kept next to the control they operate:

- the language button toggles `en` and `bn`;
- category selection stores the category and resets billing mode to flat;
- voltage selection finds the first configured category in that level and resets billing mode to flat;
- entry and billing mode buttons store their selected mode;
- ToU input handlers replace only the edited register using object spread;
- adjustment, VAT, transformer-loss, and late-payment controls update booleans from checkbox state;
- FAQ buttons toggle the selected index, using `-1` to close the open answer.

### 9.9 React entry point

```jsx
createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

`index.html` supplies `<div id="root"></div>`. `createRoot` attaches React there. `React.StrictMode` enables additional development checks; it does not add visible production UI.

## 10. What each interface section does

### Header and hero

The header provides branding, the official tariff link, and language toggle. The hero identifies the calculator and reads the effective bill month from config.

### Consumer category

Voltage tabs filter the available category cards. Selecting a category immediately switches the rates, demand charge, tariff table, category facts, and available metering methods.

### Energy consumption

- `slab` and `flat` calculations allow direct units or current/previous readings.
- `tou` categories first allow flat versus time-of-use metering.
- ToU mode displays only the rate-period inputs configured for that category.
- Super off-peak appears only for categories whose rate object has `superOffPeak`.

### Bill adjustments

This collapsible section contains old-meter adjustment, reactive consumption, calculated PF, transformer loss, transformer rent, meter/service charge, VAT, and after-due estimation. The old-meter adjustment is omitted in ToU mode.

### Results panel

The panel is marked `aria-live="polite"`, so assistive technology can announce updated estimates without abruptly interrupting the user. It shows:

- selected tariff code, units, and load;
- estimated total and approximate 30-day daily cost;
- itemized charges that apply;
- exact energy and PF formulas;
- transformer-loss formula when enabled; and
- a contextual usage insight.

Rows with a zero optional amount are normally hidden. Meter/service, VAT, energy, demand, and total rows remain visible.

### Tariff reference

For residential users, the table shows lifeline and every progressive band and highlights the current band. For other categories, it lists configured flat and time-period rates and highlights the active method. Facts beside the table show demand rate, voltage, frequency, configured load limit, tariff code, and category description.

### FAQ and footer

The FAQ is a single-open-item accordion. The footer repeats the tariff verification date and official source link.

## 11. Internationalization

The app supports English and Bangla without an external i18n dependency.

- Interface copy lives in `copy.en` and `copy.bn`.
- Category names and descriptions live in each category's bilingual config fields.
- `lang="bn"` selects Noto Sans Bengali as the primary font.
- `Intl.NumberFormat` selects `en-BD` or `bn-BD` number formatting.
- Brand text, tariff codes, engineering units, and a few structural labels remain language-neutral or English.

When adding a copy key, add the same key to both language objects. Missing keys will render as blank or `undefined` text.

## 12. Styling, responsive behavior, and accessibility

`src/styles.css` defines colors as CSS custom properties in `:root`, uses a two-column desktop calculator, and progressively collapses the interface at three breakpoints:

| Breakpoint | Main behavior |
| ---: | --- |
| `1000px` | Narrows panels and changes category cards to two columns |
| `780px` | Stacks calculator and results; simplifies hero and footer |
| `520px` | Uses single-column forms/categories and simplifies tariff rows |

Accessibility measures include:

- visible `:focus-visible` outlines for links, buttons, inputs, and summaries;
- semantic labels wrapping number inputs;
- error text for invalid meter-reading order;
- `aria-pressed` on category choices;
- `aria-expanded` on collapsible controls;
- `aria-live="polite"` on results;
- decorative hero graphics hidden with `aria-hidden`; and
- `prefers-reduced-motion` rules that effectively disable animation and transitions.

The minimum supported layout width is 320 px.

## 13. Safely updating tariff data

When DPDC publishes a new schedule:

1. Open `src/tariffConfig.js`.
2. Update `source.url`, `effectiveBillMonth`, and `checkedOn`.
3. Update billing-rule percentages only if the published policy changed.
4. Update residential lifeline and slab entries.
5. Update category demand and energy rates.
6. Add, remove, or rename category entries as required.
7. Run `npm run lint` and `npm run build`.
8. Manually test at least one slab, flat, standard ToU, super-off-peak ToU, and low-PF case.
9. Compare the itemized formula output against a hand calculation before deployment.

Do not place a tariff rate directly in JSX. If a new numeric policy input is required, add it to `TARIFF_CONFIG.billingRules` and read it from there.

### Adding a category

1. Choose a unique JavaScript key under `categories`.
2. Add a valid voltage `level` and official `code`.
3. Add bilingual `name` and `detail` values.
4. Choose an existing `iconMap` string or import and map a new Lucide icon.
5. Add `demandRate`.
6. Choose `type` and provide the rates required for that type.
7. Verify it appears under the correct voltage tab and that flat/ToU controls behave correctly.

### Adding a new time period

The current UI and label logic explicitly understand `flat`, `offPeak`, `superOffPeak`, and `peak`. Adding another rate key requires all of the following:

1. a value in the category `rates` object;
2. a matching property in `touUnits` state and in `reset()`;
3. a localized label in both copy objects;
4. a `NumberInput` in the ToU input grid; and
5. label mapping in the formula and tariff-table rendering.

## 14. Verification checklist

Before release, run:

```bash
npm run lint
npm run build
```

Recommended manual cases:

| Case | Expected check |
| --- | --- |
| Residential 0 kWh | Zero energy, demand still follows entered load |
| Residential 50 kWh | All energy at lifeline rate |
| Residential 51 kWh | Progressive slab schedule replaces lifeline rate |
| Residential across 75/200/300/400/600 | Rows split at each configured boundary |
| Reading current < previous | Error appears and direct units become zero |
| Negative unit adjustment | Billed units fall but never below zero |
| Flat category | Flat rate × billed units |
| ToU category in flat mode | Direct units × flat rate |
| ToU category in ToU mode | Period totals and charges sum correctly |
| EV ToU category | Super off-peak input and charge appear |
| kWh > 0, kVARh = 0 | PF equals 1 and no PF surcharge |
| PF exactly 0.95 | No PF surcharge |
| PF just below 0.95 | One surcharge step appears |
| Transformer loss enabled | 4% equivalent units and charge appear |
| Transformer rent entered | Fixed rent is included in principal |
| VAT disabled | VAT becomes zero |
| Late payment enabled | 5% of principal is added after VAT calculation |
| Language toggled | Copy and number formatting switch to Bangla and back |
| Mobile width | Forms stack without horizontal scrolling |

There is currently no automated unit-test suite. `lint` and `build` validate syntax, React hook usage, bundling, and common static issues, but hand-verified tariff examples remain important.

## 15. Assumptions and boundaries

- Rates are estimates from the configured DPDC schedule, not live account data.
- Users must enter sanctioned load; it is not derived from maximum demand or consumption.
- Meter multipliers, CT/PT ratios, rebates, arrears, minimum bills, security deposits, tax variations, and other account-specific line items are not inferred.
- Meter/service charge and transformer rent are user inputs because they can vary by account.
- Transformer loss is optional and uses the configured 4% assumption.
- PF is monthly and is derived only from entered kWh and kVARh.
- The PF surcharge formula is configuration-driven, but users should verify account-specific DPDC treatment against an official bill.
- The late-payment option is an estimate based on configured principal percentage, not a due-date engine.
- Supply-voltage load limits are informative; the form does not reject an inconsistent load.
- Residential slab inputs are expected to follow normal bill-unit precision. Published integer band labels are preserved in the configuration.
- No sample-bill import or sample-bill validation feature is part of the runtime application.

## 16. Maintenance summary

For tariff changes, edit `src/tariffConfig.js`. For formulas, input behavior, or components, edit `src/main.jsx`. For authentication, edit the modules under `src/auth` and keep `AUTH_SETUP.md` current. For wording, update both language branches in `copy` and the bilingual category fields. For presentation and breakpoints, edit `src/styles.css` or `src/auth/auth.css`.

The most important invariant is that all monetary policy inputs remain in `TARIFF_CONFIG` and all displayed explanations continue to use the same calculated values returned by the bill engine.

## 17. Authentication architecture

The calculator is wrapped in `AuthProvider` and `AuthGate`. `AuthProvider` creates one `onAuthStateChange` subscription, stores the current session, and exposes sign-in, signup, password-reset, password-update, and local sign-out actions through React context. The Supabase client uses `persistSession`, `autoRefreshToken`, and `detectSessionInUrl`, so the app does not repeatedly authenticate on normal renders.

`AuthGate` renders exactly one of four states:

1. a safe configuration screen when public environment values are absent;
2. a short session-restoration screen;
3. login, signup, or password-recovery UI when there is no authenticated user; or
4. the tariff application for a valid user session.

Password recovery is selected by Supabase's `PASSWORD_RECOVERY` event. The user chooses a new password with at least 10 characters, then continues into the protected calculator. Email confirmation is expected to remain enabled in the hosted Supabase project.

Client cooldowns are stored under `billwise.auth.cooldown.*` in local storage: 3 seconds for sign-in, 60 seconds for signup or recovery email, and 5 seconds for password update. These reduce accidental duplicate requests but are not a security boundary. Supabase Auth provides the authoritative server-side rate limits and HTTP 429 responses.

Only `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` may be placed in the frontend environment. A secret or service-role key must never be used in any `VITE_` variable or browser code. Full account creation, redirect, SMTP, rate-limit, and production steps are in `AUTH_SETUP.md`.
