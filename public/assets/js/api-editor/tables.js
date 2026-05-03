import { createTableExamplesRuntime } from './tables/examples.js';
import { createTableRenderRuntime } from './tables/render_rows.js';
import { createRowActionsRuntime } from './tables/row_actions.js';
import { createSuccessResponseRuntime } from './tables/success_response.js';

export const createTablesRuntime = (ctx) => {
  const runtime = {};
  const attach = (partial) => {
    Object.assign(runtime, partial);
    Object.assign(ctx, partial);
  };

  attach(createSuccessResponseRuntime(ctx));
  attach(createTableExamplesRuntime(ctx));
  attach(createRowActionsRuntime(ctx));
  attach(createTableRenderRuntime(ctx));

  return runtime;
};
