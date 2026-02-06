import type { LayoutServerLoad } from './$types';
import { requireAdmin } from '$lib/middleware/rbac';

export const load: LayoutServerLoad = async ({ locals }) => {
  requireAdmin(locals);
  return {};
};


