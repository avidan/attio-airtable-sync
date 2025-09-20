import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Clock,
  Zap,
  Shield,
  Activity,
  BarChart3,
  Settings,
} from "lucide-react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Alert,
  ProgressBar,
  Table,
} from "react-bootstrap";
import SyncService from "../services/syncService";
import toast from "react-hot-toast";

export default function SyncStatus({
  connections,
  fieldMappings,
  syncConfig,
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

  // Debug: log the sync config to verify it contains Attio object info
  useEffect(() => {
    console.log("SyncStatus received syncConfig:", syncConfig);
    console.log("SyncStatus Attio object info:", {
      attioObjectId: syncConfig.attioObjectId,
      attioObjectType: syncConfig.attioObjectType,
      attioObjectName: syncConfig.attioObjectName,
    });
  }, [syncConfig]);

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
      toast.error("Sync failed: " + error.message);
    }
  };

  const resetSync = () => {
    setSyncStatus("idle");
    setProgress({ current: 0, total: 0, message: "" });
    setLogs([]);
    setSyncStats({ created: 0, updated: 0, skipped: 0, errors: 0 });
  };

  const getStatusIcon = () => {
    switch (syncStatus) {
      case "running":
        return <Clock className="text-primary" size={24} />;
      case "completed":
        return <CheckCircle className="text-success" size={24} />;
      case "error":
        return <AlertCircle className="text-danger" size={24} />;
      default:
        return <Play className="text-secondary" size={24} />;
    }
  };

  const getStatusText = () => {
    switch (syncStatus) {
      case "running":
        return "Sync in Progress";
      case "completed":
        return "Sync Completed";
      case "error":
        return "Sync Failed";
      default:
        return "Ready to Sync";
    }
  };

  const getStatusVariant = () => {
    switch (syncStatus) {
      case "running":
        return "primary";
      case "completed":
        return "success";
      case "error":
        return "danger";
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
          className="bg-primary-gradient rounded-4 d-inline-flex align-items-center justify-content-center mb-4 shadow"
          style={{ width: "80px", height: "80px" }}
          whileHover={{ scale: 1.05 }}
        >
          <Activity className="text-white" size={40} />
        </motion.div>
        <h1 className="display-5 fw-bold text-dark mb-3">Sync Status</h1>
        <p className="lead text-muted mx-auto" style={{ maxWidth: "600px" }}>
          Monitor and manage your data synchronization between Attio and
          Airtable with real-time progress tracking and comprehensive logging.
        </p>
      </motion.div>

      {/* Sync Controls */}
      <Row className="g-4 mb-4">
        <Col>
          <Card className="professional-card border-0 shadow">
            <div
              className={`bg-${getStatusVariant()}-gradient text-white p-4 position-relative overflow-hidden`}
            >
              <div
                className="position-absolute top-0 end-0 bg-white opacity-10 rounded-circle"
                style={{
                  width: "120px",
                  height: "120px",
                  marginTop: "-60px",
                  marginRight: "-60px",
                }}
              ></div>
              <div className="position-relative d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center">
                  <div className="bg-white bg-opacity-20 rounded-3 p-3 me-3">
                    {getStatusIcon()}
                  </div>
                  <div>
                    <h4 className="mb-1 fw-bold">{getStatusText()}</h4>
                    <p className="mb-0 opacity-75">
                      {syncStatus === "running"
                        ? "Synchronization in progress..."
                        : syncStatus === "completed"
                          ? "All data synchronized successfully"
                          : syncStatus === "error"
                            ? "Synchronization encountered errors"
                            : "Ready to begin data synchronization"}
                    </p>
                  </div>
                </div>
                <div className="text-end">
                  {syncStatus === "idle" && (
                    <Button
                      onClick={startSync}
                      size="lg"
                      className="btn-professional px-4 py-3"
                      style={{
                        background: "rgba(255, 255, 255, 0.2)",
                        border: "2px solid rgba(255, 255, 255, 0.3)",
                        color: "white",
                      }}
                    >
                      <Play size={20} className="me-2" />
                      Start Sync
                    </Button>
                  )}

                  {(syncStatus === "completed" || syncStatus === "error") && (
                    <Button
                      onClick={resetSync}
                      size="lg"
                      className="btn-professional px-4 py-3"
                      style={{
                        background: "rgba(255, 255, 255, 0.2)",
                        border: "2px solid rgba(255, 255, 255, 0.3)",
                        color: "white",
                      }}
                    >
                      <RotateCcw size={20} className="me-2" />
                      Reset
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            {syncStatus === "running" && (
              <Card.Body className="p-4">
                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="fw-semibold text-dark">
                      {progress.message}
                    </span>
                    <span className="text-muted">
                      {progress.current} of {progress.total}
                    </span>
                  </div>
                  <ProgressBar
                    now={
                      progress.total > 0
                        ? (progress.current / progress.total) * 100
                        : 0
                    }
                    className="progress-professional"
                    style={{ height: "12px" }}
                    animated
                  />
                </div>
              </Card.Body>
            )}
          </Card>
        </Col>
      </Row>

      {/* Sync Stats */}
      {(syncStatus === "completed" ||
        syncStatus === "error" ||
        syncStats.created + syncStats.updated + syncStats.skipped > 0) && (
        <Row className="g-4 mb-4">
          <Col md={3}>
            <Card className="professional-card border-0 shadow text-center">
              <Card.Body className="p-4">
                <div className="text-success mb-2">
                  <CheckCircle size={32} />
                </div>
                <h3 className="fw-bold text-success mb-1">
                  {syncStats.created}
                </h3>
                <p className="text-muted mb-0 small">Records Created</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="professional-card border-0 shadow text-center">
              <Card.Body className="p-4">
                <div className="text-primary mb-2">
                  <RotateCcw size={32} />
                </div>
                <h3 className="fw-bold text-primary mb-1">
                  {syncStats.updated}
                </h3>
                <p className="text-muted mb-0 small">Records Updated</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="professional-card border-0 shadow text-center">
              <Card.Body className="p-4">
                <div className="text-warning mb-2">
                  <Pause size={32} />
                </div>
                <h3 className="fw-bold text-warning mb-1">
                  {syncStats.skipped}
                </h3>
                <p className="text-muted mb-0 small">Records Skipped</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="professional-card border-0 shadow text-center">
              <Card.Body className="p-4">
                <div className="text-danger mb-2">
                  <AlertCircle size={32} />
                </div>
                <h3 className="fw-bold text-danger mb-1">{syncStats.errors}</h3>
                <p className="text-muted mb-0 small">Errors</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Configuration Summary */}
      <Row className="g-4 mb-4">
        <Col>
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
                  <Settings className="text-white" size={24} />
                </div>
                <div>
                  <h4 className="mb-1 fw-bold">Sync Configuration</h4>
                  <p className="mb-0 opacity-75">
                    Current synchronization settings
                  </p>
                </div>
              </div>
            </div>

            <Card.Body className="p-4">
              <Row>
                <Col md={6}>
                  <Table borderless className="mb-0">
                    <tbody>
                      <tr>
                        <td className="fw-semibold text-dark">Direction:</td>
                        <td>
                          <Badge
                            bg={
                              syncConfig.syncDirection === "attio-to-airtable"
                                ? "success"
                                : syncConfig.syncDirection ===
                                    "airtable-to-attio"
                                  ? "info"
                                  : "primary"
                            }
                            className="badge-professional"
                          >
                            {syncConfig.syncDirection === "attio-to-airtable"
                              ? "Attio → Airtable"
                              : syncConfig.syncDirection === "airtable-to-attio"
                                ? "Airtable → Attio"
                                : "Bidirectional"}
                          </Badge>
                        </td>
                      </tr>
                      <tr>
                        <td className="fw-semibold text-dark">
                          Prevent Deletes:
                        </td>
                        <td>
                          <Badge
                            bg={
                              syncConfig.preventDeletes
                                ? "success"
                                : "secondary"
                            }
                          >
                            {syncConfig.preventDeletes ? "Enabled" : "Disabled"}
                          </Badge>
                        </td>
                      </tr>
                    </tbody>
                  </Table>
                </Col>
                <Col md={6}>
                  <Table borderless className="mb-0">
                    <tbody>
                      <tr>
                        <td className="fw-semibold text-dark">
                          Field Mappings:
                        </td>
                        <td>
                          <Badge bg="primary" className="badge-professional">
                            {fieldMappings.length} mappings
                          </Badge>
                        </td>
                      </tr>
                      <tr>
                        <td className="fw-semibold text-dark">Filters:</td>
                        <td>
                          <Badge
                            bg={
                              syncConfig.attioFilter ||
                              syncConfig.airtableFilter
                                ? "warning"
                                : "secondary"
                            }
                          >
                            {syncConfig.attioFilter || syncConfig.airtableFilter
                              ? "Applied"
                              : "None"}
                          </Badge>
                        </td>
                      </tr>
                    </tbody>
                  </Table>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Sync Logs */}
      {logs.length > 0 && (
        <Row className="g-4 mb-4">
          <Col>
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
                <div className="position-relative d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center">
                    <div className="bg-white bg-opacity-20 rounded-3 p-3 me-3">
                      <BarChart3 className="text-white" size={24} />
                    </div>
                    <div>
                      <h4 className="mb-1 fw-bold">Sync Logs</h4>
                      <p className="mb-0 opacity-75">
                        Real-time synchronization activity
                      </p>
                    </div>
                  </div>
                  <Badge bg="light" text="dark" className="badge-professional">
                    {logs.length} entries
                  </Badge>
                </div>
              </div>

              <Card.Body className="p-0">
                <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                  {logs.map((log, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`d-flex align-items-start p-3 border-bottom ${
                        log.level === "error"
                          ? "bg-danger bg-opacity-10"
                          : log.level === "warning"
                            ? "bg-warning bg-opacity-10"
                            : log.level === "success"
                              ? "bg-success bg-opacity-10"
                              : "bg-light bg-opacity-50"
                      }`}
                    >
                      <div className="flex-shrink-0 me-3 mt-1">
                        {log.level === "error" && (
                          <AlertCircle size={16} className="text-danger" />
                        )}
                        {log.level === "warning" && (
                          <AlertCircle size={16} className="text-warning" />
                        )}
                        {log.level === "success" && (
                          <CheckCircle size={16} className="text-success" />
                        )}
                        {log.level === "info" && (
                          <Clock size={16} className="text-primary" />
                        )}
                      </div>
                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between align-items-start">
                          <span
                            className={`fw-medium ${
                              log.level === "error"
                                ? "text-danger"
                                : log.level === "warning"
                                  ? "text-warning"
                                  : log.level === "success"
                                    ? "text-success"
                                    : "text-dark"
                            }`}
                          >
                            {log.message}
                          </span>
                          <small className="text-muted">
                            {log.timestamp.toLocaleTimeString()}
                          </small>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
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
          ← Back to Configuration
        </Button>

        {syncStatus === "completed" && (
          <div className="text-center">
            <div className="d-flex align-items-center mb-2">
              <CheckCircle size={20} className="me-2 text-success" />
              <Badge bg="success" className="badge-professional">
                Sync Completed Successfully
              </Badge>
            </div>
            <p className="text-muted mb-0">
              Your data has been synchronized between Attio and Airtable
            </p>
          </div>
        )}
      </motion.div>
    </Container>
  );
}
