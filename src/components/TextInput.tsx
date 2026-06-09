import { MAX_TEXT_LENGTH } from '../constants'

interface TextInputProps {
  value: string
  onChange: (value: string) => void
}

export function TextInput({ value, onChange }: TextInputProps) {
  return (
    <div className="input-section">
      <h3>Enter Text</h3>
      <input
        type="text"
        className="text-input"
        placeholder={`Enter text to convert (max ${MAX_TEXT_LENGTH} characters)`}
        maxLength={MAX_TEXT_LENGTH}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}
