# Current authentication story

`AgriPulseAuthStory` is the current four-chapter, 20-second film used only on login and registration. Run `npm.cmd run render:auth -- --browser-executable="C:/Program Files/Google/Chrome/Application/chrome.exe" --concurrency=1 --port=9338`. It writes the actual served file to `frontend/public/media/agripulse-auth-story.mp4`. The composition shares scene timing and narrative text with the client via `frontend/src/content/authStory.ts`. Default output has no baked text; the interactive browser layer owns accessible typography tied to the playback clock. For a separate titled export, render with `--props='{"titles":true}'` and a different output path.

Real sources: Tom Fisk rice fields (Pexels 6252566), Kindel Media harvesting (7456581), Amar Preciado irrigation (8166769). Local normalized harvest/irrigation sources are silent 960×540/30fps. Source links and license: [media/SOURCES.md](../frontend/public/media/SOURCES.md). Existing auth photographs provide initial/error fallbacks. No video mounts in the dashboard.

The encoded MP4 was verified at 960×540, 30fps, 20 seconds, no audio, 6,950,367 bytes. Initial full-resolution parallel rendering failed; normalized source footage with concurrency 1 rendered successfully.

## Historical exports

The hero and product tour below describe the earlier UI. They remain reproducible exports, not the current dashboard treatment.

# AgriPulse films

## Dashboard background

`src/HeroLoop.tsx` registers `AgriPulseHero`: a dedicated 12-second, 960x540,
30fps composition using the included real rice-field clip. It has no baked-in
headlines, statistics, or graphic overlays. The final 36 frames crossfade to the
start of the source so the next loop continues from the matching source frame.

```powershell
npm run render:hero -- --browser-executable="C:/Program Files/Google/Chrome/Application/chrome.exe" --concurrency=2
npm run still:hero -- --browser-executable="C:/Program Files/Google/Chrome/Application/chrome.exe"
```

Rendered source: `out/agripulse-hero.mp4`. Poster: `out/agripulse-hero-poster.jpg`.
The website uses a compressed fast-start H.264 copy (12 seconds, 2.7 MB):
`frontend/public/media/agripulse-hero.mp4`. To reproduce it, from the repo root:

```powershell
video/node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe -i video/out/agripulse-hero.mp4 -c:v libx264 -preset medium -crf 32 -maxrate 1800k -bufsize 3600k -an -movflags +faststart -y video/out/agripulse-hero-web.mp4
Copy-Item video/out/agripulse-hero-web.mp4 frontend/public/media/agripulse-hero.mp4
Copy-Item video/out/agripulse-hero-poster.jpg frontend/public/media/agripulse-hero-poster.jpg
```

The hero autoplays silently with inline playback and a pause/resume control.
Reduced-motion and detected data-saving/2G connections receive the real poster
without mounting video. Playback errors retain that poster. The foreground text
and actions are HTML, and the metrics remain outside the moving background.
This composition uses the same credited, licensed source footage described below.

## Brand film

An isolated Remotion project; no video dependencies ship in the web application.
The default composition uses real photographic material with deterministic gentle
camera motion, editorial titles, and fades. It is a photographic brand film, not
documentary moving footage and never a simulation of a user's farm or measurements.

From this directory:

```powershell
npm ci
npm run studio
npm run compositions
npm run render
npm run still
npm run render -- --props='{"durationSeconds":12,"useFootage":false}'
```

The real footage is now included at `public/rice-fields.mp4`. To reproduce the
verified film and its web variant on this Windows workstation:

```powershell
npm run render -- --props=footage.json --browser-executable="C:/Program Files/Google/Chrome/Application/chrome.exe" --concurrency=2
npm run still -- --props=footage.json --browser-executable="C:/Program Files/Google/Chrome/Application/chrome.exe"
npm exec -- remotion render src/index.tsx AgriPulse out/agripulse-web.mp4 --props=footage.json --browser-executable="C:/Program Files/Google/Chrome/Application/chrome.exe" --concurrency=2 --scale=0.5 --crf=30 --pixel-format=yuv420p --codec=h264
```

Verified outputs: `out/agripulse.mp4` (1920×1080, 34.3 MB) and
`out/agripulse-web.mp4` (960×540, 3.6 MB), both 18 seconds at 30fps.
The web variant and poster are copied to `frontend/public/media/`.

Output: `out/agripulse.mp4` (H.264, 1080p, 30fps, silent) and `out/poster.jpg`.
Use `--codec=vp9` with an `.webm` output for a different format. Keep durations
between 6 and 30 seconds. Rendered outputs are ignored by Git.

## Real footage mode

Download the original rice-field clip by Tom Fisk from
https://www.pexels.com/video/drone-footage-of-a-rice-field-6252566/
and save it as `public/rice-fields.mp4`. It is a 40-second aerial agricultural clip.
Set `useFootage` to true in input props. Three scenes use different starting frames;
the default 18-second film consumes at most 18 seconds of the source clip.
No temporary CDN preview URL is embedded in the composition. If footage is absent,
use the default real-photo mode. Explicit footage mode intentionally fails on a
missing file rather than substituting illustrations or generated farm scenery.

## Asset provenance

`public/rice-terraces.jpg` is a locally stored copy of the real photograph
“Rice Field Aerial View” by Quang Nguyen Vinh, Pexels photo 2172809:
https://www.pexels.com/photo/rice-field-aerial-view-2172809/
License checked 2026-10-20: https://www.pexels.com/license/ . Pexels permits use
and modification, including commercial use; do not resell unaltered stock media,
imply endorsement, or redistribute as a competing stock library. Attribution is
included here for provenance. These terraces are not identified as Sri Lanka.
No generated agricultural imagery is used in this composition.

Review Remotion's own license for your organization before commercial deployment:
https://www.remotion.dev/license . Rendering requires its browser binary or an
installed compatible Chrome, e.g. `--browser-executable="C:/Program Files/Google/Chrome/Application/chrome.exe"`.


## Photographic workspace product walkthrough

`AgriPulseProductTour` is a 20-second, 960×540, 30fps composition in `src/ProductTour.tsx`. It combines real rice-field footage with actual browser screenshots of the redesigned Dashboard, Farms, Crops, Resource Tracking, and Analytics pages. Screenshots in `public/ui/` were captured from a temporary API-backed verification account. The film labels them **Example workspace · test records** throughout. They are not claimed as a farmer's real measurements.

From `video/`:

```powershell
npm.cmd run render:tour -- --browser-executable="C:/Program Files/Google/Chrome/Application/chrome.exe" --concurrency=2 --port=9335
npm.cmd run still:tour -- --browser-executable="C:/Program Files/Google/Chrome/Application/chrome.exe" --port=9335
```

The existing `AgriPulseHero` and `AgriPulse` compositions remain available. The brand film now defaults to real footage. No promotional film is reintroduced at the bottom of the app.
