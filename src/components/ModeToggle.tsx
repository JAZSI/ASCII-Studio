import type { Mode } from '../types'

interface ModeToggleProps {
  mode: Mode
  onChange: (mode: Mode) => void
}

const MODES: { value: Mode; label: string }[] = [
  { value: 'image', label: 'Image to ASCII' },
  { value: 'text', label: 'Text to ASCII' },
]

export function ModeToggle({ mode, onChange }: ModeToggleProps) {
  return (
    <div className="mode-toggle">
      {MODES.map(({ value, label }) => (
        <label key={value} className={`mode-option${mode === value ? ' active' : ''}`}>
          <input
            type="radio"
            name="mode"
            value={value}
            checked={mode === value}
            onChange={() => onChange(value)}
          />
          {label}
        </label>
      ))}
    </div>
  )
}
