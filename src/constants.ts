import type { Settings } from './types'

export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB
export const MAX_TEXT_LENGTH = 20
export const GENERATE_DEBOUNCE_MS = 150

export const VALID_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/bmp',
  'image/webp',
  'image/svg+xml',
  'image/tiff',
  'image/x-icon',
  'image/vnd.microsoft.icon',
]

export const DEFAULT_SETTINGS: Settings = {
  charSet: 'standard',
  customChars: '',
  width: 80,
  fontSize: 5,
  outputFormat: 'text',
  invert: false,
  useOriginalColors: true,
  bgColor: '#000000',
  textColor: '#ffffff',
}
