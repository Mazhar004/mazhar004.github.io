/* Shared DOM refs and capability flags. */

export const body = document.body;
export const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
export const hoverCapable = window.matchMedia("(hover: hover)").matches;
