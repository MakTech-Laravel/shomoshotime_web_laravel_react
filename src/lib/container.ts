/**
 * Shared content wrapper (marketing landing, admin shell, etc.).
 * Desktop (lg+) gives a fixed 100px gutter on each side — i.e. inner content
 * width === `calc(100% - 100px - 100px)`. Padding scales down on smaller
 * viewports so phones/tablets remain readable.
 */
export const container =
  "mx-auto w-full px-4 sm:px-8 lg:px-[100px]";
