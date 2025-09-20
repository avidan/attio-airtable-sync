import axios from 'axios'

class AirtableAPI {
  constructor(apiKey, baseId) {
    this.apiKey = apiKey
    this.baseId = baseId
    this.baseURL = `https://api.airtable.com/v0/${baseId}`
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    })
  }

  async testConnection() {
    try {
      const response = await this.client.get('/')
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  async getTables() {
    try {
      const metaResponse = await axios.get(`https://api.airtable.com/v0/meta/bases/${this.baseId}/tables`, {
        headers: { 'Authorization': `Bearer ${this.apiKey}` }
      })
      return metaResponse.data.tables
    } catch (error) {
      throw new Error(`Failed to fetch tables: ${error.message}`)
    }
  }

  async getTableFields(tableId) {
    try {
      const tables = await this.getTables()
      const table = tables.find(t => t.id === tableId)
      return table ? table.fields : []
    } catch (error) {
      throw new Error(`Failed to fetch table fields: ${error.message}`)
    }
  }

  async getRecords(tableId, options = {}) {
    try {
      const response = await this.client.get(`/${tableId}`, { params: options })
      return response.data
    } catch (error) {
      throw new Error(`Failed to fetch records: ${error.message}`)
    }
  }

  async createRecords(tableId, records) {
    try {
      const response = await this.client.post(`/${tableId}`, { records })
      return response.data
    } catch (error) {
      throw new Error(`Failed to create records: ${error.message}`)
    }
  }

  async updateRecords(tableId, records) {
    try {
      const response = await this.client.patch(`/${tableId}`, { records })
      return response.data
    } catch (error) {
      throw new Error(`Failed to update records: ${error.message}`)
    }
  }
}

export default AirtableAPI
