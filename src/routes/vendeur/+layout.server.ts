import type { LayoutServerLoad } from './$types';
import { requireVendor } from '$lib/middleware/rbac';

export const load: LayoutServerLoad = async ({ locals }) => {
  requireVendor(locals);
  return {};
};


