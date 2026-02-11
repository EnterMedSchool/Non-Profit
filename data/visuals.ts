// ─── Types ──────────────────────────────────────────────────────────────────

export type FactCategory =
  | "pathology"
  | "drug"
  | "anatomy"
  | "symptom"
  | "diagnostic"
  | "treatment"
  | "mnemonic";

export interface KeyFact {
  category: FactCategory;
  term: string;
  description: string;
  visualCue?: string;
}

export interface VisualLayer {
  index: number;
  name: string;
  imagePath: string;
  audioPath: string;
  sfxPath?: string;
  /** Full narration script text shown as subtitles while audio plays */
  narration?: string;
}

export interface VisualLesson {
  id: string;
  language: string;
  embedId: string;
  title: string;
  category: string;
  subcategory: string;
  thumbnailPath: string;
  basePath: string;
  layers: VisualLayer[];
  duration: string;
  hasSubtitles: boolean;
  description: string;
  creator: { name: string; url?: string };
  tags: string[];
  keyFacts: KeyFact[];
}

// ─── Category Colors ────────────────────────────────────────────────────────

export const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  GI: { bg: "bg-showcase-green/10", text: "text-showcase-green", border: "border-showcase-green" },
  Pharmacology: { bg: "bg-showcase-purple/10", text: "text-showcase-purple", border: "border-showcase-purple" },
  Hematology: { bg: "bg-showcase-coral/10", text: "text-showcase-coral", border: "border-showcase-coral" },
};

// ─── Fact Category Config ───────────────────────────────────────────────────

export const factCategoryConfig: Record<FactCategory, { label: string; emoji: string }> = {
  pathology: { label: "Diseases", emoji: "🦠" },
  drug: { label: "Drugs", emoji: "💊" },
  anatomy: { label: "Anatomy", emoji: "🫀" },
  symptom: { label: "Symptoms", emoji: "🤒" },
  diagnostic: { label: "Diagnostics", emoji: "🔬" },
  treatment: { label: "Treatments", emoji: "💉" },
  mnemonic: { label: "Memory Aids", emoji: "💡" },
};

// ─── Default creator ────────────────────────────────────────────────────────

const defaultCreator = { name: "Ari Horesh", url: "https://entermedschool.com" };

// ─── Lesson Data ────────────────────────────────────────────────────────────

export const visualLessons: VisualLesson[] = [
  {
    id: "achalasia",
    language: "en",
    embedId: "achalasia",
    title: "Achalasia",
    category: "GI",
    subcategory: "Achalasia",
    thumbnailPath: "/visuals/gi/achalasia/thumbnail.png",
    basePath: "/visuals/gi/achalasia",
    duration: "~6 min",
    hasSubtitles: true,
    description: "Visual lesson on achalasia — the LES bodyguard, cancer crab, progressive food & drink, and the bird-beak sign.",
    creator: defaultCreator,
    tags: ["achalasia", "LES", "dysphagia", "esophageal motility", "bird beak sign", "manometry", "Chagas disease", "myenteric plexus"],
    keyFacts: [
      { category: "pathology", term: "Achalasia", description: "Failure of the lower esophageal sphincter (LES) to relax, causing dysphagia to both solids AND liquids", visualCue: "The bouncer blocking the club entrance who won't let anyone in" },
      { category: "anatomy", term: "Lower Esophageal Sphincter (LES)", description: "The muscular valve between esophagus and stomach; in achalasia, has increased resting pressure", visualCue: "The tight 'club entrance' at the end of the esophagus hallway" },
      { category: "mnemonic", term: "NO RELAX", description: "Memory aid: the LES fails to relax in achalasia; also hints at loss of NO (nitric oxide)", visualCue: "The neon sign above the club door: 'NO RELAX! THE SPHINCTER CLUB'" },
      { category: "pathology", term: "Chagas Disease", description: "Secondary achalasia caused by Trypanosoma cruzi (spread by kissing bug) damaging myenteric plexus", visualCue: "The bouncer's ridiculously big lips — 'kissing' clue for kissing bug" },
      { category: "anatomy", term: "Myenteric (Auerbach) Plexus", description: "Nerve network in esophageal wall containing inhibitory neurons that release NO + VIP to relax LES", visualCue: "The 'backstage managers' that tell the bouncer to relax" },
      { category: "drug", term: "Nitric Oxide (NO) & VIP", description: "Inhibitory neurotransmitters that normally relax the LES; lost in achalasia due to neuron degeneration", visualCue: "VIP-badge-wearing guests being told 'NO!' by the bouncer" },
      { category: "pathology", term: "Pseudoachalasia", description: "Achalasia-like picture caused by malignancy (mass effect or paraneoplastic effects)", visualCue: "The crab on a leash — cancer can CAUSE an achalasia-like syndrome" },
      { category: "symptom", term: "Progressive Dysphagia", description: "Difficulty swallowing that worsens over time; in achalasia, affects BOTH solids and liquids (unlike mechanical obstruction)", visualCue: "Party crowd with burgers (solids) and drinks (liquids) — both get stuck" },
      { category: "diagnostic", term: "Manometry", description: "Shows increased LES resting pressure + absent/uncoordinated peristalsis — gold standard for diagnosis", visualCue: "The uncoordinated dancing crowd — no rhythm = no coordinated peristalsis" },
      { category: "diagnostic", term: "Bird's Beak Sign", description: "Classic barium swallow finding: dilated esophagus tapering to narrow GE junction", visualCue: "Painter painting a white bird with long beak using 'BARIUM WHITE' paint" },
      { category: "treatment", term: "Botulinum Toxin (Botox)", description: "Endoscopic injection to help LES relax — 'Botox for the bouncer'", visualCue: "Treatment to get past the bouncer — make him relax" },
    ],
    layers: [
      { index: 1, name: "Background", imagePath: "/visuals/gi/achalasia/layer-1-background.png", audioPath: "/visuals/gi/achalasia/audio/layer-1.mp3", sfxPath: "/visuals/gi/achalasia/sfx/layer-1-sfx.mp3", narration: "Welcome back to EnterMedSchool\u2014this is Leo.\nToday we\u2019re stepping into the Sphincter Club, where the bouncer has one rule: NO RELAX.\n\nThis whole hallway is your esophagus, and notice how it funnels down toward that tight entrance\u2014that\u2019s the lower esophageal sphincter, the LES.\n\nIn achalasia, the LES fails to relax, so the distal esophagus becomes this tight \u2018club entrance\u2019 that won\u2019t open when it should.\nAnd because the entrance stays tight, pressure builds\u2014think increased LES resting pressure\u2014and everything upstream starts backing up like a line outside a club at midnight." },
      { index: 2, name: "LES Bodyguard", imagePath: "/visuals/gi/achalasia/layer-2-bodyguard.png", audioPath: "/visuals/gi/achalasia/audio/layer-2.mp3", sfxPath: "/visuals/gi/achalasia/sfx/layer-2-sfx.mp3", narration: "And here comes the main character: the massive bouncer posted at the door.\nThis is the LES in achalasia\u2014too tight, won\u2019t relax, and basically says, \u2018Yeah\u2026 nobody\u2019s getting into the stomach tonight.\u2019\n\nSo patients feel it as dysphagia\u2014and achalasia is famous in medical school because it causes progressive dysphagia\u2026 not just for solids, but solids AND liquids.\n\nNow check out those ridiculously huge lips. That\u2019s your \u2018kissing\u2019 clue: Chagas disease from Trypanosoma cruzi, spread by the kissing bug, can damage the nerves that normally tell this bouncer to chill out\u2014so Chagas can cause secondary achalasia." },
      { index: 3, name: "No VIP", imagePath: "/visuals/gi/achalasia/layer-3-novip.png", audioPath: "/visuals/gi/achalasia/audio/layer-3.mp3", sfxPath: "/visuals/gi/achalasia/sfx/layer-3-sfx.mp3", narration: "Now look who\u2019s getting rejected: the VIPs\u2026 and the bouncer literally screams \u2018NO!\u2019\n\nThat\u2019s not just attitude\u2014it\u2019s physiology.\nNormally, the myenteric (Auerbach) plexus in the esophageal wall has inhibitory neurons that release NO and VIP. These are the \u2018backstage managers\u2019 that tell the LES, \u2018Open the door, relax the muscle.\u2019\n\nIn achalasia, those inhibitory neurons degenerate\u2014so the LES loses its relaxation signals.\nTranslation: the bouncer never gets the \u2018VIP + NO\u2019 memo, so the door stays tight and the line outside gets longer." },
      { index: 4, name: "Cancer Crab", imagePath: "/visuals/gi/achalasia/layer-4-crab.png", audioPath: "/visuals/gi/achalasia/audio/layer-4.mp3", sfxPath: "/visuals/gi/achalasia/sfx/layer-4-sfx.mp3", narration: "And instead of a normal guard dog\u2026 he\u2019s got a crab on a leash.\nIn medical school, crabs almost always scream cancer, and here the crab has two jobs.\n\nJob one: an extraesophageal malignancy can create secondary achalasia\u2014either by mass effect squeezing things from the outside, or via paraneoplastic effects messing with nerve function. So cancer can cause an achalasia-like picture.\n\nJob two: long-standing achalasia is associated with an increased risk of esophageal cancer\u2014because chronic stasis and irritation turn this hallway into a bad neighborhood over time.\n\nSo: cancer can be a mimic/cause, and also a downstream risk." },
      { index: 5, name: "Progressive Food & Drink", imagePath: "/visuals/gi/achalasia/layer-5-progressive-food-drink.png", audioPath: "/visuals/gi/achalasia/audio/layer-5.mp3", sfxPath: "/visuals/gi/achalasia/sfx/layer-5-sfx.mp3", narration: "Over here we\u2019ve got the \u2018progressive\u2019 party crowd\u2014someone\u2019s trying solids with that burger, someone\u2019s trying liquids with the drink\u2026 and everybody\u2019s moving like the music has no rhythm.\n\nThat\u2019s achalasia: progressive dysphagia to solids AND liquids.\nAnd here\u2019s the classic contrast for medical school: mechanical obstruction usually hits solids first, because liquids can still sneak through. Achalasia doesn\u2019t play favorites\u2014both get stuck.\n\nNow, the uncoordinated dancing is also your clue for manometry:\nManometry shows uncoordinated or absent peristalsis\u2014the normal wave pattern is gone\u2014plus increased LES resting pressure.\nSo it\u2019s not just a tight door\u2026 the whole hallway has lost its coordinated \u2018push\u2019." },
      { index: 6, name: "Bird-Beak Sign", imagePath: "/visuals/gi/achalasia/layer-6-bird-beak.png", audioPath: "/visuals/gi/achalasia/audio/layer-6.mp3", narration: "And now the diagnostic artist shows up with a bucket labeled BARIUM WHITE, painting a bright white bird with a dramatic long beak right at the entrance.\n\nThat\u2019s your classic imaging: barium swallow shows a dilated esophagus that tapers down into distal stenosis\u2014the famous \u2018bird\u2019s beak\u2019 sign of achalasia.\n\nSo once you recognize this club scene\u2014tight LES, lost NO/VIP inhibition, progressive dysphagia to solids and liquids, and that bird\u2019s beak on barium\u2014what do we do about it?\n\nTreatment is about getting past the bouncer:\n\nSurgery (think physically loosening that too-tight sphincter), and\n\nEndoscopic procedures, like botulinum toxin injection\u2014basically \u2018Botox for the bouncer\u2019 to help the LES relax." },
    ],
  },
  {
    id: "medication-induced-esophagitis",
    language: "en",
    embedId: "medication-induced-esophagitis",
    title: "Medication-Induced Esophagitis",
    category: "GI",
    subcategory: "Esophagitis",
    thumbnailPath: "/visuals/gi/esophagitis/medication-induced/thumbnail.png",
    basePath: "/visuals/gi/esophagitis/medication-induced",
    duration: "~6 min",
    hasSubtitles: false,
    description: "Visual lesson on medication-induced esophagitis — NSAIDs, potassium, bisphosphonates, tetracyclines, and the stay-upright rule.",
    creator: defaultCreator,
    tags: ["esophagitis", "NSAIDs", "bisphosphonates", "tetracyclines", "prevention", "drug-induced"],
    keyFacts: [
      { category: "pathology", term: "Medication-Induced Esophagitis", description: "Inflammation of esophageal mucosa caused by pills getting stuck and dissolving locally, causing direct mucosal irritation", visualCue: "The angry red esophagus tunnel with vehicles crashing" },
      { category: "symptom", term: "Odynophagia", description: "Painful swallowing — the 'ow!' when you swallow. Classic symptom of esophagitis", visualCue: "Red inflamed tunnel walls causing pain" },
      { category: "drug", term: "NSAIDs", description: "Non-steroidal anti-inflammatory drugs (ibuprofen, naproxen) — fight inflammation elsewhere but cause esophageal burns when stuck", visualCue: "The N.S.A.I.D. fire truck that accidentally starts fires in the tunnel" },
      { category: "drug", term: "Potassium Chloride (KCl)", description: "Large caustic tablets that cause local injury when stuck in esophagus", visualCue: "The K-Banana truck spilling its cargo into the tunnel" },
      { category: "drug", term: "Bisphosphonates", description: "Osteoporosis medications (alendronate/Fosamax) that cause severe esophageal ulceration when stuck", visualCue: "Bea's-Fosamax Cement Company truck with bones, driven by grandma" },
      { category: "drug", term: "Tetracyclines", description: "Antibiotics (especially doxycycline) that cause esophagitis when taken with too little water or before lying down", visualCue: "The Cycline Gang motorcycle riders — Doxy Rider and Tetra-Cycle" },
      { category: "treatment", term: "Stay Upright 30+ Minutes", description: "Key prevention: remain upright after taking pills to allow gravity clearance and prevent prolonged contact", visualCue: "The 'STAY UPRIGHT for at least 30 mins!' warning sign" },
      { category: "treatment", term: "Take Pills with Full Glass of Water", description: "Prevention strategy: adequate water helps wash pills into stomach, preventing dry swallow injury", visualCue: "The broken water cooler in the 'DRY SWALLOW ZONE'" },
      { category: "mnemonic", term: "Pill Esophagitis Lineup", description: "The 5 classic causes: Bisphosphonates, Tetracyclines, NSAIDs, KCl, Ferrous sulfate", visualCue: "The vehicle parade: cement truck, motorcycles, fire truck, K-truck, rusty iron" },
    ],
    layers: [
      { index: 1, name: "Background", imagePath: "/visuals/gi/esophagitis/medication-induced/layer-1-background.png", audioPath: "/visuals/gi/esophagitis/medication-induced/audio/layer-1.mp3", sfxPath: "/visuals/gi/esophagitis/medication-induced/sfx/layer-1-sfx.mp3", narration: "Welcome back to EnterMedSchool\u2014this is Leo. Today we\u2019re driving straight into the Esophagus Tunnel\u2026 and yeah, the walls are angry red because today\u2019s topic is esophagitis\u2014inflammation of the esophageal mucosa.\n\nClinically, this tunnel damage shows up as odynophagia\u2014that\u2019s \u2018ow!\u2019 when you swallow\u2014and/or dysphagia, meaning traffic-jam swallowing where food feels stuck.\n\nAnd if this tunnel stays damaged long enough, you can end up with nasty construction projects like erosions, strictures\u2014think tight bottlenecks\u2014and Barrett esophagus, where the lining remodels into a new, riskier material.\n\nBut today, our main event is the one that feels like a road-rage incident: medication-induced esophagitis\u2014when pills get stuck, dissolve, and burn the tunnel wall from the inside." },
      { index: 2, name: "NSAID Firetruck", imagePath: "/visuals/gi/esophagitis/medication-induced/layer-2-firetruck-nsaids.png", audioPath: "/visuals/gi/esophagitis/medication-induced/audio/layer-2.mp3", sfxPath: "/visuals/gi/esophagitis/medication-induced/sfx/layer-2-sfx.mp3", narration: "First into the tunnel: the N.S.A.I.D. fire department. These guys love putting out inflammation everywhere else\u2026 but in the esophagus, they can accidentally start the fire.\n\nNSAIDs\u2014like ibuprofen and naproxen\u2014are classic offenders for medication-induced esophagitis. Here\u2019s the idea: if a pill lingers in the esophagus, it can cause direct mucosal irritation\u2014like parking a hot engine against the tunnel wall until it melts the paint.\n\nSo when you see a patient with odynophagia after starting meds, keep NSAIDs on the suspect list. They\u2019re firefighters\u2026 who sometimes scorch the wallpaper." },
      { index: 3, name: "Potassium Truck", imagePath: "/visuals/gi/esophagitis/medication-induced/layer-3-potassium-truck.png", audioPath: "/visuals/gi/esophagitis/medication-induced/audio/layer-3.mp3", sfxPath: "/visuals/gi/esophagitis/medication-induced/sfx/layer-3-sfx.mp3", narration: "Uh-oh\u2014next is the Potassium truck, with the big K and bananas everywhere: this is potassium chloride.\n\nPotassium chloride tablets can be big and irritating, and when they get stuck in the esophagus, they can cause a nasty local injury\u2014like dumping a caustic banana cargo straight onto raw tunnel concrete.\n\nSo add potassium chloride to your Step 1 list of pill-esophagitis troublemakers. If the story is: new pill + painful swallowing, this K-truck is absolutely a prime suspect." },
      { index: 4, name: "Bisphosphonates", imagePath: "/visuals/gi/esophagitis/medication-induced/layer-4-bisphosphates-truck.png", audioPath: "/visuals/gi/esophagitis/medication-induced/audio/layer-4.mp3", sfxPath: "/visuals/gi/esophagitis/medication-induced/sfx/layer-4-sfx.mp3", narration: "Now we\u2019ve got heavy machinery: Bea\u2019s\u2013Fosamax Cement Company rolling in, driven by grandma\u2014because bisphosphonates are the osteoporosis meds protecting bones.\n\nBut in the esophagus? These can be brutal. Bisphosphonates\u2014think alendronate (Fosamax)\u2014are high-yield for medication-induced esophagitis. If they get stuck, they can cause significant irritation and ulceration\u2014like wet cement hardening onto the tunnel wall and taking the paint with it when it peels off.\n\nAnd notice the whole bone-and-cement theme: osteoporosis meds + bone cargo = bisphosphonates. File that association away." },
      { index: 5, name: "Tetracyclines Gang", imagePath: "/visuals/gi/esophagitis/medication-induced/layer-5-cyclics-gang.png", audioPath: "/visuals/gi/esophagitis/medication-induced/audio/layer-5.mp3", sfxPath: "/visuals/gi/esophagitis/medication-induced/sfx/layer-5-sfx.mp3", narration: "Listen up\u2014here comes the -cycline gang: the motorcycle crew with names like \u2018Doxy Rider\u2019 and \u2018Tetra-cycle.\u2019 That\u2019s your reminder for tetracyclines\u2014especially doxycycline\u2014another classic cause of pill esophagitis.\n\nThese antibiotics love causing trouble when swallowed with too little water or right before lying down\u2014because then the pill just hangs out in the tunnel and irritates the lining.\n\nNow, quick Step 1 checklist moment: medication-induced esophagitis is classically caused by bisphosphonates, tetracyclines, NSAIDs, potassium chloride\u2026 and one more that can sneak in like a rusty road hazard: ferrous sulfate." },
      { index: 6, name: "Stay Upright", imagePath: "/visuals/gi/esophagitis/medication-induced/layer-6-stay-upright.png", audioPath: "/visuals/gi/esophagitis/medication-induced/audio/layer-6.mp3", narration: "And here\u2019s the single most important prevention clue in the whole tunnel:\n\u2018STAY UPRIGHT\u2014for at least 30 minutes!\u2019\n\nThis is the classic exam hint\u2014especially for bisphosphonates\u2014because lying down turns your esophagus into a parking lot. Pills don\u2019t clear, they stick, dissolve in one spot, and cause localized mucosal injury\u2014aka medication-induced esophagitis.\n\nAnd the water cooler says it all: \u2018Dry Swallow Zone.\u2019 Dry-swallowing pills is basically asking for a tablet to become a tiny chemical grenade in the tunnel.\n\nSo your takeaway is simple: if swallowing hurts (odynophagia) or feels stuck (dysphagia), and the timing matches a new medication\u2014think pill esophagitis." },
    ],
  },
  {
    id: "comparing-ibds",
    language: "en",
    embedId: "comparing-ibds",
    title: "Comparing IBDs",
    category: "GI",
    subcategory: "IBD",
    thumbnailPath: "/visuals/gi/ibd/comparing-ibds/thumbnail.png",
    basePath: "/visuals/gi/ibd/comparing-ibds",
    duration: "~8 min",
    hasSubtitles: false,
    description: "Visual comparison of Crohn's disease and ulcerative colitis — King Krone, the union workers, cancer crab, and the skipping kid.",
    creator: defaultCreator,
    tags: ["IBD", "Crohn disease", "ulcerative colitis", "transmural", "skip lesions", "cobblestone mucosa", "creeping fat", "crypt abscesses", "lead pipe colon", "fistulas", "granulomas", "PSC", "colorectal cancer"],
    keyFacts: [
      { category: "pathology", term: "Crohn Disease — Transmural Inflammation", description: "Inflammation goes through entire bowel wall thickness, leading to complications like fistulas", visualCue: "The castle burning through-and-through, walls collapsing into river" },
      { category: "pathology", term: "Ulcerative Colitis — Mucosal Inflammation", description: "Inflammation limited to mucosa and submucosa only, unlike Crohn's transmural disease", visualCue: "The factory burning from inside only, smoke coming out" },
      { category: "pathology", term: "Skip Lesions", description: "Crohn disease pattern: patches of inflammation with normal bowel segments in between. Can show rectal sparing", visualCue: "The kid skipping rope — jumping over gaps" },
      { category: "diagnostic", term: "Cobblestone Mucosa", description: "Classic Crohn gross finding: interspersed ulcers and edema create a cobblestone appearance", visualCue: "The cobblestone path leading to the Crohn castle" },
      { category: "pathology", term: "Creeping Fat", description: "Crohn gross finding: mesenteric fat wrapping around the bowel surface", visualCue: "King K'rone's fat belly — he's not just fat, he's CREEPING fat" },
      { category: "diagnostic", term: "Crypt Abscesses", description: "UC microscopic finding: neutrophils accumulating in intestinal crypts", visualCue: "Union workers standing in muddy crypts" },
      { category: "diagnostic", term: "Lead Pipe Colon", description: "UC imaging finding: loss of haustra gives a smooth 'lead pipe' appearance on imaging", visualCue: "Union worker holding a lead pipe" },
      { category: "pathology", term: "Primary Sclerosing Cholangitis (PSC)", description: "Classic UC association: chronic liver disease with bile duct inflammation and fibrosis", visualCue: "Union worker holding the white sack" },
      { category: "pathology", term: "Fistulas", description: "Crohn complication: transmural inflammation breaks through creating abnormal connections", visualCue: "Castle walls collapsing into the river" },
      { category: "pathology", term: "Colorectal Cancer Risk", description: "Both IBDs increase colorectal cancer risk, especially with pancolitis", visualCue: "The cancer crab lurking in the kingdom" },
      { category: "pathology", term: "Noncaseating Granulomas", description: "Crohn microscopic finding: granulomas without central necrosis. NOT seen in UC", visualCue: "King K'rone's dotted cape — dots = granulomas" },
    ],
    layers: [
      { index: 1, name: "Background", imagePath: "/visuals/gi/ibd/comparing-ibds/layer-1-background.png", audioPath: "/visuals/gi/ibd/comparing-ibds/audio/layer-1.mp3", sfxPath: "/visuals/gi/ibd/comparing-ibds/sfx/layer-1-sfx.mp3", narration: "Welcome back to EnterMedSchool\u2014this is Leo.\nToday we\u2019re comparing the two big inflammatory bowel diseases: Crohn disease versus ulcerative colitis\u2014and yes, the whole kingdom is on fire\u2026 because inflammation is the theme.\n\nOn the left, the castle is burning through-and-through\u2014even the walls are on fire. That\u2019s Crohn, where inflammation is transmural, meaning it goes through the entire bowel wall. And when the whole wall is inflamed\u2026 it can literally break through\u2014see those castle walls collapsing into the river? That\u2019s transmural inflammation \u2192 fistulas.\n\nOn the right, the factory is burning mostly from the inside, with smoke coming out\u2014because ulcerative colitis is inflammation limited to the mucosa and submucosa only." },
      { index: 2, name: "King Krone", imagePath: "/visuals/gi/ibd/comparing-ibds/layer-2-king-krone.png", audioPath: "/visuals/gi/ibd/comparing-ibds/audio/layer-2.mp3", sfxPath: "/visuals/gi/ibd/comparing-ibds/sfx/layer-2-sfx.mp3", narration: "Meet the ruler of the left side: King K\u2019rone\u2014because Crohn sounds like crown.\nHe\u2019s not just fat\u2026 he\u2019s creeping fat\u2014that\u2019s a classic Crohn gross finding: creeping fat wrapping along the bowel.\n\nNotice he\u2019s sitting up on a bigger, thicker hill\u2014that\u2019s bowel wall thickening, another Crohn hallmark. And he\u2019s trying to squeeze his belly with a string\u2026 welcome to the \u2018string sign\u2019 on small bowel follow-through\u2014a skinny, narrowed segment from inflammation and thickened bowel.\n\nNow look at his cape covered in little dots: those are noncaseating granulomas and lymphoid aggregates\u2014microscopic Crohn classics." },
      { index: 3, name: "Union Workers", imagePath: "/visuals/gi/ibd/comparing-ibds/layer-3-union-workers.png", audioPath: "/visuals/gi/ibd/comparing-ibds/audio/layer-3.mp3", sfxPath: "/visuals/gi/ibd/comparing-ibds/sfx/layer-3-sfx.mp3", narration: "Now on the factory side\u2014here comes the Union: U stands for \u2018ulcerative colitis.\u2019\n\nThey\u2019re standing in muddy crypts, because UC is famous microscopically for crypt abscesses and crypt ulcers\u2014and notice the vibe: messy, raw, and angry\u2026 just like UC mucosa.\n\nOne worker is holding a lead pipe: UC has loss of haustra, giving a \u2018lead pipe\u2019 appearance on imaging.\n\nAnd that worker holding the white sack? That\u2019s primary sclerosing cholangitis, a classic UC association." },
      { index: 4, name: "Cancer Crab", imagePath: "/visuals/gi/ibd/comparing-ibds/layer-4-cancer-crab.png", audioPath: "/visuals/gi/ibd/comparing-ibds/audio/layer-4.mp3", sfxPath: "/visuals/gi/ibd/comparing-ibds/sfx/layer-4-sfx.mp3", narration: "And whenever you see the crab on EnterMedSchool, think cancer\u2014specifically colorectal cancer risk in inflammatory bowel disease.\n\nBoth Crohn when it involves the colon and ulcerative colitis can increase colorectal cancer risk, and the risk rises especially with pancolitis\u2014when inflammation is widespread across the colon.\n\nSo chronic fire in this kingdom doesn\u2019t just hurt today\u2026 it changes the long-term map." },
      { index: 5, name: "Thin Person", imagePath: "/visuals/gi/ibd/comparing-ibds/layer-5-thin-person.png", audioPath: "/visuals/gi/ibd/comparing-ibds/audio/layer-5.mp3", sfxPath: "/visuals/gi/ibd/comparing-ibds/sfx/layer-5-sfx.mp3", narration: "Now check out this thin guy peeing into the river\u2014he\u2019s your Crohn \u2018price of war.\u2019\n\nCrohn can cause malabsorption and malnutrition, which is why he looks drained compared with the creeping-fat king.\n\nAnd here\u2019s the classic Crohn stone pathway:\nInflamed intestines will lead to malabsorption of fat, which will lead to fat binds calcium in the intestine. Oxalate can team up with calcium in the kidneys \u2014 leading to calcium oxalate kidney stones.\n\nCrohn is also associated with gallstones, because malabsorption messes with bile salt recycling." },
      { index: 6, name: "Skipping Kid", imagePath: "/visuals/gi/ibd/comparing-ibds/layer-6-skipping-kid.png", audioPath: "/visuals/gi/ibd/comparing-ibds/audio/layer-6.mp3", sfxPath: "/visuals/gi/ibd/comparing-ibds/sfx/layer-6-sfx.mp3", narration: "And finally\u2014this kid skipping rope is the cleanest memory hook in the whole scene: skip lesions.\n\nThat\u2019s Crohn disease: inflammation can hit any part of the GI tract, but it usually targets the terminal ileum and colon, and it does it in patches\u2014with normal segments in between. That\u2019s also why Crohn can show rectal sparing.\n\nUlcerative colitis is the opposite pattern: continuous lesions in the colon with rectal involvement.\n\nSo: skipping kid = Crohn skips, factory red carpet = UC is continuous from the rectum." },
    ],
  },
  {
    id: "vancomycin",
    language: "en",
    embedId: "vancomycin",
    title: "Vancomycin",
    category: "Pharmacology",
    subcategory: "Vancomycin",
    thumbnailPath: "/visuals/pharmacology/vancomycin/thumbnail.png",
    basePath: "/visuals/pharmacology/vancomycin",
    duration: "~5 min",
    hasSubtitles: false,
    description: "Visual lesson on Vancomycin — space setting, the Van, C. diff, and the antibiotic wizard.",
    creator: defaultCreator,
    tags: ["vancomycin", "antibiotic", "glycopeptide", "MRSA", "C. difficile", "nephrotoxicity", "ototoxicity", "red man syndrome", "gram positive", "VRE"],
    keyFacts: [
      { category: "drug", term: "Vancomycin", description: "Glycopeptide antibiotic that inhibits cell wall synthesis by binding D-Ala-D-Ala on peptidoglycan precursors", visualCue: "The purple van in the galaxy" },
      { category: "anatomy", term: "D-Ala-D-Ala", description: "The terminal dipeptide on peptidoglycan precursors that vancomycin binds to block cell wall cross-linking", visualCue: "The gALAxy — 'ALA' hints at D-Ala-D-Ala" },
      { category: "pathology", term: "VRE (Vancomycin-Resistant Enterococcus)", description: "Resistance occurs when bacteria swap D-Ala-D-Ala to D-Ala-D-Lac, preventing vancomycin binding", visualCue: "Spilled yogurt (lactate) = D-Ala-D-Lac resistance" },
      { category: "pathology", term: "MRSA", description: "Methicillin-resistant Staphylococcus aureus — a key indication for vancomycin when other drugs fail", visualCue: "The wizard's big shield" },
      { category: "pathology", term: "C. difficile", description: "Oral vancomycin is first-line for C. diff colitis — stays in gut lumen, doesn't absorb well", visualCue: "The stinky diaper alien with STOP sign" },
      { category: "symptom", term: "Red Man Syndrome", description: "Flushing from histamine release (pseudo-allergic, not IgE-mediated) — fix by slowing infusion + antihistamines", visualCue: "The bright red passenger in the van" },
      { category: "symptom", term: "Nephrotoxicity", description: "Kidney damage — monitor vancomycin levels, avoid combining with other nephrotoxic drugs", visualCue: "The guy peeing mid-flight in the van" },
      { category: "symptom", term: "Ototoxicity", description: "Hearing damage, tinnitus — 'the van's music is too loud'", visualCue: "The loud speaker system blasting music" },
      { category: "treatment", term: "Oral Vancomycin for C. diff", description: "Oral route keeps drug in gut lumen (poor absorption) to directly target C. diff infection", visualCue: "STOP sign on the C. diff alien" },
    ],
    layers: [
      { index: 1, name: "Space Background", imagePath: "/visuals/pharmacology/vancomycin/layer-1-space.png", audioPath: "/visuals/pharmacology/vancomycin/audio/layer-1.mp3", sfxPath: "/visuals/pharmacology/vancomycin/sfx/layer-1-sfx.mp3", narration: "Welcome back to EnterMedSchool\u2014this is Leo.\nToday we\u2019re floating through a purple gALAxy, because this is a Gram-positive episode\u2026 and our star antibiotic is vancomycin.\n\nThe big idea: vancomycin blocks bacterial cell wall synthesis.\nIt latches onto the D-Ala-D-Ala tail on peptidoglycan precursors\u2014think of it like grabbing the final Lego piece before the wall gets built\u2014so the bacteria can\u2019t properly cross-link and strengthen that cell wall.\n\nNow for the twist: if the bacteria swaps D-Ala-D-Ala into D-Ala-D-Lac, vancomycin can\u2019t bind well anymore.\nThat\u2019s the classic resistance move, especially with VRE: vancomycin-resistant Enterococcus." },
      { index: 2, name: "The Van", imagePath: "/visuals/pharmacology/vancomycin/layer-2-van.png", audioPath: "/visuals/pharmacology/vancomycin/audio/layer-2.mp3", sfxPath: "/visuals/pharmacology/vancomycin/sfx/layer-2-sfx.mp3", narration: "And here it comes\u2014literally a VAN\u2026 for VAN-comycin. This is the heavy-duty ride we usually save for serious Gram-positive infections\u2014like MRSA.\n\nBut this van has a few famous \u2018side-quest\u2019 problems.\n\nFirst\u2014our passenger is turning bright red: Red Man syndrome.\nThat\u2019s flushing caused by histamine release from mast cells\u2014a pseudo-allergic reaction. The fix is classic: slow the infusion, and pretreat with antihistamines.\n\nNext\u2014why is he peeing mid-flight? That\u2019s your reminder for nephrotoxicity.\n\nAnd that speaker system is way too loud: ototoxicity\u2014ringing ears, hearing issues." },
      { index: 3, name: "C. diff", imagePath: "/visuals/pharmacology/vancomycin/layer-3-cdiff.png", audioPath: "/visuals/pharmacology/vancomycin/audio/layer-3.mp3", sfxPath: "/visuals/pharmacology/vancomycin/sfx/layer-3-sfx.mp3", narration: "Uh-oh\u2014this nasty diaper alien is C. difficile.\nEven though vancomycin is all about Gram-positive coverage, one of its most classic clinical uses is oral vancomycin for C. diff.\n\nWhy oral? Because when you take vancomycin by mouth, it mostly stays in the gut lumen\u2014it doesn\u2019t get absorbed well\u2014so it can go straight to the site of infection and slap down a big STOP sign on C. diff in the colon.\n\nQuick power ranking: vancomycin is bactericidal for most Gram-positive bacteria, but Enterococcus tends to be more \u2018static\u2019\u2014more bacteriostatic unless you add help." },
      { index: 4, name: "Wizard", imagePath: "/visuals/pharmacology/vancomycin/layer-4-wizard.png", audioPath: "/visuals/pharmacology/vancomycin/audio/layer-4.mp3", sfxPath: "/visuals/pharmacology/vancomycin/sfx/layer-4-sfx.mp3", narration: "Now let\u2019s meet the Gram-positive wizard, because vancomycin\u2019s main strength is broad Gram-positive coverage.\n\nThe wizard\u2019s staff is your \u2018staph\u2019 hint\u2014especially Staphylococcus aureus.\nAnd the big shield? That\u2019s MRSA\u2014methicillin-resistant Staph aureus\u2014one of the classic reasons we pull out vancomycin when other drugs won\u2019t work.\n\nThe door and the bowl of couscous point you toward Enterococcus\u2014vancomycin can cover sensitive species\u2026 but not when resistance shows up.\n\nWhich brings us to the spilled yogurt\u2014think lactate.\nIf Enterococcus swaps D-Ala-D-Ala into D-Ala-D-Lac, vancomycin can\u2019t grab the target anymore \u2192 VRE, vancomycin-resistant Enterococcus." },
    ],
  },
  {
    id: "anemia-overview",
    language: "en",
    embedId: "anemia-overview",
    title: "Anemia Overview",
    category: "Hematology",
    subcategory: "Anemia",
    thumbnailPath: "/visuals/hematology/anemia/thumbnail.png",
    basePath: "/visuals/hematology/anemia",
    duration: "~13 min",
    hasSubtitles: false,
    description: "Comprehensive visual overview of anemia types — microcytic, macrocytic, normocytic, megaloblastic, and non-megaloblastic causes.",
    creator: defaultCreator,
    tags: ["anemia", "MCV", "microcytic", "normocytic", "macrocytic", "hemoglobin", "iron deficiency", "thalassemia", "sickle cell", "B12 deficiency", "folate deficiency", "hemolytic anemia", "aplastic anemia", "G6PD", "reticulocyte", "megaloblastic"],
    keyFacts: [
      { category: "pathology", term: "Anemia", description: "Too few healthy RBCs and/or not enough hemoglobin, so blood can't carry oxygen properly", visualCue: "The pale, washed-out red playground" },
      { category: "diagnostic", term: "MCV (Mean Corpuscular Volume)", description: "Average RBC size in femtoliters. <80 = microcytic, 80-100 = normocytic, >100 = macrocytic", visualCue: "The 'Age to play 80-100' sign" },
      { category: "mnemonic", term: "TAIL Mnemonic", description: "Microcytic anemia causes: Thalassemia, Anemia of chronic disease, Iron deficiency, Lead poisoning", visualCue: "The dog on the wall — remember the dog's TAIL" },
      { category: "pathology", term: "Thalassemia", description: "Defective globin chain synthesis causing microcytic anemia. Alpha or Beta types", visualCue: "Baby Abby (A) and Baby Bob (B) on the tiny slide" },
      { category: "pathology", term: "Iron Deficiency Anemia", description: "Most common anemia. Normocytic early, becomes microcytic late as iron stores deplete", visualCue: "Baby Bob's metal xylophone — old iron instrument" },
      { category: "diagnostic", term: "Reticulocyte Index", description: "Low = marrow not making RBCs (nonhemolytic). High = marrow compensating for RBC destruction (hemolytic)", visualCue: "The vessel-like slides in the normocytic zone" },
      { category: "pathology", term: "Hereditary Spherocytosis", description: "Membrane defect causing sphere-shaped RBCs. Intrinsic hemolytic anemia", visualCue: "The beach ball — round like a sphere" },
      { category: "pathology", term: "Aplastic Anemia", description: "Bone marrow failure — can't produce RBCs. Normocytic, nonhemolytic, low reticulocytes", visualCue: "The 'NO PLASTIC!' trash can" },
      { category: "pathology", term: "Sickle Cell Anemia", description: "Hemoglobinopathy causing sickled RBCs that get stuck. Intrinsic hemolytic", visualCue: "Kid stuck and crunched inside the vessel slide" },
      { category: "pathology", term: "G6PD Deficiency", description: "Enzyme deficiency making RBCs vulnerable to oxidative stress. Intrinsic hemolytic", visualCue: "Kid wearing jersey #6" },
      { category: "pathology", term: "Megaloblastic Anemia", description: "Macrocytic anemia from DNA synthesis/repair defects. Large immature cells", visualCue: "Teenagers building mega plastic castle blocks" },
      { category: "pathology", term: "B12/Folate Deficiency", description: "Causes megaloblastic anemia via defective DNA synthesis", visualCue: "Teenagers building (synthesis) the mega castle" },
    ],
    layers: [
      { index: 1, name: "Background", imagePath: "/visuals/hematology/anemia/layer-1-background.png", audioPath: "/visuals/hematology/anemia/audio/layer-1.mp3", sfxPath: "/visuals/hematology/anemia/sfx/layer-1-sfx.mp3", narration: "Welcome back to EnterMedSchool\u2014this is Leo. Today we\u2019re doing anemias\u2026 done simple.\n\nNotice this playground isn\u2019t bright, healthy red\u2014it\u2019s kind of pale and washed out. That\u2019s anemia in one sentence: too few healthy red blood cells and/or not enough hemoglobin, so your blood can\u2019t carry oxygen like it\u2019s supposed to.\n\nAnd over on the left wall\u2014why is there a dog?\nBecause we\u2019re going to start with the tiny-kid corner of anemias\u2026 and that dog\u2019s TAIL is going to matter in a second." },
      { index: 2, name: "Sign", imagePath: "/visuals/hematology/anemia/layer-2-sign.png", audioPath: "/visuals/hematology/anemia/audio/layer-2.mp3", sfxPath: "/visuals/hematology/anemia/sfx/layer-2-sfx.mp3", narration: "This playground has a weird rule: \u2018Age to play: 80 to 100.\u2019\nThat\u2019s not months\u2014it\u2019s MCV: mean corpuscular volume in femtoliters.\n\n80\u2013100 fL is normocytic\u2014the \u2018right-sized kid\u2019 zone.\n\nUnder 80 is microcytic\u2014too tiny for this area.\n\nOver 100 is macrocytic\u2014those kids are basically teenagers crashing a daycare.\n\nAnd keep your eye on that missing P in \u2018PLEASE.\u2019\nWe\u2019ll come back to that when we hit a certain enzyme deficiency\u2026" },
      { index: 3, name: "Tiny Slide", imagePath: "/visuals/hematology/anemia/layer-3-tiny-slide.png", audioPath: "/visuals/hematology/anemia/audio/layer-3.mp3", sfxPath: "/visuals/hematology/anemia/sfx/layer-3-sfx.mp3", narration: "Alright\u2014this tiny red slide is for the microcytic kids: MCV < 80.\n\nMicrocytic anemia is usually a hemoglobin problem\u2014either you can\u2019t make enough heme, or your globin chains are messed up.\n\nAnd here\u2019s where the dog\u2019s tail comes in: microcytic anemia loves the mnemonic TAIL:\n\nT for Thalassemia\nA for Anemia of chronic disease\nI for Iron deficiency\nL for Lead poisoning\n\nIf you remember that dog\u2019s TAIL, you\u2019ll remember the microcytic causes." },
      { index: 4, name: "Baby Abby", imagePath: "/visuals/hematology/anemia/layer-4-baby-abby.png", audioPath: "/visuals/hematology/anemia/audio/layer-4.mp3", sfxPath: "/visuals/hematology/anemia/sfx/layer-4-sfx.mp3", narration: "Here comes Baby Abby, rocking the big A.\n\nFirst: Abby\u2019s \u2018A\u2019 can point you to Anemia of chronic disease\u2014a heme-synthesis problem that can show up microcytic (and often normocytic too). The constant sneezing is your \u2018chronic inflammation\u2019 vibe.\n\nSecond: Abby also reminds you of Thalassemias\u2014these are defective globin chain problems, and they\u2019re microcytic.\nAlpha thalassemia major can cause hydrops fetalis\u2014so Abby sliding down like a dramatic \u2018fetal emergency\u2019 is your mental bookmark.\n\nBut the core takeaway is simple: microcytic + globin chain issue = thalassemia." },
      { index: 5, name: "Baby Bob", imagePath: "/visuals/hematology/anemia/layer-5-baby-bob.png", audioPath: "/visuals/hematology/anemia/audio/layer-5.mp3", sfxPath: "/visuals/hematology/anemia/sfx/layer-5-sfx.mp3", narration: "And this is Baby Bob with the big B\u2014blue for \u2018cool,\u2019 and yes, that\u2019s a nod to Cooley\u2019s anemia, aka beta thalassemia major. Thalassemias = defective globin chain = microcytic anemia.\n\nNow look at his metal xylophone\u2014that\u2019s iron.\nKey point: iron deficiency starts out normocytic early, but when it gets worse, it becomes microcytic late.\n\nBut wait\u2026 the paint on this old xylophone is ancient, someone donated old toys containing lead! That\u2019s lead poisoning\u2014another microcytic cause tied to disordered heme synthesis.\n\nSo Baby Bob\u2019s corner hits multiple parts of the microcytic TAIL: Thalassemia, Iron deficiency (late), and Lead." },
      { index: 6, name: "Vessel Slides", imagePath: "/visuals/hematology/anemia/layer-6-vessel-slides.png", audioPath: "/visuals/hematology/anemia/audio/layer-6.mp3", sfxPath: "/visuals/hematology/anemia/sfx/layer-6-sfx.mp3", narration: "Now we move into the main playground\u2014the normocytic zone: MCV 80\u2013100.\n\nIn medical school, normocytic anemia is where you use the reticulocyte index as your cheat code:\n\nLow reticulocyte index = the bone marrow isn\u2019t making enough RBCs \u2192 nonhemolytic causes.\n\nHigh reticulocyte index = the marrow is trying hard because RBCs are being destroyed or lost \u2192 hemolytic causes.\n\nThese slides look like blood vessels because the next decision is: are cells being made, or being destroyed in the circulation?" },
      { index: 7, name: "Beach Ball", imagePath: "/visuals/hematology/anemia/layer-7-beach-ball.png", audioPath: "/visuals/hematology/anemia/audio/layer-7.mp3", sfxPath: "/visuals/hematology/anemia/sfx/layer-7-sfx.mp3", narration: "See this beach ball? That\u2019s a perfect visual for a sphere\u2014and that\u2019s your membrane-defect classic: hereditary spherocytosis.\n\nIn intrinsic hemolytic anemias, one bucket is membrane defects\u2014and the chart wants you to know two:\n\nHereditary spherocytosis (sphere = ball)\n\nParoxysmal nocturnal hemoglobinuria\u2014PNH (green color on the ball)\n\nPNH is the \u2018nighttime surprise\u2019 membrane problem\u2014imagine a kid who suddenly has dark urine episodes at night.\nThe ball represents RBC membrane defects\u2014the RBC itself is built wrong." },
      { index: 8, name: "No Plastic", imagePath: "/visuals/hematology/anemia/layer-8-no-plastic.png", audioPath: "/visuals/hematology/anemia/audio/layer-8.mp3", sfxPath: "/visuals/hematology/anemia/sfx/layer-8-sfx.mp3", narration: "This bin screams: \u2018NO PLASTIC!\u2019\nThat\u2019s aPLASTIC anemia\u2014a bone-marrow production failure.\n\nAnd where does it live on our chart?\nIn normocytic, nonhemolytic anemia with a low reticulocyte index\u2014because if the marrow is shut down, it can\u2019t make reticulocytes.\nSo \u2018no plastic\u2019 = no production." },
      { index: 9, name: "Extrinsic Kids", imagePath: "/visuals/hematology/anemia/layer-9-extrinsic-kids.png", audioPath: "/visuals/hematology/anemia/audio/layer-9.mp3", sfxPath: "/visuals/hematology/anemia/sfx/layer-9-sfx.mp3", narration: "Now look at the kids outside the vessel slides\u2014this is your hint for extrinsic hemolysis: the RBC is getting destroyed by forces outside the cell.\n\nThis bucket includes:\nAutoimmune hemolysis, microangiopathic hemolysis, macroangiopathic hemolysis (prosthetic valves), and infections.\n\nAll of these are hemolytic, so they push you toward a high reticulocyte index\u2014the marrow is sprinting to replace what\u2019s being destroyed." },
      { index: 10, name: "Stuck Kid", imagePath: "/visuals/hematology/anemia/layer-10-stuck-kid.png", audioPath: "/visuals/hematology/anemia/audio/layer-10.mp3", sfxPath: "/visuals/hematology/anemia/sfx/layer-10-sfx.mp3", narration: "This kid is literally stuck in the vessel slide\u2014and he\u2019s crunched into a weird shape. That\u2019s an intrinsic hemolytic clue: a hemoglobinopathy.\n\nTwo big hemoglobinopathies on the chart:\n\nSickle cell anemia \u2192 sickled, stiff cells that get stuck.\n\nHbC disease \u2192 another intrinsic hemoglobin variant.\n\nSo this slide-jam kid represents intrinsic hemolysis from abnormal hemoglobin." },
      { index: 11, name: "Enzyme Kid", imagePath: "/visuals/hematology/anemia/layer-11-enzyme-kid.png", audioPath: "/visuals/hematology/anemia/audio/layer-11.mp3", sfxPath: "/visuals/hematology/anemia/sfx/layer-11-sfx.mp3", narration: "And here\u2019s the enzyme corner\u2014still intrinsic hemolytic.\n\nThe kid wearing #6 is G6PD deficiency\u2014an enzyme deficiency that makes RBCs vulnerable.\n\nAnd remember earlier\u2026 the sign with the missing P?\nThat\u2019s your other intrinsic enzyme deficiency: Pyruvate kinase deficiency.\n\nSo under intrinsic hemolytic enzyme deficiencies, medical school wants two names on lock:\nG6PD deficiency and Pyruvate kinase deficiency." },
      { index: 12, name: "Megaloblastic", imagePath: "/visuals/hematology/anemia/layer-12-megaloblastic.png", audioPath: "/visuals/hematology/anemia/audio/layer-12.mp3", sfxPath: "/visuals/hematology/anemia/sfx/layer-12-sfx.mp3", narration: "Now the teenagers show up\u2014too big for daycare\u2014because this is macrocytic anemia: MCV > 100.\n\nFirst macrocytic branch: megaloblastic\u2014meaning DNA is affected.\n\nIf DNA synthesis or repair is messed up, the cell can\u2019t divide normally, so you get big \u2018mega\u2019 cells\u2014hence these huge mega-plastic blocks.\n\nMegaloblastic causes:\nDefective DNA synthesis: Folate deficiency, Vitamin B12 deficiency, Orotic aciduria\nDefective DNA repair: Fanconi anemia" },
      { index: 13, name: "Non-Megaloblastic", imagePath: "/visuals/hematology/anemia/layer-13-nonmegaloblastic.png", audioPath: "/visuals/hematology/anemia/audio/layer-13.mp3", sfxPath: "/visuals/hematology/anemia/sfx/layer-13-sfx.mp3", narration: "And finally, macrocytic but nonmegaloblastic\u2014meaning the cells are large, but it\u2019s not the classic DNA-synthesis megaloblast story.\n\nThis teacher looks yellow and exhausted\u2014think liver disease and chronic alcohol overuse, two major nonmegaloblastic causes.\n\nAnd that giant diamond ring? That\u2019s Diamond-Blackfan anemia\u2014also listed under macrocytic nonmegaloblastic.\n\nSo when you see macrocytic anemia, your first fork is:\nMegaloblastic (DNA synthesis/repair: folate, B12, orotic aciduria, Fanconi)\nvs\nNonmegaloblastic (Diamond-Blackfan, liver disease, chronic alcohol)." },
    ],
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function getVisualLessonById(id: string): VisualLesson | undefined {
  return visualLessons.find((l) => l.id === id);
}
