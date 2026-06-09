import { ASCII_CHARS, ASCII_FONTS, type CharSetKey } from './asciiData'

export function resolveCharacterSet(charSet: CharSetKey, customChars: string): string[] {
  if (charSet === 'custom' && customChars.trim()) {
    return customChars.trim().split('')
  }
  return ASCII_CHARS[charSet as Exclude<CharSetKey, 'custom'>] || ASCII_CHARS.standard
}

export interface SampledImage {
  data: Uint8ClampedArray
  width: number
  height: number
}

export interface RenderMetrics {
  fontSize: number
  lineHeight: number
  charWidth: number
  padding: number
  maxLineLength: number
  canvasWidth: number
  canvasHeight: number
}

export function generateTextAscii(input: string): string {
  const text = input.toUpperCase().slice(0, 20)
  if (!text.trim()) return ''

  const lines = ['', '', '', '', '']
  for (const char of text) {
    const pattern = ASCII_FONTS[char] || ASCII_FONTS[' ']
    for (let i = 0; i < 5; i++) {
      lines[i] += pattern[i] + ' '
    }
  }
  return lines.join('\n')
}

export interface ImageAsciiResult {
  ascii: string
  imageData: SampledImage
  width: number
  height: number
}

export function generateImageAscii(
  image: HTMLImageElement,
  chars: string[],
  targetWidth: number,
  invert: boolean,
): ImageAsciiResult {
  const aspectRatio = image.height / image.width
  const asciiHeight = Math.floor(targetWidth * aspectRatio * 0.5)

  if (targetWidth > 300 || asciiHeight > 300) {
    throw new Error('Output dimensions too large. Please reduce the width.')
  }

  const tempCanvas = document.createElement('canvas')
  const tempCtx = tempCanvas.getContext('2d')
  if (!tempCtx) {
    throw new Error('Canvas not supported. Please try a different browser.')
  }

  tempCanvas.width = targetWidth
  tempCanvas.height = asciiHeight

  tempCtx.fillStyle = '#FFFFFF'
  tempCtx.fillRect(0, 0, targetWidth, asciiHeight)
  tempCtx.imageSmoothingEnabled = true
  tempCtx.imageSmoothingQuality = 'high'
  tempCtx.drawImage(image, 0, 0, targetWidth, asciiHeight)

  let imageData: ImageData
  try {
    imageData = tempCtx.getImageData(0, 0, targetWidth, asciiHeight)
  } catch {
    throw new Error('Error processing image data. Image may be corrupted.')
  }

  const pixels = imageData.data
  let ascii = ''
  for (let y = 0; y < asciiHeight; y++) {
    for (let x = 0; x < targetWidth; x++) {
      const index = (y * targetWidth + x) * 4
      const r = pixels[index]
      const g = pixels[index + 1]
      const b = pixels[index + 2]
      const alpha = pixels[index + 3]

      const alphaRatio = alpha / 255
      const blendedR = r * alphaRatio + 255 * (1 - alphaRatio)
      const blendedG = g * alphaRatio + 255 * (1 - alphaRatio)
      const blendedB = b * alphaRatio + 255 * (1 - alphaRatio)

      const gray = 0.299 * blendedR + 0.587 * blendedG + 0.114 * blendedB
      let intensity = gray / 255
      if (invert) intensity = 1 - intensity

      const charIndex = Math.min(Math.floor(intensity * chars.length), chars.length - 1)
      ascii += chars[charIndex]
    }
    ascii += '\n'
  }
  ascii = ascii.slice(0, -1)

  return {
    ascii,
    imageData: { data: pixels, width: targetWidth, height: asciiHeight },
    width: targetWidth,
    height: asciiHeight,
  }
}

export function getRenderMetrics(
  lines: string[],
  fontSizeSetting: number,
  lineHeightMultiplier = 1.1,
): RenderMetrics {
  const fontSize = fontSizeSetting + 8
  const lineHeight = fontSize * lineHeightMultiplier
  const charWidth = fontSize * 0.6
  const padding = 20
  const maxLineLength = Math.max(...lines.map((line) => line.length))

  return {
    fontSize,
    lineHeight,
    charWidth,
    padding,
    maxLineLength,
    canvasWidth: maxLineLength * charWidth + padding * 2,
    canvasHeight: lines.length * lineHeight + padding * 2,
  }
}

function getAverageColor(
  img: SampledImage,
  xStart: number,
  xEnd: number,
  yStart: number,
  yEnd: number,
): [number, number, number] {
  const { data, width, height } = img
  let r = 0
  let g = 0
  let b = 0
  let count = 0
  const xs = Math.max(0, Math.floor(xStart))
  const xe = Math.min(width - 1, Math.floor(xEnd))
  const ys = Math.max(0, Math.floor(yStart))
  const ye = Math.min(height - 1, Math.floor(yEnd))

  for (let yy = ys; yy <= ye; yy++) {
    for (let xx = xs; xx <= xe; xx++) {
      const i = (yy * width + xx) * 4
      r += data[i]
      g += data[i + 1]
      b += data[i + 2]
      count++
    }
  }

  if (count === 0) return [0, 0, 0]
  return [Math.round(r / count), Math.round(g / count), Math.round(b / count)]
}

export function drawAsciiToContext(
  ctx: CanvasRenderingContext2D,
  lines: string[],
  metrics: RenderMetrics,
  useOriginalColors: boolean,
  imgData: SampledImage | null,
  defaultTextColor: string,
): void {
  const { fontSize, lineHeight, charWidth, padding, maxLineLength } = metrics

  ctx.font = `${fontSize}px 'Courier New', monospace`
  ctx.textBaseline = 'top'

  for (let row = 0; row < lines.length; row++) {
    const line = lines[row]
    for (let col = 0; col < line.length; col++) {
      let fill = defaultTextColor

      if (useOriginalColors && imgData) {
        const x0 = (col / maxLineLength) * imgData.width
        const x1 = ((col + 1) / maxLineLength) * imgData.width
        const y0 = (row / lines.length) * imgData.height
        const y1 = ((row + 1) / lines.length) * imgData.height
        const [r, g, b] = getAverageColor(imgData, x0, x1, y0, y1)
        fill = `rgb(${r},${g},${b})`
      }

      ctx.fillStyle = fill
      ctx.fillText(line[col], padding + col * charWidth, padding + row * lineHeight)
    }
  }
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
