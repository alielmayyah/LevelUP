import type { LeaderboardRow, Sex } from '../../api/types';
import { memberAvatar } from '../../avatar/catalog';

export const rowAvatar = (row: LeaderboardRow, division: Sex) =>
  memberAvatar({ memberId: row.memberId, sex: division, avatar: row.avatar });
