import { default as lockfile } from "@yarnpkg/lockfile";
import { existsSync, readFileSync } from "fs";
import { resolve } from "path";
import { gt } from "semver";

export function extractDupes(fileName, prefix) {
  const startsWithPrefix = (pkgName) => pkgName.startsWith(prefix);
  const path = resolve(fileName);
  console.log(prefix);
  if (!existsSync(path)) {
    console.log(`File not found: ${fileName}`);
    return;
  }

  const file = readFileSync(fileName, "utf-8");
  const json = lockfile.parse(file);

  const prefixedPackages = {};
  for (const [key, val] of Object.entries(json.object)) {
    if (
      val.dependencies &&
      Object.keys(val.dependencies).some((depKey) => startsWithPrefix(depKey))
    ) {
      prefixedPackages[key] = val;
    }
  }

  const packageMap = {};

  for (const [key, pkg] of Object.entries(prefixedPackages)) {
    // Skip if the package itself is prefixed
    if (startsWithPrefix(key)) continue;
    for (const [depKey, depVersion] of Object.entries(pkg.dependencies)) {
      // Skip if the dependency is not prefixed
      if (!startsWithPrefix(depKey)) continue;

      const version = depVersion.replace(/[^\d\.]/g, "").trim();
      // Skip if the version is not a semver or wildcard
      if (version === "") continue;

      if (!packageMap[depKey])
        packageMap[depKey] = {
          packages: {},
          recommendedVersion: null,
        };

      if (
        packageMap[depKey].recommendedVersion === null ||
        gt(version, packageMap[depKey].recommendedVersion, true)
      ) {
        packageMap[depKey].recommendedVersion = version;
      }
      packageMap[depKey].packages[key] = version;
    }
  }

  for (const [key, val] of Object.entries(packageMap)) {
    const recommendedVersion = val.recommendedVersion;
    const packageVersions = Object.values(val.packages);
    if (packageVersions.every((version) => version === recommendedVersion)) {
      delete packageMap[key];
      continue;
    }

    const entries = Object.entries(val.packages);
    const sortedEntries = entries.sort((a, b) => gt(a[1], b[1], true));
    packageMap[key].packages = Object.fromEntries(sortedEntries);
  }

  const flipped = {};
  for (const [key, val] of Object.entries(packageMap)) {
    for (const [dep, version] of Object.entries(val.packages)) {
      if (!flipped[dep]) flipped[dep] = {};
      if (version === val.recommendedVersion) continue;
      flipped[dep][key] = {
        currentVersion: version,
        recommendedVersion: val.recommendedVersion,
      };
    }
  }

  console.log(flipped);
}
