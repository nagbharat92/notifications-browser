import { useEffect, useRef, useState, type RefObject } from "react";

const SHADOW_BASE = "oklch(0.282 0.091 267.935";
const MAX_OFFSET = 40;
const BLUR_MIN = 20;
const BLUR_MAX = 60;
const SPREAD = -12;
const OPACITY_MIN = 0.15;
const OPACITY_MAX = 0.65;
const MAX_DIST = 600;

// ── Tilt constants ──
const MAX_TILT = 10; // degrees
const TILT_MAX_DIST = 600; // px

export interface DynamicCardStyle {
  shadow: string;
  tiltX: number; // rotateX degrees
  tiltY: number; // rotateY degrees
  lightAngle: number; // CSS gradient angle (deg) pointing toward pointer
}

const DEFAULT_STYLE: DynamicCardStyle = {
  shadow: `0px 12px ${BLUR_MAX}px ${SPREAD}px ${SHADOW_BASE} / ${OPACITY_MIN})`,
  tiltX: 0,
  tiltY: 0,
  lightAngle: 180,
};

/**
 * Returns a box-shadow string and 3-D tilt angles that react to the
 * mouse position, treating the cursor as a light source.
 *
 * Shadow: falls opposite to the cursor (light-source metaphor).
 * Tilt:   card leans *toward* the cursor (perspective-tilt effect).
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
): DynamicCardStyle {
  const [cardStyle, setCardStyle] = useState<DynamicCardStyle>(DEFAULT_STYLE);
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

        // ── Light angle (CSS degrees, pointing toward cursor) ──
        const mathAngle = Math.atan2(-(e.clientY - cy), e.clientX - cx);
        const lightAngle = (90 - (mathAngle * 180) / Math.PI + 360) % 360;

        if (dist === 0) {
          setCardStyle({
            shadow: `0px 0px ${BLUR_MIN}px ${SPREAD}px ${SHADOW_BASE} / ${OPACITY_MAX})`,
            tiltX: 0,
            tiltY: 0,
            lightAngle,
          });
          return;
        }

        // ── Shadow ──
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

        const shadow = `${ox.toFixed(1)}px ${oy.toFixed(1)}px ${blur.toFixed(0)}px ${SPREAD}px ${SHADOW_BASE} / ${opacity.toFixed(3)})`;

        // ── Tilt (card leans toward cursor) ──
        const tiltT = Math.min(dist / TILT_MAX_DIST, 1);
        // rotateY: positive when mouse is to the right of center
        const tiltY = -(dx / dist) * tiltT * MAX_TILT;
        // rotateX: positive when mouse is above center (card tips forward)
        const tiltX = (dy / dist) * tiltT * MAX_TILT;

        setCardStyle({ shadow, tiltX, tiltY, lightAngle });
      });
    };

    const onMouseLeave = () => {
      cancelAnimationFrame(rafId.current);
      setCardStyle(DEFAULT_STYLE);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseleave", onMouseLeave);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
      cancelAnimationFrame(rafId.current);
    };
  }, [ref]);

  return cardStyle;
}
