import { createBrowserFileIoRuntime } from './file_io/browser_file_io.js';
import { createDocumentActionsRuntime } from './file_io/document_actions.js';
import { createDraftRuntime } from './file_io/draft.js';
import { createFileTreeIoRuntime } from './file_io/file_tree_io.js';
import { createPolicyFileIoRuntime } from './file_io/policy_file_io.js';

export const createFileIoRuntime = (ctx) => {
  const runtime = {};
  const attach = (partial) => {
    Object.assign(runtime, partial);
    Object.assign(ctx, partial);
  };

  attach(createDraftRuntime(ctx));
  attach(createBrowserFileIoRuntime(ctx));
  attach(createPolicyFileIoRuntime(ctx));
  attach(createFileTreeIoRuntime(ctx));
  attach(createDocumentActionsRuntime(ctx));

  return runtime;
};
