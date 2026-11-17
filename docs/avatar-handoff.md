# Avatar handoff

Every member has the same character: the **HD Casual** figure (hoodie, cargo pants, sneakers, backpack). For now, customizing means changing colors only. The old drawn characters (styles, outfits, hijab, glasses, body shapes) were removed.

## How it works

- **Art:** nine cropped PNG layers on a 1024 × 1536 canvas in [public/avatar/hd-casual-layers/](../public/avatar/hd-casual-layers/), with a [manifest](../public/avatar/hd-casual-layers/manifest.json). They are rebuilt by [scripts/build-hd-casual.mjs](../scripts/build-hd-casual.mjs). The [integration plan](superpowers/plans/2026-11-17-levelup-hd-avatar-integration.md) covers the layer contract and the next art milestones.
- **Geometry:** [hdFigure.ts](../src/avatar/hdFigure.ts) lists the layers in draw order, the color part each one belongs to, and the two crops (`full`, `portrait`). A unit test keeps it in step with the manifest.
- **Colors:** [palettes.hd.json](../src/avatar/palettes.hd.json) holds the presets for each part: `skin` (body and head layers), `hair`, `top` (hoodie), `bottom` (cargo pants) and `shoes`. Each preset has a swatch color for the picker and a recolor recipe: a hue turn, then saturation and lightness factors.
- **Renderer:** [Avatar.tsx](../src/avatar/Avatar.tsx) draws the layers as SVG `<image>`s and recolors each part with an SVG filter built from its preset. Near-white details (laces, drawstrings, the chest logo) stay white. The backpack keeps its painted colors.
- **Saved data:** [catalog.ts](../src/avatar/catalog.ts). `AvatarConfigDto` is `{ schemaVersion: 2, colors: { skin, hair, top, bottom, shoes } }`, with preset IDs only. Older schema-1 saves still load: they show the default look, keeping any color whose ID still exists. Members who never saved get a starter look seeded from their member ID.
- **Editor:** [Character.tsx](../src/pages/Character.tsx). There is one tab per part, each a row of swatches. Changes autosave, and the editor has Random and Undo.

## Known limits

- The beard is part of the head layer, so it follows skin, not hair color.
- There is one figure and one pose for everyone (no women's figure yet).
- Strong recolors of the top can shift the hoodie's warm highlights. Tune `hue`, `sat` and `light` in the palette file.

## Adding art later

Add new layers to the build script and the manifest, then list them in `HD_LAYERS` with their color part. New garments or hairstyles need a style field in `AvatarConfigDto` (and a schema bump) when they arrive.
