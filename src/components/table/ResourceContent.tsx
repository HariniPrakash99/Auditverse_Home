import { useState, useEffect, useRef } from 'react'
import Icon from '../common/Icon'
import type { ContentItem, ResourceItem } from '../../data/contentData'
import { validateName } from '../../utils/nameValidation'
import { isValidHttpsUrl } from '../../utils/urlValidation'
import { Cp_refitemsesService } from '../../generated/services/Cp_refitemsesService'
import type { Cp_refitemses } from '../../generated/models/Cp_refitemsesModel'

interface ResourceContentProps {
  content: ContentItem
  resources: ResourceItem[]
  searchTerm: string
  referenceItems?: Cp_refitemses[]
  isManageMode?: boolean
  canEditDescription?: boolean
  onManage?: () => void
  onCancelManage?: () => void
  onSaveManage?: (content: ContentItem) => void | Promise<void>
  onAddWidget?: () => void
}

const normalizeValue = (value: string) => value.trim().toLowerCase()

function getInitialManageItems(content: ContentItem, resources: ResourceItem[]): ResourceItem[] {
  if (resources && resources.length > 0) {
    return resources.map((item) => ({ ...item }))
  }
  if (content.resources && content.resources.length > 0) {
    return content.resources.map((item) => ({ ...item }))
  }
  return []
}

interface FolderChildFile {
  id: string
  name: string
  size: string
  type: string
  url?: string
  spId?: string
}

// SharePoint refuses to render its normal file URLs inside an iframe ("refused to connect").
// embed.aspx is SharePoint's embeddable viewer (PDF, Office, images, video), so use it when the file's unique id is known.
// Direct image links are rendered with <img>, which isn't subject to the iframe "refused to connect" block.
function isImageLink(url: string): boolean {
  try {
    const parsed = new URL(url)
    const path = decodeURIComponent(parsed.pathname).toLowerCase()
    if (/\.(png|jpe?g|gif|bmp|webp|svg|ico|tiff?)$/.test(path)) return true
    const format = (parsed.searchParams.get('format') ?? parsed.searchParams.get('fm') ?? '').toLowerCase()
    return ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(format)
  } catch {
    return /\.(png|jpe?g|gif|bmp|webp|svg|ico|tiff?)(\?|#|$)/i.test(url)
  }
}

function getPreviewUrl(url: string, spId?: string, fileName?: string): string {
  const guidPattern = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i
  let guid = (spId ?? '').replace(/[{}]/g, '').match(guidPattern)?.[0]
  try {
    const parsed = new URL(url)
    guid = guid ?? decodeURIComponent(parsed.searchParams.get('sourcedoc') ?? '').replace(/[{}]/g, '').match(guidPattern)?.[0]
    const sitePath = decodeURIComponent(parsed.pathname).match(/\/(?:sites|teams)\/[^/]+/i)?.[0] ?? ''
    if (!guid) {
      // Plain SharePoint file path links (no id): embed.aspx also accepts the server-relative file path.
      const filePath = decodeURIComponent(parsed.pathname)
      const pathExtension = filePath.match(/\.([a-z0-9]+)$/i)?.[1]?.toLowerCase()
      if (/\.sharepoint\.com$/i.test(parsed.hostname) && pathExtension && !/\/_layouts\//i.test(filePath) && !/\/:[a-z]:\//i.test(filePath) && pathExtension !== 'aspx') {
        if (['xlsx', 'xls', 'xlsm', 'xlsb', 'csv'].includes(pathExtension)) {
          return `${parsed.origin}${sitePath}/_layouts/15/Doc.aspx?sourcedoc=${encodeURIComponent(filePath)}&action=embedview`
        }
        return `${parsed.origin}${sitePath}/_layouts/15/embed.aspx?id=${encodeURIComponent(filePath)}`
      }
      return url
    }
    // Excel workbooks don't render through embed.aspx; Excel Online's embed view does.
    const extension = (fileName || decodeURIComponent(parsed.pathname)).split('?')[0].split('.').pop()?.toLowerCase() ?? ''
    if (['xlsx', 'xls', 'xlsm', 'xlsb', 'csv'].includes(extension)) {
      return `${parsed.origin}${sitePath}/_layouts/15/Doc.aspx?sourcedoc=%7B${guid}%7D&action=embedview`
    }
    return `${parsed.origin}${sitePath}/_layouts/15/embed.aspx?UniqueId=${guid}`
  } catch {
    return url
  }
}

function inferFileType(fileName: string, filePath?: string): string {
  const target = (fileName || filePath || '').toLowerCase().trim()
  const clean = target.split('?')[0].split('#')[0]
  const extension = clean.split('.').pop()?.trim().toLowerCase()
  switch (extension) {
    case 'pdf':
      return 'PDF'
    case 'xlsx':
    case 'xls':
    case 'csv':
    case 'xlsm':
      return 'Excel'
    case 'doc':
    case 'docx':
    case 'docm':
      return 'Word'
    case 'ppt':
    case 'pptx':
      return 'PPT'
    case 'mp4':
    case 'mov':
    case 'avi':
    case 'mkv':
      return 'Video'
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'svg':
      return 'Image'
    case 'zip':
    case 'rar':
    case '7z':
      return 'ZIP'
    case 'txt':
      return 'TXT'
  }
  if (clean.includes('.pdf') || target.includes('pdf')) return 'PDF'
  if (clean.includes('.xls') || clean.includes('.xlsx') || clean.includes('.csv') || target.includes('excel') || target.includes('sheet')) return 'Excel'
  if (clean.includes('.doc') || clean.includes('.docx') || target.includes('word')) return 'Word'
  if (clean.includes('.ppt') || clean.includes('.pptx') || target.includes('powerpoint')) return 'PPT'
  return extension && extension.length <= 5 ? extension.toUpperCase() : 'File'
}

function isVideoFileType(fileType: string): boolean {
  const normalizedType = fileType.trim().toLowerCase()
  return normalizedType === 'video' || ['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(normalizedType)
}

function getFolderChildFiles(
  folderId: string,
  folderName: string,
  items: Cp_refitemses[],
  folderPath?: string,
): FolderChildFile[] {
  const normalizedName = (folderName || '').trim().toLowerCase()
  const cleanPath = (folderPath || '').replace(/^\/+/, '').trim().toLowerCase()

  // 1. Match by parent master reference GUID (_cp_refmaster_value or object)
  let matches = items.filter(
    (item) =>
      item.statecode !== 1 &&
      Boolean(folderId) &&
      (item._cp_refmaster_value === folderId ||
        (item.cp_refmaster as any)?.cp_refmastersid === folderId),
  )

  // Unsaved/temporary folder ids (e.g. "ref-folder-123", "draft-0") must not match files by name/path,
  // otherwise the same files are shown again under every newly added copy of the folder.
  const isUnsavedFolder = Boolean(folderId) && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(folderId)

  // 2. If no direct ID match, fallback to matching parent master name or path
  if (matches.length === 0 && !isUnsavedFolder && (normalizedName || cleanPath)) {
    matches = items.filter((item) => {
      if (item.statecode === 1) return false
      const masterObjName = ((item.cp_refmaster as any)?.cp_name || '').trim().toLowerCase()
      if (masterObjName && (masterObjName === normalizedName || (cleanPath && masterObjName.includes(cleanPath)) || (cleanPath && cleanPath.includes(masterObjName)))) return true
      const filePath = (item.cp_filepath || '').trim().toLowerCase()
      if (
        filePath &&
        (filePath.startsWith(`/${normalizedName}`) ||
          filePath.startsWith(`${normalizedName}/`) ||
          filePath.includes(`/${normalizedName}/`) ||
          filePath === normalizedName ||
          (cleanPath && (filePath.includes(cleanPath) || filePath.startsWith(`/${cleanPath}`))))
      ) {
        return true
      }
      return false
    })
  }

  return matches.map((item) => {
    const fileType = (item.cp_filetype ?? '').toString().trim()
    return {
      id: item.cp_refitemsid,
      name: item.cp_filename || 'Document',
      size: item.cp_filesize || '',
      type: fileType || inferFileType(item.cp_filename || '', item.cp_filelink || item.cp_filepath || ''),
      url: item.cp_filelink || item.cp_filepath || '',
      spId: item.cp_sharepointfileid || '',
    }
  })
}

function ResourceContent({
  content,
  resources,
  searchTerm,
  referenceItems,
  isManageMode = false,
  canEditDescription = true,
  onManage,
  onCancelManage,
  onSaveManage,
  onAddWidget,
}: ResourceContentProps) {
  const [dataverseRefItems, setDataverseRefItems] = useState<Cp_refitemses[]>(
    referenceItems && referenceItems.length > 0 ? referenceItems : [],
  )
  const [isDataverseLoaded, setIsDataverseLoaded] = useState<boolean>(
    Boolean(referenceItems && referenceItems.length > 0),
  )

  useEffect(() => {
    if (referenceItems && referenceItems.length > 0) {
      setDataverseRefItems(referenceItems)
      setIsDataverseLoaded(true)
      return
    }

    let cancelled = false
    const loadItems = async () => {
      try {
        const result = await Cp_refitemsesService.getAll()
        if (!cancelled && result.data) {
          setDataverseRefItems(result.data)
          setIsDataverseLoaded(true)
        }
      } catch (err) {
        console.error('REF ITEMS LOAD ERROR in ResourceContent:', err)
        if (!cancelled) {
          setIsDataverseLoaded(true)
        }
      }
    }

    void loadItems()
    return () => {
      cancelled = true
    }
  }, [referenceItems])
  const isReferenceView = content.section === 'references'
  const contentPanelRef = useRef<HTMLElement>(null)

  useEffect(() => {
    contentPanelRef.current?.scrollTo({ top: 0, behavior: 'auto' })
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [content.id])

  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(() => new Set<string>())
  const [previewFile, setPreviewFile] = useState<{ name: string; url: string; embedUrl: string; isImage?: boolean } | null>(null)

  const openLinkPreview = (name: string, url: string) => {
    // Plain SharePoint file links are blocked in frames; reuse the synced file's SharePoint id (if any) to get an embeddable URL.
    const normalize = (value?: string | null) => {
      try {
        return decodeURIComponent(String(value ?? '')).split('?')[0].split('#')[0].replace(/\/+$/, '').trim().toLowerCase()
      } catch {
        return String(value ?? '').split('?')[0].split('#')[0].replace(/\/+$/, '').trim().toLowerCase()
      }
    }
    const target = normalize(url)
    const targetPath = (() => {
      try {
        return normalize(new URL(url).pathname)
      } catch {
        return target
      }
    })()
    const matchedItem = target
      ? dataverseRefItems.find((item) => {
          if (item.statecode === 1 || !item.cp_sharepointfileid) return false
          const link = normalize(item.cp_filelink)
          const path = normalize(item.cp_filepath)
          return link === target || (Boolean(path) && (path === targetPath || targetPath.endsWith(path)))
        })
      : undefined
    setPreviewFile({
      name,
      url,
      embedUrl: getPreviewUrl(url, matchedItem?.cp_sharepointfileid, matchedItem?.cp_filename || name),
      isImage: isImageLink(url),
    })
  }

  useEffect(() => {
    if (!previewFile) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPreviewFile(null)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [previewFile])
  const [starredItems, setStarredItems] = useState<Set<string>>(new Set())
  const [starredFiles, setStarredFiles] = useState<Set<string>>(new Set())
  const [starNotification, setStarNotification] = useState<string | null>(null)
  const starNotificationTimerRef = useRef<number | null>(null)

  const showStarNotification = (message: string) => {
    if (starNotificationTimerRef.current) {
      window.clearTimeout(starNotificationTimerRef.current)
    }
    setStarNotification(message)
    starNotificationTimerRef.current = window.setTimeout(() => {
      setStarNotification(null)
      starNotificationTimerRef.current = null
    }, 5000)
  }

  const toggleStar = (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation()
    const isCurrentlyStarred = starredItems.has(id)
    setStarredItems((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
    if (isCurrentlyStarred) {
      showStarNotification(`${name} unpinned`)
    } else {
      showStarNotification(`${name} pinned to your quick links`)
    }
  }

  const toggleFileStar = (e: React.MouseEvent, fileId: string, name: string) => {
    e.stopPropagation()
    const isCurrentlyStarred = starredFiles.has(fileId)
    setStarredFiles((prev) => {
      const next = new Set(prev)
      if (next.has(fileId)) next.delete(fileId)
      else next.add(fileId)
      return next
    })
    if (isCurrentlyStarred) {
      showStarNotification(`${name} unpinned`)
    } else {
      showStarNotification(`${name} pinned to your quick links`)
    }
  }

  // Mode State (isEditing: boolean)
  const [isEditing, setIsEditing] = useState<boolean>(Boolean(isManageMode))

  // 2. Category Title & Description Edit Fields
  const [editTitle, setEditTitle] = useState<string>(content.title || 'J&J')
  const [editDescription, setEditDescription] = useState<string>(
    content.description ||
      (isReferenceView
        ? 'Function overview covering the operating model, the business units in scope and how audit coverage is allocated across them.'
        : `List of Resource Links under ${content.title || 'J&J'}`),
  )

  // 4. Manageable Items List
  const [manageItems, setManageItems] = useState<ResourceItem[]>(() =>
    getInitialManageItems(content, resources),
  )

  // 3. "Add Items" Creation Form inputs
  const [newTitle, setNewTitle] = useState('')
  const [newUrl, setNewUrl] = useState('')

  // Saving state
  const [isSaving, setIsSaving] = useState(false)

  // Inline edit state
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [inlineEditTitle, setInlineEditTitle] = useState('')
  const [inlineEditUrl, setInlineEditUrl] = useState('')

  // Notification / Error state
  const [manageError, setManageError] = useState<string | null>(null)
  const manageErrorTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (manageErrorTimeoutRef.current) {
        window.clearTimeout(manageErrorTimeoutRef.current)
      }
    }
  }, [])

  const showManageError = (message: string) => {
    if (manageErrorTimeoutRef.current) {
      window.clearTimeout(manageErrorTimeoutRef.current)
    }
    setManageError(message)
    manageErrorTimeoutRef.current = window.setTimeout(() => {
      setManageError(null)
      manageErrorTimeoutRef.current = null
    }, 5000)
  }

  // Sync isEditing with isManageMode prop
  useEffect(() => {
    if (isManageMode !== undefined) {
      setIsEditing(Boolean(isManageMode))
    }
  }, [isManageMode])

  // Initialize the edit form when the selected content changes.
  // Keep the draft stable while the user is editing, including across
  // background resource refreshes while the user copies a URL elsewhere.
  useEffect(() => {
    setEditTitle(content.title || 'J&J')
    setEditDescription(
      content.description ||
        (isReferenceView
          ? 'Function overview covering the operating model, the business units in scope and how audit coverage is allocated across them.'
          : `List of Resource Links under ${content.title || 'J&J'}`),
    )
    setManageItems(getInitialManageItems(content, resources))
    setNewTitle('')
    setNewUrl('')
    setEditingItemId(null)
    setManageError(null)
  }, [content.id, isReferenceView])

  const toggleFolder = (folderId: string) => {
    setExpandedFolders((current) => {
      const next = new Set(current)
      if (next.has(folderId)) {
        next.delete(folderId)
      } else {
        next.add(folderId)
      }
      return next
    })
  }

  const handleStartManage = () => {
    setIsEditing(true)
    setManageError(null)
    onManage?.()
  }

  const handleCancelManage = () => {
    // Discard unsaved edits and return to View mode
    setShowDeleteModal(false)
    setItemToDelete(null)
    setEditTitle(content.title || 'J&J')
    setEditDescription(
      content.description ||
        (isReferenceView
          ? 'Function overview covering the operating model, the business units in scope and how audit coverage is allocated across them.'
          : `List of Resource Links under ${content.title || 'J&J'}`),
    )
    setManageItems(getInitialManageItems(content, resources))
    setNewTitle('')
    setNewUrl('')
    setEditingItemId(null)
    setManageError(null)
    setIsEditing(false)
    onCancelManage?.()
  }

  const validateResourceItem = (
    title: string,
    url: string,
    ignoreItemId?: string,
  ): string | null => {
    const trimmedTitle = title.trim()
    const trimmedUrl = url.trim()

    const titleError = validateName(title, 'Link Title')
    if (titleError) {
      return titleError
    }

    if (!trimmedUrl) {
      return 'Please enter a Link URL.'
    }

    if (!/[a-zA-Z0-9]/.test(trimmedUrl)) {
      return 'Only special characters are not allowed.'
    }

    const duplicateTitle = manageItems.some(
      (item) =>
        item.id !== ignoreItemId &&
        normalizeValue(item.name) === normalizeValue(trimmedTitle),
    )

    const duplicateUrl = manageItems.some(
      (item) =>
        item.id !== ignoreItemId &&
        item.url &&
        normalizeValue(item.url) === normalizeValue(trimmedUrl),
    )

    if (duplicateTitle && duplicateUrl) {
      return `Title "${trimmedTitle}" and link "${trimmedUrl}" already exist.`
    }

    if (duplicateTitle) {
      return `Title "${trimmedTitle}" already exists.`
    }

    if (!isValidHttpsUrl(trimmedUrl)) {
      return 'URL must start with https:// and be a valid HTTPS URL.'
    }

    if (duplicateUrl) {
      return `Link "${trimmedUrl}" already exists.`
    }

    return null
  }

  const handleSaveManage = async () => {
    const contentTitleError = validateName(editTitle, 'Title')
    if (contentTitleError) {
      showManageError(contentTitleError)
      return
    }

    if (editDescription.trim() && !/[a-zA-Z0-9]/.test(editDescription.trim())) {
      showManageError('Only special characters are not allowed.')
      return
    }

    // Validate each item before persisting
    for (const item of manageItems) {
      const originalItem = content.resources.find(
        (candidate) => candidate.id === item.id,
      )
      const isNewOrChangedItem =
        !originalItem ||
        item.name.trim() !== originalItem.name.trim() ||
        (item.url || '').trim() !== (originalItem.url || '').trim()

      if (!isNewOrChangedItem) {
        continue
      }

      const err = validateResourceItem(item.name, item.url || '', item.id)
      if (err) {
        showManageError(err)
        return
      }
    }

    try {
      setIsSaving(true)
      setEditingItemId(null)
      setManageError(null)
      // Persists updates and returns to View mode
      const updatedContent: ContentItem = {
        ...content,
        title: editTitle.trim() || content.title || 'J&J',
        description: canEditDescription
          ? editDescription.trim()
          : content.description ?? '',
        resources: manageItems,
      }
      await onSaveManage?.(updatedContent)
      setIsEditing(false)
    } catch (caughtError) {
      console.error('Save to Dataverse failed:', caughtError)
      showManageError('Failed to save changes to Dataverse. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddItem = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const trimmedTitle = newTitle.trim()
    const trimmedUrl = newUrl.trim()

    const validationError = validateResourceItem(trimmedTitle, trimmedUrl)
    if (validationError) {
      showManageError(validationError)
      return
    }

    const newItem: ResourceItem = {
      id: `new-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: trimmedTitle,
      type: 'link',
      url: trimmedUrl,
    }

    setManageItems((current) => [...current, newItem])
    setNewTitle('')
    setNewUrl('')
    setManageError(null)
  }

  const handleMoveItem = (index: number, direction: -1 | 1) => {
    const target = index + direction
    if (target < 0 || target >= manageItems.length) return
    setManageItems((current) => {
      const next = [...current]
      const [item] = next.splice(index, 1)
      next.splice(target, 0, item)
      return next
    })
  }

  // Delete Confirmation Modal state
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false)
  const [itemToDelete, setItemToDelete] = useState<{
    id: string
    title: string
    parent: string
  } | null>(null)

  const handleRequestDeleteItem = (item: ResourceItem) => {
    const parentName = editTitle.trim() || content.title || 'J&J'
    setItemToDelete({
      id: item.id,
      title: item.name,
      parent: parentName,
    })
    setShowDeleteModal(true)
  }

  const handleConfirmDelete = () => {
    if (!itemToDelete) return
    const id = itemToDelete.id
    setManageItems((current) => current.filter((item) => item.id !== id))
    if (editingItemId === id) {
      setEditingItemId(null)
    }
    if (manageError) {
      setManageError(null)
    }
    setShowDeleteModal(false)
    setItemToDelete(null)
  }

  const handleCancelDelete = () => {
    setShowDeleteModal(false)
    setItemToDelete(null)
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showDeleteModal) {
        handleCancelDelete()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showDeleteModal])

  const handleStartInlineEdit = (item: ResourceItem) => {
    setEditingItemId(item.id)
    setInlineEditTitle(item.name)
    setInlineEditUrl(item.url || '')
    setManageError(null)
  }

  const handleSaveInlineEdit = (id: string) => {
    const trimmedTitle = inlineEditTitle.trim()
    const trimmedUrl = inlineEditUrl.trim()

    const validationError = validateResourceItem(trimmedTitle, trimmedUrl, id)
    if (validationError) {
      showManageError(validationError)
      return
    }

    setManageItems((current) =>
      current.map((item) =>
        item.id === id
          ? { ...item, name: trimmedTitle, url: trimmedUrl }
          : item,
      ),
    )
    setEditingItemId(null)
    setManageError(null)
  }

  const handleCancelInlineEdit = () => {
    setEditingItemId(null)
    setManageError(null)
  }

  // ==========================================================
  // EDIT MODE (inside section.pane)
  // ==========================================================
  if (isEditing) {
    return (
      <section
        className={`right-content-panel pane is-editing${content.section === 'quickLinks' ? ' quick-links-editing' : ''}`}
      >
        {manageError && (
          <div className="toast-region">
            <div className="toast-pill warning-toast" role="alert">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#00A3FF"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-info toast-icon"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
              <span className="toast-message" style={{ color: '#ffffff' }}>{manageError}</span>
            </div>
          </div>
        )}

        {/* 1. Header Layout */}
        <div className="res-manage-header">
          <h2 className="res-manage-heading">Manage Content</h2>
          <div className="res-manage-header-actions">
            <button
              type="button"
              className="res-manage-cancel-btn"
              onClick={handleCancelManage}
            >
              Cancel
            </button>
            <button
              type="button"
              className="res-manage-save-btn"
              onClick={handleSaveManage}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* 2. Category Title & Description Edit Fields */}
        <div className="res-manage-fields">
          <input
            type="text"
            className="res-manage-category-name"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="Category Name"
            aria-label="Category Name"
          />
          <textarea
            className="res-manage-category-desc"
            value={editDescription}
            onChange={(e) => {
              if (canEditDescription) {
                setEditDescription(e.target.value)
              }
            }}
            disabled={!canEditDescription || isSaving}
            readOnly={!canEditDescription}
            aria-disabled={!canEditDescription}
            placeholder="Category Description"
            aria-label="Category Description"
            rows={3}
          />
        </div>

        {/* 3. "Add Items" Creation Form */}
        <div className="res-manage-add-section">
          <div className="res-manage-add-label">Add Items</div>
          {(() => {
            const isAddDisabled = isSaving || !newTitle.trim() || !newUrl.trim()
            return (
              <div className="res-manage-add-row">
                <input
                  type="text"
                  className="res-manage-add-title"
                  placeholder="Link Title"
                  value={newTitle}
                  onChange={(e) => {
                    setNewTitle(e.target.value)
                    if (manageError) setManageError(null)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      if (!isAddDisabled) {
                        handleAddItem()
                      }
                    }
                  }}
                />
                <input
                  type="text"
                  className="res-manage-add-url"
                  placeholder="Link URL"
                  value={newUrl}
                  onChange={(e) => {
                    setNewUrl(e.target.value)
                    if (manageError) setManageError(null)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      if (!isAddDisabled) {
                        handleAddItem()
                      }
                    }
                  }}
                />
                <button
                  type="button"
                  className="res-manage-add-btn"
                  onClick={handleAddItem}
                  disabled={isAddDisabled}
                  style={{
                    backgroundColor: '#ed1b24',
                    color: '#ffffff',
                    opacity: isAddDisabled ? 0.45 : 1,
                    cursor: isAddDisabled ? 'not-allowed' : 'pointer',
                  }}
                >
                  Add
                </button>
              </div>
            )
          })()}
        </div>

        {/* 4. Manageable Items List */}
        <div className="res-list-manage">
          {manageItems.length === 0 ? (
            <div className="empty-resource-state">
              <p>No resources available.</p>
            </div>
          ) : (
            manageItems.map((item, index) => {
              const isItemEditing = editingItemId === item.id

              if (isItemEditing) {
                return (
                  <div key={item.id} className="res-manage-item-row res-manage-item-editing">
                    <div className="res-manage-inline-edit">
                      <input
                        type="text"
                        className="res-manage-inline-input"
                        value={inlineEditTitle}
                        onChange={(e) => {
                          setInlineEditTitle(e.target.value)
                          if (manageError) setManageError(null)
                        }}
                        placeholder="Item Title"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveInlineEdit(item.id)
                          if (e.key === 'Escape') handleCancelInlineEdit()
                        }}
                      />
                      <input
                        type="text"
                        className="res-manage-inline-input"
                        value={inlineEditUrl}
                        onChange={(e) => {
                          setInlineEditUrl(e.target.value)
                          if (manageError) setManageError(null)
                        }}
                        placeholder="Link URL"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveInlineEdit(item.id)
                          if (e.key === 'Escape') handleCancelInlineEdit()
                        }}
                      />
                      <div className="res-manage-inline-actions">
                        <button
                          type="button"
                          className="res-manage-inline-btn res-manage-inline-save"
                          onClick={() => handleSaveInlineEdit(item.id)}
                          title="Save"
                          aria-label="Save"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-check preview-icon"
                          >
                            <path d="M20 6 9 17l-5-5" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          className="res-manage-inline-btn res-manage-inline-cancel"
                          onClick={handleCancelInlineEdit}
                          title="Cancel"
                          aria-label="Cancel"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-x preview-icon"
                          >
                            <path d="M18 6 6 18" />
                            <path d="m6 6 12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                )
              }

              return (
                <div key={item.id} className="res-manage-item-row">
                  {/* Left Section (Icon + Label) */}
                  <div className="res-manage-item-left">
                    <span className="res-manage-link-chain-icon" aria-hidden="true">
                      <Icon name="link" size={14} />
                    </span>
                    <span className="res-manage-item-name" title={item.name}>
                      {item.name}
                    </span>
                  </div>

                  {/* Right Action Toolbar */}
                  <div className="res-manage-actions-toolbar">
                    {/* Edit Action */}
                    <button
                      type="button"
                      className="res-manage-action-icon-btn edit"
                      onClick={() => handleStartInlineEdit(item)}
                      aria-label={`Edit ${item.name}`}
                      title="Edit"
                    >
                      <Icon name="edit" size={14} className="lucide-pencil" />
                    </button>

                    {/* Move Up Action */}
                    <button
                      type="button"
                      className="res-manage-action-icon-btn move-up"
                      onClick={() => handleMoveItem(index, -1)}
                      disabled={index === 0}
                      aria-label={`Move ${item.name} up`}
                      title="Move up"
                    >
                      <Icon name="arrow-up" size={14} className="lucide-arrow-up" />
                    </button>

                    {/* Move Down Action */}
                    <button
                      type="button"
                      className="res-manage-action-icon-btn move-down"
                      onClick={() => handleMoveItem(index, 1)}
                      disabled={index === manageItems.length - 1}
                      aria-label={`Move ${item.name} down`}
                      title="Move down"
                    >
                      <Icon name="arrow-down" size={14} className="lucide-arrow-down" />
                    </button>

                    {/* Delete Action */}
                    <button
                      type="button"
                      className="res-manage-action-icon-btn delete"
                      onClick={() => handleRequestDeleteItem(item)}
                      aria-label={`Delete ${item.name}`}
                      title="Delete"
                    >
                      <Icon name="trash" size={15} className="lucide-trash-2" />
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && itemToDelete && (
          <div
            className="modal-backdrop"
            onClick={handleCancelDelete}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-modal-headline"
          >
            <div
              className="modal-dialog modal-dialog-delete"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-delete-badge">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#991b1b"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 6h18" />
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  <line x1="10" y1="11" x2="10" y2="17" />
                  <line x1="14" y1="11" x2="14" y2="17" />
                </svg>
              </div>
              <h3 id="delete-modal-headline" className="modal-headline">
                Delete link?
              </h3>
              <p className="modal-description" style={{ color: '#6e6259' }}>
                <span className="modal-item-highlight" style={{ color: '#6e6259' }}>{itemToDelete.title}</span> will be removed from {itemToDelete.parent}.
              </p>
              <div className="modal-btn-group">
                <button
                  type="button"
                  className="modal-cancel-btn has-nav-tooltip"
                  onClick={handleCancelDelete}
                >
                  Cancel
                  <span className="nav-tooltip nav-tooltip-box" role="tooltip">Cancel</span>
                </button>
                <button
                  type="button"
                  className="modal-delete-confirm-btn has-nav-tooltip"
                  onClick={handleConfirmDelete}
                >
                  Delete
                  <span className="nav-tooltip nav-tooltip-box" role="tooltip">Delete</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    )
  }

  const getFolderChildItemCount = (resource: ResourceItem): number => {
    const countMatch = resource.name.match(/^(.*?)\s*\((\d+)\)$/)
    const rawBaseName = (countMatch ? countMatch[1] : resource.name).trim()
    const baseName = rawBaseName.toLowerCase() === 'data pipeline' ? 'Data Pipeline' : rawBaseName
    const childFiles = getFolderChildFiles(resource.id, baseName, dataverseRefItems, resource.description)
    return childFiles.length > 0
      ? childFiles.length
      : (isDataverseLoaded ? childFiles.length : (countMatch ? Number(countMatch[2]) : (resource.count ?? 0)))
  }

  // Calculate total resources count for references header:
  // based on link and under the folder hierarchy items count
  const totalResourceCount = resources.reduce((acc, item) => {
    if (item.type === 'folder') {
      return acc + getFolderChildItemCount(item)
    }
    return acc + 1
  }, 0)

  // Ensure breadcrumb always displays heading / category / subcategory
  const breadcrumbParts = (() => {
    if (!content.breadcrumb || content.breadcrumb.length === 0) {
      return [isReferenceView ? 'References' : 'Quick Links', '', content.title]
    }
    if (content.breadcrumb.length === 1) {
      return [isReferenceView ? 'References' : 'Quick Links', '', content.breadcrumb[0]]
    }
    if (content.breadcrumb.length === 2) {
      return [content.breadcrumb[0], '', content.breadcrumb[1]]
    }
    return content.breadcrumb
  })()

  const referenceBreadcrumbParts = breadcrumbParts.length >= 3
    ? breadcrumbParts
    : ['References', '', content.title]

  return (
    <section ref={contentPanelRef} className="right-content-panel pane">
      {starNotification && (
        <div className="toast-region">
          <div className="toast-pill warning-toast" role="status">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#00A3FF"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-info toast-icon"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4" />
              <path d="M12 8h.01" />
            </svg>
            <span className="toast-message" style={{ color: '#ffffff' }}>
              {starNotification}
            </span>
          </div>
        </div>
      )}
      {isReferenceView ? (
        <>
          {/* 1. Panel Header & Summary Block: Breadcrumb Row */}
          <div className="ref-breadcrumb-row">
            <nav className="ref-breadcrumb" aria-label="Breadcrumb">
              {referenceBreadcrumbParts.map((part, index) => {
                const isLast = index === referenceBreadcrumbParts.length - 1
                return (
                  <span key={`${part}-${index}`}>
                    {index > 0 && <span className="ref-breadcrumb-sep">/</span>}
                    <span className={isLast ? 'ref-breadcrumb-current' : undefined}>{part}</span>
                  </span>
                )
              })}
            </nav>

            {Boolean(onManage) && (
              <div className="ref-manage-trigger">
                <button
                  type="button"
                  className="ref-manage-btn"
                  onClick={handleStartManage}
                  aria-label="Manage content"
                  style={{ color: '#eb1700', fontSize: '12px' }}
                >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#eb1700"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-file-pen preview-icon"
                >
                  <path d="M12.659 22H18a2 2 0 0 0 2-2V8a2.4 2.4 0 0 0-.706-1.706l-3.588-3.588A2.4 2.4 0 0 0 14 2H6a2 2 0 0 0-2 2v9.34" />
                  <path d="M14 2v5a1 1 0 0 0 1 1h5" />
                  <path d="M10.378 12.622a1 1 0 0 1 3 3.003L8.36 20.637a2 2 0 0 1-.854.506l-2.867.837a.5.5 0 0 1-.62-.62l.836-2.869a2 2 0 0 1 .506-.853z" />
                </svg>
                <span style={{ color: '#eb1700', fontSize: '12px' }}>MANAGE</span>
              </button>
            </div>
          )}
          </div>

          {/* 1. Category Overview Block */}
          <div className="ref-category-overview">
            <div className="ref-overview-left">
              <div className="ref-category-badge" aria-hidden="true">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#eb1700"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-folder-open preview-icon"
                >
                  <path d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2" />
                </svg>
              </div>
              <div className="ref-overview-text">
                <h1 className="ref-overview-title">{content.title || 'Overview of J&J'}</h1>
                <p className="ref-overview-subtitle">
                  {content.description ||
                    'Function overview covering the operating model, the business units in scope and how audit coverage is allocated across them.'}
                </p>
              </div>
            </div>

            <div className="ref-overview-right">
              <button
                className="ref-add-widget-btn"
                type="button"
                onClick={onAddWidget}
              >
                + Add to Home Page Widgets
              </button>
            </div>
          </div>

          {/* 2. "Resources" Section & Card Hierarchy */}
          <div className="ref-resources-section">
            <h2 className="ref-resources-heading">Resources ({totalResourceCount})</h2>
            <div className="ref-resources-list res-list">
              {resources.length > 0 ? (
                resources.map((resource: ResourceItem) => {
                  const isFolder = resource.type === 'folder'
                  const isExpanded = expandedFolders.has(resource.id)

                  if (isFolder) {
                    const countMatch = resource.name.match(/^(.*?)\s*\((\d+)\)$/)
                    const rawBaseName = (countMatch ? countMatch[1] : resource.name).trim()
                    const baseName = rawBaseName.toLowerCase() === 'data pipeline' ? 'Data Pipeline' : rawBaseName
                    const childFiles = getFolderChildFiles(resource.id, baseName, dataverseRefItems, resource.description)
                    const count = childFiles.length > 0
                      ? childFiles.length
                      : (isDataverseLoaded ? childFiles.length : (countMatch ? Number(countMatch[2]) : (resource.count ?? 0)))

                    return (
                      <div key={resource.id} className={`folder-card ${isExpanded ? 'is-expanded' : ''}`}>
                        {/* 3. Folder Header Row */}
                        <div
                          className="folder-header"
                          role="button"
                          tabIndex={0}
                          onClick={() => toggleFolder(resource.id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              toggleFolder(resource.id)
                            }
                          }}
                        >
                          <div className="folder-header-left">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="#eb1700"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="lucide lucide-folder-open preview-icon"
                            >
                              <path d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2" />
                            </svg>
                            <span className="folder-name">{baseName}{' '}<span className="folder-count" style={{ color: '#eb1700' }}>({count})</span></span>
                          </div>

                          <div className="folder-header-right">
                            {isExpanded ? (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#6e6259"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="lucide lucide-chevron-down preview-icon"
                              >
                                <path d="m6 9 6 6 6-6" />
                              </svg>
                            ) : (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#6e6259"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="lucide lucide-chevron-right preview-icon"
                              >
                                <path d="m9 18 6-6-6-6" />
                              </svg>
                            )}
                          </div>
                        </div>

                        {/* 4. Expanded Folder Nested File List */}
                        {isExpanded && (
                          <div className="folder-children">
                            {childFiles.length === 0 ? (
                              <div className="folder-child-row folder-empty-row" style={{ height: '44px', minHeight: '44px', maxHeight: '44px', padding: '0 16px 0 26px', color: '#6e6259', fontSize: '13px', display: 'flex', alignItems: 'center', boxSizing: 'border-box' }}>
                                No files available
                              </div>
                            ) : (
                              childFiles.map((file) => (
                                <div key={file.id} className="folder-child-row folder-doc-row">
                                  <div className="child-left">
                                    {isVideoFileType(file.type) ? (
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="#312c2a"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="lucide lucide-file-play preview-icon"
                                        style={{ color: '#312c2a', stroke: '#312c2a' }}
                                      >
                                        <path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" />
                                        <path d="M14 2v5a1 1 0 0 0 1 1h5" />
                                        <path d="M15.033 13.44a.647.647 0 0 1 0 1.12l-4.065 2.352a.645.645 0 0 1-.968-.56v-4.704a.645.645 0 0 1 .967-.56z" />
                                      </svg>
                                    ) : (
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="#312c2a"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="lucide lucide-file-text preview-icon"
                                        style={{ color: '#312c2a', stroke: '#312c2a' }}
                                      >
                                        <path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" />
                                        <path d="M14 2v5a1 1 0 0 0 1 1h5" />
                                        <path d="M10 9H8" />
                                        <path d="M16 13H8" />
                                        <path d="M16 17H8" />
                                      </svg>
                                    )}
                                    <span className="child-file-title doc-name file-name" title={file.name} style={{ color: '#312c2a', fontSize: '13px', fontWeight: 400 }}>{file.name}</span>
                                  </div>

                                  <div className="child-right-toolbar">
                                    {file.size ? (
                                      <span className="child-file-size doc-size file-size meta-item" style={{ color: '#6e6259', fontSize: '12px', fontWeight: 400 }}>
                                        {file.size}
                                      </span>
                                    ) : null}
                                    {file.type ? (
                                      <span className="child-file-type doc-type file-type meta-item" style={{ color: '#6e6259', fontSize: '12px', fontWeight: 400 }}>
                                        {file.type}
                                      </span>
                                    ) : null}
                                    <button
                                      type="button"
                                      className={`child-action-btn star-btn ${starredFiles.has(file.id) ? 'is-starred' : ''}`}
                                      aria-label={`Favorite ${file.name}`}
                                      onClick={(e) => toggleFileStar(e, file.id, file.name)}
                                    >
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="15"
                                        height="15"
                                        viewBox="0 0 24 24"
                                        fill={starredFiles.has(file.id) ? '#eb1700' : 'none'}
                                        stroke={starredFiles.has(file.id) ? '#eb1700' : '#6e6259'}
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="lucide lucide-star preview-icon"
                                        style={{
                                          fill: starredFiles.has(file.id) ? '#eb1700' : 'none',
                                          stroke: starredFiles.has(file.id) ? '#eb1700' : '#6e6259',
                                          color: starredFiles.has(file.id) ? '#eb1700' : '#6e6259',
                                        }}
                                      >
                                        <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
                                      </svg>
                                    </button>
                                    <button
                                      type="button"
                                      className="child-action-btn ext-btn"
                                      aria-label={`Open ${file.name}`}
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        if (file.url) {
                                          setPreviewFile({ name: file.name, url: file.url, embedUrl: getPreviewUrl(file.url, file.spId, file.name) })
                                        }
                                      }}
                                    >
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="15"
                                        height="15"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="#6e6259"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="lucide lucide-external-link preview-icon"
                                      >
                                        <path d="M15 3h6v6" />
                                        <path d="M10 14 21 3" />
                                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                      </svg>
                                    </button>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    )
                  }

                  // 5. Standard Link Cards (Non-folder rows)
                  return (
                    <div
                      key={resource.id}
                      className="standard-link-card"
                      role="link"
                      tabIndex={0}
                      onClick={() => {
                        if (resource.url) {
                          openLinkPreview(resource.name, resource.url)
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          if (resource.url) {
                            openLinkPreview(resource.name, resource.url)
                          }
                        }
                      }}
                    >
                      <div className="link-card-left">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="15"
                          height="15"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#eb1700"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-link-2 preview-icon"
                        >
                          <path d="M9 17H7A5 5 0 0 1 7 7h2" />
                          <path d="M15 7h2a5 5 0 1 1 0 10h-2" />
                          <line x1="8" y1="12" x2="16" y2="12" />
                        </svg>
                        <span className="link-card-title">{resource.name}</span>
                      </div>

                      <div className="link-card-right">
                        <button
                          type="button"
                          className={`link-action-btn star-btn ${starredItems.has(resource.id) ? 'is-starred' : ''}`}
                          aria-label={`Favorite ${resource.name}`}
                          onClick={(e) => toggleStar(e, resource.id, resource.name)}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="15"
                            height="15"
                            viewBox="0 0 24 24"
                            fill={starredItems.has(resource.id) ? '#eb1700' : 'none'}
                            stroke={starredItems.has(resource.id) ? '#eb1700' : '#6e6259'}
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-star preview-icon"
                            style={{
                              fill: starredItems.has(resource.id) ? '#eb1700' : 'none',
                              stroke: starredItems.has(resource.id) ? '#eb1700' : '#6e6259',
                              color: starredItems.has(resource.id) ? '#eb1700' : '#6e6259',
                            }}
                          >
                            <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
                          </svg>
                        </button>

                        <button
                          type="button"
                          className="link-action-btn ext-btn"
                          aria-label={`Open ${resource.name}`}
                          onClick={(e) => {
                            e.stopPropagation()
                            if (resource.url) {
                              openLinkPreview(resource.name, resource.url)
                            }
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="15"
                            height="15"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#6e6259"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-external-link preview-icon"
                          >
                            <path d="M15 3h6v6" />
                            <path d="M10 14 21 3" />
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="empty-resource-state">
                  <p>{searchTerm ? <>No resources found matching &ldquo;{searchTerm}&rdquo;</> : 'No resource available'}</p>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        /* Quick Links (VIEW A) */
        <>
          <div className="panel-top-row">
            <nav className="panel-breadcrumb" aria-label="Breadcrumb">
              {breadcrumbParts.map((part, index) => {
                const isLast = index === breadcrumbParts.length - 1
                return (
                  <span key={`${part}-${index}`} className="breadcrumb-segment">
                    <span className={`breadcrumb-text ${isLast ? 'breadcrumb-active' : ''}`}>
                      {part}
                    </span>
                    {!isLast && <span className="breadcrumb-separator">/</span>}
                  </span>
                )
              })}
            </nav>

            {Boolean(onManage) && (
              <div className="panel-top-manage">
                <button
                  type="button"
                  className="ref-manage-btn ql-manage-top-btn"
                  onClick={handleStartManage}
                  aria-label="Manage content"
                  style={{ color: '#eb1700', fontSize: '12px' }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#eb1700"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-file-pen preview-icon"
                  >
                    <path d="M12.659 22H18a2 2 0 0 0 2-2V8a2.4 2.4 0 0 0-.706-1.706l-3.588-3.588A2.4 2.4 0 0 0 14 2H6a2 2 0 0 0-2 2v9.34" />
                    <path d="M14 2v5a1 1 0 0 0 1 1h5" />
                    <path d="M10.378 12.622a1 1 0 0 1 3 3.003L8.36 20.637a2 2 0 0 1-.854.506l-2.867.837a.5.5 0 0 1-.62-.62l.836-2.869a2 2 0 0 1 .506-.853z" />
                  </svg>
                  <span style={{ color: '#eb1700', fontSize: '12px' }}>MANAGE</span>
                </button>
              </div>
            )}
          </div>

          <div className="panel-section-header">
            <div className="section-header-left">
              <div className="active-section-badge-outline" aria-hidden="true">
                <Icon
                  name="link"
                  size={22}
                  strokeWidth={2}
                />
              </div>

              <div className="active-section-info">
                <h2 className="active-section-title category-title">{content.title}</h2>
                <p className="active-section-subtitle">
                  {content.description || `List of Resource Links under ${content.title}`}
                </p>
              </div>
            </div>
          </div>

          <div className="pane_body">
            <div className="res-list resource-cards-list">
              {resources.length > 0 ? (
                resources.map((resource: ResourceItem) => (
                  <div
                    key={resource.id}
                    className="res-row res-card resource-card-row view-a-row"
                    role="link"
                    tabIndex={0}
                    onClick={() => {
                      if (resource.url) {
                        window.open(resource.url, '_blank', 'noopener,noreferrer')
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        if (resource.url) {
                          window.open(resource.url, '_blank', 'noopener,noreferrer')
                        }
                      }
                    }}
                  >
                    <div className="res-item-left resource-card-left">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#eb1700"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-link-2 preview-icon res-link-icon"
                      >
                        <path d="M9 17H7A5 5 0 0 1 7 7h2" />
                        <path d="M15 7h2a5 5 0 1 1 0 10h-2" />
                        <line x1="8" y1="12" x2="16" y2="12" />
                      </svg>
                      <span className="res-row__label label-text res-item-title resource-card-title">{resource.name}</span>
                    </div>

                    <span className="ql-row-action-box">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#6e6259"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-arrow-right preview-icon res-row__arrow"
                      aria-hidden="true"
                    >
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                    </span>
                  </div>
                ))
              ) : (
                <div className="empty-resource-state">
                  <p>{searchTerm ? <>No resources found matching &ldquo;{searchTerm}&rdquo;</> : 'No resources available.'}</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
      {previewFile && (
        <div
          onClick={() => setPreviewFile(null)}
          style={{ position: 'fixed', top: 51, left: 0, right: 0, bottom: 0, background: 'rgba(17, 24, 39, 0.45)', zIndex: 1000 }}
        >
          <div
            role="dialog"
            aria-label={`Preview ${previewFile.name}`}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'absolute',
              top: 20,
              left: 20,
              right: 20,
              bottom: 20,
              background: '#fff',
              borderRadius: 8,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '10px 16px', borderBottom: '1px solid #e5e0db' }}>
              <span title={previewFile.name} style={{ color: '#312c2a', fontSize: 14, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {previewFile.name}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <button
                  type="button"
                  className="child-action-btn ext-btn ref-preview-btn"
                  aria-label={`Open ${previewFile.name} in a new tab`}
                  title="Open in new tab"
                  onClick={() => window.open(previewFile.url, '_blank', 'noopener,noreferrer')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6e6259" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-external-link preview-icon">
                    <path d="M15 3h6v6" />
                    <path d="M10 14 21 3" />
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  </svg>
                </button>
                <button
                  type="button"
                  className="child-action-btn ref-preview-btn"
                  aria-label="Close preview"
                  title="Close"
                  onClick={() => setPreviewFile(null)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6e6259" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x preview-icon">
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                </button>
              </div>
            </div>
            {previewFile.isImage ? (
              <div style={{ flex: 1, minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', overflow: 'auto' }}>
                <img
                  src={previewFile.url}
                  alt={previewFile.name}
                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                  onError={() => setPreviewFile((current) => (current ? { ...current, isImage: false } : current))}
                />
              </div>
            ) : (
              <iframe src={previewFile.embedUrl} title={previewFile.name} style={{ flex: 1, minHeight: 0, width: '100%', border: 0, background: '#fff' }} />
            )}
          </div>
        </div>
      )}
    </section>
  )
}

export default ResourceContent