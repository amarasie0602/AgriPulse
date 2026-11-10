# AgriPulse authentication story and retained films

The current application plays `agripulse-auth-story.mp4` only after an explicit
request on login or registration. The operational dashboard has no video.
This 20-second, silent, 960×540/30fps H.264 film was rendered with Remotion.
Shared chapter timing: `frontend/src/content/authStory.ts`; composition:
`video/src/AuthStory.tsx`. HTML typography follows the actual playback clock.

Real footage, under the [Pexels license](https://www.pexels.com/license/):

- Rice fields: [Tom Fisk, 6252566](https://www.pexels.com/video/drone-footage-of-a-rice-field-6252566/).
- Harvest: [Kindel Media, 7456581](https://www.pexels.com/video/people-harvesting-vegetables-from-the-field-7456581/).
- Irrigation: [Amar Preciado, 8166769](https://www.pexels.com/video/watering-a-farm-8166769/).

Harvest and irrigation originals were normalized to 960×540, silent 30fps
local sources (`video/public/harvest-540.mp4`, `irrigation-540.mp4`).
The final chapter returns to a later part of the rice landscape. These are
representative agricultural scenes, not footage of an account holder's land.
Existing login/registration photographs remain the initial and error fallback.

## Earlier exported films (not displayed in the dashboard)

`agripulse-hero.mp4` is a separate 12-second, title-free Remotion composition
using the same Tom Fisk source footage credited below, with a loop crossfade.
The web copy is 960x540 H.264, silent, fast-start, approximately 2.7 MB.
`agripulse-hero-poster.jpg` is frame 45 of that composition.
This earlier background asset is retained for reproducibility and is not
mounted in the current dashboard.

`agripulse-web.mp4` is an 18-second, silent H.264 Remotion composition at 960×540.
Rendered from real rice-field aerial footage by Tom Fisk, Pexels video 6252566:
https://www.pexels.com/video/drone-footage-of-a-rice-field-6252566/
License checked 2026-10-20: https://www.pexels.com/license/ .
No farmer, place, or organization in the source endorses AgriPulse. This stock
footage is not identified as Sri Lankan or as any user's farm.

`agripulse-poster.jpg` is frame 100 of the same composition.
Reproduction and render commands: `video/README.md`.
This 18-second brand film is retained as a rendered asset. Its promotional player
is no longer displayed in the application.

On-screen transcript:
0–6s: AgriPulse / A clearer perspective. Every field has a story. Keep yours in view.
6–12s: Land / Crops / Resources. Plan the season. From the first planting to the next harvest.
12–18s: Observe / Record / Understand. Grow with perspective. Your farms. Your records. A more informed tomorrow.
