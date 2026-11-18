---
name: gsap-react
description: Official GSAP skill for React — useGSAP hook, refs, gsap.context(), cleanup. Use when writing or reviewing GSAP code in React components, or when the user asks about GSAP with React, useGSAP, or cleanup on unmount.
license: MIT
---

# GSAP with React

## LevelUP notes

- **Pick the tool with `ui-standards` → Animation.** CSS for simple states, motion/react for state-driven UI (something appears, leaves, reorders or follows a gesture), GSAP for scripted sequences (count-ups, the "new result" reveal, SVG drawing). Ignore any advice to prefer GSAP for all React animation. GSAP and motion/react never animate the same property on the same element.
- **Ionic keeps visited pages mounted**, so `useGSAP` cleanup, which runs on unmount, does not run on forward navigation or a tab switch. Start page-level motion in `useIonViewDidEnter` (wrap the callback in `contextSafe` from `useGSAP()` so it is still reverted on unmount) and pause or kill it in `useIonViewWillLeave`.
- **Scope to a container ref inside `IonContent`**, never the `IonPage` or the `IonContent` itself: Ionic animates those during page transitions. Never animate Ionic's own page transitions.
- **Keep GSAP out of the initial bundle.** Splash, Intro, Login and the tab shell (`Tabs`, `TabBar`) are bundled eagerly, so they never import `gsap`, `@gsap/react` or anything from `src/motion/gsapMotion.ts` (not even `MOTION_OK`); they load motion code with `import()`, as `Splash.tsx` does with `src/pages/splash/splashMotion.ts`. That is the only part of the SSR section below that applies: LevelUP is a client-only Vite app. `gsap` and `@gsap/react` are already installed.
- **Reuse the shared helpers** in `src/motion/gsapMotion.ts`, for code in lazy chunks: it already registers `useGSAP` and exports `gsap`, `useGSAP`, `useReveal`, `useCountUp`, `useEnterCount` and `MOTION_OK`. Register any other plugin only in the component that uses it, never in `App.tsx` or `main.tsx`.
- **Count-ups:** tween a proxy object (`{ value: from }`) and, in `onUpdate`, write the text formatted with `src/i18n/format.ts` (Latin digits in both languages) into the element through its ref. Never call setState per frame. `useCountUp` already does this.
- **Reduced motion:** inside the `useGSAP` callback, wrap animations in `gsap.matchMedia()` with `MOTION_OK` (`(prefers-reduced-motion: no-preference)`). Under reduce, use a short opacity-only fade or jump to the end state, not `duration: 0` on everything.
- **RTL:** `x`, `xPercent` and `left` are physical, in the examples below too: flip the sign when the document is RTL (`i18n.dir() === 'rtl'`).

On any conflict, LevelUP's `ui-standards` and `ionic-mobile-experience` skills win.

## When to Use This Skill

Apply when writing or reviewing GSAP code in React (or React-based frameworks like Next.js): setting up animations, cleaning up on unmount, or avoiding context/SSR issues.

**Related skills:** For tweens and timelines use **gsap-core** and **gsap-timeline**; for scroll-based animation use **gsap-scrolltrigger**; for Vue/Svelte or other frameworks use **gsap-frameworks**. _(LevelUP vendors only gsap-core, gsap-timeline and gsap-react; the other GSAP skills are not installed.)_

## Installation

```bash
# Install the GSAP library
npm install gsap
# Install the GSAP React package
npm install @gsap/react
```

## Prefer the useGSAP() Hook

When **@gsap/react** is available, use the **useGSAP()** hook instead of `useEffect()` for GSAP setup. It handles cleanup automatically and provides a scope and **contextSafe** for callbacks.

```javascript
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP); // register before running useGSAP or any GSAP code

const containerRef = useRef(null);

useGSAP(() => {
  gsap.to(".box", { x: 100 });
  gsap.from(".item", { opacity: 0, stagger: 0.1 });
}, { scope: containerRef });
```

- ✅ Pass a **scope** (ref or element) so selectors like `.box` are scoped to that root.
- ✅ Cleanup (reverting animations and ScrollTriggers) runs automatically on unmount.
- ✅ Use **contextSafe** from the hook's return value to wrap callbacks (e.g. onComplete) so they no-op after unmount and avoid React warnings.

## Refs for Targets

Use **refs** so GSAP targets the actual DOM nodes after render. Do not rely on selector strings that might match multiple or wrong elements across re-renders unless a `scope` is defined. With useGSAP, pass the ref as **scope**; with useEffect, pass it as the second argument to `gsap.context()`. For multiple elements, use a ref to the container and query children, or use an array of refs.

## Dependency array, scope, and revertOnUpdate

By default, useGSAP() passes an empty dependency array to the internal useEffect()/useLayoutEffect() so that it doesn't get called on every render. The 2nd argument is optional; it can pass either a dependency array (like useEffect()) or a config object for more flexibility:

```javascript
useGSAP(() => {
		// gsap code here, just like in a useEffect()
},{ 
  dependencies: [endX], // dependency array (optional)
  scope: container,     // scope selector text (optional, recommended)
  revertOnUpdate: true  // causes the context to be reverted and the cleanup function to run every time the hook re-synchronizes (when any dependency changes)
});
```

## gsap.context() in useEffect (when useGSAP isn't used)

It's okay to use **gsap.context()** inside a regular **useEffect()** when @gsap/react is not used or when the effect's dependency/trigger behavior is needed. When doing so, **always** call **ctx.revert()** in the effect's cleanup function so animations and ScrollTriggers are killed and inline styles are reverted. Otherwise this causes leaks and updates on detached nodes.

```javascript
useEffect(() => {
  const ctx = gsap.context(() => {
    gsap.to(".box", { x: 100 });
    gsap.from(".item", { opacity: 0, stagger: 0.1 });
  }, containerRef);
  return () => ctx.revert();
}, []);
```

- ✅ Pass a **scope** (ref or element) as the second argument so selectors are scoped to that node.
- ✅ **Always** return a cleanup that calls **ctx.revert()**.

## Context-Safe Callbacks

If GSAP-related objects get created inside functions that run AFTER the useGSAP executes (like pointer event handlers) they won't get reverted on unmount/re-render because they're not in the context. Use **contextSafe** (from useGSAP) for those functions:

```javascript
const container = useRef();
const badRef = useRef();
const goodRef = useRef();

useGSAP((context, contextSafe) => {
	// ✅ safe, created during execution
	gsap.to(goodRef.current, { x: 100 });

	// ❌ DANGER! This animation is created in an event handler that executes AFTER useGSAP() executes. It's not added to the context so it won't get cleaned up (reverted). The event listener isn't removed in cleanup function below either, so it persists between component renders (bad).
	badRef.current.addEventListener('click', () => {
		gsap.to(badRef.current, { y: 100 });
	});

	// ✅ safe, wrapped in contextSafe() function
	const onClickGood = contextSafe(() => {
		gsap.to(goodRef.current, { rotation: 180 });
	});

	goodRef.current.addEventListener('click', onClickGood);

	// 👍 we remove the event listener in the cleanup function below.
	return () => {
		// <-- cleanup
		goodRef.current.removeEventListener('click', onClickGood);
	};
},{ scope: container });
```

## Server-Side Rendering (Next.js, etc.)

GSAP runs in the browser. Do not call gsap or ScrollTrigger during SSR.

- Use **useGSAP** (or useEffect) so all GSAP code runs only on the client.
- If GSAP is imported at top level, ensure the app does not execute gsap.* or ScrollTrigger.* during server render. Dynamic import inside useEffect is an option if tree-shaking or bundle size is a concern.

## Best practices

- ✅ Prefer **useGSAP()** from `@gsap/react` rather than `useEffect()`/`useLayoutEffect()`; use **gsap.context()** + **ctx.revert()** in `useEffect` when `useGSAP` is not an option.
- ✅ Use refs for targets and pass a **scope** so selectors are limited to the component.
- ✅ Run GSAP only on the client (useGSAP or useEffect); do not call gsap or ScrollTrigger during SSR.

## Do Not

- ❌ Target by **selector without a scope**; always pass **scope** (ref or element) in useGSAP or gsap.context() so selectors like `.box` are limited to that root and do not match elements outside the component.
- ❌ Animate using selector strings that can match elements outside the current component unless a `scope` is defined in useGSAP or gsap.context() so only elements inside the component are affected.
- ❌ Skip cleanup; always revert context or kill tweens/ScrollTriggers in the effect return to avoid leaks and updates on unmounted nodes.
- ❌ Run GSAP or ScrollTrigger during SSR; keep all usage inside client-only lifecycle (e.g. useGSAP).


### Learn More

https://gsap.com/resources/React