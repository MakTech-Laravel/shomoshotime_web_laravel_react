const AUTH_SYNC_CHANNEL = 'shomoshotime-auth-sync'

export type AuthSyncMessage = { type: 'auth-changed' }

export function notifyAuthChanged() {
  if (typeof window === 'undefined') return

  try {
    const channel = new BroadcastChannel(AUTH_SYNC_CHANNEL)
    channel.postMessage({ type: 'auth-changed' } satisfies AuthSyncMessage)
    channel.close()
  } catch {
    // BroadcastChannel unavailable in some environments
  }
}

export function subscribeAuthChanged(listener: () => void): () => void {
  if (typeof window === 'undefined') return () => undefined

  let channel: BroadcastChannel | null = null

  function onStorage(event: StorageEvent) {
    if (
      event.key === 'react-vite-laravel.bearer_token' ||
      event.key === 'react-vite-laravel.auth_user' ||
      event.key === null
    ) {
      listener()
    }
  }

  try {
    channel = new BroadcastChannel(AUTH_SYNC_CHANNEL)
    channel.onmessage = () => listener()
  } catch {
    channel = null
  }

  window.addEventListener('storage', onStorage)

  return () => {
    window.removeEventListener('storage', onStorage)
    channel?.close()
  }
}
