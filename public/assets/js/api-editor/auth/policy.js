export const createAuthPolicyRuntime = (ctx) => {
  const {
    AUTH_POLICY_SCOPE_SET,
    AUTH_POLICY_VERSION,
    state,
  } = ctx;

  const resolveAuthPolicyFromPolicyMap = (...args) => ctx.resolveAuthPolicyFromPolicyMap(...args);
  const splitPathPart = (...args) => ctx.splitPathPart(...args);
  const normalizeRoleValue = (...args) => ctx.normalizeRoleValue(...args);
  const mergeAuthRoleValues = (...args) => ctx.mergeAuthRoleValues(...args);

  let
    createDefaultAuthPolicies,
    normalizeAuthPolicyPath,
    normalizeRelativeFilePath,
    normalizeAuthPolicyScope,
    normalizeAuthPolicyRecord,
    normalizeAuthPolicies,
    normalizeFolderApiPaths,
    normalizeFolderSpecFiles,
    areStringArraysEqual,
    getInheritedRolesFromPolicies,
    removeInheritedDuplicateRoles,
    findActionPolicySpecFile,
    pruneAuthPoliciesByFolderSpecFiles;

  

  ctx.createDefaultAuthPolicies = createDefaultAuthPolicies = () => ({
    version: AUTH_POLICY_VERSION,
    policies: {},
  });

  
  ctx.normalizeAuthPolicyPath = normalizeAuthPolicyPath = (value) => {
    const segments = String(value ?? '')
      .trim()
      .replaceAll('\\', '/')
      .replace(/^https?:\/\/[^/]+/i, '')
      .split('/')
      .map((part) => part.trim())
      .filter(Boolean);

    return segments.length > 0 ? `/${segments.join('/')}` : '/';
  };

  
  ctx.normalizeRelativeFilePath = normalizeRelativeFilePath = (value) =>
    String(value ?? '')
      .trim()
      .replaceAll('\\', '/')
      .replace(/^\.\/+/, '')
      .replace(/^\/+/, '')
      .replace(/\/+/g, '/');

  
  ctx.normalizeAuthPolicyScope = normalizeAuthPolicyScope = (value, path = '/') => {
    const scope = String(value ?? '').trim();
    if (AUTH_POLICY_SCOPE_SET.has(scope)) return scope;

    const segmentCount = splitPathPart(normalizeAuthPolicyPath(path)).length;
    if (segmentCount === 0) return 'root';
    if (segmentCount === 1) return 'base';
    if (segmentCount === 2) return 'middle';
    if (segmentCount === 3) return 'subCategory';
    return 'action';
  };

  
  ctx.normalizeAuthPolicyRecord = normalizeAuthPolicyRecord = (record) => {
    if (!record || typeof record !== 'object' || Array.isArray(record)) return {};

    const normalized = {};
    if (Array.isArray(record.roles)) {
      normalized.roles = [...new Set(record.roles.map(normalizeRoleValue).filter(Boolean))];
    }
    return normalized;
  };

  
  ctx.normalizeAuthPolicies = normalizeAuthPolicies = (source) => {
    const normalized = createDefaultAuthPolicies();
    const policies = source?.policies && typeof source.policies === 'object' ? source.policies : {};

    Object.entries(policies).forEach(([path, policy]) => {
      const normalizedPath = normalizeAuthPolicyPath(path);
      const normalizedPolicy = normalizeAuthPolicyRecord(policy);
      if ((normalizedPolicy.roles || []).length > 0) {
        normalized.policies[normalizedPath] = normalizedPolicy;
      }
    });

    return normalized;
  };

  
  ctx.normalizeFolderApiPaths = normalizeFolderApiPaths = (apiPaths = []) =>
    [...new Set(
      (Array.isArray(apiPaths) ? apiPaths : [])
        .map((path) => String(path ?? '').trim())
        .filter(Boolean)
        .map(normalizeAuthPolicyPath),
    )].sort((a, b) => a.localeCompare(b, 'ko'));

  
  ctx.normalizeFolderSpecFiles = normalizeFolderSpecFiles = (files = []) =>
    (Array.isArray(files) ? files : [])
      .map((file) => {
        const rawApiPath = String(file?.apiPath ?? '').trim();
        const path = normalizeRelativeFilePath(file?.path);
        if (!rawApiPath || !path) return null;
        return {
          path,
          apiPath: normalizeAuthPolicyPath(rawApiPath),
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.path.localeCompare(b.path, 'ko') || a.apiPath.localeCompare(b.apiPath, 'ko'));

  
  ctx.areStringArraysEqual = areStringArraysEqual = (a = [], b = []) =>
    a.length === b.length && a.every((value, index) => value === b[index]);

  
  ctx.getInheritedRolesFromPolicies = getInheritedRolesFromPolicies = (policies, path) => {
    return resolveAuthPolicyFromPolicyMap(policies, path, { includeSelf: false })?.policy?.roles || [];
  };

  
  ctx.removeInheritedDuplicateRoles = removeInheritedDuplicateRoles = (authPolicies) => {
    const nextPolicies = normalizeAuthPolicies(authPolicies);
    let changed = false;

    Object.entries(nextPolicies.policies)
      .sort(([pathA], [pathB]) => splitPathPart(pathA).length - splitPathPart(pathB).length)
      .forEach(([policyPath, policy]) => {
        const inheritedRoleSet = new Set(getInheritedRolesFromPolicies(nextPolicies.policies, policyPath));

        if (Array.isArray(policy.roles)) {
          const localRoles = mergeAuthRoleValues(policy.roles.filter((role) => !inheritedRoleSet.has(role)));
          if (!areStringArraysEqual(policy.roles, localRoles)) changed = true;
          if (localRoles.length > 0) {
            policy.roles = localRoles;
          } else {
            delete nextPolicies.policies[policyPath];
            changed = true;
          }
        }
      });

    return { authPolicies: nextPolicies, changed };
  };

  
  ctx.findActionPolicySpecFile = findActionPolicySpecFile = (policyPath, specFiles = state.folderSpecFiles) => {
    const normalizedPolicyPath = normalizeAuthPolicyPath(policyPath);
    const normalizedSpecFiles = normalizeFolderSpecFiles(specFiles);

    if (normalizedSpecFiles.length > 0) {
      const pathMatches = normalizedSpecFiles.filter((file) => file.apiPath === normalizedPolicyPath);
      return pathMatches[0] || null;
    }

    return normalizeFolderApiPaths(state.folderApiPaths).includes(normalizedPolicyPath)
      ? { apiPath: normalizedPolicyPath }
      : null;
  };

  
  ctx.pruneAuthPoliciesByFolderSpecFiles = pruneAuthPoliciesByFolderSpecFiles = (authPolicies, specFiles = state.folderSpecFiles) => {
    const dedupeResult = removeInheritedDuplicateRoles(authPolicies);
    const nextPolicies = dedupeResult.authPolicies;
    let changed = dedupeResult.changed;

    Object.entries(nextPolicies.policies).forEach(([policyPath, policy]) => {
      if (normalizeAuthPolicyScope('', policyPath) !== 'action') return;
      const matchingFile = findActionPolicySpecFile(policyPath, specFiles);
      if (matchingFile) return;
      delete nextPolicies.policies[policyPath];
      changed = true;
    });

    return { authPolicies: nextPolicies, changed };
  };

  return {
    createDefaultAuthPolicies,
    normalizeAuthPolicyPath,
    normalizeRelativeFilePath,
    normalizeAuthPolicyScope,
    normalizeAuthPolicyRecord,
    normalizeAuthPolicies,
    normalizeFolderApiPaths,
    normalizeFolderSpecFiles,
    areStringArraysEqual,
    getInheritedRolesFromPolicies,
    removeInheritedDuplicateRoles,
    findActionPolicySpecFile,
    pruneAuthPoliciesByFolderSpecFiles,
  };
};
