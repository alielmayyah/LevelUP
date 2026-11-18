# Avatar handoff

Home, Profile, and the avatar editor use a front-facing cartoon portrait. The member's profile selects its portrait family.

## Edit a portrait

In mock mode, sign in with Fit ID `101` (Mohamed) or `102` (Lina), then open **Profile → Edit avatar**.

| Profile | Hair tab styles |
| --- | --- |
| Male | Curls, fade, swept |
| Female | Curls, bob, bun, hijab |

Both families offer skin tones, hair colors, five eye colors, and a tee, hoodie, or track jacket with outfit swatches. Selecting **Hijab** shows scarf swatches in the Hair tab. The scarf has its own color and layers over any outfit. Edits, Surprise me, and Undo all use the same autosave flow. See [Character.tsx](../src/pages/Character.tsx).

## Saved settings

`PUT /me/avatar` accepts schema 2 with five color preset IDs (`skin`, `hair`, `top`, `bottom`, `shoes`) and an optional `portrait` object with `look`, `outfit`, `eyes`, and optional `hijabColor`. Keep the legacy bottom and shoe IDs for save compatibility. The scarf uses IDs from the outfit palette and defaults to charcoal.

Schema 2 saves without portrait options keep their color presets and use curls, tee, and brown eyes. The demo treats schema 1 records as a starter avatar. A look from the other family falls back to the current family's curls while keeping the outfit and eye choices. The renderer defaults to the male family when sex is absent. See [DTOs](../src/api/types.ts), [catalog](../src/avatar/catalog.ts), and [palettes](../src/avatar/palettes.hd.json).

## Rebuild the artwork

Run `node scripts/build-avatar-portrait.mjs` from the frontend root with FFmpeg and `libwebp` on your path. The generator turns the [11 aligned ImageGen masters](../art/avatar/cartoon/) into [34 transparent WebP textures](../public/avatar/cartoon-portrait/).

The generator works on a 418 × 418 canvas. It builds a head, skin, iris, and hair or scarf texture per look, plus three outfit textures per family. Female textures use the `girl-` filename prefix. Keep the eyes, chin, and neckline aligned when replacing a master. Check all three outfits and both light and dark swatches at editor and thumbnail sizes. The runtime combines the textures in [Avatar.tsx](../src/avatar/Avatar.tsx).

## Artwork direction

The built-in ImageGen used this prompt to restyle the previous portrait, then produced four aligned edits.

> Restyle this as one cheerful Snapchat Bitmoji-style illustrated avatar, a bold flat 2D app sticker. Existing portrait is the identity and direct eye-contact reference. Keep a straight-on centered head bounded well inside the square, both eyes looking directly at us, distinctive chestnut curls, soft eyebrows and a tidy beard that frames the jaw, olive tan complexion and a subtle friendly closed-mouth smile. Simplify and exaggerate for friendliness: slightly larger rounded head and clear almond eyes, fewer broad stylized curls, softly rounded jaw, simple nose and small ears. Confident expressive flat graphic line art, medium smooth dark brown outlines, only two or three clean matte cel shades per material, broad solid color planes, crisp readable shapes at 40 pixels. Absolutely no fine hair strands, realistic pores, photographic shading, gradients, or 3D rendering. A plain slate-gray short-sleeved crew-neck athletic tee visible only at the shoulders, neutral gray flat fills so it recolors cleanly, no black backpack or branding. Square framing with crown at about 6%, eyes about 46%, chin about 73%, only neck/collar and modest shoulders below. Keep both sides of the figure balanced, crop shoulders flush at the bottom. Render on a genuinely transparent background, clean antialiasing, no circle, no drop shadow, no white border, no text/logos. Fit the style of a vibrant friendly Snapchat avatar sticker, with a simple expression suitable for a fitness app profile.

The four edits keep the eyes, chin, neck, shoulders, and framing aligned. Two change the hairstyle and beard to a short textured fade with stubble or a clean-shaven quiff. The other two replace the tee with a hood-down pullover or stand-collar track jacket.

<details>
<summary>Girl portrait and hijab prompts</summary>

> Create the matching young adult woman avatar for the same fitness app sticker set. The attached male avatar is a STYLE AND CANVAS reference only. Draw a distinct friendly adult woman in the same Snapchat Bitmoji-style clean flat 2D illustration. Straight-on head and shoulders, centered and balanced, both brown eyes looking into the camera, warm medium olive skin, medium brown chin-length curls framing her cheeks and tucked behind the base of the neck, soft rounded jaw, softly arched dark brows, small natural closed-mouth smile. Fit the eye line around 46% of the square and the crown near 5%; chin around 72%. Keep both irises at the same height. Simple graphic shapes, dark smooth outer lines, two or three matte color planes, very little detail, legible as a 48 pixel avatar. Use the same pen weight, palette family and relaxed expression as the reference, with no photorealism, grain, or 3D shading. Completely plain neutral-gray fitted athletic crew tee at the shoulders, clear neckline on both sides, with hair behind the shoulders so we can swap the outfit independently. Leave face, neck and collar color contours clear and distinct. Entire character as a real transparent PNG cutout. No drawn background, glow, border, cast shadow, text, earrings, makeup or jewelry. Crop the shirt horizontally near the bottom just like the reference. A cohesive companion to the existing male sticker.

The bob, bun, hoodie, and jacket edits retain the face and neckline alignment. The scarf is a separate head cutout, registered to the girl portrait and rendered over any outfit.

> Create one aligned HEAD AND SPORTS HIJAB CUTOUT asset for the exact same woman in this flat Snapchat/Bitmoji-style avatar. Existing square art is the edit target. Keep her face, both eyes and pupil centers, expression, face scale, warm complexion, cheek silhouette and chin in the exact same pixels. Replace all hair and exposed neck with a modest charcoal-gray sports hijab wrapped neatly around the crown and cheeks and fully covering the hair, ears and neck. A curved forehead opening of fabric follows her face, and natural simple dark folds overlap below the chin. The scarf drapes into a compact rounded bib tapering toward the upper chest, at about 87% down the square; it has a single neat curved lower edge, ends near the base of her neck at the front, and has no very long tails. Make it entirely grayscale for palette swaps. Keep the original design's even bold dark linework and two to three clean matte cel shades, clean friendly eyes, flat colors. Output only the face and headscarf from the crown to the rounded bib. Do not draw a shirt, shoulders, chest, arms, jewelry or loose hair; the app will composite her clothing separately. Leave the entire area outside the face and scarf truly transparent, including below the scarf. No added backdrop, glow, outline border, text, or realistic texture. Maintain the exact aligned square crop and leave clear transparent margins.

</details>
