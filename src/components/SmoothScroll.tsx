"use client";
// Buttery page scrolling (Lenis) for the storefront. Disabled for visitors who prefer
// reduced motion, who keep the browser's native scrolling.
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { smoothScroll } from "@/lib/smooth-scroll";

// Scroll position of each page you left via a link, so Back can return you there.
const savedPositions = new Map<string, number>();
const here = () => window.location.pathname + window.location.search;

export function SmoothScroll() {
  const pathname = usePathname();
  const isBackForward = useRef(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({
      autoRaf: true,
      lerp: 0.12, // glide strength: lower = floatier, higher = snappier
      smoothWheel: true,
      virtualScroll: (data) => smoothScroll.intercept(data),
    });
    smoothScroll.set(lenis);
    return () => {
      smoothScroll.set(null);
      lenis.destroy();
    };
  }, []);

  // Back / forward buttons should return to where you were, so remember those.
  useEffect(() => {
    window.history.scrollRestoration = "manual"; // we restore it ourselves (Lenis-aware)
    const onPop = () => { isBackForward.current = true; };
    // Remember how far down this page was when a link to another page is tapped.
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (a && a.origin === window.location.origin && !a.target) savedPositions.set(here(), window.scrollY);
    };
    window.addEventListener("popstate", onPop);
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("popstate", onPop);
      document.removeEventListener("click", onClick, true);
    };
  }, []);

  // Opening a new page (e.g. a product from far down the home page) starts at the top.
  // Lenis keeps its own scroll position between pages, so it must be reset too —
  // otherwise the new page opens wherever the previous one was scrolled to.
  useEffect(() => {
    if (isBackForward.current) {
      isBackForward.current = false;
      const saved = savedPositions.get(here());
      if (saved === undefined) return;
      // Wait until the page is tall enough (content still loading), then jump back.
      let tries = 0;
      const restore = () => {
        const fits = document.documentElement.scrollHeight - window.innerHeight >= saved - 2;
        if (fits || tries++ > 90) {
          smoothScroll.get()?.scrollTo(saved, { immediate: true, force: true });
          window.scrollTo(0, saved);
        } else requestAnimationFrame(restore);
      };
      requestAnimationFrame(restore);
      return;
    }
    if (window.location.hash) return; // in-page anchors keep their target
    const lenis = smoothScroll.get();
    lenis?.scrollTo(0, { immediate: true, force: true });
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
