import { api } from './client';
import type { AvatarConfigDto } from './types';

type AvatarListener = (memberId: number, avatar: AvatarConfigDto) => void;
const listeners = new Set<AvatarListener>();

export function onAvatarSaved(listener: AvatarListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** PUT /me/avatar. Resolves with the saved config; rejects when the save fails, so the editor keeps the draft. */
export async function saveAvatar(memberId: number, config: AvatarConfigDto): Promise<AvatarConfigDto> {
  const avatar = await api<AvatarConfigDto>('/me/avatar', { method: 'PUT', body: JSON.stringify(config) });
  listeners.forEach((listener) => listener(memberId, avatar));
  return avatar;
}
