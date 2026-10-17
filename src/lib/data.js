// Seed catalog. Admins can add, edit and unpublish medicines from /admin;
// those changes are saved in the browser and override this list.

export const SHOP = {
  name: "MediCare",
  tagline: "Your trusted online pharmacy",
  phone: "+880 1700-000000",
  email: "support@medicare.shop",
  address: "House 12, Road 5, Dhanmondi, Dhaka 1205",
  freeDeliveryOver: 1000,
  deliveryFee: 60,
  expressFee: 100,
};

export const CATEGORIES = [
  { id: "pain-fever", name: "Pain & Fever", icon: "Thermometer", color: "#ef4444" },
  { id: "cold-allergy", name: "Cold & Allergy", icon: "Wind", color: "#0ea5e9" },
  { id: "digestive", name: "Digestive Care", icon: "Soup", color: "#f59e0b" },
  { id: "vitamins", name: "Vitamins & Supplements", icon: "Sparkles", color: "#22c55e" },
  { id: "diabetes", name: "Diabetes Care", icon: "Droplet", color: "#8b5cf6" },
  { id: "heart", name: "Heart & BP", icon: "HeartPulse", color: "#e11d48" },
  { id: "antibiotics", name: "Antibiotics", icon: "ShieldPlus", color: "#0d9488" },
  { id: "skin", name: "Skin Care", icon: "Hand", color: "#ec4899" },
  { id: "baby-mother", name: "Baby & Mother", icon: "Baby", color: "#f97316" },
  { id: "devices", name: "Medical Devices", icon: "Stethoscope", color: "#6366f1" },
  { id: "first-aid", name: "First Aid & Hygiene", icon: "BriefcaseMedical", color: "#14b8a6" },
];

export const FORMS = ["tablet", "capsule", "syrup", "cream", "drops", "injection", "sachet", "spray", "device"];

export const COUPONS = {
  HEALTH10: { type: "percent", value: 10, min: 0, label: "10% off your order" },
  FIRST50: { type: "flat", value: 50, min: 500, label: "৳50 off orders above ৳500" },
  FREESHIP: { type: "shipping", value: 0, min: 0, label: "Free standard delivery" },
};

export function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const DEFAULT_STORAGE = "Store below 30°C in a dry place, away from direct sunlight. Keep out of reach of children.";

function make(id, p) {
  const category = CATEGORIES.find((c) => c.id === p.category);
  return {
    id,
    slug: slugify(`${p.name} ${p.strength || ""}`),
    strength: "",
    rx: false,
    featured: false,
    published: true,
    rating: 4.5,
    reviews: 20,
    storage: DEFAULT_STORAGE,
    sideEffects: [],
    uses: [],
    color: category?.color || "#0d9488",
    image: null,
    ...p,
  };
}

export const PRODUCTS = [
  // Pain & Fever
  make("p1", {
    name: "Napa", generic: "Paracetamol", strength: "500mg", brand: "Beximco Pharma", category: "pain-fever",
    form: "tablet", unit: "Strip of 10 tablets", price: 12, mrp: 12, stock: 500, rating: 4.8, reviews: 312, featured: true,
    description: "Napa is one of the most widely used pain relievers and fever reducers. It is gentle on the stomach and suitable for adults and children over 12.",
    uses: ["Fever", "Headache", "Toothache", "Body ache", "Cold & flu symptoms"],
    dosage: "Adults: 1–2 tablets every 4–6 hours as needed. Do not exceed 8 tablets in 24 hours.",
    sideEffects: ["Rare skin rash", "Liver damage on overdose"],
    color: "#2563eb",
  }),
  make("p2", {
    name: "Napa Extra", generic: "Paracetamol + Caffeine", strength: "500mg/65mg", brand: "Beximco Pharma", category: "pain-fever",
    form: "tablet", unit: "Strip of 10 tablets", price: 25, mrp: 25, stock: 350, rating: 4.7, reviews: 204,
    description: "Fast relief from tension headaches and migraines. Caffeine enhances the pain-relieving effect of paracetamol.",
    uses: ["Tension headache", "Migraine", "Muscle pain", "Period pain"],
    dosage: "Adults: 1–2 tablets every 4–6 hours. Maximum 8 tablets per day.",
    sideEffects: ["Sleeplessness", "Nervousness", "Increased heart rate"],
    color: "#dc2626",
  }),
  make("p3", {
    name: "Ace Plus", generic: "Paracetamol + Caffeine", strength: "500mg/65mg", brand: "Square Pharmaceuticals", category: "pain-fever",
    form: "tablet", unit: "Strip of 10 tablets", price: 25, mrp: 25, stock: 280, rating: 4.6, reviews: 150,
    description: "Effective combination analgesic for headache, fever and general body pain.",
    uses: ["Headache", "Fever", "Toothache", "Joint pain"],
    dosage: "Adults: 1–2 tablets up to 4 times daily.",
    sideEffects: ["Mild stomach upset", "Restlessness"],
    color: "#16a34a",
  }),
  make("p4", {
    name: "Naprosyn", generic: "Naproxen", strength: "500mg", brand: "Radiant Pharma", category: "pain-fever",
    form: "tablet", unit: "Strip of 10 tablets", price: 120, mrp: 130, stock: 90, rx: true, rating: 4.4, reviews: 45,
    description: "A non-steroidal anti-inflammatory drug (NSAID) used for arthritis pain, inflammation and menstrual cramps.",
    uses: ["Rheumatoid arthritis", "Osteoarthritis", "Menstrual cramps", "Back pain"],
    dosage: "As prescribed. Usually 1 tablet twice daily after meals.",
    sideEffects: ["Heartburn", "Nausea", "Dizziness"],
    color: "#7c3aed",
  }),

  // Cold & Allergy
  make("p5", {
    name: "Fexo", generic: "Fexofenadine", strength: "120mg", brand: "Square Pharmaceuticals", category: "cold-allergy",
    form: "tablet", unit: "Strip of 10 tablets", price: 90, mrp: 100, stock: 240, rating: 4.7, reviews: 188, featured: true,
    description: "Non-drowsy antihistamine that relieves seasonal allergy symptoms like sneezing, runny nose and itchy eyes.",
    uses: ["Allergic rhinitis", "Hay fever", "Hives", "Itchy watery eyes"],
    dosage: "Adults and children over 12: 1 tablet once daily.",
    sideEffects: ["Headache", "Drowsiness (rare)", "Nausea"],
    color: "#f97316",
  }),
  make("p6", {
    name: "Alatrol", generic: "Cetirizine", strength: "10mg", brand: "Square Pharmaceuticals", category: "cold-allergy",
    form: "tablet", unit: "Strip of 10 tablets", price: 30, mrp: 30, stock: 400, rating: 4.5, reviews: 132,
    description: "Antihistamine for fast relief of allergy symptoms and skin itching.",
    uses: ["Sneezing", "Runny nose", "Skin allergy", "Urticaria"],
    dosage: "Adults: 1 tablet once daily, preferably in the evening.",
    sideEffects: ["Drowsiness", "Dry mouth", "Fatigue"],
    color: "#0891b2",
  }),
  make("p7", {
    name: "Monas", generic: "Montelukast", strength: "10mg", brand: "ACME Laboratories", category: "cold-allergy",
    form: "tablet", unit: "Strip of 10 tablets", price: 160, mrp: 175, stock: 150, rx: true, rating: 4.6, reviews: 76,
    description: "Leukotriene receptor antagonist for prevention of asthma attacks and relief of allergic rhinitis.",
    uses: ["Asthma prevention", "Allergic rhinitis", "Exercise-induced bronchospasm"],
    dosage: "1 tablet once daily in the evening, or as prescribed.",
    sideEffects: ["Headache", "Abdominal pain", "Mood changes"],
    color: "#4f46e5",
  }),
  make("p8", {
    name: "Tusca Plus", generic: "Herbal Cough Syrup", strength: "100ml", brand: "Square Herbal", category: "cold-allergy",
    form: "syrup", unit: "Bottle of 100ml", price: 90, mrp: 95, stock: 120, rating: 4.3, reviews: 58,
    description: "Herbal cough syrup made with honey, tulsi and basak to soothe dry and productive cough.",
    uses: ["Dry cough", "Productive cough", "Sore throat"],
    dosage: "Adults: 2 teaspoons 3–4 times daily. Children: 1 teaspoon 3 times daily.",
    sideEffects: ["Generally well tolerated"],
    color: "#b45309",
  }),
  make("p9", {
    name: "Otrivin", generic: "Xylometazoline", strength: "0.1%", brand: "Novartis", category: "cold-allergy",
    form: "spray", unit: "Nasal spray 10ml", price: 140, mrp: 150, stock: 70, rating: 4.5, reviews: 91,
    description: "Decongestant nasal spray that clears a blocked nose within minutes and lasts up to 10 hours.",
    uses: ["Blocked nose", "Sinusitis", "Common cold"],
    dosage: "1 spray in each nostril up to 3 times daily. Do not use for more than 7 days.",
    sideEffects: ["Nasal irritation", "Sneezing"],
    color: "#0284c7",
  }),

  // Digestive
  make("p10", {
    name: "Seclo", generic: "Omeprazole", strength: "20mg", brand: "Square Pharmaceuticals", category: "digestive",
    form: "capsule", unit: "Strip of 10 capsules", price: 60, mrp: 60, stock: 380, rating: 4.7, reviews: 260, featured: true,
    description: "Proton pump inhibitor that reduces stomach acid. Used for acidity, heartburn and gastric ulcers.",
    uses: ["Acidity", "Heartburn", "Gastric ulcer", "GERD"],
    dosage: "1 capsule daily, 30 minutes before breakfast.",
    sideEffects: ["Headache", "Diarrhoea", "Stomach pain"],
    color: "#9333ea",
  }),
  make("p11", {
    name: "Sergel", generic: "Esomeprazole", strength: "20mg", brand: "Healthcare Pharma", category: "digestive",
    form: "capsule", unit: "Strip of 10 capsules", price: 70, mrp: 70, stock: 300, rating: 4.6, reviews: 170,
    description: "Long-lasting acid control for heartburn, reflux and peptic ulcer disease.",
    uses: ["Reflux", "Peptic ulcer", "H. pylori (with antibiotics)"],
    dosage: "1 capsule once daily before a meal.",
    sideEffects: ["Nausea", "Flatulence", "Dry mouth"],
    color: "#db2777",
  }),
  make("p12", {
    name: "Entacyd Plus", generic: "Antacid Suspension", strength: "200ml", brand: "Square Pharmaceuticals", category: "digestive",
    form: "syrup", unit: "Bottle of 200ml", price: 95, mrp: 100, stock: 140, rating: 4.4, reviews: 83,
    description: "Mint-flavoured antacid suspension for quick relief of acidity, gas and indigestion.",
    uses: ["Indigestion", "Gas & bloating", "Heartburn"],
    dosage: "2–4 teaspoons after meals and at bedtime.",
    sideEffects: ["Constipation", "Chalky taste"],
    color: "#059669",
  }),
  make("p13", {
    name: "Orsaline-N", generic: "Oral Rehydration Salts", strength: "10.25g", brand: "SMC", category: "digestive",
    form: "sachet", unit: "Box of 20 sachets", price: 120, mrp: 120, stock: 600, rating: 4.9, reviews: 410, featured: true,
    description: "Replaces lost fluids and electrolytes due to diarrhoea, vomiting or heat exhaustion.",
    uses: ["Diarrhoea", "Dehydration", "Heat stroke", "Vomiting"],
    dosage: "Dissolve 1 sachet in 500ml clean drinking water. Drink after each loose stool.",
    sideEffects: ["Vomiting if taken too quickly"],
    color: "#0ea5e9",
  }),
  make("p14", {
    name: "Emistat", generic: "Ondansetron", strength: "8mg", brand: "Incepta Pharma", category: "digestive",
    form: "tablet", unit: "Strip of 10 tablets", price: 180, mrp: 200, stock: 80, rx: true, rating: 4.5, reviews: 39,
    description: "Anti-emetic used to prevent nausea and vomiting caused by chemotherapy, surgery or gastroenteritis.",
    uses: ["Nausea", "Vomiting", "Post-operative sickness"],
    dosage: "As prescribed by your physician.",
    sideEffects: ["Constipation", "Headache", "Fatigue"],
    color: "#ca8a04",
  }),

  // Vitamins
  make("p15", {
    name: "Ceevit", generic: "Vitamin C (Chewable)", strength: "250mg", brand: "Square Pharmaceuticals", category: "vitamins",
    form: "tablet", unit: "Strip of 10 tablets", price: 15, mrp: 15, stock: 700, rating: 4.6, reviews: 220,
    description: "Orange-flavoured chewable vitamin C that supports immunity, skin health and iron absorption.",
    uses: ["Immunity boost", "Vitamin C deficiency", "Healthy gums & skin"],
    dosage: "1–2 tablets daily, chewed.",
    color: "#f97316",
  }),
  make("p16", {
    name: "Calbo-D", generic: "Calcium + Vitamin D3", strength: "500mg/200IU", brand: "Square Pharmaceuticals", category: "vitamins",
    form: "tablet", unit: "Bottle of 30 tablets", price: 300, mrp: 330, stock: 210, rating: 4.7, reviews: 175, featured: true,
    description: "Calcium with vitamin D3 for strong bones and teeth. Ideal for pregnancy, lactation and osteoporosis.",
    uses: ["Osteoporosis", "Calcium deficiency", "Pregnancy & lactation"],
    dosage: "1 tablet twice daily after meals.",
    sideEffects: ["Constipation", "Bloating"],
    color: "#0d9488",
  }),
  make("p17", {
    name: "Bextram Gold", generic: "Multivitamin & Multimineral", strength: "30 tablets", brand: "Beximco Pharma", category: "vitamins",
    form: "tablet", unit: "Bottle of 30 tablets", price: 330, mrp: 360, stock: 160, rating: 4.6, reviews: 142,
    description: "Complete A-to-Zinc multivitamin formula for daily energy, immunity and overall wellness.",
    uses: ["Daily nutrition", "Fatigue", "Recovery from illness"],
    dosage: "1 tablet daily after breakfast.",
    color: "#d97706",
  }),
  make("p18", {
    name: "Neuro-B", generic: "Vitamin B1, B6, B12", strength: "100/200/200mcg", brand: "Square Pharmaceuticals", category: "vitamins",
    form: "tablet", unit: "Strip of 10 tablets", price: 90, mrp: 90, stock: 190, rating: 4.5, reviews: 98,
    description: "Vitamin B complex for nerve health, tingling, numbness and neuropathy.",
    uses: ["Peripheral neuropathy", "Numbness", "Vitamin B deficiency"],
    dosage: "1 tablet 1–3 times daily.",
    color: "#e11d48",
  }),
  make("p19", {
    name: "Marine Omega", generic: "Omega-3 Fish Oil", strength: "1000mg", brand: "Healthcare Pharma", category: "vitamins",
    form: "capsule", unit: "Bottle of 30 softgels", price: 450, mrp: 500, stock: 100, rating: 4.4, reviews: 64,
    description: "High-purity EPA and DHA omega-3 fatty acids for heart, brain and joint health.",
    uses: ["Heart health", "Brain function", "Joint support"],
    dosage: "1 softgel daily with food.",
    sideEffects: ["Fishy aftertaste", "Mild indigestion"],
    color: "#ca8a04",
  }),

  // Diabetes
  make("p20", {
    name: "Comet", generic: "Metformin", strength: "500mg", brand: "Square Pharmaceuticals", category: "diabetes",
    form: "tablet", unit: "Strip of 10 tablets", price: 60, mrp: 60, stock: 330, rx: true, rating: 4.6, reviews: 120,
    description: "First-line medicine for type 2 diabetes that helps control blood sugar levels.",
    uses: ["Type 2 diabetes", "Insulin resistance", "PCOS"],
    dosage: "As prescribed. Usually 1 tablet 2–3 times daily with meals.",
    sideEffects: ["Nausea", "Diarrhoea", "Metallic taste"],
    color: "#7c3aed",
  }),
  make("p21", {
    name: "Secrin", generic: "Glimepiride", strength: "2mg", brand: "Healthcare Pharma", category: "diabetes",
    form: "tablet", unit: "Strip of 10 tablets", price: 100, mrp: 100, stock: 150, rx: true, rating: 4.4, reviews: 44,
    description: "Sulfonylurea that stimulates insulin release to lower blood sugar in type 2 diabetes.",
    uses: ["Type 2 diabetes"],
    dosage: "1 tablet once daily with breakfast, or as prescribed.",
    sideEffects: ["Low blood sugar", "Weight gain", "Dizziness"],
    color: "#16a34a",
  }),
  make("p22", {
    name: "Mixtard 30", generic: "Human Insulin (30/70)", strength: "100 IU/ml", brand: "Novo Nordisk", category: "diabetes",
    form: "injection", unit: "Vial of 10ml", price: 450, mrp: 480, stock: 60, rx: true, rating: 4.8, reviews: 88,
    description: "Premixed human insulin for adults with diabetes who require insulin therapy.",
    uses: ["Type 1 diabetes", "Type 2 diabetes"],
    dosage: "Subcutaneous injection as prescribed by your doctor.",
    sideEffects: ["Hypoglycaemia", "Injection site reaction"],
    storage: "Store unopened vials in a refrigerator (2–8°C). Do not freeze.",
    color: "#2563eb",
  }),
  make("p23", {
    name: "Accu-Chek Instant", generic: "Blood Glucose Meter", strength: "Kit", brand: "Roche", category: "diabetes",
    form: "device", unit: "1 meter + 10 strips", price: 1650, mrp: 1900, stock: 35, rating: 4.7, reviews: 67, featured: true,
    description: "Easy-to-use glucometer with a simple range indicator and Bluetooth connectivity.",
    uses: ["Blood sugar monitoring at home"],
    dosage: "Follow the instructions in the user manual.",
    storage: "Store in the carrying case at room temperature.",
    color: "#0f766e",
  }),
  make("p24", {
    name: "Accu-Chek Instant Strips", generic: "Glucose Test Strips", strength: "50 strips", brand: "Roche", category: "diabetes",
    form: "device", unit: "Box of 50 strips", price: 1200, mrp: 1300, stock: 80, rating: 4.6, reviews: 52,
    description: "Test strips compatible with the Accu-Chek Instant meter.",
    uses: ["Blood sugar monitoring"],
    dosage: "Use one strip per test.",
    color: "#0e7490",
  }),

  // Heart & BP
  make("p25", {
    name: "Osartil", generic: "Losartan Potassium", strength: "50mg", brand: "Incepta Pharma", category: "heart",
    form: "tablet", unit: "Strip of 10 tablets", price: 80, mrp: 80, stock: 260, rx: true, rating: 4.5, reviews: 95,
    description: "Angiotensin receptor blocker used to treat high blood pressure and protect the kidneys in diabetes.",
    uses: ["Hypertension", "Diabetic nephropathy", "Heart failure"],
    dosage: "1 tablet once daily, or as prescribed.",
    sideEffects: ["Dizziness", "High potassium", "Fatigue"],
    color: "#be123c",
  }),
  make("p26", {
    name: "Bisocor", generic: "Bisoprolol", strength: "2.5mg", brand: "Healthcare Pharma", category: "heart",
    form: "tablet", unit: "Strip of 10 tablets", price: 70, mrp: 70, stock: 180, rx: true, rating: 4.5, reviews: 61,
    description: "Beta-blocker for high blood pressure, angina and heart failure.",
    uses: ["Hypertension", "Angina", "Heart failure"],
    dosage: "1 tablet once daily in the morning.",
    sideEffects: ["Cold hands", "Tiredness", "Slow heartbeat"],
    color: "#ea580c",
  }),
  make("p27", {
    name: "Anclog", generic: "Clopidogrel", strength: "75mg", brand: "Square Pharmaceuticals", category: "heart",
    form: "tablet", unit: "Strip of 10 tablets", price: 120, mrp: 120, stock: 140, rx: true, rating: 4.6, reviews: 50,
    description: "Antiplatelet medicine that prevents blood clots after heart attack, stroke or stent placement.",
    uses: ["Stroke prevention", "Heart attack prevention", "After stenting"],
    dosage: "1 tablet once daily.",
    sideEffects: ["Bleeding", "Bruising", "Stomach upset"],
    color: "#9f1239",
  }),
  make("p28", {
    name: "Rosuva", generic: "Rosuvastatin", strength: "10mg", brand: "Square Pharmaceuticals", category: "heart",
    form: "tablet", unit: "Strip of 10 tablets", price: 150, mrp: 160, stock: 170, rx: true, rating: 4.5, reviews: 57,
    description: "Statin that lowers LDL cholesterol and reduces the risk of heart disease.",
    uses: ["High cholesterol", "Heart disease prevention"],
    dosage: "1 tablet once daily at the same time each day.",
    sideEffects: ["Muscle pain", "Headache", "Constipation"],
    color: "#c026d3",
  }),

  // Antibiotics
  make("p29", {
    name: "Azithrocin", generic: "Azithromycin", strength: "500mg", brand: "Beximco Pharma", category: "antibiotics",
    form: "tablet", unit: "Strip of 3 tablets", price: 105, mrp: 105, stock: 220, rx: true, rating: 4.6, reviews: 140,
    description: "Macrolide antibiotic for respiratory, throat, ear and skin infections. Short 3-day course.",
    uses: ["Throat infection", "Pneumonia", "Typhoid", "Skin infection"],
    dosage: "1 tablet once daily for 3 days, or as prescribed. Complete the full course.",
    sideEffects: ["Diarrhoea", "Nausea", "Abdominal pain"],
    color: "#0d9488",
  }),
  make("p30", {
    name: "Moxacil", generic: "Amoxicillin", strength: "500mg", brand: "Square Pharmaceuticals", category: "antibiotics",
    form: "capsule", unit: "Strip of 10 capsules", price: 140, mrp: 140, stock: 200, rx: true, rating: 4.5, reviews: 102,
    description: "Broad-spectrum penicillin antibiotic for a wide range of bacterial infections.",
    uses: ["Ear infection", "Urinary tract infection", "Dental abscess", "Chest infection"],
    dosage: "1 capsule every 8 hours, or as prescribed.",
    sideEffects: ["Diarrhoea", "Rash", "Allergic reaction"],
    color: "#b91c1c",
  }),
  make("p31", {
    name: "Cef-3", generic: "Cefixime", strength: "200mg", brand: "Square Pharmaceuticals", category: "antibiotics",
    form: "capsule", unit: "Strip of 6 capsules", price: 210, mrp: 230, stock: 160, rx: true, rating: 4.6, reviews: 88,
    description: "Third-generation cephalosporin antibiotic for typhoid, UTI and respiratory infections.",
    uses: ["Typhoid fever", "UTI", "Bronchitis", "Gonorrhoea"],
    dosage: "1 capsule twice daily, or as prescribed.",
    sideEffects: ["Loose stools", "Abdominal pain", "Headache"],
    color: "#1d4ed8",
  }),
  make("p32", {
    name: "Ciprocin", generic: "Ciprofloxacin", strength: "500mg", brand: "Square Pharmaceuticals", category: "antibiotics",
    form: "tablet", unit: "Strip of 10 tablets", price: 150, mrp: 150, stock: 190, rx: true, rating: 4.4, reviews: 73,
    description: "Fluoroquinolone antibiotic for urinary, gut and bone infections.",
    uses: ["Urinary tract infection", "Traveller's diarrhoea", "Bone infection"],
    dosage: "1 tablet twice daily for 5–10 days, or as prescribed.",
    sideEffects: ["Nausea", "Dizziness", "Tendon pain (rare)"],
    color: "#0369a1",
  }),

  // Skin
  make("p33", {
    name: "Betnovate-N", generic: "Betamethasone + Neomycin", strength: "15g", brand: "GSK", category: "skin",
    form: "cream", unit: "Tube of 15g", price: 85, mrp: 90, stock: 130, rx: true, rating: 4.4, reviews: 66,
    description: "Steroid and antibiotic cream for inflamed skin conditions with bacterial infection.",
    uses: ["Eczema", "Dermatitis", "Infected skin lesions"],
    dosage: "Apply a thin layer to the affected area 2–3 times daily.",
    sideEffects: ["Skin thinning with long use", "Burning"],
    color: "#15803d",
  }),
  make("p34", {
    name: "Fungidal", generic: "Miconazole Nitrate", strength: "2% · 20g", brand: "ACME Laboratories", category: "skin",
    form: "cream", unit: "Tube of 20g", price: 60, mrp: 65, stock: 170, rating: 4.3, reviews: 47,
    description: "Antifungal cream for ringworm, athlete's foot, jock itch and candida skin infections.",
    uses: ["Ringworm", "Athlete's foot", "Jock itch", "Fungal nail infection"],
    dosage: "Apply twice daily for 2–6 weeks.",
    sideEffects: ["Mild irritation"],
    color: "#a21caf",
  }),
  make("p35", {
    name: "Scabex", generic: "Permethrin", strength: "5% · 30g", brand: "ACME Laboratories", category: "skin",
    form: "cream", unit: "Tube of 30g", price: 90, mrp: 95, stock: 90, rating: 4.5, reviews: 38,
    description: "Treatment for scabies and head lice. Apply from neck to toes and wash off after 8–14 hours.",
    uses: ["Scabies", "Head lice"],
    dosage: "Single application; repeat after 7 days if needed.",
    sideEffects: ["Itching", "Tingling"],
    color: "#4338ca",
  }),
  make("p36", {
    name: "Sunshield SPF 50", generic: "Broad-spectrum Sunscreen", strength: "50ml", brand: "Derma Lab", category: "skin",
    form: "cream", unit: "Tube of 50ml", price: 650, mrp: 750, stock: 55, rating: 4.6, reviews: 29,
    description: "Lightweight, non-greasy sunscreen with UVA/UVB protection. Suitable for all skin types.",
    uses: ["Sun protection", "Prevents tanning", "Daily skincare"],
    dosage: "Apply generously 15 minutes before sun exposure. Reapply every 2 hours.",
    color: "#f59e0b",
  }),

  // Baby & Mother
  make("p37", {
    name: "Napa Syrup", generic: "Paracetamol (Paediatric)", strength: "120mg/5ml", brand: "Beximco Pharma", category: "baby-mother",
    form: "syrup", unit: "Bottle of 60ml", price: 35, mrp: 35, stock: 260, rating: 4.8, reviews: 190,
    description: "Paediatric paracetamol suspension for fever and pain in children.",
    uses: ["Fever in children", "Teething pain", "Post-vaccination fever"],
    dosage: "Children: 10–15mg/kg every 4–6 hours. Use the measuring cup provided.",
    color: "#2563eb",
  }),
  make("p38", {
    name: "Folison", generic: "Folic Acid", strength: "5mg", brand: "Square Pharmaceuticals", category: "baby-mother",
    form: "tablet", unit: "Strip of 10 tablets", price: 30, mrp: 30, stock: 300, rating: 4.7, reviews: 84,
    description: "Folic acid supplement essential before and during pregnancy for healthy foetal development.",
    uses: ["Pregnancy", "Anaemia", "Folate deficiency"],
    dosage: "1 tablet daily, or as advised.",
    color: "#e11d48",
  }),
  make("p39", {
    name: "Baby Rash Cream", generic: "Zinc Oxide", strength: "50g", brand: "Derma Lab", category: "baby-mother",
    form: "cream", unit: "Tube of 50g", price: 180, mrp: 200, stock: 75, rating: 4.6, reviews: 41,
    description: "Gentle barrier cream that soothes and protects your baby's skin from nappy rash.",
    uses: ["Nappy rash", "Minor skin irritation"],
    dosage: "Apply at every nappy change.",
    color: "#f472b6",
  }),

  // Devices
  make("p40", {
    name: "Digital Thermometer", generic: "Omron MC-246", strength: "Flexible tip", brand: "Omron", category: "devices",
    form: "device", unit: "1 piece", price: 350, mrp: 400, stock: 120, rating: 4.5, reviews: 103, featured: true,
    description: "Fast 60-second reading with fever alarm and memory of the last reading.",
    uses: ["Body temperature measurement"],
    dosage: "Oral, underarm or rectal use.",
    color: "#0ea5e9",
  }),
  make("p41", {
    name: "BP Monitor", generic: "Omron HEM-7120", strength: "Automatic", brand: "Omron", category: "devices",
    form: "device", unit: "1 piece", price: 3500, mrp: 3900, stock: 25, rating: 4.7, reviews: 72, featured: true,
    description: "Clinically validated automatic upper-arm blood pressure monitor with irregular heartbeat detection.",
    uses: ["Home blood pressure monitoring"],
    dosage: "Sit quietly for 5 minutes before measuring.",
    color: "#4f46e5",
  }),
  make("p42", {
    name: "Pulse Oximeter", generic: "Fingertip SpO2 Monitor", strength: "OLED", brand: "Beurer", category: "devices",
    form: "device", unit: "1 piece", price: 1500, mrp: 1800, stock: 40, rating: 4.4, reviews: 55,
    description: "Measures blood oxygen saturation (SpO2) and pulse rate in seconds.",
    uses: ["Oxygen level monitoring", "COVID-19 home care", "Sports"],
    dosage: "Place on fingertip and hold still for 10 seconds.",
    color: "#dc2626",
  }),
  make("p43", {
    name: "Nebulizer Machine", generic: "Compressor Nebulizer", strength: "With mask kit", brand: "Omron", category: "devices",
    form: "device", unit: "1 piece", price: 2800, mrp: 3200, stock: 0, rating: 4.6, reviews: 34,
    description: "Quiet compressor nebulizer for asthma and COPD medication delivery for adults and children.",
    uses: ["Asthma", "COPD", "Bronchitis"],
    dosage: "Use with prescribed nebulizer solution.",
    color: "#059669",
  }),

  // First aid & hygiene
  make("p44", {
    name: "Savlon Antiseptic", generic: "Chlorhexidine + Cetrimide", strength: "112ml", brand: "ACI Limited", category: "first-aid",
    form: "syrup", unit: "Bottle of 112ml", price: 70, mrp: 75, stock: 320, rating: 4.7, reviews: 150,
    description: "Antiseptic liquid for cleaning cuts, wounds and for personal hygiene.",
    uses: ["Wound cleaning", "Cuts & scrapes", "Personal hygiene"],
    dosage: "Dilute as directed on the label.",
    color: "#ea580c",
  }),
  make("p45", {
    name: "Povisep", generic: "Povidone-Iodine", strength: "10% · 100ml", brand: "Jayson Pharma", category: "first-aid",
    form: "drops", unit: "Bottle of 100ml", price: 110, mrp: 120, stock: 110, rating: 4.5, reviews: 62,
    description: "Broad-spectrum antiseptic solution for wounds, burns and pre-surgical skin preparation.",
    uses: ["Minor wounds", "Burns", "Skin disinfection"],
    dosage: "Apply to the affected area 1–3 times daily.",
    color: "#92400e",
  }),
  make("p46", {
    name: "Adhesive Bandages", generic: "Assorted Strips", strength: "100 pcs", brand: "Hansaplast", category: "first-aid",
    form: "device", unit: "Box of 100", price: 180, mrp: 200, stock: 200, rating: 4.5, reviews: 70,
    description: "Breathable, water-resistant bandages in assorted sizes for everyday cuts and grazes.",
    uses: ["Cuts", "Blisters", "Grazes"],
    dosage: "Apply to clean, dry skin.",
    color: "#d97706",
  }),
  make("p47", {
    name: "Hand Sanitizer", generic: "70% Alcohol Gel", strength: "250ml", brand: "ACI Limited", category: "first-aid",
    form: "spray", unit: "Pump bottle 250ml", price: 150, mrp: 170, stock: 260, rating: 4.4, reviews: 88,
    description: "Kills 99.9% of germs without water. Enriched with aloe vera to keep hands soft.",
    uses: ["Hand hygiene", "Travel"],
    dosage: "Rub a small amount over hands until dry.",
    color: "#0891b2",
  }),
  make("p48", {
    name: "Surgical Face Mask", generic: "3-ply Disposable", strength: "50 pcs", brand: "MediGuard", category: "first-aid",
    form: "device", unit: "Box of 50", price: 250, mrp: 300, stock: 400, rating: 4.3, reviews: 120,
    description: "Comfortable 3-ply masks with a melt-blown filter layer and adjustable nose clip.",
    uses: ["Infection protection", "Dust & pollution"],
    dosage: "Single use. Replace every 4–6 hours.",
    color: "#38bdf8",
  }),
];

export const TESTIMONIALS = [
  { name: "Farhana Rahman", city: "Dhaka", text: "Ordered my mother's diabetes medicines at night and received them the next morning. Genuine products and neatly packed.", rating: 5 },
  { name: "Tanvir Hasan", city: "Chattogram", text: "The prescription upload is so easy. The pharmacist called me to confirm the dosage before dispatch. Very professional.", rating: 5 },
  { name: "Nusrat Jahan", city: "Sylhet", text: "Prices are lower than my local pharmacy and the discount coupons are a nice bonus. Highly recommended!", rating: 4 },
];

export const FAQS = [
  { q: "Are all medicines genuine?", a: "Yes. We source every product directly from licensed manufacturers and authorised distributors, and each order is checked by a registered pharmacist." },
  { q: "Do I need a prescription?", a: "Medicines marked “Rx” require a valid prescription from a registered doctor. You can upload a photo of it at checkout or from the Upload Prescription page." },
  { q: "How long does delivery take?", a: "Inside Dhaka we deliver within 24 hours; express delivery arrives in 2–4 hours. Outside Dhaka orders take 2–3 working days." },
  { q: "What payment methods do you accept?", a: "Cash on delivery, debit/credit cards and mobile banking (bKash, Nagad, Rocket)." },
  { q: "Can I return a product?", a: "Unopened, non-refrigerated products can be returned within 7 days of delivery. Damaged or wrong items are replaced free of charge." },
  { q: "Is my personal information safe?", a: "We never share your health information. Prescriptions are only visible to our pharmacists." },
];
