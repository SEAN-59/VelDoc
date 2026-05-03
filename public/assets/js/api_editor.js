import { applyScrollRestorationSetting, getConfigRuntime } from './api-editor/config.js';
import { initializeEditorDom } from './api-editor/dom.js';
import { createStateRuntime } from './api-editor/state.js';
import {
  blankIfPlaceholder,
  createMarkdownRuntime,
  decodeMarkdownCell,
  escapeRegExp,
  extractJsonBlock,
  getMarkdownSection,
  isEmptySpecGroupValue,
  isMeaningfulMarkdownTableRow,
  isTableDivider,
  parseInfoTable,
  parseMarkdownTables,
  parseRowsByHeaders,
  responseFieldMapping,
  splitApiPath,
  splitMarkdownTableRow,
  startsWithSegments,
} from './api-editor/markdown.js';
import {
  createPathRuntime,
  getDirectoryPath,
  normalizeFileName,
  normalizePathParamKey,
  normalizeSaveDir,
  splitPathPart,
  toPathParamToken,
} from './api-editor/path.js';
import { createUiRuntime } from './api-editor/ui.js';
import { createValidationRuntime } from './api-editor/validation.js';
import { createAuthRuntime } from './api-editor/auth.js';
import { createHeadersRuntime } from './api-editor/headers.js';
import { createTablesRuntime } from './api-editor/tables.js';
import { createFileIoRuntime } from './api-editor/file_io.js';
import { createViewerRuntime } from './api-editor/viewer.js';
import { createControllerRuntime } from './api-editor/controller.js';

const editorRuntime = {};
Object.assign(editorRuntime, getConfigRuntime());
applyScrollRestorationSetting();
Object.assign(editorRuntime, initializeEditorDom());
Object.assign(editorRuntime, createStateRuntime(editorRuntime));
Object.assign(editorRuntime, {
  blankIfPlaceholder,
  decodeMarkdownCell,
  escapeRegExp,
  extractJsonBlock,
  getDirectoryPath,
  getMarkdownSection,
  isEmptySpecGroupValue,
  isMeaningfulMarkdownTableRow,
  isTableDivider,
  normalizeFileName,
  normalizePathParamKey,
  normalizeSaveDir,
  parseInfoTable,
  parseMarkdownTables,
  parseRowsByHeaders,
  responseFieldMapping,
  splitApiPath,
  splitMarkdownTableRow,
  splitPathPart,
  startsWithSegments,
  toPathParamToken,
});

Object.assign(editorRuntime, createMarkdownRuntime(editorRuntime));
Object.assign(editorRuntime, createPathRuntime(editorRuntime));
Object.assign(editorRuntime, createHeadersRuntime(editorRuntime));
Object.assign(editorRuntime, createUiRuntime(editorRuntime));
Object.assign(editorRuntime, createValidationRuntime(editorRuntime));
Object.assign(editorRuntime, createAuthRuntime(editorRuntime));
Object.assign(editorRuntime, createTablesRuntime(editorRuntime));
Object.assign(editorRuntime, createFileIoRuntime(editorRuntime));
Object.assign(editorRuntime, createViewerRuntime(editorRuntime));
Object.assign(editorRuntime, createControllerRuntime(editorRuntime));
