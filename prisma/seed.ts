import { PrismaClient, ModuleType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const phases = [
  {
    order: 0,
    title: "Démarrage",
    description: "Prépare ton engagement et ta mise en mouvement",
    modules: [
      {
        order: 1,
        title: "Audit de départ",
        description: "Réalise un audit complet de ta situation actuelle",
        type: ModuleType.ONBOARDING,
        videoUrl: null,
        exerciseUrl: null,
      },
      {
        order: 2,
        title: "Mise en place logistique",
        description:
          "Ajoute les événements au calendrier, rejoins le groupe WhatsApp",
        type: ModuleType.ONBOARDING,
        videoUrl: null,
        exerciseUrl: null,
      },
      {
        order: 3,
        title: "Vidéo de présentation",
        description: "Regarde la vidéo de bienvenue du programme",
        type: ModuleType.ONBOARDING,
        videoUrl: null,
        exerciseUrl: null,
      },
    ],
  },
  {
    order: 1,
    title: "Les Fondamentaux",
    description:
      "Pose les bases structurantes de ton business et de ta posture entrepreneuriale",
    modules: [
      {
        order: 1,
        title: "Mindset – Confiance en soi",
        description: "Développe ta confiance et ta posture entrepreneuriale",
        type: ModuleType.MINDSET,
        videoUrl: null,
        exerciseUrl: null,
      },
      {
        order: 2,
        title: "Mindset – Gestion du temps",
        description: "Maîtrise ton énergie et ton organisation personnelle",
        type: ModuleType.MINDSET,
        videoUrl: null,
        exerciseUrl: null,
      },
      {
        order: 3,
        title: "Mindset – Relation à l'argent",
        description: "Transforme ta relation à la valeur et à la prospérité",
        type: ModuleType.MINDSET,
        videoUrl: null,
        exerciseUrl: null,
      },
      {
        order: 4,
        title: "Mindset – Mindset entrepreneurial",
        description: "Installe les croyances et habitudes d'un entrepreneur",
        type: ModuleType.MINDSET,
        videoUrl: null,
        exerciseUrl: null,
      },
      {
        order: 5,
        title: "Business – Client idéal",
        description: "Définis précisément ta cible et ses problématiques",
        type: ModuleType.BUSINESS,
        videoUrl: null,
        exerciseUrl: null,
      },
      {
        order: 6,
        title: "Business – Offre irrésistible",
        description: "Construis une offre alignée, claire et désirable",
        type: ModuleType.BUSINESS,
        videoUrl: null,
        exerciseUrl: null,
      },
      {
        order: 7,
        title: "Business – Maîtrise des chiffres",
        description:
          "Connais ta situation financière et définis tes objectifs",
        type: ModuleType.BUSINESS,
        videoUrl: null,
        exerciseUrl: null,
      },
      {
        order: 8,
        title: "Business – Organisation",
        description:
          "Structure ta journée, ta semaine et tes priorités (80/20)",
        type: ModuleType.BUSINESS,
        videoUrl: null,
        exerciseUrl: null,
      },
    ],
  },
  {
    order: 2,
    title: "Les Tunnels Clients",
    description:
      "Mets en place tes systèmes d'acquisition et de conversion de clients",
    modules: [
      {
        order: 1,
        title: "Étape 1 – Capter l'attention",
        description: "Deviens visible et attire les bonnes personnes",
        type: ModuleType.TUNNEL,
        videoUrl: null,
        exerciseUrl: null,
      },
      {
        order: 2,
        title: "Étape 2 – Créer l'intérêt",
        description: "Génère de l'intérêt et retiens l'attention",
        type: ModuleType.TUNNEL,
        videoUrl: null,
        exerciseUrl: null,
      },
      {
        order: 3,
        title: "Étape 3 – Capture de leads",
        description: "Collecte les contacts de tes prospects qualifiés",
        type: ModuleType.TUNNEL,
        videoUrl: null,
        exerciseUrl: null,
      },
      {
        order: 4,
        title: "Étape 4 – Activation et confiance",
        description: "Crée la relation et installe la confiance",
        type: ModuleType.TUNNEL,
        videoUrl: null,
        exerciseUrl: null,
      },
      {
        order: 5,
        title: "Étape 5 – Qualification",
        description: "Identifie tes prospects les plus prêts à passer à l'acte",
        type: ModuleType.TUNNEL,
        videoUrl: null,
        exerciseUrl: null,
      },
      {
        order: 6,
        title: "Étape 6 – Vente",
        description: "Convertis tes prospects en clients",
        type: ModuleType.TUNNEL,
        videoUrl: null,
        exerciseUrl: null,
      },
      {
        order: 7,
        title: "Étape 7 – Delivery",
        description: "Livre une expérience client exceptionnelle",
        type: ModuleType.TUNNEL,
        videoUrl: null,
        exerciseUrl: null,
      },
      {
        order: 8,
        title: "Étape 8 – Upsell et Parrainage",
        description: "Maximise la valeur client et crée un effet viral",
        type: ModuleType.TUNNEL,
        videoUrl: null,
        exerciseUrl: null,
      },
    ],
  },
  {
    order: 3,
    title: "Structuration et Croissance",
    description:
      "Construis une entreprise qui ne repose plus uniquement sur ta présence",
    modules: [
      {
        order: 1,
        title: "Amélioration des performances",
        description: "Analyse tes résultats et identifie les leviers de croissance",
        type: ModuleType.OPTIMISATION,
        videoUrl: null,
        exerciseUrl: null,
      },
      {
        order: 2,
        title: "Délégation et recrutement",
        description: "Structure ton équipe et délègue intelligemment",
        type: ModuleType.OPTIMISATION,
        videoUrl: null,
        exerciseUrl: null,
      },
      {
        order: 3,
        title: "Automatisation",
        description: "Mets en place des systèmes durables et automatisés",
        type: ModuleType.OPTIMISATION,
        videoUrl: null,
        exerciseUrl: null,
      },
      {
        order: 4,
        title: "Passage à l'échelle",
        description: "Développe ton activité sans te sacrifier",
        type: ModuleType.OPTIMISATION,
        videoUrl: null,
        exerciseUrl: null,
      },
    ],
  },
];

const inspirations = [
  {
    quote:
      "La vision sans action n'est qu'un rêve. L'action sans vision n'est qu'un passe-temps. La vision avec action peut changer le monde.",
    author: "Joel A. Barker",
  },
  {
    quote: "Le succès, c'est d'aller d'échec en échec sans perdre son enthousiasme.",
    author: "Winston Churchill",
  },
  {
    quote: "Votre temps est limité, ne le gâchez pas en vivant la vie de quelqu'un d'autre.",
    author: "Steve Jobs",
  },
  {
    quote: "La seule façon de faire du bon travail est d'aimer ce que vous faites.",
    author: "Steve Jobs",
  },
  {
    quote: "Chaque expert a été un jour un débutant.",
    author: "Helen Hayes",
  },
];

async function main() {
  console.log("🌱 Seeding database...");

  for (const phase of phases) {
    const { modules, ...phaseData } = phase;
    const createdPhase = await prisma.phase.upsert({
      where: { order: phaseData.order },
      update: { title: phaseData.title, description: phaseData.description },
      create: phaseData,
    });

    for (const module of modules) {
      await prisma.module.upsert({
        where: {
          phaseId_order: { phaseId: createdPhase.id, order: module.order },
        },
        update: {
          title: module.title,
          description: module.description,
          type: module.type,
        },
        create: { ...module, phaseId: createdPhase.id },
      });
    }
  }

  for (const inspiration of inspirations) {
    await prisma.inspiration.create({ data: inspiration });
  }

  const coachPassword = await bcrypt.hash("coach123", 12);
  await prisma.user.upsert({
    where: { email: "coach@vision.fr" },
    update: {},
    create: {
      email: "coach@vision.fr",
      password: coachPassword,
      firstName: "Coach",
      lastName: "Vision",
      role: "COACH",
    },
  });

  console.log("✅ Seed complete");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
