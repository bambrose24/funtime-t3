import { clientApi } from "@/lib/trpc/react";

/**
 * Custom hook to get current user data via tRPC
 * Similar to what useUser() would be from Supabase auth helpers
 * 
 * @returns Object with user data, loading state, and error state
 */
export function useUser() {
  const {
    data: session,
    isLoading,
    error,
    refetch,
  } = clientApi.session.current.useQuery(undefined, {
    // Uses 5min staleTime from global defaults
    refetchOnWindowFocus: true, // Override global setting for session data
  });

  return {
    // User data (null if not authenticated)
    user: session?.dbUser ?? null,
    
    // Raw session data (includes Supabase session + dbUser)
    session: session ?? null,
    
    // Loading state
    isLoading,
    
    // Error state
    error,
    
    // Helper to refetch user data
    refetch,
    
    // Convenience boolean
    isAuthenticated: !!session?.dbUser,
  };
}