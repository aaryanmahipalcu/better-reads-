'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Loader2 } from 'lucide-react'

export default function AuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        setStatus('loading')
        setMessage('Completing authentication...')

        // Handle the OAuth callback
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          throw error
        }

        if (data.session?.user) {
          // Check if profile exists, if not create one
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', data.session.user.id)
            .single()

          if (profileError && profileError.code === 'PGRST116') {
            // Profile doesn't exist, create one
            const { error: createError } = await supabase
              .from('profiles')
              .insert([
                {
                  id: data.session.user.id,
                  username: data.session.user.email?.split('@')[0] || 'user',
                  avatar_url: data.session.user.user_metadata?.avatar_url || null,
                  bio: 'New BetterReads user'
                }
              ])

            if (createError) {
              console.error('Profile creation error:', createError)
            }
          }

          setStatus('success')
          setMessage('Authentication successful! Redirecting...')
          
          // Redirect to profile page
          setTimeout(() => {
            router.push('/profile')
          }, 1500)
        } else {
          throw new Error('No session found')
        }
      } catch (error: any) {
        setStatus('error')
        setMessage(error.message || 'Authentication failed')
        
        // Redirect back to login after error
        setTimeout(() => {
          router.push('/login')
        }, 3000)
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white flex items-center justify-center p-4">
      <div className="text-center">
        <div className="mb-6">
          <h1 className="text-4xl font-['Playfair_Display'] font-bold mb-2">BetterReads</h1>
          <p className="text-gray-400">Authentication</p>
        </div>

        <div className="bg-[#262626] border border-gray-700 rounded-lg p-8 max-w-md">
          {status === 'loading' && (
            <div className="flex items-center justify-center space-x-3">
              <Loader2 className="h-6 w-6 animate-spin text-[#ffa94d]" />
              <span className="text-lg">{message}</span>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold mb-2 text-green-400">Success!</h2>
              <p className="text-gray-300">{message}</p>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold mb-2 text-red-400">Error</h2>
              <p className="text-gray-300">{message}</p>
              <p className="text-sm text-gray-500 mt-2">Redirecting to login...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 