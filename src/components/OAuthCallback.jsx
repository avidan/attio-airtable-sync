import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import AttioOAuth from '../services/attioOAuth'
import AirtableOAuth from '../services/airtableOAuth'
import Button from './ui/Button'
import Card from './ui/Card'

export default function OAuthCallback() {
  const [status, setStatus] = useState('processing') // processing, success, error
  const [service, setService] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search)
      const code = urlParams.get('code')
      const state = urlParams.get('state')
      const error = urlParams.get('error')
      const pathname = window.location.pathname

      // Determine which service based on the path
      let currentService = ''
      if (pathname.includes('/attio')) {
        currentService = 'attio'
        setService('Attio')
      } else if (pathname.includes('/airtable')) {
        currentService = 'airtable'
        setService('Airtable')
      }

      if (error) {
        setStatus('error')
        setError(`Authentication failed: ${error}`)
        toast.error(`${currentService} authentication failed`)
        return
      }

      if (!code || !state) {
        setStatus('error')
        setError('Missing authorization code or state parameter')
        return
      }

      try {
        if (currentService === 'attio') {
          await AttioOAuth.handleCallback(code, state, error)
          toast.success('Successfully connected to Attio!')
        } else if (currentService === 'airtable') {
          await AirtableOAuth.handleCallback(code, state, error)
          toast.success('Successfully connected to Airtable!')
        }

        setStatus('success')

        // Redirect back to main app after short delay
        setTimeout(() => {
          window.location.href = '/'
        }, 2000)
      } catch (err) {
        setStatus('error')
        setError(err.message)
        toast.error(`Failed to connect to ${currentService}: ${err.message}`)
      }
    }

    handleCallback()
  }, [])

  const handleReturnToApp = () => {
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center" padding="xl">
        {status === 'processing' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full"
              />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Connecting to {service}
            </h2>
            <p className="text-gray-600">
              Please wait while we complete the authentication process...
            </p>
          </motion.div>
        )}

        {status === 'success' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 500 }}
              className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle className="w-8 h-8 text-green-600" />
            </motion.div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Successfully Connected!
            </h2>
            <p className="text-gray-600 mb-6">
              Your {service} account has been connected successfully.
              You'll be redirected back to the app shortly.
            </p>
            <Button onClick={handleReturnToApp} className="w-full">
              Return to App
            </Button>
          </motion.div>
        )}

        {status === 'error' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 500 }}
              className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <AlertCircle className="w-8 h-8 text-red-600" />
            </motion.div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Connection Failed
            </h2>
            <p className="text-gray-600 mb-4">
              We couldn't connect to {service}. Please try again.
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <Button
              onClick={handleReturnToApp}
              className="w-full"
              icon={<ArrowLeft className="w-4 h-4" />}
            >
              Return to App
            </Button>
          </motion.div>
        )}
      </Card>
    </div>
  )
}
