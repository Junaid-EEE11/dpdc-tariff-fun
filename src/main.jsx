import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Activity,
  ArrowUpRight,
  Building2,
  Calculator,
  Check,
  ChevronDown,
  CircleHelp,
  Factory,
  Gauge,
  GraduationCap,
  House,
  Info,
  Leaf,
  Lightbulb,
  LogOut,
  Moon,
  PlugZap,
  ReceiptText,
  RotateCcw,
  Sprout,
  SunMedium,
  ShieldCheck,
  Zap,
} from "lucide-react";
import "./styles.css";
import { TARIFF_CONFIG } from "./tariffConfig.js";
import { AuthProvider, useAuth } from "./auth/AuthContext.jsx";
import { AuthGate } from "./auth/AuthGate.jsx";

const iconMap = {
  activity: Activity,
  building: Building2,
  charging: PlugZap,
  education: GraduationCap,
  factory: Factory,
  house: House,
  light: Lightbulb,
  sprout: Sprout,
  zap: Zap,
};

const categories = Object.fromEntries(
  Object.entries(TARIFF_CONFIG.categories).map(([key, category]) => [
    key,
    { ...category, icon: iconMap[category.icon] },
  ]),
);
const SOURCE_URL = TARIFF_CONFIG.source.url;
const residentialSlabs = TARIFF_CONFIG.residentialSlabs.map((slab) => ({
  ...slab,
  max: slab.max ?? Infinity,
}));
const residentialLifeline = TARIFF_CONFIG.residentialLifeline;
const voltageInfo = TARIFF_CONFIG.voltageLevels;
const billingRules = TARIFF_CONFIG.billingRules;

const copy = {
  en: {
    source: "Official source",
    language: "বাংলা",
    eyebrow: "Electricity, made understandable",
    headingA: "Know your bill",
    headingB: "before it arrives.",
    intro:
      "A clear estimate across DPDC’s LT, MT, HT and EHT retail tariffs. See every energy, demand and bill adjustment charge before you pay.",
    effective: "Effective bill month",
    calculator: "Bill calculator",
    tariffType: "Consumer category",
    voltageLevel: "Supply voltage",
    showAll: "View all categories",
    hideAll: "Show fewer categories",
    usage: "Energy consumption",
    direct: "Enter units",
    reading: "Use meter reading",
    current: "Current reading",
    previous: "Previous reading",
    units: "Monthly units",
    unitsHint: "1 unit = 1 kWh",
    load: "Sanctioned load",
    loadHint: "Shown as ‘Load’ on your bill",
    billingMode: "Metering method",
    flat: "Flat rate",
    tou: "Time of use",
    offPeak: "Off-peak units",
    superOffPeak: "Super off-peak units",
    peak: "Peak units",
    extra: "Bill adjustments",
    adjustmentUnits: "Old meter / unit adjustment",
    adjustmentHint: "Use a negative value for a credit or old-meter offset",
    meterCharge: "Meter / service charge",
    transformerRent: "Transformer rent",
    transformerLoss: "Transformer loss",
    transformerLossToggle: "Include transformer loss",
    transformerLossRule: "Calculated as a percentage of metered energy",
    powerFactor: "Calculated power factor",
    reactiveUnits: "Reactive consumption",
    reactiveUnitsHint: "Monthly kVARh from the reactive meter",
    powerFactorHint: "PF = kWh ÷ √(kWh² + kVARh²)",
    pfc: "Power-factor surcharge",
    pfCalculation: "Power-factor calculation",
    latePayment: "Estimate payment after due date",
    latePaymentCharge: "Late payment surcharge",
    lateRule: "of current principal after the due date",
    vat: "Include VAT",
    reset: "Reset estimate",
    estimate: "Estimated monthly bill",
    perDay: "per day",
    energy: "Energy charge",
    demand: "Demand charge",
    meter: "Meter / service",
    vatLabel: "VAT",
    total: "Estimated total",
    formula: "How we calculated this",
    energyFormula: "Energy",
    demandFormula: "Demand",
    insightTitle: "Usage insight",
    lifeline:
      "You qualify for the lifeline rate because your monthly use is 50 units or less.",
    untilNext: "units left before the next slab",
    highest: "You are currently in the highest residential slab.",
    flatInsight: "Your energy rate is fixed for this category.",
    touInsight: "Off-peak and peak units are priced separately for this meter.",
    sourceNote:
      "Tariff rates are sourced from DPDC. This is an independent estimate, not an official DPDC bill.",
    tariffGuide: "Tariff guide",
    rateMode: "Rate period",
    tariffIntro:
      "Residential energy is charged progressively. Within the configured lifeline threshold, the lifeline rate applies to all units.",
    band: "Consumption band",
    unitRate: "Rate / unit",
    yourUnits: "Your units",
    lifelineLabel: "Lifeline",
    demandRate: "Demand rate",
    demandRateHint: "Charged per kW of sanctioned load, each month",
    connection: "Low-voltage connection",
    connectionInfo: "230V single-phase or 400V three-phase · 50 Hz",
    limits: "Permitted LT load",
    limitsInfo: "Single-phase: 0–7.5 kW · Three-phase: 0–80 kW",
    faqTitle: "Good to know",
    faq1q: "Why might my actual bill differ?",
    faq1a:
      "Meter rent, arrears, adjustments, rebates, power-factor penalties and billing-period changes can affect the final amount.",
    faq2q: "What is sanctioned load?",
    faq2a:
      "It is the maximum approved load for your connection. Find it on your bill in kW—not the reading shown on your meter.",
    faq3q: "How do residential slabs work?",
    faq3a:
      "Above 50 units, use is divided progressively across the published bands. The higher rate applies only to units inside that band.",
    footer: "Built for clearer energy decisions in Bangladesh.",
    invalidReading: "Current reading must be equal to or higher than previous reading.",
    selected: "Selected",
    currentBill: "Current bill",
    principal: "Current principal",
    afterDue: "After due date",
  },
  bn: {
    source: "অফিসিয়াল উৎস",
    language: "English",
    eyebrow: "বিদ্যুতের হিসাব, এবার একদম সহজ",
    headingA: "বিল আসার আগেই",
    headingB: "জেনে নিন হিসাব।",
    intro:
      "ডিপিডিসির LT, MT, HT ও EHT খুচরা ট্যারিফ অনুযায়ী পরিষ্কার হিসাব। এনার্জি, ডিমান্ড ও সব বিল সমন্বয় আগে থেকেই দেখুন।",
    effective: "কার্যকর বিল মাস",
    calculator: "বিল ক্যালকুলেটর",
    tariffType: "গ্রাহক শ্রেণী",
    voltageLevel: "সরবরাহ ভোল্টেজ",
    showAll: "সব গ্রাহক শ্রেণী দেখুন",
    hideAll: "কম শ্রেণী দেখুন",
    usage: "বিদ্যুৎ ব্যবহার",
    direct: "ইউনিট লিখুন",
    reading: "মিটার রিডিং দিন",
    current: "বর্তমান রিডিং",
    previous: "আগের রিডিং",
    units: "মাসিক ইউনিট",
    unitsHint: "১ ইউনিট = ১ কিলোওয়াট-ঘণ্টা",
    load: "অনুমোদিত লোড",
    loadHint: "আপনার বিলে ‘Load’ হিসেবে দেওয়া আছে",
    billingMode: "মিটারিং পদ্ধতি",
    flat: "ফ্ল্যাট রেট",
    tou: "সময়ভিত্তিক",
    offPeak: "অফ-পিক ইউনিট",
    superOffPeak: "সুপার অফ-পিক ইউনিট",
    peak: "পিক ইউনিট",
    extra: "বিল সমন্বয়",
    adjustmentUnits: "পুরোনো মিটার / ইউনিট সমন্বয়",
    adjustmentHint: "ক্রেডিট বা পুরোনো মিটার অফসেটের জন্য ঋণাত্মক মান দিন",
    meterCharge: "মিটার / সার্ভিস চার্জ",
    transformerRent: "ট্রান্সফরমার ভাড়া",
    transformerLoss: "ট্রান্সফরমার লস",
    transformerLossToggle: "ট্রান্সফরমার লস যোগ করুন",
    transformerLossRule: "মিটারকৃত এনার্জির শতাংশ হিসেবে হিসাব হয়",
    powerFactor: "হিসাবকৃত পাওয়ার ফ্যাক্টর",
    reactiveUnits: "রিঅ্যাক্টিভ ব্যবহার",
    reactiveUnitsHint: "রিঅ্যাক্টিভ মিটারের মাসিক kVARh",
    powerFactorHint: "PF = kWh ÷ √(kWh² + kVARh²)",
    pfc: "পাওয়ার-ফ্যাক্টর সারচার্জ",
    pfCalculation: "পাওয়ার-ফ্যাক্টর হিসাব",
    latePayment: "শেষ তারিখের পর পরিশোধের হিসাব",
    latePaymentCharge: "বিলম্ব মাশুল",
    lateRule: "শেষ তারিখের পর বর্তমান প্রিন্সিপালের উপর",
    vat: "ভ্যাট যোগ করুন",
    reset: "হিসাব রিসেট",
    estimate: "আনুমানিক মাসিক বিল",
    perDay: "প্রতিদিন",
    energy: "এনার্জি চার্জ",
    demand: "ডিমান্ড চার্জ",
    meter: "মিটার / সার্ভিস",
    vatLabel: "ভ্যাট",
    total: "আনুমানিক মোট",
    formula: "হিসাবের বিস্তারিত",
    energyFormula: "এনার্জি",
    demandFormula: "ডিমান্ড",
    insightTitle: "ব্যবহারের তথ্য",
    lifeline: "আপনার মাসিক ব্যবহার ৫০ ইউনিট বা কম, তাই লাইফলাইন রেট প্রযোজ্য।",
    untilNext: "ইউনিট পর পরবর্তী স্ল্যাব",
    highest: "আপনি বর্তমানে সর্বোচ্চ আবাসিক স্ল্যাবে আছেন।",
    flatInsight: "এই গ্রাহক শ্রেণীতে এনার্জি রেট নির্দিষ্ট।",
    touInsight: "এই মিটারে অফ-পিক ও পিক ইউনিট আলাদা রেটে হিসাব হয়।",
    sourceNote:
      "ট্যারিফ রেট ডিপিডিসি থেকে নেওয়া। এটি স্বাধীন হিসাব, ডিপিডিসির অফিসিয়াল বিল নয়।",
    tariffGuide: "ট্যারিফ তালিকা",
    rateMode: "রেটের সময়",
    tariffIntro:
      "আবাসিক এনার্জি প্রগতিশীল স্ল্যাবে হিসাব হয়। কনফিগার করা লাইফলাইন সীমার মধ্যে সব ইউনিটে লাইফলাইন রেট প্রযোজ্য।",
    band: "ব্যবহারের সীমা",
    unitRate: "প্রতি ইউনিট রেট",
    yourUnits: "আপনার ইউনিট",
    lifelineLabel: "লাইফলাইন",
    demandRate: "ডিমান্ড রেট",
    demandRateHint: "অনুমোদিত প্রতি কিলোওয়াট লোডে মাসিক চার্জ",
    connection: "নিম্নচাপ সংযোগ",
    connectionInfo: "২৩০V সিঙ্গেল-ফেজ বা ৪০০V থ্রি-ফেজ · ৫০ Hz",
    limits: "অনুমোদিত এলটি লোড",
    limitsInfo: "সিঙ্গেল-ফেজ: ০–৭.৫ kW · থ্রি-ফেজ: ০–৮০ kW",
    faqTitle: "জেনে রাখা ভালো",
    faq1q: "আসল বিল আলাদা হতে পারে কেন?",
    faq1a:
      "মিটার ভাড়া, বকেয়া, সমন্বয়, রেয়াত, পাওয়ার-ফ্যাক্টর জরিমানা ও বিলিং সময়ের পরিবর্তন চূড়ান্ত বিলে প্রভাব ফেলতে পারে।",
    faq2q: "অনুমোদিত লোড কী?",
    faq2a:
      "এটি আপনার সংযোগের অনুমোদিত সর্বোচ্চ লোড। বিলে kW হিসেবে দেখুন—মিটারের রিডিং নয়।",
    faq3q: "আবাসিক স্ল্যাব কীভাবে কাজ করে?",
    faq3a:
      "৫০ ইউনিটের বেশি হলে প্রকাশিত ধাপ অনুযায়ী ব্যবহার ভাগ হয়। উচ্চ রেট শুধু ওই ধাপের ইউনিটে প্রযোজ্য।",
    footer: "বাংলাদেশের সহজ ও সচেতন বিদ্যুৎ ব্যবহারের জন্য।",
    invalidReading: "বর্তমান রিডিং আগের রিডিংয়ের সমান বা বেশি হতে হবে।",
    selected: "নির্বাচিত",
    currentBill: "চলতি বিল",
    principal: "বর্তমান প্রিন্সিপাল",
    afterDue: "শেষ তারিখের পর",
  },
};

const formatMoney = (value, lang = "en") =>
  new Intl.NumberFormat(lang === "bn" ? "bn-BD" : "en-BD", {
    style: "currency",
    currency: "BDT",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
    .format(value || 0)
    .replace("BDT", "৳");

const formatNumber = (value, lang = "en", digits = 0) =>
  new Intl.NumberFormat(lang === "bn" ? "bn-BD" : "en-BD", {
    maximumFractionDigits: digits,
  }).format(value || 0);

function calculateResidential(units) {
  if (units <= 0) return { total: 0, rows: [] };
  if (units <= residentialLifeline.maxUnits) {
    return {
      total: units * residentialLifeline.rate,
      rows: [{
        label: `0–${residentialLifeline.maxUnits}`,
        units,
        rate: residentialLifeline.rate,
        amount: units * residentialLifeline.rate,
      }],
    };
  }

  let remaining = units;
  let total = 0;
  const rows = [];
  residentialSlabs.forEach((slab, index) => {
    if (remaining <= 0) return;
    const capacity =
      slab.max === Infinity
        ? remaining
        : index === 0
          ? slab.max
          : slab.max - residentialSlabs[index - 1].max;
    const slabUnits = Math.min(remaining, capacity);
    const amount = slabUnits * slab.rate;
    rows.push({ ...slab, units: slabUnits, amount });
    total += amount;
    remaining -= slabUnits;
  });
  return { total, rows };
}

function NumberInput({ label, value, onChange, suffix, hint, min = 0, error }) {
  return (
    <label className={`number-field ${error ? "has-error" : ""}`}>
      <span className="field-label">{label}</span>
      <span className="input-shell">
        <input
          type="number"
          min={min}
          step="any"
          inputMode="decimal"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        <span className="suffix">{suffix}</span>
      </span>
      {hint && <span className="field-hint">{hint}</span>}
      {error && <span className="field-error">{error}</span>}
    </label>
  );
}

function CategoryPicker({ active, onSelect, lang, t, level, onLevelChange }) {
  const [expanded, setExpanded] = useState(false);
  const levelKeys = Object.keys(categories).filter(
    (key) => categories[key].level === level,
  );
  const visibleKeys = expanded ? levelKeys : levelKeys.slice(0, 3);

  return (
    <div className="category-picker">
      <div className="voltage-tabs" aria-label={t.voltageLevel}>
        {Object.keys(voltageInfo).map((item) => (
          <button
            type="button"
            key={item}
            className={level === item ? "active" : ""}
            onClick={() => {
              setExpanded(false);
              onLevelChange(item);
            }}
          >
            <strong>{item}</strong>
            <span>{voltageInfo[item].voltage}</span>
          </button>
        ))}
      </div>
      <div className="category-grid">
        {visibleKeys.map((key) => {
          const category = categories[key];
          const Icon = category.icon;
          const isActive = active === key;
          return (
            <button
              className={`category-option ${isActive ? "active" : ""}`}
              type="button"
              key={key}
              onClick={() => onSelect(key)}
              aria-pressed={isActive}
            >
              <span className="category-icon">
                <Icon size={19} strokeWidth={1.8} />
              </span>
              <span className="category-copy">
                <strong>
                  {category.name[lang]} <small>{category.code}</small>
                </strong>
                <span>{category.detail[lang]}</span>
              </span>
              {isActive && (
                <span className="selected-check" title={t.selected}>
                  <Check size={14} strokeWidth={3} />
                </span>
              )}
            </button>
          );
        })}
      </div>
      {levelKeys.length > 3 && (
        <button
          type="button"
          className="text-button expand-categories"
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? t.hideAll : `${t.showAll} (${levelKeys.length})`}
          <ChevronDown
            size={16}
            className={expanded ? "rotate" : ""}
            aria-hidden="true"
          />
        </button>
      )}
    </div>
  );
}

function BreakdownRow({ icon: Icon, label, detail, value, strong }) {
  return (
    <div className={`breakdown-row ${strong ? "strong" : ""}`}>
      <span className="breakdown-icon">
        <Icon size={17} />
      </span>
      <span className="breakdown-label">
        <span>{label}</span>
        {detail && <small>{detail}</small>}
      </span>
      <strong>{value}</strong>
    </div>
  );
}

function App() {
  const { user, signOut } = useAuth();
  const [lang, setLang] = useState("en");
  const [categoryKey, setCategoryKey] = useState("residential");
  const [entryMode, setEntryMode] = useState("units");
  const [billingMode, setBillingMode] = useState("flat");
  const [unitsInput, setUnitsInput] = useState("275");
  const [currentReading, setCurrentReading] = useState("12450");
  const [previousReading, setPreviousReading] = useState("12175");
  const [loadInput, setLoadInput] = useState("3");
  const [meterChargeInput, setMeterChargeInput] = useState("40");
  const [unitAdjustmentInput, setUnitAdjustmentInput] = useState("0");
  const [reactiveUnitsInput, setReactiveUnitsInput] = useState("0");
  const [transformerRentInput, setTransformerRentInput] = useState("0");
  const [includeTransformerLoss, setIncludeTransformerLoss] = useState(false);
  const [includeVat, setIncludeVat] = useState(true);
  const [includeLatePayment, setIncludeLatePayment] = useState(false);
  const [showAdjustments, setShowAdjustments] = useState(false);
  const [touUnits, setTouUnits] = useState({
    offPeak: "180",
    superOffPeak: "0",
    peak: "95",
  });
  const [openFaq, setOpenFaq] = useState(0);
  const [signOutBusy, setSignOutBusy] = useState(false);

  const t = copy[lang];
  const category = categories[categoryKey];
  const readingInvalid =
    entryMode === "reading" &&
    Number(currentReading || 0) < Number(previousReading || 0);
  const directUnits =
    entryMode === "reading"
      ? Math.max(0, Number(currentReading || 0) - Number(previousReading || 0))
      : Math.max(0, Number(unitsInput || 0));
  const unitAdjustment = Number(unitAdjustmentInput || 0);
  const timeOfUseUnits = Object.values(touUnits).reduce(
    (total, value) => total + Math.max(0, Number(value || 0)),
    0,
  );
  const totalUnits =
    category.type === "tou" && billingMode === "tou"
      ? timeOfUseUnits
      : Math.max(0, directUnits + unitAdjustment);
  const load = Math.max(0, Number(loadInput || 0));
  const meterCharge = Math.max(0, Number(meterChargeInput || 0));
  const transformerRent = Math.max(0, Number(transformerRentInput || 0));
  const pfEnergyUnits =
    category.type === "tou" && billingMode === "tou"
      ? timeOfUseUnits
      : directUnits;
  const reactiveUnits = Math.max(0, Number(reactiveUnitsInput || 0));
  const powerFactor =
    pfEnergyUnits > 0
      ? pfEnergyUnits /
        Math.sqrt(pfEnergyUnits ** 2 + reactiveUnits ** 2)
      : 1;

  const calculation = useMemo(() => {
    let energyCharge = 0;
    let energyRows = [];

    if (category.type === "slab") {
      const result = calculateResidential(totalUnits);
      energyCharge = result.total;
      energyRows = result.rows;
    } else if (category.type === "tou" && billingMode === "tou") {
      energyRows = Object.entries(touUnits)
        .filter(([key]) => category.rates[key] !== undefined)
        .map(([key, value]) => {
          const used = Math.max(0, Number(value || 0));
          return {
            label: key,
            units: used,
            rate: category.rates[key],
            amount: used * category.rates[key],
          };
        });
      energyCharge = energyRows.reduce((sum, row) => sum + row.amount, 0);
    } else {
      energyCharge = totalUnits * category.rates.flat;
      energyRows = [
        {
          label: "flat",
          units: totalUnits,
          rate: category.rates.flat,
          amount: energyCharge,
        },
      ];
    }

    const transformerLossCharge = includeTransformerLoss
      ? energyCharge * billingRules.transformerLoss.defaultRate
      : 0;
    const transformerLossUnitCount = includeTransformerLoss
      ? totalUnits * billingRules.transformerLoss.defaultRate
      : 0;

    const demandCharge = load * category.demandRate;
    const pfSteps =
      powerFactor < billingRules.powerFactor.threshold
        ? Math.ceil(
            (billingRules.powerFactor.threshold - powerFactor) /
              billingRules.powerFactor.pointSize -
              0.000001,
          )
        : 0;
    const pfSurchargeRate =
      pfSteps * billingRules.powerFactor.surchargePerPoint;
    const pfSurcharge = energyCharge * pfSurchargeRate;
    const principal =
      energyCharge +
      demandCharge +
      transformerLossCharge +
      transformerRent +
      meterCharge +
      pfSurcharge;
    const vat = includeVat ? principal * billingRules.vatRate : 0;
    const currentTotal = principal + vat;
    const latePaymentCharge = principal * billingRules.latePaymentRate;
    return {
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
      afterDueTotal: currentTotal + latePaymentCharge,
      total: currentTotal + (includeLatePayment ? latePaymentCharge : 0),
    };
  }, [
    billingMode,
    category,
    includeVat,
    includeLatePayment,
    load,
    meterCharge,
    powerFactor,
    totalUnits,
    includeTransformerLoss,
    transformerRent,
    touUnits,
  ]);

  const insight = useMemo(() => {
    if (categoryKey !== "residential") {
      return { type: category.type === "tou" && billingMode === "tou" ? "tou" : "flat" };
    }
    if (totalUnits <= residentialLifeline.maxUnits) return { type: "lifeline" };
    const activeSlab = residentialSlabs.find(
      (slab) => totalUnits >= slab.min && totalUnits <= slab.max,
    );
    if (!activeSlab || activeSlab.max === Infinity) return { type: "highest" };
    return {
      type: "remaining",
      remaining: Math.max(0, activeSlab.max - totalUnits),
      max: activeSlab.max,
    };
  }, [billingMode, category.type, categoryKey, totalUnits]);

  const activeSlabIndex =
    totalUnits <= residentialLifeline.maxUnits
      ? -1
      : residentialSlabs.findIndex(
          (slab) => totalUnits >= slab.min && totalUnits <= slab.max,
        );

  const reset = () => {
    setCategoryKey("residential");
    setEntryMode("units");
    setBillingMode("flat");
    setUnitsInput("275");
    setCurrentReading("12450");
    setPreviousReading("12175");
    setLoadInput("3");
    setMeterChargeInput("40");
    setUnitAdjustmentInput("0");
    setReactiveUnitsInput("0");
    setTransformerRentInput("0");
    setIncludeTransformerLoss(false);
    setIncludeVat(true);
    setIncludeLatePayment(false);
    setShowAdjustments(false);
    setTouUnits({ offPeak: "180", superOffPeak: "0", peak: "95" });
  };

  const handleSignOut = async () => {
    setSignOutBusy(true);
    const { error } = await signOut();
    if (error) setSignOutBusy(false);
  };

  return (
    <div className="app" lang={lang === "bn" ? "bn" : "en"}>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Billwise home">
          <span className="brand-mark">
            <Activity size={22} strokeWidth={2.2} />
          </span>
          <span>
            <strong>billwise</strong>
            <small>DPDC tariff calculator</small>
          </span>
        </a>
        <nav className="header-actions" aria-label="Utility links">
          <a href={SOURCE_URL} target="_blank" rel="noreferrer">
            <span className="source-dot" />
            {t.source}
            <ArrowUpRight size={15} />
          </a>
          <button
            className="language-button"
            type="button"
            onClick={() => setLang((value) => (value === "en" ? "bn" : "en"))}
          >
            {t.language}
          </button>
          <span className="account-chip" title={user.email}>
            <ShieldCheck size={15} />
            <span>{user.email}</span>
          </span>
          <button
            className="signout-button"
            type="button"
            onClick={handleSignOut}
            disabled={signOutBusy}
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut size={16} />
          </button>
        </nav>
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">
              <span>
                <Zap size={13} fill="currentColor" />
              </span>
              {t.eyebrow}
            </p>
            <h1>
              {t.headingA}
              <br />
              <em>{t.headingB}</em>
            </h1>
            <p className="hero-intro">{t.intro}</p>
            <div className="effective-pill">
              <span className="pulse" />
              {t.effective} · {TARIFF_CONFIG.source.effectiveBillMonth}
            </div>
          </div>
          <div className="hero-visual" aria-hidden="true">
            <div className="orb">
              <div className="orb-ring ring-one" />
              <div className="orb-ring ring-two" />
              <div className="orb-core">
                <Zap size={42} fill="currentColor" strokeWidth={1.6} />
              </div>
              <span className="orbit-node node-one" />
              <span className="orbit-node node-two" />
              <span className="orbit-node node-three" />
            </div>
            <span className="visual-label label-one">kWh</span>
            <span className="visual-label label-two">৳ / kW</span>
          </div>
        </section>

        <section className="calculator-shell" aria-labelledby="calculator-title">
          <div className="calculator-form">
            <div className="section-heading">
              <span className="heading-icon">
                <Calculator size={19} />
              </span>
              <div>
                <p>01</p>
                <h2 id="calculator-title">{t.calculator}</h2>
              </div>
            </div>

            <div className="form-section">
              <div className="form-title">
                <h3>{t.tariffType}</h3>
                <span>{category.code}</span>
              </div>
              <CategoryPicker
                active={categoryKey}
                onSelect={(key) => {
                  setCategoryKey(key);
                  setBillingMode("flat");
                }}
                lang={lang}
                t={t}
                level={category.level}
                onLevelChange={(level) => {
                  const firstKey = Object.keys(categories).find(
                    (key) => categories[key].level === level,
                  );
                  setCategoryKey(firstKey);
                  setBillingMode("flat");
                }}
              />
            </div>

            <div className="form-divider" />

            {category.type === "tou" && (
              <div className="form-section compact">
                <h3>{t.billingMode}</h3>
                <div className="segmented wide">
                  <button
                    type="button"
                    className={billingMode === "flat" ? "active" : ""}
                    onClick={() => setBillingMode("flat")}
                  >
                    <SunMedium size={16} />
                    {t.flat}
                  </button>
                  <button
                    type="button"
                    className={billingMode === "tou" ? "active" : ""}
                    onClick={() => setBillingMode("tou")}
                  >
                    <Moon size={16} />
                    {t.tou}
                  </button>
                </div>
              </div>
            )}

            <div className="form-section">
              <h3>{t.usage}</h3>
              {!(category.type === "tou" && billingMode === "tou") && (
                <>
                  <div className="segmented">
                    <button
                      type="button"
                      className={entryMode === "units" ? "active" : ""}
                      onClick={() => setEntryMode("units")}
                    >
                      {t.direct}
                    </button>
                    <button
                      type="button"
                      className={entryMode === "reading" ? "active" : ""}
                      onClick={() => setEntryMode("reading")}
                    >
                      {t.reading}
                    </button>
                  </div>
                  {entryMode === "units" ? (
                    <div className="input-grid">
                      <NumberInput
                        label={t.units}
                        value={unitsInput}
                        onChange={setUnitsInput}
                        suffix="kWh"
                        hint={t.unitsHint}
                      />
                      <NumberInput
                        label={t.load}
                        value={loadInput}
                        onChange={setLoadInput}
                        suffix="kW"
                        hint={t.loadHint}
                      />
                    </div>
                  ) : (
                    <div className="input-grid">
                      <NumberInput
                        label={t.previous}
                        value={previousReading}
                        onChange={setPreviousReading}
                        suffix="kWh"
                      />
                      <NumberInput
                        label={t.current}
                        value={currentReading}
                        onChange={setCurrentReading}
                        suffix="kWh"
                        error={readingInvalid ? t.invalidReading : ""}
                      />
                      <div className="calculated-usage">
                        <span>{t.units}</span>
                        <strong>{formatNumber(directUnits, lang, 2)} kWh</strong>
                      </div>
                      <NumberInput
                        label={t.load}
                        value={loadInput}
                        onChange={setLoadInput}
                        suffix="kW"
                        hint={t.loadHint}
                      />
                    </div>
                  )}
                </>
              )}

              {category.type === "tou" && billingMode === "tou" && (
                <>
                  <div className="input-grid tou-grid">
                    <NumberInput
                      label={t.offPeak}
                      value={touUnits.offPeak}
                      onChange={(value) =>
                        setTouUnits((state) => ({ ...state, offPeak: value }))
                      }
                      suffix="kWh"
                    />
                    {category.rates.superOffPeak !== undefined && (
                      <NumberInput
                        label={t.superOffPeak}
                        value={touUnits.superOffPeak}
                        onChange={(value) =>
                          setTouUnits((state) => ({
                            ...state,
                            superOffPeak: value,
                          }))
                        }
                        suffix="kWh"
                      />
                    )}
                    <NumberInput
                      label={t.peak}
                      value={touUnits.peak}
                      onChange={(value) =>
                        setTouUnits((state) => ({ ...state, peak: value }))
                      }
                      suffix="kWh"
                    />
                    <NumberInput
                      label={t.load}
                      value={loadInput}
                      onChange={setLoadInput}
                      suffix="kW"
                      hint={t.loadHint}
                    />
                  </div>
                  <div className="calculated-usage inline-total">
                    <span>{t.units}</span>
                    <strong>{formatNumber(totalUnits, lang, 2)} kWh</strong>
                  </div>
                </>
              )}
            </div>

            <div className="adjustments">
              <button
                type="button"
                className="adjustments-trigger"
                onClick={() => setShowAdjustments((value) => !value)}
                aria-expanded={showAdjustments}
              >
                <span>
                  <ReceiptText size={17} />
                  {t.extra}
                </span>
                <ChevronDown
                  size={17}
                  className={showAdjustments ? "rotate" : ""}
                />
              </button>
              {showAdjustments && (
                <div className="adjustments-body">
                  {!(category.type === "tou" && billingMode === "tou") && (
                    <NumberInput
                      label={t.adjustmentUnits}
                      value={unitAdjustmentInput}
                      onChange={setUnitAdjustmentInput}
                      suffix="kWh"
                      min={-999999999}
                      hint={t.adjustmentHint}
                    />
                  )}
                  <NumberInput
                    label={t.reactiveUnits}
                    value={reactiveUnitsInput}
                    onChange={setReactiveUnitsInput}
                    suffix="kVARh"
                    hint={t.reactiveUnitsHint}
                  />
                  <div
                    className={`calculated-usage pf-output ${
                      powerFactor < billingRules.powerFactor.threshold
                        ? "warning"
                        : ""
                    }`}
                  >
                    <span>{t.powerFactor}</span>
                    <strong>{formatNumber(powerFactor, lang, 3)} PF</strong>
                    <small>{t.powerFactorHint}</small>
                  </div>
                  <label className="toggle-row">
                    <span>
                      <strong>
                        {t.transformerLossToggle} (
                        {formatNumber(
                          billingRules.transformerLoss.defaultRate * 100,
                          lang,
                        )}
                        %)
                      </strong>
                      <small>{t.transformerLossRule}</small>
                    </span>
                    <input
                      type="checkbox"
                      checked={includeTransformerLoss}
                      onChange={(event) =>
                        setIncludeTransformerLoss(event.target.checked)
                      }
                    />
                    <span className="toggle" />
                  </label>
                  <NumberInput
                    label={t.transformerRent}
                    value={transformerRentInput}
                    onChange={setTransformerRentInput}
                    suffix="৳"
                  />
                  <NumberInput
                    label={t.meterCharge}
                    value={meterChargeInput}
                    onChange={setMeterChargeInput}
                    suffix="৳"
                  />
                  <label className="toggle-row">
                    <span>
                      <strong>
                        {t.vat} ({formatNumber(billingRules.vatRate * 100, lang)}%)
                      </strong>
                      <small>{t.currentBill}</small>
                    </span>
                    <input
                      type="checkbox"
                      checked={includeVat}
                      onChange={(event) => setIncludeVat(event.target.checked)}
                    />
                    <span className="toggle" />
                  </label>
                  <label className="toggle-row">
                    <span>
                      <strong>{t.latePayment}</strong>
                      <small>
                        {formatNumber(billingRules.latePaymentRate * 100, lang)}% {t.lateRule}
                      </small>
                    </span>
                    <input
                      type="checkbox"
                      checked={includeLatePayment}
                      onChange={(event) => setIncludeLatePayment(event.target.checked)}
                    />
                    <span className="toggle" />
                  </label>
                </div>
              )}
            </div>

            <button className="reset-button" type="button" onClick={reset}>
              <RotateCcw size={15} />
              {t.reset}
            </button>
          </div>

          <aside className="results-panel" aria-live="polite">
            <div className="result-topline">
              <span>{category.code}</span>
              <span>
                {formatNumber(totalUnits, lang, 2)} kWh ·{" "}
                {formatNumber(load, lang, 2)} kW
              </span>
            </div>
            <div className="total-block">
              <p>{t.estimate}</p>
              <h2>{formatMoney(calculation.total, lang)}</h2>
              <span>
                ≈ {formatMoney(calculation.total / 30, lang)} {t.perDay}
              </span>
            </div>

            <div className="breakdown">
              <BreakdownRow
                icon={Zap}
                label={t.energy}
                detail={`${formatNumber(totalUnits, lang, 2)} kWh`}
                value={formatMoney(calculation.energyCharge, lang)}
              />
              <BreakdownRow
                icon={Gauge}
                label={t.demand}
                detail={`${formatNumber(load, lang, 2)} kW × ৳${formatNumber(category.demandRate, lang)}`}
                value={formatMoney(calculation.demandCharge, lang)}
              />
              {calculation.transformerLossCharge > 0 && (
                <BreakdownRow
                  icon={Activity}
                  label={t.transformerLoss}
                  detail={`${formatNumber(calculation.transformerLossUnitCount, lang, 2)} kWh · ${formatNumber(billingRules.transformerLoss.defaultRate * 100, lang)}%`}
                  value={formatMoney(calculation.transformerLossCharge, lang)}
                />
              )}
              {transformerRent > 0 && (
                <BreakdownRow
                  icon={Building2}
                  label={t.transformerRent}
                  value={formatMoney(transformerRent, lang)}
                />
              )}
              {calculation.pfSurcharge > 0 && (
                <BreakdownRow
                  icon={Activity}
                  label={t.pfc}
                  detail={`${formatNumber(calculation.pfSurchargeRate * 100, lang, 2)}% · PF ${formatNumber(powerFactor, lang, 2)}`}
                  value={formatMoney(calculation.pfSurcharge, lang)}
                />
              )}
              <BreakdownRow
                icon={ReceiptText}
                label={t.meter}
                value={formatMoney(meterCharge, lang)}
              />
              <BreakdownRow
                icon={Leaf}
                label={`${t.vatLabel} (${formatNumber(billingRules.vatRate * 100, lang)}%)`}
                detail={includeVat ? t.principal : "Excluded"}
                value={formatMoney(calculation.vat, lang)}
              />
              {includeLatePayment && (
                <BreakdownRow
                  icon={ReceiptText}
                  label={t.latePaymentCharge}
                  detail={`${formatNumber(billingRules.latePaymentRate * 100, lang)}% ${t.lateRule}`}
                  value={formatMoney(calculation.latePaymentCharge, lang)}
                />
              )}
              <BreakdownRow
                icon={Calculator}
                label={t.total}
                value={formatMoney(calculation.total, lang)}
                strong
              />
            </div>

            <details className="formula-details" open>
              <summary>
                {t.formula}
                <ChevronDown size={16} />
              </summary>
              <div>
                {calculation.energyRows.map((row) => (
                  <p key={`${row.label}-${row.rate}`}>
                    <span>
                      {row.label === "offPeak"
                        ? t.offPeak
                        : row.label === "superOffPeak"
                          ? t.superOffPeak
                          : row.label === "peak"
                            ? t.peak
                            : row.label === "flat"
                              ? t.flat
                              : `${row.label} kWh`}
                    </span>
                    <span>
                      {formatNumber(row.units, lang, 2)} × ৳
                      {formatNumber(row.rate, lang, 2)} ={" "}
                      {formatMoney(row.amount, lang)}
                    </span>
                  </p>
                ))}
                <p className="formula-highlight">
                  <span>{t.pfCalculation}</span>
                  <span>
                    {formatNumber(pfEnergyUnits, lang, 2)} ÷ √(
                    {formatNumber(pfEnergyUnits, lang, 2)}² + {" "}
                    {formatNumber(reactiveUnits, lang, 2)}²) = {" "}
                    {formatNumber(powerFactor, lang, 3)}
                  </span>
                </p>
                <p>
                  <span>{t.pfc}</span>
                  <span>
                    max(0, {formatNumber(billingRules.powerFactor.threshold, lang, 2)} − {formatNumber(powerFactor, lang, 3)}) ÷ {formatNumber(
                      billingRules.powerFactor.pointSize,
                      lang,
                      2,
                    )} = {calculation.pfSteps} step(s); {calculation.pfSteps} × {formatNumber(
                      billingRules.powerFactor.surchargePerPoint * 100,
                      lang,
                      2,
                    )}% = {formatNumber(
                      calculation.pfSurchargeRate * 100,
                      lang,
                      2,
                    )}%; {formatMoney(calculation.energyCharge, lang)} × {formatNumber(
                      calculation.pfSurchargeRate * 100,
                      lang,
                      2,
                    )}% = {formatMoney(calculation.pfSurcharge, lang)}
                  </span>
                </p>
                {includeTransformerLoss && (
                  <p>
                    <span>{t.transformerLoss}</span>
                    <span>
                      {formatNumber(totalUnits, lang, 2)} × {formatNumber(
                        billingRules.transformerLoss.defaultRate * 100,
                        lang,
                      )}% = {formatNumber(
                        calculation.transformerLossUnitCount,
                        lang,
                        2,
                      )} kWh · {formatMoney(
                        calculation.transformerLossCharge,
                        lang,
                      )}
                    </span>
                  </p>
                )}
              </div>
            </details>

            <div className="insight-card">
              <span className="insight-icon">
                <Lightbulb size={19} />
              </span>
              <div>
                <strong>{t.insightTitle}</strong>
                <p>
                  {insight.type === "lifeline" && t.lifeline}
                  {insight.type === "remaining" &&
                    `${formatNumber(insight.remaining, lang, 2)} ${t.untilNext}.`}
                  {insight.type === "highest" && t.highest}
                  {insight.type === "flat" && t.flatInsight}
                  {insight.type === "tou" && t.touInsight}
                </p>
              </div>
            </div>

            <p className="source-note">
              <Info size={15} />
              {t.sourceNote}
            </p>
          </aside>
        </section>

        <section className="tariff-section" aria-labelledby="tariff-heading">
          <div className="section-kicker">
            <span>02</span>
            <p>Tariff reference</p>
          </div>
          <div className="tariff-heading-row">
            <div>
              <h2 id="tariff-heading">
                {category.code} · {category.name[lang]} {t.tariffGuide}
              </h2>
              <p>
                {category.type === "slab"
                  ? t.tariffIntro
                  : `${voltageInfo[category.level].label} · ${voltageInfo[category.level].voltage}. ${t.demandRate}: ৳${formatNumber(category.demandRate, lang)} / kW / month.`}
              </p>
            </div>
            <a href={SOURCE_URL} target="_blank" rel="noreferrer">
              {t.source}
              <ArrowUpRight size={16} />
            </a>
          </div>

          <div className="tariff-layout">
            <div className="tariff-table-card">
              <div className="tariff-table-head">
                <span>{category.type === "slab" ? t.band : t.rateMode}</span>
                <span>{t.unitRate}</span>
                <span>{t.yourUnits}</span>
              </div>
              {category.type === "slab" ? (
                <>
                  <div
                    className={`tariff-row lifeline-row ${
                      totalUnits <= residentialLifeline.maxUnits
                        ? "current"
                        : ""
                    }`}
                  >
                    <div>
                      <span className="row-dot" />
                  <strong>
                    {t.lifelineLabel} (0–{residentialLifeline.maxUnits} kWh)
                  </strong>
                    </div>
                    <strong>
                      ৳{formatNumber(residentialLifeline.rate, lang, 2)}
                    </strong>
                    <span>
                      {totalUnits <= residentialLifeline.maxUnits
                        ? `${formatNumber(totalUnits, lang, 2)} kWh`
                        : "—"}
                    </span>
                  </div>
                  {residentialSlabs.map((slab, index) => {
                    const row = calculation.energyRows.find(
                      (item) => item.label === slab.label,
                    );
                    const isCurrent = totalUnits > 50 && activeSlabIndex === index;
                    return (
                      <div
                        className={`tariff-row ${isCurrent ? "current" : ""}`}
                        key={slab.label}
                      >
                        <div><span className="row-dot" /><strong>{slab.label} kWh</strong></div>
                        <strong>৳{formatNumber(slab.rate, lang, 2)}</strong>
                        <span>{row ? `${formatNumber(row.units, lang, 2)} kWh` : "—"}</span>
                      </div>
                    );
                  })}
                </>
              ) : (
                Object.entries(category.rates).map(([mode, rate]) => {
                  const row = calculation.energyRows.find((item) => item.label === mode);
                  const label = mode === "flat" ? t.flat : mode === "offPeak" ? t.offPeak : mode === "superOffPeak" ? t.superOffPeak : t.peak;
                  const isCurrent = billingMode === "flat" ? mode === "flat" : mode !== "flat";
                  return (
                    <div className={`tariff-row ${isCurrent ? "current" : ""}`} key={mode}>
                      <div><span className="row-dot" /><strong>{label}</strong></div>
                      <strong>৳{formatNumber(rate, lang, 2)}</strong>
                      <span>{row ? `${formatNumber(row.units, lang, 2)} kWh` : "—"}</span>
                    </div>
                  );
                })
              )}
            </div>

            <div className="tariff-facts">
              <article>
                <span>
                  <Gauge size={21} />
                </span>
                <div>
                  <small>{t.demandRate}</small>
                  <strong>
                    ৳{formatNumber(category.demandRate, lang)} / kW / month
                  </strong>
                  <p>{t.demandRateHint}</p>
                </div>
              </article>
              <article>
                <span>
                  <PlugZap size={21} />
                </span>
                <div>
                  <small>{voltageInfo[category.level].label}</small>
                  <strong>{voltageInfo[category.level].voltage}</strong>
                  <p>AC supply · 50 Hz</p>
                </div>
              </article>
              <article>
                <span>
                  <Activity size={21} />
                </span>
                <div>
                  <small>{t.limits}</small>
                  <strong>{voltageInfo[category.level].limits}</strong>
                  <p>{category.code} · {category.detail[lang]}</p>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className="faq-section" aria-labelledby="faq-heading">
          <div className="faq-intro">
            <span className="heading-icon">
              <CircleHelp size={20} />
            </span>
            <div>
              <p>03</p>
              <h2 id="faq-heading">{t.faqTitle}</h2>
            </div>
          </div>
          <div className="faq-list">
            {[
              [t.faq1q, t.faq1a],
              [t.faq2q, t.faq2a],
              [t.faq3q, t.faq3a],
            ].map(([question, answer], index) => (
              <article className={openFaq === index ? "open" : ""} key={question}>
                <button
                  type="button"
                  onClick={() =>
                    setOpenFaq((value) => (value === index ? -1 : index))
                  }
                  aria-expanded={openFaq === index}
                >
                  <span>{question}</span>
                  <ChevronDown size={18} />
                </button>
                {openFaq === index && <p>{answer}</p>}
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer>
        <div className="brand footer-brand">
          <span className="brand-mark">
            <Activity size={20} />
          </span>
          <span>
            <strong>billwise</strong>
            <small>{t.footer}</small>
          </span>
        </div>
        <p>Tariff data checked · {TARIFF_CONFIG.source.checkedOn}</p>
        <a href={SOURCE_URL} target="_blank" rel="noreferrer">
          DPDC tariff schedule <ArrowUpRight size={14} />
        </a>
      </footer>
    </div>
  );
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <AuthGate>
        <App />
      </AuthGate>
    </AuthProvider>
  </React.StrictMode>,
);
