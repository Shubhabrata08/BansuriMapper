# Cross-platform change checklist

`[x]` = implemented and verified; `[ ]` = pending. Native changes below are
intentionally deferred: this request applies only to the HTML/web component.

| Change | Web | Windows | Android | iOS | Scope / verification |
| --- | --- | --- | --- | --- | --- |
| Replace the thaat selector with the 66 supplied raga names | [x] | [ ] | [ ] | [ ] | Web-specific catalog and screen; native thaat selectors stay unchanged. |
| Arrange all raga options alphabetically, A-Z | [x] | [ ] | [ ] | [ ] | Actual dropdown order and the full requested name set verified. |
| Use documented raga reference note inventories | [x] | [ ] | [ ] | [ ] | Mixed note forms and variant choices are recorded; the parent thaat is not substituted. |
| Rename the second selector to Reference Tanpura | [x] | [ ] | [ ] | [ ] | Web labels, summary, help text and metadata only. |
| Use options such as E tanpura and F tanpura | [x] | [ ] | [ ] | [ ] | Pitch ordering and sharp/flat spelling verified. |
| Keep the mapped-flute selector as bansuri options | [x] | [x] | [x] | [x] | Third selector verified on web; native screens remain unchanged. |
| Preserve pitch, frequency and fingering calculations | [x] | [x] | [x] | [x] | Calculation modules unchanged; original parity tests and native UI tests pass. |
| Verify GitHub Pages HTML, assets, and phone/tablet interactions | [x] | N/A | N/A | N/A | Six browser tests pass under `/BansuriMapper/`. |
| Commit the web update | [x] | N/A | N/A | N/A | Web-only source, tests, documentation and this checklist. |
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
| Pages-path browser tests | 6 tests passed on phone/tablet viewports |
| Existing Windows/native-screen/core calculation source diff | Unchanged by this update |
| Raga and Tanpura dropdown screenshots | `mobile/artifacts/playwright` (ignored build/test output) |
