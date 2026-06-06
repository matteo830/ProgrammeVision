// Structure de l'audit VISION (repris du Tally) + données démo pour les 3 passages
// 7 sections · ~45 questions · 9 curseurs 0-10

const AUDIT_TOKENS = {
  greenDeep: "#0E3D34", greenDeeper: "#07251F", greenMid: "#1A5448",
  greenSoft: "#E8EFEC", greenLight: "#D7E5DE", greenAccent: "#3FA88E",
  goldDeep: "#B8862E", gold: "#D4A047", goldLight: "#E8C56F", goldSoft: "#FBF1D8",
  cream: "#FAF6EB", creamWarm: "#F2EBD8",
  ink: "#1A1714", inkSoft: "#5A5247", inkMute: "#9A9080",
  border: "#E8DFC8", borderSoft: "#F0E8D4",
  coralStart: "#FF8A6B", coralMid: "#F46B7A", coralEnd: "#E8527D",
  white: "#FFFFFF",
};

// ── Sections & questions (texte exact du Tally) ──────────────────────────
const AUDIT_SECTIONS = [
  {
    num: 1,
    title: "Où j'en suis aujourd'hui",
    icon: "🧭",
    questions: [
      { id: "s1_situation", type: "text", label: "En une phrase, comment je décrirais ma situation actuelle dans mon business ?" },
      { id: "clarte", type: "slider", label: "Ma clarté sur mon business et mes priorités", metric: true },
      { id: "confiance", type: "slider", label: "Ma confiance en moi pour avancer", metric: true },
      { id: "vente", type: "slider", label: "Comment je me sens au niveau du sujet de la vente", metric: true },
      { id: "communication", type: "slider", label: "Comment je me sens au niveau du sujet de la communication", metric: true },
      { id: "gestion", type: "slider", label: "Comment je me sens au niveau du sujet de la gestion", metric: true },
      { id: "alignementViePro", type: "slider", label: "Mon alignement vie pro / vie perso", metric: true },
      { id: "alignementAmbition", type: "slider", label: "Mon alignement avec mon ambition", metric: true },
      { id: "s1_pourquoi", type: "text", label: "Pourquoi ces notes ?" },
      { id: "s1_pese", type: "text", label: "Qu'est-ce qui me pèse le plus dans mon business actuellement ?" },
    ],
  },
  {
    num: 2,
    title: "Mes objectifs et attentes",
    icon: "🎯",
    questions: [
      { id: "s2_vision35", type: "text", label: "Où te vois-tu (et comment) d'ici 3 à 5 ans ?" },
      { id: "s2_ambitieuse", type: "text", label: "Et si tu devais être plus ambitieuse et que tout était possible ?" },
      { id: "s2_objectifs", type: "text", label: "Quels sont les 3 objectifs principaux que je veux atteindre grâce à VISION cette année ?" },
      { id: "s2_realiste", type: "text", label: "Et si tu devais être un peu plus pessimiste et réaliste (on avance toujours moins vite qu'on aimerait) ?" },
      { id: "s2_probleme", type: "text", label: "Si je pouvais résoudre un seul problème dans mon business aujourd'hui, ce serait lequel ?" },
      { id: "s2_valait", type: "text", label: "Qu'est-ce qui me ferait dire, à la fin de ce programme : « Ça valait vraiment le coup » ?" },
    ],
  },
  {
    num: 3,
    title: "Mes blocages actuels",
    icon: "🔒",
    questions: [
      { id: "s3_raisons", type: "text", label: "Pour quelles raisons suis-je entrée dans le programme Vision ?" },
      { id: "s3_peurs", type: "text", label: "Quelles sont mes plus grandes peurs ou croyances limitantes autour de mon business ?" },
      { id: "s3_devrais", type: "text", label: "Qu'est-ce que je sais que je devrais faire mais que je ne fais pas ? Pourquoi ?" },
      { id: "s3_frustration", type: "text", label: "Quelle est ma plus grosse frustration dans la vente / la communication / la gestion de mon temps ?" },
    ],
  },
  {
    num: 4,
    title: "Mon business aujourd'hui",
    icon: "💼",
    questions: [
      { id: "s4_entreprise", type: "text", label: "Décris ton entreprise aujourd'hui : activité, taille et moyens de production, comment, pourquoi, pour qui, avec qui, et tout ce qui peut nous servir à bien cerner ton business." },
      { id: "s4_chiffresFin", type: "text", label: "Quels sont mes résultats récents chiffrés financiers (CA, bénéfices, salaire…) ?" },
      { id: "s4_chiffresAutres", type: "text", label: "Quels sont mes résultats récents chiffrés autres (nb de clients, audience, temps de travail/semaine…) ?" },
      { id: "s4_canaux", type: "text", label: "Quels canaux d'acquisition j'utilise déjà ? (Comment mes clients me connaissent)" },
      { id: "s4_produits", type: "text", label: "Quels sont mes produits et à quel prix ? (Sois exhaustive)" },
      { id: "s4_offrePhare", type: "text", label: "Quelle est mon offre phare actuelle (celle que je vends le plus) ?" },
      { id: "s4_atouts", type: "text", label: "Quels sont mes 3 plus grands atouts actuels ?" },
      { id: "s4_fuis", type: "text", label: "Qu'est-ce que je fuis ou que je ne fais pas dans mon entreprise actuellement ?" },
      { id: "s4_consequences", type: "text", label: "Quelles en sont les conséquences ?" },
      { id: "s4_preferee", type: "text", label: "Si je ne devais garder qu'une seule chose à faire (ce que je préfère), ce serait quoi ?" },
    ],
  },
  {
    num: 5,
    title: "Mon état personnel",
    icon: "💚",
    questions: [
      { id: "s5_emotionsVie", type: "text", label: "Quelles émotions dominent en général dans ma vie quotidienne ?" },
      { id: "s5_emotionsBusiness", type: "text", label: "Quelles émotions dominent quand je pense à mon business ?" },
      { id: "s5_impact", type: "text", label: "Quel est l'impact actuel de mon business sur ma vie perso (famille, couple, énergie, santé) ?" },
      { id: "epanoui", type: "slider", label: "À quel point je me sens libre et épanoui(e) aujourd'hui ?", metric: true },
      { id: "s5_pourquoi", type: "text", label: "Pourquoi ?" },
    ],
  },
  {
    num: 6,
    title: "Mon engagement",
    icon: "🔥",
    questions: [
      { id: "s6_mettreEnPlace", type: "text", label: "Qu'est-ce que je suis prêt(e) à mettre en place dès maintenant pour avancer ?" },
      { id: "s6_arreter", type: "text", label: "Quels comportements qui me freinent je vais m'engager à arrêter ?" },
      { id: "s6_vitesse", type: "text", label: "À quelle vitesse j'aimerais progresser au fil du programme ?" },
    ],
  },
  {
    num: 7,
    title: "Notre accompagnement",
    icon: "🤝",
    questions: [
      { id: "s7_important", type: "text", label: "Qu'est-ce qui est important pour moi aujourd'hui lorsque je me fais accompagner ?" },
      { id: "s7_attentes", type: "text", label: "Quelles sont mes attentes pour ce programme ?" },
      { id: "s7_rythme", type: "ab", label: "Est-ce qu'il faut :",
        optionA: "Me ménager, et tant pis si je n'avance pas",
        optionB: "On y va à fond même si ça pique, le principal c'est d'avancer" },
      { id: "courage", type: "slider", label: "Mon niveau de courage et de responsabilité face aux difficultés (0 : aucun, 10 : rien ne m'arrête)", metric: true },
      { id: "s7_mot", type: "text", label: "Un mot pour tes coachs ?" },
    ],
  },
];

// ── Les 9 métriques (curseurs) pour la vue Évolution ─────────────────────
const SLIDER_METRICS = [
  { id: "clarte", short: "Clarté business" },
  { id: "confiance", short: "Confiance en soi" },
  { id: "vente", short: "Vente" },
  { id: "communication", short: "Communication" },
  { id: "gestion", short: "Gestion" },
  { id: "alignementViePro", short: "Équilibre pro/perso" },
  { id: "alignementAmbition", short: "Alignement ambition" },
  { id: "epanoui", short: "Épanouissement" },
  { id: "courage", short: "Courage / responsabilité" },
];

// ── Données démo des 3 passages ──────────────────────────────────────────
const AUDIT_RUNS = {
  initial: {
    type: "INITIAL", label: "Audit de départ", status: "SUBMITTED",
    date: "12 avril 2026", week: "S1",
    answers: {
      clarte: 4, confiance: 3, vente: 2, communication: 5, gestion: 4,
      alignementViePro: 3, alignementAmbition: 6, epanoui: 4, courage: 6,
      s1_situation: "Je travaille beaucoup mais je manque de visibilité sur où je vais. J'ai des clients mais pas de système.",
      s2_objectifs: "1. Structurer mon offre. 2. Atteindre 5000€/mois. 3. Arrêter de bricoler ma communication.",
      s3_peurs: "Peur de ne pas être légitime à augmenter mes prix. Peur de me lancer vraiment sur les réseaux.",
      s5_emotionsBusiness: "Un mélange d'excitation et d'anxiété. Souvent débordée.",
    },
    coachComments: { 1: "Belle lucidité sur ta situation. On va clarifier tes priorités ensemble dès la phase 1." },
  },
  mid: {
    type: "MID", label: "Audit mi-parcours", status: "SUBMITTED",
    date: "30 juin 2026", week: "S13",
    answers: {
      clarte: 7, confiance: 6, vente: 5, communication: 7, gestion: 6,
      alignementViePro: 5, alignementAmbition: 7, epanoui: 6, courage: 8,
      s1_situation: "Beaucoup plus clair. J'ai une offre structurée et un tunnel d'acquisition qui tourne.",
      s2_objectifs: "1. Stabiliser à 7000€/mois. 2. Déléguer l'administratif. 3. Lancer mon offre premium.",
      s3_peurs: "La légitimité sur les prix s'est envolée. Reste la peur de déléguer.",
      s5_emotionsBusiness: "Plus de sérénité. Je sais où je vais et j'ai des process.",
    },
    coachComments: { 1: "Énorme progression sur la vente et la clarté. Continue, tu es sur la bonne voie !" },
  },
  final: {
    type: "FINAL", label: "Audit final", status: "AVAILABLE", // disponible mais pas encore rempli dans la démo
    date: null, week: "S26",
    answers: {},
    coachComments: {},
  },
};

window.AUDIT_TOKENS = AUDIT_TOKENS;
window.AUDIT_SECTIONS = AUDIT_SECTIONS;
window.SLIDER_METRICS = SLIDER_METRICS;
window.AUDIT_RUNS = AUDIT_RUNS;
