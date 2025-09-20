import React from 'react';
import { Alert, Modal, Button } from 'react-bootstrap';
import { AlertTriangle, Shield, ArrowRight } from 'lucide-react';

export default function SyncDirectionValidator({
  syncConfig,
  show,
  onHide,
  onConfirm,
  onChangeDirection
}) {
  const isOneWaySync = syncConfig.syncDirection === 'attio-to-airtable' ||
                       syncConfig.syncDirection === 'airtable-to-attio';

  const isBidirectionalSync = syncConfig.syncDirection === 'bidirectional';

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center">
          <AlertTriangle className="me-2 text-warning" size={24} />
          Sync Direction Confirmation
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {isBidirectionalSync && (
          <div>
            <Alert variant="warning" className="mb-4">
              <div className="d-flex align-items-start">
                <AlertTriangle size={20} className="me-3 mt-1 flex-shrink-0" />
                <div>
                  <h6 className="mb-2">⚠️ Advanced Bidirectional Sync Warning</h6>
                  <p className="mb-0">
                    You've selected bidirectional sync, which can lead to data conflicts,
                    duplicates, and unexpected changes in both systems. This requires careful
                    field mapping and conflict resolution.
                  </p>
                </div>
              </div>
            </Alert>

            <div className="mb-4">
              <h6>Potential Risks:</h6>
              <ul className="text-muted">
                <li>Data overwriting between systems</li>
                <li>Infinite sync loops if not configured properly</li>
                <li>Difficult to troubleshoot sync conflicts</li>
                <li>Higher chance of data corruption</li>
              </ul>
            </div>

            <Alert variant="success" className="mb-4">
              <div className="d-flex align-items-start">
                <Shield size={20} className="me-3 mt-1 flex-shrink-0 text-success" />
                <div>
                  <h6 className="mb-2">💡 Recommended: One-Way Sync</h6>
                  <p className="mb-2">
                    For most use cases, one-way sync from Attio to Airtable is safer and more predictable.
                  </p>
                  <Button
                    variant="outline-success"
                    size="sm"
                    onClick={() => onChangeDirection('attio-to-airtable')}
                    className="me-2"
                  >
                    <ArrowRight size={16} className="me-1" />
                    Switch to Attio → Airtable
                  </Button>
                </div>
              </div>
            </Alert>
          </div>
        )}

        {isOneWaySync && (
          <Alert variant="success" className="mb-4">
            <div className="d-flex align-items-start">
              <Shield size={20} className="me-3 mt-1 flex-shrink-0 text-success" />
              <div>
                <h6 className="mb-2">✅ Safe One-Way Sync Selected</h6>
                <p className="mb-0">
                  {syncConfig.syncDirection === 'attio-to-airtable'
                    ? 'Data will flow from Attio to Airtable only. This prevents conflicts and ensures data integrity.'
                    : 'Data will flow from Airtable to Attio only. This prevents conflicts and ensures data integrity.'}
                </p>
              </div>
            </div>
          </Alert>
        )}

        <div className="bg-light p-3 rounded">
          <h6>Current Configuration:</h6>
          <div className="d-flex align-items-center">
            <span className="fw-semibold me-2">Direction:</span>
            <span className={`badge ${
              syncConfig.syncDirection === 'attio-to-airtable' ? 'bg-success' :
              syncConfig.syncDirection === 'airtable-to-attio' ? 'bg-info' :
              'bg-warning'
            }`}>
              {syncConfig.syncDirection === 'attio-to-airtable' ? 'Attio → Airtable' :
               syncConfig.syncDirection === 'airtable-to-attio' ? 'Airtable → Attio' :
               'Bidirectional'}
            </span>
          </div>
          <div className="mt-2">
            <span className="fw-semibold me-2">Safety Features:</span>
            {syncConfig.preventDeletes && <span className="badge bg-success me-1">Delete Prevention</span>}
            {syncConfig.createBackups && <span className="badge bg-info me-1">Backups Enabled</span>}
            {syncConfig.dryRunFirst && <span className="badge bg-secondary me-1">Dry Run First</span>}
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onHide}>
          Go Back
        </Button>
        <Button
          variant={isBidirectionalSync ? "warning" : "success"}
          onClick={onConfirm}
        >
          {isBidirectionalSync ? "⚠️ Proceed with Bidirectional Sync" : "✅ Continue with One-Way Sync"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
