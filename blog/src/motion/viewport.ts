// Viewport helpers shared by widgets and players. Keep this module free of
// remotion imports: Widgets.tsx must not statically pull the Player bundle.
export const isNarrow = () => typeof window !== 'undefined' && window.matchMedia('(max-width: 640px)').matches
export const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
