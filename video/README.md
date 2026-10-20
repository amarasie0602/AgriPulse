# AgriPulse films

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
