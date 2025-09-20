import React, { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { Bot, ArrowRight, Trash2 } from 'lucide-react'
import AttioAPI from '../services/attioAPI'
import AirtableAPI from '../services/airtableAPI'
import toast from 'react-hot-toast'

export default function FieldMapping({ connections, fieldMappings, setFieldMappings, onNext, onBack }) {
  const [attioFields, setAttioFields] = useState([])
  const [airtableFields, setAirtableFields] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedAttioObject, setSelectedAttioObject] = useState('')
  const [selectedAirtableTable, setSelectedAirtableTable] = useState('')
  const [attioObjects, setAttioObjects] = useState([])
  const [airtableTables, setAirtableTables] = useState([])

  useEffect(() => {
    if (connections.attio.connected && connections.airtable.connected) {
      loadMetadata()
    }
  }, [connections])

  const loadMetadata = async () => {
    setLoading(true)
    try {
      const attioAPI = new AttioAPI(connections.attio.config.apiKey)
      const airtableAPI = new AirtableAPI(connections.airtable.config.apiKey, connections.airtable.config.baseId)

      const [attioObjectsData, airtableTablesData] = await Promise.all([
        attioAPI.getObjects(),
        airtableAPI.getTables()
      ])

      setAttioObjects(attioObjectsData)
      setAirtableTables(airtableTablesData)
    } catch (error) {
      toast.error('Failed to load metadata: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const loadFields = async () => {
    if (!selectedAttioObject || !selectedAirtableTable) return

    try {
      const attioAPI = new AttioAPI(connections.attio.config.apiKey)
      const airtableAPI = new AirtableAPI(connections.airtable.config.apiKey, connections.airtable.config.baseId)

      const [attioFieldsData, airtableFieldsData] = await Promise.all([
        attioAPI.getObjectFields(selectedAttioObject),
        airtableAPI.getTableFields(selectedAirtableTable)
      ])

      setAttioFields(attioFieldsData)
      setAirtableFields(airtableFieldsData)
    } catch (error) {
      toast.error('Failed to load fields: ' + error.message)
    }
  }

  const autoMapFields = async () => {
    if (!attioFields.length || !airtableFields.length) return

    const mappings = []
    
    attioFields.forEach(attioField => {
      const matchingAirtableField = airtableFields.find(airtableField => 
        airtableField.name.toLowerCase() === attioField.name.toLowerCase() ||
        airtableField.name.toLowerCase().includes(attioField.name.toLowerCase()) ||
        attioField.name.toLowerCase().includes(airtableField.name.toLowerCase())
      )
      
      if (matchingAirtableField) {
        mappings.push({
          id: Date.now() + Math.random(),
          attioField: attioField,
          airtableField: matchingAirtableField,
          confidence: calculateConfidence(attioField, matchingAirtableField)
        })
      }
    })

    setFieldMappings(mappings)
    toast.success(`Auto-mapped ${mappings.length} fields`)
  }

  const calculateConfidence = (attioField, airtableField) => {
    let score = 0
    if (attioField.name.toLowerCase() === airtableField.name.toLowerCase()) score += 0.8
    if (attioField.type === airtableField.type) score += 0.2
    return Math.min(score, 1)
  }

  const addManualMapping = () => {
    setFieldMappings(prev => [...prev, {
      id: Date.now(),
      attioField: null,
      airtableField: null,
      confidence: 0
    }])
  }

  const removeMapping = (id) => {
    setFieldMappings(prev => prev.filter(mapping => mapping.id !== id))
  }

  const updateMapping = (id, field, value) => {
    setFieldMappings(prev => prev.map(mapping => 
      mapping.id === id ? { ...mapping, [field]: value } : mapping
    ))
  }

  if (loading) {
    return <div className="flex justify-center py-8">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Field Mapping</h2>
        <button
          onClick={autoMapFields}
          disabled={!attioFields.length || !airtableFields.length}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300"
        >
          <Bot className="h-4 w-4 mr-2" />
          Auto Map Fields
        </button>
      </div>

      {/* Object/Table Selection */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Attio Object
            </label>
            <select
              value={selectedAttioObject}
              onChange={(e) => setSelectedAttioObject(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select an object...</option>
              {attioObjects.map(obj => (
                <option key={obj.id} value={obj.id}>{obj.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Airtable Table
            </label>
            <select
              value={selectedAirtableTable}
              onChange={(e) => setSelectedAirtableTable(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select a table...</option>
              {airtableTables.map(table => (
                <option key={table.id} value={table.id}>{table.name}</option>
              ))}
            </select>
          </div>
        </div>
        
        <button
          onClick={loadFields}
          disabled={!selectedAttioObject || !selectedAirtableTable}
          className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-300"
        >
          Load Fields
        </button>
      </div>

      {/* Field Mappings */}
      {fieldMappings.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="space-y-4">
            {fieldMappings.map(mapping => (
              <div key={mapping.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                <select
                  value={mapping.attioField?.id || ''}
                  onChange={(e) => {
                    const field = attioFields.find(f => f.id === e.target.value)
                    updateMapping(mapping.id, 'attioField', field)
                  }}
                  className="flex-1 rounded-md border-gray-300"
                >
                  <option value="">Select Attio field...</option>
                  {attioFields.map(field => (
                    <option key={field.id} value={field.id}>{field.name}</option>
                  ))}
                </select>
                
                <ArrowRight className="h-4 w-4 text-gray-400" />
                
                <select
                  value={mapping.airtableField?.id || ''}
                  onChange={(e) => {
                    const field = airtableFields.find(f => f.id === e.target.value)
                    updateMapping(mapping.id, 'airtableField', field)
                  }}
                  className="flex-1 rounded-md border-gray-300"
                >
                  <option value="">Select Airtable field...</option>
                  {airtableFields.map(field => (
                    <option key={field.id} value={field.id}>{field.name}</option>
                  ))}
                </select>
                
                {mapping.confidence > 0 && (
                  <div className="text-sm text-green-600 font-medium">
                    {Math.round(mapping.confidence * 100)}% match
                  </div>
                )}
                
                <button
                  onClick={() => removeMapping(mapping.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          
          <button
            onClick={addManualMapping}
            className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Add Manual Mapping
          </button>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
        >
          Back
        </button>
        
        <button
          onClick={onNext}
          disabled={fieldMappings.length === 0}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300"
        >
          Continue to Configuration
        </button>
      </div>
    </div>
  )
}
