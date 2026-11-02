import { useEffect, useState } from 'react'

interface FolderPickerModalProps {
  folders: string[]
  libraryName: string
  loading: boolean
  selectedPath: string
  onCancel: () => void
  onSelect: (path: string) => void
}

interface FolderEntry {
  name: string
  path: string
}

const normalizePath = (path: string) => {
  const normalized = path.replace(/\\/g, '/').replace(/\/+/g, '/').trim()
  if (!normalized || normalized === '/') return '/'
  return `/${normalized.replace(/^\/+|\/+$/g, '')}`
}

const pathParts = (path: string) => normalizePath(path).split('/').filter(Boolean)

const getRootPath = (folders: string[], libraryName: string) => {
  const libraryParts = libraryName.toLowerCase().split('/').map((part) => part.trim()).filter(Boolean)
  const lastLibraryPart = libraryParts[libraryParts.length - 1]

  if (lastLibraryPart) {
    const normalizedFolders = folders.map(normalizePath)
    // Prefer an exact library-name segment anywhere in the paths, then a partial match
    // (e.g. "Documents" vs "Shared Documents"), so the site folder is never treated as the root.
    const matchers = [
      (part: string) => part === lastLibraryPart,
      (part: string) => part.includes(lastLibraryPart) || lastLibraryPart.includes(part),
    ]
    for (const matches of matchers) {
      for (const path of normalizedFolders) {
        const parts = pathParts(path)
        const libraryIndex = parts.findIndex((part) => matches(part.toLowerCase()))
        if (libraryIndex >= 0) return `/${parts.slice(0, libraryIndex + 1).join('/')}`
      }
    }
  }

  // No library-name match: use the path prefix shared by every folder (site + library folders)
  // so the picker still starts after the library instead of at the site folder.
  const allParts = folders.map(pathParts).filter((parts) => parts.length > 0)
  if (allParts.length > 0) {
    const shared: string[] = []
    for (let index = 0; index < allParts[0].length; index += 1) {
      const part = allParts[0][index]
      if (allParts.every((parts) => parts[index]?.toLowerCase() === part.toLowerCase())) shared.push(part)
      else break
    }
    if (shared.length > 0) return `/${shared.join('/')}`
  }

  const firstPath = folders.find((folder) => folder.includes('/'))
  return firstPath ? `/${pathParts(firstPath)[0]}` : '/'
}

const getRelativePath = (path: string, rootPath: string) => {
  const normalizedPath = normalizePath(path)
  const normalizedRoot = normalizePath(rootPath)
  if (normalizedRoot === '/') return normalizedPath.slice(1)
  if (normalizedPath.toLowerCase() === normalizedRoot.toLowerCase()) return ''
  return normalizedPath.slice(normalizedRoot.length).replace(/^\/+/, '')
}

const getImmediateFolders = (folders: string[], currentPath: string, rootPath: string): FolderEntry[] => {
  const currentRelative = getRelativePath(currentPath, rootPath)
  const entries = new Map<string, FolderEntry>()

  folders.forEach((folder) => {
    const normalizedFolder = normalizePath(folder)
    const relativeFolder = getRelativePath(normalizedFolder, rootPath)
    if (!relativeFolder || (currentRelative && !relativeFolder.toLowerCase().startsWith(`${currentRelative.toLowerCase()}/`))) return

    const remainder = currentRelative
      ? relativeFolder.slice(currentRelative.length).replace(/^\/+/, '')
      : relativeFolder
    const name = remainder.split('/')[0]
    if (!name) return

    const fullPath = currentPath === '/' ? `/${name}` : `${normalizePath(currentPath)}/${name}`
    entries.set(name.toLowerCase(), { name, path: fullPath })
  })

  return Array.from(entries.values()).sort((left, right) => left.name.localeCompare(right.name))
}

const FolderIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H10l2 2h6.5A2.5 2.5 0 0 1 21 9.5v7A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5v-9Z" />
  </svg>
)

const FolderPickerModal = ({ folders, libraryName, loading, selectedPath, onCancel, onSelect }: FolderPickerModalProps) => {
  const rootPath = getRootPath(folders, libraryName)
  const [currentPath, setCurrentPath] = useState(rootPath)
  const [highlightedPath, setHighlightedPath] = useState(selectedPath ? normalizePath(selectedPath) : '')

  useEffect(() => {
    setCurrentPath(rootPath)
  }, [rootPath])

  useEffect(() => {
    setHighlightedPath(selectedPath ? normalizePath(selectedPath) : '')
  }, [selectedPath])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onCancel])

  const currentFolders = getImmediateFolders(folders, currentPath, rootPath)
  const rootParts = pathParts(rootPath)
  const currentParts = pathParts(currentPath).slice(rootParts.length)
  const selectedLabel = highlightedPath === '/' ? '/ (Root Folder)' : highlightedPath || 'None'

  return (
    <div className="folder-picker-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onCancel()}>
      <section className="folder-picker-modal" role="dialog" aria-modal="true" aria-labelledby="folder-picker-title">
        <header className="folder-picker-header">
          <div>
            <h2 id="folder-picker-title">Select Folder</h2>
            <p>{libraryName}</p>
          </div>
          <button type="button" className="folder-picker-close" onClick={onCancel} aria-label="Close folder picker">×</button>
        </header>

        <nav className="folder-picker-breadcrumbs" aria-label="Folder path">
          <button type="button" className={currentPath === rootPath ? 'active' : ''} onClick={() => setCurrentPath(rootPath)}>{libraryName}</button>
          {currentParts.map((part, index) => {
            const path = `${rootPath}/${currentParts.slice(0, index + 1).join('/')}`
            return <span key={path}><span aria-hidden="true">›</span><button type="button" className={path === currentPath ? 'active' : ''} onClick={() => setCurrentPath(path)}>{part}</button></span>
          })}
        </nav>

        <div className="folder-picker-list" role="listbox" aria-label="Folders">
          {loading ? <div className="folder-picker-empty">Loading folders...</div> : currentFolders.length === 0 ? <div className="folder-picker-empty">No folders available</div> : currentFolders.map((folder) => (
            <button
              type="button"
              role="option"
              aria-selected={highlightedPath === folder.path}
              className={`folder-picker-row ${highlightedPath === folder.path ? 'selected' : ''}`}
              key={folder.path}
              onClick={() => setHighlightedPath(folder.path)}
              onDoubleClick={() => { setHighlightedPath(folder.path); setCurrentPath(folder.path) }}
            >
              <FolderIcon />
              <span>{folder.name}</span>
              <span
                className="folder-picker-arrow"
                role="button"
                aria-label={`Open ${folder.name}`}
                onClick={(event) => { event.stopPropagation(); setHighlightedPath(folder.path); setCurrentPath(folder.path) }}
                onDoubleClick={(event) => event.stopPropagation()}
              >›</span>
            </button>
          ))}
        </div>

        <footer className="folder-picker-footer">
          <div className="folder-picker-selected"><span>Selected:</span> {selectedLabel}</div>
          <div className="folder-picker-actions">
            <button type="button" className="folder-picker-cancel" onClick={onCancel}>Cancel</button>
            <button type="button" className="folder-picker-confirm" disabled={!highlightedPath} onClick={() => onSelect(highlightedPath)}>Select Folder</button>
          </div>
        </footer>
      </section>
    </div>
  )
}

export default FolderPickerModal