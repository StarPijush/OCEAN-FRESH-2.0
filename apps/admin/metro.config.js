/**
 * Metro configuration for the OceanFresh monorepo (Expo SDK 57, pnpm).
 *
 * Two monorepo-specific problems are solved here:
 *
 * 1. `.js`-suffixed relative imports. The shared packages (`@oceanfresh/*`)
 *    follow the TypeScript "bundler" resolution convention and import sibling
 *    sources with a `.js` suffix (e.g. `./auth.repository.factory.js` ->
 *    `auth.repository.factory.ts`). Metro resolves relative modules exactly
 *    and performs no `.js` -> `.ts` substitution, so failed relative `.js`
 *    imports are retried extensionless.
 *
 * 2. pnpm symlinks. Metro 0.84's file map does not expand symlinked package
 *    directories, so packages reachable only through `node_modules` symlinks
 *    (every pnpm install) are unresolvable. The real package contents live in
 *    the pnpm store (`node_modules/.pnpm/<pkg>@<version>/node_modules`), which
 *    is crawled normally — pointing `nodeModulesPaths` at every store dir
 *    makes all bare specifiers resolvable through their real paths.
 */
const fs = require('node:fs');
const path = require('node:path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

const storeRoot = path.join(__dirname, '..', '..', 'node_modules', '.pnpm');
let storeDirs = [];
if (fs.existsSync(storeRoot)) {
  storeDirs = fs
    .readdirSync(storeRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(storeRoot, entry.name, 'node_modules'))
    .filter((dir) => fs.existsSync(dir));
}
config.resolver.nodeModulesPaths = [...storeDirs, ...(config.resolver.nodeModulesPaths ?? [])];

config.resolver.resolveRequest = (context, moduleName, platform) => {
  const next = context.resolveRequest;
  try {
    return next(context, moduleName, platform);
  } catch (err) {
    const isRelative = moduleName.startsWith('./') || moduleName.startsWith('../');
    if (isRelative && /\.js$/.test(moduleName)) {
      return next(context, moduleName.replace(/\.js$/, ''), platform);
    }
    throw err;
  }
};

module.exports = config;
