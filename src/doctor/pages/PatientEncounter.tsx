import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Mic,
  MicOff,
  Sparkles,
  FileSignature,
  Send,
  Pill,
  User,
  AlertTriangle,
  ClipboardList,
  Activity,
  ShieldAlert,
  ShieldCheck,
  ArrowLeft,
  CheckCircle2,
  Save,
  Loader2,
  Copy,
  X,
  Clock,
  Star,
  ClipboardPlus,
  Target,
  Plus,
  Trash2,
  Bot,
  RefreshCw,
  Heart,
  Info,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useProvider } from '../../provider/context/ProviderContext';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../theme/ThemeContext';
import type { ClinicalNote, CDSSAlert } from '../../provider/types';
import type { ReactNode } from 'react';
import { SoapNotePanel } from '../components/SoapNotePanel';
import { DrugInfoModal } from '../../provider/pages/DrugMaster';

type TabKey = 'soap' | 'transcriber' | 'cdss' | 'orders' | 'prescriptions' | 'chart' | 'careplan';
type SoapSection = 'S' | 'O' | 'A' | 'P';

// ── Patient profile lookup for dynamic encounter data ──
type TranscriptLine = { speaker: 'doctor' | 'patient'; text: string; ts: string };
interface PatientProfile {
  dob: string; age: string; gender: string; bloodType: string; contact: string;
  allergies: string[]; activeMeds: string[];
  transcript: TranscriptLine[];
  soap: { subjective: string; objective: string; assessment: string; plan: string };
}

const D = 'doctor' as const;
const P = 'patient' as const;

const PATIENT_PROFILES: Record<string, PatientProfile> = {
  // Andrea Reyes — HTN follow-up & lab review
  'p-mc1': {
    dob: 'Mar 12, 1978', age: '47', gender: 'Female', bloodType: 'A+', contact: '0917-555-0101',
    allergies: ['NSAIDs (GI upset)'],
    activeMeds: ['Losartan 50mg daily', 'Amlodipine 5mg daily', 'Vitamin D3 1000IU daily'],
    transcript: [
      { speaker: D, text: 'Good morning, Andrea. How have you been since our last visit?', ts: '00:05' },
      { speaker: P, text: 'Good morning, Doc. I\'ve been feeling better overall. The dizziness I had before is gone.', ts: '00:12' },
      { speaker: D, text: 'That\'s good to hear. Have you been monitoring your blood pressure at home?', ts: '00:22' },
      { speaker: P, text: 'Yes. It\'s mostly around 130 over 82, sometimes a bit lower in the morning.', ts: '00:35' },
      { speaker: D, text: 'That\'s improved from where we started. Any side effects from the Amlodipine we added last month?', ts: '00:48' },
      { speaker: P, text: 'A little ankle swelling in the evening, but it goes down by morning. Nothing too bad.', ts: '01:02' },
      { speaker: D, text: 'Peripheral edema is a known side effect. We\'ll keep an eye on it. And the Losartan — no cough or dizziness?', ts: '01:15' },
      { speaker: P, text: 'No cough at all. The Losartan has been fine since you switched me from the ACE inhibitor.', ts: '01:28' },
      { speaker: D, text: 'Good. Your lab results came back. Your HbA1c is 7.2%, which is slightly above our target of 7%.', ts: '01:42' },
      { speaker: P, text: 'Oh, is that concerning? I\'ve been trying to watch my diet.', ts: '01:55' },
      { speaker: D, text: 'It\'s borderline. Your kidney function is normal and potassium is 4.8, which is upper normal for someone on Losartan.', ts: '02:08' },
      { speaker: P, text: 'Should we change any of my medications?', ts: '02:22' },
      { speaker: D, text: 'I\'d like to add Metformin 500mg to help with the glucose, and we should recheck your potassium in 2 weeks.', ts: '02:35' },
      { speaker: P, text: 'Okay, Doc. I\'ll take the new medication. Anything else I should do?', ts: '02:48' },
      { speaker: D, text: 'Continue the low-sodium diet, try to walk 30 minutes daily, and I\'ll see you back in 3 months for a repeat HbA1c.', ts: '03:02' },
      { speaker: P, text: 'Thank you, Doc. I\'ll do my best.', ts: '03:12' },
    ],
    soap: {
      subjective: 'Chief complaint: Hypertension follow-up & lab review.\nHPI: 47F with essential hypertension on Losartan 50mg and Amlodipine 5mg (added 1 month ago). Reports improved BP control — home readings ~130/82 mmHg. Mild bilateral ankle edema in evenings, resolves by morning. No cough, no dizziness, no headaches.\nMedications: Losartan 50mg daily, Amlodipine 5mg daily, Vitamin D3 1000IU daily — fully compliant.\nAllergies: NSAIDs (GI upset).',
      objective: 'Vitals: BP 132/82 mmHg, HR 72 bpm (regular), RR 16/min, Temp 36.4°C, SpO2 99%, Weight 61 kg.\nGeneral: Alert, well-appearing, no acute distress.\nCardiac: Regular rate and rhythm, S1/S2 normal, no murmurs.\nLungs: Clear bilaterally.\nExtremities: Trace bilateral pedal edema, non-pitting. Pulses 2+ throughout.\nLabs: HbA1c 7.2% (target < 7.0%), FBS 118 mg/dL, Creatinine 0.8 mg/dL, K+ 4.8 mEq/L, Lipid panel: LDL 128, HDL 52, TG 145.',
      assessment: '1. Essential hypertension (ICD-10: I10) — improving on dual therapy (ARB + CCB). BP approaching target < 130/80.\n2. Pre-diabetes / early Type 2 DM (ICD-10: R73.03) — HbA1c 7.2%, mildly elevated. Lifestyle + pharmacologic intervention indicated.\n3. Hyperkalemia risk — K+ 4.8 mEq/L on ARB. Requires monitoring.\n4. Mild peripheral edema — likely Amlodipine-related. Not clinically significant at present.',
      plan: '1. Continue Losartan 50mg daily and Amlodipine 5mg daily — BP control improving\n2. Start Metformin 500mg BID with meals for glycemic control (GFR > 60, safe to initiate)\n3. Recheck serum potassium in 2 weeks (CDSS flag: K+ 4.8 on ARB)\n4. Repeat HbA1c in 3 months to assess Metformin effect\n5. Dietary counseling: low-sodium DASH diet, limit simple carbohydrates\n6. Exercise: 30 min brisk walking daily, 5 days/week\n7. Monitor ankle edema — if worsening, consider switching Amlodipine to Felodipine\n8. Follow-up in 3 months or sooner if edema worsens, hyperkalemia symptoms (weakness, palpitations), or BP > 140/90',
    },
  },
  // Mark Anthony Lim — APE follow-up, lipid panel review
  'p-mc2': {
    dob: 'Aug 22, 1990', age: '35', gender: 'Male', bloodType: 'B+', contact: '0918-555-0202',
    allergies: [],
    activeMeds: ['Multivitamins daily', 'Cetirizine 10mg PRN', 'Omeprazole 20mg daily'],
    transcript: [
      { speaker: D, text: 'Good morning, Mark. Let\'s go over your annual physical exam results.', ts: '00:05' },
      { speaker: P, text: 'Morning, Doc. I\'ve been a bit worried about my cholesterol. My dad has high cholesterol too.', ts: '00:14' },
      { speaker: D, text: 'I understand. Let\'s review the numbers. Your total cholesterol is 242, and your LDL is 168 — both elevated.', ts: '00:25' },
      { speaker: P, text: 'That sounds high. What should it be?', ts: '00:38' },
      { speaker: D, text: 'Ideally, LDL should be below 130, and total cholesterol below 200. Your HDL is 45, which is a bit low. Triglycerides are 180.', ts: '00:50' },
      { speaker: P, text: 'Is that dangerous? Do I need medication?', ts: '01:02' },
      { speaker: D, text: 'Given your family history and these numbers, I\'d recommend starting a statin — Atorvastatin 20mg. But lifestyle changes are equally important.', ts: '01:15' },
      { speaker: P, text: 'What kind of changes?', ts: '01:28' },
      { speaker: D, text: 'Reduce fatty and fried foods, increase fiber, exercise at least 150 minutes per week, and limit alcohol intake.', ts: '01:40' },
      { speaker: P, text: 'I can try that. I\'ve also been taking Omeprazole for my acid reflux. Should I keep taking it?', ts: '01:55' },
      { speaker: D, text: 'You\'ve been on it for over 12 weeks now. Long-term PPI use can affect bone density and magnesium levels. Let\'s try stepping down to Famotidine.', ts: '02:08' },
      { speaker: P, text: 'Alright, Doc. Anything else from my labs?', ts: '02:22' },
      { speaker: D, text: 'Everything else is normal — CBC, liver, kidney function all fine. Your BMI is 26 so we should work on getting that below 25.', ts: '02:35' },
      { speaker: P, text: 'I\'ll start going to the gym again. Thanks, Doc.', ts: '02:48' },
    ],
    soap: {
      subjective: 'Chief complaint: APE follow-up — lipid panel review.\nHPI: 35M here for annual physical exam results review. Concerned about cholesterol — family history of dyslipidemia (father). On Omeprazole 20mg daily × 14 weeks for GERD — symptom-controlled. No chest pain, no exertional dyspnea, no palpitations.\nMedications: Multivitamins daily, Cetirizine 10mg PRN, Omeprazole 20mg daily.\nAllergies: NKDA.',
      objective: 'Vitals: BP 126/80 mmHg, HR 78 bpm, RR 18/min, Temp 36.5°C, SpO2 99%, Weight 78 kg, Height 173 cm, BMI 26.1.\nGeneral: Well-nourished, no acute distress.\nCardiac: Regular, no murmurs.\nLungs: Clear bilaterally.\nAbdomen: Soft, non-tender, no organomegaly.\nLabs: TC 242 (H), LDL 168 (H), HDL 45 (L), TG 180 (H), FBS 94, HbA1c 5.4%, Cr 0.9, ALT 28, CBC normal.',
      assessment: '1. Dyslipidemia (ICD-10: E78.5) — elevated LDL 168, low HDL 45, elevated TG 180. Family history positive. 10-year ASCVD risk moderate.\n2. Overweight (ICD-10: E66.3) — BMI 26.1, target < 25.\n3. GERD (ICD-10: K21.0) — controlled on Omeprazole, but prolonged PPI use > 12 weeks warrants step-down.\n4. Allergic rhinitis (ICD-10: J30.9) — managed PRN Cetirizine.',
      plan: '1. Start Atorvastatin 20mg daily at bedtime for dyslipidemia\n2. Step down Omeprazole 20mg → Famotidine 20mg BID (PPI > 12 weeks — bone density & hypomagnesemia risk per CDSS alert)\n3. Check serum Magnesium at next visit to monitor post-PPI\n4. Lifestyle modifications: Mediterranean diet, limit saturated fat/alcohol, exercise 150 min/week\n5. Target: LDL < 130, BMI < 25 within 6 months\n6. Repeat lipid panel in 3 months to assess statin response\n7. Continue Cetirizine PRN for allergic rhinitis\n8. Follow-up in 3 months with fasting lipid panel',
    },
  },
  // Grace Lim — 28-week prenatal check
  'p-mc3': {
    dob: 'Jun 5, 1994', age: '31', gender: 'Female', bloodType: 'O+', contact: '0919-555-0303',
    allergies: ['Amoxicillin (hives)'],
    activeMeds: ['Prenatal Vitamins daily', 'Ferrous Sulfate 325mg daily', 'Calcium + Vitamin D daily'],
    transcript: [
      { speaker: D, text: 'Good morning, Grace. You\'re now at 28 weeks. How are you feeling?', ts: '00:05' },
      { speaker: P, text: 'Good morning, Doc. I feel okay mostly, but I\'ve had some back pain and trouble sleeping.', ts: '00:14' },
      { speaker: D, text: 'Back pain is very common at this stage. Is it lower back, or does it go down your legs?', ts: '00:25' },
      { speaker: P, text: 'Just lower back. It gets worse when I stand for a long time.', ts: '00:36' },
      { speaker: D, text: 'Any contractions, bleeding, or fluid leaking?', ts: '00:45' },
      { speaker: P, text: 'No, none of those. The baby is very active — kicking a lot, especially at night.', ts: '00:56' },
      { speaker: D, text: 'Good fetal movement is reassuring. Have you been taking your prenatal vitamins and iron?', ts: '01:08' },
      { speaker: P, text: 'Yes, every day. The iron makes me a bit constipated though.', ts: '01:18' },
      { speaker: D, text: 'That\'s common. Increase your fiber and water intake. We can also try a stool softener if it gets worse.', ts: '01:30' },
      { speaker: P, text: 'Okay. My last sugar test was normal, right?', ts: '01:42' },
      { speaker: D, text: 'Actually, you haven\'t done the glucose tolerance test yet. At 28 weeks, we need to screen for gestational diabetes. I\'m ordering the 75g OGTT today.', ts: '01:55' },
      { speaker: P, text: 'Oh, I thought I already did that. When should I take it?', ts: '02:08' },
      { speaker: D, text: 'We should do it this week. You\'ll need to fast overnight — no food for 8 hours. The lab will draw blood three times over two hours.', ts: '02:20' },
      { speaker: P, text: 'Alright, I\'ll schedule it. Anything else I should watch out for?', ts: '02:32' },
      { speaker: D, text: 'Watch for headaches, blurry vision, sudden swelling, or decreased fetal movement. Come in immediately if any of those happen.', ts: '02:45' },
      { speaker: P, text: 'Will do, Doc. Thank you.', ts: '02:55' },
    ],
    soap: {
      subjective: 'Chief complaint: Prenatal check — 28 weeks G1P0.\nHPI: 31F, G1P0, 28 weeks AOG. Reports lower back pain worsened by prolonged standing. Difficulty sleeping. Active fetal movement, especially nocturnal. Constipation (iron-related). No vaginal bleeding, no fluid leak, no contractions, no headaches, no visual changes, no edema.\nMedications: Prenatal Vitamins daily, Ferrous Sulfate 325mg daily, Calcium + Vitamin D daily — compliant.\nAllergies: Amoxicillin (hives).',
      objective: 'Vitals: BP 112/72 mmHg, HR 84 bpm, Temp 36.6°C, SpO2 98%, Weight 65 kg (pre-pregnancy 56 kg, +9 kg).\nOB: Fundal height 27 cm (appropriate for gestational age). FHT 148 bpm by Doppler. Cephalic presentation on palpation. No uterine tenderness. No vaginal discharge.\nExtremities: No edema.\nMSK: Mild lower lumbar tenderness, no radiculopathy.\nNote: OGTT NOT yet done — overdue per ACOG guidelines (24-28 weeks).',
      assessment: '1. Intrauterine pregnancy 28 weeks, G1P0 (ICD-10: Z34.03) — normal growth, active fetal movement, cephalic presentation.\n2. Overdue gestational diabetes screening (ICD-10: O24.419) — 75g OGTT not yet performed. ACOG recommends 24-28 weeks.\n3. Low back pain of pregnancy (ICD-10: O26.89) — mechanical, no red flags.\n4. Iron-supplement constipation (ICD-10: K59.00) — dietary modification advised.',
      plan: '1. Order 75g OGTT urgently — fasting, 3 blood draws over 2 hours. Schedule within this week.\n2. Continue Prenatal Vitamins, Ferrous Sulfate 325mg, Calcium + Vitamin D\n3. Add Docusate Sodium 100mg daily PRN for constipation\n4. Lower back: warm compress, prenatal stretching, avoid prolonged standing. Refer to PT if worsening.\n5. Fetal kick counts: monitor daily, report if < 10 movements in 2 hours\n6. Warning signs reviewed: headache, visual changes, edema, vaginal bleeding, fluid leakage, decreased fetal movement — present to ER immediately\n7. Next prenatal visit in 2 weeks (30 weeks)\n8. If GDM confirmed: initiate MNT, consider endocrinology referral',
    },
  },
  // Paolo Reyes — Annual wellness consultation
  'p-mc4': {
    dob: 'Nov 3, 1985', age: '40', gender: 'Male', bloodType: 'AB+', contact: '0917-555-0404',
    allergies: [],
    activeMeds: ['None'],
    transcript: [
      { speaker: D, text: 'Good morning, Paolo. I see you\'re here for your annual wellness check.', ts: '00:05' },
      { speaker: P, text: 'Yes, Doc. My wife insisted — I haven\'t had a checkup in three years.', ts: '00:14' },
      { speaker: D, text: 'Better late than never. Any complaints? Headaches, chest pain, shortness of breath?', ts: '00:25' },
      { speaker: P, text: 'I get occasional headaches after long days at the office. Nothing serious.', ts: '00:36' },
      { speaker: D, text: 'How about your diet and exercise?', ts: '00:45' },
      { speaker: P, text: 'Honestly, I eat out a lot. Fast food, rice heavy. Exercise is maybe once a month.', ts: '00:56' },
      { speaker: D, text: 'We\'ll check your vitals and run some labs. Let\'s see where we stand.', ts: '01:08' },
    ],
    soap: {
      subjective: 'Chief complaint: Annual wellness consultation.\nHPI: 40M, no active complaints. Occasional tension headaches. Sedentary lifestyle, high-carb fast-food diet. No exercise routine. Last checkup 3 years ago.\nMedications: None.\nAllergies: NKDA.',
      objective: 'Vitals: BP 138/88 mmHg, HR 82 bpm, RR 16/min, Temp 36.5°C, SpO2 99%, Weight 86 kg, Height 170 cm, BMI 29.8.\nGeneral: Overweight, no acute distress.\nCardiac: Regular rate and rhythm, no murmurs.\nLungs: Clear bilaterally.\nAbdomen: Soft, non-tender, mild central adiposity.',
      assessment: '1. Overweight (ICD-10: E66.3) — BMI 29.8, approaching obese.\n2. Stage 1 hypertension (ICD-10: I10) — BP 138/88. Requires confirmation.\n3. Sedentary lifestyle risk — screening labs indicated.',
      plan: '1. Order CBC, FBS, HbA1c, Lipid Panel, Creatinine, Urinalysis\n2. Repeat BP check in 2 weeks to confirm hypertension\n3. Lifestyle counseling: DASH diet, reduce fast food, exercise 150 min/week\n4. Follow-up with lab results in 1 week\n5. Consider antihypertensive if BP remains > 135/85 on repeat',
    },
  },
  // Arturo Villanueva — Chest pain evaluation
  'p-mc14': {
    dob: 'Feb 18, 1968', age: '57', gender: 'Male', bloodType: 'O-', contact: '0918-555-1414',
    allergies: ['Sulfa drugs (rash)'],
    activeMeds: ['Aspirin 81mg daily', 'Metoprolol 50mg daily', 'Atorvastatin 40mg daily'],
    transcript: [
      { speaker: D, text: 'Good morning, Mr. Villanueva. I understand you\'ve been having chest pains.', ts: '00:05' },
      { speaker: P, text: 'Yes Doc, started about five days ago. It\'s a tightness in my chest when I walk uphill.', ts: '00:15' },
      { speaker: D, text: 'Does it radiate anywhere — to your arm, jaw, or back?', ts: '00:25' },
      { speaker: P, text: 'Sometimes to my left shoulder. It goes away if I stop and rest.', ts: '00:36' },
      { speaker: D, text: 'How long does each episode last?', ts: '00:45' },
      { speaker: P, text: 'About three to five minutes. It always stops when I sit down.', ts: '00:56' },
      { speaker: D, text: 'Any shortness of breath, sweating, nausea, or dizziness?', ts: '01:08' },
      { speaker: P, text: 'A little breathless during the chest tightness. No sweating or nausea.', ts: '01:20' },
      { speaker: D, text: 'Family history of heart disease?', ts: '01:30' },
      { speaker: P, text: 'My father had a heart attack at 60. My brother has high blood pressure.', ts: '01:42' },
      { speaker: D, text: 'Given your symptoms and family history, I want to run some tests today — ECG, troponin, and a stress test.', ts: '01:55' },
      { speaker: P, text: 'Okay, Doc. Do you think it\'s serious?', ts: '02:08' },
      { speaker: D, text: 'We need to rule out unstable angina. The pattern sounds like stable angina, but we should be thorough.', ts: '02:20' },
    ],
    soap: {
      subjective: 'Chief complaint: Chest tightness × 5 days.\nHPI: 57M with exertional substernal chest tightness radiating to left shoulder, provoked by uphill walking, relieved by rest within 3-5 min. Mild exertional dyspnea. No diaphoresis, nausea, syncope, or rest pain.\nPMH: HTN, hyperlipidemia. Father — MI at 60.\nMedications: Aspirin 81mg daily, Metoprolol 50mg daily, Atorvastatin 40mg daily.\nAllergies: Sulfa drugs (rash).',
      objective: 'Vitals: BP 142/88 mmHg, HR 76 bpm, RR 16/min, Temp 36.5°C, SpO2 98%, BMI 27.2.\nCardiac: Regular rate and rhythm, normal S1/S2, no murmurs.\nLungs: Clear bilaterally.\nExtremities: No edema, pulses 2+.',
      assessment: '1. Suspected stable angina (ICD-10: I20.8) — classic exertional pattern, positive family history, on dual therapy.\n2. Essential HTN (ICD-10: I10) — sub-optimally controlled at 142/88.\n3. Hyperlipidemia (ICD-10: E78.5) — on moderate statin, reassess target.',
      plan: '1. Stat 12-lead ECG and Troponin I\n2. Order exercise stress test within 48 hours\n3. Prescribe Nitroglycerin SL 0.4mg PRN\n4. Uptitrate Metoprolol to 100mg if tolerated\n5. Consider high-intensity statin (Atorvastatin 80mg)\n6. Follow-up in 1 week with stress test results\n7. Educate on ACS warning signs — seek ER immediately if rest pain > 20 min',
    },
  },
  // Lorna Diaz — Recurring dizziness & vertigo
  'p-mc13': {
    dob: 'Sep 10, 1958', age: '67', gender: 'Female', bloodType: 'A-', contact: '0919-555-1313',
    allergies: ['Aspirin (GI bleeding)'],
    activeMeds: ['Amlodipine 10mg daily', 'Metformin 500mg BID', 'Betahistine 16mg TID'],
    transcript: [
      { speaker: D, text: 'Good morning, Mrs. Diaz. How have the dizzy spells been?', ts: '00:05' },
      { speaker: P, text: 'They\'re still happening, Doc. Especially when I turn my head quickly or get up from bed.', ts: '00:15' },
      { speaker: D, text: 'Does the room spin, or do you feel lightheaded — like you might faint?', ts: '00:28' },
      { speaker: P, text: 'The room spins. It\'s a spinning sensation that lasts about 30 seconds to a minute.', ts: '00:40' },
      { speaker: D, text: 'Any nausea or vomiting during the episodes?', ts: '00:52' },
      { speaker: P, text: 'Yes, I feel nauseous but I don\'t usually vomit. It\'s worse in the morning.', ts: '01:04' },
      { speaker: D, text: 'Any hearing changes, ringing in your ears, or feeling of fullness in one ear?', ts: '01:16' },
      { speaker: P, text: 'No hearing problems. Just the spinning.', ts: '01:28' },
      { speaker: D, text: 'This sounds like it could be BPPV. I\'d like to do the Dix-Hallpike test today.', ts: '01:40' },
    ],
    soap: {
      subjective: 'Chief complaint: Recurring dizziness and vertigo × 3 weeks.\nHPI: 67F with positional vertigo — room-spinning episodes triggered by head turning and rising from bed. Duration 30-60 seconds. Morning predominance. Associated nausea, no vomiting. No hearing loss, tinnitus, or aural fullness. No falls. On Betahistine 16mg TID × 2 weeks — partial relief.\nPMH: HTN (Amlodipine), T2DM (Metformin).\nAllergies: Aspirin (GI bleeding).',
      objective: 'Vitals: BP 128/76 mmHg, HR 72 bpm, Temp 36.4°C, SpO2 99%.\nNeuro: CN II-XII intact. Dix-Hallpike: positive — rotatory nystagmus (right ear, latency 3s, duration 15s, fatigable). Romberg: negative. Gait: steady.\nENT: TMs clear bilaterally. Weber: midline. Rinne: AC > BC bilaterally.',
      assessment: '1. Benign Paroxysmal Positional Vertigo — right posterior canal (ICD-10: H81.10). Dix-Hallpike positive.\n2. HTN (ICD-10: I10) — controlled on Amlodipine 10mg.\n3. T2DM (ICD-10: E11.65) — on Metformin, check HbA1c.',
      plan: '1. Perform Epley maneuver (canalith repositioning) today — right side\n2. Continue Betahistine 16mg TID × 2 more weeks, then taper\n3. Meclizine 25mg PRN for acute episodes\n4. Vestibular rehabilitation exercises (Brandt-Daroff) — handout provided\n5. Precautions: rise slowly, avoid sudden head movements, fall prevention\n6. Order HbA1c to assess diabetes control\n7. Follow-up in 2 weeks. If no improvement, consider MRI IAC to rule out vestibular schwannoma',
    },
  },
  // Fernando Reyes — Chronic cough 2 weeks
  'p-mc12': {
    dob: 'Apr 25, 1975', age: '50', gender: 'Male', bloodType: 'B-', contact: '0917-555-1212',
    allergies: [],
    activeMeds: ['Montelukast 10mg daily'],
    transcript: [
      { speaker: D, text: 'Hello, Fernando. What brings you in today?', ts: '00:05' },
      { speaker: P, text: 'I\'ve had this cough for about two weeks now. It won\'t go away.', ts: '00:14' },
      { speaker: D, text: 'Is it a dry cough or are you producing phlegm?', ts: '00:22' },
      { speaker: P, text: 'Mostly dry, but sometimes there\'s a little clear mucus. Worse at night.', ts: '00:34' },
      { speaker: D, text: 'Any fever, weight loss, or night sweats?', ts: '00:45' },
      { speaker: P, text: 'No fever. No weight loss. Just the cough keeping me up at night.', ts: '00:56' },
      { speaker: D, text: 'Any history of asthma, allergies, or acid reflux?', ts: '01:08' },
      { speaker: P, text: 'I was told I have mild asthma as a teenager. I take Montelukast but nothing else.', ts: '01:20' },
      { speaker: D, text: 'Let me listen to your chest and we\'ll go from there.', ts: '01:30' },
    ],
    soap: {
      subjective: 'Chief complaint: Persistent dry cough × 2 weeks.\nHPI: 50M with non-productive dry cough, occasional clear sputum. Nocturnal predominance. No fever, hemoptysis, weight loss, night sweats, or dyspnea. PMH: childhood asthma (mild). On Montelukast 10mg daily.\nAllergies: NKDA.',
      objective: 'Vitals: BP 124/78 mmHg, HR 74 bpm, RR 16/min, Temp 36.5°C, SpO2 99%.\nLungs: Scattered expiratory wheezes bilaterally, no crackles. Prolonged expiratory phase.\nENT: Mild post-nasal drip. Throat: mild cobblestoning.',
      assessment: '1. Cough-variant asthma (ICD-10: J45.20) — nocturnal cough with wheezes, history of childhood asthma.\n2. Post-nasal drip (ICD-10: R09.82) — contributing factor.\n3. Rule out GERD-related cough.',
      plan: '1. Start Salbutamol MDI 2 puffs PRN for acute symptoms\n2. Add Fluticasone/Salmeterol (Seretide 250/50) 1 puff BID as controller\n3. Continue Montelukast 10mg daily\n4. Intranasal Fluticasone 2 sprays each nostril daily for post-nasal drip\n5. Order Chest X-ray PA/Lateral to rule out pneumonia or mass\n6. Spirometry if symptoms persist beyond 4 weeks\n7. Trial of PPI if cough persists despite asthma treatment (GERD-related cough)\n8. Follow-up in 2 weeks',
    },
  },
};

// Default profile for unknown patients (generic / Metro General)
const DEFAULT_PROFILE: PatientProfile = {
  dob: 'Jan 15, 1980', age: '45', gender: 'Male', bloodType: 'O+', contact: '0917-123-4567',
  allergies: ['Penicillin', 'Sulfa'],
  activeMeds: ['Aspirin 81mg daily', 'Atorvastatin 40mg daily', 'Metoprolol Succinate ER 50mg daily'],
  transcript: [
    { speaker: D, text: 'Good morning. What brings you in today?', ts: '00:05' },
    { speaker: P, text: "I've been having chest pains for the past week, Doc.", ts: '00:12' },
    { speaker: D, text: 'Can you describe the pain for me? Is it sharp, dull, or more of a pressure?', ts: '00:22' },
    { speaker: P, text: "It's more of a pressure or tightness, especially when I climb stairs or walk fast.", ts: '00:35' },
    { speaker: D, text: 'Does it radiate anywhere — to your arm, jaw, neck, or back?', ts: '00:48' },
    { speaker: P, text: 'Sometimes I feel it in my left arm, but it goes away after I sit down and rest for a few minutes.', ts: '01:02' },
    { speaker: D, text: 'How long does each episode typically last?', ts: '01:18' },
    { speaker: P, text: 'Maybe three to five minutes. It always stops once I stop what I\'m doing.', ts: '01:28' },
    { speaker: D, text: 'Any associated shortness of breath, nausea, dizziness, or sweating during these episodes?', ts: '01:40' },
    { speaker: P, text: 'A little short of breath when climbing stairs. No nausea, no dizziness, no sweating.', ts: '01:55' },
    { speaker: D, text: 'Have you ever had a heart attack, cardiac catheterization, or a stress test before?', ts: '02:08' },
    { speaker: P, text: 'No, never. This is the first time I\'ve had chest problems like this.', ts: '02:18' },
    { speaker: D, text: 'Any family history of heart disease — parents or siblings with heart attacks or strokes?', ts: '02:30' },
    { speaker: P, text: 'My father had a heart attack at sixty-two. My mother has high blood pressure.', ts: '02:42' },
    { speaker: D, text: 'And are you taking your current medications regularly — the Aspirin, Atorvastatin, and Metoprolol?', ts: '02:55' },
    { speaker: P, text: 'Yes, I take everything as prescribed. Every day, no missed doses.', ts: '03:08' },
  ],
  soap: {
    subjective: 'Chief complaint: Chest pressure × 1 week.\nHPI: Exertional substernal pressure, precipitated by stair climbing, relieved by rest within 5 minutes. Occasional radiation to left arm. Associated mild exertional dyspnea. Denies diaphoresis, palpitations, syncope, orthopnea, or PND.\nPMH: Known hypertension, hyperlipidemia. No prior MI or cardiac catheterization.\nMedications: Aspirin 81 mg daily, Atorvastatin 40 mg daily, Metoprolol Succinate ER 50 mg daily — patient reports full compliance.\nAllergies: Penicillin (rash), Sulfa (GI upset).',
    objective: 'Vitals: BP 132/82 mmHg, HR 78 bpm (regular), RR 16/min, Temp 36.6°C, SpO2 97% on RA, BMI 27.4.\nGeneral: Alert, oriented, no acute distress.\nCardiac: Regular rate and rhythm, normal S1/S2, no S3/S4 gallop, no murmurs or rubs.\nLungs: Clear to auscultation bilaterally, no wheezes, rhonchi, or crackles.\nAbdomen: Soft, non-tender, no organomegaly.\nExtremities: No peripheral edema, dorsalis pedis and posterior tibial pulses 2+ bilaterally, no cyanosis.',
    assessment: '1. Stable angina pectoris (ICD-10: I20.8) — exertional substernal chest pressure with classic pattern (exertion-provoked, rest-relieved, < 20 min duration). Low probability of ACS given stable presentation and absence of rest pain, hemodynamic instability, or ECG changes.\n2. Essential hypertension (ICD-10: I10) — sub-optimally controlled at 132/82 mmHg, target < 130/80.\n3. Hyperlipidemia (ICD-10: E78.5) — on moderate-intensity statin; reassess lipid targets given new angina.',
    plan: '1. Continue current medications: Aspirin 81 mg daily, Atorvastatin 40 mg daily, Metoprolol Succinate ER 50 mg daily\n2. Add: Nitroglycerin SL 0.4 mg PRN chest pain (up to 3 doses q5min; call 911 if no relief after first dose)\n3. Order resting 12-lead ECG today\n4. Order exercise stress test (treadmill EST) to evaluate ischemic threshold and exercise tolerance\n5. Labs: Troponin I (to rule out ACS), Lipid panel (reassess LDL target — consider high-intensity statin), BMP, CBC\n6. Consider uptitrating Metoprolol to 100 mg daily if resting HR allows and angina frequency does not improve\n7. Lifestyle: reinforce smoking cessation (if applicable), Mediterranean diet counseling, moderate aerobic exercise 150 min/week as tolerated\n8. Return to clinic in 2 weeks for stress test results review, or sooner if symptoms escalate (rest pain, prolonged episodes > 20 min, syncope)\n9. Patient educated on ACS warning signs: rest pain unrelieved by NTG, diaphoresis, nausea, jaw/back radiation — call 911 immediately',
  },
};

// AI-generated content uses a special delimiter (⌁AI⌁) that we detect for subtle styling
const AI_DELIMITER = '⌁AI⌁';

function getAiSoapAppend(profile: PatientProfile) {
  return {
    subjective: `\n\n${AI_DELIMITER}\n${profile.soap.subjective}`,
    objective: `\n\n${AI_DELIMITER}\n${profile.soap.objective}`,
    assessment: `\n\n${AI_DELIMITER}\n${profile.soap.assessment}`,
    plan: `\n\n${AI_DELIMITER}\n${profile.soap.plan}`,
  };
}

const QUICK_ORDERS = ['CBC', 'FBS', 'Lipid Panel', 'Urinalysis', 'Chest X-Ray', 'ECG', 'Ultrasound'];
const FREQUENCY_OPTIONS = ['Once daily', 'Twice daily', 'Three times daily', 'As needed', 'At bedtime', 'With meals'];

/* ══════════════════════════════════════════
   Care Plan AI Templates (in-encounter)
   ══════════════════════════════════════════ */
interface CPAISuggestion {
  name: string;
  specialty: string;
  goals: string[];
  interventions: string[];
  notes: string;
  duration: string;
}

const CP_AI_TEMPLATES: Record<string, CPAISuggestion> = {
  diabetes: {
    name: 'Type 2 Diabetes Management Plan',
    specialty: 'Endocrinology',
    goals: [
      'Maintain fasting blood glucose 80–130 mg/dL (ADA pre-meal target)',
      'Achieve HbA1c < 7.0% within 3 months (individualize per age and comorbidities)',
      'Engage in moderate-intensity aerobic exercise ≥ 150 min/week',
      'Achieve ≥ 95% adherence to prescribed antidiabetic regimen',
      'Maintain BMI 18.5–24.9 or achieve ≥ 5% weight loss if overweight',
      'Complete annual dilated retinal examination',
      'Complete annual comprehensive foot examination',
    ],
    interventions: [
      'HbA1c laboratory test every 3 months (quarterly) until at target, then every 6 months',
      'Self-monitoring of blood glucose: FBS + 2-hour post-prandial, frequency per therapy type',
      'Medical nutrition therapy (MNT) with registered dietitian every 6 weeks',
      'Annual comprehensive metabolic panel, lipid panel, and urine albumin-to-creatinine ratio (UACR)',
      'Annual dilated eye exam and monofilament foot exam',
      'Diabetes self-management education and support (DSMES) enrollment',
      'Quarterly clinical review: weight, BP, medication adherence, hypoglycemia assessment',
    ],
    notes: 'AI-generated plan based on ADA 2026 Standards of Care. Individualize HbA1c target (< 7.0% for most adults; < 8.0% if history of severe hypoglycemia, limited life expectancy, or extensive comorbidities). Recommend baseline HbA1c, lipid panel, eGFR, and UACR before initiation. Screen for depression (PHQ-9) and diabetes distress annually.',
    duration: '6 months',
  },
  hypertension: {
    name: 'Hypertension Management Plan',
    specialty: 'Internal Medicine',
    goals: [
      'Achieve blood pressure < 130/80 mmHg consistently (per ACC/AHA)',
      'Reduce dietary sodium to < 2,300 mg/day (ideally < 1,500 mg/day)',
      'Engage in aerobic exercise ≥ 150 min/week (e.g., brisk walking)',
      'Achieve ≥ 95% adherence to prescribed antihypertensive regimen',
      'Achieve BMI < 25 kg/m² or ≥ 5% weight loss if overweight',
      'Limit alcohol: ≤ 2 drinks/day (men), ≤ 1 drink/day (women)',
    ],
    interventions: [
      'Home blood pressure monitoring: 2 readings morning and evening with log',
      'Monthly in-clinic blood pressure and weight check for first 3 months',
      'DASH diet counseling with registered dietitian',
      'Lipid panel at baseline and annually (sooner if dyslipidemia identified)',
      'Annual ECG, serum creatinine, eGFR, electrolytes, and urinalysis',
      'Assess 10-year ASCVD risk (Pooled Cohort Equations) for statin consideration',
      'Stress management referral if psychosocial stressors identified',
    ],
    notes: 'AI-generated based on ACC/AHA 2017 Hypertension Guidelines (reaffirmed 2024). Consider ambulatory blood pressure monitoring (ABPM) if white-coat or masked hypertension suspected. Target < 130/80 for most adults; may individualize for frail elderly. Screen for secondary causes if onset < 30 years, resistant hypertension, or acute worsening.',
    duration: '6 months',
  },
  postop: {
    name: 'Post-Surgical Recovery Plan',
    specialty: 'General Surgery',
    goals: [
      'Achieve full or functional range of motion at surgical site per surgical team benchmarks',
      'Pain level consistently < 3/10 on VAS by week 4 (minimize opioid use)',
      'Ambulate unassisted for ≥ 20 minutes by week 6',
      'Surgical wound fully healed with no signs of SSI (redness, warmth, purulence, dehiscence)',
      'Resume activities of daily living (ADLs) independently by target date',
      'Complete prescribed rehabilitation program (≥ 80% session attendance)',
    ],
    interventions: [
      'Physical therapy 2–3x/week for 8 weeks (per surgical team protocol)',
      'Surgical wound assessment at 1, 2, and 4 weeks post-op (sooner if signs of infection)',
      'Multimodal analgesia: scheduled acetaminophen/NSAIDs, opioids PRN short-term with taper plan',
      'Follow-up imaging (X-ray or MRI) at 6 weeks or as indicated by procedure type',
      'DVT prophylaxis per Caprini score: pharmacologic (LMWH/DOACs) + mechanical (SCDs) as indicated',
      'Nutrition counseling: adequate protein intake (1.2–1.5 g/kg/day) for wound healing',
    ],
    notes: 'AI-generated post-operative recovery framework. Customize rehabilitation milestones based on specific procedure type, patient baseline functional status, and surgeon preference. Monitor for SSI at each visit per CDC/NHSN criteria. Early mobilization is critical to reducing VTE risk and improving outcomes.',
    duration: '3 months',
  },
  prenatal: {
    name: 'Prenatal Care Plan',
    specialty: 'OB-GYN',
    goals: [
      'Complete all trimester-appropriate screenings on schedule per ACOG guidelines',
      'Maintain healthy weight gain per IOM guidelines for pre-pregnancy BMI category',
      'Take prenatal vitamins daily: folic acid ≥ 400 mcg, iron 27 mg, DHA 200 mg',
      'Attend childbirth and breastfeeding preparation course by 34 weeks',
      'Maintain BP < 140/90 mmHg and glucose within normal ranges throughout pregnancy',
      'Develop and discuss birth plan with provider by 36 weeks',
    ],
    interventions: [
      'Prenatal visits: monthly until 28 weeks → biweekly 28–36 weeks → weekly 36 weeks to delivery',
      'First trimester: dating ultrasound, NIPT or first-trimester screening, CBC, blood type/Rh/antibody, rubella/varicella immunity, STI panel, urinalysis',
      'Glucose challenge test (GCT 50g) at 24–28 weeks; 3-hour GTT if abnormal',
      'Anatomy ultrasound at 18–22 weeks',
      'Tdap vaccination at 27–36 weeks gestation',
      'Group B Streptococcus (GBS) screening at 36–37 weeks',
      'Mental health screening (PHQ-9/Edinburgh) each trimester and postpartum',
      'Iron and folate supplementation throughout pregnancy; reassess Hgb at 28 weeks',
    ],
    notes: 'AI-generated based on ACOG prenatal care guidelines. Flag high-risk factors (AMA ≥ 35, prior preeclampsia, GDM history, chronic HTN, BMI ≥ 30) for enhanced surveillance. Low-dose aspirin 81 mg starting 12–16 weeks if preeclampsia risk factors present. Rh-negative patients: RhoGAM at 28 weeks and postpartum if infant is Rh-positive.',
    duration: '9 months',
  },
  asthma: {
    name: 'Asthma Control Plan',
    specialty: 'Pulmonology',
    goals: [
      'Peak expiratory flow consistently ≥ 80% personal best (green zone)',
      'No nighttime awakenings due to asthma symptoms (well-controlled criterion)',
      'Demonstrate correct inhaler/spacer technique at each visit',
      'Use SABA rescue inhaler ≤ 2 days/week (excluding pre-exercise use)',
      'No activity limitation due to asthma symptoms',
      'Zero exacerbations requiring systemic corticosteroids, ED visits, or hospitalization',
    ],
    interventions: [
      'Spirometry (FEV1, FEV1/FVC) at baseline and every 6–12 months to monitor control',
      'Written asthma action plan: review and update at each visit (green/yellow/red zones)',
      'Environmental trigger identification and avoidance counseling (allergens, irritants, exercise)',
      'Inhaler technique assessment and re-education at every visit',
      'Annual influenza vaccination; pneumococcal vaccination per ACIP schedule (PCV20 or PCV15+PPSV23)',
      'Step therapy review at each visit: step up if uncontrolled × 2–4 weeks, step down if well-controlled × 3 months',
      'Allergy testing (skin prick or specific IgE) if triggers unclear; consider allergen immunotherapy',
    ],
    notes: 'AI-generated based on GINA 2025 guidelines. Classify severity at initial visit; assess control level at every subsequent visit using validated tools (ACT or ACQ). For patients ≥ 12 years on Step 1–2, GINA recommends as-needed low-dose ICS-formoterol as preferred reliever. Consider biologic therapy referral (anti-IgE, anti-IL5, anti-IL4R) if uncontrolled on Step 4–5.',
    duration: '6 months',
  },
  wellness: {
    name: 'Preventive Wellness Plan',
    specialty: 'Family Medicine',
    goals: [
      'Complete age-appropriate annual health examination',
      'Update all recommended vaccinations per ACIP adult immunization schedule',
      'Complete USPSTF-recommended cancer screenings for age and sex',
      'Establish baseline cardiovascular risk profile (10-year ASCVD risk)',
      'Achieve recommended physical activity level (≥ 150 min/week moderate aerobic)',
      'Complete mental health and substance use screening',
    ],
    interventions: [
      'Comprehensive metabolic panel, CBC, and lipid panel',
      'ASCVD risk assessment: BP, lipid panel, fasting glucose or HbA1c, BMI',
      'Cancer screening per USPSTF: colonoscopy starting age 45, low-dose CT lung (if eligible), cervical (age 21–65), breast (mammogram age 40+)',
      'Mental health screening: PHQ-9 (depression), GAD-7 (anxiety), AUDIT-C (alcohol)',
      'Body composition assessment, fitness evaluation, and fall risk (if age ≥ 65)',
      'Lifestyle counseling: nutrition (Mediterranean/DASH), exercise prescription, sleep hygiene, stress management',
    ],
    notes: 'AI-generated preventive care plan based on USPSTF 2024 recommendations and ACIP immunization schedule. Adjust screening intervals and modalities based on individual risk factors, family history, and shared decision-making. Screen for prediabetes (BMI ≥ 25 or age ≥ 35). Discuss advance directives if age ≥ 50.',
    duration: '12 months',
  },
  cardiac: {
    name: 'Phase II Cardiac Rehabilitation Plan',
    specialty: 'Cardiology',
    goals: [
      'Achieve target heart rate zone (60–80% HRmax) during supervised exercise',
      'Complete 36 supervised exercise sessions (standard Phase II program)',
      'Achieve LDL < 70 mg/dL (< 55 mg/dL if very high risk per ESC/EAS)',
      'Complete smoking cessation program if current smoker',
      'Achieve systolic BP < 130 mmHg during rest and appropriate BP response to exercise',
      'Improve 6-minute walk distance by ≥ 50 meters from baseline',
    ],
    interventions: [
      'ECG-monitored supervised exercise 3x/week for 12 weeks (progressive intensity)',
      'Lipid panel at baseline, 6 weeks, and 12 weeks (assess statin efficacy)',
      'Cardiac medication review and optimization each visit (beta-blockers, ACEi/ARB, antiplatelet, statin)',
      'Medical nutrition therapy: Mediterranean or heart-healthy diet counseling',
      'Psychosocial assessment: screen for depression (PHQ-9) and anxiety at intake and discharge',
      'Smoking cessation pharmacotherapy and counseling referral if applicable',
      'Patient education: symptom recognition, medication adherence, emergency action plan',
    ],
    notes: 'AI-generated cardiac rehab plan per AHA/AACVPR 2024 guidelines. Eligible diagnoses: post-MI, post-CABG, stable angina, post-PCI, HFrEF (NYHA II–III), valve repair/replacement. Pre-participation assessment must include symptom-limited exercise test. Refer to Phase III (maintenance) upon program completion.',
    duration: '3 months',
  },
  ckd: {
    name: 'Chronic Kidney Disease Management Plan',
    specialty: 'Nephrology',
    goals: [
      'Maintain eGFR stability (avoid decline > 5 mL/min/1.73 m²/year — indicates rapid progression)',
      'Achieve BP < 130/80 mmHg (< 120/80 if proteinuria and tolerated)',
      'Reduce proteinuria: target UACR reduction ≥ 30% from baseline or maintain UACR < 300 mg/g',
      'Follow renal diet: protein 0.8 g/kg/day for CKD G3–G5, sodium < 2,000 mg/day',
      'Avoid nephrotoxic medications (NSAIDs, aminoglycosides, IV contrast without precautions)',
      'Maintain hemoglobin 10–11.5 g/dL if CKD-associated anemia present',
    ],
    interventions: [
      'Quarterly labs: BMP (creatinine, BUN, electrolytes), eGFR, UACR, phosphorus, intact PTH',
      'Monthly BP monitoring with home BP log',
      'ACEi or ARB optimization for proteinuria reduction (monitor K+ and creatinine after initiation/titration)',
      'SGLT2 inhibitor consideration if eGFR ≥ 20 mL/min/1.73 m² and UACR ≥ 200 mg/g (KDIGO 2024)',
      'Renal diet counseling with renal dietitian (protein, sodium, potassium, phosphorus management)',
      'Medication review each visit: dose-adjust for eGFR, discontinue nephrotoxic agents',
      'Anemia workup if Hgb < 10 g/dL: reticulocyte count, iron studies (ferritin, TSAT), consider ESA referral',
      'Nephrology referral if eGFR < 30, rapid decline, or persistent hyperkalemia/acidosis',
    ],
    notes: 'AI-generated based on KDIGO 2024 CKD guidelines. Stage CKD using both eGFR (G1–G5) and albuminuria (A1–A3) for risk stratification. Finerenone may be considered for T2DM with CKD (FIDELIO/FIGARO trials). Prepare for RRT discussion if eGFR trending toward < 15 mL/min/1.73 m². Vaccinate against hepatitis B, influenza, pneumococcal, and COVID-19.',
    duration: '6 months',
  },
};

const CP_CONDITION_OPTIONS = [
  { key: 'diabetes', label: 'Type 2 Diabetes', icon: '🩸' },
  { key: 'hypertension', label: 'Hypertension', icon: '❤️' },
  { key: 'cardiac', label: 'Cardiac Rehab', icon: '🫀' },
  { key: 'postop', label: 'Post-Surgical', icon: '🏥' },
  { key: 'prenatal', label: 'Prenatal Care', icon: '🤰' },
  { key: 'asthma', label: 'Asthma', icon: '🫁' },
  { key: 'ckd', label: 'CKD', icon: '🫘' },
  { key: 'wellness', label: 'Wellness', icon: '✅' },
];

const CP_GENDER_OPTIONS = ['Male', 'Female', 'Non-binary'];
const CP_AGE_OPTIONS = ['Pediatric (0-17)', 'Young Adult (18-35)', 'Adult (36-55)', 'Older Adult (56-70)', 'Geriatric (70+)'];
const CP_SEVERITY_OPTIONS = ['Mild', 'Moderate', 'Severe'];
const CP_COMORBIDITY_OPTIONS = ['Diabetes', 'Hypertension', 'Obesity', 'CKD', 'COPD', 'Heart Failure', 'Depression'];

const styles: Record<string, React.CSSProperties> = {
  root: { display: 'flex', flexDirection: 'column', gap: 20, minHeight: '100%', maxWidth: 960, margin: '0 auto', width: '100%' },
  header: {
    background: 'var(--color-surface, white)',
    borderRadius: 'var(--radius-lg, 14px)',
    padding: '18px 20px',
    boxShadow: 'var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.08))',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 },
  patientName: { fontSize: 20, fontWeight: 700, color: 'var(--color-text)', lineHeight: 1.3 },
  patientMeta: { fontSize: 13, color: 'var(--color-text-muted)', marginTop: 2 },
  badge: {
    fontSize: 12,
    fontWeight: 600,
    padding: '6px 12px',
    borderRadius: 12,
    background: 'rgba(16, 185, 129, 0.1)',
    color: 'var(--color-success)',
  },
  allergyBadge: {
    fontSize: 12,
    padding: '4px 10px',
    borderRadius: 6,
    background: 'rgba(239, 68, 68, 0.12)',
    color: 'var(--color-error)',
    fontWeight: 600,
  },
  tabsRow: {
    display: 'flex',
    overflowX: 'auto',
    gap: 4,
    background: 'var(--color-surface)',
    borderRadius: 12,
    padding: 5,
    boxShadow: 'var(--shadow-sm)',
    border: '1px solid var(--color-border, #e2e8f0)',
  },
  tab: {
    padding: '10px 16px',
    border: 'none',
    background: 'transparent',
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--color-text-muted)',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    transition: 'all 0.15s',
  },
  tabActive: {
    background: 'var(--color-primary)',
    color: 'white',
  },
  panel: {
    background: 'var(--color-surface)',
    borderRadius: 14,
    padding: '20px',
    boxShadow: 'var(--shadow-sm)',
    border: '1px solid var(--color-border, #e2e8f0)',
    flex: 1,
  },
  soapCard: {
    background: 'var(--color-surface)',
    borderRadius: 12,
    boxShadow: 'var(--shadow-sm)',
    border: '1px solid var(--color-border, #e2e8f0)',
    overflow: 'hidden',
    marginBottom: 14,
  },
  soapCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 16px',
    background: 'var(--color-background)',
    borderBottom: '1px solid var(--color-border)',
    cursor: 'pointer',
  },
  soapLetterS: { width: 24, height: 24, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'white', background: 'var(--color-info)' },
  soapLetterO: { width: 24, height: 24, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'white', background: 'var(--color-success)' },
  soapLetterA: { width: 24, height: 24, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'white', background: 'var(--color-warning)' },
  soapLetterP: { width: 24, height: 24, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'white', background: 'var(--color-purple)' },
  aiBadge: {
    fontSize: 9,
    fontWeight: 700,
    padding: '2px 7px',
    borderRadius: 4,
    background: 'linear-gradient(135deg, var(--color-purple), var(--color-indigo))',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    gap: 3,
  },
  textarea: {
    width: '100%',
    minHeight: 100,
    border: '1px solid var(--color-border)',
    borderRadius: 10,
    padding: '12px 14px',
    fontSize: 14,
    fontFamily: 'inherit',
    lineHeight: 1.6,
    color: 'var(--color-text)',
    resize: 'vertical',
    boxSizing: 'border-box',
  },
  icdChip: {
    padding: '4px 10px',
    borderRadius: 6,
    background: 'rgba(139, 92, 246, 0.08)',
    fontSize: 12,
    fontWeight: 600,
    color: 'var(--color-purple)',
  },
  recordBtn: {
    width: '100%',
    padding: '24px',
    border: '2px dashed var(--color-border)',
    borderRadius: 12,
    background: 'var(--color-background)',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
    fontSize: 16,
    fontWeight: 600,
    color: 'var(--color-text)',
    transition: 'all 0.2s',
  },
  recordBtnActive: {
    borderColor: 'var(--color-error)',
    background: 'rgba(239, 68, 68, 0.06)',
    color: 'var(--color-error)',
  },
  severityBadgeContra: { fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6, textTransform: 'uppercase' as const, background: '#7f1d1d', color: 'white' },
  severityBadgeMajor: { fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6, textTransform: 'uppercase' as const, background: 'var(--color-error-dark)', color: 'white' },
  severityBadgeModerate: { fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6, textTransform: 'uppercase' as const, background: '#ea580c', color: 'white' },
  severityBadgeMinor: { fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6, textTransform: 'uppercase' as const, background: '#ca8a04', color: 'white' },
  severityBadgeInfo: { fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6, textTransform: 'uppercase' as const, background: 'var(--color-info-dark)', color: 'white' },
  severityBadgeDefault: { fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6, textTransform: 'uppercase' as const, background: '#6b7280', color: 'white' },
  actionBar: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 10,
    padding: '18px 0',
  },
  actionRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 10,
  } as React.CSSProperties,
  btnPrimary: {
    padding: '14px 18px',
    borderRadius: 12,
    border: 'none',
    background: 'var(--color-primary)',
    color: 'white',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  btnSecondary: {
    padding: '14px 18px',
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    background: 'var(--color-surface)',
    color: 'var(--color-text)',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
};

export const PatientEncounter = () => {
  const {
    clinicalNotes,
    signNote,
    saveDraftNote,
    cdssAlerts,
    dismissAlert,
    labOrders,
    prescriptions,
    approvePrescription,
    addPrescription,
    updateLabOrderStatus,
    queuePatients,
    completePatient,
    pharmacyItems,
    currentStaff,
    addCdssAlert,
    addLabOrder,
    addReferral,
    staff,
  } = useProvider();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { tenant } = useTheme();
  const hasCDSS = tenant.features.cdss ?? false;
  const hasAI = tenant.features.aiAssistant ?? false;
  const labsEnabled = tenant.features.visits.clinicLabFulfillmentEnabled;
  const loaEnabled = tenant.features.loa;

  // Route state from DoctorQueue "Start Consult"
  const routeState = (location.state ?? {}) as { patientId?: string; patientName?: string; chiefComplaint?: string; ticketNumber?: string };

  const [activeTab, setActiveTab] = useState<TabKey>('soap');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isDesktop, setIsDesktop] = useState(typeof window !== 'undefined' && window.innerWidth >= 1024);
  const [soapForm, setSoapForm] = useState<Partial<ClinicalNote>>({});
  const [encounterElapsed, setEncounterElapsed] = useState(0);

  // Care plan state
  const carePlansEnabled = tenant.features.carePlans ?? false;
  const [cpCondition, setCpCondition] = useState<string>('');
  const [cpGender, setCpGender] = useState<string>('');
  const [cpAge, setCpAge] = useState<string>('');
  const [cpSeverity, setCpSeverity] = useState<string>('');
  const [cpComorbidities, setCpComorbidities] = useState<string[]>([]);
  const [cpAiProcessing, setCpAiProcessing] = useState(false);
  const [cpAiGenerated, setCpAiGenerated] = useState(false);
  const [cpGoals, setCpGoals] = useState<string[]>([]);
  const [cpInterventions, setCpInterventions] = useState<string[]>([]);
  const [cpNotes, setCpNotes] = useState('');
  const [cpPlanName, setCpPlanName] = useState('');
  const [cpSpecialty, setCpSpecialty] = useState('');
  const [cpDuration, setCpDuration] = useState('');
  const [cpNewGoal, setCpNewGoal] = useState('');
  const [cpNewIntervention, setCpNewIntervention] = useState('');

  // AI transcriber state
  const [transcriptLines, setTranscriptLines] = useState<TranscriptLine[]>([]);
  const [aiProcessing, setAiProcessing] = useState(false);
  const [aiGenerated, setAiGenerated] = useState(false);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  // Sign note / CDSS confirmation state
  const [showCdssConfirm, setShowCdssConfirm] = useState(false);
  const [signAction, setSignAction] = useState<'sign' | 'signAndClose' | null>(null);
  const [showSignedNote, setShowSignedNote] = useState(false);
  const [signedNoteSnapshot, setSignedNoteSnapshot] = useState<Partial<ClinicalNote> | null>(null);
  const [signedTimestamp, setSignedTimestamp] = useState('');
  const [encounterClosed, setEncounterClosed] = useState(false);

  // Prescription form state
  const [rxSearch, setRxSearch] = useState('');
  const [rxShowDropdown, setRxShowDropdown] = useState(false);
  const [rxSelectedMed, setRxSelectedMed] = useState<{ name: string; genericName: string; category: string; stockStatus: string } | null>(null);
  const [rxDosage, setRxDosage] = useState('');
  const [rxFrequency, setRxFrequency] = useState('');
  const [rxDuration, setRxDuration] = useState('');
  const [rxQuantity, setRxQuantity] = useState('');
  const [rxNotes, setRxNotes] = useState('');
  const rxSearchRef = useRef<HTMLDivElement>(null);
  const [lookupDrug, setLookupDrug] = useState<string | null>(null);

  // Referral modal state
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [referralForm, setReferralForm] = useState({
    specialty: '',
    doctorId: '',
    facility: '',
    type: 'Internal' as 'Internal' | 'External',
    urgency: 'Routine' as 'Routine' | 'Urgent' | 'Emergent',
    reason: '',
    clinicalSummary: '',
    diagnosis: '',
    icdCode: '',
  });

  // Resolve patient: prefer route state patientId, then IN_SESSION, then first in queue
  const currentPatient = (routeState.patientId
    ? queuePatients.find((p) => p.patientId === routeState.patientId)
    : undefined) ?? queuePatients.find((p) => p.status === 'IN_SESSION') ?? queuePatients[0];
  const patientId = currentPatient?.patientId ?? 'p1';
  const profile = PATIENT_PROFILES[patientId] ?? DEFAULT_PROFILE;
  const patientTranscriptLines = profile.transcript;
  const patientNotes = clinicalNotes.filter((n) => n.patientId === patientId);
  const firstNote = patientNotes[0];
  const activeAlerts = cdssAlerts.filter((a) => !a.dismissed && (!a.patientId || a.patientId === patientId));
  const patientLabOrders = labOrders.filter((o) => o.patientId === patientId);
  const patientPrescriptions = prescriptions.filter((p) => p.patientId === patientId).slice(0, 3);
  const pendingOrders = patientLabOrders.filter(
    (o) => o.status === 'Ordered' || o.status === 'Specimen Collected' || o.status === 'In Progress'
  );
  const completedOrders = patientLabOrders.filter(
    (o) => o.status === 'Resulted' || o.status === 'Reviewed'
  );

  const REFERRAL_SPECIALTIES = [
    'Cardiology', 'Dermatology', 'Endocrinology', 'ENT', 'Gastroenterology',
    'Nephrology', 'Neurology', 'Obstetrics & Gynecology', 'Oncology', 'Ophthalmology',
    'Orthopedics', 'Pediatrics', 'Psychiatry', 'Pulmonology', 'Rheumatology',
    'Surgery - General', 'Urology', 'Physical Medicine & Rehabilitation',
    'Maternal-Fetal Medicine', 'Infectious Disease',
  ];

  const availableDoctors = useMemo(() => {
    if (!referralForm.specialty) return [];
    return staff.filter(s =>
      s.role === 'doctor' &&
      s.id !== currentStaff.id &&
      (s.specialty?.toLowerCase().includes(referralForm.specialty.toLowerCase()) ||
       s.specializations?.some(sp => sp.toLowerCase().includes(referralForm.specialty.toLowerCase())))
    );
  }, [referralForm.specialty, staff, currentStaff.id]);

  useEffect(() => {
    const note = firstNote ?? clinicalNotes[0];
    if (note) {
      setSoapForm({
        subjective: note.subjective,
        objective: note.objective,
        assessment: note.assessment,
        plan: note.plan,
        icdCodes: note.icdCodes ?? [],
        status: note.status,
        aiGenerated: note.aiGenerated,
      });
    } else {
      setSoapForm({
        subjective: '',
        objective: '',
        assessment: '',
        plan: '',
        icdCodes: [],
        status: 'Draft',
        aiGenerated: false,
      });
    }
  }, [firstNote?.id, clinicalNotes]);

  useEffect(() => {
    if (!isRecording) return;
    const t = setInterval(() => setRecordingSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [isRecording]);

  // Simulate transcript lines appearing one-by-one while recording
  useEffect(() => {
    if (!isRecording) return;
    const lineIndex = transcriptLines.length;
    if (lineIndex >= patientTranscriptLines.length) return;
    const delay = lineIndex === 0 ? 1200 : 2000 + Math.random() * 2500;
    const timer = setTimeout(() => {
      setTranscriptLines(prev => [...prev, patientTranscriptLines[lineIndex]]);
    }, delay);
    return () => clearTimeout(timer);
  }, [isRecording, transcriptLines.length, patientTranscriptLines]);

  // Auto-scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcriptLines.length]);

  // Close rx dropdown on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (rxSearchRef.current && !rxSearchRef.current.contains(e.target as Node)) {
        setRxShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Encounter timer — counts up while patient is in session
  useEffect(() => {
    if (!currentPatient || encounterClosed) return;
    const t = setInterval(() => setEncounterElapsed(s => s + 1), 1000);
    return () => clearInterval(t);
  }, [currentPatient, encounterClosed]);

  const formatElapsed = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return m > 0 ? `${m}m ${String(s).padStart(2, '0')}s` : `${s}s`;
  };

  const updateSoapField = (field: keyof ClinicalNote, value: string | string[]) => {
    setSoapForm((prev) => ({ ...prev, [field]: value }));
  };

  // Strip AI delimiters from SOAP content for the signed note
  const stripAiDelimiters = useCallback((text: string) => {
    return text.replace(new RegExp(`\\n?\\n?${AI_DELIMITER}\\n?`, 'g'), '\n\n');
  }, []);

  const performSign = useCallback((action: 'sign' | 'signAndClose') => {
    if (!firstNote) {
      showToast('No note to sign. Save draft first.', 'info');
      return;
    }
    // Create a snapshot of the note for display (strip AI delimiters)
    const snapshot: Partial<ClinicalNote> = {
      subjective: stripAiDelimiters(soapForm.subjective || ''),
      objective: stripAiDelimiters(soapForm.objective || ''),
      assessment: stripAiDelimiters(soapForm.assessment || ''),
      plan: stripAiDelimiters(soapForm.plan || ''),
      icdCodes: soapForm.icdCodes,
      aiGenerated: soapForm.aiGenerated,
    };
    // Save the draft with cleaned content first, then sign
    saveDraftNote(firstNote.id, {
      subjective: stripAiDelimiters(soapForm.subjective || ''),
      objective: stripAiDelimiters(soapForm.objective || ''),
      assessment: stripAiDelimiters(soapForm.assessment || ''),
      plan: stripAiDelimiters(soapForm.plan || ''),
    });
    signNote(firstNote.id);
    setSignedNoteSnapshot(snapshot);
    setSignedTimestamp(new Date().toLocaleString());

    if (action === 'signAndClose') {
      if (currentPatient) completePatient(currentPatient.patientId);
      showToast('Note signed — encounter closed', 'success');
      setEncounterClosed(true);
      setShowSignedNote(true);
    } else {
      showToast('Note signed successfully', 'success');
      setShowSignedNote(true);
    }
    // Also stop recording if it's still going
    if (isRecording) setIsRecording(false);
  }, [firstNote, soapForm, signNote, saveDraftNote, currentPatient, completePatient, showToast, isRecording, stripAiDelimiters]);

  const handleSignNote = () => {
    if (!firstNote) {
      showToast('No note to sign. Save draft first.', 'info');
      return;
    }
    // Check for unreviewed CDSS alerts
    if (activeAlerts.length > 0) {
      setSignAction('sign');
      setShowCdssConfirm(true);
      return;
    }
    performSign('sign');
  };

  const handleQuickOrder = (name: string) => {
    // Actually create the lab order
    const isImaging = ['X-Ray', 'Ultrasound', 'ECG'].some(t => name.includes(t));
    addLabOrder({
      patientId: currentPatient?.patientId ?? 'p1',
      patientName: currentPatient?.patientName ?? 'Patient',
      doctorId: currentStaff?.id ?? 'staff-001',
      doctorName: currentStaff?.name ?? 'Doctor',
      testName: name,
      testType: isImaging ? 'Imaging' : 'Laboratory',
      status: 'Ordered',
      orderedDate: new Date().toISOString().slice(0, 10),
      priority: 'Routine',
    });
    showToast(`Order placed: ${name}`, 'success');

    // CDSS: trigger contextual alerts based on what was ordered
    if (hasCDSS) {
      const nameLower = name.toLowerCase();
      // Imaging with contrast → Metformin interaction warning
      if (nameLower.includes('x-ray') || nameLower.includes('ultrasound')) {
        const patientMeds = prescriptions.filter(p => p.patientId === patientId);
        const onMetformin = patientMeds.some(p => p.medication.toLowerCase().includes('metformin'));
        if (onMetformin) {
          addCdssAlert({
            patientId,
            type: 'drug_interaction',
            severity: 'major',
            title: 'Contrast-Drug Interaction Risk',
            message: `Patient is on Metformin. ${name} may involve contrast dye.`,
            recommendation: 'Hold Metformin 48h before/after contrast imaging. Verify renal function (eGFR).',
            orderId: name,
            dismissed: false,
            actioned: false,
            createdAt: new Date().toISOString(),
          });
          showToast('CDSS Alert: Drug-imaging interaction detected', 'info');
        }
      }
      // Duplicate order detection
      const existingOrder = patientLabOrders.find(
        o => o.testName === name && (o.status === 'Ordered' || o.status === 'In Progress')
      );
      if (existingOrder) {
        addCdssAlert({
          patientId,
          type: 'duplicate_order',
          severity: 'moderate',
          title: 'Possible Duplicate Order',
          message: `"${name}" already ordered for this patient (status: ${existingOrder.status}).`,
          recommendation: 'Review existing order before proceeding. Cancel duplicate if not needed.',
          orderId: existingOrder.id,
          dismissed: false,
          actioned: false,
          createdAt: new Date().toISOString(),
        });
        showToast('CDSS Alert: Duplicate order detected', 'info');
      }
    }
  };

  const getSeverityBadgeStyle = (severity: string): React.CSSProperties => {
    const key = severity === 'contraindicated' ? 'Contra' : severity === 'major' ? 'Major' : severity === 'moderate' ? 'Moderate' : severity === 'minor' ? 'Minor' : severity === 'info' ? 'Info' : 'Default';
    return (styles as Record<string, React.CSSProperties>)[`severityBadge${key}`] ?? styles.severityBadgeDefault;
  };

  const getSeverityStyle = (severity: string) => {
    const map: Record<string, string> = {
      contraindicated: '#7f1d1d',
      major: 'var(--color-error-dark)',
      moderate: '#ea580c',
      minor: '#ca8a04',
      info: 'var(--color-info-dark)',
    };
    return map[severity] ?? '#6b7280';
  };

  const formatTime = (sec: number) =>
    `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;

  const groupAlertsByCategory = (alerts: CDSSAlert[]) => {
    const groups: Record<string, CDSSAlert[]> = {};
    const labels: Record<string, string> = {
      drug_interaction: 'Drug Interactions',
      drug_allergy: 'Allergies',
      dosage_range: 'Dosage',
      guideline: 'Guidelines',
      preventive_care: 'Preventive Care',
      duplicate_order: 'Duplicate Orders',
      critical_value: 'Critical Values',
      formulary: 'Formulary',
    };
    alerts.forEach((a) => {
      const cat = labels[a.type] ?? 'Other';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(a);
    });
    return groups;
  };

  const handleSignAndClose = () => {
    if (!firstNote) {
      showToast('No note to sign. Save draft first.', 'info');
      return;
    }
    // Check for unreviewed CDSS alerts
    if (activeAlerts.length > 0) {
      setSignAction('signAndClose');
      setShowCdssConfirm(true);
      return;
    }
    performSign('signAndClose');
  };

  const handleSaveDraft = () => {
    if (firstNote) {
      saveDraftNote(firstNote.id, {
        subjective: soapForm.subjective ?? '',
        objective: soapForm.objective ?? '',
        assessment: soapForm.assessment ?? '',
        plan: soapForm.plan ?? '',
      });
      showToast('Draft saved', 'success');
    } else {
      showToast('Draft saved locally', 'info');
    }
  };

  const handleReferPatient = () => {
    setReferralForm({
      specialty: '',
      doctorId: '',
      facility: '',
      type: 'Internal',
      urgency: 'Routine',
      reason: '',
      clinicalSummary: soapForm?.assessment ? `${soapForm.subjective}\n\nAssessment: ${soapForm.assessment}` : '',
      diagnosis: '',
      icdCode: '',
    });
    setShowReferralModal(true);
  };

  const submitReferral = () => {
    if (!currentPatient || !referralForm.specialty || !referralForm.reason) {
      showToast('Please fill in specialty and reason', 'error');
      return;
    }
    const selectedDoc = staff.find(s => s.id === referralForm.doctorId);
    addReferral({
      patientId: currentPatient.patientId,
      patientName: currentPatient.patientName,
      referringDoctorId: currentStaff.id,
      referringDoctorName: currentStaff.name,
      referringSpecialty: currentStaff.specialty ?? currentStaff.department,
      referredToSpecialty: referralForm.specialty,
      referredToDoctorId: selectedDoc?.id,
      referredToDoctorName: selectedDoc?.name,
      referredToFacility: referralForm.facility || undefined,
      type: referralForm.type,
      urgency: referralForm.urgency,
      status: 'Pending',
      reason: referralForm.reason,
      clinicalSummary: referralForm.clinicalSummary,
      diagnosis: referralForm.diagnosis || undefined,
      icdCode: referralForm.icdCode || undefined,
      createdAt: new Date().toISOString(),
      tenantId: undefined,
    });
    setShowReferralModal(false);
    showToast(`Referral to ${referralForm.specialty} created for ${currentPatient.patientName}`, 'success');
  };

  if (!currentPatient) {
    return (
      <div style={{ ...styles.root, alignItems: 'center', justifyContent: 'center', padding: 60 }}>
        <Activity size={48} style={{ color: 'var(--color-border)', marginBottom: 12 }} />
        <h3 style={{ fontWeight: 600, marginBottom: 4 }}>No active encounter</h3>
        <p style={{ fontSize: 14, color: 'var(--color-text-muted)', marginBottom: 20 }}>
          Start a consult from the Queue to begin documenting.
        </p>
        <button
          onClick={() => navigate('/doctor/queue')}
          style={{
            ...styles.btnPrimary,
            padding: '12px 24px',
            display: 'inline-flex',
          }}
        >
          <ArrowLeft size={16} /> Go to Queue
        </button>
      </div>
    );
  }

  // Resolve effective tab early (before tabList JSX is built)
  const effectiveTab: TabKey =
    (activeTab === 'orders' && !labsEnabled) ? 'soap' :
    (activeTab === 'careplan' && !carePlansEnabled) ? 'soap' :
    activeTab;

  const tabs: { key: TabKey; label: string; icon: ReactNode }[] = [
    { key: 'soap', label: 'SOAP Notes', icon: <FileSignature size={14} /> },
    ...(hasAI ? [{ key: 'transcriber' as TabKey, label: 'AI Transcriber', icon: <Mic size={14} /> }] : []),
    ...(hasCDSS ? [{ key: 'cdss' as TabKey, label: 'CDSS Alerts', icon: <AlertTriangle size={14} /> }] : []),
    ...(labsEnabled ? [{ key: 'orders' as TabKey, label: 'Orders', icon: <ClipboardList size={14} /> }] : []),
    { key: 'prescriptions', label: 'Prescriptions', icon: <Pill size={14} /> },
    ...(carePlansEnabled ? [{ key: 'careplan' as TabKey, label: 'Care Plan', icon: <ClipboardPlus size={14} /> }] : []),
    { key: 'chart', label: 'Patient Chart', icon: <User size={14} /> },
  ];

  const tabList = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* Recording indicator strip — visible across all tabs */}
      {isRecording && effectiveTab !== 'transcriber' && (
        <button
          onClick={() => setActiveTab('transcriber')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 14px',
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '8px 8px 0 0',
            cursor: 'pointer',
            width: '100%',
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--color-error)',
          }}
        >
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-error)', animation: 'pulse 1.5s infinite' }} />
          Recording in progress — {formatTime(recordingSeconds)} · {transcriptLines.length} lines captured
          <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 500, textDecoration: 'underline' }}>View</span>
        </button>
      )}
      {/* AI processing strip */}
      {aiProcessing && effectiveTab !== 'transcriber' && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 14px',
            background: 'rgba(var(--color-primary-rgb, 59, 130, 246), 0.06)',
            border: '1px solid rgba(var(--color-primary-rgb, 59, 130, 246), 0.15)',
            borderRadius: '8px 8px 0 0',
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--color-primary)',
          }}
        >
          <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
          AI generating SOAP notes from transcript...
        </div>
      )}
      <div style={styles.tabsRow}>
        {tabs.map((t) => (
          <button
            key={t.key}
            style={{ ...styles.tab, ...(effectiveTab === t.key ? styles.tabActive : {}) }}
            onClick={() => setActiveTab(t.key)}
          >
            {t.icon}
            {t.label}
            {t.key === 'cdss' && activeAlerts.length > 0 && (
              <span
                style={{
                  background: 'var(--color-error)',
                  color: 'white',
                  borderRadius: 8,
                  padding: '1px 5px',
                  fontSize: 10,
                  fontWeight: 700,
                }}
              >
                {activeAlerts.length}
              </span>
            )}
            {t.key === 'transcriber' && isRecording && (
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: 'var(--color-error)',
                  animation: 'pulse 1.5s infinite',
                }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );

  const handleViewSignedCopy = () => {
    if (!signedNoteSnapshot) {
      setSignedNoteSnapshot({
        subjective: stripAiDelimiters(soapForm.subjective || ''),
        objective: stripAiDelimiters(soapForm.objective || ''),
        assessment: stripAiDelimiters(soapForm.assessment || ''),
        plan: stripAiDelimiters(soapForm.plan || ''),
        icdCodes: soapForm.icdCodes,
        aiGenerated: soapForm.aiGenerated,
      });
      setSignedTimestamp(new Date().toLocaleString());
    }
    setShowSignedNote(true);
  };

  const renderSoapPanel = () => (
    <SoapNotePanel
      compact={false}
      soapData={{
        subjective: soapForm.subjective ?? '',
        objective: soapForm.objective ?? '',
        assessment: soapForm.assessment ?? '',
        plan: soapForm.plan ?? '',
      }}
      onSoapChange={(field, value) => updateSoapField(field, value)}
      status={soapForm.status ?? 'Draft'}
      icdCodes={soapForm.icdCodes}
      aiAssisted={soapForm.aiGenerated}
      hasAI={hasAI}
      aiGenerated={aiGenerated}
      aiProcessing={aiProcessing}
      isRecording={isRecording}
      recordingSeconds={recordingSeconds}
      transcriptLinesCount={transcriptLines.length}
      onGenerateSoap={handleGenerateSoap}
      onSaveDraft={handleSaveDraft}
      onSignNote={handleSignNote}
      onViewSignedCopy={handleViewSignedCopy}
      activeAlertsCount={activeAlerts.length}
      formatTime={formatTime}
    />
  );

  const handleGenerateSoap = () => {
    if (transcriptLines.length === 0) {
      showToast('Record a conversation first to generate SOAP notes', 'info');
      return;
    }
    // Stop recording when generating SOAP
    if (isRecording) {
      setIsRecording(false);
    }
    setAiProcessing(true);
    // Simulate AI processing time — contextual SOAP from patient profile
    const aiSoap = getAiSoapAppend(profile);
    setTimeout(() => {
      setSoapForm((prev) => ({
        ...prev,
        subjective: (prev.subjective || '') + aiSoap.subjective,
        objective: (prev.objective || '') + aiSoap.objective,
        assessment: (prev.assessment || '') + aiSoap.assessment,
        plan: (prev.plan || '') + aiSoap.plan,
        aiGenerated: true,
      }));
      setAiProcessing(false);
      setAiGenerated(true);
      showToast('AI generated SOAP notes appended from transcript', 'success');
    }, 3000);
  };

  const handleStartRecording = () => {
    if (isRecording) {
      setIsRecording(false);
    } else {
      setIsRecording(true);
      setRecordingSeconds(0);
      setTranscriptLines([]);
      setAiGenerated(false);
    }
  };

  const renderTranscriberPanel = () => (
    <div style={styles.panel}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Recording control */}
        <button
          style={{
            ...styles.recordBtn,
            ...(isRecording ? styles.recordBtnActive : {}),
          }}
          onClick={handleStartRecording}
        >
          {isRecording ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: 'var(--color-error)',
                    animation: 'pulse 1.5s infinite',
                  }}
                />
                <MicOff size={32} />
              </div>
              <span>Recording... {formatTime(recordingSeconds)}</span>
              <span style={{ fontSize: 12, fontWeight: 400 }}>Tap to stop recording</span>
            </>
          ) : (
            <>
              <Mic size={32} style={{ color: 'var(--color-text-muted)' }} />
              <span>{transcriptLines.length > 0 ? 'Restart Recording' : 'Start Recording'}</span>
              <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--color-text-muted)' }}>
                AI transcribes the conversation in real-time
              </span>
            </>
          )}
        </button>

        {/* Live transcript feed */}
        <div
          style={{
            border: '1px solid var(--color-border)',
            borderRadius: 8,
            padding: 14,
            background: 'var(--color-background)',
            minHeight: 180,
            maxHeight: 350,
            overflowY: 'auto',
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 700 }}>
              Live Transcript
              {isRecording && (
                <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--color-error)', fontWeight: 500 }}>
                  ● LIVE
                </span>
              )}
            </div>
            {transcriptLines.length > 0 && (
              <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                {transcriptLines.length} / {patientTranscriptLines.length} lines
              </span>
            )}
          </div>

          {transcriptLines.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 16px', color: 'var(--color-text-muted)' }}>
              <Mic size={32} style={{ marginBottom: 8, opacity: 0.4 }} />
              <div style={{ fontSize: 13 }}>
                {isRecording
                  ? 'Listening... transcript will appear here'
                  : 'Start recording to capture the conversation'}
              </div>
            </div>
          ) : (
            transcriptLines.map((line, i) => (
              <div
                key={i}
                style={{
                  marginBottom: 10,
                  fontSize: 13,
                  display: 'flex',
                  gap: 8,
                  alignItems: 'flex-start',
                  animation: 'fadeInUp 0.3s ease',
                  padding: '6px 8px',
                  borderRadius: 6,
                  background: i === transcriptLines.length - 1 ? 'rgba(var(--color-primary-rgb, 59, 130, 246), 0.04)' : 'transparent',
                }}
              >
                <span style={{ fontSize: 10, color: 'var(--color-text-muted)', minWidth: 36, paddingTop: 2 }}>
                  {line.ts}
                </span>
                <span
                  style={{
                    fontWeight: 700,
                    minWidth: 54,
                    fontSize: 11,
                    color: line.speaker === 'doctor' ? 'var(--color-primary)' : '#0891b2',
                    paddingTop: 1,
                  }}
                >
                  {line.speaker === 'doctor' ? 'Dr.' : 'Pt.'}
                </span>
                <span style={{ flex: 1, lineHeight: 1.4 }}>{line.text}</span>
              </div>
            ))
          )}

          {/* Typing indicator */}
          {isRecording && transcriptLines.length < patientTranscriptLines.length && transcriptLines.length > 0 && (
            <div style={{ display: 'flex', gap: 4, padding: '8px', alignItems: 'center' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-text-muted)', animation: 'pulse 1s infinite', animationDelay: '0ms' }} />
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-text-muted)', animation: 'pulse 1s infinite', animationDelay: '200ms' }} />
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-text-muted)', animation: 'pulse 1s infinite', animationDelay: '400ms' }} />
            </div>
          )}
          <div ref={transcriptEndRef} />
        </div>

        {/* AI Processing indicator */}
        {aiProcessing && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '12px 16px',
              borderRadius: 8,
              background: 'rgba(var(--color-primary-rgb, 59, 130, 246), 0.06)',
              border: '1px solid rgba(var(--color-primary-rgb, 59, 130, 246), 0.15)',
            }}
          >
            <Loader2 size={18} style={{ color: 'var(--color-primary)', animation: 'spin 1s linear infinite' }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-primary)' }}>AI Processing Transcript</div>
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Analyzing conversation and generating structured SOAP notes...</div>
            </div>
          </div>
        )}

        {/* Success banner */}
        {aiGenerated && !aiProcessing && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 10,
              padding: '10px 14px',
              borderRadius: 8,
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckCircle2 size={16} style={{ color: 'var(--color-success)' }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-success)' }}>
                SOAP notes generated
              </span>
            </div>
            <button
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-primary)',
                fontWeight: 600,
                fontSize: 13,
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
              onClick={() => setActiveTab('soap')}
            >
              View SOAP
            </button>
          </div>
        )}

        {/* Generate button */}
        <button
          style={{
            ...styles.btnPrimary,
            width: '100%',
            opacity: transcriptLines.length === 0 || aiProcessing ? 0.5 : 1,
            pointerEvents: transcriptLines.length === 0 || aiProcessing ? 'none' : 'auto',
          }}
          onClick={handleGenerateSoap}
          disabled={transcriptLines.length === 0 || aiProcessing}
        >
          {aiProcessing ? (
            <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Generating...</>
          ) : (
            <><Sparkles size={16} /> Generate SOAP Note</>
          )}
        </button>
        <div style={{ fontSize: 11, color: 'var(--color-text-muted)', textAlign: 'center' }}>
          AI will analyze the transcript and append structured notes to your SOAP sections
        </div>
      </div>
    </div>
  );

  const renderCdssPanel = () => (
    <div style={styles.panel}>
      {activeAlerts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-muted)' }}>
          <ShieldCheck size={40} style={{ color: 'var(--color-success)', marginBottom: 12 }} />
          <div style={{ fontWeight: 600, marginBottom: 4 }}>No active alerts</div>
          <div style={{ fontSize: 13 }}>All clinical checks passed{!loaEnabled && ' (formulary/LOA not configured for this facility)'}</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {Object.entries(groupAlertsByCategory(activeAlerts)).map(([cat, alerts]) => (
            <div key={cat}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: 8 }}>
                {cat}
              </div>
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  style={{
                    padding: 14,
                    borderRadius: 8,
                    background: 'var(--color-surface)',
                    borderLeft: `4px solid ${getSeverityStyle(alert.severity)}`,
                    marginBottom: 8,
                    boxShadow: 'var(--shadow-sm)',
                    overflow: 'hidden',
                  }}
                >
                  {/* Badge + Title row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                    <span style={{ ...getSeverityBadgeStyle(alert.severity), whiteSpace: 'nowrap', flexShrink: 0 }}>{alert.severity}</span>
                    <span style={{ fontSize: 14, fontWeight: 600, minWidth: 0 }}>{alert.title}</span>
                  </div>
                  {/* Message */}
                  <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 6 }}>
                    {alert.message}
                  </div>
                  {/* Recommendation */}
                  <div
                    style={{
                      fontSize: 12,
                      padding: '8px 10px',
                      background: 'var(--color-background)',
                      borderRadius: 6,
                      lineHeight: 1.5,
                      marginBottom: 10,
                    }}
                  >
                    {alert.recommendation}
                  </div>
                  {/* Action buttons — always below content */}
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button
                      style={{ ...styles.btnSecondary, padding: '8px 14px', flex: 'none', fontSize: 13 }}
                      onClick={() => {
                        dismissAlert(alert.id);
                        showToast('Alert dismissed', 'info');
                      }}
                    >
                      Dismiss
                    </button>
                    <button
                      style={{ ...styles.btnPrimary, padding: '8px 14px', flex: 'none', minWidth: 0, fontSize: 13 }}
                      onClick={() => {
                        dismissAlert(alert.id);
                        showToast(`Action taken: ${alert.recommendation}`, 'success');
                      }}
                    >
                      Take Action
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderOrdersPanel = () => (
    <div style={styles.panel}>
      <div style={{ marginBottom: 20 }}>
        <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Order Lab/Imaging</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {QUICK_ORDERS.map((name) => (
            <button
              key={name}
              style={styles.btnSecondary}
              onClick={() => handleQuickOrder(name)}
            >
              {name}
            </button>
          ))}
        </div>
      </div>
      <div style={{ marginBottom: 20 }}>
        <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Pending Orders</h4>
        {pendingOrders.length === 0 ? (
          <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>No pending orders</div>
        ) : (
          pendingOrders.map((o) => (
            <div
              key={o.id}
              style={{
                padding: 12,
                border: '1px solid var(--color-border)',
                borderRadius: 8,
                marginBottom: 8,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <span style={{ fontWeight: 600 }}>{o.testName}</span>
                <span style={{ fontSize: 12, color: 'var(--color-text-muted)', marginLeft: 8 }}>
                  {o.status}
                </span>
              </div>
              <button
                style={{ ...styles.btnSecondary, padding: '6px 10px', fontSize: 12 }}
                onClick={() => updateLabOrderStatus(o.id, 'Cancelled')}
              >
                Cancel
              </button>
            </div>
          ))
        )}
      </div>
      <div>
        <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Results</h4>
        {completedOrders.length === 0 ? (
          <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>No results yet</div>
        ) : (
          completedOrders.map((o) => (
            <div
              key={o.id}
              style={{
                padding: 12,
                border: '1px solid var(--color-border)',
                borderRadius: 8,
                marginBottom: 8,
                borderLeft: o.isCritical ? '4px solid var(--color-error)' : undefined,
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: 4 }}>{o.testName}</div>
              <div style={{ fontSize: 13 }}>{o.result}</div>
              {o.referenceRange && (
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                  Ref: {o.referenceRange}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );

  const rxFilteredMeds = rxSearch.length >= 1
    ? pharmacyItems.filter(
        (m) =>
          m.name.toLowerCase().includes(rxSearch.toLowerCase()) ||
          m.genericName.toLowerCase().includes(rxSearch.toLowerCase()) ||
          m.category.toLowerCase().includes(rxSearch.toLowerCase())
      )
    : [];

  const handleSelectMed = (item: typeof pharmacyItems[0]) => {
    setRxSelectedMed({ name: item.name, genericName: item.genericName, category: item.category, stockStatus: item.status });
    setRxSearch(item.name);
    setRxShowDropdown(false);
    // Auto-fill dosage from the item name if it contains a dosage pattern
    const dosageMatch = item.name.match(/(\d+\s*(?:mg|mcg|ml|U\/mL|tab|cap))/i);
    if (dosageMatch) setRxDosage(dosageMatch[1]);
  };

  const handleClearRxForm = () => {
    setRxSearch('');
    setRxSelectedMed(null);
    setRxDosage('');
    setRxFrequency('');
    setRxDuration('');
    setRxQuantity('');
    setRxNotes('');
  };

  const handleSubmitRx = () => {
    if (!rxSelectedMed) {
      showToast('Select a medication from the search results', 'info');
      return;
    }
    if (!rxDosage || !rxFrequency) {
      showToast('Dosage and frequency are required', 'info');
      return;
    }
    const medName = rxSelectedMed.name;
    const medNameLower = medName.toLowerCase();

    addPrescription({
      patientId: currentPatient?.patientId ?? 'p1',
      patientName: currentPatient?.patientName ?? 'Patient',
      doctorId: currentStaff?.id ?? 'staff-001',
      doctorName: currentStaff?.name ?? 'Doctor',
      medication: medName,
      dosage: rxDosage,
      frequency: rxFrequency,
      duration: rxDuration || '30 days',
      quantity: parseInt(rxQuantity) || 30,
      refillsRemaining: 0,
      status: 'Active',
      prescribedDate: new Date().toISOString().slice(0, 10),
      notes: rxNotes || undefined,
    });
    showToast(`${medName} prescribed for ${currentPatient?.patientName ?? 'patient'} — sent to pharmacy`, 'success');

    // CDSS: trigger contextual alerts for the newly prescribed medication
    if (hasCDSS) {
      const now = new Date().toISOString();
      const patientAllergies = ['penicillin', 'sulfa']; // from patient chart
      const existingMeds = patientPrescriptions.map(p => p.medication.toLowerCase());

      // Allergy cross-reactivity check
      const allergyKeywords: Record<string, string[]> = {
        penicillin: ['amoxicillin', 'ampicillin', 'penicillin', 'augmentin', 'piperacillin'],
        sulfa: ['sulfamethoxazole', 'sulfasalazine', 'bactrim', 'cotrimoxazole'],
      };
      for (const allergy of patientAllergies) {
        const crossReactive = allergyKeywords[allergy] ?? [];
        if (crossReactive.some(k => medNameLower.includes(k))) {
          addCdssAlert({
            patientId,
            type: 'drug_allergy',
            severity: 'contraindicated',
            title: 'Allergy Cross-Reactivity',
            message: `${medName} is cross-reactive with patient's ${allergy} allergy.`,
            recommendation: `Do NOT administer. Consider alternative medication class.`,
            dismissed: false,
            actioned: false,
            createdAt: now,
          });
          showToast('CDSS ALERT: Allergy cross-reactivity detected!', 'info');
        }
      }

      // Common drug-drug interaction checks (evidence-based, clinically validated)
      const interactions: Record<string, { with: string[]; msg: string; sev: string; rec: string }> = {
        warfarin: { with: ['aspirin', 'ibuprofen', 'naproxen', 'clopidogrel', 'celecoxib'], sev: 'major', msg: 'Increased bleeding risk — additive anticoagulant/antiplatelet effects', rec: 'Monitor INR closely (within 3–5 days). Consider PPI gastroprotection. If NSAID required, use lowest dose for shortest duration.' },
        metformin: { with: ['contrast'], sev: 'major', msg: 'Risk of contrast-induced nephropathy leading to metformin accumulation and lactic acidosis', rec: 'Hold Metformin 48h before and after iodinated contrast procedures. Check renal function (eGFR) before resuming.' },
        tramadol: { with: ['alprazolam', 'diazepam', 'lorazepam', 'midazolam', 'zolpidem'], sev: 'major', msg: 'CNS and respiratory depression risk (FDA Black Box Warning: opioid + benzodiazepine)', rec: 'Avoid combination if possible. If clinically necessary, use lowest effective doses and shortest duration. Monitor respiratory status.' },
        amlodipine: { with: ['simvastatin'], sev: 'major', msg: 'CYP3A4 inhibition increases simvastatin exposure — risk of rhabdomyolysis', rec: 'FDA: limit simvastatin to max 20 mg/day when co-administered with Amlodipine. Consider switching to atorvastatin or rosuvastatin.' },
        // Serotonin syndrome risk
        tramadol_ssri: { with: ['sertraline', 'fluoxetine', 'paroxetine', 'escitalopram', 'citalopram', 'venlafaxine', 'duloxetine'], sev: 'major', msg: 'Serotonin syndrome risk — tramadol has serotonergic activity', rec: 'Monitor for agitation, hyperthermia, tachycardia, hyperreflexia, clonus. Consider alternative analgesic without serotonergic activity.' },
        // Potassium-sparing combinations
        spironolactone: { with: ['lisinopril', 'enalapril', 'ramipril', 'losartan', 'valsartan', 'irbesartan'], sev: 'moderate', msg: 'Hyperkalemia risk — both agents increase serum potassium', rec: 'Monitor serum potassium and creatinine within 1 week of initiation and regularly thereafter. Avoid K+ supplements unless documented hypokalemia.' },
        // QT prolongation
        azithromycin: { with: ['amiodarone', 'sotalol', 'haloperidol', 'ondansetron', 'methadone'], sev: 'major', msg: 'Additive QTc prolongation risk — torsades de pointes', rec: 'Obtain baseline ECG. Monitor QTc. Avoid combination if QTc > 500 ms. Correct electrolyte abnormalities (K+, Mg2+).' },
        // Digoxin toxicity
        digoxin: { with: ['amiodarone', 'verapamil', 'clarithromycin', 'erythromycin'], sev: 'major', msg: 'Increased digoxin levels — toxicity risk (nausea, visual changes, arrhythmias)', rec: 'Reduce digoxin dose by 50% when adding interacting drug. Monitor digoxin levels (target 0.5–0.9 ng/mL for HF).' },
      };
      for (const [drugKey, rule] of Object.entries(interactions)) {
        // Resolve the actual drug name from the key (e.g., "tramadol_ssri" → "tramadol")
        const drug = drugKey.split('_')[0];
        const severity = (rule as { sev: string }).sev === 'moderate' ? 'moderate' : 'major';
        if (medNameLower.includes(drug)) {
          const conflicting = existingMeds.filter(m => rule.with.some(w => m.includes(w)));
          if (conflicting.length > 0) {
            addCdssAlert({
              patientId,
              type: 'drug_interaction',
              severity,
              title: 'Drug-Drug Interaction',
              message: `${medName} + ${conflicting.join(', ')}: ${rule.msg}.`,
              recommendation: rule.rec,
              dismissed: false,
              actioned: false,
              createdAt: now,
            });
            showToast('CDSS Alert: Drug interaction detected', 'info');
          }
        }
        // Check reverse too — if existing meds contain the key drug
        if (rule.with.some(w => medNameLower.includes(w)) && existingMeds.some(m => m.includes(drug))) {
          addCdssAlert({
            patientId,
            type: 'drug_interaction',
            severity,
            title: 'Drug-Drug Interaction',
            message: `${medName} interacts with patient's existing ${drug} prescription: ${rule.msg}.`,
            recommendation: rule.rec,
            dismissed: false,
            actioned: false,
            createdAt: now,
          });
          showToast('CDSS Alert: Drug interaction detected', 'info');
        }
      }

      // Dosage range check for elderly/sensitive populations
      const dosageNum = parseFloat(rxDosage);
      if (medNameLower.includes('amlodipine') && dosageNum >= 10) {
        addCdssAlert({
          patientId,
          type: 'dosage_range',
          severity: 'moderate',
          title: 'High Dose Alert',
          message: `${medName} ${rxDosage} — maximum recommended starting dose is 5mg for patients with hepatic impairment or elderly.`,
          recommendation: 'Consider starting at 5mg and titrating up based on response.',
          dismissed: false,
          actioned: false,
          createdAt: now,
        });
      }

      // Controlled substance warning
      if (rxSelectedMed.stockStatus && pharmacyItems.find(p => p.name === medName)?.isControlled) {
        addCdssAlert({
          patientId,
          type: 'guideline',
          severity: 'moderate',
          title: 'Controlled Substance Prescribed',
          message: `${medName} is a controlled medication. Prescription requires additional documentation.`,
          recommendation: 'Ensure proper DEA/PRC documentation. Check PDMP for existing controlled substance prescriptions.',
          dismissed: false,
          actioned: false,
          createdAt: now,
        });
      }
    }

    handleClearRxForm();
  };

  const renderPrescriptionsPanel = () => (
    <div style={styles.panel}>
      <div
        style={{
          padding: '14px 16px',
          background: 'rgba(245, 158, 11, 0.1)',
          borderRadius: 10,
          marginBottom: 24,
          fontSize: 14,
          color: '#92400e',
          lineHeight: 1.5,
          display: 'flex',
          alignItems: 'flex-start',
          gap: 10,
        }}
      >
        <ShieldAlert size={18} style={{ flexShrink: 0, marginTop: 1 }} />
        <span>Drug interaction warning: Metformin + contrast dye. Hold Metformin 48h before/after imaging.</span>
      </div>

      {/* Active prescriptions */}
      <div style={{ marginBottom: 28 }}>
        <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>
          Active Prescriptions ({patientPrescriptions.length})
        </h4>
        {patientPrescriptions.length === 0 ? (
          <div style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>None</div>
        ) : (
          patientPrescriptions.map((rx) => (
            <div
              key={rx.id}
              style={{
                padding: '14px 16px',
                border: '1px solid var(--color-border)',
                borderRadius: 12,
                marginBottom: 10,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 10,
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 15 }}>
                  <span
                    style={{ cursor: 'pointer', textDecoration: 'underline', textDecorationStyle: 'dotted' }}
                    onClick={() => setLookupDrug(rx.medication)}
                    title="View drug information"
                  >
                    {rx.medication}
                  </span> {rx.dosage}
                </div>
                <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 3 }}>
                  {rx.frequency} · {rx.duration} · Qty: {rx.quantity}
                </div>
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>
                  {rx.prescribedDate} · {rx.status}
                  {rx.notes && <> · {rx.notes}</>}
                </div>
              </div>
              {rx.status === 'Pending Approval' && (
                <button
                  style={{ ...styles.btnPrimary, padding: '10px 20px', flexShrink: 0, borderRadius: 10, fontSize: 14 }}
                  onClick={() => approvePrescription(rx.id)}
                >
                  Approve
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* New prescription form */}
      <div>
        <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>New Prescription</h4>

        {/* Favorite / frequent prescriptions */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Star size={12} /> Frequent Prescriptions
          </div>
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
            {[
              { name: 'Amlodipine 5mg', dose: '5mg', freq: 'Once daily' },
              { name: 'Metformin 500mg', dose: '500mg', freq: 'Twice daily' },
              { name: 'Losartan 50mg', dose: '50mg', freq: 'Once daily' },
              { name: 'Atorvastatin 20mg', dose: '20mg', freq: 'Once daily' },
              { name: 'Aspirin 81mg', dose: '81mg', freq: 'Once daily' },
              { name: 'Metoprolol 50mg', dose: '50mg', freq: 'Once daily' },
            ].map((fav) => (
              <button
                key={fav.name}
                onClick={() => {
                  const found = pharmacyItems.find(m => m.name.toLowerCase().includes(fav.name.split(' ')[0].toLowerCase()));
                  if (found) {
                    handleSelectMed(found);
                    setRxDosage(fav.dose);
                    setRxFrequency(fav.freq);
                  } else {
                    setRxSearch(fav.name);
                    setRxDosage(fav.dose);
                    setRxFrequency(fav.freq);
                  }
                }}
                style={{
                  padding: '6px 12px', borderRadius: 8, border: '1px solid var(--color-border)',
                  background: 'var(--color-surface)', cursor: 'pointer', whiteSpace: 'nowrap',
                  fontSize: 12, fontWeight: 600, color: 'var(--color-text)',
                  display: 'flex', alignItems: 'center', gap: 4,
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { (e.currentTarget).style.borderColor = 'var(--color-primary)'; (e.currentTarget).style.color = 'var(--color-primary)'; }}
                onMouseLeave={e => { (e.currentTarget).style.borderColor = 'var(--color-border)'; (e.currentTarget).style.color = 'var(--color-text)'; }}
              >
                <Pill size={11} /> {fav.name}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Medication search with autocomplete */}
          <div ref={rxSearchRef} style={{ position: 'relative' }}>
            <input
              style={{ ...styles.textarea, minHeight: 40, width: '100%', boxSizing: 'border-box' }}
              placeholder="Search medication (name, generic, or category)..."
              value={rxSearch}
              onChange={(e) => {
                setRxSearch(e.target.value);
                setRxShowDropdown(true);
                if (rxSelectedMed && e.target.value !== rxSelectedMed.name) {
                  setRxSelectedMed(null);
                }
              }}
              onFocus={() => { if (rxSearch.length >= 1) setRxShowDropdown(true); }}
            />
            {rxSelectedMed && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  marginTop: 6,
                  fontSize: 11,
                  color: 'var(--color-text-muted)',
                }}
              >
                <CheckCircle2 size={12} style={{ color: 'var(--color-success)' }} />
                {rxSelectedMed.genericName} · {rxSelectedMed.category}
                {rxSelectedMed.stockStatus !== 'In Stock' && (
                  <span style={{ color: 'var(--color-error)', fontWeight: 600 }}>
                    · {rxSelectedMed.stockStatus}
                  </span>
                )}
              </div>
            )}
            {/* Dropdown results */}
            {rxShowDropdown && rxSearch.length >= 1 && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  zIndex: 50,
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 8,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  maxHeight: 240,
                  overflowY: 'auto',
                  marginTop: 4,
                }}
              >
                {rxFilteredMeds.length === 0 ? (
                  <div style={{ padding: '14px 16px', fontSize: 13, color: 'var(--color-text-muted)', textAlign: 'center' }}>
                    No medications matching "{rxSearch}"
                  </div>
                ) : (
                  rxFilteredMeds.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleSelectMed(item)}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        width: '100%',
                        padding: '10px 14px',
                        border: 'none',
                        borderBottom: '1px solid var(--color-border)',
                        background: 'transparent',
                        cursor: 'pointer',
                        textAlign: 'left',
                        gap: 2,
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-background)'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>
                          {item.name}
                          <Info
                            size={14}
                            style={{ color: 'var(--color-primary)', opacity: 0.7, cursor: 'pointer', flexShrink: 0 }}
                            onClick={(e) => { e.stopPropagation(); setLookupDrug(item.name.split(' ')[0]); }}
                          />
                        </span>
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 600,
                            padding: '2px 8px',
                            borderRadius: 6,
                            background:
                              item.status === 'In Stock'
                                ? 'rgba(16, 185, 129, 0.1)'
                                : item.status === 'Low Stock'
                                ? 'rgba(245, 158, 11, 0.1)'
                                : 'rgba(239, 68, 68, 0.1)',
                            color:
                              item.status === 'In Stock'
                                ? 'var(--color-success)'
                                : item.status === 'Low Stock'
                                ? 'var(--color-warning-dark)'
                                : 'var(--color-error)',
                          }}
                        >
                          {item.status}
                        </span>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                        {item.genericName} · {item.category}
                        {item.isControlled && (
                          <span style={{ color: 'var(--color-error)', fontWeight: 600 }}> · Controlled</span>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Dosage and frequency */}
          <div style={{ display: 'flex', gap: 12 }}>
            <input
              style={{ ...styles.textarea, minHeight: 46, flex: 1 }}
              placeholder="Dosage (e.g. 20mg)"
              value={rxDosage}
              onChange={(e) => setRxDosage(e.target.value)}
            />
            <select
              style={{ ...styles.textarea, minHeight: 46, flex: 1 }}
              value={rxFrequency}
              onChange={(e) => setRxFrequency(e.target.value)}
            >
              <option value="">Frequency</option>
              {FREQUENCY_OPTIONS.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>

          {/* Duration and quantity */}
          <div style={{ display: 'flex', gap: 12 }}>
            <input
              style={{ ...styles.textarea, flex: 1, minHeight: 46 }}
              placeholder="Duration (e.g. 30 days)"
              value={rxDuration}
              onChange={(e) => setRxDuration(e.target.value)}
            />
            <input
              style={{ ...styles.textarea, flex: 1, minHeight: 46 }}
              placeholder="Quantity"
              type="number"
              value={rxQuantity}
              onChange={(e) => setRxQuantity(e.target.value)}
            />
          </div>

          {/* Notes */}
          <textarea
            style={{ ...styles.textarea, minHeight: 80, resize: 'vertical' }}
            placeholder="Notes (optional) — e.g. Take with food, avoid alcohol..."
            value={rxNotes}
            onChange={(e) => setRxNotes(e.target.value)}
          />

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
            <button
              style={{
                ...styles.btnPrimary,
                flex: 1,
                padding: '14px 16px',
                borderRadius: 12,
                fontSize: 15,
                opacity: !rxSelectedMed || !rxDosage || !rxFrequency ? 0.5 : 1,
              }}
              onClick={handleSubmitRx}
            >
              <Send size={16} /> e-Prescribe
            </button>
            {(rxSearch || rxDosage || rxFrequency || rxDuration || rxQuantity || rxNotes) && (
              <button
                style={{ ...styles.btnSecondary, padding: '14px 16px', borderRadius: 12, fontSize: 14 }}
                onClick={handleClearRxForm}
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderChartPanel = () => (
    <div style={styles.panel}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div>
          <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>Demographics</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 14 }}>
            <span style={{ color: 'var(--color-text-muted)' }}>Name</span>
            <span style={{ fontWeight: 600 }}>{currentPatient.patientName}</span>
            <span style={{ color: 'var(--color-text-muted)' }}>DOB</span>
            <span>{profile.dob}</span>
            <span style={{ color: 'var(--color-text-muted)' }}>Gender</span>
            <span>{profile.gender}</span>
            <span style={{ color: 'var(--color-text-muted)' }}>Blood Type</span>
            <span>{profile.bloodType}</span>
            <span style={{ color: 'var(--color-text-muted)' }}>Contact</span>
            <span>{profile.contact}</span>
          </div>
        </div>
        <div>
          <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>Allergies</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {profile.allergies.length > 0 ? profile.allergies.map((a) => (
              <span key={a} style={styles.allergyBadge}>
                {a}
              </span>
            )) : (
              <span style={{ ...styles.allergyBadge, background: 'rgba(34,197,94,0.10)', color: '#15803d' }}>No Known Drug Allergies</span>
            )}
          </div>
        </div>
        <div>
          <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>Active Medications</h4>
          <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, lineHeight: 1.8 }}>
            {profile.activeMeds.map((m) => (
              <li key={m} style={{ marginBottom: 4 }}>
                <span
                  style={{ cursor: 'pointer', textDecoration: 'underline', textDecorationStyle: 'dotted' }}
                  onClick={() => setLookupDrug(m.split(' ')[0])}
                  title="View drug information"
                >
                  {m}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Recent Visits</h4>
          {patientNotes.slice(0, 3).map((n) => (
            <div
              key={n.id}
              style={{
                padding: 12,
                border: '1px solid var(--color-border)',
                borderRadius: 8,
                marginBottom: 8,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontWeight: 600 }}>{n.date}</span>
                <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{n.status}</span>
              </div>
              <div style={{ fontSize: 13 }}>{n.assessment}</div>
            </div>
          ))}
          {patientNotes.length === 0 && (
            <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>No recent visits</div>
          )}
        </div>
        {(tenant.features.hmo || tenant.features.philHealth) && (
          <div>
            <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Insurance</h4>
            <div style={{ fontSize: 13 }}>
              {tenant.features.philHealth && <div>PhilHealth: 14-1234567890-1</div>}
              {tenant.features.hmo && <div style={{ color: 'var(--color-text-muted)' }}>HMO: Maxicare Prima</div>}
            </div>
          </div>
        )}
        <div>
          <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Immunization Status</h4>
          <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
            Flu 2025 · COVID-19 (3 doses) · Pneumococcal up to date
          </div>
        </div>
      </div>
    </div>
  );

  /* ══════════════════════════════════════════
     Care Plan Panel (in-encounter)
     ══════════════════════════════════════════ */
  const handleCpGenerate = () => {
    if (!cpCondition) {
      showToast('Select a condition to generate a care plan', 'info');
      return;
    }
    setCpAiProcessing(true);
    setTimeout(() => {
      const tpl = CP_AI_TEMPLATES[cpCondition];
      if (!tpl) { setCpAiProcessing(false); return; }

      // Base goals and interventions from template
      let goals = [...tpl.goals];
      let interventions = [...tpl.interventions];
      let notesLines = [tpl.notes];

      // Refine by age bracket
      if (cpAge.includes('Geriatric') || cpAge.includes('Older')) {
        goals.push('Annual fall risk assessment (Timed Up-and-Go, Morse Fall Scale) with prevention plan');
        interventions.push('Comprehensive geriatric assessment including frailty index, cognitive screening (MMSE/MoCA), and polypharmacy review');
        interventions.push('Medication reconciliation: deprescribe high-risk medications (Beers Criteria) when clinically appropriate');
        notesLines.push('Geriatric considerations: individualize treatment targets to prioritize functional status, fall prevention, and quality of life over aggressive numerical targets. Avoid hypoglycemia and hypotension.');
      }
      if (cpAge.includes('Young Adult')) {
        notesLines.push('Young adult: ensure transition of care protocols if transitioning from pediatric services. Address lifestyle factors, contraception, and mental health proactively.');
      }
      if (cpAge.includes('Pediatric')) {
        goals.push('Monitor growth (height, weight, BMI percentile) and developmental milestones per AAP schedule');
        interventions.push('All medication doses verified per weight-based pediatric dosing guidelines');
        interventions.push('Caregiver education and shared decision-making with parent/guardian at each visit');
        notesLines.push('Pediatric considerations applied: coordinate with parents/guardians, use age-appropriate validated tools for assessment, and ensure immunization schedule is current per ACIP.');
      }

      // Refine by gender
      if (cpGender === 'Female' && cpCondition !== 'prenatal') {
        interventions.push('Screen for pregnancy/reproductive planning before initiating teratogenic medications (ACEi, ARBs, statins, warfarin)');
        if (cpAge.includes('Adult') || cpAge.includes('Young')) {
          interventions.push('Cervical cancer screening per USPSTF schedule; breast cancer screening (mammogram) starting age 40');
        }
      }
      if (cpGender === 'Male') {
        if (cpAge.includes('Older') || cpAge.includes('Geriatric')) {
          interventions.push('Prostate health discussion and shared decision-making for PSA screening (age 55–69 per USPSTF)');
        }
      }

      // Refine by severity
      if (cpSeverity === 'Severe') {
        goals.push('Specialist evaluation and co-management within 2 weeks of plan initiation');
        interventions.push('Escalated monitoring: weekly clinical check-ins for first 4 weeks, then biweekly');
        interventions.push('Consider inpatient or intensive outpatient management if not responding to initial therapy');
        notesLines.push('Severity: Severe — use more aggressive therapeutic targets, consider combination therapy early, and establish clear escalation criteria for hospitalization or subspecialist referral.');
      } else if (cpSeverity === 'Moderate') {
        interventions.push('Clinical review every 2–4 weeks until condition stabilizes');
        notesLines.push('Severity: Moderate — standard pharmacologic and lifestyle interventions; reassess in 4–6 weeks and step up if insufficient response.');
      } else if (cpSeverity === 'Mild') {
        notesLines.push('Severity: Mild — lifestyle modifications (diet, exercise, stress reduction) are first-line. Reassess in 3 months before escalating to pharmacotherapy unless otherwise indicated.');
      }

      // Refine by comorbidities
      if (cpComorbidities.includes('Diabetes') && cpCondition !== 'diabetes') {
        interventions.push('HbA1c monitoring every 3 months until at target, then every 6 months');
        goals.push('Maintain HbA1c < 7.0% (individualize based on age, hypoglycemia risk, and comorbidities)');
        notesLines.push('Diabetes comorbidity: screen for diabetic nephropathy (annual UACR), retinopathy (annual dilated eye exam), and neuropathy (annual foot exam). Adjust medication choices to favor agents with cardiorenal benefits (SGLT2i, GLP-1 RA) where applicable.');
      }
      if (cpComorbidities.includes('Hypertension') && cpCondition !== 'hypertension') {
        interventions.push('Home blood pressure monitoring with morning/evening log; in-clinic BP check at each visit');
        goals.push('Maintain BP < 130/80 mmHg consistently');
      }
      if (cpComorbidities.includes('Obesity')) {
        interventions.push('Weight management: medical nutrition therapy with dietitian, consider GLP-1 RA or bariatric referral if BMI ≥ 40 or ≥ 35 with comorbidities');
        goals.push('Achieve ≥ 5–10% total body weight reduction within 6 months');
      }
      if (cpComorbidities.includes('CKD') && cpCondition !== 'ckd') {
        interventions.push('Quarterly renal function monitoring: creatinine, eGFR, UACR, electrolytes');
        interventions.push('Dose-adjust all renally cleared medications per current eGFR');
        notesLines.push('CKD comorbidity: avoid NSAIDs and nephrotoxic agents. Prefer ACEi/ARB for renoprotection. Consider SGLT2i if eGFR ≥ 20 mL/min/1.73 m².');
      }
      if (cpComorbidities.includes('COPD')) {
        interventions.push('Pulmonary function tests (spirometry) at baseline and annually');
        interventions.push('Annual influenza and pneumococcal vaccination per ACIP schedule');
        goals.push('Maintain SpO2 ≥ 88% at rest; FEV1 stability per GOLD classification');
        notesLines.push('COPD comorbidity: avoid non-selective beta-blockers (use cardioselective if indicated). Ensure rescue inhaler available. Screen for osteoporosis if chronic corticosteroid use.');
      }
      if (cpComorbidities.includes('Heart Failure')) {
        interventions.push('Daily weight monitoring; report gain > 2 lbs/day or > 5 lbs/week to care team');
        interventions.push('Optimize GDMT: ACEi/ARB/ARNI, beta-blocker, MRA, SGLT2i as tolerated');
        goals.push('Achieve euvolemic status with stable weight and no peripheral edema');
        goals.push('Maintain sodium restriction < 2,000 mg/day and fluid restriction if indicated');
        notesLines.push('Heart failure comorbidity: classify per NYHA functional class. Avoid NSAIDs, thiazolidinediones, and non-DHP CCBs (diltiazem/verapamil) in HFrEF. Referral for CRT/ICD evaluation if EF ≤ 35%.');
      }
      if (cpComorbidities.includes('Depression')) {
        interventions.push('PHQ-9 screening at each clinical visit; consider GAD-7 for comorbid anxiety');
        interventions.push('Behavioral health referral for psychotherapy (CBT) if PHQ-9 ≥ 10');
        goals.push('Achieve ≥ 50% reduction in PHQ-9 score within 3 months of treatment initiation');
        notesLines.push('Depression comorbidity: untreated depression impairs self-management adherence. Coordinate with behavioral health. Avoid medications that may worsen depressive symptoms.');
      }

      setCpPlanName(tpl.name);
      setCpSpecialty(tpl.specialty);
      setCpDuration(tpl.duration);
      setCpGoals(goals);
      setCpInterventions(interventions);
      setCpNotes(notesLines.join('\n'));
      setCpAiProcessing(false);
      setCpAiGenerated(true);
      showToast('AI care plan generated — review and customize before saving', 'success');
    }, 2500);
  };

  const handleCpReset = () => {
    setCpCondition('');
    setCpGender('');
    setCpAge('');
    setCpSeverity('');
    setCpComorbidities([]);
    setCpAiGenerated(false);
    setCpGoals([]);
    setCpInterventions([]);
    setCpNotes('');
    setCpPlanName('');
    setCpSpecialty('');
    setCpDuration('');
    setCpNewGoal('');
    setCpNewIntervention('');
  };

  const handleCpSave = () => {
    if (!cpPlanName || cpGoals.length === 0) {
      showToast('Plan must have a name and at least one goal', 'info');
      return;
    }
    showToast(`Care Plan "${cpPlanName}" created for ${currentPatient?.patientName ?? 'patient'}`, 'success');
    handleCpReset();
  };

  const toggleCpComorbidity = (c: string) => {
    setCpComorbidities(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
  };

  const cpPillStyle = (active: boolean): React.CSSProperties => ({
    padding: '7px 14px',
    borderRadius: 20,
    border: active ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
    background: active ? 'var(--color-primary-light, rgba(59,130,246,0.08))' : 'var(--color-surface)',
    color: active ? 'var(--color-primary)' : 'var(--color-text)',
    fontSize: 12,
    fontWeight: active ? 700 : 500,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    transition: 'all 0.15s ease',
    whiteSpace: 'nowrap',
  });

  const cpSectionTitle: React.CSSProperties = {
    fontSize: 12, fontWeight: 700, color: 'var(--color-text-muted)',
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6,
  };

  const renderCarePlanPanel = () => (
    <div style={styles.panel}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* AI Assistant Header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 16px', borderRadius: 10,
          background: 'linear-gradient(135deg, rgba(139,92,246,0.06), rgba(59,130,246,0.06))',
          border: '1px solid rgba(139,92,246,0.15)',
        }}>
          <Bot size={20} style={{ color: '#7c3aed' }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#6d28d9' }}>AI Care Plan Assistant</div>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
              Select a condition and refine with patient context for tailored suggestions
            </div>
          </div>
          {cpAiGenerated && (
            <button
              onClick={handleCpReset}
              style={{
                ...styles.btnSecondary, padding: '6px 12px', fontSize: 11,
                borderColor: 'rgba(139,92,246,0.3)', color: '#7c3aed',
              }}
            >
              <RefreshCw size={12} /> Reset
            </button>
          )}
        </div>

        {/* Condition Selection */}
        <div>
          <div style={cpSectionTitle}><Target size={12} /> Condition</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {CP_CONDITION_OPTIONS.map(opt => (
              <button
                key={opt.key}
                style={cpPillStyle(cpCondition === opt.key)}
                onClick={() => { setCpCondition(cpCondition === opt.key ? '' : opt.key); setCpAiGenerated(false); }}
              >
                <span>{opt.icon}</span> {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Refinement Filters */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16,
          padding: '14px 16px', background: 'var(--color-background)', borderRadius: 10,
          border: '1px solid var(--color-border)',
        }}>
          {/* Gender */}
          <div>
            <div style={cpSectionTitle}><User size={12} /> Gender</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {CP_GENDER_OPTIONS.map(g => (
                <button key={g} style={cpPillStyle(cpGender === g)} onClick={() => setCpGender(cpGender === g ? '' : g)}>
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Age Bracket */}
          <div>
            <div style={cpSectionTitle}><Clock size={12} /> Age Bracket</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {CP_AGE_OPTIONS.map(a => (
                <button key={a} style={cpPillStyle(cpAge === a)} onClick={() => setCpAge(cpAge === a ? '' : a)}>
                  {a}
                </button>
              ))}
            </div>
          </div>

          {/* Severity */}
          <div>
            <div style={cpSectionTitle}><AlertTriangle size={12} /> Severity</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {CP_SEVERITY_OPTIONS.map(sv => (
                <button key={sv} style={cpPillStyle(cpSeverity === sv)} onClick={() => setCpSeverity(cpSeverity === sv ? '' : sv)}>
                  {sv}
                </button>
              ))}
            </div>
          </div>

          {/* Comorbidities */}
          <div>
            <div style={cpSectionTitle}><Heart size={12} /> Comorbidities</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {CP_COMORBIDITY_OPTIONS.filter(c => c.toLowerCase() !== cpCondition).map(c => (
                <button key={c} style={cpPillStyle(cpComorbidities.includes(c))} onClick={() => toggleCpComorbidity(c)}>
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <button
          style={{
            ...styles.btnPrimary, width: '100%',
            background: 'linear-gradient(135deg, #7c3aed, var(--color-primary))',
            opacity: (!cpCondition || cpAiProcessing) ? 0.5 : 1,
            pointerEvents: (!cpCondition || cpAiProcessing) ? 'none' : 'auto',
          }}
          onClick={handleCpGenerate}
          disabled={!cpCondition || cpAiProcessing}
        >
          {cpAiProcessing ? (
            <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Generating Care Plan...</>
          ) : (
            <><Sparkles size={16} /> Generate Care Plan</>
          )}
        </button>

        {/* AI Processing Indicator */}
        {cpAiProcessing && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '12px 16px', borderRadius: 8,
            background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.15)',
          }}>
            <Loader2 size={18} style={{ color: '#7c3aed', animation: 'spin 1s linear infinite' }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#7c3aed' }}>AI analyzing patient context...</div>
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                Building personalized care plan for {cpCondition ? CP_CONDITION_OPTIONS.find(c => c.key === cpCondition)?.label : 'condition'}
                {cpSeverity && ` (${cpSeverity})`}
                {cpAge && ` — ${cpAge}`}
                {cpComorbidities.length > 0 && ` + ${cpComorbidities.length} comorbidities`}
              </div>
            </div>
          </div>
        )}

        {/* AI Generated Results */}
        {cpAiGenerated && (
          <div style={{
            display: 'flex', flexDirection: 'column', gap: 16,
            borderLeft: '3px solid #8b5cf6',
            paddingLeft: 16,
          }}>
            {/* AI badge */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 12px', borderRadius: 8,
              background: 'linear-gradient(135deg, rgba(139,92,246,0.06), rgba(99,102,241,0.06))',
              border: '1px solid rgba(139,92,246,0.15)',
              fontSize: 12, color: '#6d28d9', fontWeight: 600,
            }}>
              <Sparkles size={14} /> AI-generated care plan — edit fields below before saving
            </div>

            {/* Plan Name & Specialty */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ flex: 2, minWidth: 200 }}>
                <div style={cpSectionTitle}>Plan Name</div>
                <input
                  style={{ ...styles.textarea, minHeight: 40 }}
                  value={cpPlanName}
                  onChange={e => setCpPlanName(e.target.value)}
                  placeholder="Plan name..."
                />
              </div>
              <div style={{ flex: 1, minWidth: 120 }}>
                <div style={cpSectionTitle}>Specialty</div>
                <input
                  style={{ ...styles.textarea, minHeight: 40 }}
                  value={cpSpecialty}
                  onChange={e => setCpSpecialty(e.target.value)}
                  placeholder="Specialty..."
                />
              </div>
              <div style={{ flex: 1, minWidth: 100 }}>
                <div style={cpSectionTitle}>Duration</div>
                <input
                  style={{ ...styles.textarea, minHeight: 40 }}
                  value={cpDuration}
                  onChange={e => setCpDuration(e.target.value)}
                  placeholder="e.g. 6 months"
                />
              </div>
            </div>

            {/* Goals */}
            <div>
              <div style={cpSectionTitle}><Target size={12} /> Goals ({cpGoals.length})</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {cpGoals.map((g, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '8px 12px', borderRadius: 8,
                    background: 'var(--color-background)', border: '1px solid var(--color-border)',
                    fontSize: 13,
                  }}>
                    <CheckCircle2 size={14} style={{ color: 'var(--color-success)', flexShrink: 0 }} />
                    <input
                      style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 13, color: 'var(--color-text)', outline: 'none', fontFamily: 'inherit' }}
                      value={g}
                      onChange={e => { const n = [...cpGoals]; n[i] = e.target.value; setCpGoals(n); }}
                    />
                    <button
                      onClick={() => setCpGoals(cpGoals.filter((_, idx) => idx !== i))}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: 'var(--color-text-muted)' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    style={{ ...styles.textarea, minHeight: 36, flex: 1, fontSize: 12 }}
                    value={cpNewGoal}
                    onChange={e => setCpNewGoal(e.target.value)}
                    placeholder="Add a goal..."
                    onKeyDown={e => { if (e.key === 'Enter' && cpNewGoal.trim()) { setCpGoals([...cpGoals, cpNewGoal.trim()]); setCpNewGoal(''); } }}
                  />
                  <button
                    style={{ ...styles.btnSecondary, padding: '6px 12px', fontSize: 12 }}
                    onClick={() => { if (cpNewGoal.trim()) { setCpGoals([...cpGoals, cpNewGoal.trim()]); setCpNewGoal(''); } }}
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Interventions */}
            <div>
              <div style={cpSectionTitle}><Activity size={12} /> Interventions ({cpInterventions.length})</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {cpInterventions.map((iv, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '8px 12px', borderRadius: 8,
                    background: 'var(--color-background)', border: '1px solid var(--color-border)',
                    fontSize: 13,
                  }}>
                    <ClipboardList size={14} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                    <input
                      style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 13, color: 'var(--color-text)', outline: 'none', fontFamily: 'inherit' }}
                      value={iv}
                      onChange={e => { const n = [...cpInterventions]; n[i] = e.target.value; setCpInterventions(n); }}
                    />
                    <button
                      onClick={() => setCpInterventions(cpInterventions.filter((_, idx) => idx !== i))}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: 'var(--color-text-muted)' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    style={{ ...styles.textarea, minHeight: 36, flex: 1, fontSize: 12 }}
                    value={cpNewIntervention}
                    onChange={e => setCpNewIntervention(e.target.value)}
                    placeholder="Add an intervention..."
                    onKeyDown={e => { if (e.key === 'Enter' && cpNewIntervention.trim()) { setCpInterventions([...cpInterventions, cpNewIntervention.trim()]); setCpNewIntervention(''); } }}
                  />
                  <button
                    style={{ ...styles.btnSecondary, padding: '6px 12px', fontSize: 12 }}
                    onClick={() => { if (cpNewIntervention.trim()) { setCpInterventions([...cpInterventions, cpNewIntervention.trim()]); setCpNewIntervention(''); } }}
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <div style={cpSectionTitle}><FileSignature size={12} /> AI Notes & Recommendations</div>
              <textarea
                style={{ ...styles.textarea, minHeight: 80, fontSize: 12, borderLeft: '3px solid #8b5cf6', background: 'rgba(139,92,246,0.02)' }}
                value={cpNotes}
                onChange={e => setCpNotes(e.target.value)}
                placeholder="Clinical notes..."
              />
            </div>

            {/* Save Actions */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button style={{ ...styles.btnPrimary, flex: 1 }} onClick={handleCpSave}>
                <Save size={16} /> Create Care Plan
              </button>
              <button style={{ ...styles.btnSecondary }} onClick={handleCpReset}>
                <X size={16} /> Discard
              </button>
            </div>
          </div>
        )}

        {/* Empty state when no AI content yet */}
        {!cpAiGenerated && !cpAiProcessing && (
          <div style={{
            textAlign: 'center', padding: '20px 16px',
            color: 'var(--color-text-muted)', fontSize: 13,
          }}>
            <ClipboardPlus size={32} style={{ marginBottom: 8, opacity: 0.3 }} />
            <div>Select a condition and click "Generate" to create an AI-assisted care plan</div>
            <div style={{ fontSize: 11, marginTop: 4 }}>Refinement filters help personalize the plan for this patient</div>
          </div>
        )}
      </div>
    </div>
  );

  const contentByTab: Record<TabKey, () => ReactNode> = {
    soap: renderSoapPanel,
    transcriber: renderTranscriberPanel,
    cdss: renderCdssPanel,
    orders: renderOrdersPanel,
    prescriptions: renderPrescriptionsPanel,
    careplan: renderCarePlanPanel,
    chart: renderChartPanel,
  };

  const actionBar = (
    <div style={styles.actionBar}>
      {/* Primary actions — always full-width row */}
      <div style={styles.actionRow}>
        <button style={styles.btnPrimary} onClick={handleSignAndClose}>
          <FileSignature size={16} /> Sign & Close
        </button>
        <button style={styles.btnSecondary} onClick={handleSaveDraft}>
          <Save size={16} /> Save Draft
        </button>
      </div>
      {/* Secondary actions — 2-col auto-flow grid */}
      <div style={styles.actionRow}>
        <button style={styles.btnSecondary} onClick={handleReferPatient}>
          <Send size={16} /> Refer Patient
        </button>
        {labsEnabled && (
          <button style={styles.btnSecondary} onClick={() => setActiveTab('orders')}>
            <ClipboardList size={16} /> Order Labs
          </button>
        )}
        <button style={styles.btnSecondary} onClick={() => setActiveTab('prescriptions')}>
          <Pill size={16} /> e-Prescribe
        </button>
        {carePlansEnabled && (
          <button style={styles.btnSecondary} onClick={() => setActiveTab('careplan')}>
            <ClipboardPlus size={16} /> Care Plan
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div style={styles.root}>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      {/* Patient Header Bar */}
      <div style={styles.header}>
        <div style={styles.headerRow}>
          <div>
            <div style={styles.patientName}>{currentPatient.patientName}</div>
            <div style={styles.patientMeta}>
              ID: {currentPatient.patientId} · {profile.age} · {profile.gender} · {patientPrescriptions.length} active meds
              {tenant.features.philHealth && ' · PhilHealth Active'}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={styles.badge}>In Session</span>
            <span style={{
              fontSize: 12, fontWeight: 600, padding: '5px 10px', borderRadius: 8,
              background: encounterElapsed > 1200 ? 'rgba(239,68,68,0.08)' : 'var(--color-background)',
              color: encounterElapsed > 1200 ? 'var(--color-error)' : 'var(--color-text-muted)',
              fontVariantNumeric: 'tabular-nums', display: 'flex', alignItems: 'center', gap: 4,
            }}>
              <Clock size={12} /> {formatElapsed(encounterElapsed)}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {profile.allergies.length > 0
            ? profile.allergies.map((a) => <span key={a} style={styles.allergyBadge}>{a}</span>)
            : <span style={{ ...styles.allergyBadge, background: 'rgba(34,197,94,0.10)', color: '#15803d' }}>NKDA</span>}
          {tenant.features.philHealth && (
            <span
              style={{
                ...styles.allergyBadge,
                background: 'rgba(59, 130, 246, 0.12)',
                color: 'var(--color-info)',
              }}
            >
              PhilHealth
            </span>
          )}
        </div>
        {currentPatient?.chiefComplaint && (
          <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 4 }}>
            <strong style={{ color: 'var(--color-text)', fontWeight: 600 }}>CC:</strong> {currentPatient.chiefComplaint}
          </div>
        )}
      </div>

      {/* Layout: mobile = tabbed, desktop = multi-column */}
      {isDesktop ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 24,
            flex: 1,
            alignItems: 'start',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {tabList}
            {contentByTab[effectiveTab]()}
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
              position: 'sticky',
              top: 24,
            }}
          >
            {hasCDSS && effectiveTab !== 'cdss' && activeAlerts.length > 0 && (
              <div style={styles.panel}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>
                  Alerts ({activeAlerts.length})
                </div>
                {activeAlerts.slice(0, 2).map((a) => (
                  <div
                    key={a.id}
                    style={{
                      padding: 12,
                      borderRadius: 8,
                      marginBottom: 8,
                      borderLeft: `3px solid ${getSeverityStyle(a.severity)}`,
                      background: 'var(--color-background)',
                      fontSize: 13,
                    }}
                  >
                    <div style={{ fontWeight: 600 }}>{a.title}</div>
                    <div style={{ color: 'var(--color-text-muted)', marginTop: 3 }}>{a.message}</div>
                    <button
                      style={{ marginTop: 8, fontSize: 12, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)' }}
                      onClick={() => dismissAlert(a.id)}
                    >
                      Dismiss
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div style={styles.panel}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Quick Actions</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button style={styles.btnPrimary} onClick={handleSignAndClose}>
                  <CheckCircle2 size={16} /> Sign & Close
                </button>
                <button style={styles.btnSecondary} onClick={handleSaveDraft}>
                  <Save size={16} /> Save Draft
                </button>
                <button style={styles.btnSecondary} onClick={handleReferPatient}>
                  <Send size={16} /> Refer Patient
                </button>
                {labsEnabled && (
                  <button style={styles.btnSecondary} onClick={() => setActiveTab('orders')}>
                    <ClipboardList size={16} /> Order Labs
                  </button>
                )}
                <button style={styles.btnSecondary} onClick={() => setActiveTab('prescriptions')}>
                  <Pill size={16} /> e-Prescribe
                </button>
                {carePlansEnabled && (
                  <button style={styles.btnSecondary} onClick={() => setActiveTab('careplan')}>
                    <ClipboardPlus size={16} /> Care Plan
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {tabList}
          <div style={{ flex: 1 }}>{contentByTab[effectiveTab]()}</div>
          {actionBar}
        </>
      )}

      {/* ═══ CDSS Warning Confirmation Modal ═══ */}
      {showCdssConfirm && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.5)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', padding: 20,
          }}
          onClick={() => setShowCdssConfirm(false)}
        >
          <div
            style={{
              background: 'var(--color-surface)', borderRadius: 16, maxWidth: 480, width: '100%',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              animation: 'fadeInUp 0.2s ease',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{
              padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 12,
              background: 'rgba(245, 158, 11, 0.08)',
              borderBottom: '1px solid rgba(245, 158, 11, 0.15)',
            }}>
              <AlertTriangle size={22} style={{ color: 'var(--color-warning-dark)', flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 16, color: '#92400e' }}>
                  Unreviewed CDSS Alerts
                </div>
                <div style={{ fontSize: 13, color: '#b45309', marginTop: 2 }}>
                  {activeAlerts.length} alert{activeAlerts.length !== 1 ? 's' : ''} require{activeAlerts.length === 1 ? 's' : ''} your attention
                </div>
              </div>
              <button
                onClick={() => setShowCdssConfirm(false)}
                style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
              >
                <X size={18} style={{ color: 'var(--color-text-muted)' }} />
              </button>
            </div>

            {/* Alert summary */}
            <div style={{ padding: '16px 20px', maxHeight: 220, overflowY: 'auto' }}>
              {activeAlerts.map((a) => (
                <div key={a.id} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                  padding: '10px 12px', borderRadius: 8, marginBottom: 6,
                  borderLeft: `3px solid ${getSeverityStyle(a.severity)}`,
                  background: 'var(--color-background)',
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <span style={{ ...getSeverityBadgeStyle(a.severity), whiteSpace: 'nowrap' }}>{a.severity}</span>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{a.title}</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 3 }}>{a.message}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div style={{ padding: '14px 20px', borderTop: '1px solid var(--color-border)', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button
                style={{
                  ...styles.btnSecondary, flex: 1, justifyContent: 'center',
                  minWidth: 140,
                }}
                onClick={() => {
                  setShowCdssConfirm(false);
                  setActiveTab('cdss');
                }}
              >
                <AlertTriangle size={14} /> Review Alerts
              </button>
              <button
                style={{
                  ...styles.btnPrimary, flex: 1, justifyContent: 'center',
                  background: 'var(--color-warning-dark)', minWidth: 140,
                }}
                onClick={() => {
                  setShowCdssConfirm(false);
                  if (signAction) performSign(signAction);
                  setSignAction(null);
                }}
              >
                <FileSignature size={14} /> Sign Anyway
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Signed Note View Modal ═══ */}
      {showSignedNote && signedNoteSnapshot && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.5)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', padding: 20,
          }}
          onClick={() => setShowSignedNote(false)}
        >
          <div
            style={{
              background: 'var(--color-surface)', borderRadius: 16, maxWidth: 600, width: '100%',
              maxHeight: '85vh', display: 'flex', flexDirection: 'column',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              animation: 'fadeInUp 0.2s ease',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{
              padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              borderBottom: '1px solid var(--color-border)', flexShrink: 0,
            }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CheckCircle2 size={18} style={{ color: 'var(--color-success)' }} />
                  Signed Clinical Note
                </div>
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>
                  {currentPatient?.patientName} · {signedTimestamp}
                  {signedNoteSnapshot.aiGenerated && (
                    <span style={{ marginLeft: 8, fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 4, background: 'rgba(139,92,246,0.1)', color: 'var(--color-purple-dark)' }}>
                      AI-Assisted
                    </span>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  style={{ ...styles.btnSecondary, padding: '8px 12px', fontSize: 12 }}
                  onClick={() => {
                    const text = `SOAP Note — ${currentPatient?.patientName}\nSigned: ${signedTimestamp}\n\n` +
                      `SUBJECTIVE:\n${signedNoteSnapshot.subjective?.trim()}\n\n` +
                      `OBJECTIVE:\n${signedNoteSnapshot.objective?.trim()}\n\n` +
                      `ASSESSMENT:\n${signedNoteSnapshot.assessment?.trim()}\n\n` +
                      `PLAN:\n${signedNoteSnapshot.plan?.trim()}` +
                      (signedNoteSnapshot.icdCodes?.length ? `\n\nICD-10: ${signedNoteSnapshot.icdCodes.join(', ')}` : '');
                    navigator.clipboard.writeText(text);
                    showToast('Signed note copied to clipboard', 'success');
                  }}
                >
                  <Copy size={14} /> Copy
                </button>
                <button
                  onClick={() => setShowSignedNote(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
                >
                  <X size={18} style={{ color: 'var(--color-text-muted)' }} />
                </button>
              </div>
            </div>

            {/* Note body */}
            <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
              {/* CDSS alerts that were active at signing time */}
              {activeAlerts.length > 0 && (
                <div style={{
                  padding: '10px 14px', borderRadius: 8, marginBottom: 16,
                  background: 'rgba(245, 158, 11, 0.08)',
                  border: '1px solid rgba(245, 158, 11, 0.2)',
                  fontSize: 12, color: '#92400e',
                }}>
                  <div style={{ fontWeight: 700, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <AlertTriangle size={14} /> Note: {activeAlerts.length} CDSS alert{activeAlerts.length !== 1 ? 's were' : ' was'} active at signing
                  </div>
                  {activeAlerts.map((a) => (
                    <div key={a.id} style={{ marginTop: 4, paddingLeft: 20 }}>
                      • <strong>{a.severity.toUpperCase()}</strong>: {a.title}
                    </div>
                  ))}
                </div>
              )}

              {(['S', 'O', 'A', 'P'] as SoapSection[]).map((letter) => {
                const labels = { S: 'Subjective', O: 'Objective', A: 'Assessment', P: 'Plan' };
                const fields = { S: 'subjective', O: 'objective', A: 'assessment', P: 'plan' } as const;
                const content = signedNoteSnapshot[fields[letter]] as string || '';
                return (
                  <div key={letter} style={{ marginBottom: 18 }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6,
                    }}>
                      <span style={{
                        ...(styles[`soapLetter${letter}` as keyof typeof styles] as React.CSSProperties),
                        width: 22, height: 22, fontSize: 11,
                      }}>
                        {letter}
                      </span>
                      <span style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text)' }}>
                        {labels[letter]}
                      </span>
                    </div>
                    <div style={{
                      fontSize: 13, lineHeight: 1.7, color: 'var(--color-text)',
                      whiteSpace: 'pre-wrap', padding: '10px 14px',
                      background: 'var(--color-background)', borderRadius: 8,
                      border: '1px solid var(--color-border)',
                    }}>
                      {content.trim() || '(empty)'}
                    </div>
                  </div>
                );
              })}

              {(signedNoteSnapshot.icdCodes?.length ?? 0) > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>ICD-10 Codes</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {signedNoteSnapshot.icdCodes!.map((code) => (
                      <span key={code} style={styles.icdChip}>{code}</span>
                    ))}
                  </div>
                </div>
              )}

              <div style={{
                textAlign: 'center', padding: 12, borderRadius: 8,
                background: 'rgba(16, 185, 129, 0.06)',
                border: '1px solid rgba(16, 185, 129, 0.15)',
                color: 'var(--color-success)', fontSize: 12, fontWeight: 600,
              }}>
                Electronically signed by {currentStaff?.name ?? 'Provider'} · {signedTimestamp}
              </div>

              {/* Return to dashboard if encounter was closed */}
              {encounterClosed && (
                <button
                  style={{
                    ...styles.btnPrimary, width: '100%', marginTop: 16,
                    justifyContent: 'center', borderRadius: 12,
                  }}
                  onClick={() => navigate('/doctor')}
                >
                  <ArrowLeft size={16} /> Return to Dashboard
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {lookupDrug && <DrugInfoModal drugName={lookupDrug} onClose={() => setLookupDrug(null)} />}

      {/* ─── Referral Modal ─── */}
      {showReferralModal && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.45)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', padding: 16,
          }}
          onClick={() => setShowReferralModal(false)}
        >
          <div
            style={{
              background: '#fff', borderRadius: 'var(--radius, 12px)',
              width: '100%', maxWidth: 600, maxHeight: '85vh',
              overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
              display: 'flex', flexDirection: 'column',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{
              padding: '20px 24px 16px', borderBottom: '1px solid var(--color-border, #e5e7eb)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--color-text)' }}>Refer Patient</h3>
                <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 2 }}>
                  {currentPatient?.patientName}
                </div>
              </div>
              <button
                onClick={() => setShowReferralModal(false)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer', padding: 4,
                  color: 'var(--color-text-muted)', fontSize: 20, lineHeight: 1,
                }}
              >✕</button>
            </div>

            {/* Body */}
            <div style={{ padding: '16px 24px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Referral Type */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Referral Type</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {(['Internal', 'External'] as const).map(t => (
                    <button
                      key={t}
                      onClick={() => {
                        setReferralForm(f => ({
                          ...f, type: t,
                          facility: t === 'Internal' ? (tenant.name ?? '') : '',
                        }));
                      }}
                      style={{
                        flex: 1, padding: '8px 12px', borderRadius: 8, cursor: 'pointer',
                        fontSize: 13, fontWeight: 600, border: '1.5px solid',
                        borderColor: referralForm.type === t ? 'var(--color-primary, #2563eb)' : 'var(--color-border, #e5e7eb)',
                        background: referralForm.type === t ? 'var(--color-primary, #2563eb)' : '#fff',
                        color: referralForm.type === t ? '#fff' : 'var(--color-text)',
                        transition: 'all 0.15s',
                      }}
                    >{t}</button>
                  ))}
                </div>
              </div>

              {/* Urgency */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Urgency</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {([
                    { value: 'Routine' as const, color: '#6b7280', bg: '#f3f4f6' },
                    { value: 'Urgent' as const, color: '#d97706', bg: '#fffbeb' },
                    { value: 'Emergent' as const, color: '#dc2626', bg: '#fef2f2' },
                  ]).map(u => (
                    <button
                      key={u.value}
                      onClick={() => setReferralForm(f => ({ ...f, urgency: u.value }))}
                      style={{
                        flex: 1, padding: '8px 12px', borderRadius: 8, cursor: 'pointer',
                        fontSize: 13, fontWeight: 600, border: '1.5px solid',
                        borderColor: referralForm.urgency === u.value ? u.color : 'var(--color-border, #e5e7eb)',
                        background: referralForm.urgency === u.value ? u.bg : '#fff',
                        color: referralForm.urgency === u.value ? u.color : 'var(--color-text-muted)',
                        transition: 'all 0.15s',
                      }}
                    >{u.value}</button>
                  ))}
                </div>
              </div>

              {/* Specialty */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Specialty *</label>
                <select
                  value={referralForm.specialty}
                  onChange={e => setReferralForm(f => ({ ...f, specialty: e.target.value, doctorId: '' }))}
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: 8, fontSize: 13,
                    border: '1.5px solid var(--color-border, #e5e7eb)', background: '#fff',
                    color: referralForm.specialty ? 'var(--color-text)' : 'var(--color-text-muted)',
                    outline: 'none', cursor: 'pointer',
                  }}
                >
                  <option value="">Select specialty...</option>
                  {REFERRAL_SPECIALTIES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Referred To Doctor */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Referred To Doctor</label>
                <select
                  value={referralForm.doctorId}
                  onChange={e => setReferralForm(f => ({ ...f, doctorId: e.target.value }))}
                  disabled={!referralForm.specialty}
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: 8, fontSize: 13,
                    border: '1.5px solid var(--color-border, #e5e7eb)', background: !referralForm.specialty ? '#f9fafb' : '#fff',
                    color: referralForm.doctorId ? 'var(--color-text)' : 'var(--color-text-muted)',
                    outline: 'none', cursor: referralForm.specialty ? 'pointer' : 'not-allowed',
                  }}
                >
                  {!referralForm.specialty ? (
                    <option value="">Select specialty first</option>
                  ) : availableDoctors.length === 0 ? (
                    <option value="">No doctors found for this specialty</option>
                  ) : (
                    <>
                      <option value="">Select doctor (optional)...</option>
                      {availableDoctors.map(d => (
                        <option key={d.id} value={d.id}>{d.name}{d.specialty ? ` — ${d.specialty}` : ''}</option>
                      ))}
                    </>
                  )}
                </select>
              </div>

              {/* Facility */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Facility</label>
                <input
                  type="text"
                  value={referralForm.facility}
                  onChange={e => setReferralForm(f => ({ ...f, facility: e.target.value }))}
                  placeholder="Facility name (optional)"
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: 8, fontSize: 13,
                    border: '1.5px solid var(--color-border, #e5e7eb)', background: '#fff',
                    color: 'var(--color-text)', outline: 'none', boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Reason */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Reason for Referral *</label>
                <textarea
                  value={referralForm.reason}
                  onChange={e => setReferralForm(f => ({ ...f, reason: e.target.value }))}
                  rows={3}
                  placeholder="Describe the reason for referral..."
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: 8, fontSize: 13,
                    border: '1.5px solid var(--color-border, #e5e7eb)', background: '#fff',
                    color: 'var(--color-text)', outline: 'none', resize: 'vertical',
                    fontFamily: 'inherit', boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Clinical Summary */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Clinical Summary</label>
                <textarea
                  value={referralForm.clinicalSummary}
                  onChange={e => setReferralForm(f => ({ ...f, clinicalSummary: e.target.value }))}
                  rows={4}
                  placeholder="Clinical context, relevant history, findings..."
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: 8, fontSize: 13,
                    border: '1.5px solid var(--color-border, #e5e7eb)', background: '#fff',
                    color: 'var(--color-text)', outline: 'none', resize: 'vertical',
                    fontFamily: 'inherit', boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Diagnosis + ICD row */}
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 2 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Diagnosis</label>
                  <input
                    type="text"
                    value={referralForm.diagnosis}
                    onChange={e => setReferralForm(f => ({ ...f, diagnosis: e.target.value }))}
                    placeholder="e.g. Essential Hypertension"
                    style={{
                      width: '100%', padding: '10px 12px', borderRadius: 8, fontSize: 13,
                      border: '1.5px solid var(--color-border, #e5e7eb)', background: '#fff',
                      color: 'var(--color-text)', outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>ICD Code</label>
                  <input
                    type="text"
                    value={referralForm.icdCode}
                    onChange={e => setReferralForm(f => ({ ...f, icdCode: e.target.value }))}
                    placeholder="e.g. I10"
                    style={{
                      width: '100%', padding: '10px 12px', borderRadius: 8, fontSize: 13,
                      border: '1.5px solid var(--color-border, #e5e7eb)', background: '#fff',
                      color: 'var(--color-text)', outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{
              padding: '16px 24px', borderTop: '1px solid var(--color-border, #e5e7eb)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <button
                onClick={() => setShowReferralModal(false)}
                style={{
                  padding: '10px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                  border: '1.5px solid var(--color-border, #e5e7eb)', background: '#fff',
                  color: 'var(--color-text)', cursor: 'pointer',
                }}
              >Cancel</button>
              <button
                onClick={submitReferral}
                disabled={!referralForm.specialty || !referralForm.reason}
                style={{
                  padding: '10px 24px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                  border: 'none', cursor: (!referralForm.specialty || !referralForm.reason) ? 'not-allowed' : 'pointer',
                  background: (!referralForm.specialty || !referralForm.reason) ? '#d1d5db' : 'var(--color-primary, #2563eb)',
                  color: '#fff', transition: 'all 0.15s',
                  opacity: (!referralForm.specialty || !referralForm.reason) ? 0.6 : 1,
                }}
              >Submit Referral</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
