import { useCallback, useEffect, useRef, useState } from 'react'
import {
  DEFAULT_SETTINGS,
  GENERATE_DEBOUNCE_MS,
  MAX_FILE_SIZE,
  VALID_IMAGE_TYPES,
} from '../constants'
import {
  drawAsciiToContext,
  downloadBlob,
  generateImageAscii,
  generateTextAscii,
  getRenderMetrics,
  resolveCharacterSet,
  type SampledImage,
} from '../lib/asciiUtils'
import type { Mode, Settings, Status, UpdateSetting } from '../types'

export function useAsciiConverter() {
  const [mode, setMode] = useState<Mode>('image')
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [previewSrc, setPreviewSrc] = useState<string | null>(null)
  const [text, setText] = useState('')
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [ascii, setAscii] = useState('')
  const [status, setStatus] = useState<Status>({ message: 'No image selected', type: 'info' })

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const lastImageDataRef = useRef<SampledImage | null>(null)

  const isTextMode = mode === 'text'
  const isImageOutput = settings.outputFormat === 'image'

  const setStatusMsg = useCallback((message: string, type: Status['type'] = 'info') => {
    setStatus({ message, type })
  }, [])

  const updateSetting = useCallback<UpdateSetting>((key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }, [])

  const reset = useCallback(() => {
    setAscii('')
    setImage(null)
    setPreviewSrc(null)
    setText('')
    lastImageDataRef.current = null
  }, [])

  const changeMode = useCallback(
    (next: Mode) => {
      setMode(next)
      reset()
      setStatusMsg('Ready to generate ASCII art', 'info')
    },
    [reset, setStatusMsg],
  )

  const clear = useCallback(() => {
    reset()
    setStatusMsg('Cleared', 'info')
  }, [reset, setStatusMsg])

  const loadImageFile = useCallback(
    (file: File | undefined) => {
      if (!file) {
        setStatusMsg('No file selected', 'info')
        setImage(null)
        return
      }
      if (file.size > MAX_FILE_SIZE) {
        setStatusMsg('File too large. Please select an image smaller than 10MB', 'error')
        return
      }
      if (!file.type.startsWith('image/') && !VALID_IMAGE_TYPES.includes(file.type)) {
        setStatusMsg(
          'Please select a valid image file (JPEG, PNG, GIF, BMP, WebP, SVG, TIFF, ICO)',
          'error',
        )
        return
      }

      setStatusMsg('Loading image...', 'info')
      const reader = new FileReader()
      reader.onload = (event) => {
        const src = event.target?.result as string
        const img = new Image()
        img.onload = () => {
          setImage(img)
          setPreviewSrc(src)
          setStatusMsg(`Image loaded: ${file.name} (${img.width}×${img.height})`, 'success')
          updateSetting('width', Math.min(Math.max(Math.floor(img.width / 10), 40), 150))
        }
        img.onerror = () => {
          setStatusMsg('Error loading image. Please try a different image file.', 'error')
          setImage(null)
        }
        img.src = src
      }
      reader.onerror = () => {
        setStatusMsg('Error reading file. Please try again.', 'error')
        setImage(null)
      }
      reader.readAsDataURL(file)
    },
    [setStatusMsg, updateSetting],
  )

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isTextMode) {
        const out = generateTextAscii(text)
        setAscii(out)
        if (out) setStatusMsg('Text ASCII art generated!', 'success')
        return
      }

      if (!image) {
        setAscii('')
        return
      }

      try {
        setStatusMsg('Processing image...', 'info')
        const result = generateImageAscii(
          image,
          resolveCharacterSet(settings.charSet, settings.customChars),
          settings.width,
          settings.invert,
        )
        lastImageDataRef.current = result.imageData
        setAscii(result.ascii)
        setStatusMsg(
          `Image ASCII art generated! (${result.width}×${result.height} characters)`,
          'success',
        )
      } catch (err) {
        setStatusMsg(err instanceof Error ? err.message : 'Error generating ASCII art', 'error')
      }
    }, GENERATE_DEBOUNCE_MS)

    return () => clearTimeout(timer)
  }, [
    isTextMode,
    text,
    image,
    settings.charSet,
    settings.customChars,
    settings.width,
    settings.invert,
    setStatusMsg,
  ])

  useEffect(() => {
    if (!isImageOutput) return
    const canvas = canvasRef.current
    if (!canvas) return

    const lines = ascii.split('\n').filter((line) => line.length > 0)
    if (lines.length === 0) {
      canvas.width = 0
      canvas.height = 0
      return
    }

    const metrics = getRenderMetrics(lines, settings.fontSize, 1.1)
    canvas.width = metrics.canvasWidth
    canvas.height = metrics.canvasHeight

    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = settings.bgColor
    ctx.fillRect(0, 0, metrics.canvasWidth, metrics.canvasHeight)
    drawAsciiToContext(
      ctx,
      lines,
      metrics,
      settings.useOriginalColors,
      lastImageDataRef.current,
      settings.textColor,
    )
  }, [
    ascii,
    isImageOutput,
    settings.fontSize,
    settings.bgColor,
    settings.textColor,
    settings.useOriginalColors,
  ])

  const copyToClipboard = useCallback(() => {
    if (!ascii.trim()) {
      setStatusMsg('No ASCII art to copy', 'error')
      return
    }
    navigator.clipboard
      .writeText(ascii)
      .then(() => setStatusMsg('ASCII art copied to clipboard!', 'success'))
      .catch(() => setStatusMsg('Unable to copy to clipboard', 'error'))
  }, [ascii, setStatusMsg])

  const downloadAsText = useCallback(() => {
    if (!ascii.trim()) {
      setStatusMsg('No ASCII art to download', 'error')
      return
    }
    downloadBlob(new Blob([ascii], { type: 'text/plain' }), `ascii-art-${Date.now()}.txt`)
    setStatusMsg('ASCII art downloaded!', 'success')
  }, [ascii, setStatusMsg])

  const saveAsImage = useCallback(() => {
    const canvas = canvasRef.current
    if (isImageOutput && canvas && canvas.width > 0) {
      canvas.toBlob((blob) => {
        if (blob) downloadBlob(blob, `ascii-art-${Date.now()}.png`)
        setStatusMsg('ASCII image saved!', 'success')
      })
      return
    }

    if (!ascii.trim()) {
      setStatusMsg('No ASCII art to save', 'error')
      return
    }

    const lines = ascii.split('\n')
    const metrics = getRenderMetrics(lines, settings.fontSize, 1.2)
    const exportCanvas = document.createElement('canvas')
    const ctx = exportCanvas.getContext('2d')
    if (!ctx) return
    exportCanvas.width = metrics.canvasWidth
    exportCanvas.height = metrics.canvasHeight
    ctx.fillStyle = settings.bgColor
    ctx.fillRect(0, 0, metrics.canvasWidth, metrics.canvasHeight)
    drawAsciiToContext(
      ctx,
      lines,
      metrics,
      settings.useOriginalColors,
      lastImageDataRef.current,
      settings.textColor,
    )
    exportCanvas.toBlob((blob) => {
      if (blob) downloadBlob(blob, `ascii-art-${Date.now()}.png`)
      setStatusMsg('ASCII art saved as image!', 'success')
    })
  }, [ascii, isImageOutput, settings, setStatusMsg])

  return {
    // state
    mode,
    isTextMode,
    isImageOutput,
    previewSrc,
    text,
    settings,
    ascii,
    status,
    canvasRef,
    // handlers
    changeMode,
    setText,
    updateSetting,
    loadImageFile,
    copyToClipboard,
    downloadAsText,
    saveAsImage,
    clear,
  }
}
