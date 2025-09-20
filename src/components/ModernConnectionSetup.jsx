import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Database, CheckCircle, AlertCircle, ExternalLink, LogIn, Settings, Shield } from 'lucide-react'
import toast from 'react-hot-toast'
import Card from './ui/Card'
import Button from './ui/Button'
import Badge from './ui/Badge'
import AttioOAuth from '../services/attioOAuth'
import AirtableOAuth from '../services/airtableOAuth'

export default function ModernConnectionSetup({ connections, setConnections, onNext }) {
  const [isConnecting, setIsConnecting] = useState({ attio: false, airtable: false })

  useEffect(() => {
    // Check if users are already authenticated
    setConnections(prev => ({
      ...prev,
      attio: {
        connected: AttioOAuth.isAuthenticated(),
        config: AttioOAuth.isAuthenticated() ? { oauth: true } : null
      },
      airtable: {
        connected: AirtableOAuth.isAuthenticated(),
        config: AirtableOAuth.isAuthenticated() ? { oauth: true } : null
      }
    }))
  }, [setConnections])

  const handleAttioConnect = async () => {
    setIsConnecting(prev => ({ ...prev, attio: true }))

    try {
      if (AttioOAuth.isAuthenticated()) {
        toast.success('Already connected to Attio!')
        return
      }

      // Start OAuth flow
      AttioOAuth.startOAuthFlow()
    } catch (error) {
      toast.error('Failed to connect to Attio: ' + error.message)
      setIsConnecting(prev => ({ ...prev, attio: false }))
    }
  }

  const handleAirtableConnect = async () => {
    setIsConnecting(prev => ({ ...prev, airtable: true }))

    try {
      if (AirtableOAuth.isAuthenticated()) {
        toast.success('Already connected to Airtable!')
        return
      }

      // Start OAuth flow
      AirtableOAuth.startOAuthFlow()
    } catch (error) {
      toast.error('Failed to connect to Airtable: ' + error.message)
      setIsConnecting(prev => ({ ...prev, airtable: false }))
    }
  }

  const handleDisconnect = (service) => {
    if (service === 'attio') {
      AttioOAuth.logout()
      setConnections(prev => ({ ...prev, attio: { connected: false, config: null } }))
      toast.success('Disconnected from Attio')
    } else if (service === 'airtable') {
      AirtableOAuth.logout()
      setConnections(prev => ({ ...prev, airtable: { connected: false, config: null } }))
      toast.success('Disconnected from Airtable')
    }
  }

  const bothConnected = connections.attio.connected && connections.airtable.connected

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        className="text-center space-y-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4">
          <Database className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
          Connect Your Accounts
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Securely connect to both Attio CRM and Airtable using OAuth authentication to begin syncing your data
        </p>
      </motion.div>

      {/* Connection Cards */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Attio Connection */}
        <Card gradient hover className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-full -mr-16 -mt-16" />

          <div className="relative">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Database className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Attio CRM</h3>
                  <p className="text-gray-600">Customer relationship management</p>
                </div>
              </div>

              <AnimatePresence>
                {connections.attio.connected && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 500 }}
                  >
                    <Badge variant="success" icon={<CheckCircle className="w-4 h-4" />}>
                      Connected
                    </Badge>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <Shield className="w-4 h-4" />
                <span>Secure OAuth 2.0 authentication</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <Settings className="w-4 h-4" />
                <span>Full API access to your workspace</span>
              </div>
            </div>

            {connections.attio.connected ? (
              <div className="space-y-3">
                <Button variant="success" size="md" className="w-full" disabled>
                  <CheckCircle className="w-4 h-4" />
                  Connected Successfully
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => handleDisconnect('attio')}
                >
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button
                onClick={handleAttioConnect}
                loading={isConnecting.attio}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
                icon={<LogIn className="w-4 h-4" />}
              >
                {isConnecting.attio ? 'Connecting...' : 'Connect to Attio'}
              </Button>
            )}

            <p className="text-xs text-gray-500 mt-3 text-center">
              You'll be redirected to Attio to authorize access
              <ExternalLink className="w-3 h-3 ml-1 inline" />
            </p>
          </div>
        </Card>

        {/* Airtable Connection */}
        <Card gradient hover className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/10 to-orange-600/10 rounded-full -mr-16 -mt-16" />

          <div className="relative">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <Database className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Airtable</h3>
                  <p className="text-gray-600">Cloud-based database platform</p>
                </div>
              </div>

              <AnimatePresence>
                {connections.airtable.connected && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 500 }}
                  >
                    <Badge variant="success" icon={<CheckCircle className="w-4 h-4" />}>
                      Connected
                    </Badge>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <Shield className="w-4 h-4" />
                <span>PKCE-enhanced OAuth 2.0</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <Settings className="w-4 h-4" />
                <span>Access to bases and tables</span>
              </div>
            </div>

            {connections.airtable.connected ? (
              <div className="space-y-3">
                <Button variant="success" size="md" className="w-full" disabled>
                  <CheckCircle className="w-4 h-4" />
                  Connected Successfully
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => handleDisconnect('airtable')}
                >
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button
                onClick={handleAirtableConnect}
                loading={isConnecting.airtable}
                className="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800"
                icon={<LogIn className="w-4 h-4" />}
              >
                {isConnecting.airtable ? 'Connecting...' : 'Connect to Airtable'}
              </Button>
            )}

            <p className="text-xs text-gray-500 mt-3 text-center">
              You'll be redirected to Airtable to authorize access
              <ExternalLink className="w-3 h-3 ml-1 inline" />
            </p>
          </div>
        </Card>
      </div>

      {/* Continue Button */}
      <AnimatePresence>
        {bothConnected && (
          <motion.div
            className="flex justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Button
              onClick={onNext}
              size="lg"
              className="px-12 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700"
            >
              Continue to Field Mapping
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status Indicator */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <div className="inline-flex items-center space-x-3 px-6 py-3 bg-gray-50 rounded-full">
          {bothConnected ? (
            <>
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-green-800 font-medium">Both services connected successfully!</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-5 h-5 text-amber-600" />
              <span className="text-amber-800">
                {!connections.attio.connected && !connections.airtable.connected
                  ? 'Connect to both services to continue'
                  : !connections.attio.connected
                  ? 'Connect to Attio to continue'
                  : 'Connect to Airtable to continue'
                }
              </span>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}
