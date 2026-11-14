import { api } from './client';
import type { AvatarConfigDto } from './types';

/** PUT /me/avatar. Resolves with the saved config; rejects when the save fails, so the editor keeps the draft. */
export const saveAvatar = (config: AvatarConfigDto): Promise<AvatarConfigDto> =>
  api<AvatarConfigDto>('/me/avatar', { method: 'PUT', body: JSON.stringify(config) });
