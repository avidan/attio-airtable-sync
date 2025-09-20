import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Database,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Eye,
  EyeOff,
  Shield,
  Key,
  Settings,
  Zap,
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
} from "react-bootstrap";
import toast from "react-hot-toast";
import tokenAuthService from "../services/tokenAuthService";

export default function ProfessionalConnectionSetup({
  connections,
  setConnections,
  onNext,
}) {
  const [credentials, setCredentials] = useState({
    attio: {
      token: import.meta.env.VITE_ATTIO_TOKEN || "",
      objectId: import.meta.env.VITE_ATTIO_OBJECT_ID || "",
    },
    airtable: {
      token: import.meta.env.VITE_AIRTABLE_TOKEN || "",
      baseId: import.meta.env.VITE_AIRTABLE_BASE_ID || "",
    },
  });
  const [showTokens, setShowTokens] = useState({
    attio: false,
    airtable: false,
  });
  const [testing, setTesting] = useState({ attio: false, airtable: false });

  // Auto-load tokens if available and enabled
  useEffect(() => {
    const autoLoad = import.meta.env.VITE_AUTO_LOAD_TOKENS === "true";
    if (
      autoLoad &&
      credentials.attio.token &&
      credentials.airtable.token &&
      credentials.airtable.baseId
    ) {
      // Auto-test connections if tokens are pre-loaded
      setTimeout(() => {
        if (!connections.attio.connected && credentials.attio.token) {
          testConnection("attio");
        }
      }, 1000);

      setTimeout(() => {
        if (
          !connections.airtable.connected &&
          credentials.airtable.token &&
          credentials.airtable.baseId
        ) {
          testConnection("airtable");
        }
      }, 2000);
    }
  }, []);

  const testConnection = async (service) => {
    setTesting((prev) => ({ ...prev, [service]: true }));

    try {
      const serviceCredentials = credentials[service];

      // Test the actual connection using the token auth service
      const result = await tokenAuthService.testConnection(
        service,
        serviceCredentials,
      );

      // Store the connection
      tokenAuthService.storeConnection(service, serviceCredentials);

      // Update UI state
      setConnections((prev) => ({
        ...prev,
        [service]: {
          connected: true,
          config: serviceCredentials,
        },
      }));

      const serviceName = service === "attio" ? "Attio" : "Airtable";
      toast.success(`✅ ${serviceName} connection successful!`);

      // Show additional info if available
      if (result.objectInfo && result.objectInfo.records) {
        toast.success(
          `Connected to object: ${result.objectInfo.id} (${result.objectInfo.records.length} records found)`,
        );
      } else if (result.availableObjects && result.availableObjects.length) {
        toast.success(
          `Found ${result.availableObjects.length} available objects`,
        );
      } else if (result.baseInfo && result.baseInfo.tables) {
        toast.success(`Found ${result.baseInfo.tables.length} tables in base`);
      }
    } catch (error) {
      const serviceName = service === "attio" ? "Attio" : "Airtable";
      toast.error(`❌ ${serviceName} connection failed: ${error.message}`);

      setConnections((prev) => ({
        ...prev,
        [service]: { connected: false, config: null },
      }));
    } finally {
      setTesting((prev) => ({ ...prev, [service]: false }));
    }
  };

  const handleDisconnect = (service) => {
    // Clear from token auth service
    tokenAuthService.disconnect(service);

    setConnections((prev) => ({
      ...prev,
      [service]: { connected: false, config: null },
    }));
    setCredentials((prev) => ({
      ...prev,
      [service]:
        service === "attio"
          ? { token: "", objectId: "" }
          : { token: "", baseId: "" },
    }));
    const serviceName = service === "attio" ? "Attio" : "Airtable";
    toast.success(`Disconnected from ${serviceName}`);
  };

  const bothConnected =
    connections.attio.connected && connections.airtable.connected;

  // Auto-advance to field mapping when both connections are established
  useEffect(() => {
    if (bothConnected) {
      // Add a small delay to show the success state before advancing
      const timer = setTimeout(() => {
        onNext();
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [bothConnected, onNext]);

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
          <Zap className="text-white" size={40} />
        </motion.div>
        <h1 className="display-5 fw-bold text-dark mb-3">
          Enterprise Data Sync
        </h1>
        <p className="lead text-muted mx-auto" style={{ maxWidth: "600px" }}>
          Connect your Attio CRM and Airtable workspace with secure token
          authentication for seamless, professional-grade data synchronization.
        </p>

        {/* Environment tokens indicator */}
        {(import.meta.env.VITE_ATTIO_TOKEN ||
          import.meta.env.VITE_AIRTABLE_TOKEN) && (
          <Alert
            variant="info"
            className="mt-4 mx-auto"
            style={{ maxWidth: "600px" }}
          >
            <div className="d-flex align-items-center">
              <Key size={16} className="me-2" />
              <small>
                <strong>Development Mode:</strong> Using tokens from environment
                variables
                {import.meta.env.VITE_AUTO_LOAD_TOKENS === "true" &&
                  " (auto-connecting...)"}
              </small>
            </div>
          </Alert>
        )}
      </motion.div>

      {/* Connection Cards Grid */}
      <Row className="g-4 mb-5">
        {/* Attio Connection Card */}
        <Col lg={6}>
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="professional-card h-100 border-0 shadow">
              {/* Card Header */}
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
                <div className="position-relative d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center">
                    <div className="bg-white bg-opacity-20 rounded-3 p-3 me-3">
                      <Database className="text-white" size={24} />
                    </div>
                    <div>
                      <h4 className="mb-1 fw-bold">Attio CRM</h4>
                      <p className="mb-0 opacity-75">
                        Customer Relationship Management
                      </p>
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
                        <Badge
                          bg="success"
                          className="d-flex align-items-center"
                        >
                          <CheckCircle size={16} className="me-1" />
                          Connected
                        </Badge>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Card Content */}
              <Card.Body className="p-4">
                {/* Security Features */}
                <div className="mb-4">
                  <div className="d-flex align-items-center mb-2">
                    <Shield size={16} className="text-success me-2" />
                    <small className="text-muted">
                      Secure API token authentication
                    </small>
                  </div>
                  <div className="d-flex align-items-center mb-2">
                    <Key size={16} className="text-primary me-2" />
                    <small className="text-muted">
                      Full workspace access control
                    </small>
                  </div>
                  <div className="d-flex align-items-center">
                    <Settings size={16} className="text-info me-2" />
                    <small className="text-muted">
                      Real-time data synchronization
                    </small>
                  </div>
                </div>

                {/* Input Fields */}
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold text-dark">
                      API Token <span className="text-danger">*</span>
                    </Form.Label>
                    <div className="position-relative">
                      <Form.Control
                        type={showTokens.attio ? "text" : "password"}
                        value={credentials.attio.token}
                        onChange={(e) =>
                          setCredentials((prev) => ({
                            ...prev,
                            attio: { ...prev.attio, token: e.target.value },
                          }))
                        }
                        className="form-control-professional pe-5"
                        placeholder="Enter your Attio API token"
                      />
                      <Button
                        variant="link"
                        className="position-absolute end-0 top-50 translate-middle-y text-muted border-0 bg-transparent"
                        onClick={() =>
                          setShowTokens((prev) => ({
                            ...prev,
                            attio: !prev.attio,
                          }))
                        }
                        style={{ zIndex: 5 }}
                      >
                        {showTokens.attio ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </Button>
                    </div>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold text-dark">
                      Object ID
                      <small className="text-muted ms-1">(Optional)</small>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      value={credentials.attio.objectId}
                      onChange={(e) =>
                        setCredentials((prev) => ({
                          ...prev,
                          attio: { ...prev.attio, objectId: e.target.value },
                        }))
                      }
                      className="form-control-professional"
                      placeholder="object-id (e.g. people, companies - leave blank to browse all)"
                    />
                    <Form.Text className="text-muted">
                      Specify a particular object ID (like 'people' or
                      'companies'), or leave blank to see all available objects
                    </Form.Text>
                  </Form.Group>
                </Form>

                {/* Action Buttons */}
                {connections.attio.connected ? (
                  <div>
                    <Button
                      variant="success"
                      disabled
                      className="w-100 btn-professional py-3 mb-2"
                    >
                      <CheckCircle size={20} className="me-2" />
                      Successfully Connected
                    </Button>
                    <Button
                      variant="outline-secondary"
                      onClick={() => handleDisconnect("attio")}
                      className="w-100 btn-professional"
                    >
                      Disconnect
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={() => testConnection("attio")}
                    disabled={testing.attio || !credentials.attio.token.trim()}
                    className="w-100 btn-professional btn-professional-primary py-3"
                  >
                    {testing.attio ? (
                      <>
                        <div className="spinner-professional me-2"></div>
                        Testing Connection...
                      </>
                    ) : (
                      <>
                        <Database size={20} className="me-2" />
                        Connect to Attio
                      </>
                    )}
                  </Button>
                )}

                {/* Help Text */}
                <Alert variant="primary" className="mt-3 mb-0">
                  <div className="d-flex align-items-start">
                    <ExternalLink
                      size={16}
                      className="me-2 mt-1 flex-shrink-0"
                    />
                    <small>
                      Get your API token from Attio Settings → Apps &
                      Integrations
                    </small>
                  </div>
                </Alert>
              </Card.Body>
            </Card>
          </motion.div>
        </Col>

        {/* Airtable Connection Card */}
        <Col lg={6}>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="professional-card h-100 border-0 shadow">
              {/* Card Header */}
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
                      <Database className="text-white" size={24} />
                    </div>
                    <div>
                      <h4 className="mb-1 fw-bold">Airtable</h4>
                      <p className="mb-0 opacity-75">Cloud Database Platform</p>
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
                        <Badge
                          bg="success"
                          className="d-flex align-items-center"
                        >
                          <CheckCircle size={16} className="me-1" />
                          Connected
                        </Badge>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Card Content */}
              <Card.Body className="p-4">
                {/* Security Features */}
                <div className="mb-4">
                  <div className="d-flex align-items-center mb-2">
                    <Shield size={16} className="text-success me-2" />
                    <small className="text-muted">
                      Personal Access Token security
                    </small>
                  </div>
                  <div className="d-flex align-items-center mb-2">
                    <Key size={16} className="text-warning me-2" />
                    <small className="text-muted">
                      Base-level access control
                    </small>
                  </div>
                  <div className="d-flex align-items-center">
                    <Settings size={16} className="text-danger me-2" />
                    <small className="text-muted">
                      Table and field management
                    </small>
                  </div>
                </div>

                {/* Input Fields */}
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold text-dark">
                      Personal Access Token{" "}
                      <span className="text-danger">*</span>
                    </Form.Label>
                    <div className="position-relative">
                      <Form.Control
                        type={showTokens.airtable ? "text" : "password"}
                        value={credentials.airtable.token}
                        onChange={(e) =>
                          setCredentials((prev) => ({
                            ...prev,
                            airtable: {
                              ...prev.airtable,
                              token: e.target.value,
                            },
                          }))
                        }
                        className="form-control-professional pe-5"
                        placeholder="Enter your Airtable Personal Access Token"
                      />
                      <Button
                        variant="link"
                        className="position-absolute end-0 top-50 translate-middle-y text-muted border-0 bg-transparent"
                        onClick={() =>
                          setShowTokens((prev) => ({
                            ...prev,
                            airtable: !prev.airtable,
                          }))
                        }
                        style={{ zIndex: 5 }}
                      >
                        {showTokens.airtable ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </Button>
                    </div>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold text-dark">
                      Base ID <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      value={credentials.airtable.baseId}
                      onChange={(e) =>
                        setCredentials((prev) => ({
                          ...prev,
                          airtable: {
                            ...prev.airtable,
                            baseId: e.target.value,
                          },
                        }))
                      }
                      className="form-control-professional"
                      placeholder="app1234567890abcdef"
                    />
                    <Form.Text className="text-muted">
                      Found in your Airtable base URL or API documentation
                    </Form.Text>
                  </Form.Group>
                </Form>

                {/* Action Buttons */}
                {connections.airtable.connected ? (
                  <div>
                    <Button
                      variant="success"
                      disabled
                      className="w-100 btn-professional py-3 mb-2"
                    >
                      <CheckCircle size={20} className="me-2" />
                      Successfully Connected
                    </Button>
                    <Button
                      variant="outline-secondary"
                      onClick={() => handleDisconnect("airtable")}
                      className="w-100 btn-professional"
                    >
                      Disconnect
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={() => testConnection("airtable")}
                    disabled={
                      testing.airtable ||
                      !credentials.airtable.token.trim() ||
                      !credentials.airtable.baseId.trim()
                    }
                    className="w-100 btn-professional btn-professional-secondary py-3"
                  >
                    {testing.airtable ? (
                      <>
                        <div className="spinner-professional me-2"></div>
                        Testing Connection...
                      </>
                    ) : (
                      <>
                        <Database size={20} className="me-2" />
                        Connect to Airtable
                      </>
                    )}
                  </Button>
                )}

                {/* Help Text */}
                <Alert variant="warning" className="mt-3 mb-0">
                  <div className="d-flex align-items-start">
                    <ExternalLink
                      size={16}
                      className="me-2 mt-1 flex-shrink-0"
                    />
                    <small>
                      Create a Personal Access Token in your Airtable Developer
                      Hub
                    </small>
                  </div>
                </Alert>
              </Card.Body>
            </Card>
          </motion.div>
        </Col>
      </Row>

      {/* Continue Section */}
      <AnimatePresence>
        {bothConnected && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-center"
          >
            <Card className="professional-card border-0 bg-success-gradient text-white">
              <Card.Body className="p-5">
                <div className="d-flex align-items-center justify-content-center mb-4">
                  <CheckCircle size={32} className="me-3" />
                  <h3 className="mb-0 fw-bold">Connections Established</h3>
                </div>
                <p className="lead mb-4">
                  Both services are now connected and ready for data
                  synchronization.
                </p>
                <Button
                  onClick={onNext}
                  size="lg"
                  className="btn-professional px-5 py-3 fw-bold"
                  style={{
                    background: "rgba(255, 255, 255, 0.2)",
                    border: "2px solid rgba(255, 255, 255, 0.3)",
                    color: "white",
                  }}
                >
                  Continue to Field Mapping →
                </Button>
              </Card.Body>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status Indicator */}
      {!bothConnected && (
        <motion.div
          className="d-flex justify-content-center mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <Card
            className="border-0 bg-white bg-opacity-60"
            style={{ backdropFilter: "blur(10px)" }}
          >
            <Card.Body className="px-4 py-3">
              <div className="d-flex align-items-center">
                <AlertCircle size={20} className="text-warning me-3" />
                <span className="text-dark fw-medium">
                  {!connections.attio.connected &&
                  !connections.airtable.connected
                    ? "Connect to both services to continue"
                    : !connections.attio.connected
                      ? "Connect to Attio to continue"
                      : "Connect to Airtable to continue"}
                </span>
              </div>
            </Card.Body>
          </Card>
        </motion.div>
      )}
    </Container>
  );
}
