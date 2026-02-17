# Release Checklist (Afvinklijst)

## App Assets

- [ ] Replace `/Users/brandocean/Codebase/QR/assets/icon.png` with final app icon
- [ ] Replace `/Users/brandocean/Codebase/QR/assets/adaptive-icon.png` with final Android adaptive icon
- [ ] Replace `/Users/brandocean/Codebase/QR/assets/splash.png` with final splash image
- [ ] Verify `/Users/brandocean/Codebase/QR/app.json` icon/splash paths still match real files

## Store Assets (iOS / Android)

- [ ] Create iPhone App Store screenshots (required set)
- [ ] Create iPad screenshots (required if tablet support stays enabled)
- [ ] Create Android Play Store screenshots (minimum 4)
- [ ] Create Google Play feature graphic

## Metadata & Legal

- [ ] Add privacy policy URL
- [ ] Add support URL
- [ ] Finalize store description/subtitle/keywords
- [ ] Finalize content rating answers (App Store + Play Console)

## Fonts (Current Usage + Plan)

- [ ] Review `/Users/brandocean/Codebase/QR/docs/fonts-plan.md`
- [ ] Confirm final font family strategy (AeonikFono-only or split Fono/Pro)
- [ ] Verify loaded font files in `/Users/brandocean/Codebase/QR/src/app/_layout.tsx` match runtime usage
- [ ] Verify `expo-font` plugin entries in `/Users/brandocean/Codebase/QR/app.json` match chosen strategy
- [ ] Validate all key screens render with correct fonts (home/scanner/video/modals/not-found)

## Build & QA

- [ ] Run `pnpm tsc:check`
- [ ] Run `pnpm lint`
- [ ] Run `pnpm vitest:run`
- [ ] Run `pnpm videos:check`

## Submission

- [ ] Build iOS release
- [ ] Build Android release
- [ ] Upload metadata + screenshots + binaries
- [ ] Final submission check complete
