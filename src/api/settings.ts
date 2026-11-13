import { api } from './client';
import type { SettingsDto, SettingsPatch } from './types';

/** PATCH /me/settings. Rejects when the save fails, so callers can roll back. */
export const saveSettings = (patch: SettingsPatch): Promise<SettingsDto> =>
  api<SettingsDto>('/me/settings', { method: 'PATCH', body: JSON.stringify(patch) });
