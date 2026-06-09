import type { CharSetKey } from '../lib/asciiData'
import type { OutputFormat, Settings, UpdateSetting } from '../types'

interface SettingsPanelProps {
  isTextMode: boolean
  settings: Settings
  updateSetting: UpdateSetting
}

export function SettingsPanel({ isTextMode, settings, updateSetting }: SettingsPanelProps) {
  return (
    <div className="settings-section">
      {!isTextMode && (
        <div className="setting-group">
          <label htmlFor="char-set">ASCII Character Set</label>
          <select
            id="char-set"
            value={settings.charSet}
            onChange={(e) => updateSetting('charSet', e.target.value as CharSetKey)}
          >
            <option value="standard">Standard (@#%=+*:-. )</option>
            <option value="simple">Simple (█▓▒░ )</option>
            <option value="dots">Dots (●◐○◌ )</option>
            <option value="custom">Custom</option>
          </select>
          {settings.charSet === 'custom' && (
            <input
              type="text"
              placeholder="Enter custom characters"
              value={settings.customChars}
              onChange={(e) => updateSetting('customChars', e.target.value)}
            />
          )}
        </div>
      )}

      {!isTextMode && (
        <div className="setting-group">
          <label htmlFor="width-input">Output Width (characters)</label>
          <div className="range-group">
            <input
              id="width-input"
              type="range"
              min={1}
              max={300}
              value={settings.width}
              onChange={(e) => updateSetting('width', Number(e.target.value))}
            />
            <span className="range-value">{settings.width}</span>
          </div>
        </div>
      )}

      <div className="setting-group">
        <label htmlFor="size-slider">Font Size</label>
        <div className="range-group">
          <input
            id="size-slider"
            type="range"
            min={1}
            max={10}
            value={settings.fontSize}
            onChange={(e) => updateSetting('fontSize', Number(e.target.value))}
          />
          <span className="range-value">{settings.fontSize}</span>
        </div>
      </div>

      <div className="setting-group">
        <label htmlFor="output-format">Output Format</label>
        <select
          id="output-format"
          value={settings.outputFormat}
          onChange={(e) => updateSetting('outputFormat', e.target.value as OutputFormat)}
        >
          <option value="text">Text</option>
          <option value="image">Image</option>
        </select>
      </div>

      <div className="setting-group">
        <label>Colors</label>
        {!isTextMode && (
          <label className="toggle-row">
            <span>Invert colors</span>
            <span className="switch">
              <input
                type="checkbox"
                checked={settings.invert}
                onChange={(e) => updateSetting('invert', e.target.checked)}
              />
              <span className="track" />
            </span>
          </label>
        )}
        {!isTextMode && (
          <label className="toggle-row">
            <span>Use original image colors</span>
            <span className="switch">
              <input
                type="checkbox"
                checked={settings.useOriginalColors}
                onChange={(e) => updateSetting('useOriginalColors', e.target.checked)}
              />
              <span className="track" />
            </span>
          </label>
        )}
        <div className="color-row">
          <div>
            <label className="color-label">Background</label>
            <input
              type="color"
              value={settings.bgColor}
              onChange={(e) => updateSetting('bgColor', e.target.value)}
            />
          </div>
          <div>
            <label className="color-label">Text</label>
            <input
              type="color"
              value={settings.textColor}
              onChange={(e) => updateSetting('textColor', e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
