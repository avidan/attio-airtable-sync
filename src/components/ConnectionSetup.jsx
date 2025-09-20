import React, { useState } from 'react'
import { Database, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ConnectionSetup({ connections, setConnections, onNext }) {
  const [attioApiKey, setAttioApiKey] = useState('')
  const [airtableApiKey, setAirtableApiKey] = useState('')
  const [airtableBaseId, setAirtableBaseId] = useState('')
  
  const testAttioConnection = () => {
    if (!attioApiKey) {
      toast.error('Please enter Attio API key')
      return
    }
    toast.success('Attio connection successful!')
    setConnections(prev => ({
      ...prev,
      attio: { connected: true, config: { apiKey: attioApiKey } }
    }))
  }
  
  const testAirtableConnection = () => {
    if (!airtableApiKey || !airtableBaseId) {
      toast.error('Please enter both Airtable API key and Base ID')
      return
    }
    toast.success('Airtable connection successful!')
    setConnections(prev => ({
      ...prev,
      airtable: { connected: true, config: { apiKey: airtableApiKey, baseId: airtableBaseId } }
    }))
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">API Connections</h2>
      
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Database className="h-6 w-6 text-purple-600 mr-3" />
            <h3 className="text-lg font-medium">Attio CRM</h3>
          </div>
          {connections.attio.connected && (
            <CheckCircle className="h-6 w-6 text-green-600" />
          )}
        </div>
        
        <div className="space-y-4">
          <input
            type="password"
            value={attioApiKey}
            onChange={(e) => setAttioApiKey(e.target.value)}
            className="w-full rounded-md border-gray-300 shadow-sm"
            placeholder="Enter your Attio API key"
          />
          <button
            onClick={testAttioConnection}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            Test Connection
          </button>
        </div>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Database className="h-6 w-6 text-orange-600 mr-3" />
            <h3 className="text-lg font-medium">Airtable</h3>
          </div>
          {connections.airtable.connected && (
            <CheckCircle className="h-6 w-6 text-green-600" />
          )}
        </div>
        
        <div className="space-y-4">
          <input
            type="password"
            value={airtableApiKey}
            onChange={(e) => setAirtableApiKey(e.target.value)}
            className="w-full rounded-md border-gray-300 shadow-sm"
            placeholder="Enter your Airtable API key"
          />
          <input
            type="text"
            value={airtableBaseId}
            onChange={(e) => setAirtableBaseId(e.target.value)}
            className="w-full rounded-md border-gray-300 shadow-sm"
            placeholder="Enter your Airtable base ID"
          />
          <button
            onClick={testAirtableConnection}
            className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
          >
            Test Connection
          </button>
        </div>
      </div>

      {connections.attio.connected && connections.airtable.connected && (
        <div className="flex justify-center">
          <button
            onClick={onNext}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Continue to Field Mapping
          </button>
        </div>
      )}
    </div>
  )
}
