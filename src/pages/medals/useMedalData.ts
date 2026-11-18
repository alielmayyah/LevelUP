import { useMemo } from 'react';

import type { ProfileDto, ProgressDto } from '../../api/types';
import { useApi } from '../../api/useApi';
import { evaluateMedals } from './rules';

/** The member's medals, worked out from their scans. */
export function useMedalData(member: Pick<ProfileDto, 'sex' | 'birthDate' | 'heightCm'> | null) {
  const progress = useApi<ProgressDto>('/me/progress');
  const { status, data, reload, retry } = progress;
  const categories = useMemo(() => {
    if (!member || !data) return null;
    return evaluateMedals({
      sex: member.sex ?? null,
      birthDate: member.birthDate,
      heightCm: member.heightCm,
      scans: data.assessments,
    });
  }, [member, data]);

  return { categories, failed: status === 'error', reload, retry };
}
