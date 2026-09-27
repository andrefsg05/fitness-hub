import { WorkoutSet } from '@/types/database';

export interface SetMetrics {
  weight: number;
  reps: number;
}

/**
 * Retorna true se candidate for estritamente melhor que current:
 * 1. Maior peso -> melhor
 * 2. Mesmo peso -> desempata por mais repetições
 * 3. Menor peso ou métricas idênticas -> não bate o PR
 */
export function isBetterSet(candidate: SetMetrics, current: SetMetrics): boolean {
  if (candidate.weight > current.weight) return true;
  if (candidate.weight === current.weight) return candidate.reps > current.reps;
  return false;
}

/**
 * Encontra o melhor set de um treino (ignora sets vazios como 0kg x 0 reps)
 */
export function findBestSet<T extends SetMetrics>(sets: T[]): T | null {
  const validSets = sets.filter((s) => s.weight > 0 || s.reps > 0);
  if (validSets.length === 0) return null;

  return validSets.reduce((best, curr) => (isBetterSet(curr, best) ? curr : best));
}

/**
 * Atribui a flag is_pr aos sets em memória com base no PR ativo da BD.
 * - Se não houver PR ativo prévio, o melhor set válido ganha is_pr = true.
 * - Se houver PR ativo prévio, o melhor set ganha is_pr = true se for estritamente melhor que o PR ativo.
 * - Todos os outros sets ganham is_pr = false.
 */
export function annotateSetsWithPRs(
  sets: WorkoutSet[],
  activePR: SetMetrics | null
): WorkoutSet[] {
  const bestSet = findBestSet(sets);

  let isRecord = false;
  if (bestSet) {
    if (!activePR) {
      isRecord = true;
    } else {
      isRecord = isBetterSet(bestSet, activePR);
    }
  }

  return sets.map((s) => ({
    ...s,
    is_pr: isRecord && bestSet !== null && s.id === bestSet.id,
  }));
}
