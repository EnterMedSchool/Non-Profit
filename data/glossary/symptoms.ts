/* ================================================================== */
/*  Curated Symptom Index for Glossary                                */
/*  Each symptom maps a slug → display name + keyword patterns        */
/*  used to match against term.how_youll_see_it[] entries.            */
/* ================================================================== */

export interface SymptomEntry {
  slug: string;
  name: string;
  /** Keywords to match in how_youll_see_it (case-insensitive) */
  keywords: string[];
  /** Brief description for SEO intro text */
  description: string;
}

export const curatedSymptoms: SymptomEntry[] = [
  { slug: "fever", name: "Fever", keywords: ["fever", "febrile", "pyrexia"], description: "Elevation of body temperature above 38°C (100.4°F), commonly indicating infection, inflammation, or autoimmune processes." },
  { slug: "chest-pain", name: "Chest Pain", keywords: ["chest pain", "precordial pain", "angina"], description: "Pain or discomfort in the thoracic region, which can originate from cardiac, pulmonary, gastrointestinal, or musculoskeletal causes." },
  { slug: "abdominal-pain", name: "Abdominal Pain", keywords: ["abdominal pain", "belly pain", "abdominal tenderness"], description: "Pain localized to the abdomen, one of the most common presenting complaints in clinical medicine." },
  { slug: "dyspnea", name: "Dyspnea", keywords: ["dyspnea", "shortness of breath", "difficulty breathing", "breathlessness"], description: "Subjective sensation of difficulty breathing or air hunger, with cardiac and pulmonary causes being most common." },
  { slug: "edema", name: "Edema", keywords: ["edema", "oedema", "swelling", "pitting edema"], description: "Abnormal accumulation of fluid in interstitial spaces, which can be localized or generalized." },
  { slug: "jaundice", name: "Jaundice", keywords: ["jaundice", "icterus", "yellowing", "scleral icterus"], description: "Yellow discoloration of skin and sclerae due to elevated bilirubin levels, classified as pre-hepatic, hepatic, or post-hepatic." },
  { slug: "rash", name: "Rash", keywords: ["rash", "skin lesion", "eruption", "dermatitis", "exanthem"], description: "Visible change in skin texture or color, which can be a sign of infectious, autoimmune, allergic, or neoplastic conditions." },
  { slug: "fatigue", name: "Fatigue", keywords: ["fatigue", "lethargy", "malaise", "tiredness"], description: "Persistent feeling of exhaustion or reduced energy that is not relieved by rest, associated with many systemic conditions." },
  { slug: "nausea-vomiting", name: "Nausea & Vomiting", keywords: ["nausea", "vomiting", "emesis"], description: "Common gastrointestinal symptoms that can indicate GI, CNS, metabolic, or drug-related disorders." },
  { slug: "diarrhea", name: "Diarrhea", keywords: ["diarrhea", "diarrhoea", "loose stool", "watery stool"], description: "Increase in stool frequency, fluidity, or volume, classified as acute or chronic and osmotic or secretory." },
  { slug: "cough", name: "Cough", keywords: ["cough", "hemoptysis"], description: "Protective reflex clearing the airways; can be acute or chronic, productive or non-productive." },
  { slug: "headache", name: "Headache", keywords: ["headache", "cephalgia", "head pain"], description: "Pain in the head or upper neck region, classified as primary (migraine, tension) or secondary (intracranial pathology)." },
  { slug: "weight-loss", name: "Weight Loss", keywords: ["weight loss", "cachexia", "wasting"], description: "Unintentional decrease in body weight that can signal malignancy, endocrine disorders, infections, or malabsorption." },
  { slug: "bleeding", name: "Bleeding", keywords: ["bleeding", "hemorrhage", "haemorrhage", "hematoma"], description: "Abnormal loss of blood from the circulatory system, which may be external or internal." },
  { slug: "hypertension", name: "Hypertension", keywords: ["hypertension", "elevated blood pressure", "high blood pressure"], description: "Sustained elevation of systemic blood pressure above 140/90 mmHg, a major risk factor for cardiovascular disease." },
  { slug: "hypotension", name: "Hypotension", keywords: ["hypotension", "low blood pressure"], description: "Abnormally low blood pressure, commonly associated with shock states, dehydration, or medication effects." },
  { slug: "tachycardia", name: "Tachycardia", keywords: ["tachycardia", "rapid heart rate"], description: "Heart rate exceeding 100 beats per minute, which can be sinus, supraventricular, or ventricular in origin." },
  { slug: "seizure", name: "Seizures", keywords: ["seizure", "convulsion", "epilep"], description: "Sudden abnormal electrical activity in the brain causing involuntary movements, sensations, or altered consciousness." },
  { slug: "confusion", name: "Confusion & Altered Mental Status", keywords: ["confusion", "altered mental status", "delirium", "disorientation"], description: "Impaired cognitive function manifesting as disorientation, inattention, or incoherent thinking." },
  { slug: "hematuria", name: "Hematuria", keywords: ["hematuria", "blood in urine"], description: "Presence of red blood cells in urine, either gross or microscopic, indicating urologic or nephrologic pathology." },
  { slug: "anemia", name: "Anemia", keywords: ["anemia", "anaemia", "pallor", "low hemoglobin"], description: "Decreased hemoglobin or red blood cell count, classified by MCV as microcytic, normocytic, or macrocytic." },
  { slug: "murmur", name: "Heart Murmur", keywords: ["murmur", "cardiac murmur"], description: "Abnormal heart sound produced by turbulent blood flow through the valves or chambers." },
  { slug: "dysphagia", name: "Dysphagia", keywords: ["dysphagia", "difficulty swallowing"], description: "Difficulty in swallowing, classified as oropharyngeal or esophageal, and can indicate stricture, motility disorder, or malignancy." },
  { slug: "numbness-tingling", name: "Numbness & Tingling", keywords: ["numbness", "tingling", "paresthesia", "paraesthesia"], description: "Abnormal sensations in the extremities, often indicating peripheral neuropathy or nerve compression." },
  { slug: "joint-pain", name: "Joint Pain", keywords: ["joint pain", "arthralgia", "arthritis"], description: "Pain affecting one or more joints, which can be inflammatory (arthritis) or non-inflammatory (arthralgia)." },
  { slug: "muscle-weakness", name: "Muscle Weakness", keywords: ["weakness", "muscle weakness", "myopathy", "paresis"], description: "Reduced muscle strength that may be caused by neurologic, muscular, metabolic, or endocrine disorders." },
  { slug: "constipation", name: "Constipation", keywords: ["constipation", "obstipation"], description: "Infrequent or difficult passage of stool, which can be functional or secondary to medications, obstruction, or systemic disease." },
  { slug: "oliguria", name: "Oliguria", keywords: ["oliguria", "decreased urine output", "anuria"], description: "Urine output less than 400 mL/day, a key indicator of acute kidney injury or pre-renal hypoperfusion." },
  { slug: "lymphadenopathy", name: "Lymphadenopathy", keywords: ["lymphadenopathy", "swollen lymph node", "lymph node"], description: "Enlargement of lymph nodes, which may be localized or generalized, reactive or neoplastic." },
  { slug: "hepatomegaly", name: "Hepatomegaly", keywords: ["hepatomegaly", "enlarged liver", "liver enlargement"], description: "Enlargement of the liver beyond its normal size, detectable on physical examination or imaging." },
  { slug: "splenomegaly", name: "Splenomegaly", keywords: ["splenomegaly", "enlarged spleen", "spleen enlargement"], description: "Enlargement of the spleen, commonly caused by infection, hemolytic anemia, portal hypertension, or hematologic malignancy." },
  { slug: "ascites", name: "Ascites", keywords: ["ascites", "abdominal distension", "fluid collection"], description: "Pathological accumulation of fluid in the peritoneal cavity, most commonly due to portal hypertension from cirrhosis." },
  { slug: "hemoptysis", name: "Hemoptysis", keywords: ["hemoptysis", "coughing blood", "blood-tinged sputum"], description: "Expectoration of blood originating from the lower respiratory tract, requiring urgent evaluation to rule out malignancy or PE." },
  { slug: "syncope", name: "Syncope", keywords: ["syncope", "fainting", "loss of consciousness"], description: "Transient loss of consciousness due to cerebral hypoperfusion, with a broad differential including cardiac, neurologic, and vasovagal causes." },
  { slug: "palpitations", name: "Palpitations", keywords: ["palpitation", "fluttering", "racing heart"], description: "Awareness of one's heartbeat, which may be benign or indicate arrhythmia, thyrotoxicosis, or anxiety." },
  { slug: "stridor", name: "Stridor", keywords: ["stridor", "inspiratory wheeze", "upper airway obstruction"], description: "High-pitched sound produced by turbulent airflow through a narrowed upper airway, indicating potential emergency." },
  { slug: "wheezing", name: "Wheezing", keywords: ["wheeze", "wheezing", "bronchospasm"], description: "High-pitched whistling sound during expiration, classically associated with asthma and COPD." },
  { slug: "polyuria", name: "Polyuria", keywords: ["polyuria", "frequent urination", "increased urine output"], description: "Excretion of abnormally large volumes of urine (>3L/day), seen in diabetes mellitus, diabetes insipidus, and diuretic use." },
  { slug: "proteinuria", name: "Proteinuria", keywords: ["proteinuria", "protein in urine", "albuminuria"], description: "Abnormal presence of protein in urine, a hallmark of glomerular disease and an important marker of kidney damage." },
  { slug: "petechiae", name: "Petechiae & Purpura", keywords: ["petechiae", "purpura", "ecchymosis"], description: "Small non-blanching skin hemorrhages (petechiae <2mm, purpura 2-10mm) indicating thrombocytopenia or vasculitis." },
  { slug: "pruritus", name: "Pruritus", keywords: ["pruritus", "itching", "itch"], description: "Uncomfortable skin sensation provoking the desire to scratch, which can be localized (dermatologic) or generalized (systemic)." },
  { slug: "tremor", name: "Tremor", keywords: ["tremor", "shaking", "involuntary movement"], description: "Involuntary rhythmic oscillation of a body part, classified as resting, postural, or intention tremor." },
  { slug: "cyanosis", name: "Cyanosis", keywords: ["cyanosis", "bluish discoloration", "blue skin"], description: "Bluish discoloration of the skin and mucous membranes caused by increased concentration of deoxygenated hemoglobin." },
  { slug: "clubbing", name: "Digital Clubbing", keywords: ["clubbing", "digital clubbing", "nail clubbing"], description: "Bulbous enlargement of the distal phalanges with nail curvature, associated with chronic hypoxia, lung cancer, and endocarditis." },
  { slug: "diplopia", name: "Diplopia", keywords: ["diplopia", "double vision"], description: "Perception of two images of a single object, which can be monocular or binocular and indicates cranial nerve or ocular pathology." },
];
