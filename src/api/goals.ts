import { api } from './client';
import type { CreateGoalRequest, GoalView } from './types';

/** POST /me/goals: the member's own goal, in progress at once. */
export const createGoal = (req: CreateGoalRequest): Promise<GoalView> =>
  api<GoalView>('/me/goals', { method: 'POST', body: JSON.stringify(req) });
