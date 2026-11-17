# Illustrative Pixel HD avatar handoff and plan

The Casual figure is the art baseline for the HD avatar work. It is one full-body character in a front three-quarter view, assembled from nine editable raster layers. The live Character editor and Profile still use the renderer described in the [avatar editor handoff](../../avatar-handoff.md). Start by proving one clothing swap on this figure.

## Pick up the asset

| File | Purpose |
| --- | --- |
| [hd-casual.png](../../../public/avatar/hd-casual.png) | Transparent 1024 × 1536 composite and the simplest preview. Use this to compare future work against the art baseline. |
| [hd-casual.svg](../../../public/avatar/hd-casual.svg) | Standalone layered preview with all raster layers embedded. Open it to inspect or hide groups without resolving external files. |
| [Layer manifest](../../../public/avatar/hd-casual-layers/manifest.json) | File names, draw order, native offsets and dimensions, clothing slots, and body anchors. Each cropped PNG sits beside the manifest. |
| [Build script](../../../scripts/build-hd-casual.mjs) | Native-resolution masks, underpainting, and generator for all of the above. |

The supplied HD illustration provides the visible pixel artwork. The build script removes the backdrop, separates the parts, and paints the scalp and hoodie areas that become visible when their covering layers are removed. The script checks that the assembled layers reproduce the matted composite pixel for pixel. The body underpainting supports alignment checks and replacement garment authoring. A fully rendered alternate base would need its own art pass.

To reproduce the current asset, install FFmpeg and FFprobe on the command path, then run this from the frontend root:

```powershell
node scripts/build-hd-casual.mjs
```

The command uses the existing transparent composite as input and regenerates the files under `public/avatar/`. To start again from the original uncropped 1024 × 1536 reference, pass its PNG path as the first argument. Save proposed figures or alternate outfits under a different name while comparing them with the Casual baseline.

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
