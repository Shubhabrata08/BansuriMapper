# Cross-platform change checklist

`[x]` = implemented and verified; `[ ]` = pending. Native changes below are
intentionally deferred: this request applies only to the HTML/web component.

| Change | Web | Windows | Android | iOS | Scope / verification |
| --- | --- | --- | --- | --- | --- |
| Replace the thaat selector with the 66 supplied raga names | [x] | [ ] | [ ] | [ ] | Web-specific catalog and screen; native thaat selectors stay unchanged. |
| Arrange all raga options alphabetically, A-Z | [x] | [ ] | [ ] | [ ] | Actual dropdown order and the full requested name set verified. |
| Use documented raga reference note inventories | [x] | [ ] | [ ] | [ ] | Mixed note forms and variant choices are recorded; the parent thaat is not substituted. |
| Rename the second selector to Reference Tanpura | [x] | [ ] | [ ] | [ ] | Web labels, summary, help text and metadata only. |
| Use note labels such as E tanpura and F tanpura | [x] | [ ] | [ ] | [ ] | Preserve the Tanpura naming when changing the selector control. |
| Keep the mapped instrument labeled as bansuri | [x] | [x] | [x] | [x] | Tanpura naming must not leak into the mapped-instrument selector. |
| Replace web key dropdowns with horizontal, 12-step note sliders | [x] | [ ] | [ ] | [ ] | Reference Tanpura and Mapped bansuri; mouse, touch and keyboard support verified. |
| Put web mapping beside the controls on non-mobile viewports | [x] | [ ] | [ ] | [ ] | From 768px at standard text scale; phone stacking and tablet/desktop mapping visibility verified. |
| Remove selected-swara technique instructions and redundant fingering code | [x] | [ ] | [ ] | [ ] | Keep the hole diagram and alternate-Pa control; browser tests verify diagram states directly. |
| Omit Shuddha from natural swara display text | [x] | [ ] | [ ] | [ ] | Web names, relative descriptions and variant notes only; preserve Komal/Tivra, raga names and shared data. |
| Preserve pitch, frequency and fingering calculations | [x] | [x] | [x] | [x] | Calculation modules unchanged; original parity tests and native UI tests pass. |
| Verify GitHub Pages HTML, assets, and phone/tablet/desktop interactions | [x] | N/A | N/A | N/A | 18 browser tests pass under `/BansuriMapper/`, including simplified swara details, hydration and all 12 slider steps. |
| Commit the raga/Tanpura catalog update | [x] | N/A | N/A | N/A | Commit `5b22037`. |
| Commit the slider/layout update | [x] | N/A | N/A | N/A | Included in the web note-slider and responsive-layout commit. |
| Commit the simplified-swara update | [x] | N/A | N/A | N/A | Included in the web swara-detail cleanup commit. |
| Deploy the web update | [ ] | N/A | N/A | N/A | Deployment remains a manual GitHub Pages workflow. |

## Catalog policy

- Include exactly the 66 names supplied for this change. No extra ragas are
  inferred from the heading "10 Thaats"; the supplied list contains nine groups.
- Preserve the supplied spelling and family assignments, even where traditions
  classify a raga differently.
- Each entry in `mobile/src/domain/raga-catalog.web.ts` cites its reference source.
  Tanarang's published inventories and George Howlett's Hindustani Raga Index
  are used for the note data. Variant choices are recorded on the affected entries.
- Show pitch-ordered note inventories for fingering, not aroha/avaroha sequences
  or a complete raga performance guide. Optional notes and gharana variants are
  not treated as universally interchangeable.
- `MapperScreen.web.tsx` contains the web-only UI changes. The native screen,
  native thaat state, and shared pitch/fingering functions must not change as part
  of this update. Future shared UI work should consult this table before syncing
  the web and native screens.

## Verification evidence

| Check | Result |
| --- | --- |
| TypeScript and ESLint | Passed |
| Catalog, web state, original HTML parity and existing native component tests | 94 tests passed; includes all 45,504 original reference cases |
| Additional Android native-screen regression | 4 tests passed |
| Pages-path browser tests | 18 tests passed on phone/tablet/desktop viewports |
| Existing Windows/native-screen/core calculation source diff | Unchanged by this update |
| Raga selector and note-slider/layout screenshots | Phone, tablet and desktop screenshots reviewed in `mobile/artifacts/playwright` (ignored build/test output) |
