import type { RefObject } from 'react'
import type { Settings, Status } from '../types'

interface OutputPanelProps {
  ascii: string
  status: Status
  settings: Settings
  isImageOutput: boolean
  canvasRef: RefObject<HTMLCanvasElement | null>
  onCopy: () => void
  onDownloadText: () => void
  onSaveImage: () => void
  onClear: () => void
}

export function OutputPanel({
  ascii,
  status,
  settings,
  isImageOutput,
  canvasRef,
  onCopy,
  onDownloadText,
  onSaveImage,
  onClear,
}: OutputPanelProps) {
  const hasOutput = ascii.trim().length > 0

  return (
    <main className="panel">
      <div className="panel-header">
        <div className="output-controls">
          <button type="button" className="btn btn-primary" onClick={onCopy} disabled={!hasOutput}>
            Copy
          </button>
          {!isImageOutput && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onDownloadText}
              disabled={!hasOutput}
            >
              Download .txt
            </button>
          )}
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onSaveImage}
            disabled={!hasOutput}
          >
            Save .png
          </button>
          <button type="button" className="btn btn-danger" onClick={onClear} disabled={!hasOutput}>
            Clear
          </button>
        </div>
        <div className="status-display">
          <span className={`status-dot ${status.type}`} />
          <span className="status-message">{status.message}</span>
        </div>
      </div>

      <div className="output-area">
        <div className="output-container">
          {isImageOutput ? (
            <canvas className="ascii-image" ref={canvasRef} />
          ) : (
            <textarea
              className="ascii-output"
              placeholder="ASCII art will appear here…"
              readOnly
              value={ascii}
              style={{
                backgroundColor: settings.bgColor,
                color: settings.textColor,
                fontSize: `${settings.fontSize + 8}px`,
              }}
            />
          )}
        </div>
      </div>
    </main>
  )
}
