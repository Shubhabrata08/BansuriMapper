import type { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => {
  const basePath: string | undefined = process.env.BANSURI_WEB_BASE_PATH;
  if (basePath !== undefined && basePath !== '' && !/^\/[A-Za-z0-9._-]+(?:\/[A-Za-z0-9._-]+)*$/.test(basePath)) {
    throw new Error('BANSURI_WEB_BASE_PATH must be empty or a URL path such as /BansuriMapper.');
  }
  if (basePath?.split('/').some(segment => segment === '.' || segment === '..')) {
    throw new Error('The website base path cannot contain dot segments.');
  }
  return {
    ...config,
    name: config.name ?? 'Bansuri Fingering Mapper',
    slug: config.slug ?? 'bansuri-fingering-mapper',
    web: { ...config.web, output: 'static' },
    ...(basePath !== undefined && {
      experiments: { ...config.experiments, baseUrl: basePath || undefined },
    }),
  };
};
