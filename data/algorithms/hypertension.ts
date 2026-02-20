import type { AlgorithmDefinition } from "@/lib/algorithmTypes";

const hypertension: AlgorithmDefinition = {
  id: "hypertension-mgmt",
  i18nKey: "hypertension",
  version: "1.0",
  guideline: "ACC/AHA 2017",
  startNodeId: "start",
  faq: [
    {
      question: "What is the first-line treatment for hypertension?",
      answer:
        "According to the ACC/AHA 2017 guidelines, first-line pharmacotherapy options include thiazide diuretics, ACE inhibitors (ACEi), angiotensin receptor blockers (ARBs), and calcium channel blockers (CCBs). The choice depends on the patient's comorbidities, race, and individual risk factors.",
    },
    {
      question: "When should you start antihypertensive medication?",
      answer:
        "Medication is recommended for Stage 2 hypertension (BP >= 140/90 mmHg) regardless of cardiovascular risk. For Stage 1 hypertension (BP 130-139/80-89 mmHg), medication is indicated when the 10-year ASCVD risk is >= 10% or if clinical cardiovascular disease is present.",
    },
    {
      question: "Why is ACEi or ARB preferred in patients with diabetes?",
      answer:
        "ACE inhibitors and ARBs provide renal protective effects beyond blood pressure lowering. They reduce intraglomerular pressure by dilating the efferent arteriole, slowing progression of diabetic nephropathy and reducing proteinuria.",
    },
    {
      question: "What lifestyle modifications lower blood pressure?",
      answer:
        "The ACC/AHA guidelines recommend the DASH diet (rich in fruits, vegetables, and low-fat dairy), sodium restriction to < 1500 mg/day, regular aerobic exercise (90-150 min/week), weight loss if overweight (each kg lost reduces BP by ~1 mmHg), and limiting alcohol intake.",
    },
    {
      question: "What are the ACC/AHA blood pressure categories?",
      answer:
        "Normal: < 120/80 mmHg. Elevated: 120-129/<80 mmHg. Stage 1 Hypertension: 130-139/80-89 mmHg. Stage 2 Hypertension: >= 140/90 mmHg. These thresholds were lowered from previous guidelines to enable earlier intervention.",
    },
  ],
  nodes: [
    {
      id: "start",
      type: "start",
      label: "Measure Blood Pressure",
      educationalContent: {
        why: "Accurate BP measurement is the foundation of hypertension management. The ACC/AHA guidelines emphasize using the mean of >= 2 readings on >= 2 occasions.",
        detail:
          "Use a validated device with appropriate cuff size. The patient should rest quietly for 5 minutes before measurement, feet flat on the floor, back supported, arm at heart level. Take at least 2 readings 1 minute apart and average them. Out-of-office measurements (ambulatory or home BP monitoring) are recommended to confirm the diagnosis.",
        keyPoints: [
          "Use mean of >= 2 readings on >= 2 occasions",
          "Proper cuff size prevents falsely high/low readings",
          "White coat and masked hypertension are common",
          "Ambulatory BP monitoring is the gold standard",
        ],
        references: [
          "Whelton PK, et al. 2017 ACC/AHA Hypertension Guideline. J Am Coll Cardiol. 2018;71(19):e127-e248.",
        ],
      },
    },
    {
      id: "bp_category",
      type: "question",
      label: "What is the BP category?",
      educationalContent: {
        why: "BP categories determine the urgency and type of intervention. The 2017 guidelines lowered thresholds to enable earlier treatment and reduce cardiovascular events.",
        detail:
          "The ACC/AHA 2017 guidelines define four categories: Normal (< 120/80), Elevated (120-129/<80), Stage 1 HTN (130-139/80-89), and Stage 2 HTN (>= 140/90). This classification replaced the former 'prehypertension' category. If systolic and diastolic fall into different categories, use the higher category.",
        keyPoints: [
          "Normal: < 120/80 mmHg",
          "Elevated: 120-129 / <80 mmHg",
          "Stage 1: 130-139 / 80-89 mmHg",
          "Stage 2: >= 140 / >= 90 mmHg",
          "Use the higher category if SBP and DBP differ",
        ],
      },
    },
    {
      id: "normal_bp",
      type: "outcome",
      label: "Normal BP — Reassess in 1 Year",
      educationalContent: {
        why: "Even with normal BP, annual reassessment catches the natural rise in BP with aging and lifestyle changes.",
        detail:
          "Promote heart-healthy lifestyle habits. BP tends to rise with age, so continued monitoring is essential. Encourage the DASH diet, regular physical activity, healthy weight, limited alcohol, and sodium restriction as primary prevention.",
        keyPoints: [
          "Reassess annually",
          "Promote healthy lifestyle as primary prevention",
          "BP naturally rises with age",
        ],
      },
    },
    {
      id: "elevated_bp",
      type: "action",
      label: "Elevated BP — Lifestyle Modifications",
      educationalContent: {
        why: "Elevated BP is a precursor to hypertension. Lifestyle changes alone can prevent progression and reduce BP by 4-11 mmHg.",
        detail:
          "Non-pharmacologic interventions are the primary treatment for elevated BP. These include: DASH diet (-11 mmHg), sodium reduction to <1500 mg/day (-5-6 mmHg), increased potassium intake, weight loss (-1 mmHg per kg), physical activity 90-150 min/week (-5-8 mmHg), and moderate alcohol consumption (-4 mmHg).",
        keyPoints: [
          "No medication at this stage",
          "DASH diet can lower BP by ~11 mmHg",
          "Weight loss: ~1 mmHg reduction per kg lost",
          "Exercise: 90-150 min/week of aerobic activity",
          "Reassess in 3-6 months",
        ],
      },
    },
    {
      id: "stage1_risk",
      type: "question",
      label: "Stage 1 HTN — Is 10-year ASCVD risk >= 10%?",
      educationalContent: {
        why: "The 10-year ASCVD risk score determines whether Stage 1 patients need medication or can be managed with lifestyle changes alone. This risk-based approach prevents overtreatment of low-risk individuals.",
        detail:
          "Calculate the 10-year atherosclerotic cardiovascular disease (ASCVD) risk using the Pooled Cohort Equations. This considers age, sex, race, total and HDL cholesterol, systolic BP, BP treatment status, diabetes, and smoking status. Also consider clinical ASCVD (prior MI, stroke, PAD), diabetes mellitus, or CKD as automatic indications for pharmacotherapy.",
        keyPoints: [
          "Use the Pooled Cohort Equations calculator",
          "Clinical CVD, DM, or CKD = automatic indication for medication",
          "Risk >= 10% → start medication + lifestyle changes",
          "Risk < 10% → lifestyle changes only, reassess in 3-6 months",
        ],
      },
    },
    {
      id: "stage1_low_risk",
      type: "action",
      label: "Stage 1, Low Risk — Lifestyle Modifications",
      educationalContent: {
        why: "In low-risk Stage 1 patients, lifestyle modifications alone can normalize BP without exposing patients to medication side effects. Many patients can avoid lifelong pharmacotherapy.",
        detail:
          "Implement the same non-pharmacologic interventions as elevated BP. Reassess in 3-6 months. If BP remains at Stage 1 or worsens, recalculate ASCVD risk and consider initiating pharmacotherapy.",
        keyPoints: [
          "Same lifestyle interventions as elevated BP",
          "Reassess in 3-6 months",
          "If BP persists, reconsider medication",
        ],
      },
    },
    {
      id: "stage1_high_risk",
      type: "decision",
      label: "Stage 1, High Risk — Start Medication + Lifestyle",
      educationalContent: {
        why: "When ASCVD risk is >= 10%, the benefit of pharmacotherapy outweighs the risks. Treating at this threshold prevents approximately 1 cardiovascular event per 70 patients treated over 10 years.",
        detail:
          "Initiate a single antihypertensive agent alongside lifestyle modifications. First-line agents include: thiazide/thiazide-type diuretics (e.g., chlorthalidone), ACE inhibitors, ARBs, or CCBs. The choice depends on compelling indications (comorbidities).",
        keyPoints: [
          "Start one first-line agent",
          "Always combine with lifestyle modifications",
          "Target BP: generally < 130/80 mmHg",
        ],
      },
    },
    {
      id: "stage2",
      type: "decision",
      label: "Stage 2 HTN — Start Medication + Lifestyle",
      educationalContent: {
        why: "Stage 2 hypertension carries significant cardiovascular risk regardless of ASCVD score. All patients need pharmacotherapy. Two-drug combination is often needed to reach target.",
        detail:
          "Consider initiating two first-line agents of different classes, especially if BP is > 20/10 mmHg above goal. This approach achieves faster BP control and reduces the number of follow-up visits needed for titration. Combination therapy with two drugs from different classes is more effective than maximizing a single drug.",
        keyPoints: [
          "Medication indicated regardless of ASCVD risk",
          "Consider starting with 2-drug combination",
          "Two drugs if BP > 20/10 mmHg above goal",
          "Always add lifestyle modifications",
        ],
      },
    },
    {
      id: "compelling",
      type: "question",
      label: "Any compelling indications?",
      educationalContent: {
        why: "Compelling indications (comorbidities) determine which antihypertensive class provides the most benefit beyond BP lowering. Choosing the right drug can slow disease progression and reduce mortality.",
        detail:
          "Key compelling indications include: diabetes mellitus (prefer ACEi/ARB for renal protection), chronic kidney disease (ACEi/ARB to reduce proteinuria), heart failure with reduced EF (ACEi/ARB + beta-blocker + diuretic), coronary artery disease (ACEi/ARB + beta-blocker), and history of stroke (ACEi + thiazide).",
        keyPoints: [
          "Diabetes → ACEi or ARB",
          "CKD with proteinuria → ACEi or ARB",
          "Heart failure (HFrEF) → ACEi/ARB + beta-blocker",
          "Stable CAD → ACEi/ARB + beta-blocker",
          "Prior stroke → ACEi + thiazide",
          "Never combine ACEi + ARB",
        ],
      },
    },
    {
      id: "diabetes_ckd",
      type: "outcome",
      label: "Start ACEi or ARB",
      educationalContent: {
        why: "ACE inhibitors and ARBs dilate the efferent arteriole, reducing intraglomerular pressure. This provides renal protection beyond what BP lowering alone achieves.",
        detail:
          "Start an ACEi (e.g., lisinopril 10 mg daily) or ARB (e.g., losartan 50 mg daily). Monitor serum creatinine and potassium within 2-4 weeks of initiation. A rise in creatinine up to 30% is acceptable and expected. Hyperkalemia risk is increased, especially with CKD. Never combine ACEi + ARB due to increased adverse events without additional benefit (ONTARGET trial).",
        keyPoints: [
          "Check Cr and K+ within 2-4 weeks",
          "Up to 30% rise in creatinine is acceptable",
          "Watch for hyperkalemia",
          "Never combine ACEi + ARB",
          "Contraindicated in pregnancy",
        ],
        references: [
          "ONTARGET Investigators. N Engl J Med. 2008;358(15):1547-1559.",
        ],
      },
    },
    {
      id: "hf",
      type: "outcome",
      label: "ACEi/ARB + Beta-Blocker + Diuretic",
      educationalContent: {
        why: "Heart failure with reduced ejection fraction requires neurohormonal blockade. ACEi/ARBs and beta-blockers reduce mortality, while diuretics manage fluid overload.",
        detail:
          "Guideline-directed medical therapy (GDMT) for HFrEF includes ACEi/ARB (or ARNI if tolerated), evidence-based beta-blocker (carvedilol, metoprolol succinate, or bisoprolol), and a diuretic for volume management. Add mineralocorticoid receptor antagonist (spironolactone/eplerenone) if EF <= 35% and NYHA II-IV.",
        keyPoints: [
          "ACEi/ARB (or sacubitril/valsartan)",
          "Beta-blocker: carvedilol, metoprolol succinate, or bisoprolol",
          "Loop diuretic for volume overload",
          "Consider MRA if EF <= 35%",
          "Titrate to target doses",
        ],
      },
    },
    {
      id: "no_compelling",
      type: "question",
      label: "Is the patient Black?",
      educationalContent: {
        why: "Black patients have a higher prevalence of hypertension, earlier onset, and greater target organ damage. They also show reduced response to ACEi/ARB monotherapy due to lower renin levels.",
        detail:
          "The ALLHAT trial demonstrated that Black patients respond better to thiazide diuretics and CCBs as initial therapy compared to ACEi. The lower plasma renin activity commonly seen in Black patients explains the reduced efficacy of RAAS inhibitors as monotherapy. However, if a compelling indication exists (e.g., diabetes with proteinuria), ACEi/ARB should still be used.",
        keyPoints: [
          "First-line: CCB or thiazide diuretic",
          "ACEi/ARBs less effective as monotherapy",
          "Lower plasma renin activity explains the difference",
          "If compelling indication exists, ACEi/ARB still appropriate",
        ],
        references: [
          "ALLHAT Officers. JAMA. 2002;288(23):2981-2997.",
        ],
      },
    },
    {
      id: "black_initial",
      type: "outcome",
      label: "Start CCB or Thiazide Diuretic",
      educationalContent: {
        why: "CCBs and thiazide diuretics are more effective as initial monotherapy in Black patients, producing greater BP reduction compared to ACEi/ARB.",
        detail:
          "Start amlodipine 5 mg daily (CCB) or chlorthalidone 12.5-25 mg daily (thiazide-type diuretic). Chlorthalidone is preferred over hydrochlorothiazide due to longer half-life and stronger evidence for cardiovascular outcome reduction. Monitor electrolytes with thiazides (hypokalemia, hyponatremia, hyperuricemia).",
        keyPoints: [
          "CCB: amlodipine 5 mg daily is a common choice",
          "Thiazide: chlorthalidone preferred over HCTZ",
          "Monitor K+, Na+, uric acid with thiazides",
          "Both classes well-tolerated",
        ],
      },
    },
    {
      id: "nonblack_initial",
      type: "outcome",
      label: "Start Thiazide, ACEi, ARB, or CCB",
      educationalContent: {
        why: "All four first-line classes have comparable efficacy in non-Black patients. Selection is based on individual factors, tolerability, and cost.",
        detail:
          "Any of the four first-line classes can be used: thiazide/thiazide-type diuretic, ACEi, ARB, or CCB. Consider patient-specific factors: younger patients may prefer ACEi/ARB; those with osteoporosis may benefit from thiazides (calcium retention); CCBs are well-tolerated and especially useful in elderly patients. Avoid ACEi/ARB in women of childbearing potential unless contraception is reliable.",
        keyPoints: [
          "All four classes are appropriate first-line",
          "ACEi: common side effect is dry cough (switch to ARB)",
          "Thiazide: metabolic effects (monitor glucose, K+, uric acid)",
          "CCB: ankle edema is common; dihydropyridine type preferred",
          "ARB: if ACEi cough occurs",
        ],
      },
    },
    {
      id: "followup",
      type: "question",
      label: "Follow up in 1 month — BP at goal (<130/80)?",
      educationalContent: {
        why: "One month allows the drug to reach steady state and for lifestyle modifications to take effect. Early reassessment prevents prolonged uncontrolled hypertension.",
        detail:
          "At the follow-up visit, re-measure BP using proper technique. Assess medication adherence, side effects, and lifestyle changes. Confirm BP with home monitoring if possible. The target for most adults is < 130/80 mmHg (SPRINT trial showed benefit of intensive treatment to < 120 mmHg systolic in high-risk patients, but this must be balanced against adverse effects).",
        keyPoints: [
          "Target: < 130/80 mmHg for most adults",
          "Assess adherence and side effects",
          "Home BP monitoring improves accuracy",
          "Consider more aggressive target (<120 systolic) for very high-risk patients",
        ],
        references: [
          "SPRINT Research Group. N Engl J Med. 2015;373(22):2103-2116.",
        ],
      },
    },
    {
      id: "at_goal",
      type: "outcome",
      label: "BP at Goal — Continue Current Therapy",
      educationalContent: {
        why: "Maintaining BP at goal requires ongoing therapy and monitoring. Hypertension is a chronic condition, and discontinuation usually leads to BP rising again.",
        detail:
          "Continue the current regimen and reassess every 3-6 months. Reinforce lifestyle modifications. Ensure the patient understands that antihypertensive therapy is typically lifelong. Monitor for side effects, drug interactions, and comorbidity development. Annual labs (metabolic panel, lipids) are recommended.",
        keyPoints: [
          "Reassess every 3-6 months",
          "Therapy is usually lifelong",
          "Continue lifestyle modifications",
          "Annual laboratory monitoring",
        ],
      },
    },
    {
      id: "not_at_goal",
      type: "action",
      label: "Titrate or Add Second Agent",
      educationalContent: {
        why: "Most patients require 2 or more medications to achieve BP goals. Adding a second agent from a different class is often more effective than maximizing the dose of a single drug.",
        detail:
          "Options: (1) Titrate the current drug to maximum dose, or (2) Add a second agent from a different first-line class. Preferred combinations include ACEi/ARB + CCB, ACEi/ARB + thiazide, or CCB + thiazide. Avoid combining ACEi + ARB. If three drugs are needed, use ACEi/ARB + CCB + thiazide. If still uncontrolled on 3 drugs including a diuretic at optimal doses, this is classified as resistant hypertension.",
        keyPoints: [
          "Add second drug from different class",
          "Preferred: ACEi/ARB + CCB or ACEi/ARB + thiazide",
          "Never combine ACEi + ARB",
          "3 drugs including diuretic at max dose = resistant HTN",
          "Consider secondary causes if resistant",
        ],
      },
    },
  ],
  edges: [
    {
      id: "e-start-cat",
      source: "start",
      target: "bp_category",
      label: "Classify",
      educationalNote:
        "Classification is based on the mean of properly measured readings.",
    },
    {
      id: "e-cat-normal",
      source: "bp_category",
      target: "normal_bp",
      label: "Normal (<120/80)",
    },
    {
      id: "e-cat-elevated",
      source: "bp_category",
      target: "elevated_bp",
      label: "Elevated (120-129/<80)",
    },
    {
      id: "e-cat-stage1",
      source: "bp_category",
      target: "stage1_risk",
      label: "Stage 1 (130-139/80-89)",
    },
    {
      id: "e-cat-stage2",
      source: "bp_category",
      target: "stage2",
      label: "Stage 2 (>=140/90)",
    },
    {
      id: "e-s1-low",
      source: "stage1_risk",
      target: "stage1_low_risk",
      label: "No (<10%)",
      educationalNote:
        "Low-risk patients can often normalize BP with lifestyle changes alone.",
    },
    {
      id: "e-s1-high",
      source: "stage1_risk",
      target: "stage1_high_risk",
      label: "Yes (>=10%)",
      educationalNote:
        "High ASCVD risk means the benefit of pharmacotherapy outweighs potential side effects.",
    },
    {
      id: "e-s1hr-compelling",
      source: "stage1_high_risk",
      target: "compelling",
      label: "Select agent",
    },
    {
      id: "e-s2-compelling",
      source: "stage2",
      target: "compelling",
      label: "Select agent(s)",
    },
    {
      id: "e-comp-dm",
      source: "compelling",
      target: "diabetes_ckd",
      label: "Diabetes or CKD",
      educationalNote:
        "Renal protection is the primary reason for ACEi/ARB preference in these patients.",
    },
    {
      id: "e-comp-hf",
      source: "compelling",
      target: "hf",
      label: "Heart Failure",
      educationalNote:
        "HFrEF requires specific GDMT for mortality reduction, not just BP lowering.",
    },
    {
      id: "e-comp-none",
      source: "compelling",
      target: "no_compelling",
      label: "No compelling indication",
    },
    {
      id: "e-race-black",
      source: "no_compelling",
      target: "black_initial",
      label: "Yes",
      educationalNote:
        "Lower renin levels explain why RAAS inhibitors are less effective as monotherapy.",
    },
    {
      id: "e-race-nonblack",
      source: "no_compelling",
      target: "nonblack_initial",
      label: "No",
    },
    {
      id: "e-dm-followup",
      source: "diabetes_ckd",
      target: "followup",
      label: "Follow up",
    },
    {
      id: "e-hf-followup",
      source: "hf",
      target: "followup",
      label: "Follow up",
    },
    {
      id: "e-black-followup",
      source: "black_initial",
      target: "followup",
      label: "Follow up",
    },
    {
      id: "e-nonblack-followup",
      source: "nonblack_initial",
      target: "followup",
      label: "Follow up",
    },
    {
      id: "e-fu-goal",
      source: "followup",
      target: "at_goal",
      label: "Yes",
    },
    {
      id: "e-fu-nogoal",
      source: "followup",
      target: "not_at_goal",
      label: "No",
    },
    {
      id: "e-notgoal-followup",
      source: "not_at_goal",
      target: "followup",
      label: "Reassess in 1 month",
      educationalNote:
        "The cycle of titrate/add → reassess continues until BP is controlled or resistant HTN is identified.",
    },
  ],
};

export default hypertension;
