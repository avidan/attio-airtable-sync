import tokenAuthService from "./tokenAuthService.js";

class SyncService {
  constructor(connections, fieldMappings, syncConfig) {
    this.connections = connections || {};
    this.fieldMappings = fieldMappings || [];
    this.syncConfig = syncConfig || {};

    console.log("SyncService initialized with:", {
      connections: connections,
      fieldMappings: this.fieldMappings.length,
      syncDirection: this.syncConfig.syncDirection,
    });

    // Verify we have valid connections
    if (
      !this.connections.attio?.connected ||
      !this.connections.airtable?.connected
    ) {
      console.warn(
        "Connections not yet established - sync will be available once both services are connected",
      );
    }

    this.onProgress = () => {};
    this.onLog = () => {};
    this.onStats = () => {};

    this.stats = { created: 0, updated: 0, skipped: 0, errors: 0 };
  }

  async performSync() {
    this.log("info", "Starting sync process...");

    try {
      // Verify connections before sync
      if (
        !this.connections.attio?.connected ||
        !this.connections.airtable?.connected
      ) {
        throw new Error(
          "Both Attio and Airtable must be connected before syncing",
        );
      }

      if (this.syncConfig.createBackups) {
        await this.createBackups();
      }

      switch (this.syncConfig.syncDirection) {
        case "bidirectional":
          await this.syncBidirectional();
          break;
        case "attio-to-airtable":
          await this.syncAttioToAirtable();
          break;
        case "airtable-to-attio":
          await this.syncAirtableToAttio();
          break;
        default:
          throw new Error(
            `Unknown sync direction: ${this.syncConfig.syncDirection}`,
          );
      }

      this.log("success", `Sync completed: ${JSON.stringify(this.stats)}`);
      this.onStats(this.stats);
    } catch (error) {
      this.log("error", `Sync failed: ${error.message}`);
      throw error;
    }
  }

  log(level, message) {
    const logEntry = { level, message, timestamp: new Date() };
    console.log(`[${level.toUpperCase()}] ${message}`);
    this.onLog(logEntry);
  }

  updateProgress(current, total, message) {
    const progress = Math.round((current / total) * 100);
    this.onProgress({ current, total, progress, message });
  }

  updateConfig(config) {
    this.syncConfig = { ...this.syncConfig, ...config };
    console.log("Updated sync config:", this.syncConfig);
  }

  updateConnections(connections) {
    this.connections = connections || {};
    console.log("Updated connections:", this.connections);
  }

  updateFieldMappings(mappings) {
    this.fieldMappings = mappings || [];
    console.log("Updated field mappings:", this.fieldMappings);
  }

  async createBackups() {
    this.log("info", "Creating backups before sync...");
    // TODO: Implement backup logic
    await this.delay(1000); // Placeholder
    this.log("success", "Backups created successfully");
  }

  async syncBidirectional() {
    this.log("info", "Performing bidirectional sync...");

    // First sync from Attio to Airtable for new/updated records
    await this.syncAttioToAirtable();

    // Then sync from Airtable to Attio for new/updated records
    await this.syncAirtableToAttio();
  }

  async syncAttioToAirtable() {
    this.log("info", "Syncing from Attio to Airtable...");

    try {
      // Fetch records from Attio
      const attioRecords = await this.fetchAttioRecords();
      this.log("info", `Fetched ${attioRecords.length} records from Attio`);

      // Process each record
      for (let i = 0; i < attioRecords.length; i++) {
        this.updateProgress(i + 1, attioRecords.length, "Processing records");
        await this.syncRecordToAirtable(attioRecords[i]);
        await this.delay(this.syncConfig.rateLimitDelay || 100);
      }

      this.log("success", "Attio to Airtable sync completed");
    } catch (error) {
      this.log(
        "error",
        `Failed to sync from Attio to Airtable: ${error.message}`,
      );
      throw error;
    }
  }

  async syncAirtableToAttio() {
    this.log("info", "Syncing from Airtable to Attio...");

    try {
      // Fetch records from Airtable
      const airtableRecords = await this.fetchAirtableRecords();
      this.log(
        "info",
        `Fetched ${airtableRecords.length} records from Airtable`,
      );

      // Process each record
      for (let i = 0; i < airtableRecords.length; i++) {
        this.updateProgress(
          i + 1,
          airtableRecords.length,
          "Processing records",
        );
        await this.syncRecordToAttio(airtableRecords[i]);
        await this.delay(this.syncConfig.rateLimitDelay || 100);
      }

      this.log("success", "Airtable to Attio sync completed");
    } catch (error) {
      this.log(
        "error",
        `Failed to sync from Airtable to Attio: ${error.message}`,
      );
      throw error;
    }
  }

  async fetchAttioRecords() {
    try {
      // Try to get connection from passed connections first, then fall back to tokenAuthService
      let attioConnection = this.connections?.attio;
      if (!attioConnection?.token) {
        attioConnection = tokenAuthService.getConnection("attio");
        if (!attioConnection?.token) {
          throw new Error("Attio connection not available");
        }
      }

      this.log(
        "info",
        `Sync config: ${JSON.stringify({
          attioObjectType: this.syncConfig.attioObjectType,
          attioObjectId: this.syncConfig.attioObjectId,
          parentObjectType: this.syncConfig.parentObjectType,
        })}`,
      );

      // For lists, we need to query the underlying object type with a filter for the list
      let endpoint;
      let queryParams = "";

      if (this.syncConfig.attioObjectType === "list") {
        // For lists, we need to:
        // 1. First fetch the list entries
        // 2. Then fetch the parent companies using the parent_record_ids

        const listId =
          this.syncConfig.attioListId || "ac8237a5-d6fe-46cb-9cce-e330d9e33555";

        this.log(
          "info",
          `Fetching list entries for list "${this.syncConfig.attioObjectId}" (${listId})`,
        );

        // First, fetch the list entries
        const listEntriesEndpoint = `https://api.attio.com/v2/lists/${listId}/entries/query`;
        const listEntriesResponse = await fetch(listEntriesEndpoint, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${attioConnection.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        });

        if (!listEntriesResponse.ok) {
          const error = await listEntriesResponse.text();
          throw new Error(`Failed to fetch list entries: ${error}`);
        }

        const entriesData = await listEntriesResponse.json();
        const entries = entriesData.data || [];

        this.log("info", `Found ${entries.length} entries in the list`);

        if (entries.length === 0) {
          return [];
        }

        // Extract parent record IDs
        const parentRecordIds = entries.map((entry) => entry.parent_record_id);

        // Now fetch the actual company records
        const parentObjectType =
          this.syncConfig.parentObjectType || "companies";
        endpoint = `https://api.attio.com/v2/objects/${parentObjectType}/records/query`;

        this.usePostQuery = true;
        this.queryBody = {
          filter: {
            record_id: {
              $in: parentRecordIds,
            },
          },
        };

        this.log(
          "info",
          `Fetching ${parentRecordIds.length} companies from list entries`,
        );
        this.log("debug", `Company IDs: ${parentRecordIds.join(", ")}`);
      } else {
        // For objects, fetch records directly
        endpoint = `https://api.attio.com/v2/objects/${this.syncConfig.attioObjectId}/records`;
      }

      this.log(
        "info",
        `Fetching records from Attio: ${endpoint}${this.usePostQuery ? " (POST)" : queryParams}`,
      );

      const fetchOptions = {
        method: this.usePostQuery ? "POST" : "GET",
        headers: {
          Authorization: `Bearer ${attioConnection.token}`,
          "Content-Type": "application/json",
        },
      };

      // Add body for POST requests
      if (this.usePostQuery && this.queryBody) {
        fetchOptions.body = JSON.stringify(this.queryBody);
        this.log("debug", `Query body: ${JSON.stringify(this.queryBody)}`);
      }

      const response = await fetch(
        `${endpoint}${!this.usePostQuery ? queryParams : ""}`,
        fetchOptions,
      );

      if (!response.ok) {
        const errorText = await response.text();
        this.log("error", `Attio API error: ${response.status} - ${errorText}`);
        throw new Error(`Failed to fetch Attio records: ${response.status}`);
      }

      const data = await response.json();
      const recordCount = data.data?.length || 0;

      this.log("info", `Fetched ${recordCount} records from Attio`);

      if (recordCount === 0) {
        this.log(
          "warning",
          `No records found with list_entries filter. This might mean:
          1. The list ID 'ac8237a5-d6fe-46cb-9cce-e330d9e33555' doesn't match any records
          2. The filter field 'target_record_id' might not be the correct field
          3. Companies aren't actually in this list yet`,
        );
        this.log("debug", `Filter used: ${JSON.stringify(this.queryBody)}`);
      } else {
        this.log(
          "debug",
          `First record sample: ${JSON.stringify(data.data[0])}`,
        );
      }

      // Reset query flags
      this.usePostQuery = false;
      this.queryBody = null;

      return data.data || [];
    } catch (error) {
      this.log("error", `Error fetching Attio records: ${error.message}`);
      // Reset query flags on error too
      this.usePostQuery = false;
      this.queryBody = null;
      throw error;
    }
  }

  async fetchAirtableRecords() {
    try {
      // Try to get connection from passed connections first, then fall back to tokenAuthService
      let airtableConnection = this.connections?.airtable;
      if (!airtableConnection?.token || !airtableConnection?.baseId) {
        airtableConnection = tokenAuthService.getConnection("airtable");
        if (!airtableConnection?.token || !airtableConnection?.baseId) {
          throw new Error("Airtable connection not available");
        }
      }

      const tableId =
        this.syncConfig.airtableTableId || this.syncConfig.airtableTable;
      if (!tableId) {
        throw new Error("Airtable table ID not configured");
      }

      const endpoint = `https://api.airtable.com/v0/${airtableConnection.baseId}/${tableId}`;
      this.log("info", `Fetching records from Airtable: ${endpoint}`);

      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${airtableConnection.token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch Airtable records: ${response.status}`);
      }

      const data = await response.json();
      this.log(
        "info",
        `Fetched ${data.records?.length || 0} records from Airtable`,
      );
      return data.records || [];
    } catch (error) {
      this.log("error", `Error fetching Airtable records: ${error.message}`);
      throw error;
    }
  }

  async syncRecordToAirtable(attioRecord) {
    try {
      const mappedRecord = this.mapAttioToAirtable(attioRecord);

      if (this.syncConfig.updateExisting) {
        // Check if record exists
        const existingRecord = await this.findAirtableRecord(mappedRecord);
        if (existingRecord) {
          await this.updateAirtableRecord(existingRecord.id, mappedRecord);
          this.stats.updated++;
          this.log("info", `Updated record: ${mappedRecord.id}`);
          return;
        }
      }

      if (this.syncConfig.createNew) {
        await this.createAirtableRecord(mappedRecord);
        this.stats.created++;
        this.log(
          "info",
          `Created new record: ${mappedRecord.Company || mappedRecord.Name || "Unknown"}`,
        );
      } else {
        this.stats.skipped++;
      }
    } catch (error) {
      this.stats.errors++;
      this.log("error", `Failed to sync record: ${error.message}`);
      if (this.syncConfig.stopOnError) {
        throw error;
      }
    }
  }

  async syncRecordToAttio(airtableRecord) {
    try {
      const mappedRecord = this.mapAirtableToAttio(airtableRecord);

      if (this.syncConfig.updateExisting) {
        // Check if record exists
        const existingRecord = await this.findAttioRecord(mappedRecord);
        if (existingRecord) {
          await this.updateAttioRecord(existingRecord.id, mappedRecord);
          this.stats.updated++;
          this.log("info", `Updated record: ${mappedRecord.id}`);
          return;
        }
      }

      if (this.syncConfig.createNew) {
        await this.createAttioRecord(mappedRecord);
        this.stats.created++;
        this.log("info", `Created new record: ${mappedRecord.id}`);
      } else {
        this.stats.skipped++;
      }
    } catch (error) {
      this.stats.errors++;
      this.log("error", `Failed to sync record: ${error.message}`);
      if (this.syncConfig.stopOnError) {
        throw error;
      }
    }
  }

  mapAttioToAirtable(attioRecord) {
    const mapped = {};

    // Log the incoming record structure
    this.log(
      "debug",
      `Attio record structure: ${JSON.stringify(attioRecord).substring(0, 500)}`,
    );
    this.log("debug", `Field mappings: ${JSON.stringify(this.fieldMappings)}`);

    // Helper function to extract value from Attio's nested structure
    const extractAttioValue = (record, fieldName) => {
      // Check if the field exists in values
      if (record.values && record.values[fieldName]) {
        const fieldData = record.values[fieldName];

        // Handle arrays of values (Attio's typical structure)
        if (Array.isArray(fieldData) && fieldData.length > 0) {
          const firstValue = fieldData[0];

          // Extract based on field type
          if (firstValue.value !== undefined) {
            return firstValue.value;
          } else if (firstValue.domain) {
            return firstValue.domain;
          } else if (firstValue.email_address) {
            return firstValue.email_address;
          } else if (firstValue.original_url) {
            return firstValue.original_url;
          } else if (firstValue.option) {
            // For select fields, return the title
            return firstValue.option.title;
          } else if (firstValue.target_object && firstValue.target_record_id) {
            // For reference fields, return the display value or ID
            return (
              firstValue.referenced_actor_name || firstValue.target_record_id
            );
          } else if (firstValue.locality || firstValue.region) {
            // For location fields, combine locality and region
            return `${firstValue.locality || ""}, ${firstValue.region || ""}`
              .trim()
              .replace(/^,\s*/, "");
          } else if (
            typeof firstValue === "string" ||
            typeof firstValue === "number"
          ) {
            // Direct value
            return firstValue;
          }
        } else if (Array.isArray(fieldData)) {
          // Empty array - return undefined
          return undefined;
        } else if (
          typeof fieldData === "string" ||
          typeof fieldData === "number" ||
          typeof fieldData === "boolean"
        ) {
          // Direct value (not in array)
          return fieldData;
        }
      }
      return undefined;
    };

    for (const mapping of this.fieldMappings) {
      // Check if mapping should be used (handle both with and without 'enabled' field)
      const isEnabled = mapping.enabled !== false;

      if (isEnabled && mapping.attioField && mapping.airtableField) {
        // Handle both field objects and string field names
        // For Attio fields, the ID is the api_slug that we need to use
        const attioFieldName =
          typeof mapping.attioField === "object"
            ? mapping.attioField.id || // This is actually the api_slug from the field loading
              mapping.attioField.slug ||
              mapping.attioField.name
            : mapping.attioField;
        const airtableFieldName =
          typeof mapping.airtableField === "object"
            ? mapping.airtableField.name || mapping.airtableField.id
            : mapping.airtableField;

        this.log("debug", `Mapping ${attioFieldName} -> ${airtableFieldName}`);

        const value = extractAttioValue(attioRecord, attioFieldName);
        this.log("debug", `Extracted value for ${attioFieldName}: ${value}`);

        if (value !== undefined && value !== null && value !== "") {
          mapped[airtableFieldName] = this.transformValue(
            value,
            mapping.transformations,
            "toAirtable",
          );
          this.log(
            "debug",
            `Mapped ${airtableFieldName} = ${mapped[airtableFieldName]}`,
          );
        }
      }
    }

    this.log("info", `Final mapped record: ${JSON.stringify(mapped)}`);
    return mapped;
  }

  mapAirtableToAttio(airtableRecord) {
    const mapped = {};

    for (const mapping of this.fieldMappings) {
      if (mapping.enabled && mapping.attioField && mapping.airtableField) {
        const value = airtableRecord.fields?.[mapping.airtableField];
        if (value !== undefined) {
          mapped[mapping.attioField] = this.transformValue(
            value,
            mapping.transformations,
            "toAttio",
          );
        }
      }
    }

    return mapped;
  }

  getNestedValue(obj, path) {
    return path.split(".").reduce((curr, prop) => curr?.[prop], obj);
  }

  transformValue(value, transformations, direction) {
    if (!transformations || transformations.length === 0) {
      return value;
    }

    let transformedValue = value;

    for (const transform of transformations) {
      switch (transform.type) {
        case "uppercase":
          transformedValue = String(transformedValue).toUpperCase();
          break;
        case "lowercase":
          transformedValue = String(transformedValue).toLowerCase();
          break;
        case "trim":
          transformedValue = String(transformedValue).trim();
          break;
        case "dateFormat":
          if (transform.format) {
            // TODO: Implement date formatting
            transformedValue = new Date(transformedValue).toISOString();
          }
          break;
        case "numberFormat":
          transformedValue = Number(transformedValue);
          break;
        case "boolean":
          transformedValue = Boolean(transformedValue);
          break;
        case "custom":
          if (transform.function) {
            try {
              // Safely evaluate custom transformation
              const func = new Function("value", transform.function);
              transformedValue = func(transformedValue);
            } catch (error) {
              console.error("Custom transformation error:", error);
            }
          }
          break;
        default:
          break;
      }
    }

    return transformedValue;
  }

  async findAirtableRecord(mappedRecord) {
    // TODO: Implement record matching logic
    // This would typically use a unique identifier field
    return null;
  }

  async findAttioRecord(mappedRecord) {
    // TODO: Implement record matching logic
    // This would typically use a unique identifier field
    return null;
  }

  async createAirtableRecord(record) {
    try {
      // Try to get connection from passed connections first, then fall back to tokenAuthService
      let airtableConnection = this.connections?.airtable;
      if (!airtableConnection?.token || !airtableConnection?.baseId) {
        airtableConnection = tokenAuthService.getConnection("airtable");
        if (!airtableConnection?.token || !airtableConnection?.baseId) {
          throw new Error("Airtable connection not available");
        }
      }

      const tableId =
        this.syncConfig.airtableTableId || this.syncConfig.airtableTable;
      const endpoint = `https://api.airtable.com/v0/${airtableConnection.baseId}/${tableId}`;

      // Log what we're about to send
      const requestBody = {
        fields: record,
      };
      this.log(
        "info",
        `Creating Airtable record with data: ${JSON.stringify(requestBody)}`,
      );

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${airtableConnection.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const error = await response.text();
        this.log("error", `Airtable API error response: ${error}`);
        throw new Error(`Failed to create Airtable record: ${error}`);
      }

      const result = await response.json();
      this.log("success", `Created Airtable record: ${result.id}`);
      return result;
    } catch (error) {
      this.log("error", `Error creating Airtable record: ${error.message}`);
      throw error;
    }
  }

  async updateAirtableRecord(id, record) {
    try {
      // Try to get connection from passed connections first, then fall back to tokenAuthService
      let airtableConnection = this.connections?.airtable;
      if (!airtableConnection?.token || !airtableConnection?.baseId) {
        airtableConnection = tokenAuthService.getConnection("airtable");
        if (!airtableConnection?.token || !airtableConnection?.baseId) {
          throw new Error("Airtable connection not available");
        }
      }

      const tableId =
        this.syncConfig.airtableTableId || this.syncConfig.airtableTable;
      const endpoint = `https://api.airtable.com/v0/${airtableConnection.baseId}/${tableId}/${id}`;

      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${airtableConnection.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fields: record,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to update Airtable record: ${error}`);
      }

      return await response.json();
    } catch (error) {
      this.log("error", `Error updating Airtable record: ${error.message}`);
      throw error;
    }
  }

  async createAttioRecord(record) {
    try {
      const attioConnection = tokenAuthService.getConnection("attio");
      if (!attioConnection?.token) {
        throw new Error("Attio connection not available");
      }

      let endpoint;
      if (this.syncConfig.attioObjectType === "list") {
        endpoint = `https://api.attio.com/v2/lists/${this.syncConfig.attioObjectId}/entries`;
      } else {
        endpoint = `https://api.attio.com/v2/objects/${this.syncConfig.attioObjectId}/records`;
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${attioConnection.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: {
            values: record,
          },
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to create Attio record: ${error}`);
      }

      return await response.json();
    } catch (error) {
      this.log("error", `Error creating Attio record: ${error.message}`);
      throw error;
    }
  }

  async updateAttioRecord(id, record) {
    try {
      const attioConnection = tokenAuthService.getConnection("attio");
      if (!attioConnection?.token) {
        throw new Error("Attio connection not available");
      }

      let endpoint;
      if (this.syncConfig.attioObjectType === "list") {
        endpoint = `https://api.attio.com/v2/lists/${this.syncConfig.attioObjectId}/entries/${id}`;
      } else {
        endpoint = `https://api.attio.com/v2/objects/${this.syncConfig.attioObjectId}/records/${id}`;
      }

      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${attioConnection.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: {
            values: record,
          },
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to update Attio record: ${error}`);
      }

      return await response.json();
    } catch (error) {
      this.log("error", `Error updating Attio record: ${error.message}`);
      throw error;
    }
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export default SyncService;
