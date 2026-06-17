import { QueryClient } from '@tanstack/react-query'

function shouldRetryQuery(failureCount: number, error: unknown): boolean {
  if (failureCount >= 1) return false

  const status =
    error &&
    typeof error === 'object' &&
    'response' in error &&
    error.response &&
    typeof error.response === 'object' &&
    'status' in error.response
      ? Number((error.response as { status?: number }).status)
      : undefined

  if (status != null && status >= 400) return false

  return true
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,
      gcTime: 1000 * 60 * 10,
      retry: shouldRetryQuery,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
})
