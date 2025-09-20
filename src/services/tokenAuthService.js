class TokenAuthService {
  constructor() {
    this.connections = {
      attio: null,
      airtable: null,
    };
  }

  // Store connection credentials securely
  storeConnection(service, credentials) {
    this.connections[service] = {
      ...credentials,
      connectedAt: new Date().toISOString(),
    };

    // In production, consider encrypting sensitive data
    localStorage.setItem(
      `${service}_connection`,
      JSON.stringify(this.connections[service]),
    );
  }

  // Retrieve stored connection
  getConnection(service) {
    if (this.connections[service]) {
      return this.connections[service];
    }

    // Try to load from localStorage
    const stored = localStorage.getItem(`${service}_connection`);
    if (stored) {
      this.connections[service] = JSON.parse(stored);
      return this.connections[service];
    }

    return null;
  }

  // Check if service is connected
  isConnected(service) {
    return !!this.getConnection(service);
  }

  // Remove connection
  disconnect(service) {
    this.connections[service] = null;
    localStorage.removeItem(`${service}_connection`);
  }

  // Get authentication headers for API requests
  getAuthHeaders(service) {
    const connection = this.getConnection(service);
    if (!connection) return {};

    if (service === "attio") {
      return {
        Authorization: `Bearer ${connection.token}`,
        "Content-Type": "application/json",
      };
    } else if (service === "airtable") {
      return {
        Authorization: `Bearer ${connection.token}`,
        "Content-Type": "application/json",
      };
    }

    return {};
  }

  // Test connection to service
  async testConnection(service, credentials) {
    try {
      if (service === "attio") {
        return await this.testAttioConnection(credentials);
      } else if (service === "airtable") {
        return await this.testAirtableConnection(credentials);
      }

      throw new Error("Unknown service");
    } catch (error) {
      throw new Error(`Connection test failed: ${error.message}`);
    }
  }

  async testAttioConnection({ token, objectId }) {
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    // First, test basic API access by getting objects
    let url = "https://api.attio.com/v2/objects";
    let response = await fetch(url, { headers });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`,
      );
    }

    const objectsData = await response.json();

    // If a specific object ID is provided, test access to that object's records
    if (objectId) {
      url = `https://api.attio.com/v2/objects/${objectId}/records/query`;
      response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify({ limit: 1 }), // Just test with one record
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Cannot access object ${objectId}: ${errorData.message || response.statusText}`,
        );
      }

      const recordsData = await response.json();
      return {
        success: true,
        data: objectsData,
        objectInfo: { id: objectId, records: recordsData.data || [] },
        availableObjects: objectsData.data || [],
      };
    }

    return {
      success: true,
      data: objectsData,
      availableObjects: objectsData.data || [],
    };
  }

  async testAirtableConnection({ token, baseId }) {
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    // Test base access
    const response = await fetch(
      `https://api.airtable.com/v0/meta/bases/${baseId}/tables`,
      { headers },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (response.status === 401) {
        throw new Error("Invalid token or insufficient permissions");
      } else if (response.status === 404) {
        throw new Error("Base not found or access denied");
      }
      throw new Error(
        errorData.error?.message ||
          `HTTP ${response.status}: ${response.statusText}`,
      );
    }

    const data = await response.json();
    return {
      success: true,
      data,
      baseInfo: {
        tables: data.tables || [],
      },
    };
  }

  // Make authenticated API request
  async makeRequest(service, endpoint, options = {}) {
    const connection = this.getConnection(service);
    if (!connection) {
      throw new Error(`Not connected to ${service}`);
    }

    const baseURL =
      service === "attio"
        ? "https://api.attio.com/v2"
        : `https://api.airtable.com/v0/${connection.baseId}`;

    const url = `${baseURL}${endpoint}`;
    const headers = {
      ...this.getAuthHeaders(service),
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message ||
          errorData.error?.message ||
          `HTTP ${response.status}`,
      );
    }

    return await response.json();
  }

  // Get available objects/lists from Attio
  async getAttioObjects() {
    try {
      return await this.makeRequest("attio", "/objects");
    } catch (error) {
      console.warn("Failed to get Attio objects:", error.message);
      return { data: [] };
    }
  }

  // Get all attributes/fields for a specific Attio object
  async getAttioObjectFields(objectId) {
    try {
      const response = await this.makeRequest(
        "attio",
        `/objects/${objectId}/attributes`,
      );
      console.log(`Attio fields for object "${objectId}":`, response);
      return response;
    } catch (error) {
      console.warn(
        `Failed to get Attio fields for object "${objectId}":`,
        error.message,
      );
      return { data: [] };
    }
  }

  // Get available lists from Attio
  async getAttioLists() {
    try {
      const response = await this.makeRequest("attio", "/lists");
      console.log("Attio lists:", response);
      return response;
    } catch (error) {
      console.warn("Failed to get Attio lists:", error.message);
      return { data: [] };
    }
  }

  // Get detailed information about a specific list
  async getAttioListDetails(listId) {
    try {
      const response = await this.makeRequest("attio", `/lists/${listId}`);
      console.log(`Attio list details for "${listId}":`, response);
      return response;
    } catch (error) {
      console.warn(
        `Failed to get Attio list details for "${listId}":`,
        error.message,
      );
      return { data: null };
    }
  }

  // Get all attributes/fields for a specific Attio list
  async getAttioListFields(listId) {
    try {
      const response = await this.makeRequest(
        "attio",
        `/lists/${listId}/attributes`,
      );
      console.log(`Attio fields for list "${listId}":`, response);
      return response;
    } catch (error) {
      console.warn(
        `Failed to get Attio fields for list "${listId}":`,
        error.message,
      );
      return { data: [] };
    }
  }

  // Get available views from Attio
  async getAttioViews() {
    try {
      return await this.makeRequest("attio", "/views");
    } catch (error) {
      console.warn("Failed to get Attio views:", error.message);
      return { data: [] };
    }
  }

  // Get records from a specific Attio view
  async getAttioViewRecords(viewId, options = {}) {
    try {
      return await this.makeRequest("attio", `/views/${viewId}/records`, {
        method: "GET",
        ...options,
      });
    } catch (error) {
      throw new Error(`Failed to get Attio view records: ${error.message}`);
    }
  }

  // Get records from a specific Attio object/list
  async getAttioRecords(objectId, options = {}) {
    try {
      return await this.makeRequest(
        "attio",
        `/objects/${objectId}/records/query`,
        {
          method: "POST",
          body: JSON.stringify(options),
        },
      );
    } catch (error) {
      throw new Error(`Failed to get Attio records: ${error.message}`);
    }
  }

  async getAttioListRecords(listId, options = {}) {
    try {
      console.log(`Attempting to fetch records from list: ${listId}`);
      console.log("Request options:", options);

      // Use the correct Attio API endpoint for list entries
      // POST /lists/{list}/entries/query with proper request body
      const requestBody = {
        limit: options.limit || 100,
        offset: options.offset || 0,
        // Add any filters if provided
        ...(options.filter && { filter: options.filter }),
        // Add any sorts if provided
        ...(options.sorts && { sorts: options.sorts }),
      };

      console.log("Making request to /lists/" + listId + "/entries/query");
      console.log("Request body:", JSON.stringify(requestBody, null, 2));

      const response = await this.makeRequest(
        "attio",
        `/lists/${listId}/entries/query`,
        {
          method: "POST",
          body: JSON.stringify(requestBody),
        },
      );
      console.log("List records response:", response);
      return response;
    } catch (error) {
      console.error(`Failed to get Attio list records from ${listId}:`, error);
      console.error("Full error details:", {
        message: error.message,
        status: error.status,
        response: error.response,
        stack: error.stack,
      });
      throw new Error(`Failed to get Attio list records: ${error.message}`);
    }
  }

  // Get object attributes (fields) from Attio
  async getAttioObjectAttributes(objectId) {
    try {
      return await this.makeRequest("attio", `/objects/${objectId}/attributes`);
    } catch (error) {
      throw new Error(
        `Failed to get Attio object attributes: ${error.message}`,
      );
    }
  }

  // Get a specific company record by ID from Attio
  async getAttioCompanyRecord(companyId) {
    try {
      return await this.makeRequest(
        "attio",
        `/objects/companies/records/${companyId}`,
      );
    } catch (error) {
      throw new Error(`Failed to get Attio company record: ${error.message}`);
    }
  }

  // Generic method to fetch any object record by type and ID
  async getAttioObjectRecord(objectType, recordId) {
    try {
      return await this.makeRequest(
        "attio",
        `/objects/${objectType}/records/${recordId}`,
      );
    } catch (error) {
      throw new Error(
        `Failed to get Attio ${objectType} record: ${error.message}`,
      );
    }
  }

  // Get service information
  async getServiceInfo(service) {
    const connection = this.getConnection(service);
    if (!connection) return null;

    try {
      if (service === "attio") {
        return await this.getAttioObjects();
      } else if (service === "airtable") {
        return await this.makeRequest("airtable", "/meta/tables");
      }
    } catch (error) {
      console.warn(`Failed to get ${service} info:`, error.message);
      return null;
    }
  }

  // Clear all connections
  clearAllConnections() {
    this.connections = { attio: null, airtable: null };
    localStorage.removeItem("attio_connection");
    localStorage.removeItem("airtable_connection");
  }
  // Create a new field in an Airtable table
  async createAirtableField(tableId, fieldConfig) {
    try {
      const airtableConnection = this.getConnection("airtable");
      if (!airtableConnection) {
        throw new Error("No Airtable connection found");
      }

      // Use the meta API to create fields
      const response = await this.makeRequest(
        "airtable",
        `/meta/bases/${airtableConnection.baseId}/tables/${tableId}/fields`,
        {
          method: "POST",
          body: JSON.stringify(fieldConfig),
        },
      );

      console.log(`Created Airtable field:`, response);
      return response;
    } catch (error) {
      console.error("Failed to create Airtable field:", error);
      throw new Error(`Failed to create Airtable field: ${error.message}`);
    }
  }
}

export default new TokenAuthService();
