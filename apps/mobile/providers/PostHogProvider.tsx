import React, { createContext, useContext, useEffect, ReactNode } from 'react'
import PostHog from 'posthog-react-native'
import { initPostHog } from '../lib/posthog'

interface PostHogContextType {
  posthog: PostHog | null
}

const PostHogContext = createContext<PostHogContextType>({ posthog: null })

interface PostHogProviderProps {
  children: ReactNode
}

export function PostHogProvider({ children }: PostHogProviderProps) {
  const [posthog, setPostHog] = React.useState<PostHog | null>(null)

  useEffect(() => {
    const instance = initPostHog()
    setPostHog(instance)

    // Cleanup function
    return () => {
      if (instance) {
        instance.flush() // Ensure all events are sent before cleanup
      }
    }
  }, [])

  return (
    <PostHogContext.Provider value={{ posthog }}>
      {children}
    </PostHogContext.Provider>
  )
}

export function usePostHog(): PostHog | null {
  const { posthog } = useContext(PostHogContext)
  return posthog
}