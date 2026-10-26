/**
 * Comprehensive Medical Fields & Clinical Specialties Directory for Iryotek.
 * Covers all major fields of medicine, corresponding specialist titles, qualifications,
 * common health concerns, and departmental mappings.
 */

export interface MedicalField {
  id: string
  name: string
  specialistTitle: string
  popularName: string
  icon: string
  category: 'Primary Care' | 'Internal Medicine' | 'Surgical Specialties' | 'Women & Child Health' | 'Diagnostics & Other'
  qualification: string
  description: string
  commonConditions: string[]
  aliases?: string[]
}

export const allMedicalFields: MedicalField[] = [
  {
    id: 'dermatology',
    name: 'Dermatology',
    specialistTitle: 'Dermatologist',
    popularName: 'Skin, Hair & Nails Specialist',
    icon: '✨',
    category: 'Internal Medicine',
    qualification: 'MBBS, MD (Dermatology, Venereology & Leprosy)',
    description: 'Diagnosis and clinical treatment of skin disorders, acne, hair fall, eczema, psoriasis, allergies, and cosmetic dermatology.',
    commonConditions: ['Acne & Scars', 'Hair Loss / Alopecia', 'Eczema & Psoriasis', 'Skin Rash & Fungal Infection', 'Pigmentation', 'Skin Allergies']
  },
  {
    id: 'cardiology',
    name: 'Cardiology',
    specialistTitle: 'Cardiologist',
    popularName: 'Heart & Vascular Specialist',
    icon: '🫀',
    category: 'Internal Medicine',
    qualification: 'MBBS, MD (Medicine), DM (Cardiology)',
    description: 'Expert cardiovascular care, coronary artery diseases, heart rhythm disorders, hypertension management, and echocardiography.',
    commonConditions: ['High Blood Pressure', 'Chest Pain / Angina', 'Heart Palpitations', 'Arrhythmia', 'Heart Failure', 'Post-Angioplasty Care']
  },
  {
    id: 'pediatrics',
    name: 'Pediatrics',
    specialistTitle: 'Pediatrician',
    popularName: 'Child & Infant Specialist',
    icon: '👶',
    category: 'Women & Child Health',
    qualification: 'MBBS, MD (Pediatrics), DCH',
    description: 'Comprehensive healthcare for newborns, infants, children, and adolescents, including developmental milestones and immunizations.',
    commonConditions: ['Childhood Fever & Cold', 'Vaccination & Immunization', 'Growth & Nutrition Delays', 'Asthma & Allergies in Kids', 'Infant Colic', 'Infections']
  },
  {
    id: 'gynecology',
    name: 'Obstetrics & Gynecology',
    specialistTitle: 'Gynecologist & Obstetrician',
    popularName: "Women's Health & Maternity Specialist",
    icon: '🤰',
    category: 'Women & Child Health',
    qualification: 'MBBS, MS (Obstetrics & Gynecology), DGO',
    description: 'Full-spectrum women’s healthcare, prenatal and pregnancy management, menstrual health, PCOS/PCOD, fertility, and menopause.',
    commonConditions: ['Pregnancy & Prenatal Care', 'PCOS / PCOD', 'Irregular Periods', 'Pelvic Pain', 'Infertility Evaluation', 'Menopause Support']
  },
  {
    id: 'neurology',
    name: 'Neurology',
    specialistTitle: 'Neurologist',
    popularName: 'Brain, Nerve & Spine Specialist',
    icon: '🧠',
    category: 'Internal Medicine',
    qualification: 'MBBS, MD (Medicine), DM (Neurology)',
    description: 'Advanced diagnosis and care for disorders of the brain, spinal cord, nerves, epilepsy, stroke, migraine, and Parkinson’s.',
    commonConditions: ['Severe Migraine & Headaches', 'Epilepsy & Seizures', 'Stroke Rehabilitation', 'Nerve Pain & Neuropathy', 'Tremors / Parkinsonism', 'Memory Loss']
  },
  {
    id: 'orthopedics',
    name: 'Orthopedics',
    specialistTitle: 'Orthopedic Surgeon',
    popularName: 'Bone, Joint & Spine Specialist',
    icon: '🦴',
    category: 'Surgical Specialties',
    qualification: 'MBBS, MS (Orthopedics), DNB Ortho',
    description: 'Surgical and non-surgical treatment of bone fractures, osteoarthritis, knee/hip replacements, sports injuries, and spine disorders.',
    commonConditions: ['Knee & Joint Pain', 'Bone Fractures & Sprains', 'Back Pain & Sciatica', 'Arthritis Care', 'Sports Ligament Tears (ACL)', 'Shoulder Stiffness']
  },
  {
    id: 'psychiatry',
    name: 'Psychiatry',
    specialistTitle: 'Psychiatrist',
    popularName: 'Mental Health & Mind Specialist',
    icon: '🧘',
    category: 'Primary Care',
    qualification: 'MBBS, MD (Psychiatry), DPM',
    description: 'Clinical evaluation, psychotherapy, and pharmacological management of mental health, mood disorders, insomnia, and stress.',
    commonConditions: ['Anxiety & Panic Attacks', 'Depression & Low Mood', 'Insomnia / Sleep Disorders', 'Stress & Burnout', 'OCD', 'Bipolar Disorder']
  },
  {
    id: 'gastroenterology',
    name: 'Gastroenterology',
    specialistTitle: 'Gastroenterologist',
    popularName: 'Stomach, Digestion & Liver Specialist',
    icon: '🫄',
    category: 'Internal Medicine',
    qualification: 'MBBS, MD (Medicine), DM (Gastroenterology)',
    description: 'Diagnostic endoscopy, colonoscopy, and medical care for acid reflux, liver diseases, hepatitis, IBS, ulcers, and pancreatitis.',
    commonConditions: ['Acid Reflux / GERD', 'Fatty Liver & Jaundice', 'Irritable Bowel Syndrome (IBS)', 'Stomach Ulcers', 'Constipation / Diarrhea', 'Abdominal Bloating']
  },
  {
    id: 'oncology',
    name: 'Oncology',
    specialistTitle: 'Oncologist',
    popularName: 'Cancer & Tumor Specialist',
    icon: '🎗️',
    category: 'Surgical Specialties',
    qualification: 'MBBS, MD, DM / MCh (Medical & Surgical Oncology)',
    description: 'Holistic oncology care including cancer screening, chemotherapy regimens, precision immunotherapy, and surgical tumor management.',
    commonConditions: ['Cancer Screening & Biopsy', 'Chemotherapy Management', 'Breast Cancer Care', 'Oral & Lung Tumors', 'Gastrointestinal Cancers', 'Post-Surgery Follow-up']
  },
  {
    id: 'ophthalmology',
    name: 'Ophthalmology',
    specialistTitle: 'Ophthalmologist',
    popularName: 'Eye, Vision & Retina Specialist',
    icon: '👁️',
    category: 'Surgical Specialties',
    qualification: 'MBBS, MS (Ophthalmology), DNB',
    description: 'Comprehensive eye examinations, cataract micro-surgery, LASIK vision correction, glaucoma management, and diabetic retinopathy.',
    commonConditions: ['Blurry Vision & Refraction', 'Cataract Surgery', 'Glaucoma & Eye Pressure', 'Dry Eyes & Eye Strain', 'Diabetic Retinopathy', 'Conjunctivitis']
  },
  {
    id: 'ent',
    name: 'ENT / Otolaryngology',
    specialistTitle: 'ENT Specialist',
    popularName: 'Ear, Nose & Throat Specialist',
    icon: '👂',
    category: 'Surgical Specialties',
    qualification: 'MBBS, MS (ENT / Otorhinolaryngology)',
    description: 'Diagnosis and endoscopic surgery for ear infections, hearing loss, sinusitis, nasal polyp, tonsillitis, and vertigo.',
    commonConditions: ['Sinusitis & Nasal Blockage', 'Hearing Loss & Tinnitus', 'Frequent Sore Throat & Tonsils', 'Ear Discharge & Pain', 'Vertigo & Dizziness', 'Snoring & Sleep Apnea']
  },
  {
    id: 'pulmonology',
    name: 'Pulmonology',
    specialistTitle: 'Pulmonologist',
    popularName: 'Chest & Respiratory Specialist',
    icon: '🫁',
    category: 'Internal Medicine',
    qualification: 'MBBS, MD (Pulmonary Medicine / Chest Diseases)',
    description: 'Specialized respiratory care for asthma, chronic obstructive pulmonary disease (COPD), pneumonia, lung fibrosis, and bronchitis.',
    commonConditions: ['Persistent Cough & Wheezing', 'Asthma Management', 'COPD & Breathlessness', 'Pneumonia Recovery', 'Post-Covid Lung Issues', 'Sleep Apnea']
  },
  {
    id: 'nephrology',
    name: 'Nephrology',
    specialistTitle: 'Nephrologist',
    popularName: 'Kidney Care & Dialysis Specialist',
    icon: '🩺',
    category: 'Internal Medicine',
    qualification: 'MBBS, MD (Medicine), DM (Nephrology)',
    description: 'Management of chronic kidney disease (CKD), proteinuria, electrolyte imbalances, dialysis support, and kidney transplant care.',
    commonConditions: ['Chronic Kidney Disease (CKD)', 'High Creatinine / Urea', 'Swelling in Feet / Edema', 'Kidney Cyst & Glomerulonephritis', 'Dialysis Planning', 'Protein in Urine']
  },
  {
    id: 'urology',
    name: 'Urology',
    specialistTitle: 'Urologist',
    popularName: 'Urinary & Men’s Health Specialist',
    icon: '🚹',
    category: 'Surgical Specialties',
    qualification: 'MBBS, MS (Surgery), MCh (Urology)',
    description: 'Endoscopic and laser treatment of kidney stones, enlarged prostate (BPH), urinary tract infections, and male infertility.',
    commonConditions: ['Kidney Stones & Renal Colic', 'Urinary Burning & UTIs', 'Enlarged Prostate (BPH)', 'Frequent Urination at Night', 'Blood in Urine (Hematuria)', 'Erectile Dysfunction']
  },
  {
    id: 'endocrinology',
    name: 'Endocrinology',
    specialistTitle: 'Endocrinologist',
    popularName: 'Diabetes, Thyroid & Hormone Specialist',
    icon: '🔬',
    category: 'Internal Medicine',
    qualification: 'MBBS, MD (Medicine), DM (Endocrinology)',
    description: 'Targeted endocrine therapy for Type 1 & 2 diabetes, hypothyroidism, hyperthyroidism, metabolic syndromes, and adrenal disorders.',
    commonConditions: ['Uncontrolled Diabetes', 'Thyroid Imbalance (Hypo/Hyper)', 'Unexplained Weight Gain/Loss', 'Hormonal Imbalances', 'Osteoporosis', 'Pituitary Disorders']
  },
  {
    id: 'general-medicine',
    name: 'General Medicine',
    specialistTitle: 'General Physician',
    popularName: 'Primary Care & Family Doctor',
    icon: '🩺',
    category: 'Primary Care',
    qualification: 'MBBS, MD (General Medicine)',
    description: 'Comprehensive primary care, diagnosis of acute fevers, metabolic screening, hypertension, preventive health, and multi-system care.',
    commonConditions: ['Viral Fever, Dengue, Typhoid', 'General Body Pain & Fatigue', 'Blood Sugar & BP Screening', 'Common Cold & Flu', 'Health Checkups', 'Infections']
  },
  {
    id: 'general-surgery',
    name: 'General Surgery',
    specialistTitle: 'General Surgeon',
    popularName: 'Laparoscopic & Minimally Invasive Surgeon',
    icon: '🩹',
    category: 'Surgical Specialties',
    qualification: 'MBBS, MS (General Surgery), FIAGES',
    description: 'Minimally invasive laparoscopic surgery for hernia, gallbladder stones, appendicitis, piles/fistula, and trauma care.',
    commonConditions: ['Gallbladder Stones (Cholecystectomy)', 'Inguinal & Umbilical Hernia', 'Appendicitis', 'Piles, Fissure & Fistula', 'Lumps, Cysts & Swellings', 'Wound Management']
  },
  {
    id: 'dentistry',
    name: 'Dentistry',
    specialistTitle: 'Dentist & Dental Surgeon',
    popularName: 'Dental, Teeth & Gum Specialist',
    icon: '🦷',
    category: 'Primary Care',
    qualification: 'BDS, MDS (Conservative Dentistry & Endodontics)',
    description: 'Preventive and restorative dental care, painless root canal treatment (RCT), teeth cleaning, dental implants, and braces.',
    commonConditions: ['Toothache & Cavities', 'Root Canal Treatment (RCT)', 'Bleeding Gums & Plaque', 'Wisdom Tooth Pain', 'Dental Implants & Crowns', 'Teeth Alignment & Braces']
  },
  {
    id: 'rheumatology',
    name: 'Rheumatology',
    specialistTitle: 'Rheumatologist',
    popularName: 'Arthritis & Autoimmune Specialist',
    icon: '🧬',
    category: 'Internal Medicine',
    qualification: 'MBBS, MD (Medicine), DM (Clinical Immunology & Rheumatology)',
    description: 'Expert treatment of rheumatoid arthritis, ankylosing spondylitis, lupus (SLE), gout, vasculitis, and musculoskeletal pain.',
    commonConditions: ['Rheumatoid Arthritis', 'Morning Joint Stiffness', 'Ankylosing Spondylitis', 'Uric Acid & Gout Attack', 'Lupus (SLE)', 'Chronic Fibromyalgia']
  },
  {
    id: 'radiology',
    name: 'Radiology',
    specialistTitle: 'Radiologist',
    popularName: 'Imaging, Scan & Diagnostic Specialist',
    icon: '🩻',
    category: 'Diagnostics & Other',
    qualification: 'MBBS, MD (Radio-Diagnosis)',
    description: 'Clinical interpretation of diagnostic imaging, MRI, CT scans, ultrasound, mammography, and interventional radiology.',
    commonConditions: ['CT Scan & MRI Reporting', 'Ultrasound & Color Doppler', 'Digital X-Rays', 'Mammography Screening', 'Image-Guided Biopsies', 'Bone Densitometry']
  },
  {
    id: 'anesthesiology',
    name: 'Anesthesiology & Critical Care',
    specialistTitle: 'Anesthesiologist & Intensivist',
    popularName: 'ICU & Pain Management Specialist',
    icon: '💉',
    category: 'Diagnostics & Other',
    qualification: 'MBBS, MD (Anesthesiology), IDCCM',
    description: 'Perioperative care, surgical anesthesia, intensive care unit (ICU) management, and interventional chronic pain relief.',
    commonConditions: ['Pre-Surgery Anesthesia Checkup', 'Chronic Back / Joint Pain Relief', 'ICU Care & Ventilation', 'Epidural & Nerve Blocks', 'Post-Op Pain Management']
  },
  {
    id: 'infectious-diseases',
    name: 'Infectious Diseases',
    specialistTitle: 'Infectious Disease Specialist',
    popularName: 'Fever & Infection Specialist',
    icon: '🦠',
    category: 'Internal Medicine',
    qualification: 'MBBS, MD (Medicine), FNB (Infectious Diseases)',
    description: 'Management of complex multi-drug resistant infections, tropical fevers, tuberculosis, HIV/AIDS, fungal, and hospital-acquired infections.',
    commonConditions: ['Pyrexia of Unknown Origin (PUO)', 'Tuberculosis (TB)', 'Complicated Dengue & Malaria', 'Post-Operative Infections', 'HIV Care & ART', 'Fungal Infections']
  },
  {
    id: 'hematology',
    name: 'Hematology',
    specialistTitle: 'Hematologist',
    popularName: 'Blood Disorders Specialist',
    icon: '🩸',
    category: 'Internal Medicine',
    qualification: 'MBBS, MD (Medicine), DM (Clinical Hematology)',
    description: 'Expert diagnosis and therapy for anemia, platelet disorders, hemophilia, deep vein thrombosis, myeloma, and blood cancers.',
    commonConditions: ['Severe Unexplained Anemia', 'Low Platelet Counts (ITP)', 'Bleeding & Clotting Disorders', 'Thalassemia Management', 'Leukemia & Lymphoma', 'Deep Vein Thrombosis']
  },
  {
    id: 'plastic-surgery',
    name: 'Plastic & Cosmetic Surgery',
    specialistTitle: 'Plastic Surgeon',
    popularName: 'Reconstructive & Aesthetic Surgeon',
    icon: '✂️',
    category: 'Surgical Specialties',
    qualification: 'MBBS, MS (Surgery), MCh (Plastic Surgery)',
    description: 'Reconstructive surgery after trauma or cancer, burn scar revision, cleft lip/palate repair, rhinoplasty, and body contouring.',
    commonConditions: ['Burn Scar Reconstruction', 'Trauma Wound Flap Surgery', 'Cleft Lip & Palate', 'Rhinoplasty (Nose Reshaping)', 'Gynecomastia Correction', 'Hand Surgery']
  },
  {
    id: 'neurosurgery',
    name: 'Neurosurgery',
    specialistTitle: 'Neurosurgeon',
    popularName: 'Brain & Spine Surgeon',
    icon: '🧠',
    category: 'Surgical Specialties',
    qualification: 'MBBS, MS (Surgery), MCh (Neurosurgery)',
    description: 'Micro-neurosurgery for brain tumors, spinal disc herniation, head trauma, aneurysms, and minimally invasive spine stabilization.',
    commonConditions: ['Brain Tumors & Cysts', 'Slip Disc & Spine Surgery', 'Head Trauma & Concussions', 'Brain Hemorrhage / Aneurysm', 'Hydrocephalus', 'Spinal Cord Stenosis']
  },
  {
    id: 'emergency-medicine',
    name: 'Emergency Medicine',
    specialistTitle: 'Emergency Physician',
    popularName: 'Accident & Critical Trauma Specialist',
    icon: '🚨',
    category: 'Primary Care',
    qualification: 'MBBS, MD / DNB (Emergency Medicine)',
    description: 'Immediate 24/7 stabilization of life-threatening emergencies, trauma resuscitation, poison management, and acute cardiac arrest.',
    commonConditions: ['Acute Severe Trauma', 'Respiratory Distress', 'Unconscious Patient', 'Severe Allergic Anaphylaxis', 'Poisoning / Snake Bite', 'Acute Burns']
  },
  {
    id: 'physiotherapy',
    name: 'Physiotherapy & Rehabilitation',
    specialistTitle: 'Physiotherapist',
    popularName: 'Physical Rehab & Mobility Specialist',
    icon: '🏃',
    category: 'Primary Care',
    qualification: 'BPT, MPT (Orthopedics / Neurology)',
    description: 'Active physical therapy, posture correction, neurological stroke rehabilitation, sports conditioning, and joint stiffness relief.',
    commonConditions: ['Frozen Shoulder & Neck Pain', 'Post-Fracture / Joint Rehab', 'Sciatica & Disc Bulge', 'Stroke Motor Recovery', 'Sports Muscle Tears', 'Knee Mobility Exercises']
  },
  {
    id: 'pathology',
    name: 'Pathology & Laboratory Medicine',
    specialistTitle: 'Pathologist',
    popularName: 'Diagnostic & Lab Specialist',
    icon: '🧪',
    category: 'Diagnostics & Other',
    qualification: 'MBBS, MD (Pathology)',
    description: 'Laboratory analysis of blood, tissue biopsies (histopathology), cytology, bone marrow, and molecular diagnostic testing.',
    commonConditions: ['Biopsy & Histopathology', 'Complete Blood Profiles', 'Cytology / Pap Smear', 'Immuno-histochemistry', 'Hormone & Tumor Markers', 'Microbiology Cultures']
  },
  {
    id: 'geriatrics',
    name: 'Geriatrics',
    specialistTitle: 'Geriatrician',
    popularName: 'Elderly & Senior Care Specialist',
    icon: '👵',
    category: 'Primary Care',
    qualification: 'MBBS, MD (Geriatric Medicine)',
    description: 'Comprehensive health assessments tailored for senior citizens, managing multiple chronic ailments, frailty, and polypharmacy.',
    commonConditions: ['Age-Related Frailty & Falls', 'Dementia & Alzheimer’s Care', 'Managing Multiple Medications', 'Mobility & Joint Stiffness', 'Senior Incontinence', 'Nutrition in Seniors']
  },
  {
    id: 'sexology',
    name: 'Sexology & Sexual Medicine',
    specialistTitle: 'Sexologist',
    popularName: 'Sexual Health & Wellness Specialist',
    icon: '❤️',
    category: 'Primary Care',
    qualification: 'MBBS, MD / FECSM (Sexual Medicine)',
    description: 'Confidential clinical consultation and scientific therapy for sexual dysfunction, intimacy issues, hormonal concerns, and counseling.',
    commonConditions: ['Erectile Dysfunction', 'Premature Ejaculation', 'Low Libido & Intimacy Issues', 'Performance Anxiety', 'Vaginismus & Dyspareunia', 'Sexual Health Counseling']
  },
  {
    id: 'ayurveda',
    name: 'Ayurveda & Integrative Medicine',
    specialistTitle: 'Ayurvedic Physician',
    popularName: 'Natural & Holistic Health Specialist',
    icon: '🌿',
    category: 'Primary Care',
    qualification: 'BAMS, MD (Ayurveda)',
    description: 'Traditional and evidence-informed Ayurvedic consultations, dosha balancing, herbal formulations, lifestyle medicine, and Panchakarma.',
    commonConditions: ['Chronic Acidity & Digestion', 'Joint Pain & Vata Imbalance', 'Skin Detoxification', 'Stress, Fatigue & Sleep', 'Metabolic Rejuvenation', 'Immunity Enhancement']
  }
]

// All canonical specialty names formatted for filters and select menus
export const canonicalSpecialtyNames = allMedicalFields.map(f => f.name)

// Lookup map for fast resolution: lowercased term -> canonical MedicalField
export const medicalFieldsLookup: Record<string, MedicalField> = {}
for (const field of allMedicalFields) {
  medicalFieldsLookup[field.id.toLowerCase()] = field
  medicalFieldsLookup[field.name.toLowerCase()] = field
  medicalFieldsLookup[field.specialistTitle.toLowerCase()] = field
  medicalFieldsLookup[field.popularName.toLowerCase()] = field
}

// Special alias mapping for user searches & legacy dataset terms
const aliasToCanonical: Record<string, string> = {
  'ent': 'ENT / Otolaryngology',
  'otolaryngology': 'ENT / Otolaryngology',
  'ear nose throat': 'ENT / Otolaryngology',
  'skin': 'Dermatology',
  'dermatologist': 'Dermatology',
  'heart': 'Cardiology',
  'cardiologist': 'Cardiology',
  'kids': 'Pediatrics',
  'child': 'Pediatrics',
  'children': 'Pediatrics',
  'pediatrician': 'Pediatrics',
  'women': 'Obstetrics & Gynecology',
  'obgyn': 'Obstetrics & Gynecology',
  'ob-gyn': 'Obstetrics & Gynecology',
  'gynecology': 'Obstetrics & Gynecology',
  'gynecologist': 'Obstetrics & Gynecology',
  'obstetrics': 'Obstetrics & Gynecology',
  'obstetrician': 'Obstetrics & Gynecology',
  'brain': 'Neurology',
  'neurologist': 'Neurology',
  'bone': 'Orthopedics',
  'bones': 'Orthopedics',
  'ortho': 'Orthopedics',
  'orthopedic': 'Orthopedics',
  'orthopedist': 'Orthopedics',
  'orthopedic surgeon': 'Orthopedics',
  'mind': 'Psychiatry',
  'psychiatrist': 'Psychiatry',
  'stomach': 'Gastroenterology',
  'gastro': 'Gastroenterology',
  'gastroenterologist': 'Gastroenterology',
  'cancer': 'Oncology',
  'oncologist': 'Oncology',
  'eye': 'Ophthalmology',
  'eyes': 'Ophthalmology',
  'ophthalmologist': 'Ophthalmology',
  'lungs': 'Pulmonology',
  'pulmonologist': 'Pulmonology',
  'respiratory': 'Pulmonology',
  'kidney': 'Nephrology',
  'kidneys': 'Nephrology',
  'nephrologist': 'Nephrology',
  'urine': 'Urology',
  'urinary': 'Urology',
  'urologist': 'Urology',
  'diabetes': 'Endocrinology',
  'thyroid': 'Endocrinology',
  'endocrinologist': 'Endocrinology',
  'physician': 'General Medicine',
  'general physician': 'General Medicine',
  'general medicine': 'General Medicine',
  'gp': 'General Medicine',
  'surgeon': 'General Surgery',
  'general surgeon': 'General Surgery',
  'dentist': 'Dentistry',
  'teeth': 'Dentistry',
  'dental': 'Dentistry',
  'arthritis': 'Rheumatology',
  'rheumatologist': 'Rheumatology',
  'x-ray': 'Radiology',
  'radiologist': 'Radiology',
  'scan': 'Radiology',
  'physio': 'Physiotherapy & Rehabilitation',
  'physiotherapy': 'Physiotherapy & Rehabilitation',
  'physiotherapist': 'Physiotherapy & Rehabilitation',
  'rehab': 'Physiotherapy & Rehabilitation',
  'sexologist': 'Sexology & Sexual Medicine',
  'elderly': 'Geriatrics',
  'geriatrician': 'Geriatrics',
  'ayurvedic': 'Ayurveda & Integrative Medicine',
}

for (const field of allMedicalFields) {
  field.aliases = Object.entries(aliasToCanonical)
    .filter(([_, canon]) => canon.toLowerCase() === field.name.toLowerCase())
    .map(([alias]) => alias)
  if (!field.aliases.includes(field.name.toLowerCase())) {
    field.aliases.push(field.name.toLowerCase())
  }
  if (!field.aliases.includes(field.specialistTitle.toLowerCase())) {
    field.aliases.push(field.specialistTitle.toLowerCase())
  }
}

/**
 * Resolve any input (specialty name, doctor title, symptom keyword, slang) to its canonical MedicalField
 */
export function resolveMedicalField(input: string): MedicalField | undefined {
  if (!input) return undefined
  const clean = input.trim().toLowerCase()
  if (medicalFieldsLookup[clean]) return medicalFieldsLookup[clean]
  if (aliasToCanonical[clean] && medicalFieldsLookup[aliasToCanonical[clean].toLowerCase()]) {
    return medicalFieldsLookup[aliasToCanonical[clean].toLowerCase()]
  }
  // Partial substring check
  for (const field of allMedicalFields) {
    if (clean.includes(field.name.toLowerCase()) || clean.includes(field.specialistTitle.toLowerCase())) {
      return field
    }
  }
  return undefined
}
