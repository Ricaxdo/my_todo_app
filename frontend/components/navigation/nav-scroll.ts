function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/** Calcula el offset considerando el navbar fijo (si existe) */
function getNavOffset(navId = "app-navbar", extra = 12) {
  const nav = document.getElementById(navId);
  const h = nav?.offsetHeight ?? 0;
  return h + extra;
}

/**
 * Scroll animado hacia un elemento por id:
 * - Ajusta offset para que no quede “tapado” por el navbar
 * - Animación suave con requestAnimationFrame
 */
export function scrollToId(
  id: string,
  opts?: { duration?: number; extraOffset?: number; navId?: string }
) {
  const el = document.getElementById(id);
  if (!el) return;

  const duration = opts?.duration ?? 900;
  const extraOffset = opts?.extraOffset ?? 16;
  const navId = opts?.navId ?? "app-navbar";

  const offset = getNavOffset(navId, extraOffset);

  const startY = window.scrollY;
  const rect = el.getBoundingClientRect();
  const targetY = startY + rect.top - offset;

  const startTime = performance.now();

  function step(now: number) {
    const elapsed = now - startTime;
    const t = Math.min(1, elapsed / duration);
    const eased = easeInOutCubic(t);

    window.scrollTo(0, startY + (targetY - startY) * eased);
    if (t < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}
