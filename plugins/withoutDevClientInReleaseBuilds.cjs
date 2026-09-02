const { withSettingsGradle } = require('expo/config-plugins');

/**
 * Houdt expo-dev-client uit alles behalve development-builds.
 *
 * Android-autolinking kent geen debug/release-onderscheid: `debugOnly` in
 * expo-module.config.json wordt alleen door de Apple-tak gelezen. Daardoor
 * belandt expo-dev-launcher in elke variant, inclusief de AAB die naar Play
 * gaat -- met Compose, Koin, Apollo, MLKit en play-services-code-scanner in
 * zijn kielzog. Die laatste levert ook de portrait-vergrendelde
 * GmsBarcodeScanningDelegateActivity op waar Play Console over klaagt.
 *
 * De enige uitsluiting die autolinking ondersteunt is de `exclude`-lijst, en
 * die geldt voor de hele Gradle-invocatie. Daarom knopen we hem aan het
 * EAS-buildprofiel in plaats van aan de build-variant.
 *
 * Uitgesloten wanneer:
 *   - EAS_BUILD_PROFILE gezet is en niet 'development' is (preview, production)
 *   - of EXPO_EXCLUDE_DEV_CLIENT=1 gezet is (lokaal de productie-opzet testen)
 *
 * Lokale `expo prebuild` / `expo run:android` heeft geen EAS_BUILD_PROFILE en
 * houdt de dev-client dus gewoon.
 */

const EXCLUDED_MODULES = [
  'expo-dev-client',
  'expo-dev-launcher',
  'expo-dev-menu',
  'expo-dev-menu-interface',
];

const ANCHOR = 'expoAutolinking.useExpoModules()';
const MARKER =
  '// expo-dev-client uitgesloten door withoutDevClientInReleaseBuilds';

function shouldExcludeDevClient() {
  if (process.env.EXPO_EXCLUDE_DEV_CLIENT === '1') {
    return true;
  }

  const profile = process.env.EAS_BUILD_PROFILE;

  return Boolean(profile) && profile !== 'development';
}

module.exports = function withoutDevClientInReleaseBuilds(config) {
  return withSettingsGradle(config, (config) => {
    if (
      !shouldExcludeDevClient() ||
      config.modResults.contents.includes(MARKER)
    ) {
      return config;
    }

    if (!config.modResults.contents.includes(ANCHOR)) {
      throw new Error(
        `withoutDevClientInReleaseBuilds: "${ANCHOR}" niet gevonden in settings.gradle. ` +
          'Waarschijnlijk is de Expo-template veranderd; controleer of de exclude-lijst nog aankomt.',
      );
    }

    const exclude = EXCLUDED_MODULES.map((name) => `'${name}'`).join(', ');

    config.modResults.contents = config.modResults.contents.replace(
      ANCHOR,
      `${MARKER}\nexpoAutolinking.exclude = [${exclude}]\n${ANCHOR}`,
    );

    return config;
  });
};
