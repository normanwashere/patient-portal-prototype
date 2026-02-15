import React, { useState } from 'react';
import {
    FileText, Calendar, User, Download, Search, X, Printer,
    Stethoscope, Syringe, FlaskConical, ScanLine, ClipboardList,
    Activity, AlertTriangle, CheckCircle2, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { BackButton } from '../components/Common/BackButton';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../theme/ThemeContext';
import './MedicalHistory.css';

/* ───────── Types ───────── */

type RecordType = 'all' | 'consultation' | 'procedure' | 'lab' | 'imaging' | 'discharge';

interface VitalSigns {
    bp: string;
    hr: string;
    temp: string;
    rr: string;
    o2sat: string;
    weight?: string;
    height?: string;
}

interface SOAPNotes {
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
}

interface Diagnosis {
    code: string;
    description: string;
}

interface ConsultationDetail {
    soap: SOAPNotes;
    vitals: VitalSigns;
    diagnoses: Diagnosis[];
    doctorNotes: string;
}

interface ProcedureDetail {
    procedureName: string;
    indication: string;
    findings: string;
    preOpNotes: string;
    postOpNotes: string;
    performingDoctor: string;
    anesthesia?: string;
    facility: string;
}

interface LabResult {
    testName: string;
    value: string;
    unit: string;
    referenceRange: string;
    flag: 'normal' | 'high' | 'low' | 'critical';
}

interface LabDetail {
    results: LabResult[];
    orderingDoctor: string;
    specimenType: string;
    collectionDate: string;
    notes?: string;
}

interface ImagingDetail {
    modality: string;
    bodyPart: string;
    reportText: string;
    findings: string;
    impression: string;
    radiologist: string;
    technique?: string;
}

interface DischargeMedication {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
}

interface DischargeDetail {
    admissionDate: string;
    dischargeDate: string;
    summary: string;
    dischargeDiagnosis: string;
    medications: DischargeMedication[];
    followUp: string[];
    attendingDoctor: string;
}

type RecordDetail =
    | { kind: 'consultation'; data: ConsultationDetail }
    | { kind: 'procedure'; data: ProcedureDetail }
    | { kind: 'lab'; data: LabDetail }
    | { kind: 'imaging'; data: ImagingDetail }
    | { kind: 'discharge'; data: DischargeDetail };

interface MedicalRecord {
    id: string;
    type: 'consultation' | 'procedure' | 'lab' | 'imaging' | 'discharge';
    title: string;
    date: string;
    doctor: string;
    facility: string;
    summary: string;
    detail: RecordDetail;
}

/* ───────── Mock Data ───────── */

const MOCK_RECORDS: MedicalRecord[] = [
    {
        id: '1',
        type: 'consultation',
        title: 'General Consultation',
        date: 'Jan 28, 2026',
        doctor: 'Dr. Jennifer Diaz',
        facility: 'MedFirst Wellness Center, Makati',
        summary: 'Routine checkup. BP 120/80. No significant findings.',
        detail: {
            kind: 'consultation',
            data: {
                soap: {
                    subjective: 'Patient presents for annual physical exam. No new complaints. Denies chest pain, shortness of breath, palpitations. Reports occasional tension headache relieved by paracetamol. Sleeping well, 7–8 hrs/night. No recent weight changes.',
                    objective: 'General: Well-nourished, well-developed, no acute distress. HEENT: Anicteric sclerae, pink palpebral conjunctivae, no cervical lymphadenopathy. Lungs: Clear breath sounds bilaterally. Heart: Regular rate and rhythm, no murmurs. Abdomen: Soft, non-tender, normoactive bowel sounds. Extremities: No edema.',
                    assessment: 'Healthy adult presenting for routine annual physical examination. No acute or chronic medical concerns identified at this time. BMI within normal range.',
                    plan: '1. Continue healthy lifestyle and balanced diet.\n2. Encouraged 150 minutes of moderate exercise per week.\n3. Routine CBC, FBS, lipid panel ordered.\n4. Return for follow-up in 12 months or sooner if concerns arise.'
                },
                vitals: { bp: '120/80 mmHg', hr: '72 bpm', temp: '36.6°C', rr: '16 breaths/min', o2sat: '98%', weight: '65 kg', height: '163 cm' },
                diagnoses: [
                    { code: 'Z00.00', description: 'Encounter for general adult medical examination without abnormal findings' }
                ],
                doctorNotes: 'Patient is in good overall health. Advised to continue current diet and exercise regimen. Labs to be reviewed on next visit. No medications prescribed at this time.'
            }
        }
    },
    {
        id: '2',
        type: 'imaging',
        title: 'Chest X-Ray (PA)',
        date: 'Jan 15, 2026',
        doctor: 'Dr. Jose Reyes',
        facility: 'St. Luke\'s Medical Center, BGC',
        summary: 'Chest radiograph performed. Clear lung fields, normal heart size.',
        detail: {
            kind: 'imaging',
            data: {
                modality: 'X-Ray',
                bodyPart: 'Chest (PA view)',
                technique: 'Standard posteroanterior chest radiograph obtained with adequate inspiration and exposure.',
                reportText: 'The lungs are fully expanded and clear. There are no focal consolidations, effusions, or pneumothorax. The cardiac silhouette is within normal limits with a cardiothoracic ratio of 0.48. The mediastinal contours are normal. The bony thorax is intact.',
                findings: '• Both lung fields are clear with no infiltrates, masses, or nodules.\n• No pleural effusion or pneumothorax.\n• Cardiac silhouette is normal in size and configuration (CTR 0.48).\n• Mediastinal and hilar structures are unremarkable.\n• Both hemidiaphragms are smooth and well-defined.\n• Visualized bony structures show no acute abnormalities.',
                impression: 'Normal chest radiograph. No acute cardiopulmonary findings.',
                radiologist: 'Dr. Maria Elena Santos, MD, FPCR — Diagnostic Radiology'
            }
        }
    },
    {
        id: '3',
        type: 'consultation',
        title: 'Cardiology Follow-up',
        date: 'Dec 20, 2025',
        doctor: 'Dr. Jose Reyes',
        facility: 'Heart Station, Makati Medical Center',
        summary: 'ECG normal. Continue current medications. Stable condition.',
        detail: {
            kind: 'consultation',
            data: {
                soap: {
                    subjective: 'Patient returns for follow-up of Stage I hypertension diagnosed 6 months ago. Currently taking Losartan 50 mg daily. Denies headaches, dizziness, chest pain, or palpitations. Compliant with low-sodium diet. Walks 30 minutes daily.',
                    objective: 'General: No acute distress. CV: Regular rate and rhythm, S1/S2 distinct, no murmurs or gallops. Lungs: Clear to auscultation bilaterally. 12-lead ECG: Normal sinus rhythm, rate 68 bpm, normal axis, no ST-T changes.',
                    assessment: 'Essential (primary) hypertension, Stage I — well-controlled on current regimen. ECG within normal limits. No evidence of end-organ damage.',
                    plan: '1. Continue Losartan 50 mg once daily.\n2. Maintain low-sodium diet (<2g Na/day) and regular exercise.\n3. Home BP monitoring — target <130/80 mmHg.\n4. Repeat lipid panel and renal function in 3 months.\n5. Follow-up in 3 months.'
                },
                vitals: { bp: '128/82 mmHg', hr: '68 bpm', temp: '36.5°C', rr: '14 breaths/min', o2sat: '99%', weight: '66 kg' },
                diagnoses: [
                    { code: 'I10', description: 'Essential (primary) hypertension' }
                ],
                doctorNotes: 'Patient is responding well to anti-hypertensive therapy. Blood pressure has normalized. Will continue current dose and reassess in 3 months. Reinforced lifestyle modifications.'
            }
        }
    },
    {
        id: '4',
        type: 'procedure',
        title: 'Excision of Lipoma, Left Forearm',
        date: 'Nov 10, 2025',
        doctor: 'Dr. Rosa Lim',
        facility: 'Asian Hospital & Medical Center, Alabang',
        summary: 'Minor procedure completed successfully. Discharged same day.',
        detail: {
            kind: 'procedure',
            data: {
                procedureName: 'Excision of subcutaneous lipoma, left forearm',
                indication: 'Enlarging subcutaneous mass on the left forearm, approximately 3 cm in diameter, present for 2 years with recent growth. Patient requested removal for cosmetic reasons and to rule out malignancy.',
                findings: 'Well-encapsulated, yellowish, lobulated fatty mass measuring 3.2 × 2.8 × 1.5 cm. No evidence of invasion into surrounding tissue. Specimen sent for histopathological examination.',
                preOpNotes: 'Patient is cleared for outpatient surgery. NPO for 8 hours. Informed consent obtained. No known drug allergies. Skin prep with povidone-iodine solution.',
                postOpNotes: 'Patient tolerated procedure well. Hemostasis achieved. Wound closed in layers with 4-0 absorbable sutures (subcuticular). Sterile dressing applied. Post-op instructions: keep wound dry for 48 hrs, change dressing daily, watch for signs of infection. Follow-up in 7 days for wound check.',
                performingDoctor: 'Dr. Rosa Lim, MD, FPCS — General Surgery',
                anesthesia: 'Local anesthesia — 2% lidocaine with epinephrine',
                facility: 'Asian Hospital & Medical Center, Day Surgery Unit'
            }
        }
    },
    {
        id: '5',
        type: 'consultation',
        title: 'Dermatology Consult',
        date: 'Oct 05, 2025',
        doctor: 'Dr. Ana Cruz',
        facility: 'SkinScience Derma Clinic, Ortigas',
        summary: 'Skin assessment. Prescribed topical treatment for eczema.',
        detail: {
            kind: 'consultation',
            data: {
                soap: {
                    subjective: 'Patient complains of recurrent dry, itchy patches on both antecubital fossae and the neck, worsening for the past 3 weeks. Triggered by stress and weather changes. Uses regular soap. No known food allergies. Family history of asthma (mother).',
                    objective: 'Skin: Erythematous, scaly, lichenified plaques on bilateral antecubital fossae (approximately 4 × 3 cm each) and posterior neck (3 × 2 cm). No vesicles or weeping. No secondary infection. Nails: Normal. Hair: Normal. Rest of the skin: No other lesions.',
                    assessment: 'Atopic dermatitis (eczema), moderate severity, affecting flexural areas. No superimposed infection.',
                    plan: '1. Mometasone furoate 0.1% cream — apply thinly to affected areas twice daily for 2 weeks, then taper.\n2. Ceramide-based moisturizer — apply liberally at least twice daily.\n3. Switch to fragrance-free, hypoallergenic soap/cleanser.\n4. Avoid scratching; keep nails short.\n5. Cetirizine 10 mg at bedtime for pruritus.\n6. Follow-up in 2 weeks to assess response.'
                },
                vitals: { bp: '118/76 mmHg', hr: '74 bpm', temp: '36.5°C', rr: '16 breaths/min', o2sat: '98%' },
                diagnoses: [
                    { code: 'L20.9', description: 'Atopic dermatitis, unspecified' }
                ],
                doctorNotes: 'Moderate atopic dermatitis. Prescribed mid-potency topical corticosteroid and emollients. Advised patient on skin care routine and trigger avoidance. Will reassess in 2 weeks; may consider calcineurin inhibitor if steroid taper is needed long-term.'
            }
        }
    },
    {
        id: '6',
        type: 'lab',
        title: 'Complete Blood Count (CBC)',
        date: 'Jan 29, 2026',
        doctor: 'Dr. Jennifer Diaz',
        facility: 'MedFirst Wellness Center Laboratory, Makati',
        summary: 'Routine CBC. All values within normal range.',
        detail: {
            kind: 'lab',
            data: {
                results: [
                    { testName: 'Hemoglobin', value: '14.2', unit: 'g/dL', referenceRange: '12.0–16.0', flag: 'normal' },
                    { testName: 'Hematocrit', value: '42.5', unit: '%', referenceRange: '36.0–46.0', flag: 'normal' },
                    { testName: 'WBC Count', value: '6.8', unit: '×10³/µL', referenceRange: '4.5–11.0', flag: 'normal' },
                    { testName: 'RBC Count', value: '4.7', unit: '×10⁶/µL', referenceRange: '4.0–5.5', flag: 'normal' },
                    { testName: 'Platelet Count', value: '245', unit: '×10³/µL', referenceRange: '150–400', flag: 'normal' },
                    { testName: 'MCV', value: '88.5', unit: 'fL', referenceRange: '80–100', flag: 'normal' },
                    { testName: 'MCH', value: '29.8', unit: 'pg', referenceRange: '27–33', flag: 'normal' },
                    { testName: 'MCHC', value: '33.4', unit: 'g/dL', referenceRange: '32–36', flag: 'normal' },
                    { testName: 'Neutrophils', value: '58', unit: '%', referenceRange: '40–70', flag: 'normal' },
                    { testName: 'Lymphocytes', value: '32', unit: '%', referenceRange: '20–40', flag: 'normal' },
                ],
                orderingDoctor: 'Dr. Jennifer Diaz, MD — Internal Medicine',
                specimenType: 'Whole blood (EDTA)',
                collectionDate: 'Jan 29, 2026 — 7:30 AM',
                notes: 'All hematologic parameters within normal limits. No evidence of anemia, infection, or hematologic abnormality.'
            }
        }
    },
    {
        id: '7',
        type: 'lab',
        title: 'Lipid Panel & Fasting Blood Sugar',
        date: 'Jan 29, 2026',
        doctor: 'Dr. Jennifer Diaz',
        facility: 'MedFirst Wellness Center Laboratory, Makati',
        summary: 'LDL slightly elevated. FBS normal.',
        detail: {
            kind: 'lab',
            data: {
                results: [
                    { testName: 'Fasting Blood Sugar', value: '92', unit: 'mg/dL', referenceRange: '70–100', flag: 'normal' },
                    { testName: 'Total Cholesterol', value: '215', unit: 'mg/dL', referenceRange: '<200', flag: 'high' },
                    { testName: 'LDL Cholesterol', value: '138', unit: 'mg/dL', referenceRange: '<130', flag: 'high' },
                    { testName: 'HDL Cholesterol', value: '52', unit: 'mg/dL', referenceRange: '>40', flag: 'normal' },
                    { testName: 'Triglycerides', value: '125', unit: 'mg/dL', referenceRange: '<150', flag: 'normal' },
                    { testName: 'VLDL', value: '25', unit: 'mg/dL', referenceRange: '5–40', flag: 'normal' },
                ],
                orderingDoctor: 'Dr. Jennifer Diaz, MD — Internal Medicine',
                specimenType: 'Serum (fasting 10–12 hrs)',
                collectionDate: 'Jan 29, 2026 — 7:30 AM',
                notes: 'Borderline high total cholesterol and mildly elevated LDL. Recommend dietary modification and repeat in 3 months. Consider statin therapy if persistently elevated.'
            }
        }
    },
    {
        id: '8',
        type: 'imaging',
        title: '2D Echocardiogram',
        date: 'Dec 20, 2025',
        doctor: 'Dr. Jose Reyes',
        facility: 'Heart Station, Makati Medical Center',
        summary: 'Normal cardiac structure and function. EF 62%.',
        detail: {
            kind: 'imaging',
            data: {
                modality: '2D Echocardiography with Doppler',
                bodyPart: 'Heart',
                technique: 'Transthoracic 2D echocardiography with M-mode, spectral Doppler, and color flow Doppler imaging performed in standard views.',
                reportText: 'Normal left ventricular size with preserved systolic function. No regional wall motion abnormalities. Normal valvular structure and function. No pericardial effusion.',
                findings: '• Left ventricle: Normal cavity size (LVIDd 4.6 cm), wall thickness (IVSd 0.9 cm, LVPWd 0.9 cm). EF 62% by modified Simpson\'s.\n• Right ventricle: Normal size and function. TAPSE 2.2 cm.\n• Left atrium: Normal (3.4 cm).\n• Aortic valve: Trileaflet, no stenosis or regurgitation.\n• Mitral valve: Normal leaflets, trace physiologic regurgitation.\n• Tricuspid valve: Normal, trace regurgitation. Estimated RVSP 25 mmHg.\n• Pericardium: No effusion.',
                impression: 'Normal 2D echocardiogram. Normal LV systolic function with EF 62%. No significant valvular disease. No pericardial effusion.',
                radiologist: 'Dr. Ricardo Tan, MD, FPCC — Cardiology / Echocardiography'
            }
        }
    },
    {
        id: '9',
        type: 'discharge',
        title: 'Discharge Summary — Acute Gastroenteritis',
        date: 'Aug 18, 2025',
        doctor: 'Dr. Patricia Bautista',
        facility: 'The Medical City, Ortigas',
        summary: 'Admitted for acute gastroenteritis with dehydration. Discharged improved after 2 days.',
        detail: {
            kind: 'discharge',
            data: {
                admissionDate: 'Aug 16, 2025',
                dischargeDate: 'Aug 18, 2025',
                summary: 'Patient was admitted through the Emergency Department with a 2-day history of watery diarrhea (8–10 episodes/day), vomiting (4 episodes), crampy abdominal pain, and low-grade fever. Moderate dehydration on admission. Stool exam showed no ova or parasites. Stool culture pending. IV hydration initiated with Lactated Ringer\'s solution. Symptoms improved significantly by Day 2. Tolerating oral intake well at discharge.',
                dischargeDiagnosis: 'Acute gastroenteritis, likely viral, with moderate dehydration (ICD-10: K52.9, E86.0)',
                medications: [
                    { name: 'Oral Rehydration Salts (ORS)', dosage: '1 sachet per glass', frequency: 'After every loose stool', duration: 'Until stools normalize' },
                    { name: 'Loperamide', dosage: '2 mg', frequency: 'After each loose stool, max 8 mg/day', duration: '3 days' },
                    { name: 'Probiotics (Lactobacillus)', dosage: '1 capsule', frequency: 'Once daily', duration: '7 days' },
                    { name: 'Paracetamol', dosage: '500 mg', frequency: 'Every 6 hours as needed for fever', duration: 'As needed' },
                ],
                followUp: [
                    'Follow-up with Dr. Bautista in 5–7 days at The Medical City OPD.',
                    'Return to ER immediately if: recurrence of severe diarrhea/vomiting, bloody stools, high fever (>38.5°C), signs of dehydration (dry mouth, decreased urine output, dizziness).',
                    'Advance diet gradually — BRAT diet (bananas, rice, applesauce, toast) for 2–3 days, then regular diet as tolerated.',
                    'Drink at least 2–3 liters of fluids daily.',
                    'Stool culture results to be reviewed on follow-up visit.'
                ],
                attendingDoctor: 'Dr. Patricia Bautista, MD, FPCP — Internal Medicine'
            }
        }
    },
    {
        id: '10',
        type: 'procedure',
        title: 'Upper GI Endoscopy (EGD)',
        date: 'Jun 05, 2025',
        doctor: 'Dr. Rafael Mendoza',
        facility: 'Manila Doctors Hospital, Ermita',
        summary: 'EGD for evaluation of dyspepsia. Mild antral gastritis found.',
        detail: {
            kind: 'procedure',
            data: {
                procedureName: 'Esophagogastroduodenoscopy (EGD)',
                indication: 'Persistent dyspepsia and epigastric discomfort unresponsive to 4 weeks of proton pump inhibitor therapy. To rule out peptic ulcer disease, H. pylori infection, and upper GI pathology.',
                findings: 'Esophagus: Normal mucosa, no varices, no strictures. Z-line at 38 cm. GE Junction: Normal, no hiatal hernia. Stomach: Mild erythematous changes in the antrum suggestive of non-erosive gastritis. No ulcers or masses. Fundus and body unremarkable. Duodenum: Normal mucosa up to D2. No ulcers.\n\nBiopsy taken: Antral mucosa (2 specimens) for histopathology and CLO test (H. pylori).',
                preOpNotes: 'Patient fasted for 8 hours. IV access established. Consent signed. Throat anesthetized with lidocaine spray. Medications: Midazolam 2 mg IV, Fentanyl 50 mcg IV for conscious sedation.',
                postOpNotes: 'Procedure completed without complications. Duration: 12 minutes. Patient recovered in the endoscopy suite for 30 minutes. Vital signs stable. Tolerated sips of water. Discharged with companion. Advised soft diet for 24 hours. Biopsy results expected in 5–7 working days.',
                performingDoctor: 'Dr. Rafael Mendoza, MD, FPSG — Gastroenterology',
                anesthesia: 'Conscious sedation (Midazolam 2 mg + Fentanyl 50 mcg IV)',
                facility: 'Manila Doctors Hospital, Endoscopy Unit'
            }
        }
    },
    {
        id: '11',
        type: 'lab',
        title: 'Urinalysis',
        date: 'Jan 29, 2026',
        doctor: 'Dr. Jennifer Diaz',
        facility: 'MedFirst Wellness Center Laboratory, Makati',
        summary: 'Routine urinalysis. Normal findings.',
        detail: {
            kind: 'lab',
            data: {
                results: [
                    { testName: 'Color', value: 'Yellow', unit: '', referenceRange: 'Yellow', flag: 'normal' },
                    { testName: 'Transparency', value: 'Clear', unit: '', referenceRange: 'Clear', flag: 'normal' },
                    { testName: 'pH', value: '6.0', unit: '', referenceRange: '4.5–8.0', flag: 'normal' },
                    { testName: 'Specific Gravity', value: '1.020', unit: '', referenceRange: '1.005–1.030', flag: 'normal' },
                    { testName: 'Protein', value: 'Negative', unit: '', referenceRange: 'Negative', flag: 'normal' },
                    { testName: 'Glucose', value: 'Negative', unit: '', referenceRange: 'Negative', flag: 'normal' },
                    { testName: 'WBC', value: '0–2', unit: '/hpf', referenceRange: '0–5', flag: 'normal' },
                    { testName: 'RBC', value: '0–1', unit: '/hpf', referenceRange: '0–3', flag: 'normal' },
                    { testName: 'Bacteria', value: 'None seen', unit: '', referenceRange: 'None', flag: 'normal' },
                ],
                orderingDoctor: 'Dr. Jennifer Diaz, MD — Internal Medicine',
                specimenType: 'Clean-catch midstream urine',
                collectionDate: 'Jan 29, 2026 — 7:45 AM',
                notes: 'Unremarkable urinalysis. No signs of urinary tract infection or renal pathology.'
            }
        }
    },
    {
        id: '12',
        type: 'discharge',
        title: 'Discharge Summary — Community-Acquired Pneumonia',
        date: 'Mar 22, 2025',
        doctor: 'Dr. Miguel Villanueva',
        facility: 'Makati Medical Center',
        summary: 'Admitted for moderate CAP. Completed IV antibiotics. Discharged improved after 5 days.',
        detail: {
            kind: 'discharge',
            data: {
                admissionDate: 'Mar 17, 2025',
                dischargeDate: 'Mar 22, 2025',
                summary: 'Patient was admitted with a 5-day history of productive cough with yellowish sputum, high-grade fever (39.2°C), dyspnea on exertion, and right-sided pleuritic chest pain. Chest X-ray showed right lower lobe consolidation. Sputum culture grew Streptococcus pneumoniae. Started on IV Ceftriaxone 2g once daily and Azithromycin 500 mg IV once daily. Fever resolved by Day 3. Repeat CXR on Day 4 showed improving consolidation. Stepped down to oral antibiotics. Clinically improved at discharge.',
                dischargeDiagnosis: 'Community-acquired pneumonia, moderate severity, right lower lobe — Streptococcus pneumoniae (ICD-10: J18.1)',
                medications: [
                    { name: 'Amoxicillin-Clavulanate', dosage: '625 mg', frequency: 'Three times daily', duration: '7 days (to complete total 12-day course)' },
                    { name: 'Salbutamol Nebule', dosage: '2.5 mg', frequency: 'Every 8 hours via nebulizer', duration: '5 days' },
                    { name: 'N-Acetylcysteine (NAC)', dosage: '600 mg', frequency: 'Once daily', duration: '7 days' },
                    { name: 'Paracetamol', dosage: '500 mg', frequency: 'Every 6 hours as needed for fever', duration: 'As needed' },
                ],
                followUp: [
                    'Follow-up with Dr. Villanueva at Makati Medical Center OPD in 1 week.',
                    'Repeat chest X-ray in 4–6 weeks to confirm resolution.',
                    'Pneumococcal vaccination recommended — discuss on follow-up.',
                    'Return immediately if: worsening cough, high fever, difficulty breathing, or chest pain.',
                    'Rest, adequate hydration, and balanced nutrition.',
                    'Avoid smoking and secondhand smoke exposure.'
                ],
                attendingDoctor: 'Dr. Miguel Villanueva, MD, FPCCP — Pulmonology'
            }
        }
    },
];

/* ───────── Sub-components for detail rendering ───────── */

const VitalsSection: React.FC<{ vitals: VitalSigns }> = ({ vitals }) => (
    <div className="detail-section">
        <h4 className="detail-section-title"><Activity size={16} /> Vital Signs</h4>
        <div className="vitals-grid">
            <div className="vital-item"><span className="vital-label">Blood Pressure</span><span className="vital-value">{vitals.bp}</span></div>
            <div className="vital-item"><span className="vital-label">Heart Rate</span><span className="vital-value">{vitals.hr}</span></div>
            <div className="vital-item"><span className="vital-label">Temperature</span><span className="vital-value">{vitals.temp}</span></div>
            <div className="vital-item"><span className="vital-label">Respiratory Rate</span><span className="vital-value">{vitals.rr}</span></div>
            <div className="vital-item"><span className="vital-label">O₂ Saturation</span><span className="vital-value">{vitals.o2sat}</span></div>
            {vitals.weight && <div className="vital-item"><span className="vital-label">Weight</span><span className="vital-value">{vitals.weight}</span></div>}
            {vitals.height && <div className="vital-item"><span className="vital-label">Height</span><span className="vital-value">{vitals.height}</span></div>}
        </div>
    </div>
);

const ConsultationView: React.FC<{ data: ConsultationDetail }> = ({ data }) => (
    <>
        <VitalsSection vitals={data.vitals} />
        <div className="detail-section">
            <h4 className="detail-section-title"><ClipboardList size={16} /> SOAP Notes</h4>
            <div className="soap-grid">
                <div className="soap-item">
                    <span className="soap-label">Subjective</span>
                    <p>{data.soap.subjective}</p>
                </div>
                <div className="soap-item">
                    <span className="soap-label">Objective</span>
                    <p>{data.soap.objective}</p>
                </div>
                <div className="soap-item">
                    <span className="soap-label">Assessment</span>
                    <p>{data.soap.assessment}</p>
                </div>
                <div className="soap-item">
                    <span className="soap-label">Plan</span>
                    <p className="plan-text">{data.soap.plan}</p>
                </div>
            </div>
        </div>
        <div className="detail-section">
            <h4 className="detail-section-title"><AlertTriangle size={16} /> Diagnosis</h4>
            <div className="diagnosis-list">
                {data.diagnoses.map((d, i) => (
                    <div key={i} className="diagnosis-item">
                        <span className="icd-code">{d.code}</span>
                        <span>{d.description}</span>
                    </div>
                ))}
            </div>
        </div>
        <div className="detail-section">
            <h4 className="detail-section-title"><FileText size={16} /> Doctor's Notes</h4>
            <p className="doctor-notes-text">{data.doctorNotes}</p>
        </div>
    </>
);

const ProcedureView: React.FC<{ data: ProcedureDetail }> = ({ data }) => (
    <>
        <div className="detail-section">
            <h4 className="detail-section-title"><Syringe size={16} /> Procedure Details</h4>
            <div className="detail-field"><span className="field-label">Procedure</span><p>{data.procedureName}</p></div>
            <div className="detail-field"><span className="field-label">Indication</span><p>{data.indication}</p></div>
            <div className="detail-field"><span className="field-label">Performing Doctor</span><p>{data.performingDoctor}</p></div>
            {data.anesthesia && <div className="detail-field"><span className="field-label">Anesthesia</span><p>{data.anesthesia}</p></div>}
            <div className="detail-field"><span className="field-label">Facility</span><p>{data.facility}</p></div>
        </div>
        <div className="detail-section">
            <h4 className="detail-section-title"><FileText size={16} /> Pre-operative Notes</h4>
            <p className="detail-text">{data.preOpNotes}</p>
        </div>
        <div className="detail-section">
            <h4 className="detail-section-title"><CheckCircle2 size={16} /> Findings</h4>
            <p className="detail-text">{data.findings}</p>
        </div>
        <div className="detail-section">
            <h4 className="detail-section-title"><FileText size={16} /> Post-operative Notes</h4>
            <p className="detail-text">{data.postOpNotes}</p>
        </div>
    </>
);

const LabView: React.FC<{ data: LabDetail }> = ({ data }) => (
    <>
        <div className="detail-section">
            <h4 className="detail-section-title"><FlaskConical size={16} /> Specimen Information</h4>
            <div className="detail-field"><span className="field-label">Specimen Type</span><p>{data.specimenType}</p></div>
            <div className="detail-field"><span className="field-label">Collection Date</span><p>{data.collectionDate}</p></div>
            <div className="detail-field"><span className="field-label">Ordering Doctor</span><p>{data.orderingDoctor}</p></div>
        </div>
        <div className="detail-section">
            <h4 className="detail-section-title"><FlaskConical size={16} /> Test Results</h4>
            <div className="lab-table-wrapper">
                <table className="lab-results-table">
                    <thead>
                        <tr>
                            <th>Test</th>
                            <th>Result</th>
                            <th>Unit</th>
                            <th>Reference</th>
                            <th>Flag</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.results.map((r, i) => (
                            <tr key={i} className={r.flag !== 'normal' ? `flag-${r.flag}` : ''}>
                                <td className="test-name">{r.testName}</td>
                                <td className="test-value">{r.value}</td>
                                <td className="test-unit">{r.unit}</td>
                                <td className="test-ref">{r.referenceRange}</td>
                                <td className="test-flag">
                                    {r.flag === 'normal' ? (
                                        <span className="flag-badge normal"><CheckCircle2 size={12} /> Normal</span>
                                    ) : r.flag === 'high' ? (
                                        <span className="flag-badge high"><ArrowUpRight size={12} /> High</span>
                                    ) : r.flag === 'low' ? (
                                        <span className="flag-badge low"><ArrowDownRight size={12} /> Low</span>
                                    ) : (
                                        <span className="flag-badge critical"><AlertTriangle size={12} /> Critical</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
        {data.notes && (
            <div className="detail-section">
                <h4 className="detail-section-title"><FileText size={16} /> Pathologist / Lab Notes</h4>
                <p className="detail-text">{data.notes}</p>
            </div>
        )}
    </>
);

const ImagingView: React.FC<{ data: ImagingDetail }> = ({ data }) => (
    <>
        <div className="detail-section">
            <h4 className="detail-section-title"><ScanLine size={16} /> Study Information</h4>
            <div className="detail-field"><span className="field-label">Modality</span><p>{data.modality}</p></div>
            <div className="detail-field"><span className="field-label">Body Part</span><p>{data.bodyPart}</p></div>
            {data.technique && <div className="detail-field"><span className="field-label">Technique</span><p>{data.technique}</p></div>}
            <div className="detail-field"><span className="field-label">Radiologist</span><p>{data.radiologist}</p></div>
        </div>
        <div className="detail-section">
            <h4 className="detail-section-title"><FileText size={16} /> Report</h4>
            <p className="detail-text">{data.reportText}</p>
        </div>
        <div className="detail-section">
            <h4 className="detail-section-title"><Search size={16} /> Findings</h4>
            <p className="detail-text pre-wrap">{data.findings}</p>
        </div>
        <div className="detail-section impression-section">
            <h4 className="detail-section-title"><CheckCircle2 size={16} /> Impression</h4>
            <p className="detail-text impression-text">{data.impression}</p>
        </div>
    </>
);

const DischargeView: React.FC<{ data: DischargeDetail }> = ({ data }) => (
    <>
        <div className="detail-section">
            <h4 className="detail-section-title"><Calendar size={16} /> Admission Details</h4>
            <div className="detail-field"><span className="field-label">Admission Date</span><p>{data.admissionDate}</p></div>
            <div className="detail-field"><span className="field-label">Discharge Date</span><p>{data.dischargeDate}</p></div>
            <div className="detail-field"><span className="field-label">Discharge Diagnosis</span><p>{data.dischargeDiagnosis}</p></div>
            <div className="detail-field"><span className="field-label">Attending Doctor</span><p>{data.attendingDoctor}</p></div>
        </div>
        <div className="detail-section">
            <h4 className="detail-section-title"><FileText size={16} /> Discharge Summary</h4>
            <p className="detail-text">{data.summary}</p>
        </div>
        <div className="detail-section">
            <h4 className="detail-section-title"><Syringe size={16} /> Medications at Discharge</h4>
            <div className="medications-table-wrapper">
                <table className="medications-table">
                    <thead>
                        <tr>
                            <th>Medication</th>
                            <th>Dosage</th>
                            <th>Frequency</th>
                            <th>Duration</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.medications.map((m, i) => (
                            <tr key={i}>
                                <td className="med-name">{m.name}</td>
                                <td>{m.dosage}</td>
                                <td>{m.frequency}</td>
                                <td>{m.duration}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
        <div className="detail-section">
            <h4 className="detail-section-title"><ClipboardList size={16} /> Follow-up Instructions</h4>
            <ul className="follow-up-list">
                {data.followUp.map((item, i) => (
                    <li key={i}>{item}</li>
                ))}
            </ul>
        </div>
    </>
);

/* ───────── Detail Modal ───────── */

const RecordDetailModal: React.FC<{
    record: MedicalRecord;
    onClose: () => void;
}> = ({ record, onClose }) => {
    const { showToast } = useToast();

    const handlePrint = () => {
        window.print();
    };

    const handleDownload = () => {
        showToast('Download started — preparing PDF...', 'info');
        // Simulate download delay
        setTimeout(() => showToast('Record downloaded successfully', 'success'), 1200);
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'consultation': return <Stethoscope size={18} />;
            case 'procedure': return <Syringe size={18} />;
            case 'lab': return <FlaskConical size={18} />;
            case 'imaging': return <ScanLine size={18} />;
            case 'discharge': return <ClipboardList size={18} />;
            default: return <FileText size={18} />;
        }
    };

    const renderDetail = () => {
        switch (record.detail.kind) {
            case 'consultation': return <ConsultationView data={record.detail.data} />;
            case 'procedure': return <ProcedureView data={record.detail.data} />;
            case 'lab': return <LabView data={record.detail.data} />;
            case 'imaging': return <ImagingView data={record.detail.data} />;
            case 'discharge': return <DischargeView data={record.detail.data} />;
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container" onClick={e => e.stopPropagation()}>
                {/* Modal Header */}
                <div className="modal-header">
                    <div className="modal-title-area">
                        <span className={`modal-type-icon ${record.type}`}>{getTypeIcon(record.type)}</span>
                        <div>
                            <h3 className="modal-title">{record.title}</h3>
                            <div className="modal-meta">
                                <span><Calendar size={13} /> {record.date}</span>
                                <span><User size={13} /> {record.doctor}</span>
                                <span className="modal-facility">{record.facility}</span>
                            </div>
                        </div>
                    </div>
                    <button className="modal-close-btn" onClick={onClose} aria-label="Close">
                        <X size={20} />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="modal-body">
                    {renderDetail()}
                </div>

                {/* Modal Footer */}
                <div className="modal-footer">
                    <button className="modal-action-btn secondary" onClick={handlePrint}>
                        <Printer size={15} /> Print
                    </button>
                    <button className="modal-action-btn primary" onClick={handleDownload}>
                        <Download size={15} /> Download PDF
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ───────── Maxicare Mock Records ───────── */

const MAXICARE_RECORDS: MedicalRecord[] = [
    {
        id: 'mc-1',
        type: 'consultation',
        title: 'Internal Medicine — Hypertension Follow-up',
        date: 'Feb 10, 2026',
        doctor: 'Dr. Carmela Ong',
        facility: 'Maxicare PCC - Ayala North Exchange',
        summary: 'BP improving on dual therapy (Losartan + Amlodipine). HbA1c borderline — lifestyle modification reinforced.',
        detail: {
            kind: 'consultation',
            data: {
                soap: {
                    subjective: 'Patient returns for hypertension follow-up. Currently on Losartan 50mg OD and Amlodipine 5mg OD. Denies headaches, dizziness, or chest pain. Reports compliance with low-sodium diet. Occasional mild fatigue.',
                    objective: 'General: Well-nourished female, no acute distress. CV: Regular rate and rhythm, no murmurs. Lungs: Clear bilaterally. Extremities: No edema. BP today: 132/82 mmHg (improved from 138/86).',
                    assessment: 'Essential hypertension, improving on dual therapy. Pre-diabetes (HbA1c 5.8%) — borderline. Dyslipidemia (LDL 142).',
                    plan: '1. Continue Losartan 50mg OD + Amlodipine 5mg OD.\n2. Lifestyle modification — reduce carbohydrate intake, increase physical activity.\n3. Repeat HbA1c in 3 months.\n4. Kidney Function Test (BUN/Creatinine) ordered.\n5. Follow-up in 4 weeks.'
                },
                vitals: { bp: '132/82 mmHg', hr: '72 bpm', temp: '36.4°C', rr: '16 breaths/min', o2sat: '99%', weight: '61 kg' },
                diagnoses: [
                    { code: 'I10', description: 'Essential (primary) hypertension' },
                    { code: 'R73.03', description: 'Prediabetes' },
                    { code: 'E78.5', description: 'Dyslipidemia, unspecified' },
                ],
                doctorNotes: 'BP trend improving since adding Amlodipine. Will continue current regimen and reassess in 4 weeks. HbA1c at 5.8% is borderline — dietary counseling emphasized.'
            }
        }
    },
    {
        id: 'mc-2',
        type: 'consultation',
        title: 'Cardiology — Cardiovascular Risk Assessment',
        date: 'Feb 3, 2026',
        doctor: 'Dr. Ramon Bautista',
        facility: 'Maxicare PCC - Ayala North Exchange',
        summary: 'Cardiac risk assessment. Treadmill stress test ordered. Pelvic ultrasound for annual screening.',
        detail: {
            kind: 'consultation',
            data: {
                soap: {
                    subjective: 'Referred by Dr. Ong for cardiac risk assessment given HTN + pre-diabetes + dyslipidemia. Patient denies exertional chest pain, palpitations, or syncope. Family history: father had MI at age 55.',
                    objective: 'General: No distress. CV: S1/S2 normal, no murmurs, gallops, or rubs. JVP not elevated. Lungs: Clear. Extremities: No edema, pulses 2+ bilaterally.',
                    assessment: 'Multiple cardiovascular risk factors: HTN, pre-diabetes, dyslipidemia, positive family history. Intermediate 10-year ASCVD risk.',
                    plan: '1. Treadmill stress test ordered — baseline cardiovascular assessment.\n2. Pelvic ultrasound for annual wellness screening.\n3. Consider starting statin if LDL remains >140 at next visit.\n4. Follow-up after stress test results.'
                },
                vitals: { bp: '134/84 mmHg', hr: '76 bpm', temp: '36.5°C', rr: '16 breaths/min', o2sat: '98%' },
                diagnoses: [
                    { code: 'Z13.6', description: 'Encounter for screening for cardiovascular disorders' },
                ],
                doctorNotes: 'Intermediate cardiovascular risk. Stress test will help guide further management. May need statin initiation if LDL persistently elevated.'
            }
        }
    },
    {
        id: 'mc-3',
        type: 'lab',
        title: 'Complete Blood Count (CBC)',
        date: 'Jan 20, 2026',
        doctor: 'Dr. Carmela Ong',
        facility: 'Maxicare PCC Laboratory - Ayala North Exchange',
        summary: 'Routine CBC. All values within normal limits.',
        detail: {
            kind: 'lab',
            data: {
                results: [
                    { testName: 'Hemoglobin', value: '13.1', unit: 'g/dL', referenceRange: '12.0–16.0', flag: 'normal' },
                    { testName: 'Hematocrit', value: '39.5', unit: '%', referenceRange: '36.0–46.0', flag: 'normal' },
                    { testName: 'WBC Count', value: '6.8', unit: '×10³/µL', referenceRange: '4.5–11.0', flag: 'normal' },
                    { testName: 'Platelet Count', value: '268', unit: '×10³/µL', referenceRange: '150–400', flag: 'normal' },
                    { testName: 'RBC Count', value: '4.5', unit: '×10⁶/µL', referenceRange: '4.0–5.5', flag: 'normal' },
                ],
                orderingDoctor: 'Dr. Carmela Ong, MD — Internal Medicine',
                specimenType: 'Whole blood (EDTA)',
                collectionDate: 'Jan 20, 2026 — 8:00 AM',
                notes: 'All hematologic parameters within normal limits.'
            }
        }
    },
    {
        id: 'mc-4',
        type: 'lab',
        title: 'Lipid Panel & HbA1c',
        date: 'Jan 20, 2026',
        doctor: 'Dr. Carmela Ong',
        facility: 'Maxicare PCC Laboratory - Ayala North Exchange',
        summary: 'LDL borderline high (142). HbA1c 5.8% — pre-diabetic range.',
        detail: {
            kind: 'lab',
            data: {
                results: [
                    { testName: 'Total Cholesterol', value: '218', unit: 'mg/dL', referenceRange: '<200', flag: 'high' },
                    { testName: 'LDL Cholesterol', value: '142', unit: 'mg/dL', referenceRange: '<130', flag: 'high' },
                    { testName: 'HDL Cholesterol', value: '45', unit: 'mg/dL', referenceRange: '>40', flag: 'normal' },
                    { testName: 'Triglycerides', value: '156', unit: 'mg/dL', referenceRange: '<150', flag: 'high' },
                    { testName: 'HbA1c', value: '5.8', unit: '%', referenceRange: '<5.7', flag: 'high' },
                    { testName: 'Fasting Blood Sugar', value: '95', unit: 'mg/dL', referenceRange: '70–100', flag: 'normal' },
                ],
                orderingDoctor: 'Dr. Carmela Ong, MD — Internal Medicine',
                specimenType: 'Serum (fasting 10–12 hrs)',
                collectionDate: 'Jan 20, 2026 — 7:30 AM',
                notes: 'LDL borderline high. HbA1c 5.8% indicates pre-diabetic range. Lifestyle modification recommended. Consider statin if LDL remains elevated.'
            }
        }
    },
    {
        id: 'mc-5',
        type: 'imaging',
        title: 'Pelvic Ultrasound',
        date: 'Feb 5, 2026',
        doctor: 'Dr. Ramon Bautista',
        facility: 'Maxicare PCC Imaging - BGC',
        summary: 'Routine pelvic ultrasound. Normal findings. Small uterine fibroid noted.',
        detail: {
            kind: 'imaging',
            data: {
                modality: 'Ultrasound',
                bodyPart: 'Pelvis (transabdominal)',
                technique: 'Transabdominal pelvic ultrasound with full bladder technique.',
                reportText: 'The uterus is anteverted and of normal size. A small intramural fibroid measuring 1.2 cm is noted in the posterior wall. Endometrial stripe is thin at 4 mm. Both ovaries are normal in size with small follicles.',
                findings: '• Uterus: Anteverted, measures 7.8 × 4.2 × 4.0 cm. Small intramural fibroid (1.2 cm) in posterior wall.\n• Endometrium: Thin, 4 mm. No endometrial polyp.\n• Right ovary: Normal, 3.0 × 2.0 cm, with small follicles.\n• Left ovary: Normal, 2.8 × 1.8 cm, with small follicles.\n• No free fluid in the cul-de-sac.',
                impression: 'Small intramural uterine fibroid (1.2 cm) — likely incidental and clinically insignificant. Otherwise normal pelvic ultrasound.',
                radiologist: 'Dr. Elena Santos, MD, FPCR — Diagnostic Radiology'
            }
        }
    },
    {
        id: 'mc-6',
        type: 'consultation',
        title: 'Annual Wellness Check-up',
        date: 'Jan 20, 2026',
        doctor: 'Dr. Carmela Ong',
        facility: 'Maxicare PCC - Ayala North Exchange',
        summary: 'Annual wellness examination. Hypertension identified. Labs ordered.',
        detail: {
            kind: 'consultation',
            data: {
                soap: {
                    subjective: 'Patient presents for annual wellness check-up. Reports occasional headaches (1-2x/week), fatigue, and difficulty concentrating. No chest pain, palpitations, or shortness of breath. Diet: Filipino standard, moderate rice intake. Exercise: walking 20 minutes 3x/week.',
                    objective: 'General: Well-nourished, no acute distress. HEENT: Normal. Lungs: Clear bilaterally. Heart: Regular rate, no murmurs. Abdomen: Soft, non-tender. Extremities: No edema. BMI: 24.5.',
                    assessment: 'Annual wellness visit. Blood pressure elevated at 138/86 — new finding. Needs workup for hypertension. BMI within normal range.',
                    plan: '1. Start Losartan 50mg once daily.\n2. Vitamin D3 1000IU supplementation.\n3. Labs ordered: CBC, FBS, HbA1c, Lipid Panel, Urinalysis.\n4. Low-sodium diet counseling provided.\n5. Follow-up in 4 weeks with lab results.'
                },
                vitals: { bp: '138/86 mmHg', hr: '76 bpm', temp: '36.5°C', rr: '16 breaths/min', o2sat: '98%', weight: '62 kg', height: '159 cm' },
                diagnoses: [
                    { code: 'Z00.00', description: 'Encounter for general adult medical examination' },
                    { code: 'I10', description: 'Essential (primary) hypertension — new diagnosis' },
                ],
                doctorNotes: 'New hypertension diagnosis. Started on Losartan 50mg. Full metabolic workup ordered. Will reassess BP trend in 4 weeks and consider additional therapy if not at target.'
            }
        }
    },
];

/* ───────── Main Component ───────── */

export const MedicalHistory: React.FC = () => {
    const { tenant } = useTheme();
    const [filter, setFilter] = useState<RecordType>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);

    const records = tenant.id === 'maxicare' ? MAXICARE_RECORDS : MOCK_RECORDS;

    const filteredRecords = records.filter(record => {
        const matchesFilter = filter === 'all' || record.type === filter;
        const matchesSearch = searchQuery === '' ||
            record.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            record.doctor.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const getTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            consultation: 'Consult',
            procedure: 'Procedure',
            lab: 'Lab',
            imaging: 'Imaging',
            discharge: 'Discharge',
        };
        return labels[type] || type;
    };

    return (
        <div className="medical-history-container">
            <header className="page-header">
                <BackButton />
                <div className="header-text">
                    <h2>Medical History</h2>
                    <p className="page-subtitle">Detailed records of your past visits and conditions</p>
                </div>
            </header>

            {/* Search Bar */}
            <div className="search-bar">
                <Search size={18} className="search-icon" />
                <input
                    type="text"
                    placeholder="Search records..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Filter Chips */}
            <div className="filter-chips">
                {(['all', 'consultation', 'procedure', 'lab', 'imaging', 'discharge'] as RecordType[]).map(type => (
                    <button
                        key={type}
                        className={`filter-chip ${filter === type ? 'active' : ''}`}
                        onClick={() => setFilter(type)}
                    >
                        {type === 'all' ? 'All Records' : getTypeLabel(type)}
                    </button>
                ))}
            </div>

            {/* Records List */}
            <div className="records-list">
                {filteredRecords.length > 0 ? (
                    filteredRecords.map(record => (
                        <div key={record.id} className="record-card">
                            <div className="record-header">
                                <div className="record-title-row">
                                    <FileText size={16} className="record-icon" />
                                    <h4>{record.title}</h4>
                                </div>
                                <span className={`type-badge ${record.type}`}>{getTypeLabel(record.type)}</span>
                            </div>
                            <p className="record-summary">{record.summary}</p>
                            <div className="record-meta">
                                <span><Calendar size={12} /> {record.date}</span>
                                <span><User size={12} /> {record.doctor}</span>
                            </div>
                            <div className="record-footer">
                                <span className="facility">{record.facility}</span>
                                <button className="view-btn" onClick={() => setSelectedRecord(record)}>
                                    <FileText size={14} /> View
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="empty-state">No records found.</p>
                )}
            </div>

            {/* Detail Modal */}
            {selectedRecord && (
                <RecordDetailModal
                    record={selectedRecord}
                    onClose={() => setSelectedRecord(null)}
                />
            )}
        </div>
    );
};
