import type { LayoutServerLoad } from './$types';
import { requireAuthenticated } from '$lib/middleware/rbac';

export const load: LayoutServerLoad = async ({ locals }) => {
  requireAuthenticated(locals);
  return {};
};


