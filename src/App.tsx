import { ImageUpload } from './components/ImageUpload'
import { ModeToggle } from './components/ModeToggle'
import { OutputPanel } from './components/OutputPanel'
import { SettingsPanel } from './components/SettingsPanel'
import { TextInput } from './components/TextInput'
import { useAsciiConverter } from './hooks/useAsciiConverter'
import './App.css'

function App() {
  const converter = useAsciiConverter()

  return (
    <div className="container">
      <aside className="sidebar">
        <header className="brand">
          <span className="brand-mark">A</span>
          ASCII Studio
        </header>

        <ModeToggle mode={converter.mode} onChange={converter.changeMode} />

        {converter.isTextMode ? (
          <TextInput value={converter.text} onChange={converter.setText} />
        ) : (
          <ImageUpload previewSrc={converter.previewSrc} onFile={converter.loadImageFile} />
        )}

        <SettingsPanel
          isTextMode={converter.isTextMode}
          settings={converter.settings}
          updateSetting={converter.updateSetting}
        />
      </aside>

      <OutputPanel
        ascii={converter.ascii}
        status={converter.status}
        settings={converter.settings}
        isImageOutput={converter.isImageOutput}
        canvasRef={converter.canvasRef}
        onCopy={converter.copyToClipboard}
        onDownloadText={converter.downloadAsText}
        onSaveImage={converter.saveAsImage}
        onClear={converter.clear}
      />
    </div>
  )
}

export default App
