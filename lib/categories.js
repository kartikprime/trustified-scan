export const TRUSTIFIED_CATEGORIES = {
  "Protein Powder": [
    { value: "whey_protein", label: "Whey Protein" },
    { value: "whey_isolate", label: "Whey Isolate" },
    { value: "plant_protein", label: "Plant Protein" },
    { value: "casein_protein", label: "Casein Protein" },
    { value: "egg_protein", label: "Egg Protein" },
    { value: "protein_blend", label: "Protein Blend" },
  ],
  "Performance": [
    { value: "creatine", label: "Creatine" },
    { value: "pre_workout", label: "Pre Workout" },
    { value: "bcaa", label: "BCAA" },
    { value: "glutamine", label: "Glutamine" },
    { value: "mass_gainer", label: "Mass Gainer" },
    { value: "weight_gainer", label: "Weight Gainer" },
  ],
  "Daily Essentials": [
    { value: "multivitamin", label: "Multivitamin" },
    { value: "omega3", label: "Omega 3 / Fish Oil" },
    { value: "vitamin_c", label: "Vitamin C" },
    { value: "vitamin_d", label: "Vitamin D" },
    { value: "zinc", label: "Zinc" },
    { value: "magnesium", label: "Magnesium" },
    { value: "iron", label: "Iron" },
    { value: "calcium", label: "Calcium" },
    { value: "biotin", label: "Biotin" },
    { value: "collagen", label: "Collagen" },
  ],
  "Natural Supplements": [
    { value: "shilajit", label: "Shilajit" },
    { value: "ashwagandha", label: "Ashwagandha" },
    { value: "turmeric_curcumin", label: "Turmeric / Curcumin" },
    { value: "moringa", label: "Moringa" },
    { value: "spirulina", label: "Spirulina" },
    { value: "green_tea_extract", label: "Green Tea Extract" },
  ],
  "Food Products": [
    { value: "protein_bar", label: "Protein Bar" },
    { value: "nut_butter", label: "Nut Butter" },
    { value: "dark_chocolate", label: "Dark Chocolate" },
    { value: "oats", label: "Oats" },
    { value: "muesli", label: "Muesli / Granola" },
    { value: "protein_cookies", label: "Protein Cookies" },
    { value: "healthy_snacks", label: "Healthy Snacks" },
  ],
  "Weight Management": [
    { value: "fat_burner", label: "Fat Burner" },
    { value: "cla", label: "CLA" },
    { value: "l_carnitine", label: "L-Carnitine" },
    { value: "green_coffee", label: "Green Coffee" },
  ],
  "Other": [
    { value: "other_supplement", label: "Other Supplement" },
  ],
}

export const ALL_CATEGORIES = Object.values(TRUSTIFIED_CATEGORIES).flat()

export const getCategoryLabel = (value) => {
  const found = ALL_CATEGORIES.find(c => c.value === value)
  return found ? found.label : value.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())
}

export const FSSAI_PARAMS = {
  whey_protein: {
    composition: ["Protein per serving (g)", "Protein per 100g (%)", "Carbohydrates (g)", "Sugar (g)", "Fat (g)", "Saturated Fat (g)", "Sodium (mg)", "Calories (kcal)", "Moisture (%)"],
    safety: ["Heavy Metals - Lead (limit: 0.5 mg/kg)", "Heavy Metals - Cadmium (limit: 0.1 mg/kg)", "Heavy Metals - Arsenic (limit: 0.1 mg/kg)", "Heavy Metals - Mercury (limit: 0.05 mg/kg)", "Protein Spiking - Creatine", "Protein Spiking - Taurine", "Protein Spiking - Glycine", "Protein Spiking - Sarcosine", "Artificial Sweeteners", "Microbial Count - Total Plate Count", "Microbial Count - Yeast & Mould", "Salmonella (must be absent)"],
  },
  whey_isolate: {
    composition: ["Protein per serving (g)", "Protein per 100g (%)", "Carbohydrates (g)", "Sugar (g)", "Lactose (g)", "Fat (g)", "Sodium (mg)", "Calories (kcal)"],
    safety: ["Heavy Metals - Lead", "Heavy Metals - Cadmium", "Heavy Metals - Arsenic", "Protein Spiking - Creatine", "Protein Spiking - Taurine", "Protein Spiking - Glycine", "Artificial Sweeteners", "Microbial Count", "Salmonella"],
  },
  plant_protein: {
    composition: ["Protein per serving (g)", "Protein per 100g (%)", "Carbohydrates (g)", "Sugar (g)", "Fat (g)", "Fiber (g)", "Sodium (mg)", "Calories (kcal)"],
    safety: ["Heavy Metals - Lead", "Heavy Metals - Cadmium", "Heavy Metals - Arsenic", "Pesticide Residue", "Protein Spiking", "Aflatoxin", "Microbial Count", "Salmonella"],
  },
  creatine: {
    composition: ["Creatine Monohydrate per serving (g)", "Creatine Monohydrate per 100g (%)", "Moisture (%)", "pH"],
    safety: ["Heavy Metals - Lead", "Heavy Metals - Cadmium", "Heavy Metals - Arsenic", "Creatinine content (impurity)", "Dicyandiamide (DCD) - impurity", "Dihydrotriazine (DHT) - impurity", "Microbial Count"],
  },
  pre_workout: {
    composition: ["Total Caffeine (mg)", "Beta-Alanine (mg)", "Citrulline (mg)", "Arginine (mg)", "Protein (g)", "Carbohydrates (g)", "Sodium (mg)"],
    safety: ["Heavy Metals - Lead", "Heavy Metals - Arsenic", "Banned Stimulants - DMAA", "Banned Stimulants - DMHA", "Caffeine (safe limit: 400mg/day)", "Artificial Colors", "Artificial Sweeteners", "Microbial Count"],
  },
  mass_gainer: {
    composition: ["Protein per serving (g)", "Carbohydrates (g)", "Sugar (g)", "Fat (g)", "Calories (kcal)", "Sodium (mg)", "Fiber (g)"],
    safety: ["Heavy Metals - Lead", "Heavy Metals - Cadmium", "Protein Spiking", "Artificial Sweeteners", "Microbial Count", "Salmonella", "Aflatoxin"],
  },
  multivitamin: {
    composition: ["Vitamin A (IU/mcg)", "Vitamin B12 (mcg)", "Vitamin C (mg)", "Vitamin D3 (IU)", "Vitamin E (mg)", "Iron (mg)", "Zinc (mg)", "Folate (mcg)"],
    safety: ["Heavy Metals - Lead", "Heavy Metals - Cadmium", "Heavy Metals - Arsenic", "Label Accuracy - All Vitamins", "Undeclared Ingredients", "Microbial Count"],
  },
  omega3: {
    composition: ["EPA (mg)", "DHA (mg)", "Total Omega 3 (mg)", "Fish Oil per capsule (mg)", "Peroxide Value"],
    safety: ["Heavy Metals - Lead", "Heavy Metals - Mercury (fish limit: 0.1 mg/kg)", "Heavy Metals - Cadmium", "Heavy Metals - Arsenic", "PCBs - Polychlorinated Biphenyls", "Peroxide Value (freshness)", "Dioxins", "Microbial Count"],
  },
  shilajit: {
    composition: ["Fulvic Acid (%)", "Humic Acid (%)", "Total Mineral Content (%)", "Moisture (%)"],
    safety: ["Heavy Metals - Lead (critical)", "Heavy Metals - Arsenic (critical)", "Heavy Metals - Cadmium", "Heavy Metals - Mercury", "Microbial Count", "Adulteration - Synthetic Fulvic Acid", "Authenticity Test"],
  },
  protein_bar: {
    composition: ["Protein per bar (g)", "Carbohydrates (g)", "Sugar (g)", "Fat (g)", "Saturated Fat (g)", "Fiber (g)", "Calories (kcal)", "Sodium (mg)"],
    safety: ["Heavy Metals - Lead", "Protein Spiking", "Artificial Colors", "Artificial Sweeteners", "Trans Fat", "Microbial Count", "Aflatoxin"],
  },
  nut_butter: {
    composition: ["Protein (g)", "Fat (g)", "Saturated Fat (g)", "Carbohydrates (g)", "Sugar (g)", "Fiber (g)", "Sodium (mg)", "Calories (kcal)"],
    safety: ["Aflatoxin (critical for peanuts)", "Heavy Metals - Lead", "Heavy Metals - Cadmium", "Pesticide Residue", "Adulteration - Vegetable Oil", "Trans Fat", "Microbial Count"],
  },
  dark_chocolate: {
    composition: ["Cocoa Solids (%)", "Sugar (g)", "Fat (g)", "Saturated Fat (g)", "Protein (g)", "Fiber (g)", "Calories (kcal)"],
    safety: ["Heavy Metals - Cadmium (critical)", "Heavy Metals - Lead", "Aflatoxin", "Pesticide Residue", "Artificial Colors", "Mineral Oil Contamination"],
  },
  default: {
    composition: ["Protein per serving (g)", "Carbohydrates (g)", "Sugar (g)", "Fat (g)", "Calories (kcal)", "Sodium (mg)"],
    safety: ["Heavy Metals - Lead", "Heavy Metals - Cadmium", "Heavy Metals - Arsenic", "Microbial Count", "Artificial Ingredients", "Label Accuracy"],
  },
}

export const getCategoryParams = (categoryValue) => {
  return FSSAI_PARAMS[categoryValue] || FSSAI_PARAMS.default
}