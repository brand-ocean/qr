const { withAndroidManifest } = require('expo/config-plugins');

/**
 * Android 15/16 compat voor een bewust landscape-only game.
 *
 * Vanaf targetSdk 36 negeert Android `android:screenOrientation` (en
 * resizability / aspect ratio) op schermen met een smallest width van 600dp of
 * meer. Games zijn daarvan uitgezonderd, maar alleen als ze zichzelf als game
 * aanmerken via `android:appCategory`. Expo's app.json kent die sleutel niet,
 * vandaar deze plugin.
 *
 * De PROPERTY_COMPAT_ALLOW_RESTRICTED_RESIZABILITY-property is de expliciete
 * opt-out uit dezelfde gedragsverandering. Google beschrijft die als tijdelijk:
 * bij targetSdk 37 werkt hij niet meer. Zie de opmerking bij TARGET_SDK_NOTE.
 *
 * https://developer.android.com/about/versions/16/behavior-changes-16
 */

const RESTRICTED_RESIZABILITY_PROPERTY =
  'android.window.PROPERTY_COMPAT_ALLOW_RESTRICTED_RESIZABILITY';

/**
 * TARGET_SDK_NOTE: zodra dit project naar targetSdk 37 gaat, vervalt de
 * opt-out hieronder en dwingt Android op >=600dp-schermen alsnog vrije
 * rotatie af. Op dat moment moeten `index.tsx` en `video/[id].tsx` een echte
 * portret-layout krijgen; ze gaan er nu nog van uit dat breedte > hoogte.
 */
module.exports = function withAndroidGameCompat(config) {
  return withAndroidManifest(config, (config) => {
    const application = config.modResults.manifest.application?.[0];

    if (!application) {
      throw new Error(
        'withAndroidGameCompat: geen <application> gevonden in AndroidManifest.xml',
      );
    }

    application.$['android:appCategory'] = 'game';

    const properties = application.property ?? [];
    const existing = properties.find(
      (property) =>
        property.$?.['android:name'] === RESTRICTED_RESIZABILITY_PROPERTY,
    );

    if (existing) {
      existing.$['android:value'] = 'true';
    } else {
      properties.push({
        $: {
          'android:name': RESTRICTED_RESIZABILITY_PROPERTY,
          'android:value': 'true',
        },
      });
    }

    application.property = properties;

    return config;
  });
};
