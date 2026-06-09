import { useState } from 'react'

interface ImageUploadProps {
  previewSrc: string | null
  onFile: (file: File | undefined) => void
}

export function ImageUpload({ previewSrc, onFile }: ImageUploadProps) {
  const [dragOver, setDragOver] = useState(false)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)
    onFile(e.dataTransfer.files[0])
  }

  return (
    <div className="input-section">
      <h3>Source Image</h3>
      <label
        className={`file-input-wrapper${dragOver ? ' drag-over' : ''}`}
        onDragOver={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setDragOver(true)
        }}
        onDragLeave={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setDragOver(false)
        }}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept="image/*,.jpg,.jpeg,.png,.gif,.bmp,.webp,.svg"
          onChange={(e) => onFile(e.target.files?.[0])}
        />
        <span>{dragOver ? 'Drop to upload' : 'Drag & drop an image, or click to browse'}</span>
      </label>
      {previewSrc && (
        <div className="image-preview">
          <img src={previewSrc} alt="Selected preview" />
        </div>
      )}
    </div>
  )
}
