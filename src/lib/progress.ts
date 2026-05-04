import { prisma } from "@/lib/prisma";
import { calculateProgress } from "@/lib/utils";

export async function getClientProgress(userId: string) {
  const phases = await prisma.phase.findMany({
    orderBy: { order: "asc" },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: {
          progresses: {
            where: { userId },
          },
        },
      },
    },
  });

  let totalModules = 0;
  let validatedModules = 0;
  let watchedVideos = 0;
  let totalVideos = 0;

  const phasesWithProgress = phases.map((phase) => {
    const phaseModules = phase.modules.length;
    let phaseValidated = 0;

    const modulesWithProgress = phase.modules.map((module) => {
      const progress = module.progresses[0];
      totalModules++;

      if (module.videoUrl) totalVideos++;
      if (progress?.videoWatched && module.videoUrl) watchedVideos++;
      if (progress?.coachValidated) {
        validatedModules++;
        phaseValidated++;
      }

      return {
        ...module,
        progress: progress ?? null,
      };
    });

    return {
      ...phase,
      modules: modulesWithProgress,
      progressPercent: calculateProgress(phaseValidated, phaseModules),
      isCompleted: phaseValidated === phaseModules,
      isUnlocked: true,
    };
  });

  // Lock phases: a phase is unlocked only if the previous is completed
  for (let i = 1; i < phasesWithProgress.length; i++) {
    phasesWithProgress[i].isUnlocked = phasesWithProgress[i - 1].isCompleted;
  }

  const globalPercent = calculateProgress(validatedModules, totalModules);

  // Find current phase (first incomplete unlocked)
  const currentPhase =
    phasesWithProgress.find((p) => p.isUnlocked && !p.isCompleted) ??
    phasesWithProgress[phasesWithProgress.length - 1];

  return {
    phases: phasesWithProgress,
    globalPercent,
    currentPhase,
    totalModules,
    validatedModules,
    watchedVideos,
    totalVideos,
  };
}
