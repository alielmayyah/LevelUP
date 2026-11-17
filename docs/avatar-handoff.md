# Avatar editor handoff

Frontend `dev` includes the avatar cleanup from `1180768`. That change retraced the sprites at native pixel resolution, tightened the collar and scarf masks, added **Tank and Hijab**, and restricted hijab to women’s avatars. Older male saves keep their outfit and colors and recover their previous hairstyle when the style is available.

The latest screenshot was investigated after that commit. The tee, ankle, and shoe defects below are still open.

## Reproduce

1. Run `npm run dev` and sign in as demo member `101`.
2. Open **Profile → Customize → Outfits**. Choose **Silver Sprinter**, then **Summer Fit**. This matches the screenshot’s spiked hair, cream mesh tee, teal shorts, white cross-trainers, and no socks.
3. Inspect the full preview and outfit tile. Compare **Circuit Training** and **Conditioning** for the same short-sleeve overlays. Sign in as `102` to check the women’s version and **Tank and Hijab**.

## Findings and next changes

- **Tee and collar.** The short-sleeve styles reuse the tank or racerback torso. A flat paint pass creates the sleeves, and the tank crest is recolored into a visible ghost mark. The separate neck shape can read as a detached strip above the collar. Give the tee styles their own garment silhouette and collar, with the forearms and hands on a separate layer. The original 32-bit reference sheet has a standalone teal tee suitable for tracing.
- **Shoes.** Cross-trainers use the amber pose, whose crop cuts into the outer toe. The full preview also clips each shoe at the midpoint before moving it to the current ankle. Preserve the complete shoe contours and fit the pair to the two ankle anchors. Check narrow and wide stances and the shoe-only tiles.
- **Bare ankles.** With **No Socks**, the recolored sock layer can leave a cuff line and stray trim below the shorts. Separate exposed skin from the reference sock artwork. Check that switching between no socks, ankle socks, and crew socks changes the cuff without changing the leg or shoe outline.

## Code and verification

- [Avatar.tsx](../src/avatar/Avatar.tsx) composes the layers, crop views, and body transforms. [referenceGeometry.ts](../src/avatar/referenceGeometry.ts) chooses the artwork and maps its landmarks onto the avatar.
- [ReferenceArt.tsx](../src/avatar/ReferenceArt.tsx) decodes the pixel layers and applies masks, colors, and cuffs. [SpriteDetails.tsx](../src/avatar/SpriteDetails.tsx) adds garment and shoe details.
- [trace-avatar-sheets.mjs](../scripts/trace-avatar-sheets.mjs) generates [referenceSprites.json](../src/avatar/referenceSprites.json) with FFmpeg from the original standard and inclusive 1536 × 1024 PNG sheets. The source PNGs are outside this checkout. Use the original sheets supplied with the avatar brief if regenerating the atlas.
- [catalog.ts](../src/avatar/catalog.ts) defines outfits, supported choices, and saved-avatar fallbacks. Keep existing saved style IDs when changing the artwork.
- Use [Avatar.test.tsx](../src/avatar/Avatar.test.tsx) for layer regressions and the **Character** cases in [pages.spec.ts](../e2e/pages.spec.ts) for the editor and save flows. Verify the full preview and tiles at phone and desktop sizes in English and Arabic, using both themes.
