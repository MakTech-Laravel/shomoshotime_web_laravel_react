/**
 * Floating support / chat trigger (bottom-right), matches marketing site FAB style.
 */
export function FrontendChatFab() {
  return (
    <div className="pointer-events-none fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-50 sm:right-8 sm:bottom-[max(2rem,env(safe-area-inset-bottom))]">
      <button
        type="button"
        className="pointer-events-auto flex size-12 items-center justify-center rounded-full bg-[#ffbf23] text-black shadow-lg ring-1 ring-black/5 transition hover:bg-brand-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black/40 sm:size-14"
        aria-label="Open chat or support"
      >
        <span className="sr-only">Chat</span>
        <svg
          width={32}
          height={32}
          viewBox="0 0 32 32"
          xmlns="http://www.w3.org/2000/svg"
          className="size-8 shrink-0 text-black"
          aria-hidden
        >
          <g fill="currentColor" fillRule="nonzero">
            <path d="M4.224 29.97l-1.73-.898V5.307l1.07-1.062H28.93L30 5.307v19.436l-1.07 1.062H9.905L4.224 29.97zm.494-23.602v20.58l4.2-3.103.658-.245h18.365V6.368H4.718z" />
            <path d="M9.906 10.533h13.835v2.205H9.906zM12.212 16.658h8.235v2.205h-8.235z" />
          </g>
        </svg>
      </button>
    </div>
  );
}
