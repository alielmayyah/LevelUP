# Illustrative Pixel HD avatar handoff and plan

This archived plan records the original HD Casual sprite pilot. See the [avatar handoff](../../avatar-handoff.md) for the current front-facing portraits and their build pipeline.

## Layer contract

- The canvas origin is at the top left. Draw `layers` in manifest order. Each PNG is cropped, so place it at its recorded `x` and `y` at its recorded dimensions. Scale the composed character uniformly.
- Attach replacement art to the existing neck, shoulder, wrist, waist, and ankle anchors on the same canvas and in the same view. Check the areas a replacement exposes, including the scalp and shirt under the straps.
- Replace grouped pieces together when the user selects a slot. The backpack has a rear bag and front straps on opposite sides of the body in the draw order. Footwear has separate left and right images.
- Author replacement parts at native resolution. Keep transparency, small pixel clusters, clean contours, and the warm highlights and cool shadows of the baseline. Preview at both native size and in a small avatar frame.

## Suggested milestones

1. **Preview the layer stack.** Create a small development preview that reads the manifest and renders the nine PNGs in order. Compare it with the composite at 1024 × 1536, then verify it at editor and portrait sizes in both themes. Keep this isolated from the saved character flow.
2. **Prove one top swap.** Draw one alternative top against the same shoulder and wrist anchors. Test both tops with and without the existing backpack. Check the collar, waist overlap, cuff alignment, and revealed fabric. This is the point to review the art before producing more assets.
3. **Connect to customization.** Reuse the existing avatar catalog, editor, and Profile save flow. Store stable asset IDs. Keep older saved avatars readable, and define how an unsupported body or pose is handled before exposing HD choices. Verify the preview, save, reload, and Profile result in English and Arabic, with light and dark themes, on phone and desktop.
4. **Expand after the pilot.** Produce alternate hair, headwear and hijab, body rigs, outfits, and accessories as compatible artwork. Treat additional directions and motion as separate asset work. Add each only when its joints and clothing have been checked in that view or animation.

The pilot has one figure, one pose, and one outfit. Step 2 is complete when a second top can replace the hoodie without a gap or a misaligned joint and the backpack sits correctly on both.
