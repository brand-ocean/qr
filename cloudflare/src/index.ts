interface Env {
  APP_STORE_URL: string;
  PLAY_STORE_URL: string;
}

const AASA = {
  applinks: {
    apps: [],
    details: [
      {
        appID: 'YOUR_TEAM_ID.nl.viralsgame.app',
        paths: ['/kaart*'],
      },
    ],
  },
};

const ASSET_LINKS = [
  {
    relation: ['delegate_permission/common.handle_all_urls'],
    target: {
      namespace: 'android_app',
      package_name: 'nl.viralsgame.app',
      sha256_cert_fingerprints: [
        '13:4C:1D:B6:23:8A:0F:CD:8F:62:85:E4:79:BD:C6:43:5C:33:7C:77:0B:82:CE:9E:25:A1:36:2B:AC:E2:80:F9',
        'FA:C6:17:45:DC:09:03:78:6F:B9:ED:E6:2A:96:2B:39:9F:73:48:F0:BB:6F:89:9B:83:32:66:75:91:03:3B:9C',
      ],
    },
  },
];

const SHARED_STYLES = `
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 24px; background: #000; color: #fff; min-height: 100vh; display: flex; align-items: center; justify-content: center; box-sizing: border-box; }
  #sunburst { position: fixed; inset: 0; overflow: hidden; z-index: 0; pointer-events: none; }
  #sunburst::before {
    content: '';
    position: absolute;
    width: 200vmax;
    height: 200vmax;
    top: calc(50% - 100vmax);
    left: calc(50% - 100vmax);
    background: conic-gradient(
      #22B331 0deg 23deg, #016A2A 23deg 46deg, #22B331 46deg 69deg, #FFFFFF 69deg 72deg,
      #EC001B 72deg 95deg, #7E131C 95deg 118deg, #EC001B 118deg 141deg, #FFFFFF 141deg 144deg,
      #FFF200 144deg 167deg, #FF8C00 167deg 190deg, #FFF200 190deg 213deg, #FFFFFF 213deg 216deg,
      #00B1E0 216deg 239deg, #1B5096 239deg 262deg, #00B1E0 262deg 285deg, #FFFFFF 285deg 288deg,
      #B52D87 288deg 311deg, #6D297F 311deg 334deg, #B52D87 334deg 357deg, #FFFFFF 357deg 360deg
    );
    animation: spin 60s linear infinite;
  }
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  .card { position: relative; z-index: 1; width: 100%; max-width: 520px; background: #111; border-radius: 16px; padding: 20px; box-sizing: border-box; }
  h1 { margin: 0 0 12px; }
  p { line-height: 1.5; }
  .buttons { display: grid; gap: 12px; margin-top: 16px; }
  a { display: block; text-decoration: none; font-weight: 700; text-align: center; border-radius: 10px; padding: 12px; }
  .primary { background: #FFCC00; color: #000; }
  .secondary { background: #fff; color: #111; }
  .logo { width: 100%; max-width: 320px; height: auto; display: block; margin: 0 auto 16px; }
`;

type Platform = 'ios' | 'android' | 'unknown';

function detectPlatform(request: Request): Platform {
  const ua = request.headers.get('User-Agent') ?? '';
  if (/iPhone|iPad|iPod/i.test(ua)) return 'ios';
  if (/Android/i.test(ua)) return 'android';
  return 'unknown';
}

function storeButtons(platform: Platform, env: Env): string {
  if (platform === 'ios') {
    return `<a class="secondary" href="${env.APP_STORE_URL}">Download op iPhone</a>`;
  }
  if (platform === 'android') {
    return `<a class="secondary" href="${env.PLAY_STORE_URL}">Download op Android</a>`;
  }
  return `
    <a class="secondary" href="${env.APP_STORE_URL}">Download op iPhone</a>
    <a class="secondary" href="${env.PLAY_STORE_URL}">Download op Android</a>`;
}

function homepageHtml(): string {
  return `<!doctype html>
<html lang="nl">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Virals Game</title>
    <style>${SHARED_STYLES}</style>
  </head>
  <body>
    <div id="sunburst"></div>
    <div class="card">
      <img class="logo" src="/virals-logo.png" alt="Virals Meme Editie" />
      <p>Pre-order nu het virale meme kaartspel en speel het samen met vrienden.</p>
      <div class="buttons">
        <a class="primary" href="https://avondmakers.nl/products/virals-meme-editie">Pre-order</a>
      </div>
    </div>
  </body>
</html>`;
}

function fallbackHtml(cardId: string, _platform: Platform, _env: Env): string {
  const escapedCardId = cardId.replaceAll(/[^\da-z]/gi, '');

  return `<!doctype html>
<html lang="nl">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Virals Game</title>
    <style>${SHARED_STYLES}</style>
  </head>
  <body>
    <div id="sunburst"></div>
    <div class="card">
      <img class="logo" src="/virals-logo.png" alt="Virals Meme Editie" />
      <p>Je hebt een kaart gescand van Virals Game. Pre-order nu jouw eigen set!</p>
      <div class="buttons">
        <a class="primary" href="https://avondmakers.nl/products/virals-meme-editie">Pre-order</a>
      </div>
    </div>
  </body>
</html>`;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const { pathname } = url;

    if (pathname === '/') {
      return new Response(homepageHtml(), {
        headers: {
          'Cache-Control': 'no-store',
          'Content-Type': 'text/html; charset=utf-8',
        },
      });
    }

    if (
      pathname === '/.well-known/apple-app-site-association' ||
      pathname === '/apple-app-site-association'
    ) {
      return new Response(JSON.stringify(AASA), {
        headers: {
          'Cache-Control': 'public, max-age=300',
          'Content-Type': 'application/json',
        },
      });
    }

    if (pathname === '/.well-known/assetlinks.json') {
      return new Response(JSON.stringify(ASSET_LINKS), {
        headers: {
          'Cache-Control': 'public, max-age=300',
          'Content-Type': 'application/json',
        },
      });
    }

    const match = pathname.match(/^\/(kaart\d{4})$/i);
    if (match?.[1]) {
      return new Response(
        fallbackHtml(match[1].toLowerCase(), detectPlatform(request), env),
        {
          headers: {
            'Cache-Control': 'no-store',
            'Content-Type': 'text/html; charset=utf-8',
          },
        },
      );
    }

    return new Response('Not Found', { status: 404 });
  },
} satisfies ExportedHandler<Env>;
