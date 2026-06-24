import { VIDEOS, type VideoCard } from '../../src/data/videos.ts';

const VIDEO_BY_ID = new Map<string, VideoCard>(
  VIDEOS.map((video) => [video.id, video]),
);

interface EmailSender {
  send(message: {
    to: string | string[];
    from: { email: string; name?: string };
    subject: string;
    text: string;
    html?: string;
  }): Promise<{ messageId: string }>;
}

interface Env {
  APP_STORE_URL: string;
  PLAY_STORE_URL: string;
  EMAIL: EmailSender;
  REPORT_EMAIL_TO: string;
  MAILER_TOKEN?: string;
  TRIGGER_KEY?: string;
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
  @font-face { font-family: 'Aeonik Fono'; src: url('/fonts/AeonikFono-Bold.otf') format('opentype'); font-weight: 700; font-display: swap; }
  @font-face { font-family: 'Aeonik Fono'; src: url('/fonts/AeonikFono-Black.otf') format('opentype'); font-weight: 900; font-display: swap; }
  body { font-family: 'Aeonik Fono', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 24px; background: #000; color: #fff; min-height: 100vh; display: flex; align-items: center; justify-content: center; box-sizing: border-box; }
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
  p { line-height: 1.5; text-align: center; }
  .buttons { display: grid; gap: 12px; margin-top: 16px; }
  a { display: block; text-decoration: none; font-weight: 700; text-align: center; border-radius: 10px; padding: 12px; }
  .primary { background: #FFCC00; color: #000; }
  .secondary { background: #fff; color: #111; }
  .logo { width: 100%; max-width: 320px; height: auto; display: block; margin: 0 auto 16px; }
`;

const PLAYER_STYLES = `
  body.player { padding: 0; display: block; }
  body.player #sunburst::before { animation: none; }
  .dark-overlay { position: fixed; inset: 0; z-index: 0; background: rgba(0, 0, 0, 0.85); pointer-events: none; }
  .video-screen { position: relative; z-index: 1; width: 100%; min-height: 100vh; min-height: 100dvh; box-sizing: border-box; }
  .main-layout { display: flex; flex-direction: row; align-items: center; padding: 12px; min-height: 100vh; min-height: 100dvh; box-sizing: border-box; }
  .video-section { flex: 1; min-width: 0; display: flex; align-items: center; justify-content: center; }
  .frame { position: relative; width: 100%; aspect-ratio: 16 / 9; background: #000; border: 4px solid #fff; border-radius: 4px; overflow: hidden; }
  .frame iframe, .frame #player { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; }
  .overlay-btn { position: absolute; inset: 0; z-index: 4; display: flex; align-items: center; justify-content: center; background: rgba(0, 0, 0, 0.45); border: 0; cursor: pointer; padding: 0; }
  .overlay-btn svg { width: 72px; height: 72px; }
  .button-panel { width: 185px; display: flex; flex-direction: column; justify-content: center; padding-left: 12px; box-sizing: border-box; }
  .signal { display: flex; justify-content: center; margin-bottom: 2px; }
  .button-card { background: #fff; border: 4px solid #000; border-radius: 20px; padding: 8px; display: flex; flex-direction: column; gap: 8px; box-shadow: 6px 6px 0 rgba(0, 0, 0, 0.8); }
  .vb { display: flex; align-items: center; justify-content: center; border: 4px solid #000; border-radius: 16px; padding: 12px 8px; font-family: 'Aeonik Fono', sans-serif; font-weight: 700; text-transform: uppercase; font-size: 15px; text-decoration: none; cursor: pointer; box-sizing: border-box; }
  .vb-primary { background: #007AFF; color: #fff; box-shadow: 4px 4px 0 #000; }
  .vb-outline { background: transparent; color: #000; }
  .play-row { display: flex; flex-direction: row; gap: 8px; }
  .ctrl { flex: 1; min-height: 48px; background: #FFD700; border: 4px solid #000; border-radius: 16px; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 4px 4px 0 #000; padding: 8px 0; }
  .ctrl:disabled { opacity: 0.5; cursor: default; }
  .ctrl svg { width: 26px; height: 26px; }
  .gate { position: relative; z-index: 1; min-height: 100vh; min-height: 100dvh; display: flex; align-items: center; justify-content: center; padding: 20px; box-sizing: border-box; }
  .gate-card { background: #fff; color: #000; border: 4px solid #000; border-radius: 20px; padding: 24px; max-width: 360px; width: 100%; text-align: center; box-shadow: 6px 6px 0 rgba(0, 0, 0, 0.8); display: flex; flex-direction: column; gap: 16px; align-items: center; }
  .gate-card h1 { margin: 0; font-size: 22px; font-weight: 900; }
  .gate-card p { margin: 0; font-weight: 700; }
  .notice-card { text-align: center; }
  .notice-card h1 { font-size: 22px; }
  .hidden { display: none !important; }
  @media (orientation: portrait) {
    .main-layout { flex-direction: column; justify-content: center; gap: 16px; }
    .video-section { width: 100%; flex: 0 0 auto; }
    .button-panel { width: 100%; max-width: 420px; align-self: center; padding-left: 0; }
  }
`;

const ICON_PLAY = `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>`;
const ICON_PAUSE = `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M6 5h4v14H6zm8 0h4v14h-4z"/></svg>`;
const ICON_REPLAY = `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/></svg>`;

function pageShell(title: string, body: string, bodyClass = ''): string {
  return `<!doctype html>
<html lang="nl">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover" />
    <meta name="robots" content="noindex" />
    <title>${title}</title>
    <style>${SHARED_STYLES}${PLAYER_STYLES}</style>
  </head>
  <body${bodyClass ? ` class="${bodyClass}"` : ''}>
    <div id="sunburst"></div>
${body}
  </body>
</html>`;
}

function noticePageHtml(title: string, message: string): string {
  return pageShell(
    'Virals Game',
    `    <div class="card notice-card">
      <img class="logo" src="/virals-logo.png" alt="Virals Meme Editie" />
      <h1>${escapeHtml(title)}</h1>
      <p>${escapeHtml(message)}</p>
    </div>`,
  );
}

function playerPageHtml(card: VideoCard): string {
  const clip = JSON.stringify({
    endTime: card.endTime,
    startTime: card.startTime,
    videoId: card.videoId,
  });

  const signalSvg = `<svg width="60" height="30" viewBox="0 0 60 30" aria-hidden="true">
            <path d="M 10 10 Q 30 0 50 10" fill="none" stroke="white" stroke-linecap="round" stroke-width="4" />
            <path d="M 20 23 Q 30 16 40 23" fill="none" stroke="white" stroke-linecap="round" stroke-width="4" />
          </svg>`;

  const warningGate = card.contentWarning
    ? `    <div class="gate" id="warningGate">
      <div class="gate-card">
        <h1>Let op</h1>
        <p>Deze kaart bevat mogelijk schokkende of beledigende inhoud.</p>
        <button class="vb vb-primary" id="warningContinue">Doorgaan</button>
      </div>
    </div>
`
    : '';
  const playerHidden = card.contentWarning ? ' hidden' : '';

  return pageShell(
    'Virals Game',
    `    <div class="dark-overlay"></div>
${warningGate}    <div class="video-screen${playerHidden}" id="playerCard">
      <div class="main-layout">
        <div class="video-section">
          <div class="frame">
            <div id="player"></div>
            <button id="bigPlay" class="overlay-btn" aria-label="Afspelen">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#fff" d="M8 5v14l11-7z"/></svg>
            </button>
          </div>
        </div>
        <div class="button-panel">
          <div class="signal">${signalSvg}</div>
          <div class="button-card">
            <a class="vb vb-primary" href="/game#scan">SCAN KAART</a>
            <div class="play-row">
              <button id="playPause" class="ctrl" disabled aria-label="Afspelen of pauzeren">${ICON_PLAY}</button>
              <button id="replay" class="ctrl" disabled aria-label="Opnieuw afspelen">${ICON_REPLAY}</button>
            </div>
            <a class="vb vb-outline" href="/game">Terug</a>
          </div>
        </div>
      </div>
    </div>
    <script>
      var CLIP = ${clip};
      var ICON_PLAY = ${JSON.stringify(ICON_PLAY)};
      var ICON_PAUSE = ${JSON.stringify(ICON_PAUSE)};
      var player, ready = false, ended = false, endTimer = null;
      var bigPlay = document.getElementById('bigPlay');
      var playPause = document.getElementById('playPause');
      var replay = document.getElementById('replay');

      function clearEndTimer() {
        if (endTimer) { clearInterval(endTimer); endTimer = null; }
      }
      // The YouTube 'end' param only applies to the first play-through, so the
      // clip boundary is enforced here on every play (matches the native app).
      function watchEnd() {
        clearEndTimer();
        if (!CLIP.endTime || CLIP.endTime <= 0) { return; }
        endTimer = setInterval(function () {
          if (player && player.getCurrentTime && player.getCurrentTime() >= CLIP.endTime) {
            ended = true;
            player.pauseVideo();
          }
        }, 250);
      }
      function startClip() {
        ended = false;
        player.seekTo(CLIP.startTime, true);
        player.playVideo();
      }
      function onYouTubeIframeAPIReady() {
        player = new YT.Player('player', {
          videoId: CLIP.videoId,
          playerVars: {
            controls: 0, rel: 0, modestbranding: 1, playsinline: 1,
            iv_load_policy: 3, fs: 0, disablekb: 1,
            start: CLIP.startTime,
            end: CLIP.endTime > 0 ? CLIP.endTime : undefined
          },
          events: {
            onReady: function () {
              ready = true;
              playPause.disabled = false;
              replay.disabled = false;
            },
            onStateChange: function (e) {
              if (e.data === YT.PlayerState.PLAYING) {
                playPause.innerHTML = ICON_PAUSE;
                watchEnd();
              } else {
                playPause.innerHTML = ICON_PLAY;
                clearEndTimer();
                if (e.data === YT.PlayerState.ENDED) { ended = true; }
              }
            },
            onError: function () {
              clearEndTimer();
              document.querySelector('.video-section').innerHTML =
                '<div class="gate-card">' +
                '<h1>Video tijdelijk niet beschikbaar</h1>' +
                '<p>Probeer het later opnieuw.</p></div>';
            }
          }
        });
      }
      bigPlay.addEventListener('click', function () {
        bigPlay.classList.add('hidden');
        if (ready) { startClip(); }
      });
      playPause.addEventListener('click', function () {
        if (!ready) { return; }
        var state = player.getPlayerState();
        if (state === YT.PlayerState.PLAYING) { player.pauseVideo(); }
        else if (ended) { startClip(); }
        else { player.playVideo(); }
      });
      replay.addEventListener('click', function () {
        if (ready) { startClip(); }
      });
      var warningGate = document.getElementById('warningGate');
      if (warningGate) {
        var WARN_KEY = 'viralsShowContentWarning';
        function revealPlayer() {
          warningGate.classList.add('hidden');
          document.getElementById('playerCard').classList.remove('hidden');
        }
        // Respect the "Toon waarschuwing" setting from the rules screen.
        if (localStorage.getItem(WARN_KEY) === 'false') { revealPlayer(); }
        document.getElementById('warningContinue').addEventListener('click', function (event) {
          event.preventDefault();
          localStorage.setItem(WARN_KEY, 'false');
          revealPlayer();
        });
      }
    </script>
    <script src="https://www.youtube.com/iframe_api"></script>`,
    'player',
  );
}

function gamePageHtml(): string {
  return pageShell(
    'Virals Game',
    `    <style>
      .info-btn { position: fixed; top: 16px; right: 16px; z-index: 5; width: 44px; height: 44px; border-radius: 22px; border: 3px solid #000; background: #fff; color: #000; font-weight: 800; font-size: 20px; cursor: pointer; box-shadow: 3px 3px 0 rgba(0,0,0,0.8); }
      .game-wrap { position: relative; z-index: 1; width: 100%; max-width: 520px; display: flex; flex-direction: column; align-items: center; gap: 24px; }
      .game-logo { width: 82%; max-width: 360px; height: auto; transform: rotate(-2deg); }
      .game-card { background: #fff; color: #000; border: 5px solid #000; border-radius: 28px; padding: 24px; width: 100%; box-sizing: border-box; box-shadow: 12px 12px 0 rgba(0,0,0,0.8); display: flex; flex-direction: column; gap: 18px; align-items: center; }
      .game-card p { color: #000; font-weight: 800; font-size: 18px; line-height: 1.4; margin: 0; }
      .btn-primary { display: block; width: 100%; box-sizing: border-box; text-align: center; background: #FFCC00; color: #000; font-weight: 800; font-size: 18px; border: 4px solid #000; border-radius: 14px; padding: 14px; cursor: pointer; box-shadow: 5px 5px 0 rgba(0,0,0,0.8); }
      #scanner { position: fixed; inset: 0; z-index: 50; background: #000; display: none; }
      #scanner.open { display: block; }
      #scanner video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
      .scan-frame { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -55%); width: 250px; height: 250px; max-width: 70vw; max-height: 70vw; border: 4px solid #fff; border-radius: 20px; box-shadow: 0 0 0 9999px rgba(0,0,0,0.45); }
      .scan-hint { position: absolute; left: 0; right: 0; bottom: 130px; text-align: center; color: #fff; font-weight: 800; font-size: 18px; text-shadow: 2px 2px 0 #000; padding: 0 20px; }
      .scan-msg { position: absolute; left: 50%; top: 16%; transform: translateX(-50%); color: #fff; background: rgba(0,0,0,0.7); padding: 12px 18px; border-radius: 12px; text-align: center; max-width: 80vw; line-height: 1.4; }
      .scan-close { position: absolute; left: 20px; right: 20px; bottom: 48px; background: #fff; color: #000; font-weight: 800; font-size: 18px; border: 4px solid #000; border-radius: 14px; padding: 14px; cursor: pointer; box-shadow: 5px 5px 0 rgba(0,0,0,0.6); }
      #rules { position: fixed; inset: 0; z-index: 60; background: rgba(0,0,0,0.8); display: none; align-items: center; justify-content: center; padding: 16px; }
      #rules.open { display: flex; }
      .rules-modal { background: #fff; color: #000; border: 4px solid #000; border-radius: 20px; max-width: 600px; width: 100%; max-height: 92%; overflow: hidden; display: flex; flex-direction: column; }
      .rules-head { display: flex; align-items: center; justify-content: space-between; background: #FFD700; border-bottom: 4px solid #000; padding: 10px 16px; }
      .rules-head h2 { margin: 0; font-size: 16px; text-transform: uppercase; }
      .rules-close { background: none; border: 0; font-size: 28px; font-weight: 800; cursor: pointer; line-height: 1; }
      .rules-body { padding: 16px; overflow-y: auto; text-align: left; }
      .rules-body h3 { font-size: 14px; text-transform: uppercase; border-bottom: 2px solid #eee; padding-bottom: 4px; margin: 16px 0 6px; }
      .rules-body p { color: #333; font-size: 14px; line-height: 1.45; margin: 0 0 6px; text-align: left; }
      .rules-group { font-size: 15px; text-transform: uppercase; font-weight: 900; margin: 0 0 8px; }
      .rules-divider { border-top: 2px solid #eee; margin: 14px 0; }
      .toggle-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: 12px; }
      .toggle-row input { width: 26px; height: 26px; }
    </style>
    <button class="info-btn" id="infoBtn" aria-label="Informatie">i</button>
    <div class="game-wrap">
      <img class="game-logo" src="/virals-logo.png" alt="Virals Meme Editie" />
      <div class="game-card">
        <p>Scan een QR code op een kaart om de video te bekijken!</p>
        <button class="btn-primary" id="scanBtn">SCAN KAART</button>
      </div>
    </div>
    <div id="scanner">
      <video id="scanVideo" playsinline muted></video>
      <div class="scan-frame"></div>
      <div class="scan-hint">Richt de camera op een QR code</div>
      <div class="scan-msg hidden" id="scanMsg"></div>
      <button class="scan-close" id="scanClose">SLUITEN</button>
    </div>
    <div id="rules">
      <div class="rules-modal">
        <div class="rules-head"><h2>Informatie</h2><button class="rules-close" id="rulesClose" aria-label="Sluiten">&times;</button></div>
        <div class="rules-body">
          <p class="rules-group">Hoe werkt het spel</p>
          <h3>Pak een kaart van de stapel</h3>
          <p>Pak een kaart zonder te kijken naar de achterkant met het jaartal.</p>
          <h3>Scan de QR-code</h3>
          <p>Tik op SCAN KAART en richt de camera op de QR-code. De video opent automatisch.</p>
          <h3>Bekijk de video</h3>
          <p>Klik op &#9658; om de video te starten. Gebruik &#10074;&#10074; om te pauzeren of &#8635; om opnieuw te bekijken.</p>
          <div class="rules-divider"></div>
          <h3>Inhoudswaarschuwing</h3>
          <p>Sommige kaarten bevatten schokkende of beledigende inhoud. Zet de waarschuwing aan om v&oacute;&oacute;r het spelen van deze kaarten een melding te krijgen.</p>
          <div class="toggle-row"><span>Toon waarschuwing</span><input type="checkbox" id="cwToggle" /></div>
        </div>
      </div>
    </div>
    <canvas id="scanCanvas" class="hidden"></canvas>
    <script src="https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js"></script>
    <script>
      (function () {
        var WARN_KEY = 'viralsShowContentWarning';
        // Regex-free parse so this string stays safe inside the server template.
        function parseCardId(value) {
          if (!value) { return null; }
          var v = value.trim().toLowerCase();
          if (v.indexOf('viralsgame') < 0) { return null; }
          var i = v.indexOf('kaart');
          if (i < 0) { return null; }
          var d = v.slice(i + 5, i + 9);
          if (d.length !== 4) { return null; }
          for (var k = 0; k < 4; k++) {
            var c = d.charCodeAt(k);
            if (c < 48 || c > 57) { return null; }
          }
          return 'kaart' + d;
        }

        var rules = document.getElementById('rules');
        document.getElementById('infoBtn').addEventListener('click', function () { rules.classList.add('open'); });
        document.getElementById('rulesClose').addEventListener('click', function () { rules.classList.remove('open'); });
        rules.addEventListener('click', function (e) { if (e.target === rules) { rules.classList.remove('open'); } });
        var cw = document.getElementById('cwToggle');
        cw.checked = localStorage.getItem(WARN_KEY) !== 'false';
        cw.addEventListener('change', function () { localStorage.setItem(WARN_KEY, cw.checked ? 'true' : 'false'); });

        var scanner = document.getElementById('scanner');
        var video = document.getElementById('scanVideo');
        var canvas = document.getElementById('scanCanvas');
        var ctx = canvas.getContext('2d', { willReadFrequently: true });
        var msg = document.getElementById('scanMsg');
        var stream = null, raf = null, detector = null, scanning = false;

        function showMsg(t) { msg.textContent = t; msg.classList.remove('hidden'); }
        function hideMsg() { msg.classList.add('hidden'); }
        function stopScan() {
          scanning = false;
          if (raf) { cancelAnimationFrame(raf); raf = null; }
          if (stream) { stream.getTracks().forEach(function (t) { t.stop(); }); stream = null; }
        }
        function closeScanner() { stopScan(); scanner.classList.remove('open'); }
        function handleValue(value) {
          var id = parseCardId(value);
          if (id) { stopScan(); window.location.href = '/' + id; return true; }
          return false;
        }
        function tick() {
          if (!scanning) { return; }
          if (video.readyState === video.HAVE_ENOUGH_DATA) {
            if (detector) {
              detector.detect(video).then(function (codes) {
                if (codes && codes.length) { for (var i = 0; i < codes.length; i++) { if (handleValue(codes[i].rawValue)) { return; } } }
              }).catch(function () {});
            } else if (window.jsQR) {
              var w = video.videoWidth, h = video.videoHeight;
              if (w && h) {
                canvas.width = w; canvas.height = h;
                ctx.drawImage(video, 0, 0, w, h);
                var img = ctx.getImageData(0, 0, w, h);
                var code = window.jsQR(img.data, w, h, { inversionAttempts: 'dontInvert' });
                if (code && code.data && handleValue(code.data)) { return; }
              }
            }
          }
          raf = requestAnimationFrame(tick);
        }
        async function startCamera() {
          hideMsg();
          try {
            if ('BarcodeDetector' in window) {
              try {
                var formats = await window.BarcodeDetector.getSupportedFormats();
                if (formats.indexOf('qr_code') >= 0) { detector = new window.BarcodeDetector({ formats: ['qr_code'] }); }
              } catch (e) {}
            }
            stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
            video.srcObject = stream;
            await video.play();
            scanning = true;
            raf = requestAnimationFrame(tick);
          } catch (err) {
            if (err && (err.name === 'NotAllowedError' || err.name === 'NotFoundError')) {
              showMsg('Geef cameratoegang om te scannen, of open de QR-code met je standaard camera-app.');
            } else {
              showMsg('Camera kon niet starten. Tik op SLUITEN en probeer opnieuw.');
            }
          }
        }
        function openScanner() { scanner.classList.add('open'); startCamera(); }
        document.getElementById('scanBtn').addEventListener('click', openScanner);
        document.getElementById('scanClose').addEventListener('click', closeScanner);
        if (location.hash === '#scan') { openScanner(); }
      })();
    </script>`,
  );
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

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

async function sendReportMail(
  env: Env,
  subject: string,
  text: string,
): Promise<void> {
  const recipients = env.REPORT_EMAIL_TO.split(',')
    .map((address) => address.trim())
    .filter(Boolean);

  await env.EMAIL.send({
    to: recipients,
    from: { email: 'rapport@viralsgame.nl', name: 'Virals Video Check' },
    subject,
    text,
    html: `<pre style="font-family: ui-monospace, monospace; white-space: pre-wrap;">${escapeHtml(text)}</pre>`,
  });
}

async function handleVideosReport(
  request: Request,
  env: Env,
): Promise<Response> {
  const authorization = request.headers.get('Authorization') ?? '';
  if (!env.MAILER_TOKEN || authorization !== `Bearer ${env.MAILER_TOKEN}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  let payload: { subject?: string; text?: string };
  try {
    payload = (await request.json()) as { subject?: string; text?: string };
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }

  if (typeof payload.subject !== 'string' || typeof payload.text !== 'string') {
    return new Response('Missing subject or text', { status: 400 });
  }

  await sendReportMail(env, payload.subject, payload.text);

  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
}

const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/brand-ocean/qr/main';
const CHECK_CONCURRENCY = 20;

interface CardVideo {
  cardId: string;
  videoId: string;
}

interface CardCheckFailure extends CardVideo {
  allowlistReason?: string;
  status: number;
}

function parseVideoCards(source: string): CardVideo[] {
  const cards: CardVideo[] = [];
  for (const match of source.matchAll(
    /id: '(kaart\d{4})',[\s\S]*?videoId: '((?:[^'\\]|\\.)*)'/g,
  )) {
    cards.push({ cardId: match[1], videoId: match[2] });
  }
  return cards;
}

function oembedUrl(videoId: string): string {
  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
  return `https://www.youtube.com/oembed?url=${encodeURIComponent(watchUrl)}&format=json`;
}

function checkReportText(
  totalCards: number,
  broken: ReadonlyArray<CardCheckFailure>,
  allowlisted: ReadonlyArray<CardCheckFailure>,
): string {
  const lines: string[] = [];
  if (broken.length === 0) {
    lines.push(`Alles werkt. Alle ${totalCards} video's zijn beschikbaar.`);
  } else {
    lines.push(
      broken.length === 1
        ? `1 video werkt niet:`
        : `${broken.length} video's werken niet:`,
      '',
    );
    for (const failure of broken) {
      lines.push(
        `${failure.cardId} → https://www.youtube.com/watch?v=${failure.videoId} (HTTP ${failure.status})`,
      );
    }
  }
  if (allowlisted.length > 0) {
    lines.push(
      '',
      `Bewust genegeerd: ${allowlisted.map((failure) => failure.cardId).join(', ')}`,
    );
  }
  lines.push('', `Gecontroleerd: ${totalCards} kaarten.`);
  return lines.join('\n');
}

async function handleManualVideosCheck(
  env: Env,
  key: string,
  mailed: boolean,
): Promise<Response> {
  if (!env.TRIGGER_KEY || key !== env.TRIGGER_KEY) {
    return new Response('Unauthorized', { status: 401 });
  }

  const [videosResponse, allowlistResponse] = await Promise.all([
    fetch(`${GITHUB_RAW_BASE}/src/data/videos.ts`),
    fetch(`${GITHUB_RAW_BASE}/config/videos-check-allowlist.json`),
  ]);
  if (!videosResponse.ok || !allowlistResponse.ok) {
    return new Response('Kon de kaartdata niet ophalen van GitHub.', {
      status: 502,
    });
  }

  const cards = parseVideoCards(await videosResponse.text());
  const allowlist = (await allowlistResponse.json()) as {
    entries?: ReadonlyArray<{
      cardId: string;
      reason?: string;
      videoId: string;
    }>;
  };
  const allowlistByKey = new Map(
    (allowlist.entries ?? []).map((entry) => [
      `${entry.cardId}|${entry.videoId}`,
      entry.reason ?? 'allowlisted',
    ]),
  );

  const statuses: number[] = Array.from({ length: cards.length }, () => 0);
  let nextIndex = 0;
  const lane = async (): Promise<void> => {
    while (nextIndex < cards.length) {
      const index = nextIndex++;
      try {
        statuses[index] = (await fetch(oembedUrl(cards[index].videoId))).status;
      } catch {
        statuses[index] = -1;
      }
    }
  };
  await Promise.all(Array.from({ length: CHECK_CONCURRENCY }, lane));

  const broken: CardCheckFailure[] = [];
  const allowlisted: CardCheckFailure[] = [];
  for (const [index, card] of cards.entries()) {
    const status = statuses[index];
    if (status === 200) continue;
    const allowlistReason = allowlistByKey.get(
      `${card.cardId}|${card.videoId}`,
    );
    if (allowlistReason === undefined) {
      broken.push({ ...card, status });
    } else {
      allowlisted.push({ ...card, allowlistReason, status });
    }
  }

  const text = checkReportText(cards.length, broken, allowlisted);
  const subject =
    broken.length === 0
      ? `✅ Virals: alle ${cards.length} video's werken`
      : broken.length === 1
        ? `❌ Virals: 1 video werkt niet`
        : `❌ Virals: ${broken.length} video's werken niet`;

  if (mailed) {
    await sendReportMail(env, subject, text);
  }

  const heading =
    broken.length === 0
      ? '✅ Alles werkt'
      : broken.length === 1
        ? '❌ 1 video werkt niet'
        : `❌ ${broken.length} video's werken niet`;
  const brokenList = broken
    .map(
      (failure) =>
        `<li><strong>${escapeHtml(failure.cardId)}</strong> — <a class="link" href="https://www.youtube.com/watch?v=${escapeHtml(failure.videoId)}">${escapeHtml(failure.videoId)}</a> (HTTP ${failure.status})</li>`,
    )
    .join('');
  const mailUrl = `/check/${encodeURIComponent(key)}/mail`;

  const page = `<!doctype html>
<html lang="nl">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <meta name="robots" content="noindex" />
    <title>Virals video-check</title>
    <style>${SHARED_STYLES}
      ul { padding-left: 20px; line-height: 1.6; }
      .link { display: inline; padding: 0; color: #FFCC00; }
      .muted { opacity: 0.7; font-size: 14px; }
    </style>
  </head>
  <body>
    <div id="sunburst"></div>
    <div class="card">
      <h1>${heading}</h1>
      ${broken.length > 0 ? `<ul>${brokenList}</ul>` : ''}
      ${allowlisted.length > 0 ? `<p class="muted">Bewust genegeerd: ${escapeHtml(allowlisted.map((failure) => failure.cardId).join(', '))}</p>` : ''}
      <p class="muted">Gecontroleerd: ${cards.length} kaarten.</p>
      <div class="buttons">
        ${
          mailed
            ? `<p>📧 Rapport gemaild naar ${escapeHtml(env.REPORT_EMAIL_TO)}</p>`
            : `<a class="primary" href="${mailUrl}">Mail dit rapport</a>`
        }
      </div>
    </div>
  </body>
</html>`;

  return new Response(page, {
    headers: {
      'Cache-Control': 'no-store',
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const { pathname } = url;

    if (pathname === '/internal/videos-report' && request.method === 'POST') {
      return handleVideosReport(request, env);
    }

    const checkMatch = pathname.match(/^\/check\/([\w-]+)(\/mail)?$/);
    if (checkMatch?.[1] && request.method === 'GET') {
      return handleManualVideosCheck(
        env,
        checkMatch[1],
        checkMatch[2] !== undefined,
      );
    }

    if (pathname === '/internal/videos-check' && request.method === 'GET') {
      return handleManualVideosCheck(
        env,
        url.searchParams.get('key') ?? '',
        url.searchParams.get('mail') === '1',
      );
    }

    if (pathname === '/') {
      return new Response(homepageHtml(), {
        headers: {
          'Cache-Control': 'no-store',
          'Content-Type': 'text/html; charset=utf-8',
        },
      });
    }

    if (pathname === '/game' || pathname === '/game/') {
      return new Response(gamePageHtml(), {
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
      const cardId = match[1].toLowerCase();
      const card = VIDEO_BY_ID.get(cardId);
      let html: string;
      if (!card) {
        html = noticePageHtml(
          'Kaart niet gevonden',
          `Kaart "${cardId}" bestaat niet. Controleer de QR-code of het kaartnummer.`,
        );
      } else if (card.videoId === 'ERROR') {
        html = noticePageHtml(
          'Video niet meer beschikbaar',
          'Deze video is niet meer beschikbaar. Onze excuses hiervoor. Je kunt dit kaartje uit het spel verwijderen.',
        );
      } else {
        html = playerPageHtml(card);
      }
      return new Response(html, {
        headers: {
          'Cache-Control': 'no-store',
          'Content-Type': 'text/html; charset=utf-8',
        },
      });
    }

    return new Response('Not Found', { status: 404 });
  },
} satisfies ExportedHandler<Env>;
