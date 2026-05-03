// Mechanical API editor segment from the v1.1.0 monolith.
// Keep this segment behavior-identical until the second refactor pass.
import { createPathAuthScopeRuntime } from './path/auth_scope.js';
import { createPathFileLocationRuntime } from './path/file_location.js';
import { createPathFormStateRuntime } from './path/form_state.js';
import { createPathSegmentsRuntime } from './path/segments.js';

export const normalizeSaveDir = (value) => {
  const raw = String(value ?? '').trim();
  if (!raw) return '';

  const normalized = raw
    .replaceAll('\\', '/')
    .replace(/\/+/g, '/')
    .replace(/\/$/, '');

  if (normalized.startsWith('/')) {
    const parts = normalized.split('/').filter(Boolean);
    if (parts.length === 0 || parts.some((part) => part === '.' || part === '..')) {
      return null;
    }
    return `/${parts.join('/')}`;
  }

  const relativePath = normalized.replace(/^\.\//, '').replace(/^\/+/, '');
  const parts = relativePath.split('/').filter(Boolean);

  if (parts.length === 0 || parts.some((part) => part === '.' || part === '..')) {
    return null;
  }
  return `./${parts.join('/')}`;
};

export const getDirectoryPath = (filePath) => {
  const normalized = String(filePath ?? '').replaceAll('\\', '/').replace(/\/+/g, '/');
  const lastSlashIndex = normalized.lastIndexOf('/');
  if (lastSlashIndex <= 0) return '';
  return normalized.slice(0, lastSlashIndex);
};

export const normalizeFileName = (value) => {
  const source = value.trim() || 'api-spec.md';
  const safeName = source
    .replace(/[\\/:*?"<>|]/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
  return safeName.endsWith('.md') ? safeName : `${safeName}.md`;
};

export const splitPathPart = (value) =>
  String(value ?? '')
    .split('/')
    .map((part) => part.trim())
    .filter(Boolean);

export const normalizePathParamKey = (key) =>
  String(key ?? '').trim().replace(/^\{/, '').replace(/\}$/, '');

export const toPathParamToken = (key) => `{${normalizePathParamKey(key)}}`;

export const createPathRuntime = (ctx) => {
  const runtime = {};
  const attach = (partial) => {
    Object.assign(runtime, partial);
    Object.assign(ctx, partial);
  };

  attach(createPathSegmentsRuntime(ctx));
  attach(createPathAuthScopeRuntime(ctx));
  attach(createPathFileLocationRuntime(ctx));
  attach(createPathFormStateRuntime(ctx));

  return runtime;
};
