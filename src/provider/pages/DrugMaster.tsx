import { useState, useMemo, useEffect } from 'react';
import {
  Search,
  AlertTriangle,
  Shield,
  Info,
  Package,
  X,
  Plus,
  Plug,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════ */

interface DrugInteraction {
  drug: string;
  severity: 'Major' | 'Moderate' | 'Minor';
  description: string;
}

interface DrugMasterEntry {
  id: string;
  brandName: string;
  genericName: string;
  category: string;
  form: string;
  strength: string;
  route: string;
  hmoCovered: boolean;
  philhealthCovered: boolean;
  controlledSchedule?: string;
  stockStatus: 'In Stock' | 'Low Stock' | 'Out of Stock';
  priceRange: string;
  indications: string[];
  contraindications: string[];
  commonDosages: string[];
  interactions: DrugInteraction[];
  alternatives: string[];
  warnings?: string[];
}

/* ═══════════════════════════════════════════════════
   Drug Data (~35 entries)
   ═══════════════════════════════════════════════════ */

const DRUG_DATA: DrugMasterEntry[] = [
  // ─── Cardiovascular ─────────────────────────
  {
    id: 'dm-1',
    brandName: 'Cozaar',
    genericName: 'Losartan Potassium',
    category: 'Cardiovascular',
    form: 'Tablet',
    strength: '50mg',
    route: 'Oral',
    hmoCovered: true,
    philhealthCovered: true,
    controlledSchedule: undefined,
    stockStatus: 'In Stock',
    priceRange: '₱8 – ₱25 / tab',
    indications: [
      'Hypertension',
      'Diabetic nephropathy in type 2 diabetes',
      'Stroke risk reduction in patients with hypertension and left ventricular hypertrophy',
    ],
    contraindications: [
      'Pregnancy (2nd & 3rd trimester)',
      'Bilateral renal artery stenosis',
      'Hypersensitivity to losartan',
      'Concomitant aliskiren use in patients with diabetes',
    ],
    commonDosages: [
      '50mg once daily (initial)',
      '100mg once daily (max)',
      '25mg once daily (hepatic impairment / volume-depleted)',
    ],
    interactions: [
      { drug: 'Potassium supplements', severity: 'Major', description: 'Increased risk of hyperkalemia' },
      { drug: 'NSAIDs (Ibuprofen)', severity: 'Moderate', description: 'May reduce antihypertensive effect and worsen renal function' },
      { drug: 'Lithium', severity: 'Moderate', description: 'Increased lithium levels and toxicity risk' },
    ],
    alternatives: ['Valsartan', 'Irbesartan', 'Telmisartan', 'Candesartan'],
    warnings: ['Monitor potassium and renal function periodically', 'Avoid in pregnancy — discontinue immediately if pregnancy detected'],
  },
  {
    id: 'dm-2',
    brandName: 'Norvasc',
    genericName: 'Amlodipine Besylate',
    category: 'Cardiovascular',
    form: 'Tablet',
    strength: '5mg',
    route: 'Oral',
    hmoCovered: true,
    philhealthCovered: true,
    stockStatus: 'In Stock',
    priceRange: '₱5 – ₱20 / tab',
    indications: [
      'Hypertension',
      'Chronic stable angina',
      'Vasospastic (Prinzmetal) angina',
    ],
    contraindications: [
      'Severe aortic stenosis',
      'Hypersensitivity to dihydropyridine calcium channel blockers',
    ],
    commonDosages: [
      '5mg once daily (initial)',
      '10mg once daily (max)',
      '2.5mg once daily (elderly / hepatic impairment)',
    ],
    interactions: [
      { drug: 'Simvastatin', severity: 'Moderate', description: 'Limit simvastatin to 20mg/day when used with amlodipine' },
      { drug: 'CYP3A4 inhibitors', severity: 'Moderate', description: 'May increase amlodipine levels' },
      { drug: 'Cyclosporine', severity: 'Moderate', description: 'Increased cyclosporine levels' },
    ],
    alternatives: ['Felodipine', 'Nifedipine', 'Lercanidipine'],
    warnings: ['Peripheral edema is dose-dependent', 'Avoid abrupt withdrawal in angina patients'],
  },
  {
    id: 'dm-3',
    brandName: 'Lipitor',
    genericName: 'Atorvastatin Calcium',
    category: 'Cardiovascular',
    form: 'Tablet',
    strength: '20mg',
    route: 'Oral',
    hmoCovered: true,
    philhealthCovered: true,
    stockStatus: 'In Stock',
    priceRange: '₱10 – ₱35 / tab',
    indications: [
      'Primary hypercholesterolemia',
      'Mixed dyslipidemia',
      'Cardiovascular risk reduction in patients with multiple risk factors',
      'Heterozygous familial hypercholesterolemia',
    ],
    contraindications: [
      'Active liver disease or unexplained persistent elevations in transaminases',
      'Pregnancy and lactation',
      'Hypersensitivity to any component',
    ],
    commonDosages: [
      '10–20mg once daily (initial)',
      '40–80mg once daily (intensive lipid lowering)',
    ],
    interactions: [
      { drug: 'Gemfibrozil', severity: 'Major', description: 'Significantly increased risk of rhabdomyolysis' },
      { drug: 'Clarithromycin', severity: 'Major', description: 'Increased statin exposure — limit atorvastatin dose to 20mg' },
      { drug: 'Grapefruit juice (large amounts)', severity: 'Minor', description: 'Modestly increases atorvastatin levels' },
    ],
    alternatives: ['Rosuvastatin', 'Simvastatin', 'Pravastatin', 'Pitavastatin'],
    warnings: ['Obtain baseline LFTs before initiating', 'Counsel patients to report unexplained muscle pain promptly'],
  },
  {
    id: 'dm-4',
    brandName: 'Lopressor',
    genericName: 'Metoprolol Tartrate',
    category: 'Cardiovascular',
    form: 'Tablet',
    strength: '50mg',
    route: 'Oral',
    hmoCovered: true,
    philhealthCovered: false,
    stockStatus: 'In Stock',
    priceRange: '₱6 – ₱18 / tab',
    indications: [
      'Hypertension',
      'Angina pectoris',
      'Heart failure (succinate form)',
      'Myocardial infarction (early treatment)',
    ],
    contraindications: [
      'Sinus bradycardia (HR < 45)',
      'Heart block greater than first degree',
      'Cardiogenic shock',
      'Decompensated cardiac failure',
    ],
    commonDosages: [
      '25–50mg twice daily (initial)',
      '100mg twice daily (usual maintenance)',
      '200mg twice daily (max)',
    ],
    interactions: [
      { drug: 'Verapamil / Diltiazem', severity: 'Major', description: 'Risk of severe bradycardia, AV block, and heart failure' },
      { drug: 'Clonidine', severity: 'Moderate', description: 'Rebound hypertension if clonidine withdrawn while on beta-blocker' },
      { drug: 'Fluoxetine / Paroxetine', severity: 'Moderate', description: 'CYP2D6 inhibition — increased metoprolol levels' },
    ],
    alternatives: ['Bisoprolol', 'Carvedilol', 'Nebivolol', 'Atenolol'],
    warnings: ['Do not abruptly discontinue — taper over 1–2 weeks', 'May mask hypoglycemia symptoms in diabetic patients'],
  },
  {
    id: 'dm-5',
    brandName: 'Plavix',
    genericName: 'Clopidogrel Bisulfate',
    category: 'Cardiovascular',
    form: 'Tablet',
    strength: '75mg',
    route: 'Oral',
    hmoCovered: true,
    philhealthCovered: true,
    stockStatus: 'Low Stock',
    priceRange: '₱15 – ₱45 / tab',
    indications: [
      'Acute coronary syndrome (ACS)',
      'Recent MI, recent stroke, or established peripheral arterial disease',
      'Coronary stent placement (dual antiplatelet therapy)',
    ],
    contraindications: [
      'Active pathological bleeding',
      'Severe hepatic impairment',
      'Hypersensitivity to clopidogrel',
    ],
    commonDosages: [
      '75mg once daily (maintenance)',
      '300mg loading dose (ACS)',
      '600mg loading dose (PCI)',
    ],
    interactions: [
      { drug: 'Omeprazole / Esomeprazole', severity: 'Major', description: 'CYP2C19 inhibition reduces active metabolite — use pantoprazole instead' },
      { drug: 'Warfarin', severity: 'Major', description: 'Increased bleeding risk' },
      { drug: 'NSAIDs', severity: 'Moderate', description: 'Additive bleeding risk' },
    ],
    alternatives: ['Ticagrelor', 'Prasugrel', 'Aspirin (monotherapy)'],
    warnings: ['Discontinue 5–7 days before elective surgery', 'CYP2C19 poor metabolizers have reduced efficacy — consider genotyping'],
  },

  // ─── Diabetes ───────────────────────────────
  {
    id: 'dm-6',
    brandName: 'Glucophage',
    genericName: 'Metformin Hydrochloride',
    category: 'Diabetes',
    form: 'Tablet',
    strength: '500mg',
    route: 'Oral',
    hmoCovered: true,
    philhealthCovered: true,
    stockStatus: 'In Stock',
    priceRange: '₱3 – ₱12 / tab',
    indications: [
      'Type 2 diabetes mellitus (first-line monotherapy)',
      'Polycystic ovary syndrome (off-label)',
      'Pre-diabetes / metabolic syndrome (off-label)',
    ],
    contraindications: [
      'eGFR < 30 mL/min/1.73m²',
      'Metabolic acidosis, including diabetic ketoacidosis',
      'Conditions predisposing to lactic acidosis (sepsis, dehydration, shock)',
    ],
    commonDosages: [
      '500mg once or twice daily (initial)',
      '500–1000mg twice daily (usual)',
      '2550mg/day in divided doses (max)',
    ],
    interactions: [
      { drug: 'Iodinated contrast media', severity: 'Major', description: 'Hold metformin 48h before and after contrast — risk of lactic acidosis' },
      { drug: 'Alcohol', severity: 'Moderate', description: 'Increased risk of lactic acidosis and hypoglycemia' },
      { drug: 'Carbonic anhydrase inhibitors', severity: 'Minor', description: 'Additive metabolic acidosis risk' },
    ],
    alternatives: ['Sitagliptin', 'Glimepiride', 'Empagliflozin', 'Dapagliflozin'],
    warnings: ['Take with meals to reduce GI side effects', 'Check B12 levels periodically with long-term use'],
  },
  {
    id: 'dm-7',
    brandName: 'Amaryl',
    genericName: 'Glimepiride',
    category: 'Diabetes',
    form: 'Tablet',
    strength: '2mg',
    route: 'Oral',
    hmoCovered: true,
    philhealthCovered: true,
    stockStatus: 'In Stock',
    priceRange: '₱5 – ₱15 / tab',
    indications: [
      'Type 2 diabetes mellitus (adjunct to diet and exercise)',
    ],
    contraindications: [
      'Type 1 diabetes or diabetic ketoacidosis',
      'Hypersensitivity to sulfonylureas',
      'Severe renal or hepatic impairment',
    ],
    commonDosages: [
      '1–2mg once daily with breakfast (initial)',
      '4mg once daily (usual maintenance)',
      '8mg once daily (max)',
    ],
    interactions: [
      { drug: 'Fluconazole', severity: 'Moderate', description: 'CYP2C9 inhibition increases hypoglycemia risk' },
      { drug: 'Beta-blockers', severity: 'Moderate', description: 'May mask hypoglycemia symptoms' },
      { drug: 'Alcohol', severity: 'Moderate', description: 'Increased hypoglycemia risk' },
    ],
    alternatives: ['Gliclazide', 'Glipizide', 'Repaglinide'],
    warnings: ['High risk of hypoglycemia — educate patient on symptoms', 'Weight gain is common'],
  },
  {
    id: 'dm-8',
    brandName: 'Januvia',
    genericName: 'Sitagliptin Phosphate',
    category: 'Diabetes',
    form: 'Tablet',
    strength: '100mg',
    route: 'Oral',
    hmoCovered: true,
    philhealthCovered: false,
    stockStatus: 'In Stock',
    priceRange: '₱45 – ₱80 / tab',
    indications: [
      'Type 2 diabetes mellitus (monotherapy or combination)',
    ],
    contraindications: [
      'History of serious hypersensitivity to sitagliptin',
      'History of pancreatitis (relative)',
    ],
    commonDosages: [
      '100mg once daily',
      '50mg once daily (eGFR 30–45)',
      '25mg once daily (eGFR < 30)',
    ],
    interactions: [
      { drug: 'Insulin / Sulfonylureas', severity: 'Moderate', description: 'Increased risk of hypoglycemia — consider reducing dose' },
      { drug: 'Digoxin', severity: 'Minor', description: 'Slight increase in digoxin levels — monitor' },
    ],
    alternatives: ['Vildagliptin', 'Linagliptin', 'Saxagliptin'],
    warnings: ['Monitor for signs of pancreatitis (severe abdominal pain)', 'Dose-adjust for renal impairment'],
  },
  {
    id: 'dm-9',
    brandName: 'Lantus',
    genericName: 'Insulin Glargine',
    category: 'Diabetes',
    form: 'Solution for injection',
    strength: '100 IU/mL',
    route: 'Subcutaneous',
    hmoCovered: true,
    philhealthCovered: true,
    stockStatus: 'In Stock',
    priceRange: '₱1,800 – ₱2,800 / pen',
    indications: [
      'Type 1 diabetes mellitus (basal insulin)',
      'Type 2 diabetes mellitus (basal insulin when oral agents inadequate)',
    ],
    contraindications: [
      'Hypersensitivity to insulin glargine',
      'During episodes of hypoglycemia',
    ],
    commonDosages: [
      '10 IU once daily at bedtime (initial for T2DM)',
      'Titrate by 2–4 IU every 3–5 days to FBG target',
      '0.2 IU/kg/day (initial for T1DM, as part of basal-bolus)',
    ],
    interactions: [
      { drug: 'Thiazolidinediones', severity: 'Moderate', description: 'Increased risk of fluid retention and heart failure' },
      { drug: 'Beta-blockers', severity: 'Moderate', description: 'May mask hypoglycemia symptoms' },
      { drug: 'Corticosteroids', severity: 'Moderate', description: 'May reduce insulin efficacy — monitor glucose' },
    ],
    alternatives: ['Insulin Detemir (Levemir)', 'Insulin Degludec (Tresiba)'],
    warnings: ['Do NOT administer IV — SC injection only', 'Rotate injection sites to prevent lipodystrophy', 'Refrigerate unopened; room temp for up to 28 days once in use'],
  },

  // ─── Pain ──────────────────────────────────
  {
    id: 'dm-10',
    brandName: 'Biogesic / Tylenol',
    genericName: 'Paracetamol (Acetaminophen)',
    category: 'Pain',
    form: 'Tablet',
    strength: '500mg',
    route: 'Oral',
    hmoCovered: true,
    philhealthCovered: true,
    stockStatus: 'In Stock',
    priceRange: '₱1 – ₱5 / tab',
    indications: [
      'Mild to moderate pain',
      'Fever reduction',
      'Osteoarthritis',
    ],
    contraindications: [
      'Severe hepatic impairment',
      'Hypersensitivity to paracetamol',
    ],
    commonDosages: [
      '500–1000mg every 4–6 hours as needed',
      'Max 4g/day (healthy adults)',
      'Max 2g/day (chronic liver disease / alcohol use)',
    ],
    interactions: [
      { drug: 'Warfarin', severity: 'Moderate', description: 'Regular use may potentiate INR — monitor closely' },
      { drug: 'Alcohol (chronic)', severity: 'Major', description: 'Significantly increased hepatotoxicity risk' },
      { drug: 'Isoniazid', severity: 'Moderate', description: 'Increased hepatotoxicity risk' },
    ],
    alternatives: ['Ibuprofen', 'Naproxen', 'Celecoxib'],
    warnings: ['Hidden in many OTC combinations — counsel patients to check all medications', 'Hepatotoxicity risk with overdose — N-acetylcysteine is the antidote'],
  },
  {
    id: 'dm-11',
    brandName: 'Advil / Medicol',
    genericName: 'Ibuprofen',
    category: 'Pain',
    form: 'Tablet',
    strength: '200mg',
    route: 'Oral',
    hmoCovered: true,
    philhealthCovered: true,
    stockStatus: 'In Stock',
    priceRange: '₱2 – ₱8 / tab',
    indications: [
      'Mild to moderate pain',
      'Fever reduction',
      'Inflammatory conditions (arthritis, dysmenorrhea)',
    ],
    contraindications: [
      'Active GI bleeding or peptic ulcer disease',
      'Severe renal impairment (eGFR < 30)',
      'Third trimester of pregnancy',
      'History of NSAID-induced asthma',
      'Post-CABG surgery',
    ],
    commonDosages: [
      '200–400mg every 4–6 hours (OTC)',
      '400–800mg three times daily (prescription)',
      'Max 3200mg/day',
    ],
    interactions: [
      { drug: 'Aspirin (cardioprotective)', severity: 'Major', description: 'Ibuprofen may interfere with aspirin antiplatelet effect — take aspirin 30min before' },
      { drug: 'Losartan / ACE Inhibitors', severity: 'Moderate', description: 'Reduced antihypertensive effect and increased renal risk' },
      { drug: 'Lithium', severity: 'Moderate', description: 'Increased lithium levels' },
    ],
    alternatives: ['Naproxen', 'Diclofenac', 'Celecoxib', 'Paracetamol'],
    warnings: ['Take with food to minimize GI side effects', 'Cardiovascular risk increases with prolonged use'],
  },
  {
    id: 'dm-12',
    brandName: 'Celebrex',
    genericName: 'Celecoxib',
    category: 'Pain',
    form: 'Capsule',
    strength: '200mg',
    route: 'Oral',
    hmoCovered: true,
    philhealthCovered: false,
    stockStatus: 'In Stock',
    priceRange: '₱20 – ₱50 / cap',
    indications: [
      'Osteoarthritis',
      'Rheumatoid arthritis',
      'Acute pain',
      'Ankylosing spondylitis',
    ],
    contraindications: [
      'Sulfonamide allergy (cross-reactivity)',
      'Active GI bleeding',
      'Severe hepatic impairment',
      'Post-CABG surgery',
    ],
    commonDosages: [
      '100–200mg twice daily (OA)',
      '100–200mg twice daily (RA)',
      '400mg initially, then 200mg on day 1, then 200mg BID (acute pain)',
    ],
    interactions: [
      { drug: 'Warfarin', severity: 'Major', description: 'Increased bleeding risk — monitor INR' },
      { drug: 'Fluconazole', severity: 'Moderate', description: 'CYP2C9 inhibition — halve celecoxib dose' },
      { drug: 'ACE Inhibitors / ARBs', severity: 'Moderate', description: 'Reduced antihypertensive effect' },
    ],
    alternatives: ['Ibuprofen', 'Naproxen', 'Meloxicam', 'Etoricoxib'],
    warnings: ['Lower GI risk than traditional NSAIDs but CV risk still applies', 'Use lowest effective dose for shortest duration'],
  },
  {
    id: 'dm-13',
    brandName: 'Ultram',
    genericName: 'Tramadol Hydrochloride',
    category: 'Pain',
    form: 'Capsule',
    strength: '50mg',
    route: 'Oral',
    hmoCovered: true,
    philhealthCovered: false,
    controlledSchedule: 'Schedule IV',
    stockStatus: 'In Stock',
    priceRange: '₱8 – ₱20 / cap',
    indications: [
      'Moderate to moderately severe pain',
    ],
    contraindications: [
      'Concomitant MAO inhibitors (within 14 days)',
      'Uncontrolled epilepsy',
      'Acute intoxication with alcohol, hypnotics, or opioids',
      'Children under 12 years',
    ],
    commonDosages: [
      '50–100mg every 4–6 hours as needed',
      'Max 400mg/day',
      '25mg once daily initially for opioid-naïve (titrate slowly)',
    ],
    interactions: [
      { drug: 'SSRIs / SNRIs', severity: 'Major', description: 'Risk of serotonin syndrome — monitor closely' },
      { drug: 'Carbamazepine', severity: 'Major', description: 'Reduces tramadol efficacy and increases seizure risk' },
      { drug: 'Benzodiazepines', severity: 'Major', description: 'Respiratory depression risk' },
    ],
    alternatives: ['Codeine + Paracetamol', 'Tapentadol', 'Morphine (for severe pain)'],
    warnings: ['Controlled substance — prescribe with DEA/PDEA compliance', 'Seizure risk increased at high doses', 'Taper gradually to avoid withdrawal symptoms'],
  },

  // ─── Antibiotics ───────────────────────────
  {
    id: 'dm-14',
    brandName: 'Amoxil',
    genericName: 'Amoxicillin Trihydrate',
    category: 'Antibiotics',
    form: 'Capsule',
    strength: '500mg',
    route: 'Oral',
    hmoCovered: true,
    philhealthCovered: true,
    stockStatus: 'In Stock',
    priceRange: '₱3 – ₱12 / cap',
    indications: [
      'Upper and lower respiratory tract infections',
      'Urinary tract infections',
      'Skin and soft tissue infections',
      'H. pylori eradication (combination therapy)',
      'Dental abscess',
    ],
    contraindications: [
      'Penicillin allergy',
      'History of amoxicillin-associated cholestatic jaundice',
    ],
    commonDosages: [
      '250–500mg every 8 hours',
      '500–875mg every 12 hours',
      '3g single dose (uncomplicated gonorrhea — limited use)',
    ],
    interactions: [
      { drug: 'Methotrexate', severity: 'Major', description: 'Reduced methotrexate clearance — increased toxicity' },
      { drug: 'Warfarin', severity: 'Moderate', description: 'May potentiate INR — monitor' },
      { drug: 'Oral contraceptives', severity: 'Minor', description: 'Theoretical reduced efficacy — advise backup contraception' },
    ],
    alternatives: ['Amoxicillin-Clavulanate (Augmentin)', 'Cephalexin', 'Azithromycin'],
    warnings: ['Complete the full course as prescribed', 'Rash may occur in patients with EBV/mononucleosis — not a true allergy'],
  },
  {
    id: 'dm-15',
    brandName: 'Zithromax',
    genericName: 'Azithromycin Dihydrate',
    category: 'Antibiotics',
    form: 'Tablet',
    strength: '500mg',
    route: 'Oral',
    hmoCovered: true,
    philhealthCovered: true,
    stockStatus: 'In Stock',
    priceRange: '₱30 – ₱80 / tab',
    indications: [
      'Community-acquired pneumonia',
      'Acute bacterial sinusitis',
      'Pharyngitis / tonsillitis (penicillin-allergic)',
      'Chlamydial infections',
      'Traveler\'s diarrhea',
    ],
    contraindications: [
      'Hypersensitivity to macrolides',
      'History of cholestatic jaundice with prior azithromycin',
    ],
    commonDosages: [
      '500mg Day 1, then 250mg Days 2–5 (Z-pack)',
      '500mg once daily for 3 days',
      '1g single dose (chlamydia)',
    ],
    interactions: [
      { drug: 'QT-prolonging drugs', severity: 'Major', description: 'Additive QT prolongation — avoid with Class IA/III antiarrhythmics' },
      { drug: 'Warfarin', severity: 'Moderate', description: 'May potentiate INR' },
      { drug: 'Cyclosporine', severity: 'Moderate', description: 'Increased cyclosporine levels' },
    ],
    alternatives: ['Clarithromycin', 'Erythromycin', 'Doxycycline'],
    warnings: ['QT prolongation risk — ECG if baseline QTc borderline', 'Hepatotoxicity rare but may occur'],
  },
  {
    id: 'dm-16',
    brandName: 'Ciprobay',
    genericName: 'Ciprofloxacin Hydrochloride',
    category: 'Antibiotics',
    form: 'Tablet',
    strength: '500mg',
    route: 'Oral',
    hmoCovered: true,
    philhealthCovered: true,
    stockStatus: 'Low Stock',
    priceRange: '₱10 – ₱35 / tab',
    indications: [
      'Urinary tract infections (complicated & uncomplicated)',
      'Acute bacterial prostatitis',
      'Lower respiratory tract infections',
      'Bone and joint infections',
      'Typhoid fever',
    ],
    contraindications: [
      'Hypersensitivity to fluoroquinolones',
      'Concomitant tizanidine',
      'Myasthenia gravis (may exacerbate)',
    ],
    commonDosages: [
      '250–500mg every 12 hours (UTI)',
      '500–750mg every 12 hours (severe infections)',
      '7–14 day course (typical)',
    ],
    interactions: [
      { drug: 'Theophylline', severity: 'Major', description: 'Inhibits theophylline metabolism — toxicity risk' },
      { drug: 'Antacids / Iron / Calcium', severity: 'Moderate', description: 'Chelation reduces absorption — space by 2 hours' },
      { drug: 'Warfarin', severity: 'Moderate', description: 'Enhanced anticoagulant effect' },
    ],
    alternatives: ['Levofloxacin', 'Moxifloxacin', 'Trimethoprim-Sulfamethoxazole'],
    warnings: ['FDA boxed warning: tendon rupture, peripheral neuropathy, CNS effects', 'Reserve for infections without alternative treatments', 'Avoid in children unless no alternatives'],
  },

  // ─── GI ────────────────────────────────────
  {
    id: 'dm-17',
    brandName: 'Losec / Prilosec',
    genericName: 'Omeprazole',
    category: 'GI',
    form: 'Capsule',
    strength: '20mg',
    route: 'Oral',
    hmoCovered: true,
    philhealthCovered: true,
    stockStatus: 'In Stock',
    priceRange: '₱5 – ₱18 / cap',
    indications: [
      'Gastroesophageal reflux disease (GERD)',
      'Peptic ulcer disease',
      'H. pylori eradication (triple therapy)',
      'Zollinger-Ellison syndrome',
      'NSAID gastroprophylaxis',
    ],
    contraindications: [
      'Hypersensitivity to PPIs',
      'Concomitant rilpivirine',
    ],
    commonDosages: [
      '20mg once daily (GERD)',
      '40mg once daily (erosive esophagitis)',
      '20mg BID (H. pylori triple therapy for 14 days)',
    ],
    interactions: [
      { drug: 'Clopidogrel', severity: 'Major', description: 'CYP2C19 inhibition reduces clopidogrel activation — use pantoprazole' },
      { drug: 'Methotrexate', severity: 'Moderate', description: 'Delayed MTX elimination — monitor' },
      { drug: 'Iron / Calcium / B12', severity: 'Minor', description: 'Reduced absorption with long-term PPI use' },
    ],
    alternatives: ['Pantoprazole', 'Esomeprazole', 'Lansoprazole', 'Rabeprazole'],
    warnings: ['Long-term use: risk of hypomagnesemia, bone fractures, C. diff', 'Take 30 minutes before meals'],
  },
  {
    id: 'dm-18',
    brandName: 'Motilium',
    genericName: 'Domperidone',
    category: 'GI',
    form: 'Tablet',
    strength: '10mg',
    route: 'Oral',
    hmoCovered: true,
    philhealthCovered: false,
    stockStatus: 'In Stock',
    priceRange: '₱4 – ₱12 / tab',
    indications: [
      'Nausea and vomiting',
      'Gastroparesis / delayed gastric emptying',
      'Functional dyspepsia',
    ],
    contraindications: [
      'Prolactinoma',
      'GI hemorrhage, mechanical obstruction, or perforation',
      'Hepatic impairment',
      'Concomitant QT-prolonging drugs',
    ],
    commonDosages: [
      '10mg three times daily before meals',
      'Max 30mg/day',
      'Use for the shortest duration possible',
    ],
    interactions: [
      { drug: 'Ketoconazole / CYP3A4 inhibitors', severity: 'Major', description: 'Increased domperidone levels — QT prolongation risk' },
      { drug: 'QT-prolonging drugs', severity: 'Major', description: 'Additive cardiac risk' },
      { drug: 'Anticholinergics', severity: 'Minor', description: 'May counteract prokinetic effect' },
    ],
    alternatives: ['Metoclopramide', 'Ondansetron', 'Itopride'],
    warnings: ['Cardiac risk: use lowest effective dose for shortest duration', 'Not available in the US — commonly used in Philippines and EU'],
  },

  // ─── CNS ───────────────────────────────────
  {
    id: 'dm-19',
    brandName: 'Lexapro',
    genericName: 'Escitalopram Oxalate',
    category: 'CNS',
    form: 'Tablet',
    strength: '10mg',
    route: 'Oral',
    hmoCovered: true,
    philhealthCovered: false,
    stockStatus: 'In Stock',
    priceRange: '₱15 – ₱45 / tab',
    indications: [
      'Major depressive disorder (MDD)',
      'Generalized anxiety disorder (GAD)',
    ],
    contraindications: [
      'Concomitant MAO inhibitors (within 14 days)',
      'Concomitant pimozide',
      'Hypersensitivity to escitalopram or citalopram',
    ],
    commonDosages: [
      '10mg once daily (initial and usual)',
      '20mg once daily (max)',
      '5mg once daily (elderly)',
    ],
    interactions: [
      { drug: 'MAO Inhibitors', severity: 'Major', description: 'Serotonin syndrome — absolute contraindication' },
      { drug: 'Tramadol / Triptans', severity: 'Major', description: 'Increased serotonin syndrome risk' },
      { drug: 'NSAIDs / Anticoagulants', severity: 'Moderate', description: 'Increased bleeding risk' },
    ],
    alternatives: ['Sertraline', 'Fluoxetine', 'Paroxetine', 'Venlafaxine'],
    warnings: ['Black box warning: suicidality in young adults (< 25)', 'Taper gradually — do not discontinue abruptly', 'QT prolongation risk at higher doses'],
  },
  {
    id: 'dm-20',
    brandName: 'Lyrica',
    genericName: 'Pregabalin',
    category: 'CNS',
    form: 'Capsule',
    strength: '75mg',
    route: 'Oral',
    hmoCovered: true,
    philhealthCovered: false,
    controlledSchedule: 'Schedule V',
    stockStatus: 'Low Stock',
    priceRange: '₱25 – ₱60 / cap',
    indications: [
      'Neuropathic pain (diabetic peripheral neuropathy, postherpetic neuralgia)',
      'Fibromyalgia',
      'Adjunctive therapy for partial onset seizures',
      'Generalized anxiety disorder (EU)',
    ],
    contraindications: [
      'Hypersensitivity to pregabalin',
    ],
    commonDosages: [
      '75mg twice daily (initial)',
      '150–300mg twice daily (maintenance)',
      '600mg/day (max)',
    ],
    interactions: [
      { drug: 'CNS depressants / Alcohol', severity: 'Moderate', description: 'Additive sedation and respiratory depression' },
      { drug: 'Thiazolidinediones', severity: 'Moderate', description: 'Increased peripheral edema and weight gain' },
      { drug: 'ACE Inhibitors', severity: 'Minor', description: 'Rare reports of angioedema' },
    ],
    alternatives: ['Gabapentin', 'Duloxetine', 'Amitriptyline'],
    warnings: ['Controlled substance — potential for abuse/dependence', 'Taper over at least 1 week to avoid withdrawal seizures', 'Dizziness and somnolence are common — warn about driving'],
  },

  // ─── Respiratory ───────────────────────────
  {
    id: 'dm-21',
    brandName: 'Ventolin',
    genericName: 'Salbutamol (Albuterol)',
    category: 'Respiratory',
    form: 'Tablet / Inhaler',
    strength: '2mg tab / 100mcg/actuation inhaler',
    route: 'Oral / Inhalation',
    hmoCovered: true,
    philhealthCovered: true,
    stockStatus: 'In Stock',
    priceRange: '₱2 – ₱8 / tab · ₱350 – ₱600 / inhaler',
    indications: [
      'Asthma (acute bronchospasm relief)',
      'Chronic obstructive pulmonary disease (COPD) exacerbations',
      'Exercise-induced bronchospasm prophylaxis',
    ],
    contraindications: [
      'Hypersensitivity to salbutamol',
      'Tachyarrhythmias',
      'Hypertrophic obstructive cardiomyopathy',
    ],
    commonDosages: [
      '2–4mg orally three times daily',
      '1–2 puffs (100–200mcg) every 4–6 hours PRN (inhaler)',
      'Nebulization: 2.5–5mg in 3mL NS every 4–6 hours (acute)',
    ],
    interactions: [
      { drug: 'Beta-blockers (non-selective)', severity: 'Major', description: 'Antagonizes bronchodilator effect — avoid propranolol in asthmatics' },
      { drug: 'Diuretics (loop/thiazide)', severity: 'Moderate', description: 'Additive hypokalemia risk — monitor potassium' },
      { drug: 'MAO inhibitors', severity: 'Moderate', description: 'Potentiation of cardiovascular effects' },
    ],
    alternatives: ['Terbutaline', 'Ipratropium bromide', 'Formoterol', 'Levalbuterol'],
    warnings: ['Overuse may indicate worsening asthma — reassess therapy', 'Shake inhaler and use spacer for optimal delivery'],
  },
  {
    id: 'dm-22',
    brandName: 'Singulair',
    genericName: 'Montelukast Sodium',
    category: 'Respiratory',
    form: 'Tablet',
    strength: '10mg',
    route: 'Oral',
    hmoCovered: true,
    philhealthCovered: false,
    stockStatus: 'In Stock',
    priceRange: '₱18 – ₱45 / tab',
    indications: [
      'Asthma prophylaxis and chronic treatment (≥15 years)',
      'Allergic rhinitis (seasonal and perennial)',
      'Exercise-induced bronchoconstriction prevention',
    ],
    contraindications: [
      'Hypersensitivity to montelukast',
      'Acute asthma attacks (not for acute bronchospasm relief)',
    ],
    commonDosages: [
      '10mg once daily in the evening (adults)',
      '5mg chewable once daily (6–14 years)',
      '4mg granules once daily (2–5 years)',
    ],
    interactions: [
      { drug: 'Phenobarbital / CYP3A4 inducers', severity: 'Moderate', description: 'May reduce montelukast levels — monitor efficacy' },
      { drug: 'Gemfibrozil', severity: 'Moderate', description: 'Increased montelukast exposure via CYP2C8 inhibition' },
      { drug: 'Prednisone', severity: 'Minor', description: 'Can be used together; do not abruptly stop steroids when starting montelukast' },
    ],
    alternatives: ['Zafirlukast', 'Inhaled corticosteroids (Budesonide)', 'Cromolyn sodium'],
    warnings: ['FDA boxed warning: neuropsychiatric events (mood changes, suicidal ideation) — counsel patients', 'Not a rescue inhaler — continue short-acting beta-agonist for acute symptoms'],
  },
  {
    id: 'dm-23',
    brandName: 'Symbicort',
    genericName: 'Budesonide / Formoterol Fumarate',
    category: 'Respiratory',
    form: 'Inhaler (turbuhaler)',
    strength: '160/4.5mcg per actuation',
    route: 'Inhalation',
    hmoCovered: true,
    philhealthCovered: false,
    stockStatus: 'In Stock',
    priceRange: '₱1,200 – ₱2,000 / inhaler (120 doses)',
    indications: [
      'Asthma maintenance therapy (≥6 years)',
      'COPD maintenance therapy',
      'Single maintenance and reliever therapy (SMART) in asthma',
    ],
    contraindications: [
      'Hypersensitivity to budesonide or formoterol',
      'Primary treatment of status asthmaticus or acute bronchospasm',
      'Severe hypersensitivity to milk proteins',
    ],
    commonDosages: [
      '1–2 inhalations twice daily (maintenance)',
      '1 inhalation as needed (SMART approach — mild-moderate asthma)',
      'Max 12 inhalations/day (SMART) or 4 inhalations BID (maintenance)',
    ],
    interactions: [
      { drug: 'Ketoconazole / CYP3A4 inhibitors', severity: 'Moderate', description: 'Increased budesonide systemic exposure — monitor for corticosteroid effects' },
      { drug: 'Beta-blockers (non-selective)', severity: 'Major', description: 'May block bronchodilator effect of formoterol' },
      { drug: 'QT-prolonging drugs', severity: 'Moderate', description: 'Formoterol may potentiate QT prolongation' },
    ],
    alternatives: ['Fluticasone / Salmeterol (Advair)', 'Beclomethasone / Formoterol (Foster)', 'Fluticasone / Vilanterol (Breo)'],
    warnings: ['Rinse mouth after each use to prevent oral candidiasis', 'Do not use LABA without inhaled corticosteroid — increased asthma mortality risk'],
  },

  // ─── Vitamins / Supplements ────────────────
  {
    id: 'dm-24',
    brandName: 'Cecon / various generics',
    genericName: 'Ascorbic Acid (Vitamin C)',
    category: 'Vitamins',
    form: 'Tablet',
    strength: '500mg',
    route: 'Oral',
    hmoCovered: false,
    philhealthCovered: false,
    stockStatus: 'In Stock',
    priceRange: '₱1 – ₱5 / tab',
    indications: [
      'Vitamin C deficiency (scurvy)',
      'Dietary supplementation',
      'Adjunct in wound healing and immune support',
    ],
    contraindications: [
      'Hyperoxaluria or history of oxalate kidney stones (high doses)',
      'Hemochromatosis (may worsen iron overload)',
    ],
    commonDosages: [
      '500mg once or twice daily (supplementation)',
      '100–250mg once or twice daily (children)',
      '1000mg/day (upper tolerable limit for adults)',
    ],
    interactions: [
      { drug: 'Iron supplements', severity: 'Minor', description: 'Enhances iron absorption — beneficial in iron-deficiency anemia' },
      { drug: 'Warfarin', severity: 'Minor', description: 'High doses (>1g/day) may reduce INR — monitor' },
      { drug: 'Aluminum-containing antacids', severity: 'Minor', description: 'Vitamin C increases aluminum absorption — space doses' },
    ],
    alternatives: ['Sodium Ascorbate', 'Calcium Ascorbate', 'Multivitamin preparations'],
    warnings: ['High doses (>2g/day) may cause GI upset and diarrhea'],
  },
  {
    id: 'dm-25',
    brandName: 'Iberet / Fer-In-Sol',
    genericName: 'Ferrous Sulfate',
    category: 'Vitamins',
    form: 'Tablet',
    strength: '325mg (65mg elemental iron)',
    route: 'Oral',
    hmoCovered: true,
    philhealthCovered: true,
    stockStatus: 'In Stock',
    priceRange: '₱1 – ₱5 / tab',
    indications: [
      'Iron-deficiency anemia treatment',
      'Iron supplementation in pregnancy',
      'Prevention of iron deficiency in at-risk populations',
    ],
    contraindications: [
      'Hemochromatosis or hemosiderosis',
      'Hemolytic anemia (unless coexisting iron deficiency)',
      'Active peptic ulcer disease (relative)',
    ],
    commonDosages: [
      '325mg (65mg elemental Fe) once to three times daily',
      '325mg once daily on empty stomach (mild deficiency)',
      'Pediatric: 3–6mg elemental Fe/kg/day in divided doses',
    ],
    interactions: [
      { drug: 'Tetracyclines / Fluoroquinolones', severity: 'Major', description: 'Chelation reduces antibiotic absorption — space by 2 hours' },
      { drug: 'Levothyroxine', severity: 'Moderate', description: 'Reduced thyroid hormone absorption — space by 4 hours' },
      { drug: 'Antacids / PPIs', severity: 'Moderate', description: 'Reduced iron absorption due to increased gastric pH' },
    ],
    alternatives: ['Ferrous fumarate', 'Ferrous gluconate', 'Iron polymaltose complex', 'IV iron (Ferric carboxymaltose)'],
    warnings: ['Take on empty stomach for best absorption; take with vitamin C if GI intolerant', 'Black stools are expected — counsel patients'],
  },
  {
    id: 'dm-26',
    brandName: 'Caltrate / Ostecal',
    genericName: 'Calcium Carbonate + Cholecalciferol (Vitamin D3)',
    category: 'Vitamins',
    form: 'Tablet',
    strength: '500mg Ca / 400 IU Vit D3',
    route: 'Oral',
    hmoCovered: false,
    philhealthCovered: false,
    stockStatus: 'In Stock',
    priceRange: '₱5 – ₱15 / tab',
    indications: [
      'Calcium and vitamin D supplementation',
      'Osteoporosis prevention and adjunctive treatment',
      'Osteomalacia / rickets',
      'Hypoparathyroidism (adjunct)',
    ],
    contraindications: [
      'Hypercalcemia or hypercalciuria',
      'Severe renal impairment (without monitoring)',
      'Sarcoidosis (risk of hypercalcemia)',
    ],
    commonDosages: [
      '1 tablet (500mg/400IU) twice daily with meals',
      'Total elemental calcium goal: 1000–1200mg/day from diet + supplement',
      'Vitamin D goal: 800–2000 IU/day (higher in deficiency)',
    ],
    interactions: [
      { drug: 'Tetracyclines / Fluoroquinolones', severity: 'Major', description: 'Chelation reduces antibiotic absorption — space by 2–4 hours' },
      { drug: 'Levothyroxine', severity: 'Moderate', description: 'Reduced absorption — space by 4 hours' },
      { drug: 'Thiazide diuretics', severity: 'Moderate', description: 'Increased risk of hypercalcemia — monitor calcium levels' },
    ],
    alternatives: ['Calcium citrate (better absorption in achlorhydria)', 'Calcium lactate', 'Alfacalcidol'],
    warnings: ['Take with meals for better absorption (calcium carbonate)', 'Excess calcium (>2500mg/day) may increase kidney stone risk'],
  },

  // ─── Additional Common Filipino Market Drugs ─
  {
    id: 'dm-27',
    brandName: 'Zyrtec / Virlix',
    genericName: 'Cetirizine Dihydrochloride',
    category: 'Respiratory',
    form: 'Tablet',
    strength: '10mg',
    route: 'Oral',
    hmoCovered: true,
    philhealthCovered: false,
    stockStatus: 'In Stock',
    priceRange: '₱3 – ₱12 / tab',
    indications: [
      'Allergic rhinitis (seasonal and perennial)',
      'Chronic idiopathic urticaria',
      'Allergic conjunctivitis',
    ],
    contraindications: [
      'Severe renal impairment (eGFR < 10) without dose adjustment',
      'Hypersensitivity to cetirizine, hydroxyzine, or piperazine derivatives',
    ],
    commonDosages: [
      '10mg once daily (adults and children ≥12)',
      '5mg once daily (moderate renal/hepatic impairment)',
      '5mg once or twice daily (children 6–11 years)',
    ],
    interactions: [
      { drug: 'CNS depressants / Alcohol', severity: 'Moderate', description: 'Additive sedation — though less than first-generation antihistamines' },
      { drug: 'Theophylline', severity: 'Minor', description: 'Slight decrease in cetirizine clearance — generally not clinically significant' },
      { drug: 'Ritonavir', severity: 'Moderate', description: 'Increased cetirizine exposure — monitor for sedation' },
    ],
    alternatives: ['Loratadine', 'Fexofenadine', 'Levocetirizine', 'Desloratadine'],
    warnings: ['Less sedating than first-gen antihistamines but drowsiness still possible', 'Dose-adjust in renal impairment'],
  },
  {
    id: 'dm-28',
    brandName: 'Imodium / Diatabs',
    genericName: 'Loperamide Hydrochloride',
    category: 'GI',
    form: 'Capsule',
    strength: '2mg',
    route: 'Oral',
    hmoCovered: true,
    philhealthCovered: false,
    stockStatus: 'In Stock',
    priceRange: '₱3 – ₱10 / cap',
    indications: [
      'Acute non-specific diarrhea',
      'Chronic diarrhea (e.g., inflammatory bowel disease)',
      'Traveler\'s diarrhea (adjunct)',
    ],
    contraindications: [
      'Dysentery (bloody diarrhea with fever)',
      'Acute ulcerative colitis or pseudomembranous colitis (C. diff)',
      'Bacterial enterocolitis (Salmonella, Shigella, Campylobacter)',
      'Children under 2 years',
    ],
    commonDosages: [
      '4mg initially, then 2mg after each loose stool',
      'Max 16mg/day (OTC: max 8mg/day)',
      'Chronic diarrhea: titrate to 4–8mg/day in divided doses',
    ],
    interactions: [
      { drug: 'P-glycoprotein inhibitors (quinidine, ritonavir)', severity: 'Major', description: 'Increased loperamide CNS penetration — risk of QT prolongation and cardiac arrest' },
      { drug: 'QT-prolonging drugs', severity: 'Major', description: 'Additive QT prolongation risk at supratherapeutic doses' },
      { drug: 'Opioids', severity: 'Moderate', description: 'Additive constipation and CNS depression' },
    ],
    alternatives: ['Bismuth subsalicylate', 'Racecadotril', 'Diphenoxylate-Atropine'],
    warnings: ['Do not exceed recommended dose — cardiac toxicity at high doses', 'Discontinue if no improvement after 48 hours of acute diarrhea'],
  },
  {
    id: 'dm-29',
    brandName: 'Ponstan / Dolfenal',
    genericName: 'Mefenamic Acid',
    category: 'Pain',
    form: 'Capsule',
    strength: '500mg',
    route: 'Oral',
    hmoCovered: true,
    philhealthCovered: true,
    stockStatus: 'In Stock',
    priceRange: '₱3 – ₱10 / cap',
    indications: [
      'Mild to moderate pain',
      'Primary dysmenorrhea',
      'Rheumatoid arthritis and osteoarthritis (short-term)',
    ],
    contraindications: [
      'Active GI bleeding or peptic ulcer disease',
      'Severe renal impairment',
      'Inflammatory bowel disease',
      'Third trimester of pregnancy',
    ],
    commonDosages: [
      '500mg initially, then 250mg every 6 hours as needed',
      'Dysmenorrhea: 500mg TID starting at onset of menses (max 7 days)',
      'Max duration: 7 days for pain',
    ],
    interactions: [
      { drug: 'Warfarin / Anticoagulants', severity: 'Major', description: 'Increased bleeding risk — avoid combination' },
      { drug: 'Lithium', severity: 'Moderate', description: 'Increased lithium levels — monitor' },
      { drug: 'ACE Inhibitors / ARBs', severity: 'Moderate', description: 'Reduced antihypertensive effect and increased renal risk' },
    ],
    alternatives: ['Ibuprofen', 'Naproxen', 'Diclofenac', 'Paracetamol'],
    warnings: ['Limit treatment to 7 days to minimize GI and renal risk', 'Very commonly used in the Philippines for dysmenorrhea — counsel on proper short-term use'],
  },
  {
    id: 'dm-30',
    brandName: 'Neozep / Bioflu',
    genericName: 'Phenylephrine HCl + Chlorphenamine Maleate + Paracetamol',
    category: 'Respiratory',
    form: 'Tablet',
    strength: '10mg/2mg/500mg',
    route: 'Oral',
    hmoCovered: false,
    philhealthCovered: false,
    stockStatus: 'In Stock',
    priceRange: '₱5 – ₱12 / tab',
    indications: [
      'Common cold and flu symptoms',
      'Nasal congestion with rhinorrhea',
      'Headache and body aches associated with URI',
    ],
    contraindications: [
      'Severe hypertension or coronary artery disease',
      'Concomitant MAO inhibitor use (within 14 days)',
      'Severe hepatic impairment (paracetamol component)',
    ],
    commonDosages: [
      '1 tablet every 6 hours as needed',
      'Max 4 tablets per day',
      'Not recommended for children under 6 years',
    ],
    interactions: [
      { drug: 'MAO Inhibitors', severity: 'Major', description: 'Hypertensive crisis with phenylephrine — absolute contraindication' },
      { drug: 'CNS depressants / Alcohol', severity: 'Moderate', description: 'Additive sedation from chlorphenamine component' },
      { drug: 'Beta-blockers', severity: 'Moderate', description: 'Phenylephrine may cause hypertensive response when beta-receptors are blocked' },
    ],
    alternatives: ['Decolgen', 'Sinutab', 'Phenylpropanolamine + Chlorphenamine (where available)'],
    warnings: ['Causes drowsiness — avoid driving or operating machinery', 'Monitor total paracetamol intake from all sources to avoid hepatotoxicity'],
  },
  {
    id: 'dm-31',
    brandName: 'Dalacin C',
    genericName: 'Clindamycin Hydrochloride',
    category: 'Antibiotics',
    form: 'Capsule',
    strength: '300mg',
    route: 'Oral',
    hmoCovered: true,
    philhealthCovered: true,
    stockStatus: 'In Stock',
    priceRange: '₱15 – ₱40 / cap',
    indications: [
      'Skin and soft tissue infections (including MRSA)',
      'Bone and joint infections (osteomyelitis)',
      'Intra-abdominal infections (in combination)',
      'Dental infections',
    ],
    contraindications: [
      'Hypersensitivity to clindamycin or lincomycin',
      'History of C. difficile-associated diarrhea',
    ],
    commonDosages: [
      '150–300mg every 6 hours (mild-moderate)',
      '300–450mg every 6 hours (severe infections)',
      'Max 1.8g/day (oral)',
    ],
    interactions: [
      { drug: 'Neuromuscular blocking agents', severity: 'Major', description: 'Enhanced neuromuscular blockade — monitor respiratory function post-operatively' },
      { drug: 'Erythromycin / Macrolides', severity: 'Moderate', description: 'Antagonistic binding at 50S ribosomal subunit — avoid combination' },
      { drug: 'Kaolin-pectin antidiarrheal', severity: 'Minor', description: 'Reduced clindamycin absorption — space by 2 hours' },
    ],
    alternatives: ['Amoxicillin-Clavulanate', 'Trimethoprim-Sulfamethoxazole (for MRSA)', 'Metronidazole (for anaerobes)'],
    warnings: ['High risk of C. difficile-associated diarrhea — discontinue if diarrhea develops', 'Complete the full course as prescribed'],
  },
  {
    id: 'dm-32',
    brandName: 'Flagyl',
    genericName: 'Metronidazole',
    category: 'Antibiotics',
    form: 'Tablet',
    strength: '500mg',
    route: 'Oral',
    hmoCovered: true,
    philhealthCovered: true,
    stockStatus: 'In Stock',
    priceRange: '₱3 – ₱12 / tab',
    indications: [
      'Anaerobic bacterial infections',
      'Amebiasis (intestinal and hepatic)',
      'Giardiasis',
      'C. difficile infection (mild-moderate)',
      'H. pylori eradication (combination therapy)',
    ],
    contraindications: [
      'First trimester of pregnancy (teratogenic risk)',
      'Hypersensitivity to nitroimidazoles',
      'Concomitant alcohol use (disulfiram-like reaction)',
    ],
    commonDosages: [
      '500mg every 8 hours for 7–10 days (anaerobic infections)',
      '750mg TID for 5–10 days (intestinal amebiasis)',
      '250mg TID for 5–7 days (giardiasis)',
    ],
    interactions: [
      { drug: 'Alcohol', severity: 'Major', description: 'Disulfiram-like reaction (nausea, vomiting, flushing) — avoid alcohol during and 48h after treatment' },
      { drug: 'Warfarin', severity: 'Major', description: 'Potentiates anticoagulant effect — monitor INR closely' },
      { drug: 'Lithium', severity: 'Moderate', description: 'Increased lithium levels and toxicity risk — monitor' },
    ],
    alternatives: ['Tinidazole', 'Ornidazole', 'Vancomycin (for C. diff)', 'Fidaxomicin (for C. diff)'],
    warnings: ['Absolutely no alcohol during treatment — disulfiram-like reaction', 'Metallic taste is common — counsel patients'],
  },
  {
    id: 'dm-33',
    brandName: 'Famocid / Pepcid',
    genericName: 'Famotidine',
    category: 'GI',
    form: 'Tablet',
    strength: '20mg / 40mg',
    route: 'Oral',
    hmoCovered: true,
    philhealthCovered: true,
    stockStatus: 'In Stock',
    priceRange: '₱4 – ₱15 / tab',
    indications: [
      'Gastroesophageal reflux disease (GERD)',
      'Peptic ulcer disease (duodenal and gastric)',
      'Zollinger-Ellison syndrome',
      'Heartburn / acid indigestion (OTC)',
    ],
    contraindications: [
      'Hypersensitivity to famotidine or other H2 blockers',
    ],
    commonDosages: [
      '20mg twice daily or 40mg at bedtime (duodenal ulcer)',
      '20mg twice daily (GERD)',
      '10–20mg 15–60 min before meals (heartburn prevention)',
    ],
    interactions: [
      { drug: 'Atazanavir / Nelfinavir', severity: 'Major', description: 'Reduced HIV protease inhibitor absorption due to increased gastric pH' },
      { drug: 'Itraconazole / Ketoconazole', severity: 'Moderate', description: 'Reduced antifungal absorption — needs acidic pH for dissolution' },
      { drug: 'Cefuroxime axetil', severity: 'Minor', description: 'Slightly reduced absorption — generally not clinically significant' },
    ],
    alternatives: ['Ranitidine (where available)', 'Cimetidine', 'Omeprazole (PPI)', 'Pantoprazole (PPI)'],
    warnings: ['Safer profile than ranitidine (NDMA concerns led to ranitidine withdrawal in many markets)', 'Dose-adjust in severe renal impairment'],
  },
  {
    id: 'dm-34',
    brandName: 'Forxiga',
    genericName: 'Dapagliflozin Propanediol',
    category: 'Diabetes',
    form: 'Tablet',
    strength: '10mg',
    route: 'Oral',
    hmoCovered: true,
    philhealthCovered: false,
    stockStatus: 'In Stock',
    priceRange: '₱50 – ₱95 / tab',
    indications: [
      'Type 2 diabetes mellitus (as monotherapy or add-on)',
      'Heart failure with reduced ejection fraction (HFrEF)',
      'Chronic kidney disease (eGFR ≥ 20)',
    ],
    contraindications: [
      'Type 1 diabetes (increased DKA risk)',
      'Severe renal impairment eGFR < 25 for diabetes indication (may be used in HF/CKD)',
      'Hypersensitivity to dapagliflozin',
    ],
    commonDosages: [
      '10mg once daily in the morning (T2DM)',
      '10mg once daily (heart failure)',
      '10mg once daily (CKD)',
    ],
    interactions: [
      { drug: 'Insulin / Sulfonylureas', severity: 'Moderate', description: 'Increased hypoglycemia risk — consider reducing insulin/SU dose' },
      { drug: 'Loop diuretics', severity: 'Moderate', description: 'Additive volume depletion and hypotension risk — monitor hydration' },
      { drug: 'Rifampicin / CYP1A2 inducers', severity: 'Minor', description: 'May modestly reduce dapagliflozin exposure — monitor glycemic control' },
    ],
    alternatives: ['Empagliflozin (Jardiance)', 'Canagliflozin (Invokana)', 'Ertugliflozin'],
    warnings: ['Risk of euglycemic diabetic ketoacidosis — hold before surgery and during acute illness', 'Increased risk of genital mycotic infections — counsel on hygiene'],
  },
  {
    id: 'dm-35',
    brandName: 'Crestor',
    genericName: 'Rosuvastatin Calcium',
    category: 'Cardiovascular',
    form: 'Tablet',
    strength: '10mg',
    route: 'Oral',
    hmoCovered: true,
    philhealthCovered: true,
    stockStatus: 'In Stock',
    priceRange: '₱12 – ₱40 / tab',
    indications: [
      'Primary hypercholesterolemia and mixed dyslipidemia',
      'Cardiovascular risk reduction',
      'Homozygous familial hypercholesterolemia',
      'Slowing progression of atherosclerosis',
    ],
    contraindications: [
      'Active liver disease or unexplained persistent transaminase elevations',
      'Pregnancy and lactation',
      'Hypersensitivity to rosuvastatin',
    ],
    commonDosages: [
      '5–10mg once daily (initial)',
      '20mg once daily (usual for aggressive LDL lowering)',
      '40mg once daily (max — reserved for severe hypercholesterolemia)',
    ],
    interactions: [
      { drug: 'Cyclosporine', severity: 'Major', description: 'Dramatically increased rosuvastatin levels — contraindicated at doses >5mg' },
      { drug: 'Gemfibrozil', severity: 'Major', description: 'Increased rhabdomyolysis risk — limit rosuvastatin to 10mg' },
      { drug: 'Warfarin', severity: 'Moderate', description: 'May increase INR — monitor when initiating or adjusting dose' },
    ],
    alternatives: ['Atorvastatin', 'Simvastatin', 'Pravastatin', 'Pitavastatin'],
    warnings: ['Most potent statin per mg — use lowest effective dose', 'Asian patients: consider 5mg starting dose due to higher rosuvastatin exposure'],
  },

  // ─── Vitamins (Standalone D3) ──────────────
  {
    id: 'dm-36',
    brandName: 'Vitamin D3 (various generics)',
    genericName: 'Cholecalciferol',
    category: 'Vitamins',
    form: 'Softgel',
    strength: '1000 IU',
    route: 'Oral',
    hmoCovered: false,
    philhealthCovered: false,
    stockStatus: 'In Stock',
    priceRange: '₱5 – ₱15 / cap',
    indications: [
      'Vitamin D deficiency',
      'Osteoporosis prevention (adjunct with calcium)',
      'Enhancement of calcium absorption',
      'Adjunct in management of osteomalacia / rickets',
    ],
    contraindications: [
      'Hypercalcemia',
      'Hypervitaminosis D',
      'Malabsorption syndrome (relative — may need higher doses)',
    ],
    commonDosages: [
      '1000 IU once daily (maintenance)',
      '2000 IU once daily (insufficiency)',
      '50,000 IU once weekly for 8–12 weeks (deficiency repletion)',
    ],
    interactions: [
      { drug: 'Thiazide diuretics', severity: 'Moderate', description: 'Increased risk of hypercalcemia — monitor calcium levels' },
      { drug: 'Orlistat / Cholestyramine', severity: 'Moderate', description: 'Reduced vitamin D absorption — space doses' },
      { drug: 'Corticosteroids', severity: 'Minor', description: 'May reduce calcium absorption and impair vitamin D metabolism' },
    ],
    alternatives: ['Ergocalciferol (Vitamin D2)', 'Alfacalcidol', 'Calcitriol'],
    warnings: ['Monitor 25-OH vitamin D levels for dose adjustment', 'Toxicity risk at sustained intake > 10,000 IU/day'],
  },

  // ─── More Cardiovascular ──────────────────
  {
    id: 'dm-37',
    brandName: 'Aspilets',
    genericName: 'Aspirin (Acetylsalicylic Acid)',
    category: 'Cardiovascular',
    form: 'Tablet',
    strength: '80mg',
    route: 'Oral',
    hmoCovered: true,
    philhealthCovered: true,
    stockStatus: 'In Stock',
    priceRange: '₱1 – ₱4 / tab',
    indications: [
      'Secondary prevention of myocardial infarction and stroke',
      'Acute coronary syndrome (ACS)',
      'Post-coronary stent placement (dual antiplatelet therapy)',
      'Kawasaki disease',
    ],
    contraindications: [
      'Active GI bleeding or peptic ulcer disease',
      'Aspirin-exacerbated respiratory disease',
      'Hemophilia or severe bleeding disorders',
      'Children with viral illness (Reye syndrome risk)',
    ],
    commonDosages: [
      '80–100mg once daily (cardioprotective)',
      '160–325mg loading dose (ACS)',
      '325mg once daily (post-stent, short-term)',
    ],
    interactions: [
      { drug: 'Ibuprofen', severity: 'Major', description: 'Ibuprofen may block aspirin antiplatelet effect — take aspirin 30 min before ibuprofen' },
      { drug: 'Warfarin', severity: 'Major', description: 'Significantly increased bleeding risk — use with caution' },
      { drug: 'Clopidogrel', severity: 'Moderate', description: 'Additive bleeding risk but often used together per guidelines (DAPT)' },
    ],
    alternatives: ['Clopidogrel', 'Ticagrelor', 'Prasugrel'],
    warnings: ['Do not use for primary prevention without physician guidance', 'Avoid in children with fever / viral illness — Reye syndrome risk'],
  },

  // ─── More GI ──────────────────────────────
  {
    id: 'dm-38',
    brandName: 'Prevacid',
    genericName: 'Lansoprazole',
    category: 'GI',
    form: 'Capsule',
    strength: '30mg',
    route: 'Oral',
    hmoCovered: true,
    philhealthCovered: true,
    stockStatus: 'In Stock',
    priceRange: '₱8 – ₱25 / cap',
    indications: [
      'Gastroesophageal reflux disease (GERD)',
      'Duodenal and gastric ulcer',
      'H. pylori eradication (triple therapy)',
      'NSAID-associated gastric ulcer prevention',
      'Zollinger-Ellison syndrome',
    ],
    contraindications: [
      'Hypersensitivity to PPIs or benzimidazole derivatives',
      'Concomitant rilpivirine',
    ],
    commonDosages: [
      '30mg once daily before breakfast (GERD)',
      '15mg once daily (maintenance for healed erosive esophagitis)',
      '30mg BID (H. pylori triple therapy for 14 days)',
    ],
    interactions: [
      { drug: 'Clopidogrel', severity: 'Moderate', description: 'May reduce clopidogrel activation (weaker effect than omeprazole) — pantoprazole preferred' },
      { drug: 'Methotrexate', severity: 'Moderate', description: 'Delayed methotrexate elimination — monitor levels' },
      { drug: 'Sucralfate', severity: 'Minor', description: 'Reduced lansoprazole absorption — take 30 min before sucralfate' },
    ],
    alternatives: ['Omeprazole', 'Pantoprazole', 'Esomeprazole', 'Rabeprazole'],
    warnings: ['Long-term use: hypomagnesemia, C. diff, bone fracture risk', 'Take 30 minutes before meals for optimal efficacy'],
  },

  // ─── More Antibiotics ─────────────────────
  {
    id: 'dm-39',
    brandName: 'Augmentin',
    genericName: 'Co-Amoxiclav (Amoxicillin + Clavulanic Acid)',
    category: 'Antibiotics',
    form: 'Tablet',
    strength: '625mg (500/125mg)',
    route: 'Oral',
    hmoCovered: true,
    philhealthCovered: true,
    stockStatus: 'In Stock',
    priceRange: '₱20 – ₱50 / tab',
    indications: [
      'Resistant urinary tract infections',
      'Acute bacterial sinusitis',
      'Community-acquired pneumonia',
      'Skin and soft tissue infections (including animal bites)',
      'Acute otitis media',
    ],
    contraindications: [
      'Penicillin allergy',
      'History of cholestatic jaundice with amoxicillin-clavulanate',
      'Severe hepatic impairment',
    ],
    commonDosages: [
      '625mg (500/125) every 8 hours',
      '1g (875/125) every 12 hours',
      'Pediatric: 25–45 mg/kg/day (amoxicillin component) in divided doses',
    ],
    interactions: [
      { drug: 'Methotrexate', severity: 'Major', description: 'Reduced methotrexate clearance — increased toxicity risk' },
      { drug: 'Warfarin', severity: 'Moderate', description: 'May potentiate INR — monitor closely' },
      { drug: 'Allopurinol', severity: 'Minor', description: 'Increased incidence of skin rash' },
    ],
    alternatives: ['Cefuroxime', 'Amoxicillin (if non-resistant)', 'Cephalexin'],
    warnings: ['Monitor liver function if prolonged course', 'Take with food to reduce GI side effects and improve clavulanate absorption'],
  },
  {
    id: 'dm-40',
    brandName: 'Vibramycin',
    genericName: 'Doxycycline Hyclate',
    category: 'Antibiotics',
    form: 'Capsule',
    strength: '100mg',
    route: 'Oral',
    hmoCovered: true,
    philhealthCovered: true,
    stockStatus: 'In Stock',
    priceRange: '₱5 – ₱15 / cap',
    indications: [
      'Community-acquired pneumonia (atypical coverage)',
      'Chlamydial infections and pelvic inflammatory disease',
      'Rickettsial diseases',
      'Acne vulgaris (moderate-severe)',
      'Malaria prophylaxis',
      'Lyme disease',
    ],
    contraindications: [
      'Pregnancy (2nd and 3rd trimester)',
      'Children under 8 years (permanent teeth staining)',
      'Hypersensitivity to tetracyclines',
    ],
    commonDosages: [
      '100mg twice daily (most infections)',
      '100mg once daily (acne, malaria prophylaxis)',
      '200mg on Day 1, then 100mg daily (mild infections)',
    ],
    interactions: [
      { drug: 'Antacids / Iron / Calcium', severity: 'Major', description: 'Chelation significantly reduces absorption — space by 2–3 hours' },
      { drug: 'Warfarin', severity: 'Moderate', description: 'Enhanced anticoagulant effect — monitor INR' },
      { drug: 'Isotretinoin', severity: 'Major', description: 'Increased risk of pseudotumor cerebri — avoid combination' },
    ],
    alternatives: ['Minocycline', 'Azithromycin', 'Tetracycline'],
    warnings: ['Take with full glass of water and remain upright for 30 min — esophageal ulceration risk', 'Photosensitivity — advise sunscreen and sun avoidance'],
  },

  // ─── More CNS ─────────────────────────────
  {
    id: 'dm-41',
    brandName: 'Xanax',
    genericName: 'Alprazolam',
    category: 'CNS',
    form: 'Tablet',
    strength: '0.5mg',
    route: 'Oral',
    hmoCovered: false,
    philhealthCovered: false,
    controlledSchedule: 'Schedule IV',
    stockStatus: 'In Stock',
    priceRange: '₱10 – ₱25 / tab',
    indications: [
      'Generalized anxiety disorder (GAD)',
      'Panic disorder with or without agoraphobia',
      'Short-term anxiety relief',
    ],
    contraindications: [
      'Acute narrow-angle glaucoma',
      'Concomitant ketoconazole or itraconazole',
      'Severe respiratory insufficiency',
      'Myasthenia gravis',
    ],
    commonDosages: [
      '0.25–0.5mg three times daily (anxiety)',
      '0.5mg three times daily (panic disorder, initial)',
      'Max 4mg/day in divided doses (panic disorder)',
    ],
    interactions: [
      { drug: 'Opioids', severity: 'Major', description: 'Risk of profound sedation, respiratory depression, and death — FDA boxed warning' },
      { drug: 'CYP3A4 inhibitors (ketoconazole, clarithromycin)', severity: 'Major', description: 'Dramatically increased alprazolam levels — contraindicated with strong inhibitors' },
      { drug: 'Alcohol / CNS depressants', severity: 'Major', description: 'Additive CNS depression — avoid' },
    ],
    alternatives: ['Lorazepam', 'Clonazepam', 'Buspirone (non-benzo)', 'SSRIs (for long-term anxiety)'],
    warnings: ['Controlled substance (Schedule IV) — high dependence potential', 'Taper gradually to avoid seizures and withdrawal syndrome', 'Prescribe lowest effective dose for shortest duration'],
  },

  // ─── Anti-hypertensive Combo ──────────────
  {
    id: 'dm-42',
    brandName: 'Amlosar',
    genericName: 'Losartan Potassium + Amlodipine Besylate',
    category: 'Cardiovascular',
    form: 'Tablet',
    strength: '50/5mg',
    route: 'Oral',
    hmoCovered: true,
    philhealthCovered: false,
    stockStatus: 'In Stock',
    priceRange: '₱15 – ₱35 / tab',
    indications: [
      'Hypertension not adequately controlled on monotherapy',
      'Simplification of antihypertensive regimen (pill burden reduction)',
    ],
    contraindications: [
      'Pregnancy (2nd & 3rd trimester)',
      'Bilateral renal artery stenosis',
      'Severe aortic stenosis',
      'Hypersensitivity to ARBs or dihydropyridine CCBs',
    ],
    commonDosages: [
      '1 tablet (50/5mg) once daily',
      'May titrate to 100/10mg if needed (higher strength combination)',
      'Take at the same time each day',
    ],
    interactions: [
      { drug: 'Potassium supplements / K-sparing diuretics', severity: 'Major', description: 'Hyperkalemia risk from losartan component' },
      { drug: 'NSAIDs', severity: 'Moderate', description: 'Reduced antihypertensive effect and worsened renal function' },
      { drug: 'Simvastatin', severity: 'Moderate', description: 'Limit simvastatin to 20mg/day with amlodipine component' },
    ],
    alternatives: ['Telmisartan + Amlodipine (Twynsta)', 'Valsartan + Amlodipine (Exforge)', 'Losartan + HCTZ'],
    warnings: ['Common fixed-dose combination in the Philippines', 'Peripheral edema from amlodipine component is dose-dependent', 'Monitor potassium and renal function periodically'],
  },

  // ─── Diabetes Addition ────────────────────
  {
    id: 'dm-43',
    brandName: 'Jardiance',
    genericName: 'Empagliflozin',
    category: 'Diabetes',
    form: 'Tablet',
    strength: '10mg',
    route: 'Oral',
    hmoCovered: true,
    philhealthCovered: false,
    stockStatus: 'Low Stock',
    priceRange: '₱60 – ₱100 / tab',
    indications: [
      'Type 2 diabetes mellitus',
      'Heart failure with reduced ejection fraction (HFrEF)',
      'Chronic kidney disease (eGFR ≥ 20)',
      'Cardiovascular risk reduction in T2DM with established ASCVD',
    ],
    contraindications: [
      'Type 1 diabetes (increased DKA risk)',
      'Severe renal impairment eGFR < 20 (for glycemic control)',
      'Dialysis',
      'Hypersensitivity to empagliflozin',
    ],
    commonDosages: [
      '10mg once daily in the morning (initial)',
      '25mg once daily (max for T2DM)',
      '10mg once daily (heart failure / CKD)',
    ],
    interactions: [
      { drug: 'Insulin / Sulfonylureas', severity: 'Moderate', description: 'Increased hypoglycemia risk — consider reducing insulin/SU dose' },
      { drug: 'Loop diuretics', severity: 'Moderate', description: 'Additive volume depletion and hypotension risk' },
      { drug: 'Lithium', severity: 'Minor', description: 'SGLT2 inhibitors may alter lithium levels — monitor' },
    ],
    alternatives: ['Dapagliflozin (Forxiga)', 'Canagliflozin (Invokana)', 'Ertugliflozin'],
    warnings: ['Risk of euglycemic diabetic ketoacidosis — hold 3 days before major surgery', 'Fournier gangrene (necrotizing fasciitis of perineum) — rare but serious', 'Increased genital mycotic infections — counsel on hygiene'],
  },
];

/* ═══════════════════════════════════════════════════
   Filter categories
   ═══════════════════════════════════════════════════ */

const CATEGORIES = ['All', 'Cardiovascular', 'Diabetes', 'Pain', 'Antibiotics', 'GI', 'Respiratory', 'CNS', 'Vitamins'] as const;

/* ═══════════════════════════════════════════════════
   Inline styles (consistent with other provider pages)
   ═══════════════════════════════════════════════════ */

const S: Record<string, React.CSSProperties> = {
  page: { padding: 24, background: 'var(--color-background)', minHeight: '100%' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap' as const, gap: 16, marginBottom: 24 },
  titleWrap: { display: 'flex', flexDirection: 'column' as const, gap: 4 },
  title: { fontSize: 24, fontWeight: 700, color: 'var(--color-text)', margin: 0 },
  subtitle: { fontSize: 14, color: 'var(--color-text-muted)', margin: 0 },
  toolbar: { display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' as const, alignItems: 'center' },
  searchWrap: { position: 'relative' as const, flex: 1, minWidth: 260 },
  searchIcon: { position: 'absolute' as const, left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' },
  searchInput: {
    width: '100%',
    padding: '10px 14px 10px 38px',
    border: '1px solid var(--color-border)',
    borderRadius: 8,
    fontSize: 14,
    background: 'var(--color-surface)',
    color: 'var(--color-text)',
    boxSizing: 'border-box' as const,
  },
  pills: { display: 'flex', gap: 8, flexWrap: 'wrap' as const, marginBottom: 20 },
  pill: {
    padding: '6px 14px',
    borderRadius: 20,
    fontSize: 13,
    fontWeight: 600,
    border: '1px solid var(--color-border)',
    background: 'var(--color-surface)',
    color: 'var(--color-text-muted)',
    cursor: 'pointer',
  },
  pillActive: {
    background: 'var(--color-primary)',
    borderColor: 'var(--color-primary)',
    color: 'white',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(370px, 1fr))',
    gap: 20,
    marginBottom: 32,
  },
  card: {
    background: 'var(--color-surface)',
    borderRadius: 'var(--radius, 12px)',
    boxShadow: 'var(--shadow-sm, 0 1px 3px rgba(0,0,0,.06))',
    border: '1px solid var(--color-border)',
    overflow: 'hidden',
  },
  cardHeader: {
    padding: '18px 20px 14px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 8,
  },
  cardTopRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  brandName: { fontSize: 16, fontWeight: 700, color: 'var(--color-text)', margin: 0, lineHeight: 1.3 },
  genericName: { fontSize: 13, color: 'var(--color-text-muted)', margin: 0 },
  categoryBadge: {
    display: 'inline-block',
    padding: '3px 10px',
    borderRadius: 12,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 0.3,
    textTransform: 'uppercase' as const,
    flexShrink: 0,
  },
  detailRow: {
    display: 'flex',
    gap: 16,
    fontSize: 13,
    color: 'var(--color-text-muted)',
    flexWrap: 'wrap' as const,
  },
  detailItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  badgeRow: {
    display: 'flex',
    gap: 6,
    flexWrap: 'wrap' as const,
    alignItems: 'center',
    padding: '0 20px 14px',
  },
  coverageBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '3px 10px',
    borderRadius: 6,
    fontSize: 11,
    fontWeight: 700,
  },
  stockBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '3px 10px',
    borderRadius: 6,
    fontSize: 11,
    fontWeight: 700,
  },
  controlledBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '3px 10px',
    borderRadius: 6,
    fontSize: 11,
    fontWeight: 700,
    background: '#fef3c7',
    color: '#92400e',
  },
  priceRange: {
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--color-text)',
    padding: '0 20px 14px',
  },
  expandBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    width: '100%',
    padding: '10px 20px',
    background: 'var(--color-background)',
    border: 'none',
    borderTop: '1px solid var(--color-border)',
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--color-primary)',
    cursor: 'pointer',
  },
  expandSection: {
    padding: '16px 20px 20px',
    borderTop: '1px solid var(--color-border)',
    background: 'var(--color-background)',
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: 700,
    color: 'var(--color-text)',
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    marginBottom: 6,
    marginTop: 14,
  },
  bulletList: {
    margin: 0,
    paddingLeft: 18,
    fontSize: 13,
    color: 'var(--color-text-muted)',
    lineHeight: 1.7,
    listStyleType: 'disc' as const,
  },
  interactionRow: {
    display: 'flex',
    gap: 8,
    alignItems: 'flex-start',
    padding: '4px 0',
    fontSize: 13,
  },
  severityBadge: {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: 4,
    fontSize: 11,
    fontWeight: 700,
    flexShrink: 0,
  },
  altPill: {
    display: 'inline-block',
    padding: '3px 10px',
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 500,
    background: 'var(--color-surface)',
    color: 'var(--color-text-muted)',
    border: '1px solid var(--color-border)',
    marginRight: 6,
    marginBottom: 4,
  },
  warningBox: {
    display: 'flex',
    gap: 8,
    alignItems: 'flex-start',
    padding: '10px 12px',
    borderRadius: 8,
    background: '#fef3c7',
    fontSize: 13,
    color: '#92400e',
    marginTop: 8,
  },
  banner: {
    margin: '12px 0 0',
    padding: '14px 20px',
    borderRadius: 'var(--radius, 12px)',
    background: 'var(--color-surface)',
    border: '1px dashed var(--color-border)',
    fontSize: 13,
    color: 'var(--color-text-muted)',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    background: 'var(--color-surface)',
    borderRadius: 12,
    padding: 20,
    boxShadow: '0 1px 3px rgba(0,0,0,.06)',
    border: '1px solid var(--color-border)',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 4,
  },
  statValue: { fontSize: 22, fontWeight: 700, color: 'var(--color-text)' },
  statLabel: { fontSize: 13, color: 'var(--color-text-muted)' },
  emptyState: {
    textAlign: 'center' as const,
    padding: 60,
    color: 'var(--color-text-muted)',
    fontSize: 15,
  },
};

/* ═══════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════ */

const CATEGORY_COLORS: Record<string, { bg: string; color: string }> = {
  Cardiovascular: { bg: '#fee2e2', color: '#991b1b' },
  Diabetes: { bg: '#dbeafe', color: '#1e40af' },
  Pain: { bg: '#fef9c3', color: '#854d0e' },
  Antibiotics: { bg: '#dcfce7', color: '#166534' },
  GI: { bg: '#f3e8ff', color: '#6b21a8' },
  Respiratory: { bg: '#e0f2fe', color: '#075985' },
  CNS: { bg: '#fce7f3', color: '#9d174d' },
  Vitamins: { bg: '#ecfdf5', color: '#065f46' },
};

function getCategoryStyle(category: string): React.CSSProperties {
  const c = CATEGORY_COLORS[category] ?? { bg: 'var(--color-background)', color: 'var(--color-text-muted)' };
  return { background: c.bg, color: c.color };
}

function getStockStyle(status: string): React.CSSProperties {
  if (status === 'In Stock') return { background: '#dcfce7', color: '#166534' };
  if (status === 'Low Stock') return { background: '#fef3c7', color: '#92400e' };
  return { background: '#fee2e2', color: '#991b1b' };
}

function getSeverityStyle(sev: string): React.CSSProperties {
  if (sev === 'Major') return { background: '#fee2e2', color: '#991b1b' };
  if (sev === 'Moderate') return { background: '#fef3c7', color: '#92400e' };
  return { background: '#dbeafe', color: '#1e40af' };
}

/* ═══════════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════════ */

export function DrugMaster() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('All');
  const [selectedDrug, setSelectedDrug] = useState<DrugMasterEntry | null>(null);
  const [drugs, setDrugs] = useState<DrugMasterEntry[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showApiModal, setShowApiModal] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);

  // Add Drug form state
  const [newDrug, setNewDrug] = useState({
    brandName: '',
    genericName: '',
    category: 'Cardiovascular',
    form: '',
    strength: '',
    route: 'Oral',
    hmoCovered: false,
    philhealthCovered: false,
    stockStatus: 'In Stock' as 'In Stock' | 'Low Stock' | 'Out of Stock',
    priceRange: '',
  });

  // API modal state
  const [apiProvider, setApiProvider] = useState('medispan');
  const [apiKey, setApiKey] = useState('');
  const [apiEndpoint, setApiEndpoint] = useState('');
  const [autoSync, setAutoSync] = useState(false);
  const [syncInterval, setSyncInterval] = useState('6h');
  const [apiTestSuccess, setApiTestSuccess] = useState(false);

  useEffect(() => {
    setDrugs([...DRUG_DATA]);
  }, []);

  const filtered = useMemo(() => {
    return drugs.filter((d) => {
      const q = search.toLowerCase();
      const matchSearch =
        !search ||
        d.brandName.toLowerCase().includes(q) ||
        d.genericName.toLowerCase().includes(q) ||
        d.category.toLowerCase().includes(q) ||
        d.indications.some((ind) => ind.toLowerCase().includes(q));
      const matchCategory = category === 'All' || d.category === category;
      return matchSearch && matchCategory;
    });
  }, [search, category, drugs]);

  const totalDrugs = drugs.length;
  const inStockCount = drugs.filter((d) => d.stockStatus === 'In Stock').length;
  const lowStockCount = drugs.filter((d) => d.stockStatus === 'Low Stock').length;
  const controlledCount = drugs.filter((d) => d.controlledSchedule).length;

  const handleAddDrug = () => {
    if (!newDrug.brandName || !newDrug.genericName) return;
    const entry: DrugMasterEntry = {
      id: `dm-custom-${Date.now()}`,
      brandName: newDrug.brandName,
      genericName: newDrug.genericName,
      category: newDrug.category,
      form: newDrug.form || 'Tablet',
      strength: newDrug.strength || '',
      route: newDrug.route,
      hmoCovered: newDrug.hmoCovered,
      philhealthCovered: newDrug.philhealthCovered,
      stockStatus: newDrug.stockStatus,
      priceRange: newDrug.priceRange || '—',
      indications: [],
      contraindications: [],
      commonDosages: [],
      interactions: [],
      alternatives: [],
    };
    setDrugs((prev) => [entry, ...prev]);
    setNewDrug({ brandName: '', genericName: '', category: 'Cardiovascular', form: '', strength: '', route: 'Oral', hmoCovered: false, philhealthCovered: false, stockStatus: 'In Stock', priceRange: '' });
    setAddSuccess(true);
    setTimeout(() => { setAddSuccess(false); setShowAddModal(false); }, 1500);
  };

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={S.header}>
        <div style={S.titleWrap}>
          <h1 style={S.title}>Drug Master / Formulary Database</h1>
          <p style={S.subtitle}>Comprehensive drug information, coverage status, interactions, and formulary data</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', borderRadius: 8, background: 'var(--color-primary)', color: 'white', border: 'none', fontWeight: 600, fontSize: 13, cursor: 'pointer' }} onClick={() => setShowAddModal(true)}>
            <Plus size={16} /> Add Drug
          </button>
          <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', borderRadius: 8, background: 'var(--color-surface)', color: 'var(--color-primary)', border: '1px solid var(--color-primary)', fontWeight: 600, fontSize: 13, cursor: 'pointer' }} onClick={() => setShowApiModal(true)}>
            <Plug size={16} /> Connect Formulary API
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={S.statsRow}>
        <div style={S.statCard}>
          <span style={S.statValue}>{totalDrugs}</span>
          <span style={S.statLabel}>Total Entries</span>
        </div>
        <div style={S.statCard}>
          <span style={{ ...S.statValue, color: 'var(--color-success)' }}>{inStockCount}</span>
          <span style={S.statLabel}>In Stock</span>
        </div>
        <div style={S.statCard}>
          <span style={{ ...S.statValue, color: 'var(--color-warning)' }}>{lowStockCount}</span>
          <span style={S.statLabel}>Low Stock</span>
        </div>
        <div style={S.statCard}>
          <span style={{ ...S.statValue, color: '#92400e' }}>{controlledCount}</span>
          <span style={S.statLabel}>Controlled Substances</span>
        </div>
      </div>

      {/* Search */}
      <div style={S.toolbar}>
        <div style={S.searchWrap}>
          <Search size={18} style={S.searchIcon} />
          <input
            type="search"
            placeholder="Search by brand name, generic name, category, or indication..."
            style={S.searchInput}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search drugs"
          />
        </div>
      </div>

      {/* Category filter pills */}
      <div style={S.pills}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            style={{
              ...S.pill,
              ...(category === cat ? S.pillActive : {}),
            }}
            onClick={() => setCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Drug cards grid */}
      {filtered.length === 0 ? (
        <div style={S.emptyState}>
          <Package size={40} style={{ marginBottom: 12, opacity: 0.3 }} />
          <div>No drugs match your search criteria.</div>
        </div>
      ) : (
        <div style={S.grid}>
          {filtered.map((drug) => (
              <div key={drug.id} style={S.card}>
                {/* Card header */}
                <div style={S.cardHeader}>
                  <div style={S.cardTopRow}>
                    <div>
                      <h3 style={S.brandName}>{drug.brandName}</h3>
                      <p style={S.genericName}>{drug.genericName}</p>
                    </div>
                    <span style={{ ...S.categoryBadge, ...getCategoryStyle(drug.category) }}>
                      {drug.category}
                    </span>
                  </div>
                  <div style={S.detailRow}>
                    <span style={S.detailItem}>{drug.form} {drug.strength}</span>
                    <span style={S.detailItem}>Route: {drug.route}</span>
                  </div>
                </div>

                {/* Coverage + status badges */}
                <div style={S.badgeRow}>
                  <span
                    style={{
                      ...S.coverageBadge,
                      background: drug.hmoCovered ? '#dcfce7' : '#f3f4f6',
                      color: drug.hmoCovered ? '#166534' : '#9ca3af',
                    }}
                  >
                    <Shield size={12} />
                    HMO {drug.hmoCovered ? '✓' : '✗'}
                  </span>
                  <span
                    style={{
                      ...S.coverageBadge,
                      background: drug.philhealthCovered ? '#dbeafe' : '#f3f4f6',
                      color: drug.philhealthCovered ? '#1e40af' : '#9ca3af',
                    }}
                  >
                    <Shield size={12} />
                    PhilHealth {drug.philhealthCovered ? '✓' : '✗'}
                  </span>
                  {drug.controlledSchedule && (
                    <span style={S.controlledBadge}>
                      <AlertTriangle size={12} />
                      {drug.controlledSchedule}
                    </span>
                  )}
                  <span style={{ ...S.stockBadge, ...getStockStyle(drug.stockStatus) }}>
                    <Package size={12} />
                    {drug.stockStatus}
                  </span>
                </div>

                {/* Price */}
                <div style={S.priceRange}>
                  {drug.priceRange}
                </div>

                {/* View Details button — opens modal */}
                <button
                  style={S.expandBtn}
                  onClick={() => setSelectedDrug(drug)}
                >
                  <Info size={16} /> View Details
                </button>
              </div>
          ))}
        </div>
      )}

      {/* ─── Drug Detail Modal ─── */}
      {selectedDrug && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setSelectedDrug(null)}>
          <div style={{ background: 'var(--color-surface)', borderRadius: 16, maxWidth: 640, width: '100%', maxHeight: '85vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
            {/* Modal header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'sticky', top: 0, background: 'var(--color-surface)', zIndex: 1, borderRadius: '16px 16px 0 0' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>{selectedDrug.brandName}</h2>
                <p style={{ margin: '4px 0 0', fontSize: 14, color: 'var(--color-text-muted)' }}>{selectedDrug.genericName}</p>
                <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                  <span style={{ ...S.categoryBadge, ...getCategoryStyle(selectedDrug.category) }}>{selectedDrug.category}</span>
                  <span style={{ fontSize: 13, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center' }}>{selectedDrug.form} {selectedDrug.strength} • {selectedDrug.route}</span>
                </div>
              </div>
              <button onClick={() => setSelectedDrug(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--color-text-muted)' }}>
                <X size={20} />
              </button>
            </div>
            {/* Modal body */}
            <div style={{ padding: '16px 24px 24px' }}>
              {/* Coverage badges */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center', marginBottom: 16 }}>
                <span style={{ ...S.coverageBadge, background: selectedDrug.hmoCovered ? '#dcfce7' : '#f3f4f6', color: selectedDrug.hmoCovered ? '#166534' : '#9ca3af' }}>
                  <Shield size={12} /> HMO {selectedDrug.hmoCovered ? '✓' : '✗'}
                </span>
                <span style={{ ...S.coverageBadge, background: selectedDrug.philhealthCovered ? '#dbeafe' : '#f3f4f6', color: selectedDrug.philhealthCovered ? '#1e40af' : '#9ca3af' }}>
                  <Shield size={12} /> PhilHealth {selectedDrug.philhealthCovered ? '✓' : '✗'}
                </span>
                {selectedDrug.controlledSchedule && (
                  <span style={S.controlledBadge}><AlertTriangle size={12} /> {selectedDrug.controlledSchedule}</span>
                )}
                <span style={{ ...S.stockBadge, ...getStockStyle(selectedDrug.stockStatus) }}>
                  <Package size={12} /> {selectedDrug.stockStatus}
                </span>
              </div>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 16 }}>{selectedDrug.priceRange}</div>

              {/* Indications */}
              {selectedDrug.indications.length > 0 && (
                <>
                  <div style={{ ...S.sectionLabel, marginTop: 0 }}>Indications</div>
                  <ul style={S.bulletList}>
                    {selectedDrug.indications.map((ind, i) => <li key={i}>{ind}</li>)}
                  </ul>
                </>
              )}

              {/* Contraindications */}
              {selectedDrug.contraindications.length > 0 && (
                <>
                  <div style={S.sectionLabel}>Contraindications</div>
                  <ul style={S.bulletList}>
                    {selectedDrug.contraindications.map((c, i) => <li key={i}>{c}</li>)}
                  </ul>
                </>
              )}

              {/* Common Dosages */}
              {selectedDrug.commonDosages.length > 0 && (
                <>
                  <div style={S.sectionLabel}>Common Dosages</div>
                  <ul style={S.bulletList}>
                    {selectedDrug.commonDosages.map((d, i) => <li key={i}>{d}</li>)}
                  </ul>
                </>
              )}

              {/* Drug Interactions */}
              {selectedDrug.interactions.length > 0 && (
                <>
                  <div style={S.sectionLabel}>Drug Interactions</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {selectedDrug.interactions.map((inter, i) => (
                      <div key={i} style={S.interactionRow}>
                        <span style={{ ...S.severityBadge, ...getSeverityStyle(inter.severity) }}>{inter.severity}</span>
                        <span style={{ color: 'var(--color-text-muted)' }}>
                          <strong style={{ color: 'var(--color-text)' }}>{inter.drug}</strong>{' — '}{inter.description}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Therapeutic Alternatives */}
              {selectedDrug.alternatives.length > 0 && (
                <>
                  <div style={S.sectionLabel}>Therapeutic Alternatives</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    {selectedDrug.alternatives.map((alt, i) => <span key={i} style={S.altPill}>{alt}</span>)}
                  </div>
                </>
              )}

              {/* Warnings */}
              {selectedDrug.warnings && selectedDrug.warnings.length > 0 && (
                <>
                  <div style={S.sectionLabel}>Notes / Warnings</div>
                  {selectedDrug.warnings.map((w, i) => (
                    <div key={i} style={S.warningBox}>
                      <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
                      <span>{w}</span>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── Add Drug Modal ─── */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setShowAddModal(false)}>
          <div style={{ background: 'var(--color-surface)', borderRadius: 16, maxWidth: 540, width: '100%', maxHeight: '85vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'var(--color-surface)', zIndex: 1, borderRadius: '16px 16px 0 0' }}>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Add New Drug</h2>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--color-text-muted)' }}><X size={20} /></button>
            </div>
            <div style={{ padding: '16px 24px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {addSuccess && (
                <div style={{ padding: '10px 14px', borderRadius: 8, background: '#dcfce7', color: '#166534', fontWeight: 600, fontSize: 14, textAlign: 'center' }}>Drug added successfully</div>
              )}
              <label style={modalLabelStyle}>
                Brand Name *
                <input style={modalInputStyle} value={newDrug.brandName} onChange={e => setNewDrug(p => ({ ...p, brandName: e.target.value }))} placeholder="e.g. Norvasc" />
              </label>
              <label style={modalLabelStyle}>
                Generic Name *
                <input style={modalInputStyle} value={newDrug.genericName} onChange={e => setNewDrug(p => ({ ...p, genericName: e.target.value }))} placeholder="e.g. Amlodipine Besylate" />
              </label>
              <label style={modalLabelStyle}>
                Category
                <select style={modalInputStyle} value={newDrug.category} onChange={e => setNewDrug(p => ({ ...p, category: e.target.value }))}>
                  {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <label style={modalLabelStyle}>
                  Form
                  <input style={modalInputStyle} value={newDrug.form} onChange={e => setNewDrug(p => ({ ...p, form: e.target.value }))} placeholder="e.g. Tablet" />
                </label>
                <label style={modalLabelStyle}>
                  Strength
                  <input style={modalInputStyle} value={newDrug.strength} onChange={e => setNewDrug(p => ({ ...p, strength: e.target.value }))} placeholder="e.g. 500mg" />
                </label>
              </div>
              <label style={modalLabelStyle}>
                Route
                <select style={modalInputStyle} value={newDrug.route} onChange={e => setNewDrug(p => ({ ...p, route: e.target.value }))}>
                  <option>Oral</option>
                  <option>Subcutaneous</option>
                  <option>Topical</option>
                  <option>IV</option>
                  <option>IM</option>
                </select>
              </label>
              <div style={{ display: 'flex', gap: 20 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--color-text)', cursor: 'pointer' }}>
                  <input type="checkbox" checked={newDrug.hmoCovered} onChange={e => setNewDrug(p => ({ ...p, hmoCovered: e.target.checked }))} /> HMO Covered
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--color-text)', cursor: 'pointer' }}>
                  <input type="checkbox" checked={newDrug.philhealthCovered} onChange={e => setNewDrug(p => ({ ...p, philhealthCovered: e.target.checked }))} /> PhilHealth Covered
                </label>
              </div>
              <label style={modalLabelStyle}>
                Stock Status
                <select style={modalInputStyle} value={newDrug.stockStatus} onChange={e => setNewDrug(p => ({ ...p, stockStatus: e.target.value as 'In Stock' | 'Low Stock' | 'Out of Stock' }))}>
                  <option>In Stock</option>
                  <option>Low Stock</option>
                  <option>Out of Stock</option>
                </select>
              </label>
              <label style={modalLabelStyle}>
                Price Range
                <input style={modalInputStyle} value={newDrug.priceRange} onChange={e => setNewDrug(p => ({ ...p, priceRange: e.target.value }))} placeholder="e.g. ₱10 – ₱25 / tab" />
              </label>
              <button style={{ padding: '12px 20px', borderRadius: 8, background: 'var(--color-primary)', color: 'white', border: 'none', fontWeight: 700, fontSize: 14, cursor: 'pointer', marginTop: 4 }} onClick={handleAddDrug}>
                Add Drug to Formulary
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Connect Formulary API Modal ─── */}
      {showApiModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setShowApiModal(false)}>
          <div style={{ background: 'var(--color-surface)', borderRadius: 16, maxWidth: 560, width: '100%', maxHeight: '85vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'var(--color-surface)', zIndex: 1, borderRadius: '16px 16px 0 0' }}>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Connect External Formulary</h2>
              <button onClick={() => setShowApiModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--color-text-muted)' }}><X size={20} /></button>
            </div>
            <div style={{ padding: '16px 24px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <p style={{ margin: 0, fontSize: 14, color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                Sync your drug database with an external formulary service for real-time updates, drug interaction checks, and coverage information.
              </p>

              {apiTestSuccess && (
                <div style={{ padding: '10px 14px', borderRadius: 8, background: '#dcfce7', color: '#166534', fontWeight: 600, fontSize: 14, textAlign: 'center' }}>Connection successful ✓</div>
              )}

              {/* Provider options */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Provider</div>
                {[
                  { id: 'medispan', name: 'Medispan (First Databank)', desc: 'Industry-standard drug information database' },
                  { id: 'uptodate', name: 'UpToDate (Wolters Kluwer)', desc: 'Evidence-based clinical decision support' },
                  { id: 'mims', name: 'MIMS Philippines', desc: 'Local drug reference for Philippine formulary' },
                ].map(prov => (
                  <label key={prov.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 14px', borderRadius: 10, border: `1.5px solid ${apiProvider === prov.id ? 'var(--color-primary)' : 'var(--color-border)'}`, background: apiProvider === prov.id ? 'var(--color-background)' : 'transparent', cursor: 'pointer', transition: 'border-color .15s' }}>
                    <input type="radio" name="api-provider" checked={apiProvider === prov.id} onChange={() => setApiProvider(prov.id)} style={{ marginTop: 3 }} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--color-text)' }}>{prov.name}</div>
                      <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{prov.desc}</div>
                    </div>
                  </label>
                ))}
              </div>

              {/* API Key */}
              <label style={modalLabelStyle}>
                API Key
                <input style={modalInputStyle} value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="Enter your API key..." type="password" />
              </label>

              {/* Endpoint URL */}
              <label style={modalLabelStyle}>
                Endpoint URL
                <input style={modalInputStyle} value={apiEndpoint} onChange={e => setApiEndpoint(e.target.value)} placeholder="https://api.medispan.com/v2/" />
              </label>

              {/* Auto-sync + interval */}
              <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--color-text)', cursor: 'pointer' }}>
                  <input type="checkbox" checked={autoSync} onChange={e => setAutoSync(e.target.checked)} /> Auto-sync
                </label>
                {autoSync && (
                  <label style={{ ...modalLabelStyle, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    Interval:
                    <select style={{ ...modalInputStyle, width: 'auto' }} value={syncInterval} onChange={e => setSyncInterval(e.target.value)}>
                      <option value="6h">Every 6 hours</option>
                      <option value="12h">Every 12 hours</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                    </select>
                  </label>
                )}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button style={{ flex: 1, padding: '12px 20px', borderRadius: 8, background: 'var(--color-background)', color: 'var(--color-primary)', border: '1px solid var(--color-primary)', fontWeight: 700, fontSize: 14, cursor: 'pointer' }} onClick={() => { setApiTestSuccess(true); setTimeout(() => setApiTestSuccess(false), 3000); }}>
                  Test Connection
                </button>
                <button style={{ flex: 1, padding: '12px 20px', borderRadius: 8, background: 'var(--color-primary)', color: 'white', border: 'none', fontWeight: 700, fontSize: 14, cursor: 'pointer' }} onClick={() => setShowApiModal(false)}>
                  Save Configuration
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Integration banner */}
      <div style={S.banner}>
        <Info size={18} style={{ flexShrink: 0, color: 'var(--color-primary)' }} />
        <span>
          For production deployment: integrate with <strong>Medispan</strong> or <strong>UpToDate API</strong> for real-time drug information, formulary updates, and interaction checking.
        </span>
      </div>
    </div>
  );
}

/* Shared modal field styles */
const modalLabelStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13, fontWeight: 600, color: 'var(--color-text)' };
const modalInputStyle: React.CSSProperties = { padding: '10px 12px', borderRadius: 8, border: '1px solid var(--color-border)', fontSize: 14, background: 'var(--color-surface)', color: 'var(--color-text)', boxSizing: 'border-box', width: '100%' };

/* ═══════════════════════════════════════════════════
   Reusable Drug Lookup Modal
   Pass a drugName and onClose callback.
   ═══════════════════════════════════════════════════ */

interface DrugLookupModalProps {
  drugName: string;
  onClose: () => void;
}

export function DrugLookupModal({ drugName, onClose }: DrugLookupModalProps) {
  const q = drugName.toLowerCase();
  const match = DRUG_DATA.find(
    (d) =>
      d.brandName.toLowerCase().includes(q) ||
      d.genericName.toLowerCase().includes(q) ||
      q.includes(d.brandName.toLowerCase().split(' ')[0]) ||
      q.includes(d.genericName.toLowerCase().split(' ')[0])
  );

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={onClose}
    >
      <div
        style={{ background: 'var(--color-surface)', borderRadius: 16, maxWidth: 640, width: '100%', maxHeight: '85vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {match ? (
          <>
            {/* Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'sticky', top: 0, background: 'var(--color-surface)', zIndex: 1, borderRadius: '16px 16px 0 0' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>{match.brandName}</h2>
                <p style={{ margin: '4px 0 0', fontSize: 14, color: 'var(--color-text-muted)' }}>{match.genericName}</p>
                <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                  <span style={{ ...S.categoryBadge, ...getCategoryStyle(match.category) }}>{match.category}</span>
                  <span style={{ fontSize: 13, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center' }}>{match.form} {match.strength} • {match.route}</span>
                </div>
              </div>
              <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--color-text-muted)' }}>
                <X size={20} />
              </button>
            </div>
            {/* Body */}
            <div style={{ padding: '16px 24px 24px' }}>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center', marginBottom: 16 }}>
                <span style={{ ...S.coverageBadge, background: match.hmoCovered ? '#dcfce7' : '#f3f4f6', color: match.hmoCovered ? '#166534' : '#9ca3af' }}>
                  <Shield size={12} /> HMO {match.hmoCovered ? '✓' : '✗'}
                </span>
                <span style={{ ...S.coverageBadge, background: match.philhealthCovered ? '#dbeafe' : '#f3f4f6', color: match.philhealthCovered ? '#1e40af' : '#9ca3af' }}>
                  <Shield size={12} /> PhilHealth {match.philhealthCovered ? '✓' : '✗'}
                </span>
                {match.controlledSchedule && (
                  <span style={S.controlledBadge}><AlertTriangle size={12} /> {match.controlledSchedule}</span>
                )}
                <span style={{ ...S.stockBadge, ...getStockStyle(match.stockStatus) }}>
                  <Package size={12} /> {match.stockStatus}
                </span>
              </div>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 16 }}>{match.priceRange}</div>

              {match.indications.length > 0 && (
                <>
                  <div style={{ ...S.sectionLabel, marginTop: 0 }}>Indications</div>
                  <ul style={S.bulletList}>{match.indications.map((ind, i) => <li key={i}>{ind}</li>)}</ul>
                </>
              )}
              {match.contraindications.length > 0 && (
                <>
                  <div style={S.sectionLabel}>Contraindications</div>
                  <ul style={S.bulletList}>{match.contraindications.map((c, i) => <li key={i}>{c}</li>)}</ul>
                </>
              )}
              {match.commonDosages.length > 0 && (
                <>
                  <div style={S.sectionLabel}>Common Dosages</div>
                  <ul style={S.bulletList}>{match.commonDosages.map((d, i) => <li key={i}>{d}</li>)}</ul>
                </>
              )}
              {match.interactions.length > 0 && (
                <>
                  <div style={S.sectionLabel}>Drug Interactions</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {match.interactions.map((inter, i) => (
                      <div key={i} style={S.interactionRow}>
                        <span style={{ ...S.severityBadge, ...getSeverityStyle(inter.severity) }}>{inter.severity}</span>
                        <span style={{ color: 'var(--color-text-muted)' }}>
                          <strong style={{ color: 'var(--color-text)' }}>{inter.drug}</strong>{' — '}{inter.description}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
              {match.alternatives.length > 0 && (
                <>
                  <div style={S.sectionLabel}>Therapeutic Alternatives</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    {match.alternatives.map((alt, i) => <span key={i} style={S.altPill}>{alt}</span>)}
                  </div>
                </>
              )}
              {match.warnings && match.warnings.length > 0 && (
                <>
                  <div style={S.sectionLabel}>Notes / Warnings</div>
                  {match.warnings.map((w, i) => (
                    <div key={i} style={S.warningBox}>
                      <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
                      <span>{w}</span>
                    </div>
                  ))}
                </>
              )}
            </div>
          </>
        ) : (
          /* No match found */
          <div style={{ padding: '40px 24px', textAlign: 'center' }}>
            <Package size={40} style={{ marginBottom: 12, opacity: 0.3, color: 'var(--color-text-muted)' }} />
            <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700, color: 'var(--color-text)' }}>
              No match for "{drugName}"
            </h3>
            <p style={{ margin: 0, fontSize: 14, color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
              This drug was not found in the formulary database. Check the Drug Master for the full list or contact pharmacy.
            </p>
            <button
              onClick={onClose}
              style={{ marginTop: 16, padding: '10px 24px', borderRadius: 8, background: 'var(--color-primary)', color: '#fff', border: 'none', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   Reusable Drug Info Modal
   Can be used from any portal (patient, doctor, provider).
   Pass a drugName string and the component will
   partial-match against DRUG_DATA by brandName or genericName.
   ═══════════════════════════════════════════════════ */

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.5)',
  zIndex: 1100,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 20,
};

const modalStyle: React.CSSProperties = {
  background: 'var(--color-surface)',
  borderRadius: 16,
  maxWidth: 640,
  width: '100%',
  maxHeight: '85vh',
  overflow: 'auto',
  boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
};

const closeBtnStyle: React.CSSProperties = {
  marginTop: 16,
  padding: '10px 24px',
  borderRadius: 8,
  background: 'var(--color-primary)',
  color: '#fff',
  border: 'none',
  fontWeight: 600,
  fontSize: 14,
  cursor: 'pointer',
};

/** Reusable Drug Info Modal — can be used from any portal */
export function DrugInfoModal({ drugName, onClose }: { drugName: string; onClose: () => void }) {
  const q = drugName.toLowerCase();
  const match = DRUG_DATA.find(
    (d) =>
      d.brandName.toLowerCase().includes(q) ||
      d.genericName.toLowerCase().includes(q) ||
      q.includes(d.brandName.toLowerCase().split(' ')[0]) ||
      q.includes(d.genericName.toLowerCase().split(' ')[0]),
  );

  if (!match) {
    return (
      <div style={overlayStyle} onClick={onClose}>
        <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
          <div style={{ padding: 24, textAlign: 'center' }}>
            <Package size={40} style={{ opacity: 0.3, marginBottom: 12, color: 'var(--color-text-muted)' }} />
            <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700, color: 'var(--color-text)' }}>Drug Not Found</h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 14, lineHeight: 1.6 }}>
              &ldquo;{drugName}&rdquo; was not found in the formulary database.
            </p>
            <button onClick={onClose} style={closeBtnStyle}>Close</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'sticky', top: 0, background: 'var(--color-surface)', zIndex: 1, borderRadius: '16px 16px 0 0' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>{match.brandName}</h2>
            <p style={{ margin: '4px 0 0', fontSize: 14, color: 'var(--color-text-muted)' }}>{match.genericName}</p>
            <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
              <span style={{ ...S.categoryBadge, ...getCategoryStyle(match.category) }}>{match.category}</span>
              <span style={{ fontSize: 13, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center' }}>{match.form} {match.strength} • {match.route}</span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--color-text-muted)' }}>
            <X size={20} />
          </button>
        </div>
        {/* Body */}
        <div style={{ padding: '16px 24px 24px' }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ ...S.coverageBadge, background: match.hmoCovered ? '#dcfce7' : '#f3f4f6', color: match.hmoCovered ? '#166534' : '#9ca3af' }}>
              <Shield size={12} /> HMO {match.hmoCovered ? '✓' : '✗'}
            </span>
            <span style={{ ...S.coverageBadge, background: match.philhealthCovered ? '#dbeafe' : '#f3f4f6', color: match.philhealthCovered ? '#1e40af' : '#9ca3af' }}>
              <Shield size={12} /> PhilHealth {match.philhealthCovered ? '✓' : '✗'}
            </span>
            {match.controlledSchedule && (
              <span style={S.controlledBadge}><AlertTriangle size={12} /> {match.controlledSchedule}</span>
            )}
            <span style={{ ...S.stockBadge, ...getStockStyle(match.stockStatus) }}>
              <Package size={12} /> {match.stockStatus}
            </span>
          </div>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 16 }}>{match.priceRange}</div>

          {match.indications.length > 0 && (
            <>
              <div style={{ ...S.sectionLabel, marginTop: 0 }}>Indications</div>
              <ul style={S.bulletList}>{match.indications.map((ind, i) => <li key={i}>{ind}</li>)}</ul>
            </>
          )}
          {match.contraindications.length > 0 && (
            <>
              <div style={S.sectionLabel}>Contraindications</div>
              <ul style={S.bulletList}>{match.contraindications.map((c, i) => <li key={i}>{c}</li>)}</ul>
            </>
          )}
          {match.commonDosages.length > 0 && (
            <>
              <div style={S.sectionLabel}>Common Dosages</div>
              <ul style={S.bulletList}>{match.commonDosages.map((d, i) => <li key={i}>{d}</li>)}</ul>
            </>
          )}
          {match.interactions.length > 0 && (
            <>
              <div style={S.sectionLabel}>Drug Interactions</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {match.interactions.map((inter, i) => (
                  <div key={i} style={S.interactionRow}>
                    <span style={{ ...S.severityBadge, ...getSeverityStyle(inter.severity) }}>{inter.severity}</span>
                    <span style={{ color: 'var(--color-text-muted)' }}>
                      <strong style={{ color: 'var(--color-text)' }}>{inter.drug}</strong>{' — '}{inter.description}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
          {match.alternatives.length > 0 && (
            <>
              <div style={S.sectionLabel}>Therapeutic Alternatives</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {match.alternatives.map((alt, i) => <span key={i} style={S.altPill}>{alt}</span>)}
              </div>
            </>
          )}
          {match.warnings && match.warnings.length > 0 && (
            <>
              <div style={S.sectionLabel}>Notes / Warnings</div>
              {match.warnings.map((w, i) => (
                <div key={i} style={S.warningBox}>
                  <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
                  <span>{w}</span>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   Exports
   ═══════════════════════════════════════════════════ */

export { DRUG_DATA };
