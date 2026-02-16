import { useEffect, useRef, useState, type RefObject } from "react";

const SHADOW_BASE = "oklch(0.282 0.091 267.935";
const MAX_OFFSET = 40;
const BLUR_MIN = 20;
const BLUR_MAX = 60;
const SPREAD = -12;
const OPACITY_MIN = 0.15;
const OPACITY_MAX = 0.65;
const MAX_DIST = 600;

/**
 * Returns a box-shadow string that reacts to the mouse position,
 * treating the cursor as a light source. The shadow falls opposite
 * to the cursor relative to the element's center.
 *
 * As the cursor gets closer:
 *  - shadow offset shrinks (light is nearly overhead)
 *  - opacity increases  (stronger shadow)
 *  - blur decreases     (sharper shadow)
 *
 * As the cursor moves farther:
 *  - shadow offset grows (longer shadow)
 *  - opacity decreases  (fainter shadow)
 *  - blur increases     (softer shadow)
 */
export function useDynamicShadow(
  ref: RefObject<HTMLElement | null>
): string {
  const [shadow, setShadow] = useState(
    `0px 12px ${BLUR_MAX}px ${SPREAD}px ${SHADOW_BASE} / ${OPACITY_MIN})`
  );
  const rafId = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onMouseMove = (e: MouseEvent) => {
      cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;

        // Vector from mouse (light source) to card center
        const dx = cx - e.clientX;
        const dy = cy - e.clientY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist === 0) {
          setShadow(
            `0px 0px ${BLUR_MIN}px ${SPREAD}px ${SHADOW_BASE} / ${OPACITY_MAX})`
          );
          return;
        }

        // t = 0 when cursor is on the card, 1 when far away
        const t = Math.min(dist / MAX_DIST, 1);

        // Closer → smaller offset (4px), farther → larger offset (32px)
        const offsetScale = 8 + t * (MAX_OFFSET - 8);
        const ox = (dx / dist) * offsetScale;
        const oy = (dy / dist) * offsetScale;

        // Closer → higher opacity, farther → lower opacity
        const opacity = OPACITY_MAX - t * (OPACITY_MAX - OPACITY_MIN);

        // Closer → smaller blur (sharp), farther → larger blur (soft)
        const blur = BLUR_MIN + t * (BLUR_MAX - BLUR_MIN);

        setShadow(
          `${ox.toFixed(1)}px ${oy.toFixed(1)}px ${blur.toFixed(0)}px ${SPREAD}px ${SHADOW_BASE} / ${opacity.toFixed(3)})`
        );
      });
    };

    window.addEventListener("mousemove", onMouseMove);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(rafId.current);
    };
  }, [ref]);

  return shadow;
}
