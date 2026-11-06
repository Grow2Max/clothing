// Shared Lenis (smooth scrolling) instance for the storefront.
// Sections that need to take over scroll gestures (the home-page story's peak-to-peak
// stepping) register an interceptor; returning false tells Lenis to ignore that event.
import type Lenis from "lenis";
import type { VirtualScrollData } from "lenis";

type Interceptor = (data: VirtualScrollData) => boolean;

let instance: Lenis | null = null;
let interceptor: Interceptor | null = null;
const listeners = new Set<(lenis: Lenis | null) => void>();

export const smoothScroll = {
  get: () => instance,
  set(lenis: Lenis | null) {
    instance = lenis;
    listeners.forEach((fn) => fn(lenis));
  },
  /** Called with the current instance now and whenever it changes. */
  subscribe(fn: (lenis: Lenis | null) => void) {
    listeners.add(fn);
    fn(instance);
    return () => void listeners.delete(fn);
  },
  setInterceptor(fn: Interceptor | null) {
    interceptor = fn;
  },
  intercept(data: VirtualScrollData) {
    return interceptor ? interceptor(data) : true;
  },
};
