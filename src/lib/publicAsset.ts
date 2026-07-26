const EXTERNAL_URL = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i;

export const publicAssetPath = (assetPath: string) => {
  if (EXTERNAL_URL.test(assetPath)) return assetPath;
  return `${import.meta.env.BASE_URL}${assetPath.replace(/^\/+/, "")}`;
};
