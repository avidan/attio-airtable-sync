import axios from 'axios'

class AttioAPI {
  constructor(apiKey) {
    this.apiKey = apiKey
    this.baseURL = 'https://api.attio.com/v2'
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
      const response = await this.client.get('/workspaces')
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  async getObjects() {
    try {
      const response = await this.client.get('/objects')
      return response.data
    } catch (error) {
      throw new Error(`Failed to fetch objects: ${error.message}`)
    }
  }

  async getObjectFields(objectId) {
    try {
      const response = await this.client.get(`/objects/${objectId}/attributes`)
      return response.data
    } catch (error) {
      throw new Error(`Failed to fetch object fields: ${error.message}`)
    }
  }

  async getRecords(objectId, options = {}) {
    try {
      const response = await this.client.post(`/objects/${objectId}/records/query`, options)
      return response.data
    } catch (error) {
      throw new Error(`Failed to fetch records: ${error.message}`)
    }
  }

  async createRecord(objectId, data) {
    try {
      const response = await this.client.post(`/objects/${objectId}/records`, data)
      return response.data
    } catch (error) {
      throw new Error(`Failed to create record: ${error.message}`)
    }
  }

  async updateRecord(objectId, recordId, data) {
    try {
      const response = await this.client.put(`/objects/${objectId}/records/${recordId}`, data)
      return response.data
    } catch (error) {
      throw new Error(`Failed to update record: ${error.message}`)
    }
  }
}

export default AttioAPI
