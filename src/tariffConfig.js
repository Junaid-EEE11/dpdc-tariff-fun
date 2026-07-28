/**
 * Single source of truth for the DPDC bill calculator.
 *
 * Update tariff rates and billing assumptions here. UI components and the
 * calculation engine import this object; no tariff amount is duplicated in
 * the application code.
 */
export const TARIFF_CONFIG = {
  source: {
    authority: "Dhaka Power Distribution Company Limited (DPDC)",
    url: "https://dpdc.gov.bd/pages/static-pages/6922de6f933eb65569e1a9c4",
    effectiveBillMonth: "2026-06",
    checkedOn: "2026-07-28",
    currency: "BDT",
  },

  billingRules: {
    vatRate: 0.05,
    latePaymentRate: 0.05,
    powerFactor: {
      threshold: 0.95,
      surchargePerPoint: 0.0075,
      pointSize: 0.01,
      formula: "kWh / sqrt(kWh^2 + kVARh^2)",
      surchargeBase: "energyCharge",
    },
    transformerLoss: {
      defaultRate: 0.04,
      optional: true,
      unitBasis: "meteredEnergyByRatePeriod",
    },
    demandChargeBasis: "sanctionedLoadKw",
  },

  voltageLevels: {
    LT: { label: "Low tension", voltage: "230 / 400 V", limits: "0–80 kW", frequencyHz: 50 },
    MT: { label: "Medium tension", voltage: "11 kV", limits: ">50 kW–5 MW", frequencyHz: 50 },
    HT: { label: "High tension", voltage: "33 kV", limits: ">5–30 MW", frequencyHz: 50 },
    EHT: { label: "Extra high tension", voltage: "132 / 230 kV", limits: "20 MW+", frequencyHz: 50 },
  },

  residentialSlabs: [
    { min: 0, max: 75, rate: 5.26, label: "0–75" },
    { min: 76, max: 200, rate: 8.5, label: "76–200" },
    { min: 201, max: 300, rate: 9.1, label: "201–300" },
    { min: 301, max: 400, rate: 9.62, label: "301–400" },
    { min: 401, max: 600, rate: 15.01, label: "401–600" },
    { min: 601, max: null, rate: 17.35, label: "601+" },
  ],
  residentialLifeline: { maxUnits: 50, rate: 4.63 },

  categories: {
    residential: { level: "LT", code: "LT-A", icon: "house", name: { en: "Residential", bn: "আবাসিক" }, detail: { en: "Homes & apartments", bn: "বাসা ও অ্যাপার্টমেন্ট" }, demandRate: 42, type: "slab" },
    agriculture: { level: "LT", code: "LT-B", icon: "sprout", name: { en: "Agriculture", bn: "সেচ / কৃষিকাজ" }, detail: { en: "Irrigation pumps", bn: "সেচ কাজে ব্যবহৃত পাম্প" }, demandRate: 42, type: "flat", rates: { flat: 6.04 } },
    smallIndustry: { level: "LT", code: "LT-C1", icon: "factory", name: { en: "Small industry", bn: "ক্ষুদ্র শিল্প" }, detail: { en: "Flat or time-of-use", bn: "ফ্ল্যাট বা সময়ভিত্তিক" }, demandRate: 48, type: "tou", rates: { flat: 12.73, offPeak: 11.45, peak: 15.27 } },
    construction: { level: "LT", code: "LT-C2", icon: "building", name: { en: "Construction", bn: "নির্মাণ" }, detail: { en: "Construction supply", bn: "নির্মাণ কাজে সংযোগ" }, demandRate: 120, type: "flat", rates: { flat: 18.09 } },
    institution: { level: "LT", code: "LT-D1", icon: "education", name: { en: "Institution", bn: "প্রতিষ্ঠান" }, detail: { en: "Education, charity & hospital", bn: "শিক্ষা, দাতব্য ও হাসপাতাল" }, demandRate: 60, type: "flat", rates: { flat: 9.05 } },
    publicService: { level: "LT", code: "LT-D2", icon: "light", name: { en: "Public service", bn: "জনসেবা" }, detail: { en: "Street lights & water pumps", bn: "রাস্তার বাতি ও পানির পাম্প" }, demandRate: 90, type: "flat", rates: { flat: 11.46 } },
    charging: { level: "LT", code: "LT-D3", icon: "charging", name: { en: "EV charging", bn: "ইভি চার্জিং" }, detail: { en: "EV & battery stations", bn: "ইভি ও ব্যাটারি স্টেশন" }, demandRate: 90, type: "tou", rates: { flat: 11.36, offPeak: 10.22, superOffPeak: 9.09, peak: 14.2 } },
    commercial: { level: "LT", code: "LT-E", icon: "building", name: { en: "Commercial", bn: "বাণিজ্যিক" }, detail: { en: "Business & offices", bn: "ব্যবসা ও অফিস" }, demandRate: 90, type: "tou", rates: { flat: 15.36, offPeak: 13.82, peak: 18.43 } },
    temporary: { level: "LT", code: "LT-T", icon: "zap", name: { en: "Temporary", bn: "অস্থায়ী" }, detail: { en: "Temporary connections", bn: "অস্থায়ী সংযোগ" }, demandRate: 120, type: "flat", rates: { flat: 23.81 } },

    mtResidential: { level: "MT", code: "MT-1", icon: "house", name: { en: "Residential", bn: "আবাসিক" }, detail: { en: "11 kV residential", bn: "১১ কেভি আবাসিক" }, demandRate: 90, type: "tou", rates: { flat: 12.5, offPeak: 11.25, peak: 15.62 } },
    mtCommercial: { level: "MT", code: "MT-2", icon: "building", name: { en: "Commercial & office", bn: "বাণিজ্যিক ও অফিস" }, detail: { en: "11 kV business supply", bn: "১১ কেভি ব্যবসায়িক সংযোগ" }, demandRate: 90, type: "tou", rates: { flat: 13.93, offPeak: 12.54, peak: 17.41 } },
    mtIndustry: { level: "MT", code: "MT-3", icon: "factory", name: { en: "Industry", bn: "শিল্প" }, detail: { en: "11 kV industrial supply", bn: "১১ কেভি শিল্প সংযোগ" }, demandRate: 90, type: "tou", rates: { flat: 12.85, offPeak: 11.56, peak: 16.06 } },
    mtConstruction: { level: "MT", code: "MT-4", icon: "building", name: { en: "Construction", bn: "নির্মাণ" }, detail: { en: "11 kV construction", bn: "১১ কেভি নির্মাণ" }, demandRate: 120, type: "tou", rates: { flat: 17.16, offPeak: 15.44, peak: 21.45 } },
    mtGeneral: { level: "MT", code: "MT-5", icon: "activity", name: { en: "General", bn: "সাধারণ" }, detail: { en: "General 11 kV supply", bn: "সাধারণ ১১ কেভি সংযোগ" }, demandRate: 90, type: "tou", rates: { flat: 12.58, offPeak: 11.32, peak: 15.72 } },
    mtTemporary: { level: "MT", code: "MT-6", icon: "zap", name: { en: "Temporary", bn: "অস্থায়ী" }, detail: { en: "Temporary 11 kV supply", bn: "অস্থায়ী ১১ কেভি সংযোগ" }, demandRate: 120, type: "flat", rates: { flat: 22.56 } },
    mtCharging: { level: "MT", code: "MT-7", icon: "charging", name: { en: "EV charging", bn: "ইভি চার্জিং" }, detail: { en: "EV & battery stations", bn: "ইভি ও ব্যাটারি স্টেশন" }, demandRate: 90, type: "tou", rates: { flat: 11.31, offPeak: 10.18, superOffPeak: 9.05, peak: 14.14 } },
    mtAgriculture: { level: "MT", code: "MT-8", icon: "sprout", name: { en: "Agriculture", bn: "সেচ / কৃষিকাজ" }, detail: { en: "11 kV irrigation pumps", bn: "১১ কেভি সেচ পাম্প" }, demandRate: 90, type: "tou", rates: { flat: 7.38, offPeak: 6.64, peak: 9.23 } },

    htGeneral: { level: "HT", code: "HT-1", icon: "activity", name: { en: "General", bn: "সাধারণ" }, detail: { en: "33 kV general supply", bn: "৩৩ কেভি সাধারণ সংযোগ" }, demandRate: 90, type: "tou", rates: { flat: 12.54, offPeak: 11.28, peak: 15.67 } },
    htCommercial: { level: "HT", code: "HT-2", icon: "building", name: { en: "Commercial & office", bn: "বাণিজ্যিক ও অফিস" }, detail: { en: "33 kV business supply", bn: "৩৩ কেভি ব্যবসায়িক সংযোগ" }, demandRate: 90, type: "tou", rates: { flat: 13.64, offPeak: 12.28, peak: 17.05 } },
    htIndustry: { level: "HT", code: "HT-3", icon: "factory", name: { en: "Industry", bn: "শিল্প" }, detail: { en: "33 kV industrial supply", bn: "৩৩ কেভি শিল্প সংযোগ" }, demandRate: 90, type: "tou", rates: { flat: 12.75, offPeak: 11.47, peak: 15.93 } },
    htConstruction: { level: "HT", code: "HT-4", icon: "building", name: { en: "Construction", bn: "নির্মাণ" }, detail: { en: "33 kV construction", bn: "৩৩ কেভি নির্মাণ" }, demandRate: 90, type: "tou", rates: { flat: 15.96, offPeak: 14.36, peak: 19.95 } },

    ehtGeneral1: { level: "EHT", code: "EHT-1", icon: "activity", name: { en: "General", bn: "সাধারণ" }, detail: { en: "132/230 kV · up to 140 MW", bn: "১৩২/২৩০ কেভি · ১৪০ মেগাওয়াট পর্যন্ত" }, demandRate: 90, type: "tou", rates: { flat: 12.66, offPeak: 11.39, peak: 15.82 } },
    ehtGeneral2: { level: "EHT", code: "EHT-2", icon: "activity", name: { en: "General", bn: "সাধারণ" }, detail: { en: "132/230 kV · above 140 MW", bn: "১৩২/২৩০ কেভি · ১৪০ মেগাওয়াটের বেশি" }, demandRate: 90, type: "tou", rates: { flat: 12.61, offPeak: 11.35, peak: 15.76 } },
  },
};

