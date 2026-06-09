import type { CharSetKey } from './lib/asciiData'

export type Mode = 'image' | 'text'
export type OutputFormat = 'text' | 'image'
export type StatusType = 'success' | 'error' | 'info'

export interface Status {
  message: string
  type: StatusType
}

export interface Settings {
  charSet: CharSetKey
  customChars: string
  width: number
  fontSize: number
  outputFormat: OutputFormat
  invert: boolean
  useOriginalColors: boolean
  bgColor: string
  textColor: string
}

export type UpdateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => void
