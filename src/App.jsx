import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster } from "react-hot-toast";
import {
  Database,
  Zap,
  Settings,
  Play,
  MapPin,
  CheckCircle,
  Lock,
  BarChart3,
} from "lucide-react";
import { Container, Row, Col, Card, Badge, Button } from "react-bootstrap";
import ProfessionalConnectionSetup from "./components/ProfessionalConnectionSetup";
import ModernFieldMapping from "./components/ModernFieldMapping";
import SyncConfiguration from "./components/SyncConfiguration";
import SyncStatus from "./components/SyncStatus";

function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [connections, setConnections] = useState({
    attio: { connected: false, config: null },
    airtable: { connected: false, config: null },
  });
  const [fieldMappings, setFieldMappings] = useState([]);
  const [syncConfig, setSyncConfig] = useState({
    syncDirection: "attio-to-airtable",
    preventDeletes: true,
    createBackups: false,
    schedule: "manual",
    createNew: true,
    updateExisting: true,
  });

  const steps = [
    {
      id: 1,
      name: "Connect",
      description: "Authentication",
      icon: Database,
      color: "primary",
    },
    {
      id: 2,
      name: "Map",
      description: "Field Mapping",
      icon: MapPin,
      color: "info",
    },
    {
      id: 3,
      name: "Configure",
      description: "Sync Settings",
      icon: Settings,
      color: "warning",
    },
    {
      id: 4,
      name: "Sync",
      description: "Execute",
      icon: Play,
      color: "success",
    },
  ];

  const canProceedToStep = (stepId) => {
    switch (stepId) {
      case 2:
        return connections.attio.connected && connections.airtable.connected;
      case 3:
        return fieldMappings.length > 0;
      case 4:
        return true;
      default:
        return true;
    }
  };

  const getStepStatus = (stepId) => {
    if (currentStep > stepId) return "completed";
    if (currentStep === stepId) return "active";
    if (canProceedToStep(stepId)) return "available";
    return "locked";
  };

  const getStepVariant = (status) => {
    switch (status) {
      case "active":
        return "primary";
      case "completed":
        return "success";
      case "available":
        return "outline-secondary";
      default:
        return "light";
    }
  };

  return (
    <div
      className="min-vh-100"
      style={{
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
      }}
    >
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(0, 0, 0, 0.1)",
            borderRadius: "16px",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15)",
            fontSize: "14px",
            fontWeight: "500",
          },
        }}
      />

      {/* Professional Header */}
      <header className="professional-header sticky-top">
        <Container>
          <Row className="py-4 align-items-center">
            <Col md={6}>
              <div className="d-flex align-items-center">
                <motion.div
                  className="bg-primary-gradient rounded-3 p-3 me-3 shadow"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Zap className="text-white" size={24} />
                </motion.div>
                <div>
                  <h2 className="mb-1 fw-bold text-dark">DataSync Pro</h2>
                  <p className="mb-0 text-muted fw-medium">
                    Enterprise Data Integration Platform
                  </p>
                </div>
              </div>
            </Col>
            <Col md={6}>
              <div className="d-flex justify-content-end align-items-center">
                <div className="d-flex align-items-center me-4">
                  <div
                    className={`connection-dot ${connections.attio.connected ? "connected" : "disconnected"}`}
                  ></div>
                  <small className="fw-medium text-dark me-3">Attio</small>
                  <div
                    className={`connection-dot ${connections.airtable.connected ? "connected" : "disconnected"}`}
                  ></div>
                  <small className="fw-medium text-dark">Airtable</small>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </header>

      {/* Professional Progress Steps */}
      <div className="bg-white border-bottom">
        <Container>
          <Row className="py-4">
            <Col>
              <div className="d-flex justify-content-between align-items-center">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  const status = getStepStatus(step.id);

                  return (
                    <div
                      key={step.id}
                      className="d-flex align-items-center flex-fill"
                    >
                      <motion.div
                        className="d-flex align-items-center cursor-pointer"
                        onClick={() =>
                          canProceedToStep(step.id) && setCurrentStep(step.id)
                        }
                        whileHover={status !== "locked" ? { scale: 1.02 } : {}}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        {/* Step Circle */}
                        <motion.div
                          className={`step-indicator ${status}`}
                          animate={{
                            scale: status === "active" ? 1.1 : 1,
                          }}
                          transition={{ duration: 0.3 }}
                        >
                          {status === "completed" ? (
                            <CheckCircle size={24} />
                          ) : status === "locked" ? (
                            <Lock size={20} />
                          ) : (
                            <Icon size={20} />
                          )}
                        </motion.div>

                        {/* Step Info */}
                        <div className="ms-3 d-none d-md-block">
                          <div
                            className={`fw-bold ${
                              status === "active"
                                ? "text-primary"
                                : status === "completed"
                                  ? "text-success"
                                  : status === "available"
                                    ? "text-dark"
                                    : "text-muted"
                            }`}
                          >
                            {step.name}
                          </div>
                          <small
                            className={`${
                              status === "active"
                                ? "text-primary"
                                : status === "completed"
                                  ? "text-success"
                                  : status === "available"
                                    ? "text-secondary"
                                    : "text-muted"
                            }`}
                          >
                            {step.description}
                          </small>
                        </div>
                      </motion.div>

                      {/* Progress Line */}
                      {index < steps.length - 1 && (
                        <div className="flex-fill mx-4 d-none d-lg-block">
                          <div className="position-relative">
                            <div
                              className="bg-light"
                              style={{ height: "4px", borderRadius: "2px" }}
                            ></div>
                            <motion.div
                              className="position-absolute top-0 start-0 bg-success"
                              style={{ height: "4px", borderRadius: "2px" }}
                              initial={{ width: "0%" }}
                              animate={{
                                width: currentStep > step.id ? "100%" : "0%",
                              }}
                              transition={{ duration: 0.5, ease: "easeInOut" }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Main Content */}
      <main>
        <Container className="py-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              style={{ minHeight: "600px" }}
            >
              {currentStep === 1 && (
                <ProfessionalConnectionSetup
                  connections={connections}
                  setConnections={setConnections}
                  onNext={() => setCurrentStep(2)}
                />
              )}

              {currentStep === 2 && (
                <ModernFieldMapping
                  connections={connections}
                  fieldMappings={fieldMappings}
                  setFieldMappings={setFieldMappings}
                  onNext={(tableInfo) => {
                    // Store the selected table and Attio object information in sync config
                    if (tableInfo) {
                      setSyncConfig((prev) => ({
                        ...prev,
                        airtableTableId: tableInfo.airtableTableId,
                        airtableTableName: tableInfo.airtableTableName,
                        attioObjectId: tableInfo.attioObjectId,
                        attioObjectName: tableInfo.attioObjectName,
                        attioObjectType: tableInfo.attioObjectType,
                        parentObjectType: tableInfo.parentObjectType,
                      }));
                    }
                    setCurrentStep(3);
                  }}
                  onBack={() => setCurrentStep(1)}
                />
              )}

              {currentStep === 3 && (
                <SyncConfiguration
                  syncConfig={syncConfig}
                  setSyncConfig={setSyncConfig}
                  onNext={() => setCurrentStep(4)}
                  onBack={() => setCurrentStep(2)}
                />
              )}

              {currentStep === 4 && (
                <SyncStatus
                  connections={connections}
                  fieldMappings={fieldMappings}
                  syncConfig={syncConfig}
                  onBack={() => setCurrentStep(3)}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </Container>
      </main>

      {/* Professional Footer */}
      <footer className="bg-white border-top mt-5">
        <Container>
          <Row className="py-4 align-items-center">
            <Col md={6}>
              <div className="d-flex align-items-center">
                <div className="bg-secondary-gradient rounded-2 p-2 me-3">
                  <BarChart3 className="text-white" size={16} />
                </div>
                <div>
                  <small className="fw-bold text-dark d-block">
                    DataSync Pro
                  </small>
                  <small className="text-muted">
                    Professional Data Integration
                  </small>
                </div>
              </div>
            </Col>
            <Col md={6}>
              <div className="d-flex justify-content-end">
                <Badge bg="light" text="dark" className="badge-professional">
                  Secure • Reliable • Professional
                </Badge>
              </div>
            </Col>
          </Row>
        </Container>
      </footer>
    </div>
  );
}

export default App;
