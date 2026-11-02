import {
  useEffect,
  useState,
  useRef,
} from 'react'

import { Cp_refitemsesService } from '../generated/services/Cp_refitemsesService'
import { GetSharePointLibrariesService } from '../generated/services/GetSharePointLibrariesService'
import { GetSharePointFoldersService } from '../generated/services/GetSharePointFoldersService'
import type { Cp_refitemses } from '../generated/models/Cp_refitemsesModel'
import { validateName } from '../utils/nameValidation'
import { isValidHttpsUrl } from '../utils/urlValidation'
import FolderPickerModal from './FolderPickerModal'

import type {
  ReferenceMasterDraft,
  ReferenceSite,
  ReferenceSubcategory,
} from '../hooks/useReferences'

import './ReferenceManageContent.css'

interface ReferenceManageContentProps {
  subcategory: ReferenceSubcategory
  sites: ReferenceSite[]
  saving: boolean
  canEditSubcategoryName: boolean
  canEditDescription: boolean
  referenceItems?: Cp_refitemses[]
  onCancel: () => void
  onSave: (
    drafts: ReferenceMasterDraft[],
    metadata?: { title: string; description: string },
  ) => Promise<void>
}

/*
 * ---------------------------------------------------------
 * Overview of J&J resources come from Dataverse.
 * ---------------------------------------------------------
 */
/*
 * ---------------------------------------------------------
 * Icons
 * ---------------------------------------------------------
 */

/* Folder Icon - left side reference section category (lucide-folder-open) */
const FolderCategoryIcon = () => (
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
    className="lucide lucide-folder-open folder-category-icon ref-left-folder-icon"
    style={{ flexShrink: 0, color: '#6e6259', stroke: '#6e6259' }}
    aria-hidden="true"
  >
    <path d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2" />
  </svg>
)

/* Link Icon - quick link right side child items link icon */
const QuickLinkChildIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#6e6259"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="quick-link-gallery-link-icon ref-left-link-icon"
    style={{ flexShrink: 0, color: '#6e6259', stroke: '#6e6259' }}
    aria-hidden="true"
  >
    <path d="M9 17H7A5 5 0 0 1 7 7h2" />
    <path d="M15 7h2a5 5 0 1 1 0 10h-2" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </svg>
)

/* Expand Chevron - > */
const ExpandChevronIcon = ({ isExpanded }: { isExpanded: boolean }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#6e6259"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{
      transition: 'transform 0.15s ease',
      transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
      display: 'block',
      color: '#6e6259',
      stroke: '#6e6259',
    }}
    aria-hidden="true"
  >
    <path d="m9 18 6-6-6-6" />
  </svg>
)

/* Edit Pencil - lucide-pencil */
const PencilActionIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#6e6259"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ color: '#6e6259', stroke: '#6e6259' }}
    aria-hidden="true"
  >
    <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
    <path d="m15 5 4 4" />
  </svg>
)

/* Move Up Arrow - lucide-arrow-up */
const ArrowUpActionIcon = ({ disabled }: { disabled: boolean }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke={disabled ? '#d5cfc9' : '#6e6259'}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{
      color: disabled ? '#d5cfc9' : '#6e6259',
      stroke: disabled ? '#d5cfc9' : '#6e6259',
    }}
    aria-hidden="true"
  >
    <path d="m5 12 7-7 7 7" />
    <path d="M12 19V5" />
  </svg>
)

/* Move Down Arrow - lucide-arrow-down */
const ArrowDownActionIcon = ({ disabled }: { disabled: boolean }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke={disabled ? '#d5cfc9' : '#6e6259'}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{
      color: disabled ? '#d5cfc9' : '#6e6259',
      stroke: disabled ? '#d5cfc9' : '#6e6259',
    }}
    aria-hidden="true"
  >
    <path d="M12 5v14" />
    <path d="m19 12-7 7-7-7" />
  </svg>
)

/* Delete Trash - quick link manage trash icon */
const TrashActionIcon = () => (
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
    style={{ color: '#eb1700', stroke: '#eb1700' }}
    aria-hidden="true"
  >
    <path d="M3 6h18" />
    <path d="M8 6V4h8v2" />
    <path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v5" />
    <path d="M14 11v5" />
  </svg>
)

const FileSubIcon = () => (
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
    style={{ flexShrink: 0, color: '#312c2a', stroke: '#312c2a' }}
    aria-hidden="true"
  >
    <path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" />
    <path d="M14 2v5a1 1 0 0 0 1 1h5" />
    <path d="M10 9H8" />
    <path d="M16 13H8" />
    <path d="M16 17H8" />
  </svg>
)

const ExternalSubLinkIcon = () => (
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
    style={{ flexShrink: 0, color: '#6e6259', stroke: '#6e6259' }}
    aria-hidden="true"
  >
    <path d="M15 3h6v6" />
    <path d="M10 14 21 3" />
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
  </svg>
)

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

/*
 * ---------------------------------------------------------
 * SharePoint Libraries & Folders Parser Helpers
 * ---------------------------------------------------------
 */
export interface SharePointLibraryItem {
  id: string
  name: string
}

const extractLibraryItem = (item: unknown): SharePointLibraryItem | null => {
  if (typeof item === 'string') {
    const trimmed = item.trim()
    return trimmed.length > 0 ? { id: trimmed, name: trimmed } : null
  }
  if (item && typeof item === 'object') {
    const record = item as Record<string, unknown>
    let nameCandidate: string | null = null
    if (record.RootFolder && typeof record.RootFolder === 'object') {
      const root = record.RootFolder as Record<string, unknown>
      if (typeof root.Name === 'string' && root.Name.trim().length > 0) {
        nameCandidate = root.Name.trim()
      }
    }
    if (!nameCandidate) {
      const candidate =
        record.Title ??
        record.title ??
        record.Name ??
        record.name ??
        record.DisplayName ??
        record.displayName ??
        record.LibraryName ??
        record.libraryName ??
        record.value ??
        record.Value
      if (typeof candidate === 'string' && candidate.trim().length > 0) {
        nameCandidate = candidate.trim()
      } else if (candidate && typeof candidate === 'number') {
        nameCandidate = String(candidate)
      }
    }

    const idCandidate =
      record.Id ??
      record.id ??
      record.ID ??
      record.Guid ??
      record.guid ??
      record.LibraryId ??
      record.libraryId ??
      nameCandidate

    const idStr = typeof idCandidate === 'string' ? idCandidate.trim() : (nameCandidate ?? '')
    const nameStr = nameCandidate ?? idStr

    if (nameStr.length > 0) {
      return { id: idStr || nameStr, name: nameStr }
    }
  }
  return null
}

const parseLibrariesOutput = (rawOutput: unknown): SharePointLibraryItem[] => {
  if (!rawOutput) return []

  // If already an array
  if (Array.isArray(rawOutput)) {
    const items = rawOutput
      .map(extractLibraryItem)
      .filter((v): v is SharePointLibraryItem => Boolean(v))
    const seen = new Set<string>()
    return items.filter((item) => {
      const key = `${item.id}-${item.name}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }

  // If an object
  if (typeof rawOutput === 'object') {
    const obj = rawOutput as Record<string, unknown>
    for (const key of ['value', 'libraries', 'output', 'd', 'results', 'body']) {
      if (Array.isArray(obj[key])) {
        return parseLibrariesOutput(obj[key])
      }
      if (
        obj[key] &&
        typeof obj[key] === 'object' &&
        Array.isArray((obj[key] as any).results)
      ) {
        return parseLibrariesOutput((obj[key] as any).results)
      }
    }
  }

  // If a string
  if (typeof rawOutput === 'string') {
    const trimmed = rawOutput.trim()
    if (!trimmed) return []

    // Try parsing as JSON first
    if (
      (trimmed.startsWith('[') && trimmed.endsWith(']')) ||
      (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
      (trimmed.startsWith('"') && trimmed.endsWith('"'))
    ) {
      try {
        const parsed = JSON.parse(trimmed)
        if (typeof parsed === 'string') {
          return parseLibrariesOutput(parsed)
        }
        return parseLibrariesOutput(parsed)
      } catch {
        // Fall through to delimiter splitting
      }
    }

    if (trimmed.includes('\n')) {
      const items = trimmed
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => ({ id: s, name: s }))
      return items
    }
    if (trimmed.includes(';')) {
      const items = trimmed
        .split(';')
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => ({ id: s, name: s }))
      return items
    }
    if (trimmed.includes(',')) {
      const items = trimmed
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => ({ id: s, name: s }))
      return items
    }

    return [{ id: trimmed, name: trimmed }]
  }

  return []
}

const extractFolderNameOrPath = (item: unknown): string | null => {
  if (typeof item === 'string') {
    const trimmed = item.trim()
    return trimmed.length > 0 ? trimmed : null
  }
  if (item && typeof item === 'object') {
    const record = item as Record<string, unknown>
    const candidate =
      record.Path ??
      record.path ??
      record.FolderPath ??
      record.folderPath ??
      record.Name ??
      record.name ??
      record.Title ??
      record.title ??
      record.DisplayName ??
      record.displayName ??
      record.ServerRelativeUrl ??
      record.serverRelativeUrl ??
      record.FileRef ??
      record.fileRef ??
      record.value ??
      record.Value
    if (typeof candidate === 'string' && candidate.trim().length > 0) {
      return candidate.trim()
    }
  }
  return null
}

export interface FolderChildFile {
  id: string
  name: string
  size: string
  type: string
  link?: string
  folderPath?: string
}

const extractFileItem = (item: unknown): FolderChildFile | null => {
  if (!item || typeof item !== 'object') return null
  const record = item as Record<string, unknown>

  const isFolder =
    record.IsFolder === true ||
    record['{IsFolder}'] === true ||
    record.isFolder === true ||
    record.FSObjType === 1

  const nameCandidate =
    record.Name ??
    record.name ??
    record.DisplayName ??
    record.displayName ??
    record.FileLeafRef ??
    record.Title ??
    record.title

  if (typeof nameCandidate !== 'string' || !nameCandidate.trim()) return null
  const fileName = nameCandidate.trim()

  if (isFolder && !/\.[a-zA-Z0-9]{2,5}$/.test(fileName)) {
    return null
  }

  if (!/\.[a-zA-Z0-9]{2,5}$/.test(fileName) && record.FSObjType !== 0 && !record.MediaType) {
    return null
  }

  const path = (record.Path ?? record.path ?? record.ServerRelativeUrl ?? record.FileRef ?? '') as string
  const link = (record.Link ?? record.link ?? record['{Link}'] ?? record.AbsoluteUrl ?? path) as string
  const rawSize = record.Size ?? record.size ?? record.Length ?? record['{Size}'] ?? ''
  let sizeStr = ''
  if (typeof rawSize === 'number') {
    sizeStr = rawSize > 1048576 ? `${(rawSize / 1048576).toFixed(1)} MB` : `${Math.round(rawSize / 1024)} KB`
  } else if (typeof rawSize === 'string') {
    sizeStr = rawSize
  }

  const idCandidate = record.Id ?? record.id ?? record.ID ?? `file-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

  return {
    id: String(idCandidate),
    name: fileName,
    size: sizeStr,
    type: inferFileType(fileName, path),
    link: typeof link === 'string' ? link : '',
    folderPath: typeof path === 'string' ? path : '',
  }
}

const parseSharePointOutput = (rawOutput: unknown): { folders: string[]; files: FolderChildFile[] } => {
  if (!rawOutput) return { folders: [], files: [] }

  const folders: string[] = []
  const files: FolderChildFile[] = []

  const processArray = (arr: unknown[]) => {
    for (const item of arr) {
      const folderCandidate = extractFolderNameOrPath(item)
      if (folderCandidate) folders.push(folderCandidate)
      const fileCandidate = extractFileItem(item)
      if (fileCandidate) files.push(fileCandidate)
    }
  }

  if (Array.isArray(rawOutput)) {
    processArray(rawOutput)
  } else if (typeof rawOutput === 'object' && rawOutput !== null) {
    const obj = rawOutput as Record<string, unknown>
    for (const key of ['value', 'folders', 'files', 'output', 'd', 'results', 'body']) {
      if (Array.isArray(obj[key])) {
        processArray(obj[key] as unknown[])
      } else if (obj[key] && typeof obj[key] === 'object' && Array.isArray((obj[key] as any).results)) {
        processArray((obj[key] as any).results)
      }
    }
  } else if (typeof rawOutput === 'string') {
    const trimmed = rawOutput.trim()
    if (trimmed) {
      if (
        (trimmed.startsWith('[') && trimmed.endsWith(']')) ||
        (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
        (trimmed.startsWith('"') && trimmed.endsWith('"'))
      ) {
        try {
          const parsed = JSON.parse(trimmed)
          return parseSharePointOutput(parsed)
        } catch {
          // fallback
        }
      }
      const splitted = trimmed.split(/[\n;,]/).map((s) => s.trim()).filter(Boolean)
      for (const s of splitted) {
        if (/\.[a-zA-Z0-9]{2,5}$/.test(s)) {
          files.push({
            id: `sp-file-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            name: s,
            size: '',
            type: inferFileType(s),
            link: '',
          })
        } else {
          folders.push(s)
        }
      }
    }
  }

  return {
    folders: Array.from(new Set(folders)),
    files,
  }
}

const parseFoldersOutput = (rawOutput: unknown): string[] => {
  if (!rawOutput) return []

  if (Array.isArray(rawOutput)) {
    const names = rawOutput
      .map(extractFolderNameOrPath)
      .filter((v): v is string => Boolean(v))
    return Array.from(new Set(names))
  }

  if (typeof rawOutput === 'object') {
    const obj = rawOutput as Record<string, unknown>
    for (const key of ['value', 'folders', 'output', 'd', 'results', 'body']) {
      if (Array.isArray(obj[key])) {
        return parseFoldersOutput(obj[key])
      }
      if (
        obj[key] &&
        typeof obj[key] === 'object' &&
        Array.isArray((obj[key] as any).results)
      ) {
        return parseFoldersOutput((obj[key] as any).results)
      }
    }
  }

  if (typeof rawOutput === 'string') {
    const trimmed = rawOutput.trim()
    if (!trimmed) return []

    if (
      (trimmed.startsWith('[') && trimmed.endsWith(']')) ||
      (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
      (trimmed.startsWith('"') && trimmed.endsWith('"'))
    ) {
      try {
        const parsed = JSON.parse(trimmed)
        if (typeof parsed === 'string') {
          return parseFoldersOutput(parsed)
        }
        return parseFoldersOutput(parsed)
      } catch {
        // Fall through to delimiter splitting
      }
    }

    if (trimmed.includes('\n')) {
      const items = trimmed
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean)
      return Array.from(new Set(items))
    }
    if (trimmed.includes(';')) {
      const items = trimmed
        .split(';')
        .map((s) => s.trim())
        .filter(Boolean)
      return Array.from(new Set(items))
    }
    if (trimmed.includes(',')) {
      const items = trimmed
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
      return Array.from(new Set(items))
    }

    return [trimmed]
  }

  return []
}

/*
 * ---------------------------------------------------------
 * Component: ReferenceManageContent
 * ---------------------------------------------------------
 */
const ReferenceManageContent = ({
  subcategory,
  sites,
  saving,
  canEditSubcategoryName,
  canEditDescription,
  referenceItems: propsReferenceItems,
  onCancel,
  onSave,
}: ReferenceManageContentProps) => {
  /*
   * 1. Header Title & Description
   */
  const isOverview = (() => {
    const norm = (subcategory.name || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '')
    return norm === 'jj' || norm === 'overviewofjj' || norm === 'overviewofjjh' || norm.includes('overviewofjj')
  })()

  const [contentTitle, setContentTitle] = useState(
    subcategory.name || (isOverview ? 'Overview of J&J H' : ''),
  )
  const [contentDescription, setContentDescription] = useState(
    subcategory.description !== undefined && subcategory.description !== null
      ? subcategory.description
      : isOverview
      ? 'List of contents available under Overview of J&J H'
      : '',
  )

  /*
   * 2. Drafts state
   */
  const [drafts, setDrafts] = useState<ReferenceMasterDraft[]>(
    subcategory.items && subcategory.items.length > 0
      ? subcategory.items.map((item) => ({
          id: item.id,
          name: item.name,
          type: item.type,
          link: item.link ?? '',
          folderName: item.folderName ?? '',
          libraryId: item.libraryId ?? '',
          libraryName: item.libraryName ?? '',
          folderParentPath: item.folderParentPath ?? '',
          folderPath: item.folderPath ?? '',
          siteId: item.siteId ?? '',
        }))
      : [],
  )

  /*
   * 3. Creation Form Inputs
   */
  const [newType, setNewType] = useState<'folder' | 'link'>('folder')
  const [newName, setNewName] = useState('')
  const [newLink, setNewLink] = useState('')
  const [newFolderSiteId, setNewFolderSiteId] = useState('')
  const [newFolderLibrary, setNewFolderLibrary] = useState('')
  const [newFolderPath, setNewFolderPath] = useState('')
  const [showFolderPicker, setShowFolderPicker] = useState(false)
  const [showEditFolderPicker, setShowEditFolderPicker] = useState(false)

  /*
   * 3b. SharePoint Libraries state from GetSharePointLibraries flow
   */
  const [libraries, setLibraries] = useState<SharePointLibraryItem[]>([])
  const [loadingLibraries, setLoadingLibraries] = useState<boolean>(false)

  /*
   * 3c. SharePoint Folders state from GetSharePointFolders flow
   */
  const [folders, setFolders] = useState<string[]>([])
  const [loadingFolders, setLoadingFolders] = useState<boolean>(false)

  /*
   * 4. Notification & Editing state
   */
  const [notification, setNotification] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState<ReferenceMasterDraft | null>(null)
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())

  /*
   * 4b. Editing Folder SharePoint Libraries & Folders state
   */
  const [editLibraries, setEditLibraries] = useState<SharePointLibraryItem[]>([])
  const [loadingEditLibraries, setLoadingEditLibraries] = useState<boolean>(false)
  const [editFolders, setEditFolders] = useState<string[]>([])
  const [loadingEditFolders, setLoadingEditFolders] = useState<boolean>(false)

  /*
   * 5. Delete Confirmation Modal state
   */
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false)
  const [itemToDelete, setItemToDelete] = useState<{
    id: string
    title: string
  } | null>(null)

  /*
   * 6. Reference folder items from Dataverse
   */
  const [referenceItems, setReferenceItems] = useState<Cp_refitemses[]>(
    propsReferenceItems && propsReferenceItems.length > 0 ? propsReferenceItems : [],
  )

  const resolveSiteUrl = (siteId: string): string => {
    const selectedSite = sites.find((s) => s.id === siteId)
    if (!selectedSite) return ''
    if (selectedSite.url && selectedSite.url.trim().length > 0) {
      let u = selectedSite.url.trim()
      if (!u.startsWith('http://') && !u.startsWith('https://')) {
        u = `https://${u}`
      }
      return u
    }
    if (selectedSite.name && selectedSite.name.trim().startsWith('http')) {
      return selectedSite.name.trim()
    }
    return ''
  }

  /*
   * Trigger GetSharePointLibraries flow for a given site ID
   */
  const triggerFlowForSite = async (siteId: string) => {
    if (!siteId) {
      setLibraries([])
      setLoadingLibraries(false)
      setFolders([])
      setLoadingFolders(false)
      return
    }

    const siteUrl = resolveSiteUrl(siteId)
    if (!siteUrl) {
      console.warn('[GetSharePointLibraries] No site URL resolved for site ID:', siteId)
      showNotification('Selected site does not have a valid Site URL.')
      setLibraries([])
      setLoadingLibraries(false)
      setFolders([])
      setLoadingFolders(false)
      return
    }

    console.log('[GetSharePointLibraries] Triggering flow with URL:', siteUrl)
    setLoadingLibraries(true)
    setLibraries([])
    setFolders([])
    setLoadingFolders(false)

    try {
      const payload = {
        text: siteUrl,
        SiteURL: siteUrl,
        siteUrl: siteUrl,
      }
      console.log('[GetSharePointLibraries] Sending payload:', payload)
      const result = await GetSharePointLibrariesService.Run(payload as any)
      console.log('[GetSharePointLibraries] Flow response:', result)

      if (result && !result.success) {
        const errorMsg = result.error?.message || 'Flow execution returned unsuccessful'
        console.error('[GetSharePointLibraries] Flow execution error:', errorMsg, result.error)
        showNotification(`Flow error: ${errorMsg}`)
        setLibraries([])
        return
      }

      const rawOutput = (result as any)?.data?.output ?? (result as any)?.data
      console.log('[GetSharePointLibraries] Raw flow output:', rawOutput)
      const parsed = parseLibrariesOutput(rawOutput)
      console.log('[GetSharePointLibraries] Parsed libraries:', parsed)
      setLibraries(parsed)

      if (parsed.length > 0) {
        showNotification(`Retrieved ${parsed.length} SharePoint ${parsed.length === 1 ? 'library' : 'libraries'}.`)
      } else {
        showNotification('Flow completed, but no libraries were found for this site.')
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err)
      console.error('[GetSharePointLibraries] Exception triggering flow:', err)
      showNotification(`Failed to trigger flow: ${errorMsg}`)
      setLibraries([])
    } finally {
      setLoadingLibraries(false)
    }
  }

  /*
   * Trigger GetSharePointFolders flow for a given site and library
   */
  const triggerFoldersFlow = async (siteIdOrUrl: string, libraryIdOrName: string) => {
    if (!siteIdOrUrl || !libraryIdOrName) {
      setFolders([])
      setLoadingFolders(false)
      return
    }

    const siteUrl = resolveSiteUrl(siteIdOrUrl) || (siteIdOrUrl.startsWith('http') ? siteIdOrUrl : '')
    if (!siteUrl) {
      console.warn('[GetSharePointFolders] No site URL resolved for site:', siteIdOrUrl)
      showNotification('Selected site does not have a valid Site URL.')
      setFolders([])
      setLoadingFolders(false)
      return
    }

    const selectedLib = libraries.find(
      (l) => l.id === libraryIdOrName || l.name === libraryIdOrName,
    )
    const libId = selectedLib?.id || libraryIdOrName
    const libName = selectedLib?.name || libraryIdOrName

    console.log('[GetSharePointFolders] Triggering flow with SiteURL:', siteUrl, 'and LibID:', libId)
    setLoadingFolders(true)
    setFolders([])

    try {
      const payload = {
        text: siteUrl,
        text_1: libId,
        SiteURL: siteUrl,
        siteUrl: siteUrl,
        LibID: libId,
        libId: libId,
        LibraryId: libId,
        Library: libId,
        library: libId,
        libraryName: libName,
      }
      console.log('[GetSharePointFolders] Sending payload:', payload)
      const result = await GetSharePointFoldersService.Run(payload as any)
      console.log('[GetSharePointFolders] Flow response:', result)

      if (result && !result.success) {
        const errorMsg = result.error?.message || 'Flow execution returned unsuccessful'
        console.error('[GetSharePointFolders] Flow execution error:', errorMsg, result.error)
        showNotification(`Folders flow error: ${errorMsg}`)
        setFolders([])
        return
      }

      const rawOutput = (result as any)?.data?.output ?? (result as any)?.data
      console.log('[GetSharePointFolders] Raw folders output:', rawOutput)
      const spParsed = parseSharePointOutput(rawOutput)
      const parsed = spParsed.folders.length > 0 ? spParsed.folders : parseFoldersOutput(rawOutput)
      console.log('[GetSharePointFolders] Parsed folders:', parsed)
      setFolders(parsed)

      if (parsed.length > 0) {
        showNotification(`Retrieved ${parsed.length} SharePoint ${parsed.length === 1 ? 'folder' : 'folders'}.`)
      } else {
        showNotification('Folders flow completed, but no folders were found in this library.')
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err)
      console.error('[GetSharePointFolders] Exception triggering folders flow:', err)
      showNotification(`Failed to trigger folders flow: ${errorMsg}`)
      setFolders([])
    } finally {
      setLoadingFolders(false)
    }
  }

  /*
   * Site Selection Handler:
   * When user selects a Site address, reset the selected Library, Folder Path, and trigger library flow.
   */
  const handleSiteChange = (siteId: string) => {
    setNewFolderSiteId(siteId)
    setNewFolderLibrary('')
    setNewFolderPath('')
    setFolders([])
    triggerFlowForSite(siteId)
  }

  /*
   * Library Selection Handler:
   * When user selects a Library, reset the selected Folder Path and trigger GetSharePointFolders flow.
   */
  const handleLibraryChange = (libraryVal: string) => {
    setNewFolderLibrary(libraryVal)
    setNewFolderPath('')
    setFolders([])
    if (newFolderSiteId && libraryVal) {
      triggerFoldersFlow(newFolderSiteId, libraryVal)
    }
  }

  const getFolderDisplayPath = (path: string) => {
    if (!path || path === '/') return 'Root Folder'
    const parts = path.replace(/^\/+/, '').split('/').filter(Boolean)
    return parts.slice(-3).join(' > ')
  }

  /*
   * Sync flow when newFolderSiteId changes
   */
  useEffect(() => {
    if (newFolderSiteId) {
      triggerFlowForSite(newFolderSiteId)
    } else {
      setLibraries([])
      setLoadingLibraries(false)
      setFolders([])
      setLoadingFolders(false)
    }
  }, [newFolderSiteId])

  /*
   * Load content on subcategory mount
   */
  useEffect(() => {
    const isOverview = (() => {
      const norm = (subcategory.name || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '')
      return norm === 'jj' || norm === 'overviewofjj' || norm === 'overviewofjjh' || norm.includes('overviewofjj')
    })()

    const initialTitle = subcategory.name || (isOverview ? 'Overview of J&J H' : '')
    const initialDesc =
      subcategory.description !== undefined && subcategory.description !== null
        ? subcategory.description
        : isOverview
        ? 'List of contents available under Overview of J&J H'
        : ''

    setContentTitle(initialTitle)
    setContentDescription(initialDesc)

    if (subcategory.items && subcategory.items.length > 0) {
      setDrafts(
        subcategory.items.map((item) => ({
          id: item.id,
          name: item.name,
          type: item.type,
          link: item.link ?? '',
          folderName: item.folderName ?? '',
          libraryId: item.libraryId ?? '',
          libraryName: item.libraryName ?? '',
          folderParentPath: item.folderParentPath ?? '',
          folderPath: item.folderPath ?? '',
          siteId: item.siteId ?? '',
        })),
      )
    } else {
      setDrafts([])
    }

    setNewType('folder')
    setNewName('')
    setNewLink('')
    setNewFolderSiteId('')
    setNewFolderLibrary('')
    setNewFolderPath('')
    setLibraries([])
    setLoadingLibraries(false)
    setNotification(null)
    setEditingId(null)
    setEditDraft(null)
    setExpandedFolders(new Set())
  }, [subcategory.id])

  /*
   * Load REF Items for expandable folders
   */
  useEffect(() => {
    if (propsReferenceItems && propsReferenceItems.length > 0) {
      setReferenceItems(propsReferenceItems)
      return
    }

    let cancelled = false

    const loadReferenceItems = async () => {
      try {
        const result = await Cp_refitemsesService.getAll()
        if (!cancelled) {
          setReferenceItems(result.data ?? [])
        }
      } catch (error) {
        console.error('REF ITEMS LOAD ERROR:', error)
        if (!cancelled) {
          setReferenceItems([])
        }
      }
    }

    void loadReferenceItems()

    return () => {
      cancelled = true
    }
  }, [propsReferenceItems])

  /*
   * Escape key to close delete modal
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showDeleteModal) {
        setShowDeleteModal(false)
        setItemToDelete(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showDeleteModal])

  /*
   * Get folder items helper from Dataverse REF Items
   */
  const getFolderItems = (
    folderName: string,
    folderId?: string | null,
    folderPath?: string,
  ): FolderChildFile[] => {
    const countMatch = (folderName || '').match(/^(.*?)\s*\((\d+)\)$/)
    const rawClean = (countMatch ? countMatch[1] : folderName).trim()
    const cleanFolderName = rawClean.toLowerCase() === 'data pipeline' ? 'Data Pipeline' : rawClean
    const normalizedName = cleanFolderName.toLowerCase()
    const cleanPath = (folderPath || '').replace(/^\/+/, '').trim().toLowerCase()
    // 1. Match from Dataverse referenceItems
    let dvItems = referenceItems.filter(
      (item: any) =>
        item.statecode !== 1 &&
        Boolean(folderId) &&
        (item._cp_refmaster_value === folderId ||
          item.cp_refmaster?.cp_refmastersid === folderId),
    )

    // Unsaved/temporary folder ids must not match files by name/path (avoids duplicates until sync).
    const isUnsavedFolder = Boolean(folderId) && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(folderId))

    if (dvItems.length === 0 && !isUnsavedFolder && (normalizedName || cleanPath)) {
      dvItems = referenceItems.filter((item: any) => {
        if (item.statecode === 1) return false
        const masterObjName = (item.cp_refmaster?.cp_name || '').trim().toLowerCase()
        if (masterObjName && (masterObjName === normalizedName || (cleanPath && masterObjName.includes(cleanPath)) || (cleanPath && cleanPath.includes(masterObjName)))) {
          return true
        }
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

    if (dvItems.length > 0) {
      return dvItems.map((f: any) => {
        const fileType = (f.cp_filetype ?? '').toString().trim()
        return {
          id: f.cp_refitemsid,
          name: f.cp_filename ?? 'Document',
          size: f.cp_filesize ?? '',
          type: fileType || inferFileType(f.cp_filename ?? '', f.cp_filelink ?? f.cp_filepath ?? ''),
          link: f.cp_filelink ?? f.cp_filepath ?? '',
        }
      })
    }

    return []
  }

  const getFolderCount = (item: ReferenceMasterDraft) => {
    const items = getFolderItems(item.name, item.id, item.folderPath)
    return items.length
  }

  const notificationTimeoutRef = useRef<number | null>(null)

  const showNotification = (message: string) => {
    if (notificationTimeoutRef.current) {
      window.clearTimeout(notificationTimeoutRef.current)
    }
    setNotification(message)
    notificationTimeoutRef.current = window.setTimeout(() => {
      setNotification(null)
      notificationTimeoutRef.current = null
    }, 5000)
  }

  const validateLinkItem = (
    title: string,
    url: string,
    ignoreId?: string,
  ): string | null => {
    const trimmedTitle = title.trim()
    const trimmedUrl = url.trim()

    const titleError = validateName(title, 'Title')
    if (titleError) {
      return titleError
    }

    if (!trimmedUrl) {
      return 'Please enter a URL.'
    }

    if (!/[a-zA-Z0-9]/.test(trimmedUrl)) {
      return 'Only special characters are not allowed.'
    }

    const duplicateTitle = drafts.some(
      (item) =>
        (item.id ?? item.name) !== ignoreId &&
        item.name.trim().toLowerCase() === trimmedTitle.toLowerCase(),
    )

    const duplicateLink = drafts.some(
      (item) =>
        (item.id ?? item.name) !== ignoreId &&
        item.type === 'link' &&
        Boolean(item.link) &&
        item.link.trim().toLowerCase() === trimmedUrl.toLowerCase(),
    )

    if (duplicateTitle && duplicateLink) {
      return `Title "${trimmedTitle}" and link "${trimmedUrl}" already exist.`
    }

    if (duplicateTitle) {
      return `Title "${trimmedTitle}" already exists.`
    }

    if (!isValidHttpsUrl(trimmedUrl)) {
      return 'URL must start with https:// and be a valid HTTPS URL.'
    }

    if (duplicateLink) {
      return `Link "${trimmedUrl}" already exists.`
    }

    return null
  }

  /*
   * Add Item
   */
  const handleAdd = () => {
    const trimmedTitle = newName.trim()
    const titleError = validateName(newName, 'Title')
    if (titleError) {
      showNotification(titleError)
      return
    }

    if (newType === 'link') {
      const trimmedUrl = newLink.trim()
      const errorMsg = validateLinkItem(trimmedTitle, trimmedUrl)
      if (errorMsg) {
        showNotification(errorMsg)
        return
      }

      const newDraft: ReferenceMasterDraft = {
        id: `ref-link-${Date.now()}`,
        name: trimmedTitle,
        type: 'link',
        link: trimmedUrl,
        folderName: '',
        libraryId: '',
        folderParentPath: '',
        folderPath: '',
        siteId: '',
      }

      setDrafts((current) => [...current, newDraft])
      setNewName('')
      setNewLink('')
      return
    }

    // Folder
    if (!newFolderSiteId) {
      showNotification('Please select a Site Address.')
      return
    }
    if (!newFolderLibrary) {
      showNotification('Please select a Library.')
      return
    }
    const duplicateFolderTitle = drafts.some(
      (item) => item.name.trim().toLowerCase() === trimmedTitle.toLowerCase(),
    )
    if (duplicateFolderTitle) {
      showNotification(`Title "${trimmedTitle}" already exists.`)
      return
    }
    const selectedLib = libraries.find(
      (l) => l.id === newFolderLibrary || l.name === newFolderLibrary,
    )
    const libraryDisplayName = selectedLib?.name || newFolderLibrary
    const libraryId = selectedLib?.id || newFolderLibrary

    const matchingSite = sites.find(
      (s) =>
        s.id === newFolderSiteId ||
        (s.url && newFolderSiteId.includes(s.url)),
    )
    const effectiveSiteId = matchingSite?.id || newFolderSiteId

    const rawFolderPath = newFolderPath.trim()
    const effectiveFolderPath =
      rawFolderPath && rawFolderPath !== '/'
        ? (rawFolderPath.startsWith('/') ? rawFolderPath : `/${rawFolderPath}`)
        : `/${trimmedTitle}`

    const newFolderId = `ref-folder-${Date.now()}`
    const newDraft: ReferenceMasterDraft = {
      id: newFolderId,
      name: trimmedTitle,
      type: 'folder',
      link: '',
      folderName: libraryDisplayName.trim() || trimmedTitle,
      libraryId: libraryId.trim(),
      libraryName: libraryDisplayName.trim(),
      folderParentPath: effectiveFolderPath.split('/').slice(0, -1).join('/'),
      folderPath: effectiveFolderPath,
      siteId: effectiveSiteId,
    }

    setDrafts((current) => [...current, newDraft])

    setNewName('')
    setNewFolderSiteId('')
    setNewFolderLibrary('')
    setNewFolderPath('')
    setLibraries([])
    setFolders([])
  }

  /*
   * Trigger GetSharePointLibraries flow for editing a folder
   */
  const triggerFlowForEditSite = async (siteId: string): Promise<SharePointLibraryItem[]> => {
    if (!siteId) {
      setEditLibraries([])
      setLoadingEditLibraries(false)
      setEditFolders([])
      setLoadingEditFolders(false)
      return []
    }

    const siteUrl = resolveSiteUrl(siteId)
    if (!siteUrl) {
      setEditLibraries([])
      setLoadingEditLibraries(false)
      setEditFolders([])
      setLoadingEditFolders(false)
      return []
    }

    setLoadingEditLibraries(true)
    try {
      const payload = {
        text: siteUrl,
        SiteURL: siteUrl,
        siteUrl: siteUrl,
      }
      const result = await GetSharePointLibrariesService.Run(payload as any)
      if (result && !result.success) {
        setEditLibraries([])
        return []
      }
      const rawOutput = (result as any)?.data?.output ?? (result as any)?.data
      const parsed = parseLibrariesOutput(rawOutput)
      setEditLibraries(parsed)
      return parsed
    } catch {
      setEditLibraries([])
      return []
    } finally {
      setLoadingEditLibraries(false)
    }
  }

  /*
   * Trigger GetSharePointFolders flow for editing a folder
   */
  const triggerFoldersFlowForEdit = async (
    siteIdOrUrl: string,
    libraryIdOrName: string,
    availableLibs: SharePointLibraryItem[] = [],
  ): Promise<string[]> => {
    if (!siteIdOrUrl || !libraryIdOrName) {
      setEditFolders([])
      setLoadingEditFolders(false)
      return []
    }

    const siteUrl = resolveSiteUrl(siteIdOrUrl) || (siteIdOrUrl.startsWith('http') ? siteIdOrUrl : '')
    if (!siteUrl) {
      setEditFolders([])
      setLoadingEditFolders(false)
      return []
    }

    const libList = availableLibs.length > 0 ? availableLibs : editLibraries
    const selectedLib = libList.find(
      (l) => l.id === libraryIdOrName || l.name === libraryIdOrName,
    )
    const libId = selectedLib?.id || libraryIdOrName
    const libName = selectedLib?.name || libraryIdOrName

    setLoadingEditFolders(true)
    try {
      const payload = {
        text: siteUrl,
        text_1: libId,
        SiteURL: siteUrl,
        siteUrl: siteUrl,
        LibID: libId,
        libId: libId,
        LibraryId: libId,
        Library: libId,
        library: libId,
        libraryName: libName,
      }
      const result = await GetSharePointFoldersService.Run(payload as any)
      if (result && !result.success) {
        setEditFolders([])
        return []
      }
      const rawOutput = (result as any)?.data?.output ?? (result as any)?.data
      const parsed = parseFoldersOutput(rawOutput)
      setEditFolders(parsed)
      return parsed
    } catch {
      setEditFolders([])
      return []
    } finally {
      setLoadingEditFolders(false)
    }
  }

  const handleEditSiteChange = async (siteId: string) => {
    setEditDraft((cur) => (cur ? { ...cur, siteId } : cur))
    if (siteId) {
      const libs = await triggerFlowForEditSite(siteId)
      if (editDraft?.libraryId || editDraft?.folderName) {
        await triggerFoldersFlowForEdit(
          siteId,
          editDraft.libraryId || editDraft.folderName,
          libs,
        )
      }
    }
  }

  const handleEditLibraryChange = async (libraryVal: string) => {
    const selectedLibrary = editLibraries.find(
      (library) => library.id === libraryVal || library.name === libraryVal,
    )
    setEditDraft((cur) => (cur ? {
      ...cur,
      folderName: selectedLibrary?.name || libraryVal,
      libraryId: selectedLibrary?.id || libraryVal,
    } : cur))
    if (editDraft?.siteId && libraryVal) {
      await triggerFoldersFlowForEdit(editDraft.siteId, libraryVal, editLibraries)
    }
  }

  const handleEditFolderChange = (folderPathVal: string) => {
    setEditDraft((cur) => (cur ? { ...cur, folderPath: folderPathVal } : cur))
  }

  /*
   * Edit Item
   */
  const handleStartEdit = async (item: ReferenceMasterDraft, index: number) => {
    if (typeof document !== 'undefined' && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur()
    }

    const resolvedSiteId = item.siteId || ''

    const resolvedLibrary =
      item.libraryName ||
      item.folderParentPath ||
      item.folderName ||
      (libraries.length > 0 ? (libraries[0].id || libraries[0].name) : 'Documents')

    const resolvedFolderPath =
      item.folderPath || (item.name ? `/${item.name.replace(/\s*\(\d+\)$/, '')}` : '/')

    const initialEditDraft: ReferenceMasterDraft = {
      ...item,
      siteId: item.type === 'folder' ? resolvedSiteId : item.siteId,
      folderName: item.type === 'folder' ? (item.folderName || resolvedLibrary) : item.folderName,
      libraryId: item.type === 'folder' ? (item.libraryId || resolvedLibrary) : item.libraryId,
      folderParentPath: item.type === 'folder' ? (item.folderParentPath || resolvedLibrary) : item.folderParentPath,
      folderPath: item.type === 'folder' ? (item.folderPath || resolvedFolderPath) : item.folderPath,
    }

    setEditingId(item.id ?? `draft-${index}`)
    setEditDraft(initialEditDraft)

    if (item.type === 'folder') {
      const currentSite = resolvedSiteId
      const currentLib = initialEditDraft.libraryId || initialEditDraft.folderName || resolvedLibrary
      if (currentSite) {
        const loadedLibs = await triggerFlowForEditSite(currentSite)
        if (currentLib) {
          await triggerFoldersFlowForEdit(currentSite, currentLib, loadedLibs)
        }
      }
    }
  }

  const handleCancelEdit = () => {
    if (typeof document !== 'undefined' && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur()
    }
    setEditingId(null)
    setEditDraft(null)
    setEditLibraries([])
    setEditFolders([])
    setLoadingEditLibraries(false)
    setLoadingEditFolders(false)
  }

  const handleSaveEdit = () => {
    if (typeof document !== 'undefined' && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur()
    }
    if (!editDraft) return
    const trimmedTitle = editDraft.name.trim()
    const currentId = editDraft.id ?? editDraft.name

    if (editDraft.type === 'link') {
      const trimmedUrl = (editDraft.link || '').trim()
      const errorMsg = validateLinkItem(trimmedTitle, trimmedUrl, currentId)
      if (errorMsg) {
        showNotification(errorMsg)
        return
      }
    } else {
      const titleError = validateName(editDraft.name, 'Title')
      if (titleError) {
        showNotification(titleError)
        return
      }
      const duplicateTitle = drafts.some(
        (item) =>
          (item.id ?? item.name) !== currentId &&
          item.name.trim().toLowerCase() === trimmedTitle.toLowerCase(),
      )
      if (duplicateTitle) {
        showNotification(`Title "${trimmedTitle}" already exists.`)
        return
      }
    }

    const selectedLibraryValue = editDraft.libraryId || editDraft.folderName
    const selectedLib = editLibraries.find(
      (l) => l.id === selectedLibraryValue || l.name === selectedLibraryValue,
    )
    const libraryDisplayName = selectedLib?.name || editDraft.folderName || ''

    setDrafts((current) =>
      current.map((item) =>
        (item.id ?? item.name) === currentId
          ? {
              ...editDraft,
              name: trimmedTitle,
              link: editDraft.type === 'link' ? editDraft.link.trim() : '',
              folderName: editDraft.type === 'folder' ? libraryDisplayName.trim() : '',
              libraryId: editDraft.type === 'folder' ? (selectedLib?.id || editDraft.libraryId || '') : '',
              libraryName: editDraft.type === 'folder' ? libraryDisplayName.trim() : '',
              folderParentPath:
                editDraft.type === 'folder'
                  ? (editDraft.folderPath || '').trim().split('/').slice(0, -1).join('/')
                  : '',
              folderPath:
                editDraft.type === 'folder'
                  ? (() => {
                      const raw = (editDraft.folderPath || '').trim()
                      if (raw && raw !== '/') {
                        return raw.startsWith('/') ? raw : `/${raw}`
                      }
                      return `/${trimmedTitle}`
                    })()
                  : '',
              siteId: editDraft.type === 'folder' ? (editDraft.siteId || '').trim() : '',
            }
          : item,
      ),
    )

    setEditingId(null)
    setEditDraft(null)
    setEditLibraries([])
    setEditFolders([])
    setLoadingEditLibraries(false)
    setLoadingEditFolders(false)
  }

  /*
   * Delete Item
   */
  const handleRequestDelete = (item: ReferenceMasterDraft) => {
    setItemToDelete({
      id: item.id ?? item.name,
      title: item.name,
    })
    setShowDeleteModal(true)
  }

  const handleConfirmDelete = () => {
    if (!itemToDelete) return
    setDrafts((current) =>
      current.filter((item) => (item.id ?? item.name) !== itemToDelete.id),
    )
    if (editingId === itemToDelete.id) {
      setEditingId(null)
      setEditDraft(null)
    }
    setShowDeleteModal(false)
    setItemToDelete(null)
  }

  const handleCancelDelete = () => {
    setShowDeleteModal(false)
    setItemToDelete(null)
  }

  /*
   * Move Item
   */
  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= drafts.length) return

    setDrafts((current) => {
      const updated = [...current]
      const temp = updated[index]
      updated[index] = updated[targetIndex]
      updated[targetIndex] = temp
      return updated
    })
  }

  /*
   * Folder Expand / Collapse
   */
  const toggleFolder = (key: string) => {
    setExpandedFolders((current) => {
      const next = new Set(current)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  /*
   * Save Changes
   */
  const handleSave = async () => {
    if (saving) return

    if (canEditSubcategoryName) {
      const titleError = validateName(contentTitle, 'Title')
      if (titleError) {
        showNotification(titleError)
        return
      }
    }

    if (contentTitle.trim() && !/[a-zA-Z0-9]/.test(contentTitle.trim())) {
      showNotification('Only special characters are not allowed.')
      return
    }

    if (canEditDescription && contentDescription.trim() && !/[a-zA-Z0-9]/.test(contentDescription.trim())) {
      showNotification('Only special characters are not allowed.')
      return
    }

    const invalidDraft = drafts.find((draft) => {
      const originalItem = subcategory.items?.find(
        (item) => item.id === draft.id,
      )
      const isNewOrChangedTitle =
        !originalItem ||
        draft.name.trim() !== originalItem.name.trim()

      return isNewOrChangedTitle && validateName(draft.name, 'Title')
    })
    if (invalidDraft) {
      showNotification(validateName(invalidDraft.name, 'Title') ?? 'Invalid title.')
      return
    }

    const duplicateTitle = drafts.findIndex(
      (draft, index) =>
        drafts.findIndex(
          (candidate) => candidate.name.trim().toLowerCase() === draft.name.trim().toLowerCase(),
        ) !== index,
    )
    if (duplicateTitle !== -1) {
      showNotification(`Duplicate title "${drafts[duplicateTitle].name}" is not allowed.`)
      return
    }

    const linkDrafts = drafts.filter((draft) => draft.type === 'link')
    const duplicateLink = linkDrafts.findIndex(
      (draft, index) =>
        linkDrafts.findIndex(
          (candidate) => candidate.link.trim().toLowerCase() === draft.link.trim().toLowerCase(),
        ) !== index,
    )
    if (duplicateLink !== -1) {
      showNotification(`Duplicate link URL "${linkDrafts[duplicateLink].link}" is not allowed.`)
      return
    }

    try {
      await onSave(drafts, {
        title: canEditSubcategoryName
          ? contentTitle.trim() || subcategory.name || ''
          : subcategory.name,
        description: canEditDescription
          ? contentDescription.trim() || subcategory.description || ''
          : subcategory.description || '',
      })
    } catch (error) {
      console.error('REFERENCE MANAGE SAVE ERROR:', error)
      showNotification(
        error instanceof Error ? error.message : 'Unable to save references.',
      )
    }
  }

  return (
    <section className="right-content-panel pane reference-manage-content">
      {notification && (
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
            <span className="toast-message" style={{ color: '#ffffff' }}>{notification}</span>
          </div>
        </div>
      )}

      {/* =================================================
          1. PANEL HEADER & ACTION CONTROLS
          ================================================= */}
      <div className="ref-manage-header">
        <h2 className="ref-manage-title">Manage Content</h2>

        <div className="ref-manage-header-actions">
          <button
            type="button"
            className="ref-manage-cancel-btn"
            onClick={onCancel}
            disabled={saving}
          >
            Cancel
          </button>

          <button
            type="button"
            className="ref-manage-save-btn"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* =================================================
          2. TITLE & DESCRIPTION FORM FIELDS
          ================================================= */}
      <div className="ref-manage-fields-section">
        <div className="ref-manage-field-group">
          <label htmlFor="ref-manage-title-input" className="ref-manage-label">
            Title
          </label>
          <input
            id="ref-manage-title-input"
            type="text"
            className="ref-manage-input-title"
            value={contentTitle}
            onChange={(e) => setContentTitle(e.target.value)}
            disabled={saving || !canEditSubcategoryName}
            placeholder={contentTitle || subcategory.name || 'Title'}
          />
        </div>

        <div className="ref-manage-field-group">
          <label htmlFor="ref-manage-desc-input" className="ref-manage-label">
            Description
          </label>
          <textarea
            id="ref-manage-desc-input"
            className="ref-manage-textarea-desc"
            value={contentDescription}
            onChange={(e) => setContentDescription(e.target.value)}
            disabled={saving || !canEditDescription}
            placeholder={
              contentDescription ||
              subcategory.description ||
              (contentTitle ? `List of contents available under ${contentTitle}` : 'Description')
            }
            rows={3}
          />
        </div>
      </div>

      {/* =================================================
          3. "RESOURCES (X)" HEADER & MULTI-FIELD CREATION BAR
          ================================================= */}
      <div className="ref-manage-resources-section">
        <h3 className="ref-manage-resources-heading">
          Resources ({drafts.length})
        </h3>

        <div className="ref-manage-creation-row">
          {/* 1. Type Dropdown */}
          <select
            className="ref-manage-type-select"
            value={newType}
            onChange={(e) => setNewType(e.target.value as 'folder' | 'link')}
            disabled={saving}
            aria-label="Resource Type"
          >
            <option value="folder">Add New Folder</option>
            <option value="link">Add New Link</option>
          </select>

          {/* 2. Title Input */}
          <input
            type="text"
            className="ref-manage-creation-title"
            placeholder="Add Title"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            disabled={saving}
            aria-label="Title"
          />

          {newType === 'link' ? (
            /* Link URL input */
            <input
              type="text"
              className="ref-manage-link-url-input"
              placeholder="Add URL"
              value={newLink}
              onChange={(e) => setNewLink(e.target.value)}
              disabled={saving}
              aria-label="URL"
            />
          ) : (
            <>
              {/* 3. Site Address Dropdown */}
              <select
                className={`ref-manage-site-select ${newFolderSiteId ? 'has-value' : 'is-placeholder'}`}
                value={newFolderSiteId}
                onChange={(e) => handleSiteChange(e.target.value)}
                disabled={saving}
                aria-label="Site Address"
              >
                <option value="" disabled hidden>
                  Site Address
                </option>
                {sites.map((site) => (
                  <option key={site.id} value={site.id}>
                    {site.name}
                  </option>
                ))}
              </select>

              {/* 4. Library Dropdown */}
              <select
                className={`ref-manage-library-select ${newFolderLibrary ? 'has-value' : 'is-placeholder'}`}
                value={newFolderLibrary}
                onChange={(e) => handleLibraryChange(e.target.value)}
                disabled={saving || loadingLibraries || !newFolderSiteId}
                aria-label="Library"
              >
                <option value="" disabled hidden>
                  {loadingLibraries
                    ? 'Loading libraries...'
                    : !newFolderSiteId
                    ? 'Library'
                    : libraries.length === 0
                    ? 'No libraries found'
                    : 'Library'}
                </option>
                {newFolderLibrary && !libraries.some((l) => l.id === newFolderLibrary || l.name === newFolderLibrary) && (
                  <option value={newFolderLibrary}>{newFolderLibrary}</option>
                )}
                {libraries.map((lib) => (
                  <option key={lib.id || lib.name} value={lib.id || lib.name}>
                    {lib.name}
                  </option>
                ))}
              </select>

              {/* 5. Folder Path Picker */}
              <button
                type="button"
                className={`ref-manage-folderpath-picker ${newFolderPath ? 'has-value' : 'is-placeholder'}`}
                disabled={saving || !newFolderLibrary}
                aria-label="Folder Path"
                onClick={() => setShowFolderPicker(true)}
              >
                <span className="ref-manage-folderpath-icon" aria-hidden="true">📁</span>
                <span className="ref-manage-folderpath-label">
                  {newFolderPath ? getFolderDisplayPath(newFolderPath) : loadingFolders ? 'Loading folders...' : !newFolderLibrary ? 'Folder Path' : 'Select Folder...'}
                </span>
                <span className="ref-manage-folderpath-browse" aria-hidden="true">Browse</span>
              </button>
            </>
          )}

          {/* 6. "Add" Button */}
          {(() => {
            const isAddDisabled = saving || (
              newType === 'link'
                ? !newName.trim() || !newLink.trim()
                : !newName.trim() || !newFolderSiteId.trim() || !newFolderLibrary.trim() || !newFolderPath.trim()
            )
            return (
              <button
                type="button"
                className="ref-manage-add-btn"
                onClick={handleAdd}
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
            )
          })()}
        </div>

        {showFolderPicker && newFolderLibrary && (
          <FolderPickerModal
            key={`${newFolderLibrary}-${folders.length}`}
            folders={folders}
            libraryName={libraries.find((library) => library.id === newFolderLibrary || library.name === newFolderLibrary)?.name || newFolderLibrary}
            loading={loadingFolders}
            selectedPath={newFolderPath}
            onCancel={() => setShowFolderPicker(false)}
            onSelect={(path) => { setNewFolderPath(path); setShowFolderPicker(false) }}
          />
        )}


        {/* =================================================
            4. MANAGEABLE RESOURCES ITEM CARDS LIST
            ================================================= */}
        <div className="ref-manage-cards-list">
          {drafts.length === 0 ? (
            <div className="reference-manage-empty" style={{ color: '#312c2a' }}>
              No resources available.
            </div>
          ) : (
            drafts.map((item, index) => {
              const isFolder = item.type === 'folder'
              const itemKey = item.id ?? `draft-${index}`
              const isEditing = editingId === itemKey
              const isExpanded = expandedFolders.has(itemKey)
              const folderCount = getFolderCount(item)

              /* Inline Edit Mode */
              if (isEditing) {
                return (
                  <div key={itemKey} className="ref-manage-card-wrapper">
                    <div className="ref-manage-card-row ref-manage-card-editing">
                      <div className="ref-manage-edit-inputs">
                        {/* 1. Title Input */}
                        <input
                          type="text"
                          className="ref-manage-edit-title-input"
                          value={editDraft?.name ?? ''}
                          onChange={(e) =>
                            setEditDraft((cur) =>
                              cur ? { ...cur, name: e.target.value } : cur,
                            )
                          }
                          placeholder={editDraft?.type === 'folder' ? 'Title' : 'Resource Title'}
                          autoFocus
                          aria-label="Title"
                        />

                        {editDraft?.type === 'link' ? (
                          /* Link URL input */
                          <input
                            type="text"
                            className="ref-manage-edit-link-input"
                            value={editDraft.link}
                            onChange={(e) =>
                              setEditDraft((cur) =>
                                cur ? { ...cur, link: e.target.value } : cur,
                              )
                            }
                            placeholder="URL (https://...)"
                            aria-label="URL"
                          />
                        ) : (
                          <>
                            {/* 2. Site Address Dropdown */}
                            <select
                              className={`ref-manage-edit-site-select ${editDraft?.siteId ? 'has-value' : 'is-placeholder'}`}
                              value={editDraft?.siteId ?? ''}
                              onChange={(e) => handleEditSiteChange(e.target.value)}
                              disabled={saving}
                              aria-label="Site Address"
                            >
                              <option value="" disabled hidden>
                                Site Address
                              </option>
                              {editDraft?.siteId && !sites.some((s) => s.id === editDraft.siteId) && (
                                <option value={editDraft.siteId}>{editDraft.siteId}</option>
                              )}
                              {sites.map((site) => (
                                <option key={site.id} value={site.id}>
                                  {site.name}
                                </option>
                              ))}
                            </select>

                            {/* 3. Library Dropdown */}
                            <select
                              className={`ref-manage-edit-library-select ${editDraft?.folderName ? 'has-value' : 'is-placeholder'}`}
                              value={editDraft?.libraryId || editDraft?.folderName || ''}
                              onChange={(e) => handleEditLibraryChange(e.target.value)}
                              disabled={saving}
                              aria-label="Library"
                            >
                              <option value="" disabled hidden>
                                {loadingEditLibraries ? 'Loading libraries...' : 'Library'}
                              </option>
                              {(editDraft?.libraryId || editDraft?.folderName) &&
                                !editLibraries.some(
                                  (l) =>
                                    l.id === (editDraft.libraryId || editDraft.folderName) ||
                                    l.name === (editDraft.libraryId || editDraft.folderName),
                                ) && (
                                  <option value={editDraft.libraryId || editDraft.folderName}>
                                    {editDraft.folderName || editDraft.libraryId}
                                  </option>
                                )}
                              {editLibraries.map((lib) => (
                                <option key={lib.id || lib.name} value={lib.id || lib.name}>
                                  {lib.name}
                                </option>
                              ))}
                            </select>

                            {/* 4. Folder Path Picker */}
                            <button
                              type="button"
                              className={`ref-manage-folderpath-picker ref-manage-edit-folderpath-picker ${editDraft?.folderPath ? 'has-value' : 'is-placeholder'}`}
                              disabled={saving || !(editDraft?.libraryId || editDraft?.folderName)}
                              aria-label="Folder Path"
                              onClick={() => setShowEditFolderPicker(true)}
                            >
                              <span className="ref-manage-folderpath-icon" aria-hidden="true">📁</span>
                              <span className="ref-manage-folderpath-label">
                                {editDraft?.folderPath && editDraft.folderPath !== '/'
                                  ? getFolderDisplayPath(editDraft.folderPath)
                                  : loadingEditFolders ? 'Loading folders...' : 'Select Folder...'}
                              </span>
                              <span className="ref-manage-folderpath-browse" aria-hidden="true">Browse</span>
                            </button>
                            {showEditFolderPicker && (
                              <FolderPickerModal
                                key={`edit-${editDraft?.libraryId || editDraft?.folderName}-${editFolders.length}`}
                                folders={editFolders}
                                libraryName={editDraft?.folderName || editDraft?.libraryId || ''}
                                loading={loadingEditFolders}
                                selectedPath={editDraft?.folderPath ?? ''}
                                onCancel={() => setShowEditFolderPicker(false)}
                                onSelect={(path) => { handleEditFolderChange(path); setShowEditFolderPicker(false) }}
                              />
                            )}
                          </>
                        )}
                      </div>

                      <div className="ref-manage-edit-btns">
                        <button
                          key={`ref-manage-edit-save-btn-${itemKey}`}
                          type="button"
                          className="ref-manage-edit-save-btn"
                          onClick={(e) => {
                            (e.currentTarget as HTMLElement)?.blur()
                            handleSaveEdit()
                          }}
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
                          key={`ref-manage-edit-cancel-btn-${itemKey}`}
                          type="button"
                          className="ref-manage-edit-cancel-btn"
                          onClick={(e) => {
                            (e.currentTarget as HTMLElement)?.blur()
                            handleCancelEdit()
                          }}
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

              /* Normal Card Row */
              const countMatch = item.name.match(/^(.*?)\s*\((\d+)\)$/)
              const rawBaseName = (countMatch ? countMatch[1] : item.name).trim()
              const baseItemName = rawBaseName.toLowerCase() === 'data pipeline' ? 'Data Pipeline' : rawBaseName
              const effectiveFolderCount = countMatch ? Number(countMatch[2]) : folderCount

              return (
                <div key={itemKey} className="ref-manage-card-wrapper">
                  <div
                    className="ref-manage-card-row"
                    onClick={isFolder ? () => toggleFolder(itemKey) : undefined}
                    style={isFolder ? { cursor: 'pointer' } : undefined}
                  >
                    {/* Left Slot (Icon + Name + Counter) */}
                    <div className="ref-card-left">
                      {isFolder ? <FolderCategoryIcon /> : <QuickLinkChildIcon />}
                      <span className="ref-card-label" style={{ color: '#312c2a' }}>
                        {baseItemName}{isFolder && (
                          <>{' '}<span className="ref-card-count" style={{ color: '#eb1700' }}>({effectiveFolderCount})</span></>
                        )}
                      </span>
                    </div>

                    {/* Right Slot (Navigation Arrow + Action Toolbar) */}
                    <div
                      className="ref-card-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Expand Chevron / Arrow (>) - Folders only */}
                      {isFolder && (
                        <button
                          key={`ref-card-chevron-btn-${itemKey}`}
                          type="button"
                          className="ref-card-action-btn ref-card-chevron-btn"
                          onClick={() => toggleFolder(itemKey)}
                          title={isExpanded ? 'Collapse' : 'Expand'}
                          aria-label={isExpanded ? `Collapse ${item.name}` : `Expand ${item.name}`}
                        >
                          <ExpandChevronIcon isExpanded={isExpanded} />
                        </button>
                      )}

                      {/* Edit Pencil */}
                      <button
                        key={`ref-card-edit-btn-${itemKey}`}
                        type="button"
                        className="ref-card-action-btn ref-card-edit-btn"
                        onClick={(e) => {
                          (e.currentTarget as HTMLElement)?.blur()
                          handleStartEdit(item, index)
                        }}
                        title="Edit"
                        aria-label={`Edit ${item.name}`}
                        disabled={saving}
                      >
                        <PencilActionIcon />
                      </button>

                      {/* Move Up Arrow */}
                      <button
                        key={`ref-card-up-btn-${itemKey}`}
                        type="button"
                        className="ref-card-action-btn ref-card-up-btn"
                        onClick={() => handleMove(index, 'up')}
                        disabled={saving || index === 0}
                        title="Move Up"
                        aria-label={`Move ${item.name} up`}
                      >
                        <ArrowUpActionIcon disabled={index === 0} />
                      </button>

                      {/* Move Down Arrow */}
                      <button
                        key={`ref-card-down-btn-${itemKey}`}
                        type="button"
                        className="ref-card-action-btn ref-card-down-btn"
                        onClick={() => handleMove(index, 'down')}
                        disabled={saving || index === drafts.length - 1}
                        title="Move Down"
                        aria-label={`Move ${item.name} down`}
                      >
                        <ArrowDownActionIcon disabled={index === drafts.length - 1} />
                      </button>

                      {/* Delete Trash Bin */}
                      <button
                        key={`ref-card-trash-btn-${itemKey}`}
                        type="button"
                        className="ref-card-action-btn ref-card-trash-btn"
                        onClick={() => handleRequestDelete(item)}
                        disabled={saving}
                        title="Delete"
                        aria-label={`Delete ${item.name}`}
                      >
                        <TrashActionIcon />
                      </button>
                    </div>
                  </div>

                  {/* Expandable Folder Sub-items */}
                  {isFolder && isExpanded && (
                    <div className="ref-manage-folder-subitems">
                      {getFolderItems(baseItemName, item.id, item.folderPath).length === 0 ? (
                        <div className="ref-folder-subitem-empty" style={{ color: '#312c2a' }}>
                          No items available.
                        </div>
                      ) : (
                        getFolderItems(baseItemName, item.id, item.folderPath).map((file) => (
                          <div key={file.id} className="ref-folder-subitem-row">
                            <div className="ref-folder-subitem-left">
                              <FileSubIcon />
                              <span className="doc-name file-name child-file-title" style={{ color: '#312c2a', fontSize: '12px', fontWeight: 400 }}>{file.name}</span>
                            </div>
                            <div className="ref-folder-subitem-right">
                              {file.size && (
                                <span className="ref-folder-subitem-size doc-size file-size meta-item" style={{ color: '#6e6259', fontSize: '12px', fontWeight: 400 }}>
                                  {file.size}
                                </span>
                              )}
                              {file.type && (
                                <span className="ref-folder-subitem-type doc-type file-type meta-item" style={{ color: '#6e6259', fontSize: '12px', fontWeight: 400 }}>
                                  {file.type}
                                </span>
                              )}
                              {file.link ? (
                                <a
                                  href={file.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="ref-folder-subitem-link"
                                  title="Open document"
                                  aria-label={`Open ${file.name}`}
                                >
                                  <ExternalSubLinkIcon />
                                </a>
                              ) : (
                                <button
                                  type="button"
                                  className="ref-folder-subitem-link"
                                  title="Open document"
                                  aria-label={`Open ${file.name}`}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                  }}
                                >
                                  <ExternalSubLinkIcon />
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* =================================================
          DELETE CONFIRMATION MODAL
          ================================================= */}
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
              Delete resource?
            </h3>
            <p className="modal-description" style={{ color: '#6e6259' }}>
              <span className="modal-item-highlight" style={{ color: '#6e6259' }}>{itemToDelete.title}</span> will be removed from {contentTitle || subcategory.name || 'this category'}.
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

export default ReferenceManageContent