import type { LeaderboardRow } from '../../api/types';
import { starterAvatar } from '../../avatar/catalog';

/** A row's character: the saved one when the API sends it, else the starter for that member. */
export const rowAvatar = (row: LeaderboardRow) => row.avatar ?? starterAvatar(String(row.memberId));
