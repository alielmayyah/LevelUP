import { useCallback, useMemo } from 'react';

import type { LiftRecordDto, ProfileDto, ProgressDto } from '../../api/types';
import { useApi } from '../../api/useApi';
import { evaluateMedals } from './rules';

// Only the mock API currently provides verified lift records.
const HAS_LIFTS = import.meta.env.VITE_USE_MOCKS === 'true';
export function useMedalData(member: Pick<ProfileDto, 'sex' | 'birthDate' | 'heightCm'> | null) {
  const progress = useApi<ProgressDto>('/me/progress');
  const lifts = useApi<LiftRecordDto[]>(HAS_LIFTS ? '/me/lifts' : null);
  const { reload: reloadProgress, retry: retryProgress } = progress;
  const { reload: reloadLifts, retry: retryLifts } = lifts;
  const failed = progress.status === 'error' || lifts.status === 'error';
  const categories = useMemo(() => {
    if (!member || !progress.data || (HAS_LIFTS && !lifts.data)) return null;
    return evaluateMedals({
      sex: member.sex ?? null,
      birthDate: member.birthDate,
      heightCm: member.heightCm,
      scans: progress.data.assessments,
      lifts: lifts.data,
    });
  }, [member, progress.data, lifts.data]);

  const reload = useCallback(() => Promise.all([reloadProgress(), reloadLifts()]), [reloadProgress, reloadLifts]);
  const retry = useCallback(() => Promise.all([retryProgress(), retryLifts()]), [retryProgress, retryLifts]);
  return { categories, failed, reload, retry };
}
