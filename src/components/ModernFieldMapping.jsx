import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  ArrowRight,
  Trash2,
  Plus,
  Sparkles,
  Target,
  Database,
  MapPin,
  CheckCircle,
} from "lucide-react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Badge,
  Alert,
  ProgressBar,
  Modal,
} from "react-bootstrap";
import toast from "react-hot-toast";
import tokenAuthService from "../services/tokenAuthService";

export default function ModernFieldMapping({
  connections,
  fieldMappings,
  setFieldMappings,
  onNext,
  onBack,
}) {
  const [attioFields, setAttioFields] = useState([]);
  const [airtableFields, setAirtableFields] = useState([]);
  const [loading, setLoading] = useState(false);
  const [autoMapping, setAutoMapping] = useState(false);
  const [selectedAttioObject, setSelectedAttioObject] = useState("");
  const [selectedAirtableTable, setSelectedAirtableTable] = useState("");
  const [attioObjects, setAttioObjects] = useState([]);
  const [airtableTables, setAirtableTables] = useState([]);
  const [progress, setProgress] = useState(0);
  const [showNewFieldModal, setShowNewFieldModal] = useState(false);
  const [newFieldData, setNewFieldData] = useState({
    attioField: null,
    name: "",
    type: "singleLineText",
    description: "",
  });
  const [unmappedAttioFields, setUnmappedAttioFields] = useState([]);

  // Airtable field types for dropdown
  const airtableFieldTypes = [
    { value: "singleLineText", label: "Single line text" },
    { value: "multilineText", label: "Long text" },
    { value: "email", label: "Email" },
    { value: "url", label: "URL" },
    { value: "phoneNumber", label: "Phone number" },
    { value: "number", label: "Number" },
    { value: "currency", label: "Currency" },
    { value: "percent", label: "Percent" },
    { value: "date", label: "Date" },
    { value: "dateTime", label: "Date with time" },
    { value: "checkbox", label: "Checkbox" },
    { value: "singleSelect", label: "Single select" },
    { value: "multipleSelects", label: "Multiple select" },
    { value: "rating", label: "Rating" },
  ];

  // Function to detect unmapped Attio fields
  const detectUnmappedFields = () => {
    if (!attioFields.length || !airtableFields.length) return;

    const mappedAttioFieldIds = fieldMappings
      .filter((mapping) => mapping.attioField)
      .map((mapping) => mapping.attioField.id);

    const unmapped = attioFields.filter(
      (field) => !mappedAttioFieldIds.includes(field.id),
    );

    setUnmappedAttioFields(unmapped);
  };

  // Function to suggest Airtable field type based on Attio field type
  const suggestAirtableFieldType = (attioFieldType) => {
    const typeMapping = {
      "email-address": "email",
      "phone-number": "phoneNumber",
      url: "url",
      text: "singleLineText",
      "single-line-text": "singleLineText",
      "multi-line-text": "multilineText",
      number: "number",
      currency: "currency",
      date: "date",
      datetime: "dateTime",
      checkbox: "checkbox",
      select: "singleSelect",
      status: "singleSelect",
      rating: "rating",
    };
    return typeMapping[attioFieldType] || "singleLineText";
  };

  // Function to create new Airtable field
  const createNewAirtableField = async () => {
    if (!newFieldData.name || !selectedAirtableTable) {
      toast.error("Please provide field name and select a table");
      return;
    }

    try {
      setLoading(true);

      // Prepare field configuration for Airtable API
      const fieldConfig = {
        name: newFieldData.name,
        type: newFieldData.type,
      };

      // Add additional configuration based on field type
      if (
        newFieldData.type === "singleSelect" ||
        newFieldData.type === "multipleSelects"
      ) {
        fieldConfig.options = {
          choices: [
            { name: "Option 1" },
            { name: "Option 2" },
            { name: "Option 3" },
          ],
        };
      }

      if (newFieldData.description) {
        fieldConfig.description = newFieldData.description;
      }

      // Create the field
      await tokenAuthService.createAirtableField(
        selectedAirtableTable,
        fieldConfig,
      );

      toast.success(`Created new field "${newFieldData.name}" in Airtable!`);

      // Reload fields to include the new one
      await loadFields();

      // Close modal and reset
      setShowNewFieldModal(false);
      setNewFieldData({
        attioField: null,
        name: "",
        type: "singleLineText",
        description: "",
      });
    } catch (error) {
      console.error("Failed to create field:", error);
      toast.error(`Failed to create field: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Function to open new field modal for specific Attio field
  const openNewFieldModal = (attioField) => {
    setNewFieldData({
      attioField: attioField,
      name: attioField.name,
      type: suggestAirtableFieldType(attioField.attioType),
      description:
        attioField.description || `Synced from Attio field: ${attioField.name}`,
    });
    setShowNewFieldModal(true);
  };

  // Load real Attio objects function
  const loadAttioObjects = async () => {
    try {
      console.log("Loading real Attio objects and lists...");

      // Load both objects and lists in parallel
      const [attioObjectsResponse, attioListsResponse] = await Promise.all([
        tokenAuthService.getAttioObjects(),
        tokenAuthService.getAttioLists(),
      ]);

      // Transform objects
      const attioObjectsList =
        attioObjectsResponse.data?.map((obj) => ({
          id: obj.api_slug || obj.id,
          name:
            obj.singular_noun || obj.plural_noun || obj.name || obj.api_slug,
          type: "object",
          category: "Objects",
          description: obj.description,
          apiSlug: obj.api_slug, // Store the actual API slug
        })) || [];

      // Transform lists
      const attioListsList =
        attioListsResponse.data?.map((list) => ({
          id: list.api_slug || list.id,
          name: list.name || list.api_slug,
          type: "list",
          category: "Lists",
          description: list.description,
        })) || [];

      // Combine objects and lists
      const allAttioItems = [...attioObjectsList, ...attioListsList];

      console.log(
        `Loaded ${attioObjectsList.length} objects and ${attioListsList.length} lists:`,
        allAttioItems,
      );
      console.log(
        "Available Attio objects with API slugs:",
        attioObjectsList.map((obj) => ({
          name: obj.name,
          id: obj.id,
          apiSlug: obj.apiSlug,
        })),
      );
      // Log detailed info about each object for debugging
      attioObjectsList.forEach((obj) => {
        console.log(
          `Attio Object - Name: "${obj.name}", ID: "${obj.id}", API Slug: "${obj.apiSlug}"`,
        );
      });
      setAttioObjects(allAttioItems);

      toast.success(
        `Loaded ${attioObjectsList.length} objects and ${attioListsList.length} lists`,
      );
    } catch (error) {
      console.error("Failed to load Attio objects and lists:", error);
      toast.error(`Failed to load Attio items: ${error.message}`);
      // Fall back to mock objects
      setAttioObjects([
        { id: "people", name: "People", type: "object", category: "Objects" },
        {
          id: "companies",
          name: "Companies",
          type: "object",
          category: "Objects",
        },
        { id: "deals", name: "Deals", type: "object", category: "Objects" },
      ]);
    }
  };

  // Load real Airtable tables function
  const loadAirtableTables = async () => {
    try {
      const airtableConnection = tokenAuthService.getConnection("airtable");
      if (!airtableConnection?.baseId || !airtableConnection?.token) {
        console.warn("Airtable connection not ready");
        return;
      }

      console.log("Loading real Airtable tables...");
      const response = await fetch(
        `https://api.airtable.com/v0/meta/bases/${airtableConnection.baseId}/tables`,
        {
          headers: {
            Authorization: `Bearer ${airtableConnection.token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to load tables: ${response.status}`);
      }

      const data = await response.json();
      console.log("Loaded Airtable tables:", data.tables);
      setAirtableTables(data.tables || []);
    } catch (error) {
      console.error("Error loading Airtable tables:", error);
      toast.error("Failed to load Airtable tables");
    }
  };

  // Load real Airtable tables when component mounts
  React.useEffect(() => {
    if (connections.attio?.connected) {
      loadAttioObjects();
    }
    if (connections.airtable?.connected) {
      loadAirtableTables();
    }
  }, [connections]);

  // Load real Airtable tables when component mounts
  useEffect(() => {
    const loadAirtableTables = async () => {
      try {
        const airtableConnection = tokenAuthService.getConnection("airtable");
        if (
          airtableConnection &&
          airtableConnection.baseId &&
          airtableConnection.token
        ) {
          console.log("Loading real Airtable tables...");

          const response = await fetch(
            `https://api.airtable.com/v0/meta/bases/${airtableConnection.baseId}/tables`,
            {
              headers: {
                Authorization: `Bearer ${airtableConnection.token}`,
                "Content-Type": "application/json",
              },
            },
          );

          if (!response.ok) {
            throw new Error(
              `Failed to fetch Airtable tables: ${response.status}`,
            );
          }

          const data = await response.json();
          const tables = data.tables.map((table) => ({
            id: table.id,
            name: table.name,
            description: table.description || "",
          }));

          setAirtableTables(tables);
          toast.success(
            `Loaded ${tables.length} Airtable tables from your base`,
          );
          console.log("Loaded Airtable tables:", tables);
        } else {
          console.log("No Airtable connection found, using default tables");
          toast.info("Using default Airtable tables - please check connection");
        }
      } catch (error) {
        console.error("Failed to load Airtable tables:", error);
        toast.error(`Failed to load Airtable tables: ${error.message}`);
        // Keep the default mock tables as fallback
      }
    };

    if (connections.airtable && connections.airtable.connected) {
      loadAirtableTables();
    }
  }, [connections]);

  // Automatically load fields when both Attio object and Airtable table are selected
  useEffect(() => {
    if (selectedAttioObject && selectedAirtableTable) {
      console.log("Both sources selected, auto-loading fields and mapping...");
      loadFields();
    }
  }, [selectedAttioObject, selectedAirtableTable]);

  const loadFields = async () => {
    if (!selectedAttioObject || !selectedAirtableTable) return;

    setLoading(true);
    try {
      // Load real Attio fields from API
      const selectedItem = attioObjects.find(
        (item) => item.id === selectedAttioObject,
      );
      const itemType = selectedItem?.type || "object";

      console.log(
        `Loading Attio fields for ${itemType}: ${selectedAttioObject}`,
      );

      let attioFieldsList = [];

      if (itemType === "list") {
        // For lists, we need to load both list-specific fields AND core object fields
        console.log("Loading fields for list - fetching list details first...");

        // Get list details to determine the underlying object type
        const listDetailsResponse =
          await tokenAuthService.getAttioListDetails(selectedAttioObject);
        const listDetails = listDetailsResponse.data;

        // Get list-specific fields
        const listFieldsResponse =
          await tokenAuthService.getAttioListFields(selectedAttioObject);
        const listFields = listFieldsResponse.data || [];

        // Get the parent object from the list details
        // The Attio API provides parent_object or workspace_object field
        let coreObjectType = null;

        if (listDetails) {
          console.log("List details:", JSON.stringify(listDetails, null, 2));

          // Try different possible fields for parent object reference
          // Check all possible fields that might contain the parent object
          if (listDetails.parent_object) {
            // parent_object can be an array with the object type as a string
            if (
              Array.isArray(listDetails.parent_object) &&
              listDetails.parent_object.length > 0
            ) {
              coreObjectType = listDetails.parent_object[0];
            } else if (typeof listDetails.parent_object === "object") {
              coreObjectType =
                listDetails.parent_object.api_slug ||
                listDetails.parent_object.id;
            } else if (typeof listDetails.parent_object === "string") {
              coreObjectType = listDetails.parent_object;
            }
            console.log("Found parent object from API:", coreObjectType);
          } else if (listDetails.workspace_object) {
            coreObjectType =
              listDetails.workspace_object.api_slug ||
              listDetails.workspace_object.id;
            console.log("Found workspace object from API:", coreObjectType);
          } else if (listDetails.object) {
            coreObjectType =
              listDetails.object.api_slug || listDetails.object.id;
            console.log("Found object from API:", coreObjectType);
          } else if (listDetails.parent_object_type) {
            coreObjectType = listDetails.parent_object_type;
            console.log("Found parent object type from API:", coreObjectType);
          } else {
            // If no explicit parent object, check if it's a standard list type
            // Standard Attio lists are typically for people or companies
            console.log(
              "No parent object found in list details, will use fallback logic",
            );
          }

          // Store the parent object type in the selected item for later use
          const selectedItemIndex = attioObjects.findIndex(
            (item) => item.id === selectedAttioObject,
          );
          if (selectedItemIndex >= 0 && coreObjectType) {
            // Try to find the actual API slug for the parent object
            // Look for an object that matches the parent object type
            const parentObject = attioObjects.find(
              (obj) =>
                obj.type === "object" &&
                (obj.id === coreObjectType ||
                  obj.apiSlug === coreObjectType ||
                  obj.name?.toLowerCase() === coreObjectType.toLowerCase() ||
                  obj.name?.toLowerCase() ===
                    coreObjectType.slice(0, -1).toLowerCase()), // Handle plural to singular
            );

            // Use the actual API slug if found, otherwise use the coreObjectType
            const actualApiSlug =
              parentObject?.apiSlug || parentObject?.id || coreObjectType;
            attioObjects[selectedItemIndex].parentObjectType = actualApiSlug;
            console.log(
              `Resolved parent object API slug: ${actualApiSlug} (from ${coreObjectType})`,
            );
          }
        }

        // If we couldn't determine from API, try to guess from name as fallback
        if (!coreObjectType) {
          const listName = (listDetails?.name || "").toLowerCase();
          if (
            listName.includes("people") ||
            listName.includes("person") ||
            listName.includes("contact") ||
            listName.includes("lead") ||
            listName.includes("prospect")
          ) {
            coreObjectType = "people";
          } else if (
            listName.includes("compan") ||
            listName.includes("account") ||
            listName.includes("organization") ||
            listName.includes("business")
          ) {
            coreObjectType = "companies";
          } else {
            // Default to people if we can't determine
            coreObjectType = "people";
          }
          console.log("Guessed parent object type:", coreObjectType);

          // Find the actual API slug for the guessed type
          const selectedItemIndex = attioObjects.findIndex(
            (item) => item.id === selectedAttioObject,
          );
          if (selectedItemIndex >= 0) {
            const parentObject = attioObjects.find(
              (obj) =>
                obj.type === "object" &&
                (obj.id === coreObjectType ||
                  obj.apiSlug === coreObjectType ||
                  obj.name?.toLowerCase() === coreObjectType.toLowerCase() ||
                  obj.name?.toLowerCase() ===
                    coreObjectType.slice(0, -1).toLowerCase()),
            );

            const actualApiSlug =
              parentObject?.apiSlug || parentObject?.id || coreObjectType;
            attioObjects[selectedItemIndex].parentObjectType = actualApiSlug;
            console.log(
              `Resolved parent object API slug for guessed type: ${actualApiSlug} (from ${coreObjectType})`,
            );
          }
        }

        console.log(`Determined core object type for list: ${coreObjectType}`);

        // Get the actual API slug for the core object
        const selectedItem = attioObjects.find(
          (item) => item.id === selectedAttioObject,
        );
        const actualApiSlugForFields =
          selectedItem?.parentObjectType || coreObjectType;

        // Get core object fields using the actual API slug
        let coreFields = [];
        try {
          console.log(
            `Loading fields for parent object with API slug: ${actualApiSlugForFields}`,
          );
          const coreFieldsResponse =
            await tokenAuthService.getAttioObjectFields(actualApiSlugForFields);
          coreFields = coreFieldsResponse.data || [];
          console.log(
            `Loaded ${coreFields.length} core fields from ${actualApiSlugForFields}`,
          );
        } catch (error) {
          console.warn(
            `Failed to load core ${actualApiSlugForFields} fields:`,
            error,
          );
        }

        // Combine list fields and core object fields, avoiding duplicates
        const allFields = [...listFields];
        const listFieldIds = new Set(listFields.map((f) => f.api_slug || f.id));

        // Add core fields that aren't already in the list fields
        coreFields.forEach((coreField) => {
          const fieldId = coreField.api_slug || coreField.id;
          if (!listFieldIds.has(fieldId)) {
            allFields.push({
              ...coreField,
              isCore: true, // Mark as core field for potential UI indication
            });
          }
        });

        console.log(
          `Combined fields: ${listFields.length} list fields + ${coreFields.filter((cf) => !listFieldIds.has(cf.api_slug || cf.id)).length} core fields = ${allFields.length} total`,
        );

        // Transform combined fields to our format
        attioFieldsList = allFields.map((field) => ({
          id: field.api_slug || field.id,
          name: field.title || field.name || field.api_slug,
          type: field.type || "text",
          attioType: field.type,
          description: field.description,
          isCore: field.isCore || false,
        }));
      } else {
        // For objects, load fields normally
        const attioFieldsResponse =
          await tokenAuthService.getAttioObjectFields(selectedAttioObject);

        // Transform Attio API response to our field format
        attioFieldsList =
          attioFieldsResponse.data?.map((field) => ({
            id: field.api_slug || field.id,
            name: field.title || field.name || field.api_slug,
            type: field.type || "text",
            attioType: field.type,
            description: field.description,
            isCore: true, // All object fields are considered core
          })) || [];
      }

      console.log(
        `Loaded ${attioFieldsList.length} real Attio ${itemType} fields:`,
        attioFieldsList,
      );

      // Load real Airtable fields for the selected table
      let airtableFieldsList = [];
      try {
        const airtableConnection = tokenAuthService.getConnection("airtable");
        if (
          airtableConnection &&
          airtableConnection.baseId &&
          airtableConnection.token
        ) {
          console.log(`Loading fields for table: ${selectedAirtableTable}`);

          const response = await fetch(
            `https://api.airtable.com/v0/meta/bases/${airtableConnection.baseId}/tables`,
            {
              headers: {
                Authorization: `Bearer ${airtableConnection.token}`,
                "Content-Type": "application/json",
              },
            },
          );

          if (!response.ok) {
            throw new Error(`Failed to fetch table schema: ${response.status}`);
          }

          const data = await response.json();
          console.log("Full Airtable API response:", data);

          const selectedTable = data.tables.find(
            (table) => table.id === selectedAirtableTable,
          );
          console.log("Selected table data:", selectedTable);

          if (selectedTable && selectedTable.fields) {
            // Log all fields before mapping to debug what we're getting
            console.log("Raw fields from API:", selectedTable.fields);
            console.log(
              `Total fields available: ${selectedTable.fields.length}`,
            );

            airtableFieldsList = selectedTable.fields.map((field, index) => {
              console.log(
                `Field ${index + 1}: ${field.name} (${field.type}) - ID: ${field.id}`,
              );
              return {
                id: field.id,
                name: field.name,
                type: field.type,
                description: field.description || "",
                options: field.options || null,
              };
            });

            console.log(
              `Successfully mapped ${airtableFieldsList.length} fields from ${selectedTable.name}:`,
              airtableFieldsList,
            );

            // Additional check to ensure we're not losing any fields
            if (airtableFieldsList.length !== selectedTable.fields.length) {
              console.error(
                "Field count mismatch! Expected:",
                selectedTable.fields.length,
                "Got:",
                airtableFieldsList.length,
              );
            }
          } else {
            console.error("Selected table or fields not found:", {
              selectedTable,
              hasFields: !!selectedTable?.fields,
            });
            throw new Error("Selected table not found or has no fields");
          }
        } else {
          throw new Error("No Airtable connection available");
        }
      } catch (airtableError) {
        console.error("Failed to load real Airtable fields:", airtableError);
        toast.error(`Failed to load Airtable fields: ${airtableError.message}`);

        // Fallback to mock fields
        airtableFieldsList = [
          { id: "fldEmail", name: "Email Address", type: "email" },
          { id: "fldFirstName", name: "First Name", type: "singleLineText" },
          { id: "fldLastName", name: "Last Name", type: "singleLineText" },
          { id: "fldCompany", name: "Company Name", type: "singleLineText" },
          { id: "fldPhone", name: "Phone Number", type: "phoneNumber" },
        ];
      }

      setAttioFields(attioFieldsList);
      setAirtableFields(airtableFieldsList);

      // Detect unmapped fields after a short delay to ensure state is updated
      setTimeout(() => {
        detectUnmappedFields();
      }, 100);

      const selectedTableName =
        airtableTables.find((t) => t.id === selectedAirtableTable)?.name ||
        "table";
      toast.success(
        `Fields loaded! ${attioFieldsList.length} Attio fields, ${airtableFieldsList.length} ${selectedTableName} fields`,
      );
    } catch (error) {
      console.error("Failed to load fields:", error);
      toast.error("Failed to load fields: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const autoMapFields = async () => {
    if (!attioFields.length || !airtableFields.length) return;

    setAutoMapping(true);
    setProgress(0);

    // Simulate AI processing with progress updates
    const progressSteps = [20, 40, 60, 80, 100];
    for (const step of progressSteps) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      setProgress(step);
    }

    const mappings = [];
    attioFields.forEach((attioField) => {
      const matchingAirtableField = airtableFields.find((airtableField) => {
        const attioName = attioField.name.toLowerCase().replace(/[^a-z]/g, "");
        const airtableName = airtableField.name
          .toLowerCase()
          .replace(/[^a-z]/g, "");
        return (
          airtableName.includes(attioName) ||
          attioName.includes(airtableName) ||
          (attioField.type === "email" && airtableField.type === "email")
        );
      });

      if (matchingAirtableField) {
        mappings.push({
          id: Date.now() + Math.random(),
          attioField: attioField,
          airtableField: matchingAirtableField,
          confidence: 0.9,
        });
      }
    });

    setFieldMappings(mappings);
    toast.success(`🤖 AI mapped ${mappings.length} fields automatically!`);

    setAutoMapping(false);
    setProgress(0);
  };

  const addManualMapping = () => {
    console.log("addManualMapping called");
    const newMapping = {
      id: Date.now(),
      attioField: null,
      airtableField: null,
      confidence: 0,
    };
    console.log("Creating new mapping:", newMapping);

    setFieldMappings((prev) => {
      const updated = [...prev, newMapping];
      console.log("Updated field mappings:", updated);
      return updated;
    });

    toast.success("Manual mapping added! Select fields to map them.");
  };

  const removeMapping = (id) => {
    setFieldMappings((prev) => prev.filter((mapping) => mapping.id !== id));
  };

  const updateMapping = (id, field, value) => {
    console.log("updateMapping called:", { id, field, value });
    setFieldMappings((prev) => {
      const updated = prev.map((mapping) =>
        mapping.id === id ? { ...mapping, [field]: value } : mapping,
      );
      console.log("Updated field mappings after update:", updated);
      return updated;
    });
  };

  return (
    <>
      <Container>
        {/* Professional Header */}
        <motion.div
          className="text-center mb-5"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.div
            className="bg-secondary-gradient rounded-4 d-inline-flex align-items-center justify-content-center mb-4 shadow"
            style={{ width: "80px", height: "80px" }}
            whileHover={{ scale: 1.05 }}
          >
            <MapPin className="text-white" size={40} />
          </motion.div>
          <h1 className="display-5 fw-bold text-dark mb-3">
            Smart Field Mapping
          </h1>
          <p className="lead text-muted mx-auto" style={{ maxWidth: "600px" }}>
            Configure how data flows between your Attio and Airtable fields
            using our AI-powered mapping suggestions for precise data
            synchronization.
          </p>
        </motion.div>

        {/* Object/Table Selection */}
        <Row className="g-4 mb-4">
          <Col>
            <Card className="professional-card border-0 shadow">
              <div className="bg-info-gradient text-white p-4">
                <div className="d-flex align-items-center">
                  <div className="bg-white bg-opacity-20 rounded-3 p-3 me-3">
                    <Database className="text-white" size={24} />
                  </div>
                  <div>
                    <h4 className="mb-1 fw-bold">Select Data Sources</h4>
                    <p className="mb-0 opacity-75">
                      Choose objects and tables to map
                    </p>
                  </div>
                </div>
              </div>

              <Card.Body className="p-4">
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold text-dark">
                        Attio Object <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Select
                        value={selectedAttioObject}
                        onChange={(e) => setSelectedAttioObject(e.target.value)}
                        className="form-control-professional"
                      >
                        <option value="">Select an object or list...</option>
                        {/* Group by category */}
                        {["Objects", "Lists"].map((category) => {
                          const items = attioObjects.filter(
                            (item) => item.category === category,
                          );
                          if (items.length === 0) return null;

                          return (
                            <optgroup key={category} label={category}>
                              {items.map((item) => (
                                <option key={item.id} value={item.id}>
                                  {item.name}
                                </option>
                              ))}
                            </optgroup>
                          );
                        })}
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold text-dark">
                        Airtable Table <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Select
                        value={selectedAirtableTable}
                        onChange={(e) =>
                          setSelectedAirtableTable(e.target.value)
                        }
                        className="form-control-professional"
                      >
                        <option value="">Select a table...</option>
                        {airtableTables.map((table) => (
                          <option key={table.id} value={table.id}>
                            {table.name}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Button
                  onClick={loadFields}
                  disabled={
                    !selectedAttioObject || !selectedAirtableTable || loading
                  }
                  size="lg"
                  className="btn-professional btn-professional-primary w-100"
                >
                  {loading ? (
                    <>
                      <div className="spinner-border spinner-border-sm me-2" />
                      Loading Fields...
                    </>
                  ) : (
                    <>
                      <Database size={20} className="me-2" />
                      Load Fields
                    </>
                  )}
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* AI Mapping Controls */}
        {attioFields.length > 0 && airtableFields.length > 0 && (
          <Row className="g-4 mb-4">
            <Col>
              <Card className="professional-card border-0 shadow text-center">
                <div className="bg-warning-gradient text-dark p-4">
                  <div className="d-flex align-items-center justify-content-center">
                    <div className="bg-white bg-opacity-20 rounded-3 p-3 me-3">
                      <Sparkles className="text-dark" size={24} />
                    </div>
                    <div>
                      <h4 className="mb-1 fw-bold">AI Field Mapping</h4>
                      <p className="mb-0 opacity-75">
                        Intelligent field analysis and suggestions
                      </p>
                    </div>
                  </div>
                </div>

                <Card.Body className="p-4">
                  <p className="text-muted mb-4">
                    Let our AI analyze your fields and suggest intelligent
                    mappings based on names, types, and patterns
                  </p>

                  {autoMapping && (
                    <div className="mb-4">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <small className="text-muted">
                          AI Processing Progress
                        </small>
                        <small className="text-muted">{progress}%</small>
                      </div>
                      <ProgressBar
                        now={progress}
                        className="progress-professional"
                        style={{ height: "8px" }}
                      />
                    </div>
                  )}

                  <Button
                    onClick={autoMapFields}
                    disabled={
                      !attioFields.length ||
                      !airtableFields.length ||
                      autoMapping
                    }
                    size="lg"
                    className="btn-professional px-5 py-3"
                    style={{
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      border: "none",
                      color: "white",
                    }}
                  >
                    {autoMapping ? (
                      <>
                        <div className="spinner-border spinner-border-sm me-2" />
                        AI is analyzing fields...
                      </>
                    ) : (
                      <>
                        <Bot size={20} className="me-2" />
                        🤖 Auto Map with AI
                      </>
                    )}
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

        {/* Debug Information */}
        {(attioFields.length > 0 || airtableFields.length > 0) && (
          <Row className="g-4 mb-4">
            <Col>
              <Alert variant="info" className="mb-0">
                <h6>Debug Information</h6>
                <small>
                  <strong>Attio Fields Loaded:</strong> {attioFields.length}
                  <br />
                  <strong>Airtable Fields Loaded:</strong>{" "}
                  {airtableFields.length}
                  <br />
                  <strong>Selected Airtable Table ID:</strong>{" "}
                  {selectedAirtableTable}
                </small>
                {airtableFields.length > 0 && (
                  <details className="mt-2">
                    <summary>
                      <small>Show All Airtable Fields</small>
                    </summary>
                    <ul className="mt-2 mb-0 small">
                      {airtableFields.map((field, index) => (
                        <li key={field.id}>
                          {index + 1}. <strong>{field.name}</strong> (
                          {field.type}) - ID: {field.id}
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
              </Alert>
            </Col>
          </Row>
        )}

        {/* Add Manual Mapping Button - Always Available */}
        {attioFields.length > 0 && airtableFields.length > 0 && (
          <Row className="g-4 mb-4">
            <Col>
              <Card className="professional-card border-0 shadow text-center">
                <Card.Body className="p-4">
                  <h5 className="mb-3">Create Field Mappings</h5>
                  <p className="text-muted mb-4">
                    Use AI to automatically map fields, or create manual
                    mappings between your Attio and Airtable fields.
                  </p>
                  <div className="d-grid gap-2 d-md-flex justify-content-md-center">
                    <Button
                      onClick={autoMapFields}
                      disabled={autoMapping}
                      variant="primary"
                      className="btn-professional"
                    >
                      {autoMapping ? (
                        <>
                          <div className="spinner-border spinner-border-sm me-2" />
                          AI Mapping...
                        </>
                      ) : (
                        <>
                          <Bot size={16} className="me-2" />
                          AI Auto-Map Fields
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={addManualMapping}
                      variant="outline-primary"
                      className="btn-professional"
                    >
                      <Plus size={16} className="me-2" />
                      Add Manual Mapping
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

        {/* Field Mappings */}
        {fieldMappings.length > 0 && (
          <Row className="g-4 mb-4">
            <Col>
              <Card className="professional-card border-0 shadow">
                <div className="bg-success-gradient text-white p-4">
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center">
                      <div className="bg-white bg-opacity-20 rounded-3 p-3 me-3">
                        <Target className="text-white" size={24} />
                      </div>
                      <div>
                        <h4 className="mb-1 fw-bold">Field Mappings</h4>
                        <p className="mb-0 opacity-75">
                          Configure data flow between systems
                        </p>
                      </div>
                    </div>
                    <Badge
                      bg="light"
                      text="dark"
                      className="badge-professional"
                    >
                      {fieldMappings.length} mappings configured
                    </Badge>
                  </div>
                </div>

                <Card.Body className="p-4">
                  <div className="d-grid gap-3">
                    {fieldMappings.map((mapping, index) => (
                      <motion.div
                        key={mapping.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="border rounded-3 p-3 bg-light bg-opacity-50"
                      >
                        <Row className="align-items-center">
                          <Col md={5}>
                            <Form.Select
                              value={mapping.attioField?.id || ""}
                              onChange={(e) => {
                                const field = attioFields.find(
                                  (f) => f.id === e.target.value,
                                );
                                updateMapping(mapping.id, "attioField", field);
                              }}
                              className="form-control-professional"
                              size="sm"
                            >
                              <option value="">Select Attio field...</option>
                              {attioFields.map((field) => (
                                <option key={field.id} value={field.id}>
                                  {field.name} ({field.type})
                                  {field.isCore === false ? " [List]" : ""}
                                </option>
                              ))}
                            </Form.Select>
                          </Col>

                          <Col md={2} className="text-center">
                            <ArrowRight className="text-primary" size={20} />
                          </Col>

                          <Col md={5}>
                            <div className="d-flex align-items-center gap-2">
                              <Form.Select
                                value={mapping.airtableField?.id || ""}
                                onChange={(e) => {
                                  const field = airtableFields.find(
                                    (f) => f.id === e.target.value,
                                  );
                                  updateMapping(
                                    mapping.id,
                                    "airtableField",
                                    field,
                                  );
                                }}
                                className="form-control-professional"
                                size="sm"
                              >
                                <option value="">
                                  Select Airtable field...
                                </option>
                                {console.log(
                                  "Rendering airtableFields in dropdown:",
                                  airtableFields,
                                )}
                                {airtableFields.map((field, index) => {
                                  console.log(
                                    `Rendering dropdown option ${index + 1}:`,
                                    field,
                                  );
                                  return (
                                    <option key={field.id} value={field.id}>
                                      {field.name} ({field.type})
                                    </option>
                                  );
                                })}
                              </Form.Select>

                              {mapping.confidence > 0 && (
                                <Badge
                                  bg="success"
                                  className="badge-professional"
                                >
                                  {Math.round(mapping.confidence * 100)}%
                                </Badge>
                              )}

                              <Button
                                onClick={() => removeMapping(mapping.id)}
                                variant="outline-danger"
                                size="sm"
                                className="flex-shrink-0"
                              >
                                <Trash2 size={16} />
                              </Button>
                            </div>
                          </Col>
                        </Row>
                      </motion.div>
                    ))}
                  </div>

                  <div className="mt-4 pt-3 border-top">
                    <Button
                      onClick={addManualMapping}
                      variant="outline-primary"
                      className="w-100 btn-professional"
                    >
                      <Plus size={16} className="me-2" />
                      Add Manual Mapping
                    </Button>
                  </div>

                  <Alert variant="info" className="mt-4 mb-0">
                    <div className="d-flex align-items-center">
                      <CheckCircle size={16} className="me-2" />
                      <small>
                        <strong>Ready to sync:</strong> {fieldMappings.length}{" "}
                        field mappings configured. Data will flow according to
                        these mappings during synchronization.
                      </small>
                    </div>
                  </Alert>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

        {/* Navigation */}
        <motion.div
          className="d-flex justify-content-between align-items-center mt-5 pt-4 border-top"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Button
            onClick={onBack}
            variant="outline-secondary"
            size="lg"
            className="btn-professional px-4"
          >
            ← Back to Connections
          </Button>

          <div className="text-center">
            {fieldMappings.length > 0 && (
              <div className="d-flex align-items-center mb-2">
                <CheckCircle size={20} className="me-2 text-success" />
                <Badge bg="success" className="badge-professional">
                  {fieldMappings.length} mappings ready
                </Badge>
              </div>
            )}
            <Button
              onClick={() => {
                const selectedTableName =
                  airtableTables.find((t) => t.id === selectedAirtableTable)
                    ?.name || "Unknown";
                const selectedAttioItem = attioObjects.find(
                  (item) => item.id === selectedAttioObject,
                );
                onNext({
                  airtableTableId: selectedAirtableTable,
                  airtableTableName: selectedTableName,
                  attioObjectId: selectedAttioObject,
                  attioObjectName: selectedAttioItem?.name || "Unknown",
                  attioObjectType: selectedAttioItem?.type || "object",
                  parentObjectType: selectedAttioItem?.parentObjectType || null,
                });
              }}
              disabled={fieldMappings.length === 0}
              size="lg"
              className="btn-professional btn-professional-primary px-5"
            >
              Continue to Configuration →
            </Button>
          </div>
        </motion.div>

        {/* Unmapped Fields Section */}
        {unmappedAttioFields.length > 0 && (
          <motion.div
            className="mt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Alert variant="info">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <strong>📋 Unmapped Attio Fields Found</strong>
                  <p className="mb-0 mt-1">
                    {unmappedAttioFields.length} Attio fields don't have
                    corresponding Airtable fields. You can create new Airtable
                    fields for them.
                  </p>
                </div>
              </div>
              <div className="mt-3">
                {unmappedAttioFields.map((field) => (
                  <Badge
                    key={field.id}
                    bg="secondary"
                    className="me-2 mb-2 p-2 d-inline-flex align-items-center"
                    style={{ fontSize: "0.9rem" }}
                  >
                    <span className="me-2">
                      {field.name} ({field.attioType})
                    </span>
                    <Button
                      size="sm"
                      variant="light"
                      onClick={() => openNewFieldModal(field)}
                      className="p-1 ms-1"
                      style={{ fontSize: "0.7rem" }}
                    >
                      <Plus size={12} /> Create Field
                    </Button>
                  </Badge>
                ))}
              </div>
            </Alert>
          </motion.div>
        )}
      </Container>

      {/* New Field Creation Modal */}
      <Modal
        show={showNewFieldModal}
        onHide={() => setShowNewFieldModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Create New Airtable Field</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {newFieldData.attioField && (
            <Alert variant="info" className="mb-3">
              <strong>Creating field for:</strong>{" "}
              {newFieldData.attioField.name} (
              {newFieldData.attioField.attioType})
              <br />
              <small>{newFieldData.attioField.description}</small>
            </Alert>
          )}

          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Field Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter field name"
                    value={newFieldData.name}
                    onChange={(e) =>
                      setNewFieldData({ ...newFieldData, name: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Field Type</Form.Label>
                  <Form.Select
                    value={newFieldData.type}
                    onChange={(e) =>
                      setNewFieldData({ ...newFieldData, type: e.target.value })
                    }
                  >
                    {airtableFieldTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Description (Optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="Enter field description"
                value={newFieldData.description}
                onChange={(e) =>
                  setNewFieldData({
                    ...newFieldData,
                    description: e.target.value,
                  })
                }
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowNewFieldModal(false)}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={createNewAirtableField}
            disabled={loading || !newFieldData.name}
          >
            {loading ? "Creating..." : "Create Field"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
