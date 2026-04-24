import {
  Tractor,
  Wheat,
  Crop,
  SprayCan,
  Sprout,
  Disc,
  Package,
  Truck,
  Forklift,
  Droplets,
  Construction,
  Wrench,
  type LucideIcon,
} from 'lucide-react'

/** Maps category slugs to Lucide icons. Fallback: Tractor */
export const categoryIconMap: Record<string, LucideIcon> = {
  tractors: Tractor,
  combines: Wheat,
  harvesters: Crop,
  sprayers: SprayCan,
  seeders: Sprout,
  plows: Disc,
  balers: Package,
  trailers: Truck,
  loaders: Forklift,
  irrigation: Droplets,
  construction: Construction,
  other: Wrench,
}

export function getCategoryIcon(slug: string): LucideIcon {
  return categoryIconMap[slug] || Tractor
}

/** EU countries with ISO codes for browse/filter */
export const EU_COUNTRIES = [
  { code: 'RO', name: 'Romania', flag: '🇷🇴' },
  { code: 'DE', name: 'Germania', flag: '🇩🇪' },
  { code: 'FR', name: 'Franța', flag: '🇫🇷' },
  { code: 'NL', name: 'Olanda', flag: '🇳🇱' },
  { code: 'PL', name: 'Polonia', flag: '🇵🇱' },
  { code: 'ES', name: 'Spania', flag: '🇪🇸' },
  { code: 'IT', name: 'Italia', flag: '🇮🇹' },
  { code: 'AT', name: 'Austria', flag: '🇦🇹' },
  { code: 'BE', name: 'Belgia', flag: '🇧🇪' },
  { code: 'HU', name: 'Ungaria', flag: '🇭🇺' },
  { code: 'CZ', name: 'Cehia', flag: '🇨🇿' },
  { code: 'DK', name: 'Danemarca', flag: '🇩🇰' },
  { code: 'SE', name: 'Suedia', flag: '🇸🇪' },
  { code: 'PT', name: 'Portugalia', flag: '🇵🇹' },
  { code: 'GR', name: 'Grecia', flag: '🇬🇷' },
  { code: 'FI', name: 'Finlanda', flag: '🇫🇮' },
] as const

/** Top manufacturer names for display on landing */
export const TOP_MANUFACTURERS = [
  'John Deere',
  'Case IH',
  'New Holland',
  'Fendt',
  'Claas',
  'Massey Ferguson',
  'Kubota',
  'Valtra',
] as const

/** Romanian counties (județe) for SEO pages */
export const ROMANIAN_COUNTIES = [
  { slug: 'alba', name: 'Alba' },
  { slug: 'arad', name: 'Arad' },
  { slug: 'arges', name: 'Argeș' },
  { slug: 'bacau', name: 'Bacău' },
  { slug: 'bihor', name: 'Bihor' },
  { slug: 'bistrita-nasaud', name: 'Bistrița-Năsăud' },
  { slug: 'botosani', name: 'Botoșani' },
  { slug: 'braila', name: 'Brăila' },
  { slug: 'brasov', name: 'Brașov' },
  { slug: 'bucuresti', name: 'București' },
  { slug: 'buzau', name: 'Buzău' },
  { slug: 'calarasi', name: 'Călărași' },
  { slug: 'caras-severin', name: 'Caraș-Severin' },
  { slug: 'cluj', name: 'Cluj' },
  { slug: 'constanta', name: 'Constanța' },
  { slug: 'covasna', name: 'Covasna' },
  { slug: 'dambovita', name: 'Dâmbovița' },
  { slug: 'dolj', name: 'Dolj' },
  { slug: 'galati', name: 'Galați' },
  { slug: 'giurgiu', name: 'Giurgiu' },
  { slug: 'gorj', name: 'Gorj' },
  { slug: 'harghita', name: 'Harghita' },
  { slug: 'hunedoara', name: 'Hunedoara' },
  { slug: 'ialomita', name: 'Ialomița' },
  { slug: 'iasi', name: 'Iași' },
  { slug: 'ilfov', name: 'Ilfov' },
  { slug: 'maramures', name: 'Maramureș' },
  { slug: 'mehedinti', name: 'Mehedinți' },
  { slug: 'mures', name: 'Mureș' },
  { slug: 'neamt', name: 'Neamț' },
  { slug: 'olt', name: 'Olt' },
  { slug: 'prahova', name: 'Prahova' },
  { slug: 'salaj', name: 'Sălaj' },
  { slug: 'satu-mare', name: 'Satu Mare' },
  { slug: 'sibiu', name: 'Sibiu' },
  { slug: 'suceava', name: 'Suceava' },
  { slug: 'teleorman', name: 'Teleorman' },
  { slug: 'timis', name: 'Timiș' },
  { slug: 'tulcea', name: 'Tulcea' },
  { slug: 'valcea', name: 'Vâlcea' },
  { slug: 'vaslui', name: 'Vaslui' },
  { slug: 'vrancea', name: 'Vrancea' },
] as const

export function getCountyName(slug: string): string {
  const county = ROMANIAN_COUNTIES.find(c => c.slug === slug)
  return county?.name || slug
}

/** SEO content tips per category */
export const CATEGORY_TIPS: Record<string, string[]> = {
  tractors: [
    'Verifică orele de funcționare - tractoarele sub 5000h sunt o investiție bună',
    'Caută tractoare cu revizia la zi (carte de service)',
    'Verifică starea anvelopelor - costă scump la înlocuire',
  ],
  combines: [
    'Combine-urile necesită întreținere specifică - verifică cutsorele',
    'Anul de fabricație e crucial pentru fiabilitate',
    'Solicită istoricul reviziilor de la dealer',
  ],
  harvesters: [
    'Verifică capacitatea tamburului de treierat',
    'Caută modele cu sistem de automatizare GPS',
    'Hours count e critic - sub 2000h e ideal',
  ],
  sprayers: [
    'Verifică duzele și pompa - costă mult la înlocuire',
    'Tancul de pesticide trebuie curățat complet',
    'Caută sisteme de ghidare auto',
  ],
  seeders: [
    'Verifică discurile de semințe - uzură neuniformă = probleme',
    'Adâncimea de semănat e ajustabilă electronic',
    'Row spacing trebuie să fie compatibil cu tractorul',
  ],
  plows: [
    'Caută brăzdarele cu taisuri SCH - durabilitate maximă',
    'Verifică adâncimea maximă de lucru',
    'Plow reversible = productivitate dublă',
  ],
  balers: [
    'Verifică density settings și presiunea',
    'Ruloanele de inserție trebuie să fie intacte',
    'Square vs round bales - diferă prețul și manipularea',
  ],
  trailers: [
    'Verifică dimensiunile și sarcina utilă',
    'Frânele trebuie să funcționeze perfect',
    'Podeaua metalică e mai durabilă decât lemnul',
  ],
  loaders: [
    'Verifică cilindrii hidraulici - scurgere = probleme',
    'Cupe de diferite dimensiuni disponibile',
    'Quick coupler e esențial pentru utilaje multiple',
  ],
  irrigation: [
    'Verifică debitul pompei (litri/min)',
    'Sistemele central pivot acoperă suprafețe mari',
    'Consumabilele (duze) costă în timp',
  ],
  construction: [
    'Verifică ore funcționare și revizii',
    'Auxiliary hydraulics pentru atașamente',
    'Oferte leasing disponibile pentru utilaje grele',
  ],
  other: [
    'Verifică compatibilitatea cu utilajele existente',
    'Solicită manual de utilizare și service',
    'Piese de schimb disponibile în UE',
  ],
}

export function getCategoryTips(slug: string): string[] {
  return CATEGORY_TIPS[slug] || CATEGORY_TIPS.other
}

/** Intro text per category for SEO pages */
export const CATEGORY_INTROS: Record<string, string> = {
  tractors: "Tractoare agricole de toate puterile - de la 50 CP la 500+ CP. Oferim tractoare noi și second-hand de la dealerii autorizați și producători particulari din toată România.",
  combines: "Combine de recoltat pentru cereale - echipamente profesionale pentru recolte de grâu, porumb, floarea-soarelui. Branduri leader: Claas, John Deere, New Holland.",
  harvesters: "Recoltatoare și vindtoare pentru legume și fructe. Echipamente specializate pentru cartofi, morcov, ceapă, struguri. Soluții complete pentru fermele medii și mari.",
  sprayers: "Prăpăriatoare și stropitori pentru tratamente fitosanitare. Sisteme de pulverizare cu control GPS, Tanuri de pesticide, echipamente pentru agricultura de precizie.",
  seeders: "Semănători de precizie pentru cereale și legume. Sisteme electronice de control al adâncimii, distribuire uniformă, compatibile cu tractoare de toate puterile.",
  plows: "Pluguri și brăzdare pentru pregătirea solului. Pluguri reversibile, discuri, cultimatoare - echipamente pentru arat și pregătirea patului germinativ.",
  balers: "Prese și balotieri pentru furaje. Baloți pătrați și rotunzi, density settings ajustabile, sisteme de legătură cu sârmă sau plasă.",
  trailers: "Remorci agricole și utilitare. Remorci de 1-20 tone, basculante, platforme - compatibile cu tractoare și camioane.",
  loaders: "Încărcătoare frontale și cuppe hidraulice. Sisteme de atașamente rapide, forță de ridicare 500-5000 kg, compatibile majoritatea tractoare.",
  irrigation: "Sisteme de irigație și pompare. Pivot central, tunuri de irigație, Pompe și conducte - soluții pentru hectari de culturi.",
  construction: "Utilaje de construcții: excavatoare, Încarcatoare, buldozere. Echipamente pentru amenajări funciare, podețe, drumuri fermă.",
  other: "Echipamente agricole diverse. Piese, accesorii, atașamente - tot ce ai nevoie pentru ferma ta.",
}

export function getCategoryIntro(slug: string): string {
  return CATEGORY_INTROS[slug] || CATEGORY_INTROS.other
}

/** Unique intro text per Romanian county for SEO pages */
export const COUNTY_INTROS: Record<string, string> = {
  alba: "Piețele locale din Alba oferă utilaje agricole pentru fermele din zona Mureș și Apuseni. Tractoare și combine la prețuri competitive de la producători locali.",
  arad: "Arad — poartă spre vestul Europei. Fermierii din Arad au acces la utilaje importate din Germania și Austria, cu service și garanție.",
  arges: "Agricultura în Argeș se concentrează pe legumicultură și pomicultură. Utilaje pentru livezi și sere disponibile în zona Pitești.",
  bacau: "Bacău — centru agricol al Moldovei. Utilaje pentru culturi cerealiere și zootehnie, cu livrare în tot județul.",
  bihor: "Bihor, lângă granița cu Ungaria, oferă utilaje din import la prețuri bune. Piață activă pentru tractoare și combine second-hand.",
  bistrita: "Agricultura montană în Bistrița-Năsăud. Echipamente pentru pajiști, fânețe și zootehnie de munte.",
  botosani: "Botoșani — nordul Moldovei. Utilaje agricole pentru culturi de câmp și zootehnie, disponibile în zona Suceava-Botoșani.",
  braila: "Brăila — agricultura de câmp pe scară mare în Bărăgan. Combine și tractoare de mare putere pentru ferme mari.",
  brasov: "Brașov — centru agricol și turistic al Transilvaniei. Ofertă variată de utilaje, service specializat și piese de schimb.",
  bucuresti: "București și Ilfov — cea mai mare piață de utilaje agricole din România. Dealer autorizat, import direct, livrare în toată țara.",
  buzau: "Agricultura în Buzău: viticultură, legumicultură, apicultură. Utilaje pentru podgorii și culturi de legume.",
  calarasi: "Călărași — agricultura irigată în Bărăganul Sudic. Tractoare și sisteme de irigație pentru ferme mari.",
  cluj: "Cluj — centru universitar și agricol al Transilvaniei. Cea mai activă piață de utilaje din vestul României. Dealer local și service.",
  constanta: "Constanța — port și centru agricol. Acces la utilaje importate și prețuri competitive pentru echipamente maritime și agricole.",
  covasna: "Covasna — zootehnie și pajiști montane. Utilaje pentru creșterea animalelor și prelucrarea furajelor.",
  dambovita: "Dâmbovița — agricultură mixtă în apropierea Bucureștiului. Tractoare și echipamente pentru livezi și legumicultură.",
  dolj: "Dolj — inima Olteniei agricole. Combine și tractoare pentru culturile de cereale în Câmpia Română.",
  galati: "Galați — centru agroindustrial al Moldovei. Utilaje pentru zootehnie, culturi de câmp și procesare.",
  giurgiu: "Grajduri și parcuri industriale lângă București. Tractoare și remorci pentru ferme de animale și culturi vegetale.",
  gorj: "Gorj — agricultura de semi-munte. Utilaje pentru pajiști naturale și creșterea oilor.",
  harghita: "Harghita — zootehnie ecologică în Carpații Orientali. Echipamente pentru ferme de vaci și producție de lactate.",
  hunedoara: "Hunedoara — minerit și agricultură în Depresiunea Hațeg. Tractoare și combine pentru ferme de munte.",
  ialomita: "Ialomița — Bărăganul Estic. Utilaje pentru cereale și floarea-soarelui pe ferme de 100-1000 hectare.",
  iasi: "Iași — centru universitar și agricol al Moldovei. Cea mai mare piață agricolă din estul României.",
  ilfov: "Zona periurbană a Bucureștiului. Utilaje pentru ferme mici, legumicultură și horticultură.",
  maramures: "Maramureș — agricultură tradițională și ecologică. Utilaje pentru pajiști și creșterea animalelor în zona montană.",
  mehedinti: "Mehedinți — agricultură în Depresiunea Motru. Utilaje pentru livezi și zootehnie.",
  mures: "Mureș — una dintre cele mai puternice zone agricole din Transilvania. Tractoare și combine de la dealeri autorizați.",
  neamt: "Neamț — zonă viticolă și pomicolă renumită. Utilaje pentru podgorii și livezi de meri.",
  olt: "Olt — câmpia Olteniei. Combine și tractoare pentru culturi de cereale și plante tehnice.",
  prahova: "Prahova — agricultură și turism viticol. Utilaje pentru podgorii Dealu Mare și legumicultură.",
  salaj: "Sălaj — zonă cerealieră în nord-vest. Tractoare și prese pentru furaje.",
  'satu-mare': "Satu Mare — poartă spre Ungaria și Polonia. Utilaje din import la prețuri bune.",
  sibiu: "Sibiu — centru agricol și turistic al Transilvaniei. Piață activă pentru utilaje mici și medii.",
  suceava: "Suceava — cea mai mare suprafață agricolă din Moldova. Tractoare și combine pentru ferme mari.",
  teleorman: "Teleorman — agricultura în sudul Olteniei. Utilaje pentru culturi de câmp pe terenuri plane.",
  timis: "Timișoara și Timiș — cea mai dezvoltată zonă agricolă din vestul României. Import de utilaje germane, dealer autorizați.",
  tulcea: "Tulcea — Delta Dunării și agricultura în Dobrogea. Utilaje pentru orez și legumicultură în zone umede.",
  valcea: "Vâlcea — agricultură de submontană și viticultură. Utilaje pentru livezi și podgorii.",
  vaslui: "Vaslui — zonă cerealieră în Moldova Centrală. Tractoare și combine pentru ferme de câmp.",
  vrancea: "Vrancea — viticultură renumită și agricultură. Utilaje pentru podgorii și culturi de câmp.",
}

export function getCountyIntro(slug: string): string {
  return COUNTY_INTROS[slug] || `Descoperă anunțuri cu utilaje agricole în ${slug}. Oferte de la fermieri și dealeri din zonă.`
}
