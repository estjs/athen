const PRERELEASE_REG = /^\d+\.\d+\.\d+-([a-z0-9-]+)/i;

export function getNpmPublishTag(version) {
  const prerelease = version.match(PRERELEASE_REG);

  return prerelease?.[1] ?? 'latest';
}
