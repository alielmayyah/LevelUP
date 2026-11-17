import type { LeaderboardRow } from '../../api/types';
import { memberAvatar } from '../../avatar/catalog';

export const rowAvatar = (row: LeaderboardRow) => memberAvatar({ memberId: row.memberId, avatar: row.avatar });
