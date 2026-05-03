import { createAuthFormRuntime } from './auth/form_helpers.js';
import { createAuthPolicyRuntime } from './auth/policy.js';
import { createAuthRoleCardsRuntime } from './auth/role_cards.js';
import { createAuthRolesRuntime } from './auth/roles.js';

export const createAuthRuntime = (ctx) => {
  const runtime = {};
  const attach = (partial) => {
    Object.assign(runtime, partial);
    Object.assign(ctx, partial);
  };

  attach(createAuthPolicyRuntime(ctx));
  attach(createAuthFormRuntime(ctx));
  attach(createAuthRolesRuntime(ctx));
  attach(createAuthRoleCardsRuntime(ctx));

  return runtime;
};
