/**
 * Metro configuration for the OceanFresh monorepo.
 *
 * Workspace packages (`@oceanfresh/*`) are symlinked into the pnpm store and
 * expose raw TypeScript sources via their `exports` maps, so Metro must:
 *   1. watch the whole workspace root (so changes to packages are picked up),
 *   2. resolve node modules from both the app and the workspace root,
 *   3. honour package `exports` maps.
 */
const { getDefaultConfig } = require('expo/metro-config');
const path = require('node:path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

config.resolver.unstable_enablePackageExports = true;

module.exports = config;