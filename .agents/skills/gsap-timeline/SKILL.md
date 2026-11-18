---
name: gsap-timeline
description: Official GSAP skill for timelines — gsap.timeline(), position parameter, nesting, playback. Use when sequencing GSAP animations, choreographing keyframes, or when the user asks about GSAP timelines, sequencing, or animation order.
license: MIT
---

# GSAP Timeline

## LevelUP notes

- **Timelines are for scripted sequences**, such as the "new result" reveal and count-ups. State-driven UI (lists entering, reordering, gestures) stays in motion/react, and GSAP and motion/react never animate the same property on the same element. Section entrances already come from `useReveal` in `src/motion/gsapMotion.ts` (mark elements with `data-pop`, `data-grow`, `data-draw`, `data-dot`); write a new timeline only for a sequence it does not cover.
- **Ionic keeps visited pages mounted**, so cleanup on unmount is not enough. Start a page-level timeline in `useIonViewDidEnter` (after the page transition, once the data is there) and pause or kill it in `useIonViewWillLeave`; for a one-off reveal, jump to the end first (`tl.progress(1)`) so the page is complete when the member comes back. Scope it to a container ref inside `IonContent`, never the `IonPage` or the `IonContent` itself, and never animate Ionic's page transitions.
- **Never leave content hidden waiting for a timeline.** `from()` and `fromTo()` tweens render their start state as soon as they are added (`immediateRender`), so a timeline built early with `paused: true` hides content until it plays: build it when it should play, or set `immediateRender: false`. A skipped or killed timeline must leave the end state. Navigation never waits more than 600 ms on an exit timeline.
- **Reduced motion:** build timelines inside `gsap.matchMedia()` with `(prefers-reduced-motion: no-preference)` (`MOTION_OK`). Under reduce, use a short opacity-only fade or jump to the end (`tl.progress(1)`), not `duration: 0` on every child.
- **RTL:** `x`, `xPercent` and `left` are physical, in the examples below too: flip the sign when the document is RTL (`i18n.dir() === 'rtl'`).
- **Count-ups and text:** a count-up inside a timeline tweens a proxy object and, in `onUpdate`, writes the text formatted with `src/i18n/format.ts` (Latin digits); never call setState per frame. Never split Arabic text into characters: stagger words or lines.
- **Setup:** put shared durations and eases in the timeline's `defaults`, never `gsap.defaults()` (it is global). Don't import GSAP from screens in the initial bundle (Splash, Intro, Login, the tab shell): load it with `import()`. Register plugins only in the component that uses them.
- **ScrollTrigger isn't used:** lower sections already rise in through `useReveal`'s IntersectionObserver. If you add it, pages scroll inside `IonContent`, not the window, so set `scroller` to its scroll element (`await contentRef.current.getScrollElement()`).

On any conflict, LevelUP's `ui-standards` and `ionic-mobile-experience` skills win.

## When to Use This Skill

Apply when building multi-step animations, coordinating several tweens in sequence or parallel, or when the user asks about timelines, sequencing, or keyframe-style animation in GSAP.

**Related skills:** For single tweens and eases use **gsap-core**; for scroll-driven timelines use **gsap-scrolltrigger**; for React use **gsap-react**. _(LevelUP vendors only gsap-core, gsap-timeline and gsap-react; gsap-scrolltrigger is not installed.)_

## Creating a Timeline

```javascript
const tl = gsap.timeline();
tl.to(".a", { x: 100, duration: 1 })
  .to(".b", { y: 50, duration: 0.5 })
  .to(".c", { opacity: 0, duration: 0.3 });
```

By default, tweens are **appended** one after another. Use the **position parameter** to place tweens at specific times or relative to other tweens.

## Position Parameter

Third argument (or position property in vars) controls placement:

- **Absolute**: `1` — start at 1 second.
- **Relative (default)**: `"+=0.5"` — 0.5s after end; `"-=0.2"` — 0.2s before end.
- **Label**: `"labelName"` — at that label; `"labelName+=0.3"` — 0.3s after label.
- **Placement**: `"<"` — start when recently-added animation starts; `">"` — start when recently-added animation ends (default); `"<0.2"` — 0.2s after recently-added animation start.

Examples:

```javascript
tl.to(".a", { x: 100 }, 0);           // at 0
tl.to(".b", { y: 50 }, "+=0.5");      // 0.5s after last end
tl.to(".c", { opacity: 0 }, "<");     // same start as previous
tl.to(".d", { scale: 2 }, "<0.2");    // 0.2s after previous start
```

## Timeline Defaults

Pass defaults into the timeline so all child tweens inherit:

```javascript
const tl = gsap.timeline({ defaults: { duration: 0.5, ease: "power2.out" } });
tl.to(".a", { x: 100 }).to(".b", { y: 50 }); // both use 0.5s and power2.out
```

## Timeline Options (constructor)

- **paused: true** — create paused; call `.play()` to start.
- **repeat**, **yoyo** — same as tweens; apply to whole timeline.
- **onComplete**, **onStart**, **onUpdate** — timeline-level callbacks.
- **defaults** — vars merged into every child tween.

## Labels

Add and use labels for readable, maintainable sequencing:

```javascript
tl.addLabel("intro", 0);
tl.to(".a", { x: 100 }, "intro");
tl.addLabel("outro", "+=0.5");
tl.to(".b", { opacity: 0 }, "outro");
tl.play("outro");  // start from "outro"
tl.tweenFromTo("intro", "outro"); // pauses the timeline and returns a new Tween that animates the timeline's playhead from intro to outro with no ease.
```

## Nesting Timelines

Timelines can contain other timelines.

```javascript
const master = gsap.timeline();
const child = gsap.timeline();
child.to(".a", { x: 100 }).to(".b", { y: 50 });
master.add(child, 0);
master.to(".c", { opacity: 0 }, "+=0.2");
```

## Controlling Playback

- **tl.play()** / **tl.pause()**
- **tl.reverse()** / **tl.progress(1)** then **tl.reverse()**
- **tl.restart()** — from start.
- **tl.time(2)** — seek to 2 seconds.
- **tl.progress(0.5)** — seek to 50%.
- **tl.kill()** — kill timeline and (by default) its children.

## Official GSAP Best practices

- ✅ Prefer timelines for sequencing
- ✅ Use the **position parameter** (third argument) to place tweens at specific times or relative to labels.
- ✅ Add **labels** with `addLabel()` for readable, maintainable sequencing.
- ✅ Pass **defaults** into the timeline constructor so child tweens inherit duration, ease, etc.
- ✅ Put ScrollTrigger on the timeline (or top-level tween), not on tweens inside a timeline.

## Do Not

- ❌ Chain animations with **delay** when a **timeline** can sequence them; prefer `gsap.timeline()` and the position parameter for multi-step animation.
- ❌ Forget to pass **defaults** (e.g. `defaults: { duration: 0.5, ease: "power2.out" }`) when many child tweens share the same duration or ease.
- ❌ Forget that **duration** on the timeline constructor is not the same as tween duration; timeline “duration” is determined by its children.
- ❌ Nest animations that contain a ScrollTrigger; ScrollTriggers should only be on top-level Tweens/Timelines.
