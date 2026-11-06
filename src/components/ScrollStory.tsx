"use client";
// Scroll-driven brand story (like the "Honey Lab" reference):
// - The girl is pinned on screen (sticky canvas) and her video is scrubbed by scroll.
// - Chapter content is ordinary page content that scrolls up past her.
// - The video has six "peak" poses (from the generation prompt, verified frame-by-frame).
//   Inside the story, every scroll gesture — a light flick or a big swipe — glides gently
//   to exactly the next/previous peak and pauses there.
// - Backgrounds alternate "filled" / "empty" per chapter (like the reference), and the
//   site header takes on the same colour while the story is on screen.
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform, useMotionValueEvent, type MotionValue } from "framer-motion";
import { ArrowRight, ArrowDown, ArrowUp, MessageCircle, Users, ChevronDown, Instagram, MapPin } from "lucide-react";
import type { VirtualScrollData } from "lenis";
import { STORY_FRAMES, STORY_CX } from "@/lib/story-frames";
import { smoothScroll } from "@/lib/smooth-scroll";
import { money } from "@/lib/format";
import { brand } from "@/lib/brand";
import type { Product, Collection } from "@/lib/types";

const LAST = STORY_FRAMES.count - 1;

/**
 * Peak poses (frame index in the 150-frame, 10 s video):
 *  8   0.5s  shy, hand on cheek (right) — rests here; frames 9–12 are her blink
 *  56  3.8s  eyes closed, fists raised — joyful bounce (centre)
 *  85  5.7s  both arms presenting to the right (left)
 *  107 7.2s  half-twirl, pallu in a full arc, looking back
 *  125 8.4s  facing forward with shopping bags
 *  149 10.0s seated on the pouf with the gift box
 */
const PEAK_FRAMES = [8, 56, 85, 107, 125, LAST];

/**
 * Idle blink on the landing pose. In the video her eyes are open at frame 8, closed at
 * 9–11, half-open at 12 and open again at 13. Her head also sways a little, so 8 and 13
 * don't match: instead of snapping back, each blink plays in the opposite direction
 * (8→13, then 13→8 …), always starting from the frame the previous one ended on.
 */
const BLINK_OPEN_A = 8;
const BLINK_OPEN_B = 13;
const BLINK_IDLE_MS = 3000; // stay still this long before (and between) blinks
const BLINK_FRAME_MS = 70; // ≈ the video's own speed: a 0.35 s blink
const STEPS = PEAK_FRAMES.length - 1;
/** Only two backgrounds: filled peach and empty ivory (tailwind `petal` / `ivory`).
 *  Poses 4 and 5 share one chapter, so they share a colour too. */
const FILLED = "#f5e0cf";
const EMPTY = "#fffbf5";
const CHAPTER_BG = [FILLED, EMPTY, FILLED, EMPTY, EMPTY, FILLED];
// Fraction of each transition held on the pose at both ends, so small overshoots
// around a peak don't nudge the animation.
const HOLD = 0.03;
/**
 * Poses 4 (twirl) and 5 (shopping bags) share one text and are played by ONE scroll. The
 * twirl is never a stopping point: every glide passes straight through it without a pause
 * (either direction), and the story rests on the bags. Indices are 0-based peaks.
 */
const LINKED_PAIR: [number, number] = [3, 4];
// "Cruise" easing: a short gentle start, a steady speed, and a soft landing on the pose.
// Peak speed stays low (~1.2× the average) so she walks rather than runs, while the
// short ramp keeps the scroll feeling immediate.
const ACCEL = 0.18;
const easeCruise = (t: number) => {
  const v = 1 / (1 - ACCEL);
  if (t < ACCEL) return (v / (2 * ACCEL)) * t * t;
  if (t > 1 - ACCEL) return 1 - (v / (2 * ACCEL)) * (1 - t) * (1 - t);
  return v * ACCEL / 2 + v * (t - ACCEL);
};

/**
 * Continuous story position (0 … STEPS) → video frame, with a short hold at each pose —
 * except at the first linked pose, which the glide passes straight through (no freeze).
 */
function frameAt(pos: number) {
  const k = Math.max(0, Math.min(STEPS - 1, Math.floor(pos)));
  const holdStart = k === LINKED_PAIR[0] ? 0 : HOLD; // leaving the pass-through pose
  const holdEnd = k + 1 === LINKED_PAIR[0] ? 0 : HOLD; // arriving at it
  const t = Math.max(0, Math.min(1, (pos - k - holdStart) / (1 - holdStart - holdEnd)));
  return PEAK_FRAMES[k] + (PEAK_FRAMES[k + 1] - PEAK_FRAMES[k]) * t;
}

// Background colour holds around each peak and crossfades between them.
const BG_STOPS: number[] = [];
const BG_VALUES: string[] = [];
CHAPTER_BG.forEach((c, k) => {
  if (k > 0) { BG_STOPS.push(k - 0.3); BG_VALUES.push(c); }
  BG_STOPS.push(k === 0 ? 0 : k + 0.0001); BG_VALUES.push(c);
  if (k < STEPS) { BG_STOPS.push(k + 0.3); BG_VALUES.push(c); }
});

type Props = {
  products: Product[];
  collections: Collection[];
  whatsapp: string;
  whatsappGroup: string;
  instagram: string;
};

export function ScrollStory({ products, collections, whatsapp, whatsappGroup, instagram }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef<(HTMLImageElement | null)[]>([]);
  const peaksRef = useRef<number[]>([]); // page scrollY at which each peak is centred
  const rafRef = useRef(0);
  const restFrameRef = useRef(BLINK_OPEN_A); // landing-pose frame while idle (8 or 13)
  const blinkFrameRef = useRef<number | null>(null); // frame currently shown by a blink
  const lastActivityRef = useRef(0);
  const lastDrawRef = useRef(""); // what the canvas currently shows (skip identical repaints)
  const unlockedRef = useRef(false); // false until her first pose has loaded
  const jumpRef = useRef<(dir: number) => void>(() => {});
  const [headerH, setHeaderH] = useState(112);
  // Phones get quicker text motion (her animation timing stays the same).
  const [isPhone, setIsPhone] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const update = () => setIsPhone(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  const [ready, setReady] = useState(false);

  const { scrollY } = useScroll();

  // ── Layout: where (in page scrollY) each peak sits ──
  const measure = () => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    if (!section || !stage) return;
    const top = section.getBoundingClientRect().top + window.scrollY;
    const h = stage.clientHeight;
    // Chapter k is exactly one stage tall; it's centred when its top meets the stage top.
    const hh = document.querySelector("header")?.getBoundingClientRect().height ?? 0;
    peaksRef.current = PEAK_FRAMES.map((_, k) => Math.max(0, Math.round(top + k * h - hh)));
  };

  /** Continuous story position from page scroll: 0 at the first peak … STEPS at the last. */
  const posAt = (y: number) => {
    const P = peaksRef.current;
    if (P.length < 2) return 0;
    if (y <= P[0]) return 0;
    if (y >= P[STEPS]) return STEPS;
    let k = 0;
    while (k < STEPS - 1 && y > P[k + 1]) k++;
    return k + (y - P[k]) / (P[k + 1] - P[k]);
  };

  const pos = useTransform(scrollY, posAt);
  const bg = useTransform(pos, BG_STOPS, BG_VALUES);

  // The site header is sticky above us; pin the stage just under it.
  useEffect(() => {
    const header = document.querySelector("header");
    if (!header) return;
    const update = () => setHeaderH(header.getBoundingClientRect().height);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(header);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const run = () => { measure(); syncHeader(); };
    run();
    const ro = new ResizeObserver(run);
    if (sectionRef.current) ro.observe(sectionRef.current);
    window.addEventListener("resize", run);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", run);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headerH]);

  // ── Header colour follows the story background while the story is pinned ──
  const syncHeader = () => {
    const P = peaksRef.current;
    const root = document.documentElement;
    if (P.length && window.scrollY <= P[STEPS] + 2) root.style.setProperty("--story-bg", bg.get());
    else root.style.removeProperty("--story-bg");
  };
  useEffect(() => {
    syncHeader();
    return () => {
      document.documentElement.style.removeProperty("--story-bg");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Peak-to-peak stepping (needs Lenis; reduced-motion visitors keep native scroll) ──
  useEffect(() => {
    let animating = false;
    let animDir = 0;
    let animFrom = 0;
    let queued = false; // a second gesture made during a glide → continue once it lands
    let lastWheelAt = 0;
    let lastMag = 0;
    let touchSum = 0;
    let idleTimer: ReturnType<typeof setTimeout> | undefined;
    let linkedGlide = false; // the single glide through the twirl and bags poses
    let lastLandAt = 0; // when the last glide finished

    // The twirl (first linked pose) is never a stopping point — the glide always passes
    // straight through it. Stepping and settling only ever use the other poses.
    const TWIRL = LINKED_PAIR[0];
    const stops = () => peaksRef.current.filter((_, i) => i !== TWIRL);

    /** Index (in all peaks) of the nearest pose where the story may rest. */
    const nearestIndex = (y: number) => {
      const P = peaksRef.current;
      let best = -1;
      P.forEach((p, i) => {
        if (i === TWIRL) return;
        if (best < 0 || Math.abs(p - y) < Math.abs(P[best] - y)) best = i;
      });
      return Math.max(0, best);
    };

    /** Target peak for a gesture in `dir` from `y`, or null if the gesture should leave the story. */
    const targetFor = (y: number, dir: number) => {
      const P = peaksRef.current;
      if (P.length < 2) return null;
      if (dir > 0) {
        if (y >= P[STEPS] - 4) return null; // past the last peak → normal page scroll
        if (y < P[0] - window.innerHeight * 0.5) return null; // story not in view yet
        return stops().find((p) => p > Math.max(y, P[0]) + 4) ?? null;
      }
      if (y <= P[0] + 4) return null; // at the top of the story
      if (y > P[STEPS] + 4) {
        // Coming back up from below: while the story is still in view, land on its last
        // pose; further down the page, scroll normally.
        return y < P[STEPS] + window.innerHeight * 0.9 ? P[STEPS] : null;
      }
      return [...stops()].reverse().find((p) => p < y - 4) ?? null;
    };

    const legSeconds = (fromY: number, toY: number) => {
      const frames = Math.abs(frameAt(posAt(toY)) - frameAt(posAt(fromY)));
      // Quick but unhurried: the 56-frame walk to the centre takes ~2.4s, the shorter
      // pose changes ~1.1–1.5s.
      return Math.max(0.9, Math.min(2.4, 0.5 + frames / 30));
    };

    /**
     * Glide to `target`. With a `via` peak, it is ONE continuous glide that passes straight
     * through `via` without slowing down (its duration covers both legs).
     */
    const glideTo = (target: number, fromY: number, dir: number, via?: number, seconds?: number) => {
      const lenis = smoothScroll.get();
      if (!lenis) return;
      const duration = seconds ?? (via === undefined ? legSeconds(fromY, target) : legSeconds(fromY, via) + legSeconds(via, target));
      const easing = easeCruise; // gentle start, steady middle, soft landing — no stop at `via`
      animating = true;
      linkedGlide = via !== undefined;
      animDir = dir;
      animFrom = fromY;
      lenis.scrollTo(target, {
        duration,
        easing,
        lock: true,
        force: true,
        onComplete: () => {
          animating = false;
          linkedGlide = false;
          lastLandAt = performance.now();
          if (queued) {
            queued = false;
            const l = smoothScroll.get();
            const next = l ? targetFor(l.scroll, animDir) : null;
            if (l && next !== null) glideTo(...withWaypoint(next, l.scroll, animDir));
          }
        },
      });
    };

    /**
     * If a glide crosses the twirl, mark it as passing through (`via`): one continuous
     * glide with both poses' time, and extra scrolls during it are ignored.
     */
    const withWaypoint = (target: number, fromY: number, dir: number): [number, number, number, number?] => {
      const t = peaksRef.current[TWIRL];
      const crosses = t !== undefined && Math.min(fromY, target) < t - 4 && Math.max(fromY, target) > t + 4;
      return crosses ? [target, fromY, dir, t] : [target, fromY, dir];
    };

    /** A fresh gesture (wheel / swipe / key) in direction `dir`. */
    const gesture = (y: number, dir: number) => {
      if (animating) {
        if (dir !== animDir) { queued = false; glideTo(animFrom, y, dir); return; } // changed mind → glide back
        // One scroll plays both linked poses, so extra scrolls during it are ignored
        // (they would otherwise run on past the bags). Otherwise: continue afterwards.
        if (!linkedGlide) queued = true;
        return;
      }
      const target = targetFor(y, dir);
      if (target !== null) glideTo(...withWaypoint(target, y, dir));
    };

    const intercept = (data: VirtualScrollData) => {
      const lenis = smoothScroll.get();
      if (!unlockedRef.current) {
        // Still loading her first pose: swallow the input entirely.
        if (data.event.cancelable) data.event.preventDefault();
        return false;
      }
      if (!lenis || peaksRef.current.length < 2) return true;
      const { event, deltaY } = data;
      const y = lenis.scroll;

      if (event.type === "wheel") {
        const dir = Math.sign(deltaY);
        if (!dir) return true;
        const now = performance.now();
        const mag = Math.abs(deltaY);
        if (!animating && targetFor(y, dir) === null) {
          // Leftover momentum right after landing on the first/last pose shouldn't carry
          // the page on past the story; a fresh, real scroll still leaves it normally.
          if (now - lastLandAt < 700 && mag < 20) {
            lastWheelAt = now;
            lastMag = mag;
            if (event.cancelable) event.preventDefault();
            return false;
          }
          return true;
        }
        if (event.cancelable) event.preventDefault();
        // One gesture = one step. A new gesture starts after a short pause, or when a
        // fresh swipe arrives on top of a fading trackpad momentum tail.
        const gap = now - lastWheelAt;
        // Robust when the browser bunches events: during a glide only a clear pause is a
        // new scroll (momentum can't sneak in an extra step), but scrolling the other way
        // always counts — momentum never reverses direction.
        // A fading momentum tail only has tiny deltas, so a queued scroll must start with
        // real strength (a new flick or a wheel notch), not just come after a pause.
        // Just after landing, leftover momentum (small deltas, sometimes delivered in
        // bunches) must not count as a new scroll; a strong or well-separated one does.
        const settled = now - lastLandAt > 700 || gap > 600 || mag >= 20;
        const isNew = animating
          ? dir !== animDir || (gap > 260 && mag >= 20)
          : (gap > 140 && settled) || (lastMag < 8 && mag > 50 && mag > lastMag * 4);
        lastWheelAt = now;
        lastMag = mag;
        if (isNew) gesture(y, dir);
        return false;
      }

      if (event.type === "touchstart") { touchSum = 0; return true; }
      if (event.type === "touchmove") {
        touchSum += deltaY;
        const dir = Math.sign(touchSum);
        if (!dir || (!animating && targetFor(y, dir) === null)) return true;
        if (event.cancelable) event.preventDefault();
        return false;
      }
      if (event.type === "touchend") {
        const dir = Math.sign(touchSum);
        const swiped = Math.abs(touchSum) > 24;
        touchSum = 0;
        if (!dir || (!animating && targetFor(y, dir) === null)) return true;
        if (swiped) gesture(y, dir);
        return false;
      }
      return true;
    };

    const onKey = (e: KeyboardEvent) => {
      const lenis = smoothScroll.get();
      if (!unlockedRef.current && ["ArrowDown", "ArrowUp", "PageDown", "PageUp", " ", "Home", "End"].includes(e.key)) {
        e.preventDefault(); // still loading: ignore scroll keys
        return;
      }
      if (!lenis || e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
      const el = e.target as HTMLElement | null;
      if (el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT|BUTTON)$/.test(el.tagName))) return;
      const down = ["ArrowDown", "PageDown"].includes(e.key) || (e.key === " " && !e.shiftKey);
      const up = ["ArrowUp", "PageUp"].includes(e.key) || (e.key === " " && e.shiftKey);
      if (!down && !up) return;
      const dir = down ? 1 : -1;
      if (!animating && targetFor(lenis.scroll, dir) === null) return;
      e.preventDefault();
      if (!e.repeat) gesture(lenis.scroll, dir);
    };

    // Anything that leaves us between peaks (scrollbar drag, scrolling in from below,
    // in-page links) settles onto the nearest peak once scrolling goes quiet.
    const onScroll = () => {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        const lenis = smoothScroll.get();
        const P = peaksRef.current;
        if (!lenis || animating || P.length < 2 || !unlockedRef.current) return;
        const y = lenis.scroll;
        if (y <= P[0] + 2 || y >= P[STEPS] - 2) return;
        const target = P[nearestIndex(y)];
        if (Math.abs(target - y) > 2) glideTo(...withWaypoint(target, y, Math.sign(target - y)));
      }, 160);
    };

    // The story's own ↓ / ↑ button: glide to the last pose, or back to the first.
    jumpRef.current = (dir: number) => {
      const lenis = smoothScroll.get();
      const P = peaksRef.current;
      if (!lenis || P.length < 2 || !unlockedRef.current) return;
      const target = dir > 0 ? P[STEPS] : P[0];
      if (Math.abs(target - lenis.scroll) < 3) return;
      // A calm, watchable pace: ~0.8 s for every pose passed (first → last ≈ 4.4 s),
      // so the visitor sees each pose and its text go by instead of a fast-forward.
      const posesPassed = Math.abs(posAt(target) - posAt(lenis.scroll));
      const seconds = Math.max(1.4, Math.min(4.6, 0.4 + posesPassed * 0.8));
      glideTo(target, lenis.scroll, dir, undefined, seconds);
    };

    smoothScroll.setInterceptor(intercept);
    const unsubscribe = smoothScroll.subscribe((lenis) => lenis?.on("scroll", onScroll));
    window.addEventListener("keydown", onKey);
    return () => {
      smoothScroll.setInterceptor(null);
      smoothScroll.get()?.off("scroll", onScroll);
      unsubscribe();
      window.removeEventListener("keydown", onKey);
      clearTimeout(idleTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Drawing ──
  // One opaque canvas: background colour, then the girl with "multiply" (her white video
  // background disappears into the colour). It is only repainted when her frame, the
  // colour or the size actually changes — the store-name ticker is a separate CSS layer.
  const draw = () => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    if (!canvas || !stage) return;
    const p = pos.get();
    const atLanding = p < 0.02;
    const index = atLanding
      ? blinkFrameRef.current ?? restFrameRef.current
      : Math.max(0, Math.min(LAST, Math.round(frameAt(p))));
    const frames = framesRef.current;
    let img: HTMLImageElement | null = null;
    for (let d = 0; d <= LAST && !img; d++) {
      img = frames[index - d] ?? frames[index + d] ?? null; // nearest loaded frame
    }
    const w = stage.clientWidth;
    const h = stage.clientHeight;
    const mobile = w < 1024; // phones and portrait tablets: girl on top, text card below
    // Centre her actual figure (not the video frame) vertically, with equal space above
    // and below. In the video she stands from y≈70 (hair) to y≈700 (feet) of 720.
    // Desktop: figure is 84% of the stage height. Phone: centred in the top 60%, text below.
    const FIG_TOP = 70;
    const FIG_H = 630;
    // Tablets (≥640px wide) have a shorter text card relative to the screen, so she can
    // use more of the height without leaving a gap above the card.
    const tablet = mobile && w >= 640;
    const area = mobile ? h * (tablet ? 0.72 : 0.6) : h;
    const figH = mobile ? h * (tablet ? 0.62 : 0.5) : h * 0.84;
    const scale = figH / FIG_H;
    // Canvas resolution: only as dense as the 1280×720 source can fill (≈1× on desktop,
    // sharper on phones where she's drawn smaller). Fewer pixels = smoother scrolling.
    const dpr = Math.min(window.devicePixelRatio || 1, Math.max(1, 1 / scale));
    const color = bg.get();
    const key = `${img?.src}|${color}|${w}x${h}@${dpr}`;
    if (key === lastDrawRef.current) return; // nothing changed since the last paint
    lastDrawRef.current = key;
    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, w, h);
    if (!img) return;
    const dw = STORY_FRAMES.width * scale;
    const dh = STORY_FRAMES.height * scale;
    const dy = (area - figH) / 2 - FIG_TOP * scale;
    let dx = (w - dw) / 2;
    if (dw > w) {
      // Narrow screen: pan to keep her centred, without showing past the video edge.
      const cx = STORY_CX[index] ?? 0.5;
      dx = Math.min(0, Math.max(w - dw, w / 2 - cx * dw));
    }
    ctx.globalCompositeOperation = "multiply";
    ctx.drawImage(img, dx, dy, dw, dh);
    ctx.globalCompositeOperation = "source-over";
  };
  const scheduleDraw = () => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = 0;
      draw();
    });
  };

  useMotionValueEvent(pos, "change", (v) => {
    lastActivityRef.current = performance.now();
    blinkFrameRef.current = null;
    if (v >= 0.02) restFrameRef.current = BLINK_OPEN_A; // she's moving: next rest starts fresh
    scheduleDraw();
    syncHeader();
  });

  // ── Hold scrolling until her first pose has loaded (with a safety release) ──
  const [unlocked, setUnlocked] = useState(false);
  useEffect(() => {
    unlockedRef.current = unlocked;
  }, [unlocked]);
  useEffect(() => {
    if (ready) { setUnlocked(true); return; }
    const t = setTimeout(() => setUnlocked(true), 8000); // never trap anyone on a slow line
    return () => clearTimeout(t);
  }, [ready]);
  useEffect(() => {
    if (unlocked) {
      smoothScroll.get()?.start();
      return;
    }
    const unsubscribe = smoothScroll.subscribe((lenis) => lenis?.stop());
    return () => {
      unsubscribe();
      smoothScroll.get()?.start();
    };
  }, [unlocked]);

  // ── Idle blink: on the landing pose, after 3 s without scrolling, blink once every 3 s ──
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    lastActivityRef.current = performance.now();
    let timer: ReturnType<typeof setTimeout> | undefined;
    let blinking = false;

    const playBlink = () => {
      const from = restFrameRef.current;
      const to = from === BLINK_OPEN_A ? BLINK_OPEN_B : BLINK_OPEN_A;
      const step = to > from ? 1 : -1;
      const seq: number[] = [];
      for (let f = from + step; f !== to + step; f += step) seq.push(f);
      if (seq.some((f) => !framesRef.current[f])) return; // frames still loading
      blinking = true;
      let i = 0;
      const next = () => {
        // Any scroll in the meantime cancels the blink (the pos handler clears it).
        if (pos.get() >= 0.02 || (i > 0 && blinkFrameRef.current === null)) { blinking = false; return; }
        if (i < seq.length) {
          blinkFrameRef.current = seq[i++];
          scheduleDraw();
          timer = setTimeout(next, BLINK_FRAME_MS);
        } else {
          restFrameRef.current = to;
          blinkFrameRef.current = null;
          blinking = false;
          lastActivityRef.current = performance.now(); // next blink in another 3 s
          scheduleDraw();
        }
      };
      next();
    };

    const poll = setInterval(() => {
      if (blinking || document.hidden || pos.get() >= 0.02) return;
      if (performance.now() - lastActivityRef.current >= BLINK_IDLE_MS) playBlink();
    }, 200);
    return () => {
      clearInterval(poll);
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Progressive preload: peaks first, then a coarse pass, then fill in the gaps.
  useEffect(() => {
    let cancelled = false;
    const frames: (HTMLImageElement | null)[] = new Array(STORY_FRAMES.count).fill(null);
    framesRef.current = frames;
    const order: number[] = [];
    const seen = new Set<number>();
    const add = (i: number) => { if (!seen.has(i)) { seen.add(i); order.push(i); } };
    PEAK_FRAMES.forEach(add);
    for (let f = BLINK_OPEN_A; f <= BLINK_OPEN_B; f++) add(f); // idle blink
    for (const step of [12, 4, 1]) for (let i = 0; i <= LAST; i += step) add(i);
    let next = 0;
    const loadOne = (): Promise<void> => {
      if (cancelled || next >= order.length) return Promise.resolve();
      const i = order[next++];
      return new Promise<void>((resolve) => {
        const img = new window.Image();
        img.decoding = "async";
        img.src = STORY_FRAMES.path(i);
        img.decode().then(() => {
          if (cancelled) return resolve();
          frames[i] = img;
          if (i === PEAK_FRAMES[0]) setReady(true);
          scheduleDraw();
          resolve();
        }).catch(() => resolve());
      }).then(loadOne);
    };
    Array.from({ length: 6 }, loadOne); // 6 parallel loaders
    window.addEventListener("resize", scheduleDraw);
    return () => {
      cancelled = true;
      window.removeEventListener("resize", scheduleDraw);
      cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cueOpacity = useTransform(pos, [0, 0.15], [1, 0]);
  // ↓ in the first half of the story (go to the last pose), ↑ in the second half;
  // hidden once the story has scrolled away.
  const [jumpMode, setJumpMode] = useState<"down" | "up" | "hidden">("down");
  const [portalReady, setPortalReady] = useState(false);
  useEffect(() => setPortalReady(true), []);
  // While the story is on screen, mark <html> so phones can hide the floating WhatsApp
  // button (it would cover the story's text card, which has its own WhatsApp buttons).
  useEffect(() => {
    const root = document.documentElement;
    if (jumpMode === "hidden") root.removeAttribute("data-story");
    else root.setAttribute("data-story", "");
    return () => root.removeAttribute("data-story");
  }, [jumpMode]);
  useMotionValueEvent(pos, "change", (v) => {
    const P = peaksRef.current;
    const past = P.length > 1 && window.scrollY > P[STEPS] + window.innerHeight * 0.4;
    setJumpMode(past ? "hidden" : v < STEPS / 2 ? "down" : "up");
  });
  const welcomeOpacity = useTransform(pos, [0, 0.12], [1, 0]);
  const tickerDrift = useTransform(pos, [0, STEPS], ["0vw", "-14vw"]);
  // Layout uses the CSS header height, so it is right from the first paint (no gap).
  const stageH = "calc(100svh - var(--header-h))";
  const featured = products.slice(0, 3);
  const cols = collections.slice(0, 6);

  return (
    <section ref={sectionRef} className="relative" aria-label={`${brand.name} brand story`}>
      {/* Hold the page still until her first pose is ready. Rendered on the server, so it
          applies before JavaScript loads; React removes it the moment she is ready. */}
      {!unlocked && <style>{"html,body{overflow:hidden;overscroll-behavior:none}"}</style>}
      {/* ── Pinned layer: background + the girl (one canvas) ── */}
      <motion.div
        ref={stageRef}
        className="sticky z-0 overflow-hidden"
        style={{ top: "var(--header-h)", height: stageH, backgroundColor: bg }}
      >
        <canvas
          ref={canvasRef}
          className={`absolute inset-0 h-full w-full transition-opacity duration-700 ${ready ? "opacity-100" : "opacity-0"}`}
          aria-hidden="true"
        />
        {/* Store-name ticker: always gliding (CSS animation, no JS per frame); scrolling adds a
            little drift. Plain 6% tint — no blend mode, so it costs almost nothing to draw. */}
        <motion.div
          style={{ x: tickerDrift }}
          className="pointer-events-none absolute inset-x-0 bottom-[5%] select-none"
          aria-hidden="true"
        >
          <div className="flex w-max animate-[marquee_72s_linear_infinite] whitespace-nowrap font-serif text-[22vw] font-bold leading-none text-silk/[0.06] motion-reduce:animate-none lg:text-[16vw]">
            {Array.from({ length: 4 }, (_, k) => (
              <span key={k} className="pr-[0.5em]">{brand.name}</span>
            ))}
          </div>
        </motion.div>
        <div className="absolute right-3 top-1/2 hidden -translate-y-1/2 flex-col gap-3 lg:flex">
          {PEAK_FRAMES.map((_, k) => (
            <ProgressDot key={k} pos={pos} index={k} />
          ))}
        </div>
        {/* Phone, landing pose only: a short welcome centred in the empty space to her
            left, level with the middle of her figure (on phones she stands in the top 60%
            of the stage). Hidden on screens too short to fit it above the text card. */}
        <motion.div
          style={{ opacity: welcomeOpacity }}
          className={`pointer-events-none absolute left-0 top-[34%] z-20 w-[56%] -translate-y-1/2 px-3 text-center lg:hidden [@media(max-height:600px)]:hidden ${ready ? "" : "invisible"}`}
          aria-hidden="true"
        >
          <p className="font-serif text-[22px] leading-tight text-silk">{brand.name}</p>
          <p className="mt-1.5 font-serif text-[13px] italic leading-snug text-ink">
            Beautiful sarees,<br />for every occasion 🌸
          </p>
        </motion.div>

        {/* loader where she will appear, until her first pose is ready */}
        <div
          className={`pointer-events-none absolute left-1/2 top-[30%] flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-3 transition-opacity duration-500 lg:left-[72%] lg:top-1/2 ${ready ? "opacity-0" : "opacity-100"}`}
          aria-hidden={ready}
          role="status"
        >
          <span className="h-10 w-10 animate-spin rounded-full border-2 border-silk/15 border-t-silk" />
          <span className="text-xs uppercase tracking-[0.25em] text-ink-soft">Loading</span>
        </div>
        <motion.div style={{ opacity: cueOpacity }} className={`absolute bottom-4 left-1/2 -translate-x-1/2 text-center text-xs uppercase tracking-[0.2em] text-ink-soft transition-opacity duration-500 ${ready ? "" : "invisible"}`}>
          Scroll
          <ChevronDown className="mx-auto mt-1 animate-bounce" size={18} />
        </motion.div>
      </motion.div>

      {/* ── Scrolling content: one stage-tall chapter per peak, moving up past her ── */}
      {/* Story-only ↓ / ↑ button, rendered on <body> so no story layer can cover it.
          Desktop: above the WhatsApp button. Phones: top-right under the header, the one
          spot that's free on every pose (the text card fills the bottom). */}
      {portalReady &&
        createPortal(
          <button
            type="button"
            onClick={() => jumpRef.current(jumpMode === "up" ? -1 : 1)}
            aria-label={jumpMode === "up" ? "Back to the start of the story" : "Skip to the end of the story"}
            tabIndex={ready && jumpMode !== "hidden" ? 0 : -1}
            className={`fixed right-3 top-[calc(var(--header-h)+12px)] z-30 flex h-10 w-10 items-center justify-center rounded-full border border-silk/20 bg-white/90 text-silk shadow-card backdrop-blur-sm transition-all duration-300 hover:bg-silk hover:text-white lg:bottom-[96px] lg:right-[30px] lg:top-auto lg:h-11 lg:w-11 ${
              ready && jumpMode !== "hidden" ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            {jumpMode === "up" ? <ArrowUp size={18} /> : <ArrowDown size={18} />}
          </button>,
          document.body
        )}

      {/* taps pass through this layer (to the stage behind) except on the text cards */}
      <div className="pointer-events-none relative z-10" style={{ marginTop: `calc(-1 * ${stageH})` }}>
        {/* 1 · shy pose (she's on the right) — the landing view, so it carries the trust signals */}
        <Chapter fast={isPhone} pos={pos} at={[0, 0]} height={stageH} side="left" first width="lg:w-[min(62%,860px)] lg:!ml-[5%]">
          <p className="eyebrow">
            {brand.name}
          </p>
          <h1 className="mt-2 font-serif text-[2rem] leading-[1.08] text-ink lg:mt-3 lg:text-6xl xl:text-7xl">
            Timeless sarees,<br />
            <span className="italic text-silk">made for you.</span>
          </h1>
          <p className="mt-5 hidden max-w-xl text-lg text-ink-soft lg:block">
            Beautiful silk sarees for festivals, weddings and every day. We pick each one by hand and
            pack it with care for you.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 lg:mt-7 lg:gap-3">
            <Link href="/collections/all" className="btn-silk max-lg:px-4 max-lg:py-2.5">Shop Sarees <ArrowRight size={16} /></Link>
            <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="btn-outline bg-white/70 max-lg:px-4 max-lg:py-2.5">
              <MessageCircle size={16} /> Talk to us
            </a>
          </div>
          <p className="mt-5 hidden text-xs text-ink-soft lg:block">
            Founded by{" "}
            <a href={brand.founder.instagram} target="_blank" rel="noopener noreferrer" className="font-medium text-silk hover:underline">
              {brand.founder.name}
            </a>
          </p>
        </Chapter>

        {/* 2 · joyful bounce (she's centred) — brand meaning on the left, verifiable facts on the right */}
        <Chapter
          fast={isPhone}
          pos={pos}
          at={[1, 1]}
          height={stageH}
          side="left"
          width="lg:w-[min(36%,520px)]"
          aside={
            <>
              <p className="eyebrow">Why you can trust us</p>
              <ul className="mt-4 space-y-5">
                <Reason icon={<MapPin size={18} />} title="Come and see us">
                  Our store is open to visit: {brand.storeAddress}.{" "}
                  <a href={brand.mapsUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-silk hover:underline">
                    Get directions
                  </a>
                </Reason>
                <Reason icon={<MessageCircle size={18} />} title="Ask us anything first">
                  Not sure about a colour or size? Message us on WhatsApp before you buy:{" "}
                  <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="font-medium text-silk hover:underline">
                    {brand.phone}
                  </a>
                </Reason>
                <Reason icon={<Instagram size={18} />} title="Follow us on Instagram">
                  For our latest updates, follow{" "}
                  <a href={instagram} target="_blank" rel="noopener noreferrer" className="font-medium text-silk hover:underline">
                    @{brand.instagramHandle}
                  </a>
                </Reason>
              </ul>
            </>
          }
        >
          <p className="eyebrow">Wear Happiness</p>
          <h2 className="mt-3 font-serif text-3xl leading-tight text-ink lg:text-[2.4rem] xl:text-[2.9rem]">
            Wear Happiness,<br />
            <span className="whitespace-nowrap"><span className="italic text-silk">Wear Sarees</span> 🌸</span>
          </h2>
          <p className="mt-5 text-ink-soft lg:text-lg">
            We want you to feel joy every time you wear one of our sarees.
          </p>
          <p className="mt-3 hidden text-ink-soft lg:block lg:text-lg">
            We choose every saree ourselves and pack it with care at our warehouse.
          </p>
        </Chapter>

        {/* 3 · presenting to the right (she's on the left) */}
        <Chapter fast={isPhone} pos={pos} at={[2, 2]} height={stageH} side="right">
          <p className="eyebrow">New arrivals</p>
          <h2 className="mt-3 font-serif text-3xl leading-tight text-ink lg:text-5xl">
            Fresh picks, <span className="italic text-silk">just for you</span>
          </h2>
          <p className="mt-4 max-w-md text-ink-soft lg:text-lg">Our newest sarees. Tap one to see more photos and the price.</p>
          <div className="mt-6 grid grid-cols-3 gap-3">
            {featured.map((p) => (
              <Link key={p.id} href={`/products/${p.handle}`} className="group block">
                <div className="relative aspect-[3/4] overflow-hidden rounded-lg border-2 border-gold/60 bg-white shadow-card">
                  <Image src={p.images[0]} alt={p.title} fill sizes="160px" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
                <p className="mt-2 line-clamp-1 text-xs font-medium text-ink">{p.title}</p>
                <p className="text-xs text-silk">{money(p.price)}</p>
              </Link>
            ))}
          </div>
          <Link href="/collections/all" className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-silk underline-offset-4 hover:underline">
            See all new sarees <ArrowRight size={14} />
          </Link>
        </Chapter>

        {/* 4 + 5 · half-twirl, then shopping bags — one shared text that stays put while
            she changes pose (two stages tall, text pinned for both peaks) */}
        <Chapter fast={isPhone} pos={pos} at={[3, 4]} height={stageH} side="right" span={2} pinTop="var(--header-h)">
          <p className="eyebrow">Shop by collection</p>
          <h2 className="mt-3 font-serif text-3xl leading-tight text-ink lg:text-5xl">
            Find a saree <span className="italic text-silk">you&apos;ll love</span>
          </h2>
          <p className="mt-4 max-w-md text-ink-soft lg:text-lg">
            Simple sarees for every day, rich silks for big days. Pick a collection to start.
          </p>
          <div className="mt-6 flex max-w-md flex-wrap gap-2">
            {cols.map((c) => (
              <Link
                key={c.id}
                href={`/collections/${c.handle}`}
                className="rounded-full border border-silk/30 bg-white/80 px-4 py-2 text-sm font-medium text-ink shadow-soft transition hover:border-silk hover:bg-silk hover:text-white"
              >
                {c.title}
              </Link>
            ))}
          </div>
        </Chapter>

        {/* 6 · seated with the gift */}
        <Chapter fast={isPhone} pos={pos} at={[5, 5]} height={stageH} side="right" last>
          <p className="eyebrow">Gift happiness</p>
          <h2 className="mt-3 font-serif text-3xl leading-tight text-ink lg:text-5xl">
            Gift a saree,<br /><span className="italic text-silk">gift a smile</span>
          </h2>
          <p className="mt-5 max-w-md text-ink-soft lg:text-lg">
            Send a saree to someone you love. Just message us on WhatsApp. We&apos;ll help you choose, pack it
            with care and send it to them.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="btn-silk">
              <MessageCircle size={16} /> Order on WhatsApp
            </a>
            <a href={whatsappGroup} target="_blank" rel="noopener noreferrer" className="btn-outline bg-white/70">
              <Users size={16} /> Join our WhatsApp group
            </a>
          </div>
          <p className="mt-4 text-sm text-ink-soft">{brand.phone}</p>
        </Chapter>
      </div>
    </section>
  );
}

/**
 * A stage-tall block of normal page content. Its fade and parallax drift are tied
 * directly to the scroll position (not to a timer), so the text always moves in step
 * with the scroll — fast, slow or backwards — and is fully visible at its peak.
 * With span={2} it covers two peaks: the block is two stages tall and its text stays
 * pinned (sticky) under the header while she changes pose, then scrolls away.
 */
function Chapter({
  fast = false,
  pos,
  at,
  height,
  side,
  first,
  last,
  span = 1,
  pinTop = 0,
  width = "lg:w-[min(42%,520px)]",
  aside,
  children,
}: {
  /** Phones: text travels further and fades over a shorter stretch, so it feels quicker. */
  fast?: boolean;
  /** Story position (0 … STEPS) and the peak(s) this chapter belongs to. */
  pos: MotionValue<number>;
  at: [number, number];
  height: string;
  side: "left" | "right";
  first?: boolean;
  last?: boolean;
  span?: 1 | 2;
  pinTop?: string | number;
  /** Tailwind width class for the main text block on desktop. */
  width?: string;
  /** Optional second column on the opposite side (desktop only), for centred poses. */
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  const inner = "flex items-end pb-6 lg:items-center lg:pb-0";
  const [a, b] = at;
  // Fully visible from just before its first peak to just after its last one.
  const fadeOut = fast ? [0.42, 0.2] : [0.65, 0.3];
  const opacity = useTransform(
    pos,
    [a - fadeOut[0], a - fadeOut[1], b + fadeOut[1], b + fadeOut[0]],
    [first ? 1 : 0, 1, 1, last ? 1 : 0]
  );
  // Parallax: arrives a little behind the page, leaves a little ahead of it.
  const travel = fast ? 180 : 70;
  const y = useTransform(pos, [a - 1, a, b, b + 1], [first ? 0 : travel, 0, 0, last ? 0 : -travel]);
  const asideY = useTransform(pos, [a - 1, a, b, b + 1], [first ? 0 : 110, 0, 0, last ? 0 : -110]);
  // The second column (centre pose) appears only once she has nearly settled in the
  // middle, and leaves early, so it never passes over her while she walks.
  const asideOpacity = useTransform(pos, [a - 0.35, a - 0.12, b + 0.12, b + 0.35], [0, 1, 1, 0]);
  return (
    <div className={`container-x pointer-events-none ${span === 1 ? inner : ""}`} style={{ height: span === 1 ? height : `calc(${height} * ${span})` }}>
      <div className={span === 1 ? "contents" : `sticky ${inner}`} style={span === 1 ? undefined : { top: pinTop, height }}>
        <motion.div
          style={{ opacity, y }}
          className={`pointer-events-auto w-full rounded-2xl bg-white/85 p-5 shadow-card
            lg:rounded-none lg:bg-transparent lg:p-0 lg:shadow-none ${width}
            ${side === "right" ? "lg:ml-auto lg:mr-10" : "lg:ml-6"}`}
        >
          {children}
        </motion.div>
        {aside && (
          <motion.div
            style={{ opacity: asideOpacity, y: asideY }}
            className="pointer-events-auto ml-auto mr-10 hidden w-[min(30%,420px)] lg:block"
          >
            {aside}
          </motion.div>
        )}
      </div>
    </div>
  );
}

/** A reason in the right-hand column of the centred pose. */
function Reason({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-silk/10 text-silk">{icon}</span>
      <span>
        <span className="block font-serif text-lg text-ink">{title}</span>
        <span className="mt-0.5 block text-sm text-ink-soft">{children}</span>
      </span>
    </li>
  );
}

function ProgressDot({ pos, index }: { pos: MotionValue<number>; index: number }) {
  const r = [index - 0.6, index, index + 0.6];
  const scale = useTransform(pos, r, [1, 1.7, 1]);
  const opacity = useTransform(pos, r, [0.35, 1, 0.35]);
  return <motion.span style={{ scale, opacity }} className="block h-2 w-2 rotate-45 bg-silk" />;
}
