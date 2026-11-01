import { HouseContainer } from '@/components/layout/HouseContainer';
import { IntroExperience } from '@/components/intro/IntroExperience';
import type { WorkCode } from '@/engine/selectionEngine';

export const dynamic = 'force-dynamic';

export default async function HomePage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = searchParams ? await searchParams : {};
  const isObras = 'obras' in resolvedParams || 'selector' in resolvedParams || 'coleccion' in resolvedParams;
  const isExits = 'salidas' in resolvedParams || 'exits' in resolvedParams;
  const isCarta = 'carta' in resolvedParams || 'post-p15' in resolvedParams;
  const isDecision = 'verify' in resolvedParams || 'motor' in resolvedParams || 'decision' in resolvedParams;
  const isChecker = 'checker' in resolvedParams || 'visual' in resolvedParams;

  const validWorks: WorkCode[] = ['PP', 'DD', 'EM', 'CM', 'ES', 'UC'];
  const rawWork = ((resolvedParams.work || resolvedParams.obra) as string | undefined)?.toUpperCase();
  const initialWork = rawWork && validWorks.includes(rawWork as WorkCode)
    ? (rawWork as WorkCode)
    : undefined;

  const initialStage = isObras
    ? 'works-selector'
    : isExits
    ? 'post-p15-exits'
    : isCarta
    ? 'post-p15'
    : isDecision
    ? 'decision-verification'
    : isChecker
    ? 'visual-checker-selector'
    : undefined;

  return (
    <HouseContainer>
      <IntroExperience initialStage={initialStage} initialWork={initialWork} />
    </HouseContainer>
  );
}
