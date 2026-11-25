# HTML website and GitHub Pages

The website uses the same Paper components and pitch/fingering engine as the
native apps, not an iframe. Its web-specific screen now provides 66 alphabetically
arranged raga reference inventories. Reference Tanpura and Mapped bansuri use
horizontal sliders with 12 chromatic steps from C through B. Their readouts use
labels such as `E tanpura` and `F bansuri`, and follow the selected sharp/flat spelling.
Native apps still use their existing thaat/reference-bansuri selectors; rollout
status is tracked in [CHANGE_CHECKLIST.md](CHANGE_CHECKLIST.md).
The original single-file HTML remains in `Tests\Reference.html` as the test oracle.

## Source and build output

- HTML document: `mobile\src\app\+html.tsx`.
- Web entry/metadata: `mobile\src\app\index.web.tsx`.
- Web interface: `mobile\src\screens\MapperScreen.web.tsx`.
- Native interface, unchanged: `mobile\src\screens\MapperScreen.tsx`.
- Raga data and sources: `mobile\src\domain\raga-catalog.web.ts`.
- Shared calculations: `mobile\src\domain\mapper.ts` (unchanged).
- Generated website: `mobile\dist-pages\index.html` and its sibling assets.

The generated site contains prerendered HTML and uses JavaScript for interactions.
Assets are hosted with the site, including the Material icon font; no CDN UI
library or application backend is needed. The `.nojekyll` marker preserves Expo's
underscore-prefixed asset directories.

Raga notes are pitch-ordered reference inventories, not aroha/avaroha or complete
performance instructions. Variant choices are recorded with the catalog entries
and displayed where relevant. The Reference Tanpura selects the tonic key only;
no audio playback is added, and the existing pitch/octave calculations are reused.

On viewports at least 768px wide (at standard text scale), controls are on the
left and the swara map begins in a second column, visible without scrolling down
past the controls. The selected fingering detail sits below the controls and the
reference-note inventory follows the map. Mobile and large-text layouts remain
stacked; selecting a note on mobile scrolls its detail into view. The sliders
support dragging/tapping, arrow keys, Home, and End.

## Build and preview

Use Node.js 26 and npm:

```powershell
cd mobile
npm ci
npm run build:pages
npm run preview:pages
```

Open `http://127.0.0.1:4173/BansuriMapper/`. Serve the directory over HTTP; opening
`index.html` using `file://` does not replicate a hosted site.

The default public base path is `/BansuriMapper`. To host at a different project
path, set `BANSURI_WEB_BASE_PATH` for the build and preview commands. An empty
value builds for a domain root. This is a public URL path, not a credential.
Normal mobile builds do not set it and retain their existing configuration.

## Deploy manually to GitHub Pages

1. In `Shubhabrata08/BansuriMapper`, open **Settings > Pages**.
2. Set **Build and deployment > Source** to **GitHub Actions**.
3. Open **Actions > GitHub Pages > Run workflow**, select `master`, and run it.
4. Wait for the `build` and `deploy` jobs to finish. If GitHub asks for approval
   for the `github-pages` environment, approve that deployment.
5. Open `https://shubhabrata08.github.io/BansuriMapper/`.

The workflow performs a clean dependency install, type checking, linting, HTML
parity/component tests, and phone/tablet/desktop browser tests before deploying. It uses
GitHub's temporary workflow identity; no personal access token or custom secret
is needed. Pushes run the build/test job only. Publishing is deliberately manual
through **Run workflow**, so committing changes alone does not publish them.

For updates, push the source and run the workflow again. If the repository is
renamed or a custom domain is introduced, update the public base-path setting
before rebuilding.

## Validation and source-only commits

```powershell
cd mobile
npm run typecheck
npm run lint
npm test
npx playwright install chromium
npm run test:pages
```

On a Windows machine with Edge installed, `PLAYWRIGHT_CHANNEL=msedge` can select
Edge instead of downloading Chromium. Browser tests serve the export at the same
project subpath as GitHub Pages and check asset requests, reloads, responsive
layouts, selectors, alternate Pa, and reset.

`dist-pages`, `.env` files, dependencies, test output, APKs and MSIX artifacts stay
out of Git. The workflow uploads only the generated website as a Pages deployment
artifact; it does not commit compiled output or publish native build artifacts.
