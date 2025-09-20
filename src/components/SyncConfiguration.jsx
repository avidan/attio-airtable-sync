import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
  Shield,
  Filter,
  ArrowLeftRight,
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
  Clock,
  CheckCircle,
  Info,
  Play,
  Pause,
  RotateCcw,
  AlertCircle,
  Zap,
  Activity,
  BarChart3,
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
  Table,
} from "react-bootstrap";
import SyncService from "../services/syncService";
import toast from "react-hot-toast";

export default function SyncConfiguration({
  connections,
  fieldMappings,
  syncConfig,
  setSyncConfig,
  onNext,
  onBack,
}) {
  const [syncStatus, setSyncStatus] = useState("idle"); // idle, running, completed, error
  const [progress, setProgress] = useState({
    current: 0,
    total: 0,
    message: "",
  });
  const [logs, setLogs] = useState([]);
  const [syncStats, setSyncStats] = useState({
    created: 0,
    updated: 0,
    skipped: 0,
    errors: 0,
  });
  const [syncService] = useState(
    () => new SyncService(connections, fieldMappings, syncConfig),
  );

  useEffect(() => {
    syncService.updateConfig(syncConfig);
  }, [syncConfig, syncService]);

  useEffect(() => {
    syncService.updateConnections(connections);
  }, [connections, syncService]);

  useEffect(() => {
    syncService.updateFieldMappings(fieldMappings);
  }, [fieldMappings, syncService]);

  useEffect(() => {
    syncService.onProgress = (progress) => setProgress(progress);
    syncService.onLog = (log) =>
      setLogs((prev) => [...prev, { ...log, timestamp: new Date() }]);
    syncService.onStats = (stats) => setSyncStats(stats);
  }, [syncService]);

  const startSync = async () => {
    setSyncStatus("running");
    setLogs([]);
    setSyncStats({ created: 0, updated: 0, skipped: 0, errors: 0 });

    try {
      await syncService.performSync();
      setSyncStatus("completed");
      toast.success("Sync completed successfully!");
    } catch (error) {
      setSyncStatus("error");
      toast.error(`Sync failed: ${error.message}`);
      console.error("Sync error:", error);
    }
  };

  const updateConfig = (key, value) => {
    setSyncConfig((prev) => ({ ...prev, [key]: value }));
  };

  const getSyncDirectionIcon = (direction) => {
    switch (direction) {
      case "bidirectional":
        return <ArrowLeftRight size={20} />;
      case "attio-to-airtable":
        return <ArrowRight size={20} />;
      case "airtable-to-attio":
        return <ArrowLeft size={20} />;
      default:
        return <ArrowLeftRight size={20} />;
    }
  };

  const getSyncDirectionColor = (direction) => {
    switch (direction) {
      case "bidirectional":
        return "primary";
      case "attio-to-airtable":
        return "success";
      case "airtable-to-attio":
        return "info";
      default:
        return "secondary";
    }
  };

  return (
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
          <Shield className="text-white" size={40} />
        </motion.div>
        <h1 className="display-5 fw-bold text-dark mb-3">Sync Configuration</h1>
        <p className="lead text-muted mx-auto" style={{ maxWidth: "600px" }}>
          Configure how your data synchronizes between Attio and Airtable with
          precision control and safety features.
        </p>
      </motion.div>

      <Row className="g-4">
        {/* Sync Direction Section */}
        <Col lg={6}>
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card className="professional-card h-100 border-0 shadow">
              <div className="bg-primary-gradient text-white p-4 position-relative overflow-hidden">
                <div
                  className="position-absolute top-0 end-0 bg-white opacity-10 rounded-circle"
                  style={{
                    width: "120px",
                    height: "120px",
                    marginTop: "-60px",
                    marginRight: "-60px",
                  }}
                ></div>
                <div className="position-relative d-flex align-items-center">
                  <div className="bg-white bg-opacity-20 rounded-3 p-3 me-3">
                    <ArrowLeftRight className="text-white" size={24} />
                  </div>
                  <div>
                    <h4 className="mb-1 fw-bold">Sync Direction</h4>
                    <p className="mb-0 opacity-75">
                      Choose how data flows between systems
                    </p>
                  </div>
                </div>
              </div>

              <Card.Body className="p-4">
                <div className="d-grid gap-3">
                  {/* One-way: Attio to Airtable */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div
                      className={`border rounded-3 p-3 cursor-pointer transition-all ${
                        syncConfig.syncDirection === "attio-to-airtable"
                          ? "border-success bg-success bg-opacity-10"
                          : "border-light bg-light bg-opacity-50"
                      }`}
                      onClick={() =>
                        updateConfig("syncDirection", "attio-to-airtable")
                      }
                      style={{ cursor: "pointer" }}
                    >
                      <Form.Check
                        type="radio"
                        name="syncDirection"
                        value="attio-to-airtable"
                        checked={
                          syncConfig.syncDirection === "attio-to-airtable"
                        }
                        onChange={(e) =>
                          updateConfig("syncDirection", e.target.value)
                        }
                        className="mb-0"
                      />
                      <div className="ms-4 mt-2">
                        <div className="d-flex align-items-center mb-2">
                          <ArrowRight size={18} className="me-2 text-success" />
                          <strong className="text-success">
                            Attio → Airtable
                          </strong>
                          <Badge bg="success" className="ms-2">
                            Recommended
                          </Badge>
                        </div>
                        <small className="text-muted">
                          One-way sync from Attio CRM to Airtable. Safe and
                          predictable data flow.
                        </small>
                      </div>
                    </div>
                  </motion.div>

                  {/* Bidirectional */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div
                      className={`border rounded-3 p-3 cursor-pointer transition-all ${
                        syncConfig.syncDirection === "bidirectional"
                          ? "border-primary bg-primary bg-opacity-10"
                          : "border-light bg-light bg-opacity-50"
                      }`}
                      onClick={() =>
                        updateConfig("syncDirection", "bidirectional")
                      }
                      style={{ cursor: "pointer" }}
                    >
                      <Form.Check
                        type="radio"
                        name="syncDirection"
                        value="bidirectional"
                        checked={syncConfig.syncDirection === "bidirectional"}
                        onChange={(e) =>
                          updateConfig("syncDirection", e.target.value)
                        }
                        className="mb-0"
                      />
                      <div className="ms-4 mt-2">
                        <div className="d-flex align-items-center mb-2">
                          <ArrowLeftRight
                            size={18}
                            className="me-2 text-primary"
                          />
                          <strong className="text-primary">
                            Bidirectional Sync
                          </strong>
                          <Badge bg="warning" className="ms-2">
                            Advanced
                          </Badge>
                        </div>
                        <small className="text-muted">
                          Two-way sync between both systems. Requires careful
                          conflict resolution.
                        </small>
                      </div>
                    </div>
                  </motion.div>

                  {/* One-way: Airtable to Attio */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div
                      className={`border rounded-3 p-3 cursor-pointer transition-all ${
                        syncConfig.syncDirection === "airtable-to-attio"
                          ? "border-info bg-info bg-opacity-10"
                          : "border-light bg-light bg-opacity-50"
                      }`}
                      onClick={() =>
                        updateConfig("syncDirection", "airtable-to-attio")
                      }
                      style={{ cursor: "pointer" }}
                    >
                      <Form.Check
                        type="radio"
                        name="syncDirection"
                        value="airtable-to-attio"
                        checked={
                          syncConfig.syncDirection === "airtable-to-attio"
                        }
                        onChange={(e) =>
                          updateConfig("syncDirection", e.target.value)
                        }
                        className="mb-0"
                      />
                      <div className="ms-4 mt-2">
                        <div className="d-flex align-items-center mb-2">
                          <ArrowLeft size={18} className="me-2 text-info" />
                          <strong className="text-info">
                            Airtable → Attio
                          </strong>
                        </div>
                        <small className="text-muted">
                          One-way sync from Airtable to Attio CRM. Populate CRM
                          from database.
                        </small>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Sync Direction Warning */}
                <AnimatePresence>
                  {syncConfig.syncDirection === "attio-to-airtable" && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="mt-4"
                    >
                      <Alert variant="success" className="mb-0">
                        <div className="d-flex align-items-center">
                          <CheckCircle size={16} className="me-2" />
                          <small>
                            <strong>One-way sync selected:</strong> Data will
                            flow from Attio to Airtable only. This prevents
                            conflicts and ensures data integrity.
                          </small>
                        </div>
                      </Alert>
                    </motion.div>
                  )}
                  {syncConfig.syncDirection === "bidirectional" && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="mt-4"
                    >
                      <Alert variant="warning" className="mb-0">
                        <div className="d-flex align-items-center">
                          <AlertTriangle size={16} className="me-2" />
                          <small>
                            <strong>Advanced mode:</strong> Bidirectional sync
                            requires careful field mapping and conflict
                            resolution strategies.
                          </small>
                        </div>
                      </Alert>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card.Body>
            </Card>
          </motion.div>
        </Col>

        {/* Safety Settings Section */}
        <Col lg={6}>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="professional-card h-100 border-0 shadow">
              <div className="bg-success-gradient text-white p-4 position-relative overflow-hidden">
                <div
                  className="position-absolute top-0 end-0 bg-white opacity-10 rounded-circle"
                  style={{
                    width: "120px",
                    height: "120px",
                    marginTop: "-60px",
                    marginRight: "-60px",
                  }}
                ></div>
                <div className="position-relative d-flex align-items-center">
                  <div className="bg-white bg-opacity-20 rounded-3 p-3 me-3">
                    <Shield className="text-white" size={24} />
                  </div>
                  <div>
                    <h4 className="mb-1 fw-bold">Safety Settings</h4>
                    <p className="mb-0 opacity-75">
                      Protect your data integrity
                    </p>
                  </div>
                </div>
              </div>

              <Card.Body className="p-4">
                <div className="d-grid gap-3">
                  <div className="border rounded-3 p-3 bg-light bg-opacity-50">
                    <Form.Check
                      type="checkbox"
                      checked={syncConfig.createNew}
                      onChange={(e) =>
                        updateConfig("createNew", e.target.checked)
                      }
                      className="mb-2"
                      label={
                        <div>
                          <strong className="text-primary">
                            Create new records
                          </strong>
                          <Badge bg="primary" className="ms-2">
                            Enabled
                          </Badge>
                        </div>
                      }
                    />
                    <small className="text-muted d-block">
                      Create new records in the destination that don't exist
                      yet.
                    </small>
                  </div>

                  <div className="border rounded-3 p-3 bg-light bg-opacity-50">
                    <Form.Check
                      type="checkbox"
                      checked={syncConfig.updateExisting}
                      onChange={(e) =>
                        updateConfig("updateExisting", e.target.checked)
                      }
                      className="mb-2"
                      label={
                        <div>
                          <strong className="text-info">
                            Update existing records
                          </strong>
                          <Badge bg="info" className="ms-2">
                            Enabled
                          </Badge>
                        </div>
                      }
                    />
                    <small className="text-muted d-block">
                      Update records that already exist in the destination.
                    </small>
                  </div>

                  <div className="border rounded-3 p-3 bg-light bg-opacity-50">
                    <Form.Check
                      type="checkbox"
                      checked={syncConfig.preventDeletes}
                      onChange={(e) =>
                        updateConfig("preventDeletes", e.target.checked)
                      }
                      className="mb-2"
                      label={
                        <div>
                          <strong className="text-success">
                            Prevent deletions
                          </strong>
                          <Badge bg="success" className="ms-2">
                            Recommended
                          </Badge>
                        </div>
                      }
                    />
                    <small className="text-muted d-block">
                      Records will never be deleted during sync operations. This
                      prevents accidental data loss.
                    </small>
                  </div>

                  <div className="border rounded-3 p-3 bg-light bg-opacity-50">
                    <Form.Check
                      type="checkbox"
                      checked={syncConfig.createBackups}
                      onChange={(e) =>
                        updateConfig("createBackups", e.target.checked)
                      }
                      className="mb-2"
                      label={<strong>Create backups before sync</strong>}
                    />
                    <small className="text-muted d-block">
                      Export data to backup files before performing any sync
                      operations.
                    </small>
                  </div>

                  <div className="border rounded-3 p-3 bg-light bg-opacity-50">
                    <Form.Check
                      type="checkbox"
                      checked={syncConfig.dryRunFirst || false}
                      onChange={(e) =>
                        updateConfig("dryRunFirst", e.target.checked)
                      }
                      className="mb-2"
                      label={<strong>Dry run first</strong>}
                    />
                    <small className="text-muted d-block">
                      Preview changes before applying them. Review what will be
                      synced.
                    </small>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </motion.div>
        </Col>
      </Row>

      {/* Filters Section */}
      <Row className="g-4 mt-1">
        <Col>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="professional-card border-0 shadow">
              <div className="bg-secondary-gradient text-white p-4 position-relative overflow-hidden">
                <div
                  className="position-absolute top-0 end-0 bg-white opacity-10 rounded-circle"
                  style={{
                    width: "120px",
                    height: "120px",
                    marginTop: "-60px",
                    marginRight: "-60px",
                  }}
                ></div>
                <div className="position-relative d-flex align-items-center">
                  <div className="bg-white bg-opacity-20 rounded-3 p-3 me-3">
                    <Filter className="text-white" size={24} />
                  </div>
                  <div>
                    <h4 className="mb-1 fw-bold">Sync Filters</h4>
                    <p className="mb-0 opacity-75">
                      Control which records are synchronized
                    </p>
                  </div>
                </div>
              </div>

              <Card.Body className="p-4">
                <Row>
                  {/* Record Limit */}
                  <Col md={12}>
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-semibold text-dark">
                        Record Limit{" "}
                        <small className="text-muted">
                          (For testing & safety)
                        </small>
                      </Form.Label>
                      <Row>
                        <Col md={6}>
                          <Form.Select
                            value={syncConfig.recordLimit || "10"}
                            onChange={(e) =>
                              updateConfig("recordLimit", e.target.value)
                            }
                            className="form-control-professional"
                          >
                            <option value="10">10 records (Testing)</option>
                            <option value="unlimited">
                              Unlimited - Sync all records
                            </option>
                            <option value="50">50 records (Small test)</option>
                            <option value="100">
                              100 records (Medium test)
                            </option>
                            <option value="500">
                              500 records (Large test)
                            </option>
                            <option value="1000">
                              1,000 records (Production)
                            </option>
                            <option value="custom">Custom limit...</option>
                          </Form.Select>
                        </Col>
                        {syncConfig.recordLimit === "custom" && (
                          <Col md={6}>
                            <Form.Control
                              type="number"
                              min="1"
                              value={syncConfig.customRecordLimit || ""}
                              onChange={(e) =>
                                updateConfig(
                                  "customRecordLimit",
                                  e.target.value,
                                )
                              }
                              placeholder="Enter custom limit"
                              className="form-control-professional"
                            />
                          </Col>
                        )}
                      </Row>
                      <Form.Text className="text-muted">
                        {syncConfig.recordLimit === "unlimited" ? (
                          <span className="text-warning">
                            <strong>⚠️ All records will be synced.</strong> Use
                            with caution for large datasets.
                          </span>
                        ) : (
                          <span className="text-success">
                            <strong>✓ Limited sync:</strong> Only the first{" "}
                            {syncConfig.recordLimit === "custom"
                              ? syncConfig.customRecordLimit
                              : syncConfig.recordLimit}{" "}
                            records will be processed.
                          </span>
                        )}
                      </Form.Text>
                    </Form.Group>
                  </Col>

                  {/* Only show relevant filter based on sync direction */}
                  {(syncConfig.syncDirection === "attio-to-airtable" ||
                    syncConfig.syncDirection === "bidirectional") && (
                    <Col
                      md={syncConfig.syncDirection === "bidirectional" ? 6 : 12}
                    >
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold text-dark">
                          Attio Filter{" "}
                          <small className="text-muted">(Optional)</small>
                        </Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          value={syncConfig.attioFilter || ""}
                          onChange={(e) =>
                            updateConfig("attioFilter", e.target.value)
                          }
                          className="form-control-professional"
                          placeholder="Enter filter criteria for Attio records..."
                        />
                        <Form.Text className="text-muted">
                          Only records matching this filter will be synced from
                          Attio
                        </Form.Text>
                      </Form.Group>
                    </Col>
                  )}

                  {(syncConfig.syncDirection === "airtable-to-attio" ||
                    syncConfig.syncDirection === "bidirectional") && (
                    <Col
                      md={syncConfig.syncDirection === "bidirectional" ? 6 : 12}
                    >
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold text-dark">
                          Airtable Filter{" "}
                          <small className="text-muted">(Optional)</small>
                        </Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          value={syncConfig.airtableFilter || ""}
                          onChange={(e) =>
                            updateConfig("airtableFilter", e.target.value)
                          }
                          className="form-control-professional"
                          placeholder="Enter filter formula for Airtable records..."
                        />
                        <Form.Text className="text-muted">
                          Only records matching this filter will be synced from
                          Airtable
                        </Form.Text>
                      </Form.Group>
                    </Col>
                  )}
                </Row>
              </Card.Body>
            </Card>
          </motion.div>
        </Col>
      </Row>

      {/* Schedule Settings */}
      <Row className="g-4 mt-1">
        <Col>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="professional-card border-0 shadow">
              <div className="bg-info-gradient text-white p-4 position-relative overflow-hidden">
                <div
                  className="position-absolute top-0 end-0 bg-white opacity-10 rounded-circle"
                  style={{
                    width: "120px",
                    height: "120px",
                    marginTop: "-60px",
                    marginRight: "-60px",
                  }}
                ></div>
                <div className="position-relative d-flex align-items-center">
                  <div className="bg-white bg-opacity-20 rounded-3 p-3 me-3">
                    <Clock className="text-white" size={24} />
                  </div>
                  <div>
                    <h4 className="mb-1 fw-bold">Sync Schedule</h4>
                    <p className="mb-0 opacity-75">
                      When should synchronization occur
                    </p>
                  </div>
                </div>
              </div>

              <Card.Body className="p-4">
                <Row>
                  <Col md={4}>
                    <div className="d-grid gap-3">
                      <div className="text-center">
                        <Form.Check
                          type="radio"
                          name="syncSchedule"
                          value="manual"
                          checked={syncConfig.schedule === "manual"}
                          onChange={(e) =>
                            updateConfig("schedule", e.target.value)
                          }
                          className="mb-2"
                          label={
                            <div>
                              <strong>Manual sync only</strong>
                              <Badge bg="primary" className="ms-2">
                                Recommended
                              </Badge>
                            </div>
                          }
                        />
                        <small className="text-muted">
                          Full control over when sync occurs
                        </small>
                      </div>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className="text-center">
                      <Form.Check
                        type="radio"
                        name="syncSchedule"
                        value="hourly"
                        checked={syncConfig.schedule === "hourly"}
                        onChange={(e) =>
                          updateConfig("schedule", e.target.value)
                        }
                        className="mb-2"
                        label={<strong>Every hour</strong>}
                      />
                      <small className="text-muted">
                        Automated frequent sync
                      </small>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className="text-center">
                      <Form.Check
                        type="radio"
                        name="syncSchedule"
                        value="daily"
                        checked={syncConfig.schedule === "daily"}
                        onChange={(e) =>
                          updateConfig("schedule", e.target.value)
                        }
                        className="mb-2"
                        label={<strong>Daily</strong>}
                      />
                      <small className="text-muted">Once per day sync</small>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </motion.div>
        </Col>
      </Row>

      {/* Navigation */}
      <motion.div
        className="d-flex justify-content-between align-items-center mt-5 pt-4 border-top"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <Button
          onClick={onBack}
          variant="outline-secondary"
          size="lg"
          className="btn-professional px-4"
        >
          ← Back to Field Mapping
        </Button>

        <div className="text-center">
          <div className="d-flex align-items-center mb-2">
            {getSyncDirectionIcon(syncConfig.syncDirection)}
            <Badge
              bg={getSyncDirectionColor(syncConfig.syncDirection)}
              className="ms-2"
            >
              {syncConfig.syncDirection === "attio-to-airtable"
                ? "Attio → Airtable"
                : syncConfig.syncDirection === "airtable-to-attio"
                  ? "Airtable → Attio"
                  : "Bidirectional"}
            </Badge>
          </div>
          <Button
            onClick={onNext}
            size="lg"
            className="btn-professional btn-professional-primary px-5"
          >
            Start Sync Process →
          </Button>
        </div>
      </motion.div>
    </Container>
  );
}
