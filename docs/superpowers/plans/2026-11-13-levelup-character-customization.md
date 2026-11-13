# LevelUP member characters

Give each member a persistent, customizable pixel-art character that looks like the gym characters in the splash screen. Use one library of SVG parts and palettes. The same saved character renders full-body in the editor and as a portrait in Profile and, when sharing is available, the Leaderboard.

## 1. Release scope

| First release | After the core backend is ready |
| --- | --- |
| Build the art catalog, renderer, Profile editor, and mock persistence. | Add authenticated cross-device persistence and integrate the saved character with opted-in leaderboard rows. |
| Offer a starter character, live preview, randomize, reset, and save. | Add a separate sharing choice so members can hide their character while remaining on the leaderboard. |
| Use a portrait in Profile when the Profile header is implemented. | Extend the catalog by adding more parts or palettes under the existing identifiers and rendering rules. |

Profile and Leaderboard are currently placeholders. Build the renderer and editor against the frontend mock API while the Profile header is being built. Place the editor at an authenticated route such as /tabs/profile/character, reached through **Customize character** in Profile. Keep the existing five tabs. Treat this as a new feature alongside the Sprint 1 mock work and explicitly add it to the project scope before backend implementation.

## 2. Art catalog and representation

Use one catalog for everyone. Offer optional starter looks with masculine, feminine, and androgynous styling across youth, adult, and older-adult appearances. Everyone gets the same editor options regardless of account sex or age. An appearance selection is artistic and has no effect on membership eligibility or the data shown elsewhere in the app.

| Slot | Initial catalog | Color and fitting rules |
| --- | --- | --- |
| **Hair** | Ten drawn styles: buzz, fade, side part, short curls, afro, locs, braids, bob, ponytail, and bun. Bald is the empty option. | Eight palettes including black, dark brown, light brown, blonde, auburn, gray, silver, and violet. Long styles can contain back and front layers under one style ID. |
| **Body** | Five silhouettes: slender, straight, broad-shouldered, rounded, and wider-hipped. | Offer all five across appearance presets. Use neutral labels and previews. Clothing adapts to the selected body. |
| **Face** | Four outlines and three optional appearance treatments: youthful, adult, and older. Add three eye/brow variants and three expressions once the anchor system is proven. | Eight hand-tuned skin palettes. Draw age cues through facial detail, hairline, and optional expression marks. Gray hair remains independently selectable at every appearance. |
| **Facial hair** | Stubble, mustache, goatee, short beard, and full beard. Clean-shaven is the empty option. | Match hair color by default. Offer an independent palette, including when the head is bald. Position facial hair to the jaw anchors. |
| **Clothes** | Tee, tank, hoodie, and tracksuit. | Give each design eight color palettes, including LevelUP violet and amber. Draw one fitting variant per body silhouette, then recolor it in code. |
| **Extras** | One head slot with headband, cap, or sport hijab. One face slot with glasses. Both have an empty choice. | Style caps and head coverings with their own color palettes. Catalog rules define which hair layers remain visible when an item is worn. |

Use age cues as a separate control from body proportions. Start with youth, adult, and older faces on the standard rig. Add a junior rig before calling age coverage complete. Give it a shorter silhouette and proportionate head, shoulders, limbs, and outfit fits. Keep the adult and older-adult bodies on the standard rig. Reuse the same face and hair parts where the anchors line up, and draw small fit variants where needed. Validate the junior rig in the same two crops and keep it available as an appearance choice. Any expansion of gym account eligibility would be a separate product decision.

**Asset math.** Ten hairstyles × eight palettes + bald gives **81** hair looks. Five facial-hair styles × eight palettes + clean-shaven gives **41** independently selectable facial-hair looks. Five body silhouettes × four outfit designs require **20** fitted outfit drawings and yield **160** body/outfit color combinations. These three choices alone produce **531,360** combinations before skin tone, faces, age cues, or accessories. Keep shape and palette as separate IDs so adding a ninth color takes one palette entry per applicable color channel.

## 3. SVG format and renderer

- Author on a **48×64 integer grid** with a front-facing neutral pose, stepped outlines, a consistent light direction, and solid pixel shading. Define exact crown, eye, jaw, neckline, and shoulder coordinates in a checked-in art template. Establish a safe drawing box and a portrait crop early so tall hair and wide accessories stay visible.
- Give each part a stable ID, translated label key, slot, paint roles, and any required fit or visibility rules. Keep source SVGs by category. Generate typed React SVG groups at build time and verify the generated output in CI. Use integer paths, polygons, and rectangles with no external references, embedded images, or document-specific IDs.
- Render a single inline SVG per avatar. Draw back hair and back accessories first, then the body and clothing, then the face, expression and age details, beard, front hair, headwear, and glasses. Layered hair can extend behind the shoulders. Use small explicit anchor offsets or art variants for tested fits.
- Give each material separate **base, shade, and highlight** fills. Resolve palette IDs to three colors at render time and pass them as per-avatar CSS variables. Scope the variables to the SVG so two leaderboard members can use the same hair geometry in different colors on the same page. Use a separate outline token where the art needs a visible boundary in both themes. [SVG fill](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/fill)
- Use the same composition function with two view boxes, one for the full body and one for the portrait. Check target sizes on real screens. Use integer artwork coordinates and try SVG's crisp-edge rendering hint, then inspect it across Chromium and WebKit because the hint allows browsers to make their own rendering choices. [SVG 2 painting specification](https://www.w3.org/TR/SVG/latest/painting.html#ShapeRendering)
- Use a lean portrait path for lists that imports head parts and the upper clothing geometry it needs. Lazy-load the full editor, its artwork, and the option grid. Render existing leaderboard rows with their attached avatar data, and measure a 100-row scenario using the list's virtualization when available.

Example of one recolorable part inside the inline SVG. Every palette reuses the same coordinates.

~~~svg
<g data-part="short-curls">
  <path d="M15 7h18v3h4v10H11V10h4z" fill="var(--avatar-hair-shade)"/>
  <path d="M15 8h17v3h3v5H13v-5h2z" fill="var(--avatar-hair-base)"/>
  <path d="M16 8h10v2H16z" fill="var(--avatar-hair-highlight)"/>
</g>
~~~

### Fit and compatibility rules

| Case | Expected behavior |
| --- | --- |
| Hoodie on any of the five bodies | Resolve to that body's hoodie geometry. Retain the hoodie and its palette when the body changes. |
| Ponytail or locs with a cap | Use a catalog-defined front-hair variant if needed. Keep visible back hair where the art fits. |
| Sport hijab selected | Temporarily suppress covered hair layers. Restore the member's previous hair when they remove it. |
| Beard and face changes | Resolve the beard to the face's jaw anchors. Author exceptions where an offset cannot produce a clean fit. |
| Hair color changed while beard follows hair | Update both immediately. When the member switches beard color to independent, retain that choice through later hair edits. |
| Missing or retired part ID | Render the closest supported fallback for that slot and keep the other selections. Retain stable IDs or map them explicitly when retiring parts. |

## 4. Profile editor

1. Show the current portrait and **Customize character** on Profile. A member without a saved character sees a stable starter generated from an opaque member identifier and the first catalog version. It remains the same across reloads. Starter generation does not use name, age, body scans, or account sex.
2. Open a full-screen editor with a live preview and **Body · Face · Hair · Facial hair · Outfit · Extras** sections. Put a part grid below the preview and put the selected part's color swatches beneath it. Use short translated labels and show both a border and a checkmark for the selected tile.
3. On desktop, place the preview beside the options. On mobile, place it above the options and keep **Save** within reach above the bottom safe area. Let users switch the preview between full body and portrait.
4. Changes update the local draft immediately. **Randomize** generates a valid combination and shows it in the preview. **Reset** returns the draft to the original starter. Closing with unsaved changes offers **Keep editing** and **Discard changes**.
5. On **Save**, keep the draft visible while the request runs. Prevent duplicate submissions. On success, replace the stored profile data with the server response and return to Profile. On failure, leave the draft intact and offer a retry. Keep the last saved avatar visible wherever the member has already left the editor.
6. Localize strings and swatch names in English and Arabic. Mirror the editor layout and navigation in RTL. Keep the character facing the same direction. Use keyboard-operable radio groups or equivalent controls, readable swatch names, visible focus, screen-reader announcements for save results, and 44×44 px targets.

## 5. Data and persistence

Store the selected IDs rather than image files. A compact V1 payload can look like this.

~~~json
{
  "schemaVersion": 1,
  "rig": "standard",
  "body": "broad",
  "face": "oval",
  "appearance": "older",
  "skinPalette": "skin-06",
  "eyes": "soft",
  "expression": "smile",
  "hair": { "style": "short-curls", "palette": "silver" },
  "beard": { "style": "goatee", "palette": "match-hair" },
  "outfit": { "style": "hoodie", "palette": "levelup-violet" },
  "headwear": { "style": "none", "palette": null },
  "eyewear": "round-glasses"
}
~~~

- **Frontend and mocks.** Put renderer and catalog code under src/avatar/. Keep wire types in src/api/types.ts while Sprint 1 is on handwritten DTOs. Add a nullable avatar to GET /me and an authenticated PUT /me/avatar for full replacement. Keep mock persistence behind the existing api() boundary. Use Capacitor Preferences keyed by member for the mock saved config so reopening the app restores it and switching Fit IDs does not leak the prior member's selections.
- **Backend.** Once the backend and scope are ready, define a versioned AvatarConfigDto and expose it in OpenAPI. Use server-side allowlists for every ID and supported combination. Derive the member from the authenticated token. Reject unknown fields and invalid values. Store one validated, nullable JSON configuration per member. Keep a revision or ETag if multi-device overwrite detection is needed. For example, a stale save can return 412, letting the editor reload the saved version or explicitly reapply its draft.
- **Compatibility.** Missing or null avatar data uses the starter or a generic placeholder in older clients. Keep stable part IDs across releases. When a newer payload contains an unsupported part, the older renderer displays a slot fallback. If the schema itself is newer than the editor can save, preserve the stored config and ask the user to update the app before editing.
- **Leaderboard.** Add a separate avatar-sharing setting, off by default, and keep it independent of FitScore sharing. When the member has enabled both settings, attach only the sanitized appearance config to the existing leaderboard row in the same query. Use a generic portrait when avatar sharing is off. Omit rows when the member is off the leaderboard. Avatar payloads contain no name, birth date, gender, measurements, or private settings.
- **Asset trust.** Treat saved data as choices from a built-in catalog. Resolve IDs to bundled shapes and palettes. Keep SVG uploads, external asset URLs, and raw SVG markup outside this feature so the renderer never interprets member-supplied markup.

## 6. Build sequence

- [ ] **Art template and sample sheet.** Draw two bodies, three hairstyles including a layered long style, two faces, two beards, and one fitted outfit. Review sample characters across skin tones, ages, and presentations at full size and in the leaderboard crop.
- [ ] **Renderer and catalog validation.** Build inline SVG composition, palette lookup, stable defaults, and both crops. Reject invalid art at build time. Build a review sheet from the actual renderer so artists can inspect new parts before merging.
- [ ] **Expand the art kit.** Finish the ten hairstyles, five bodies, eight skin palettes, facial-hair catalog, and fitted outfits. Check all 20 body/outfit fits and cover hair, headwear, beard, and skin with a pairwise sample set.
- [ ] **Finish age coverage.** Add the junior rig and fitted clothes for every offered junior silhouette. Use the same editor and palette model. Review child, teen, adult, and older-adult characters across styling choices, skin tones, and both crops.
- [ ] **Profile editor and local persistence.** Add the route and Profile entry, live preview, style and color controls, randomize, reset, save and retry, and authenticated mock persistence. Demonstrate the full flow for Sam, Lina, and Omar.
- [ ] **Cross-device sync.** Implement the backend DTOs, migration, authenticated save, and API contract tests. Regenerate the frontend types from OpenAPI and verify mock/API parity.
- [ ] **Leaderboard portraits and rollout.** Add the row projection after sharing behavior is agreed and the leaderboard exists. Verify opt-in, opt-out, cache refresh after saving, and list performance. Existing members should see a starter without a data backfill.

## 7. Acceptance checks

| Area | Pass condition |
| --- | --- |
| Recoloring | All eight hair palettes render on each of the ten styles. Two simultaneous avatars can show different palettes for the same style. |
| Fitting | All 20 body/outfit variants fit. Long hair, glasses, beard, headwear, and age cues render in the correct order and stay inside both crops. |
| Representation | Review child, teen, adult, and older-adult appearances across skin tones and different styling choices. No catalog choice is locked to profile demographics. |
| Editor | A member can change a style and its color independently, save, reload, and see the same result. Failed saves preserve the draft. Randomize only returns combinations the catalog supports. |
| Accessibility and layout | Keyboard controls, named swatches, focus, light/dark contrast, Arabic RTL, and safe-area spacing pass. Cover 320 px, phone landscape, and an Android device. Check the usual Playwright viewport matrix in both languages and themes. |
| Privacy and persistence | Mock saves stay separate by member. The real API denies unauthenticated saves and validates payloads. A member's own avatar syncs across devices. Leaderboard rows respect both leaderboard participation and avatar visibility. |
| Performance | Initial JavaScript stays within the repo's 200 KB gzip budget and each lazy route stays within 80 KB gzip. Measure the editor and a large leaderboard in the production build. |

