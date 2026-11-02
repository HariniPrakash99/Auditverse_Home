import { useEffect, useRef, useState } from 'react'
import { getContext } from '@microsoft/power-apps/app'
import DOMPurify from 'dompurify'
import './AboutUsPage.css'
import { Cp_aboutuscategoriesesService } from '../../generated/services/Cp_aboutuscategoriesesService'
import { Cp_aboutuscontactteamdetailsesService } from '../../generated/services/Cp_aboutuscontactteamdetailsesService'
import { Cp_aboutusleadershipdetailsesService } from '../../generated/services/Cp_aboutusleadershipdetailsesService'
import { Cp_aboutussubcategoriesesService } from '../../generated/services/Cp_aboutussubcategoriesesService'
import { Cp_aboutustextimageblocksconfigurationesService } from '../../generated/services/Cp_aboutustextimageblocksconfigurationesService'
import { Cp_aboutustextimaegeblocksesService } from '../../generated/services/Cp_aboutustextimaegeblocksesService'
import { Cp_refcategoriesesService } from '../../generated/services/Cp_refcategoriesesService'
import { Cp_refsubcategoriesesService } from '../../generated/services/Cp_refsubcategoriesesService'
import { EnvironmentvariabledefinitionsService } from '../../generated/services/EnvironmentvariabledefinitionsService'
import { EnvironmentvariablevaluesService } from '../../generated/services/EnvironmentvariablevaluesService'
import { MicrosoftEntraIDService } from '../../generated/services/MicrosoftEntraIDService'
import { SystemusersService } from '../../generated/services/SystemusersService'
import type { Cp_aboutusleadershipdetailsesImageColumnName } from '../../generated/models/Cp_aboutusleadershipdetailsesModel'
import type { Cp_aboutussubcategoriesesBase } from '../../generated/models/Cp_aboutussubcategoriesesModel'
import type { Cp_aboutustextimaegeblocksesImageColumnName } from '../../generated/models/Cp_aboutustextimaegeblocksesModel'

type IconName = 'help' | 'arrow' | 'close' | 'search' | 'folder' | 'chevron' | 'users' | 'target'

function Icon({ name }: { name: IconName }) {
  if (name === 'help') {
    return <svg className="icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" data-lucide="circle-help" aria-hidden="true"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><path d="M12 17h.01" /></svg>
  }

  if (name === 'users') {
    return <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><path d="M16 3.128a4 4 0 0 1 0 7.744" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><circle cx="9" cy="7" r="4" /></svg>
  }

  if (name === 'target') {
    return <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>
  }

  const paths: Record<Exclude<IconName, 'help' | 'users' | 'target'>, string> = {
    arrow: 'M5 12h14 M13 6l6 6-6 6',
    close: 'M6 6l12 12 M18 6 6 18',
    search: 'M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14Z M16 16l4 4',
    folder: 'M3.5 6.5h6l2 2h9v9h-17z',
    chevron: 'm7 9 5 5 5-5',
  }

  return <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]} /></svg>
}

function getReferenceHash(path: string) {
  const segments = path.split('/').filter(Boolean)
  if (segments[0] !== 'references') return undefined
  return `#${segments.map((segment) => encodeURIComponent(segment)).join('/')}`
}

function buildReferenceHashFromSelection(categoryName: string | undefined, subcategoryName: string | undefined): string | undefined {
  const normalizedCategoryName = (categoryName ?? '').trim()
  const normalizedSubcategoryName = (subcategoryName ?? '').trim()
  if (!normalizedCategoryName || !normalizedSubcategoryName) return undefined
  return `#references/${encodeURIComponent(normalizedCategoryName)}/${encodeURIComponent(normalizedSubcategoryName)}`
}

type AboutChildDetails = {
  ca_about_us_childid: string
  ca_childdisplayname: string
  ca_id: string
  ca_resourcepath?: string
  ca_resourcename?: string
  ca_showresources?: boolean
  ca_showcontactteam?: boolean
  ca_showteammailbox?: boolean
  ca_teammail?: string
  ca_refcategory?: string
  ca_refsubcategory?: string
}
type AboutNavigationChild = {
  id?: string
  label: string
  isActive?: boolean
  details?: AboutChildDetails
  categoryLabel?: string
}
type AboutNavigationItem = { label: string; icon?: IconName; id?: string; isActive?: boolean; hasSubcategory?: boolean; children?: string[]; childItems?: AboutNavigationChild[] }
type AboutMenuDraftItem = { id?: string; label: string; hasSubcategory?: boolean; childItems?: AboutNavigationChild[] }
type AboutChildEditDraft = Pick<AboutChildDetails, 'ca_childdisplayname' | 'ca_resourcename' | 'ca_resourcepath' | 'ca_showresources' | 'ca_showcontactteam' | 'ca_showteammailbox' | 'ca_teammail' | 'ca_refcategory' | 'ca_refsubcategory'>
type AboutChildContactDraft = { id?: string; memberId?: string; name: string; designation: string; role: string }
type AboutChildContentDraft = { id?: string; recordId: string; type: 1 | 2; caption: string; text: string; imageUrl?: string; file?: File }
type AboutChildContactRecord = {
  ca_about_us_contact_teamid: string
  ca_member_id?: string
  ca_name: string
  ca_designation?: string
  ca_role?: string
  ca_sortorder?: number
  ca_status?: boolean
}
type AboutChildContentRecord = {
  ca_about_us_child_imagestextid: string
  ca_id: string
  ca_type?: 1 | 2
  ca_caption?: string
  ca_text?: string
  ca_imagesource_url?: string
  ca_isactive?: boolean
  ca_sortorder: number
}

type AboutSearchResult = {
  id: string
  categoryLabel: string
  subcategoryLabel?: string
  subcategoryId?: string
  hasSubcategory: boolean
  path: string
  title: string
  description: string
}

type AboutTextImageBlockLimits = {
  maxImageBlocks?: number
  maxTextBlocks?: number
}

const defaultMaxImageBlocks = 3
const defaultMaxTextBlocks = 3

const aboutAllowedImageMimeTypes = new Set(['image/jpeg', 'image/jpg', 'image/png'])
const aboutAllowedImageExtensions = new Set(['.jpg', '.jpeg', '.png'])
const aboutMaxImageBytes = 1 * 1024 * 1024
const aboutNameAllowedCharactersPattern = /^[\p{L}\p{N}][\p{L}\p{N} .\-\/,&:()']*$/u
const aboutNameAllowedCharactersMessage = 'Allowed characters: letters, numbers, space, ., -, /, ,, &, :, (, )'

function validateAboutImageFile(file: File): string | undefined {
  const fileExtension = file.name.toLowerCase().match(/\.[^.]+$/)?.[0] ?? ''
  const mimeType = file.type.toLowerCase()
  const hasSupportedExtension = aboutAllowedImageExtensions.has(fileExtension)
  const hasSupportedMimeType = !mimeType || aboutAllowedImageMimeTypes.has(mimeType) || mimeType === 'application/octet-stream'
  if (!hasSupportedExtension || !hasSupportedMimeType) return 'Only JPG, JPEG, and PNG images are allowed.'
  if (file.size > aboutMaxImageBytes) return 'Image size must be 1 MB or less.'
  return undefined
}

function validateAboutTextInput(value: string, fieldName: string): string | undefined {
  const normalizedValue = value.trim()
  if (!normalizedValue) return `${fieldName} is required.`
  if (normalizedValue.length < 3) return `${fieldName} must be at least 3 characters.`
  if (normalizedValue.length > 100) return `${fieldName} must be 100 characters or fewer.`
  if (!/^[\p{L}\p{N}]/u.test(normalizedValue)) return `${fieldName} cannot start with a special character or space.`
  if (!aboutNameAllowedCharactersPattern.test(normalizedValue)) return `${fieldName} contains invalid characters. ${aboutNameAllowedCharactersMessage}`
  return undefined
}

async function resolveSystemUserNamesById(userIds: string[]): Promise<Map<string, string>> {
  const uniqueUserIds = [...new Set(userIds.filter((userId) => userId.trim().length > 0))]
  const usersById = new Map<string, string>()
  await Promise.all(uniqueUserIds.map(async (userId) => {
    const userResult = await SystemusersService.get(userId, { select: ['systemuserid', 'fullname'] })
    if (!userResult.success) return
    const fullName = userResult.data.fullname?.trim()
    if (fullName) usersById.set(userId.toLowerCase(), fullName)
  }))
  return usersById
}

async function loadActiveSystemUserDirectory(): Promise<AboutChildContactDraft[]> {
  const pageSize = 500
  const usersById = new Map<string, AboutChildContactDraft>()
  let lastFullname = ''
  let pageCounter = 0
  while (true) {
    const escapedLastFullname = lastFullname.replace(/'/g, "''")
    const filter = lastFullname
      ? `isdisabled eq false and fullname ne null and fullname gt '${escapedLastFullname}'`
      : 'isdisabled eq false and fullname ne null'
    const result = await SystemusersService.getAll({
      select: ['systemuserid', 'fullname', 'isdisabled'],
      filter,
      orderBy: ['fullname asc'],
      top: pageSize,
    })
    if (!result.success) throw result.error ?? new Error('Member directory could not be loaded.')
    if (result.data.length === 0) break
    result.data.forEach((user) => {
      const name = user.fullname?.trim()
      const memberId = user.systemuserid?.trim()
      if (!name || !memberId || user.isdisabled === true) return
      const key = memberId.toLowerCase()
      if (!usersById.has(key)) {
        usersById.set(key, {
          memberId,
          name,
          designation: '',
          role: '',
        })
      }
    })
    const lastUserWithName = [...result.data].reverse().find((user) => user.fullname?.trim())
    const nextLastFullname = lastUserWithName?.fullname?.trim() ?? ''
    if (!nextLastFullname || nextLastFullname === lastFullname) break
    lastFullname = nextLastFullname
    pageCounter += 1
    if (pageCounter > 500) break
    if (result.data.length < pageSize) break
  }
  return [...usersById.values()]
}

function getDataErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  if (error && typeof error === 'object') {
    const details = error as { message?: unknown; error?: unknown; code?: unknown }
    if (typeof details.message === 'string') return details.message
    if (typeof details.error === 'string') return details.error
    if (details.error && typeof details.error === 'object' && 'message' in details.error && typeof details.error.message === 'string') return details.error.message
    if (typeof details.code === 'string') return details.code
  }
  return fallback
}

function sortChildContent(items: AboutChildContentRecord[]): AboutChildContentRecord[] {
  return [...items].sort((left, right) => (left.ca_sortorder ?? 0) - (right.ca_sortorder ?? 0))
}

function getImageMimeType(data: Uint8Array): string {
  const imageHeader = new TextDecoder().decode(data.subarray(0, 512)).trimStart().toLowerCase()
  if (imageHeader.startsWith('<svg') || imageHeader.includes('<svg')) return 'image/svg+xml'
  if (data[0] === 0x89 && data[1] === 0x50 && data[2] === 0x4e && data[3] === 0x47) return 'image/png'
  if (data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff) return 'image/jpeg'
  if (data[0] === 0x47 && data[1] === 0x49 && data[2] === 0x46) return 'image/gif'
  if (data[0] === 0x42 && data[1] === 0x4d) return 'image/bmp'
  if (data[0] === 0x52 && data[1] === 0x49 && data[2] === 0x46 && data[3] === 0x46 &&
    data[8] === 0x57 && data[9] === 0x45 && data[10] === 0x42 && data[11] === 0x50) return 'image/webp'
  return 'image/png'
}

function readBlobAsDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('The image could not be converted for display.'))
    reader.onerror = () => reject(reader.error ?? new Error('The image could not be converted for display.'))
    reader.readAsDataURL(blob)
  })
}

function createDraftRecordId(): string {
  const cryptoRef = globalThis.crypto as Crypto | undefined
  if (cryptoRef && typeof cryptoRef.randomUUID === 'function') {
    return `new-${cryptoRef.randomUUID()}`
  }
  const randomSuffix = `${Date.now()}-${Math.floor(Math.random() * 1_000_000_000)}`
  return `new-${randomSuffix}`
}

function isBlobPreviewUrl(value: string | undefined): value is string {
  return typeof value === 'string' && value.startsWith('blob:')
}

async function downloadSubcategoryContentImage(recordId: string, columnName: Cp_aboutustextimaegeblocksesImageColumnName, fullSize: boolean): Promise<Uint8Array> {
  const requestedImage = await Cp_aboutustextimaegeblocksesService.downloadImage(recordId, columnName, fullSize)
  if (requestedImage.success && requestedImage.data.byteLength > 0) return requestedImage.data

  const alternateImage = await Cp_aboutustextimaegeblocksesService.downloadImage(recordId, columnName, !fullSize)
  if (alternateImage.success && alternateImage.data.byteLength > 0) return alternateImage.data

  if (!requestedImage.success) throw requestedImage.error ?? new Error('The image could not be downloaded.')
  if (!alternateImage.success) throw alternateImage.error ?? new Error('The image could not be downloaded.')
  throw new Error('Dataverse returned an empty image.')
}

async function downloadLeadershipImage(recordId: string, columnName: Cp_aboutusleadershipdetailsesImageColumnName, fullSize: boolean): Promise<Uint8Array> {
  const requestedImage = await Cp_aboutusleadershipdetailsesService.downloadImage(recordId, columnName, fullSize)
  if (requestedImage.success && requestedImage.data.byteLength > 0) return requestedImage.data

  const alternateImage = await Cp_aboutusleadershipdetailsesService.downloadImage(recordId, columnName, !fullSize)
  if (alternateImage.success && alternateImage.data.byteLength > 0) return alternateImage.data

  if (!requestedImage.success) throw requestedImage.error ?? new Error('The image could not be downloaded.')
  if (!alternateImage.success) throw alternateImage.error ?? new Error('The image could not be downloaded.')
  throw new Error('Dataverse returned an empty image.')
}

function RichTextEditor({ value, onChange, maxLength, showTextColors = false }: { value: string; onChange: (value: string) => void; maxLength: number; showTextColors?: boolean }) {
  const editorRef = useRef<HTMLDivElement>(null)
  const latestAcceptedValue = useRef(value)

  useEffect(() => {
    const editor = editorRef.current
    if (editor && document.activeElement !== editor) {
      const safeHtml = DOMPurify.sanitize(value, { USE_PROFILES: { html: true } })
      if (editor.innerHTML !== safeHtml) editor.innerHTML = safeHtml
      latestAcceptedValue.current = safeHtml
    }
  }, [value])

  const applyFormat = (command: string) => {
    editorRef.current?.focus()
    document.execCommand(command)
    if (editorRef.current) onChange(editorRef.current.innerHTML)
  }
  const applyTextColor = (color: string) => {
    editorRef.current?.focus()
    document.execCommand('styleWithCSS', false, 'true')
    document.execCommand('foreColor', false, color)
    if (editorRef.current) onChange(editorRef.current.innerHTML)
  }

  return (
    <div className="about-rich-text-editor">
      <div className="about-rich-text-toolbar" role="toolbar" aria-label="Description formatting">
        <button type="button" aria-label="Bold" data-tooltip="Bold" onMouseDown={(event) => event.preventDefault()} onClick={() => applyFormat('bold')}><strong>B</strong></button>
        <button type="button" aria-label="Italic" data-tooltip="Italic" onMouseDown={(event) => event.preventDefault()} onClick={() => applyFormat('italic')}><em>I</em></button>
        <button type="button" aria-label="Underline" data-tooltip="Underline" onMouseDown={(event) => event.preventDefault()} onClick={() => applyFormat('underline')}><u>U</u></button>
        {showTextColors && <>
          <span aria-hidden="true" />
          {[
            { label: 'Red', color: '#f01d17' },
            { label: 'Dark gray', color: '#303b44' },
            { label: 'Blue', color: '#2f6f9f' },
            { label: 'Green', color: '#338b4b' },
          ].map(({ label, color }) => <button className="about-rich-text-color-button" key={color} type="button" aria-label={`Text color ${label}`} data-tooltip={`Text color ${label}`} onMouseDown={(event) => event.preventDefault()} onClick={() => applyTextColor(color)}><span aria-hidden="true" style={{ backgroundColor: color }} /></button>)}
        </>}
        <span aria-hidden="true" />
        <button type="button" aria-label="Bulleted list" data-tooltip="Bulleted list" onMouseDown={(event) => event.preventDefault()} onClick={() => applyFormat('insertUnorderedList')}>• List</button>
        <button type="button" aria-label="Numbered list" data-tooltip="Numbered list" onMouseDown={(event) => event.preventDefault()} onClick={() => applyFormat('insertOrderedList')}>1. List</button>
      </div>
      <div
        ref={editorRef}
        className="about-rich-text-input"
        contentEditable
        role="textbox"
        aria-label="Description rich text"
        aria-multiline="true"
        suppressContentEditableWarning
        onInput={(event) => {
          const nextValue = event.currentTarget.innerHTML
          if (nextValue.length > maxLength) {
            event.currentTarget.innerHTML = latestAcceptedValue.current
            return
          }
          latestAcceptedValue.current = nextValue
          onChange(nextValue)
        }}
      />
      <div className="about-rich-text-count" aria-live="polite">{value.length}/{maxLength} characters (formatting included)</div>
    </div>
  )
}

const aboutNavigationCacheKey = 'audit-verse-about-navigation-v2'

function loadCachedAboutNavigation(): AboutNavigationItem[] {
  try {
    const cachedValue = localStorage.getItem(aboutNavigationCacheKey)
    if (!cachedValue) return []

    const cachedItems: unknown = JSON.parse(cachedValue)
    if (!Array.isArray(cachedItems)) return []

    const dynamicItems = cachedItems.flatMap((candidate): AboutNavigationItem[] => {
      if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) return []
      const parent = candidate as Record<string, unknown>
      if (typeof parent.label !== 'string') return []

      const childItems = (Array.isArray(parent.childItems) ? parent.childItems : []).flatMap((childCandidate): AboutNavigationChild[] => {
        if (!childCandidate || typeof childCandidate !== 'object' || Array.isArray(childCandidate)) return []
        const child = childCandidate as Record<string, unknown>
        if (typeof child.label !== 'string') return []
        return [{
          id: typeof child.id === 'string' ? child.id : undefined,
          label: child.label,
          isActive: child.isActive === true,
          categoryLabel: typeof child.categoryLabel === 'string' ? child.categoryLabel : undefined,
        }]
      })

      const hasSubcategory =
        typeof parent.hasSubcategory === 'boolean'
          ? parent.hasSubcategory
          : childItems.length > 0

      return [{
        id: typeof parent.id === 'string' ? parent.id : undefined,
        label: parent.label,
        isActive: parent.isActive === true,
        hasSubcategory,
        childItems,
        children: hasSubcategory ? childItems.map((child) => child.label) : undefined,
      }]
    })

    return dynamicItems
  } catch {
    return []
  }
}

function cacheAboutNavigation(items: AboutNavigationItem[]): void {
  try {
    const dynamicItems = items
      .filter((item) => !item.icon)
      .map((item) => ({
        id: item.id,
        label: item.label,
        isActive: item.isActive === true,
        hasSubcategory: item.hasSubcategory === true,
        childItems: (item.childItems ?? []).map(({ id, label, isActive, categoryLabel }) => ({
          id,
          label,
          isActive: isActive === true,
          categoryLabel,
        })),
      }))
    localStorage.setItem(aboutNavigationCacheKey, JSON.stringify(dynamicItems))
  } catch {
    // The live navigation remains usable when browser storage is unavailable.
  }
}

function getDataverseRecordId(
  record: Record<string, unknown>,
  candidates: string[],
): string | undefined {
  for (const candidate of candidates) {
    const value = record[candidate]
    if (typeof value === 'string' && value.trim().length > 0) {
      const trimmedValue = value.trim()
      return trimmedValue.startsWith('{') && trimmedValue.endsWith('}') ? trimmedValue.slice(1, -1) : trimmedValue
    }
  }
  return undefined
}

function getDataverseText(
  record: Record<string, unknown>,
  candidates: string[],
): string {
  return getDataverseRecordId(record, candidates) ?? ''
}

function isGuid(value: string): boolean {
  const normalizedValue = value.trim().replace(/^\{/, '').replace(/\}$/, '')
  return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(normalizedValue)
}

function getAboutCategoryRecordId(record: Record<string, unknown>): string | undefined {
  const directId = getDataverseRecordId(record, ['cp_aboutuscategoriesid', 'cp_aboutuscategoriesesid', 'aboutuscategoriesid', 'id'])
  if (directId && isGuid(directId)) return directId.trim().replace(/^\{/, '').replace(/\}$/, '')

  const odataIdCandidates = [
    record['@odata.id'],
    record['odata.id'],
    record['OData-EntityId'],
  ]
  for (const candidate of odataIdCandidates) {
    if (typeof candidate !== 'string' || !candidate.trim()) continue
    const guidFromOdataId = candidate.match(/\(([0-9a-fA-F-]{36})\)/)?.[1]
    if (guidFromOdataId && isGuid(guidFromOdataId)) return guidFromOdataId
  }

  for (const [key, value] of Object.entries(record)) {
    if (!key.toLowerCase().includes('aboutuscategor') || !key.toLowerCase().endsWith('id')) continue
    if (typeof value !== 'string' || !value.trim()) continue
    const normalizedValue = value.trim().replace(/^\{/, '').replace(/\}$/, '')
    if (isGuid(normalizedValue)) return normalizedValue
  }

  return undefined
}

function getAboutSubcategoryRecordId(record: Record<string, unknown>): string | undefined {
  const directId = getDataverseRecordId(record, ['cp_aboutussubcategoriesid', 'cp_aboutussubcategoryid', 'aboutussubcategoriesid', 'id'])
  if (directId && isGuid(directId)) return directId.trim().replace(/^\{/, '').replace(/\}$/, '')

  const odataIdCandidates = [
    record['@odata.id'],
    record['odata.id'],
    record['OData-EntityId'],
  ]
  for (const candidate of odataIdCandidates) {
    if (typeof candidate !== 'string' || !candidate.trim()) continue
    const guidFromOdataId = candidate.match(/\(([0-9a-fA-F-]{36})\)/)?.[1]
    if (guidFromOdataId && isGuid(guidFromOdataId)) return guidFromOdataId
  }

  for (const [key, value] of Object.entries(record)) {
    if (!key.toLowerCase().includes('aboutussubcategor') || !key.toLowerCase().endsWith('id')) continue
    if (typeof value !== 'string' || !value.trim()) continue
    const normalizedValue = value.trim().replace(/^\{/, '').replace(/\}$/, '')
    if (isGuid(normalizedValue)) return normalizedValue
  }

  return undefined
}

function normalizeLabelForIdMatch(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[^\p{L}\p{N}]/gu, '')
}

function escapeODataString(value: string): string {
  return value.replace(/'/g, "''")
}

function parsePositiveInteger(value: unknown): number | undefined {
  if (value && typeof value === 'object') {
    const typedValue = value as Record<string, unknown>
    const nestedCandidates: unknown[] = [
      typedValue.Value,
      typedValue.value,
      typedValue.IntegerValue,
      typedValue.integerValue,
      typedValue.NumericValue,
      typedValue.numericValue,
    ]
    for (const nestedCandidate of nestedCandidates) {
      const parsedNestedValue = parsePositiveInteger(nestedCandidate)
      if (typeof parsedNestedValue === 'number') return parsedNestedValue
    }
  }
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) return Math.floor(value)
  if (typeof value === 'string') {
    const trimmedValue = value.trim().replace(/,/g, '')
    if (!trimmedValue) return undefined
    const parsedValue = Number(trimmedValue)
    if (Number.isFinite(parsedValue) && parsedValue > 0) return Math.floor(parsedValue)
  }
  return undefined
}

function getDataversePositiveInteger(
  record: Record<string, unknown>,
  candidates: string[],
): number | undefined {
  for (const candidate of candidates) {
    const parsedValue = parsePositiveInteger(record[candidate])
    if (typeof parsedValue === 'number') return parsedValue
    const formattedParsedValue = parsePositiveInteger(record[`${candidate}@OData.Community.Display.V1.FormattedValue`])
    if (typeof formattedParsedValue === 'number') return formattedParsedValue
  }
  return undefined
}

function getDataversePositiveIntegerByKeyPattern(
  record: Record<string, unknown>,
  keyPattern: RegExp,
): number | undefined {
  for (const [key, value] of Object.entries(record)) {
    if (!keyPattern.test(key)) continue
    const parsedValue = parsePositiveInteger(value)
    if (typeof parsedValue === 'number') return parsedValue
  }
  return undefined
}

function stripHtmlToPlainText(value: string | undefined): string {
  if (!value) return ''
  const parsed = new DOMParser().parseFromString(value, 'text/html')
  return (parsed.body.textContent ?? '').replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim()
}

function truncateSearchPreview(value: string): string {
  const normalizedValue = value.trim()
  if (normalizedValue.length <= 500) return normalizedValue
  return `${normalizedValue.slice(0, 500).trimEnd()}...`
}

function normalizeAboutContentType(value: unknown): 1 | 2 {
  if (value === 1 || value === '1') return 1
  if (value === 2 || value === '2') return 2
  if (value && typeof value === 'object') {
    const typedValue = value as Record<string, unknown>
    if (typedValue.Value === 1 || typedValue.Value === '1') return 1
    if (typedValue.Value === 2 || typedValue.Value === '2') return 2
    if (typedValue.value === 1 || typedValue.value === '1') return 1
    if (typedValue.value === 2 || typedValue.value === '2') return 2
  }
  if (typeof value === 'number' && Number.isFinite(value)) return value === 1 ? 1 : 2
  if (typeof value === 'string') return Number(value.trim()) === 1 ? 1 : 2
  return 2
}

async function loadAboutTextImageBlockLimits(): Promise<AboutTextImageBlockLimits> {
  let result
  try {
    result = await Cp_aboutustextimageblocksconfigurationesService.getAll({
      select: ['cp_maximageblocks', 'cp_maxtextblocks', 'statecode'],
      top: 50,
    })
  } catch (error) {
    console.warn('Text/Image block configuration datasource is unavailable; continuing without max-block limits.', error)
    return {}
  }
  if (!result.success) {
    console.warn('Text/Image block configuration could not be loaded; continuing without max-block limits.', result.error)
    return {}
  }
  const configurationRows = result.data ?? []
  if (configurationRows.length === 0) return {}
  const imageLimits = configurationRows
    .map((entry) => {
      const record = entry as unknown as Record<string, unknown>
      return getDataversePositiveInteger(record, ['cp_maximageblocks', 'cp_MaxImageBlocks', 'cp_maxImageBlocks']) ??
        getDataversePositiveIntegerByKeyPattern(record, /max.*image.*block/i)
    })
    .filter((value): value is number => typeof value === 'number')
  const textLimits = configurationRows
    .map((entry) => {
      const record = entry as unknown as Record<string, unknown>
      return getDataversePositiveInteger(record, ['cp_maxtextblocks', 'cp_MaxTextBlocks', 'cp_maxTextBlocks']) ??
        getDataversePositiveIntegerByKeyPattern(record, /max.*text.*block/i)
    })
    .filter((value): value is number => typeof value === 'number')
  return {
    maxImageBlocks: imageLimits.length > 0 ? Math.min(...imageLimits) : undefined,
    maxTextBlocks: textLimits.length > 0 ? Math.min(...textLimits) : undefined,
  }
}

async function resolveAboutCategoryIdByLabel(categoryLabel: string): Promise<string | undefined> {
  const normalizedLabel = categoryLabel.trim()
  if (!normalizedLabel) return undefined
  const lookupResult = await Cp_aboutuscategoriesesService.getAll({
    select: ['cp_aboutuscategoriesid', 'cp_category', 'statecode'],
    filter: `statecode eq 0 and cp_category eq '${escapeODataString(normalizedLabel)}'`,
    top: 5,
  })
  if (!lookupResult.success) {
    throw lookupResult.error ?? new Error(`Parent category id for ${normalizedLabel} could not be loaded.`)
  }

  const matchingRecords = (lookupResult.data ?? []).filter((category) => {
    if (category.statecode === 1) return false
    return (category.cp_category?.trim().toLowerCase() ?? '') === normalizedLabel.toLowerCase()
  })

  const categoryIds = [...new Set(matchingRecords
    .map((category) => getAboutCategoryRecordId(category as unknown as Record<string, unknown>) ?? '')
    .map((id) => id.trim().replace(/^\{/, '').replace(/\}$/, ''))
    .filter((id) => isGuid(id)))]

  if (categoryIds.length === 1) return categoryIds[0]
  return undefined
}

async function loadAboutNavigation(): Promise<AboutNavigationItem[]> {
  const categoriesResult = await Cp_aboutuscategoriesesService.getAll({
    select: ['cp_aboutuscategoriesid', 'cp_category', 'cp_sortorder', 'cp_havesubcategory', 'statecode'],
    orderBy: ['cp_sortorder asc'],
  })

  if (!categoriesResult.success) throw categoriesResult.error ?? new Error('About Us sections could not be loaded.')
  const subcategoriesByCategory = new Map<string, Array<{ id?: string; label: string }>>()
  const parentCategoryIdByLabel = new Map<string, string>()
  const parentCategoryIdByNormalizedLabel = new Map<string, string>()
  try {
    const subcategoriesResult = await Cp_aboutussubcategoriesesService.getAll({
      select: ['cp_aboutussubcategoriesid', '_cp_category_value', 'cp_subcategory', 'cp_sortorder', 'statecode'],
      orderBy: ['cp_sortorder asc'],
    })

    if (!subcategoriesResult.success) {
      throw subcategoriesResult.error ?? new Error('About Us sub-sections could not be loaded.')
    }

    ;(subcategoriesResult.data ?? [])
      .filter((subcategory) =>
        typeof subcategory.cp_subcategory === 'string' &&
        subcategory.cp_subcategory.trim().length > 0 &&
        subcategory.statecode !== 1)
      .forEach((subcategory) => {
        const subcategoryRecord = subcategory as unknown as Record<string, unknown>
        const categoryLabelFromLookup = subcategoryRecord['_cp_category_value@OData.Community.Display.V1.FormattedValue']
        const categoryLabelFromRaw = subcategoryRecord.cp_category
        const parentCategoryLabel =
          typeof categoryLabelFromLookup === 'string' && categoryLabelFromLookup.trim().length > 0
            ? categoryLabelFromLookup.trim()
            : typeof categoryLabelFromRaw === 'string' && categoryLabelFromRaw.trim().length > 0
              ? categoryLabelFromRaw.trim()
              : ''

        if (!parentCategoryLabel) return

        const key = parentCategoryLabel.toLowerCase()
        const normalizedParentLabelKey = normalizeLabelForIdMatch(parentCategoryLabel)
        const parentCategoryId = subcategory._cp_category_value?.trim().replace(/^\{/, '').replace(/\}$/, '') ?? ''
        if (isGuid(parentCategoryId) && !parentCategoryIdByLabel.has(key)) {
          parentCategoryIdByLabel.set(key, parentCategoryId)
        }
        if (isGuid(parentCategoryId) && normalizedParentLabelKey && !parentCategoryIdByNormalizedLabel.has(normalizedParentLabelKey)) {
          parentCategoryIdByNormalizedLabel.set(normalizedParentLabelKey, parentCategoryId)
        }
        const bucket = subcategoriesByCategory.get(key) ?? []
        bucket.push({
          id: subcategory.cp_aboutussubcategoriesid,
          label: subcategory.cp_subcategory.trim(),
        })
        subcategoriesByCategory.set(key, bucket)
      })
  } catch (error) {
    console.warn('About Us subcategory mapping is unavailable; rendering categories without sub-items.', error)
  }

  return (categoriesResult.data ?? [])
    .filter((category) => typeof category.cp_category === 'string' && category.cp_category.trim().length > 0 && category.statecode !== 1)
    .map((category) => {
      const categoryRecord = category as unknown as Record<string, unknown>
      const label = category.cp_category.trim()
      const categoryId = (category.cp_aboutuscategoriesid?.trim()
        || getAboutCategoryRecordId(categoryRecord)
        || parentCategoryIdByLabel.get(label.toLowerCase())
        || parentCategoryIdByNormalizedLabel.get(normalizeLabelForIdMatch(label))
        || label).replace(/^\{/, '').replace(/\}$/, '')
      const hasSubcategory = category.cp_havesubcategory === true
      const sourceSubcategories = subcategoriesByCategory.get(label.toLowerCase()) ?? []

      const childItems: AboutNavigationChild[] = sourceSubcategories.map((subcategory) => {
        return {
          id: subcategory.id,
          label: subcategory.label,
          isActive: true,
          categoryLabel: label,
        }
      })

      const normalizedLabel = label.toLowerCase()
      const icon = normalizedLabel === 'mission'
        ? 'target'
        : normalizedLabel === 'leadership'
          ? 'users'
          : undefined

      return {
        id: categoryId,
        label,
        icon,
        isActive: true,
        hasSubcategory,
        childItems,
        children: hasSubcategory ? childItems.map((child) => child.label) : undefined,
      }
    })
}

function ManageIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12.659 22H18a2 2 0 0 0 2-2V8a2.4 2.4 0 0 0-.706-1.706l-3.588-3.588A2.4 2.4 0 0 0 14 2H6a2 2 0 0 0-2 2v9.34" />
      <path d="M14 2v5a1 1 0 0 0 1 1h5" />
      <path d="M10.378 12.622a1 1 0 0 1 3 3.003L8.36 20.637a2 2 0 0 1-.854.506l-2.867.837a.5.5 0 0 1-.62-.62l.836-2.869a2 2 0 0 1 .506-.853z" />
    </svg>
  )
}

function DeleteIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M10 11v6" /><path d="M14 11v6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M3 6h18" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
}

type LeadershipContent = {
  firstTitle: string
  firstDescription: string
  firstImage: string | null
  secondTitle: string
  secondDescription: string
  secondImage: string | null
}

const defaultLeadershipContent: LeadershipContent = {
  firstTitle: 'GA&A Senior Leadership Team',
  firstDescription: 'Meet the team leading Global Audit & Assurance excellence',
  firstImage: null,
  secondTitle: 'Audit Leadership Team',
  secondDescription: '',
  secondImage: null,
}

function AboutChildDetailPage({ child, contacts, contentItems, isLoading, error, contactError, contentError, canManageContent, onManage }: {
  child: AboutChildDetails | null
  contacts: AboutChildContactRecord[]
  contentItems: AboutChildContentRecord[]
  isLoading: boolean
  error: string
  contactError: string
  contentError: string
  canManageContent: boolean
  onManage: () => void
}) {
  const orderedContentItems = sortChildContent(contentItems)
  if (isLoading) return <section className="about-content about-child-detail-status" aria-live="polite">Loading section...</section>
  if (error) return <section className="about-content about-child-detail-status about-child-detail-error" role="alert">{error}</section>
  if (!child) return <section className="about-content about-child-detail-status">Select a section to view its details.</section>
  const referenceHash = buildReferenceHashFromSelection(child.ca_refcategory, child.ca_refsubcategory)
    ?? (child.ca_resourcepath ? getReferenceHash(child.ca_resourcepath) : undefined)

  return (
    <article className="about-content about-child-detail">
      <header className="about-child-detail-header">
        <h2>{child.ca_childdisplayname || child.ca_id}</h2>
        {canManageContent && <button className="about-child-manage-button" type="button" data-tooltip="Manage" onClick={onManage}>
          <ManageIcon />
          <span>Manage</span>
        </button>}
      </header>
      {contentError && <p className="about-child-detail-error" role="alert">{contentError}</p>}
      {orderedContentItems.map((item) => normalizeAboutContentType(item.ca_type) === 1 ? (
        item.ca_imagesource_url ? <figure className="about-child-rich-display" key={item.ca_about_us_child_imagestextid}>
          <img src={item.ca_imagesource_url} alt={item.ca_caption || 'Section image'} />
          {item.ca_caption && <figcaption>{item.ca_caption}</figcaption>}
        </figure> : null
      ) : item.ca_text ? <div
        className="about-child-rich-display-text"
        key={item.ca_about_us_child_imagestextid}
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(item.ca_text, { USE_PROFILES: { html: true } }) }}
      /> : null)}

      {child.ca_showresources && child.ca_resourcename && <section className="about-child-detail-section">
        <h3>Resources</h3>
        {child.ca_resourcepath ? <a className="about-resource-link" href={referenceHash ?? child.ca_resourcepath} target={referenceHash ? undefined : '_blank'} rel="noreferrer">
          <span className="about-resource-icon" aria-hidden="true"><Icon name="folder" /></span>
          <span>{child.ca_resourcename}</span>
          <Icon name="arrow" />
        </a> : <div className="about-resource-link about-resource-link-disabled">
          <span className="about-resource-icon" aria-hidden="true"><Icon name="folder" /></span>
          <span>{child.ca_resourcename}</span>
          <Icon name="arrow" />
        </div>}
      </section>}

      {child.ca_showcontactteam && <section className="about-child-detail-section">
        <h3>Contact the Team</h3>
        {contactError ? <p className="about-child-detail-error" role="alert">{contactError}</p> : contacts.length > 0 ? <div className="about-contact-grid">
          {contacts.map((contact) => <article className="about-contact-card" key={contact.ca_about_us_contact_teamid}>
            <span className="about-contact-avatar" aria-hidden="true"><Icon name="users" /></span>
            <div>
              <p className="about-contact-role">{contact.ca_role || 'Contact'}</p>
              <p className="about-contact-name">{contact.ca_name}</p>
              {contact.ca_designation && <p className="about-contact-designation">{contact.ca_designation}</p>}
            </div>
          </article>)}
        </div> : <p className="about-detail-empty">No team contacts are listed.</p>}
      </section>}

      {Boolean(child.ca_teammail?.trim()) && <section className="about-team-help">
        <span className="about-team-help-icon" aria-hidden="true"><Icon name="help" /></span>
        <div className="about-team-help-copy">
          <h3>Need Help?</h3>
          <p>Find answers, access guidance, and get support for managing assets and processes.</p>
        </div>
        {child.ca_teammail && <a href={`mailto:${child.ca_teammail}`} className="about-team-help-button">Contact Team <Icon name="arrow" /></a>}
      </section>}
    </article>
  )
}

function AboutChildManagePage({ draft, contacts, availableContacts, refCategoryOptions, refSubcategoryOptions, contentItems, onChange, onChangeContact, onChangeContent, onChangeContentFile, onAddContact, onRemoveContact, onMoveContact, onAddContent, onRemoveContent, onMoveContent, onCancel, onSave, isSaving, hasChanges, saveError }: {
  draft: AboutChildEditDraft
  contacts: AboutChildContactDraft[]
  availableContacts: AboutChildContactDraft[]
  refCategoryOptions: string[]
  refSubcategoryOptions: string[]
  contentItems: AboutChildContentDraft[]
  onChange: (key: keyof AboutChildEditDraft, value: string | boolean) => void
  onChangeContact: (index: number, key: keyof Omit<AboutChildContactDraft, 'id'>, value: string) => void
  onChangeContent: (index: number, key: 'caption' | 'text', value: string) => void
  onChangeContentFile: (index: number, file: File) => void | Promise<void>
  onAddContact: (name: string, designation: string, role: string, memberId: string) => void
  onRemoveContact: (index: number) => void
  onMoveContact: (index: number, direction: -1 | 1) => void
  onAddContent: (type: 1 | 2) => void | Promise<void>
  onRemoveContent: (index: number) => void
  onMoveContent: (index: number, direction: -1 | 1) => void
  onCancel: () => void
  onSave: () => void
  isSaving: boolean
  hasChanges: boolean
  saveError: string
}) {
  const [newContactName, setNewContactName] = useState('')
  const [newContactDesignation, setNewContactDesignation] = useState('')
  const [newContactRole, setNewContactRole] = useState('')
  const [isContactOptionsOpen, setIsContactOptionsOpen] = useState(false)
  const [activeContactOptionIndex, setActiveContactOptionIndex] = useState(-1)
  const [editingContactNameQuery, setEditingContactNameQuery] = useState('')
  const [isEditingContactOptionsOpen, setIsEditingContactOptionsOpen] = useState(false)
  const [activeEditingContactOptionIndex, setActiveEditingContactOptionIndex] = useState(-1)
  const [editingContactRows, setEditingContactRows] = useState<Set<number>>(new Set())
  const [editingContactOriginals, setEditingContactOriginals] = useState<Record<number, AboutChildContactDraft>>({})
  const [contactValidationError, setContactValidationError] = useState('')
  const contentFileInputRefs = useRef<Record<string, HTMLInputElement | null>>({})
  const setContentFileInputRef = (recordId: string, element: HTMLInputElement | null) => {
    if (element) {
      contentFileInputRefs.current[recordId] = element
      return
    }
    delete contentFileInputRefs.current[recordId]
  }
  const openContentFilePicker = (recordId: string, event: { preventDefault: () => void; stopPropagation: () => void }) => {
    event.preventDefault()
    event.stopPropagation()
    const fileInput = contentFileInputRefs.current[recordId]
    if (!fileInput) return
    fileInput.click()
  }
  const validateContact = (contact: AboutChildContactDraft, index?: number) => {
    const name = contact.name.trim()
    const designation = contact.designation.trim()
    const role = contact.role.trim()
    const memberId = contact.memberId?.trim()
    if (!name) return 'Member name is required.'
    if (!memberId) return 'Please select a member from the list'
    const nameValidationError = validateAboutTextInput(name, 'Member name')
    if (nameValidationError) return nameValidationError
    const designationValidationError = validateAboutTextInput(designation, 'Designation')
    if (designationValidationError) return designationValidationError
    const roleValidationError = validateAboutTextInput(role, 'Role')
    if (roleValidationError) return roleValidationError
    if (contacts.some((existing, existingIndex) =>
      existingIndex !== index &&
      ((existing.memberId?.trim() && memberId && existing.memberId.trim().toLowerCase() === memberId.toLowerCase()) ||
        (!existing.memberId?.trim() && !memberId && existing.name.trim().toLowerCase() === name.toLowerCase())),
    )) {
      return 'This team member is already added.'
    }
    return ''
  }
  const selectedContactMemberIds = new Set(
    contacts
      .map((contact) => contact.memberId?.trim().toLowerCase())
      .filter((memberId): memberId is string => Boolean(memberId)),
  )
  const filteredAvailableContacts = availableContacts.filter((contact) =>
    !selectedContactMemberIds.has(contact.memberId?.trim().toLowerCase() ?? '') &&
    (!newContactName.trim() || contact.name.toLowerCase().includes(newContactName.trim().toLowerCase()))
  )
  const selectAvailableContact = (contact: AboutChildContactDraft) => {
    setNewContactName(contact.name)
    setNewContactDesignation(contact.designation)
    setNewContactRole(contact.role)
    setContactValidationError('')
    setIsContactOptionsOpen(false)
  }
  const startEditingContact = (index: number) => {
    const contact = contacts[index]
    if (!contact) return
    setEditingContactOriginals({ [index]: { ...contact } })
    setEditingContactRows(new Set([index]))
    setEditingContactNameQuery(contact.name)
    setContactValidationError('')
    setIsEditingContactOptionsOpen(false)
    setActiveEditingContactOptionIndex(-1)
  }
  const finishEditingContact = (index: number) => {
    setEditingContactRows((rows) => {
      const next = new Set(rows)
      next.delete(index)
      return next
    })
    setEditingContactOriginals((originals) => {
      const next = { ...originals }
      delete next[index]
      return next
    })
    setIsEditingContactOptionsOpen(false)
  }
  const cancelEditingContact = (index: number) => {
    const original = editingContactOriginals[index]
    if (original) {
      onChangeContact(index, 'name', original.name)
      onChangeContact(index, 'memberId', original.memberId ?? '')
      onChangeContact(index, 'designation', original.designation)
      onChangeContact(index, 'role', original.role)
    }
    finishEditingContact(index)
    setContactValidationError('')
  }
  const getContactEditOptions = (index: number) => {
    const currentContact = contacts[index]
    const usedByOtherRows = new Set(contacts
      .filter((_, contactIndex) => contactIndex !== index)
      .map((contact) => contact.memberId?.trim().toLowerCase() ?? '')
      .filter((memberId) => memberId.length > 0))
    return [
      ...(currentContact ? [currentContact] : []),
      ...availableContacts.filter((contact) =>
        !usedByOtherRows.has(contact.memberId?.trim().toLowerCase() ?? '') &&
        (contact.memberId?.trim().toLowerCase() ?? '') !== (currentContact?.memberId?.trim().toLowerCase() ?? '')
      ),
    ]
  }
  const getFilteredContactEditOptions = (index: number) => getContactEditOptions(index).filter((contact) =>
    !editingContactNameQuery.trim() || contact.name.toLowerCase().includes(editingContactNameQuery.trim().toLowerCase())
  )
  const selectContactForEdit = (index: number, contact: AboutChildContactDraft) => {
    onChangeContact(index, 'name', contact.name)
    onChangeContact(index, 'memberId', contact.memberId ?? '')
    onChangeContact(index, 'designation', contact.designation)
    onChangeContact(index, 'role', contact.role)
    setEditingContactNameQuery(contact.name)
    setContactValidationError('')
    setIsEditingContactOptionsOpen(false)
  }

  return (
    <section className="about-content about-child-manage" aria-labelledby="about-child-manage-title">
      <header className="about-child-manage-header">
        <h2 id="about-child-manage-title">Manage Content</h2>
        <div className="about-child-manage-actions">
          <button className="cancel-button" type="button" data-tooltip="Cancel changes" onClick={onCancel} disabled={isSaving}>Cancel</button>
          <button className="save-button" type="button" data-tooltip={isSaving ? 'Saving changes' : 'Save changes'} onClick={onSave} disabled={isSaving || !hasChanges}>{isSaving ? 'Saving...' : 'Save Changes'}</button>
        </div>
      </header>
      {saveError && <p className="about-child-manage-error" role="alert">{saveError}</p>}
      <div className="about-child-manage-fields">
        <label className="about-child-manage-field about-child-manage-name">
          <span className="visually-hidden">Display name</span>
          <input value={draft.ca_childdisplayname} maxLength={100} onChange={(event) => onChange('ca_childdisplayname', event.target.value)} aria-label="Display name" />
        </label>
        <div className="about-child-content-actions">
          <button className="about-child-add-action" type="button" data-tooltip="Add an image block" onClick={() => void onAddContent(1)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21m11-14v-4m-2 2h4" /></svg>
            Add Image
          </button>
          <button className="about-child-add-action" type="button" data-tooltip="Add a text block" onClick={() => void onAddContent(2)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M8 13h8m-8 4h8" /></svg>
            Add Text
          </button>
        </div>
        {contentItems.map((contentItem, index) => (
          <div className="about-child-rich-content" key={contentItem.id ?? contentItem.recordId}>
            <div className="about-child-rich-content-heading">
              <strong>
                {contentItem.type === 1 ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" /></svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /></svg>
                )}
                New {contentItem.type === 1 ? 'Image' : 'Text'} Block
                {contentItem.type === 1 && <span className="about-child-image-guidance">(Supported Images:-JPG, JPEG and PNG; Max File Size:-1MB)</span>}
              </strong>
              <div className="about-child-rich-content-actions">
                <button type="button" aria-label={`Move block ${index + 1} up`} data-tooltip="Move up" onClick={() => onMoveContent(index, -1)} disabled={index === 0}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 19V5m-6 6 6-6 6 6" /></svg></button>
                <button type="button" aria-label={`Move block ${index + 1} down`} data-tooltip="Move down" onClick={() => onMoveContent(index, 1)} disabled={index === contentItems.length - 1}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 5v14m6-6-6 6-6-6" /></svg></button>
                <button type="button" aria-label={`Remove ${contentItem.type === 1 ? 'image' : 'text'} item`} data-tooltip="Remove item" onClick={() => onRemoveContent(index)}><DeleteIcon /></button>
              </div>
            </div>
            {contentItem.type === 1 ? <>
              <button
                className="about-child-image-upload"
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={(event) => openContentFilePicker(contentItem.recordId, event)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21m11-14v-4m-2 2h4" /></svg>
                {contentItem.file || contentItem.imageUrl ? 'Replace Image' : 'Upload Image'}
              </button>
              <input
                ref={(element) => setContentFileInputRef(contentItem.recordId, element)}
                type="file"
                accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                aria-label="Upload image"
                style={{ display: 'none' }}
                onClick={(event) => event.stopPropagation()}
                onChange={(event) => {
                  try {
                    const input = event.currentTarget
                    const file = input.files?.[0]
                    try {
                      input.value = ''
                    } catch (error) {
                      console.warn('Resetting the upload input failed.', error)
                    }
                    if (!file) return
                    Promise.resolve(onChangeContentFile(index, file)).catch((error) => {
                      console.error('Image upload selection handling failed.', error)
                    })
                  } catch (error) {
                    console.error('Image upload input handling failed.', error)
                  }
                }}
              />
              <div className={`about-child-rich-content-preview ${contentItem.imageUrl ? 'has-image' : ''}`}>
                {contentItem.imageUrl ? <img className="about-child-rich-content-image" src={contentItem.imageUrl} alt={contentItem.caption || 'Image preview'} /> : <span>No image selected</span>}
              </div>
              <input className="about-child-rich-content-caption" maxLength={100} value={contentItem.caption} onChange={(event) => onChangeContent(index, 'caption', event.target.value)} placeholder="Caption (optional)" aria-label="Image caption" />
            </> : <RichTextEditor value={contentItem.text} maxLength={4000} onChange={(value) => onChangeContent(index, 'text', value)} />}
          </div>
        ))}

        <section className="about-child-manage-section">
          <div className="about-child-manage-section-heading">
            <h3>Resources</h3>
            <label className="about-child-manage-toggle">
              <input type="checkbox" checked={draft.ca_showresources === true} onChange={(event) => {
                const showResources = event.target.checked
                onChange('ca_showresources', showResources)
                if (!showResources) {
                  onChange('ca_resourcename', '')
                  onChange('ca_refcategory', '')
                  onChange('ca_refsubcategory', '')
                  onChange('ca_resourcepath', '')
                }
              }} />
              <span>check to show the content.</span>
            </label>
          </div>
          <label className="about-child-manage-field about-child-manage-inline-field">
            <span className="visually-hidden">Resource name</span>
            <input
              value={draft.ca_resourcename ?? ''}
              maxLength={100}
              placeholder="Resource Title"
              onChange={(event) => onChange('ca_resourcename', event.target.value)}
            />
          </label>
          <label className="about-child-manage-field about-child-manage-inline-field">
            <span className="visually-hidden">Reference category</span>
            <select value={draft.ca_refcategory ?? ''} onChange={(event) => onChange('ca_refcategory', event.target.value)} aria-label="Reference category">
              <option value="">Select Category</option>
              {refCategoryOptions.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>
          <label className="about-child-manage-field about-child-manage-inline-field">
            <span className="visually-hidden">Reference sub category</span>
            <select value={draft.ca_refsubcategory ?? ''} onChange={(event) => onChange('ca_refsubcategory', event.target.value)} aria-label="Reference sub category">
              <option value="">Select SubCategory</option>
              {refSubcategoryOptions.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>
        </section>

        <section className="about-child-manage-section" onMouseDown={(event) => {
          const clickedElement = event.target
          const activeElement = document.activeElement
          if (!(clickedElement instanceof Element) || !(activeElement instanceof HTMLElement)) return
          if (!activeElement.closest('.about-child-contact-add') || activeElement.contains(clickedElement)) return
          if (clickedElement.closest('.about-child-contact-name-popup, .about-child-contact-name-toggle')) return
          activeElement.blur()
        }}>
          <div className="about-child-manage-section-heading">
            <h3>Contact the Team</h3>
            <label className="about-child-manage-toggle">
              <input type="checkbox" checked={draft.ca_showcontactteam === true} onChange={(event) => onChange('ca_showcontactteam', event.target.checked)} />
              <span>check to show the content.</span>
            </label>
          </div>
          <div className="about-child-contact-add">
              <div className="about-child-contact-name-field">
                <input
                  value={newContactName}
                  onFocus={() => { setIsContactOptionsOpen(true); setActiveContactOptionIndex(-1) }}
                  onMouseDown={(event) => {
                    if (document.activeElement === event.currentTarget) setIsContactOptionsOpen((isOpen) => !isOpen)
                    else setIsContactOptionsOpen(true)
                  }}
                  onBlur={() => setIsContactOptionsOpen(false)}
                  onChange={(event) => {
                    const name = event.target.value
                    const match = availableContacts.find((contact) => contact.name.trim().toLowerCase() === name.trim().toLowerCase())
                    setNewContactName(name)
                    setNewContactDesignation(match?.designation ?? '')
                    setNewContactRole(match?.role ?? '')
                    setContactValidationError('')
                    setIsContactOptionsOpen(true)
                    setActiveContactOptionIndex(-1)
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'ArrowDown' && filteredAvailableContacts.length > 0) {
                      event.preventDefault()
                      setIsContactOptionsOpen(true)
                      setActiveContactOptionIndex((index) => Math.min(index + 1, filteredAvailableContacts.length - 1))
                    } else if (event.key === 'ArrowUp' && filteredAvailableContacts.length > 0) {
                      event.preventDefault()
                      setIsContactOptionsOpen(true)
                      setActiveContactOptionIndex((index) => Math.max(index - 1, 0))
                    } else if (event.key === 'Enter' && isContactOptionsOpen && filteredAvailableContacts[activeContactOptionIndex]) {
                      event.preventDefault()
                      selectAvailableContact(filteredAvailableContacts[activeContactOptionIndex])
                    } else if (event.key === 'Escape') {
                      setIsContactOptionsOpen(false)
                    }
                  }}
                  role="combobox"
                  aria-autocomplete="list"
                  aria-haspopup="listbox"
                  aria-expanded={isContactOptionsOpen && filteredAvailableContacts.length > 0}
                  aria-controls="about-child-contact-name-options"
                  aria-activedescendant={isContactOptionsOpen && activeContactOptionIndex >= 0 ? `about-child-contact-option-${activeContactOptionIndex}` : undefined}
                  placeholder="Type member name & select"
                  aria-label="Team member name"
                  maxLength={100}
                />
                <button className={`about-child-contact-name-toggle ${isContactOptionsOpen ? 'is-open' : ''}`} type="button" aria-label="Show contact names" aria-expanded={isContactOptionsOpen} onMouseDown={(event) => event.preventDefault()} onClick={() => setIsContactOptionsOpen((isOpen) => !isOpen)}>
                  <Icon name="chevron" />
                </button>
                {isContactOptionsOpen && filteredAvailableContacts.length > 0 && <div className="about-child-contact-name-popup">
                  <div className="about-child-contact-name-options" id="about-child-contact-name-options" role="listbox">
                    {filteredAvailableContacts.map((contact, index) => <button
                      id={`about-child-contact-option-${index}`}
                      className="about-child-contact-name-option"
                      type="button"
                      role="option"
                      aria-selected={index === activeContactOptionIndex}
                      key={contact.memberId ?? `${contact.name.toLowerCase()}-${index}`}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => selectAvailableContact(contact)}
                    >{contact.name}</button>)}
                  </div>
                </div>}
              </div>
              <input value={newContactDesignation} maxLength={100} onChange={(event) => { setNewContactDesignation(event.target.value); setContactValidationError('') }} placeholder="Designation" aria-label="Team member designation" />
              <input value={newContactRole} maxLength={100} onChange={(event) => { setNewContactRole(event.target.value); setContactValidationError('') }} placeholder="Role" aria-label="Team member role" />
              <button type="button" data-tooltip="Add contact" onClick={() => {
               const exactMatches = availableContacts.filter((contact) => contact.name.trim().toLowerCase() === newContactName.trim().toLowerCase())
               const matchedContact = exactMatches.length === 1 ? exactMatches[0] : undefined
               const contact = { memberId: matchedContact?.memberId, name: newContactName, designation: newContactDesignation, role: newContactRole }
               const validationError = validateContact(contact)
               if (validationError) {
                 setContactValidationError(validationError)
                 return
               }
               onAddContact(contact.name.trim(), contact.designation.trim(), contact.role.trim(), contact.memberId ?? '')
               setNewContactName('')
               setNewContactDesignation('')
               setNewContactRole('')
                setContactValidationError('')
              }}>Add</button>
          </div>
          {contactValidationError && <p className="about-child-manage-error" role="alert">{contactValidationError}</p>}
          {contacts.length > 0 && <div className="about-child-contact-list">
              {contacts.map((contact, index) => <div className={`about-child-contact-row ${editingContactRows.has(index) ? 'is-editing' : ''}`} key={contact.id ?? `new-contact-${index}`}>
                {editingContactRows.has(index) ? <>
                  <div className="about-child-contact-name-field">
                    <input
                      value={editingContactNameQuery}
                      onFocus={() => {
                        setEditingContactNameQuery(contact.name)
                        setIsEditingContactOptionsOpen(true)
                        setActiveEditingContactOptionIndex(-1)
                      }}
                      onBlur={() => setIsEditingContactOptionsOpen(false)}
                      onChange={(event) => {
                        setEditingContactNameQuery(event.target.value)
                        setContactValidationError('')
                        setIsEditingContactOptionsOpen(true)
                        setActiveEditingContactOptionIndex(-1)
                      }}
                      onKeyDown={(event) => {
                        const options = getFilteredContactEditOptions(index)
                        if (event.key === 'ArrowDown' && options.length > 0) {
                          event.preventDefault()
                          setIsEditingContactOptionsOpen(true)
                          setActiveEditingContactOptionIndex((optionIndex) => Math.min(optionIndex + 1, options.length - 1))
                        } else if (event.key === 'ArrowUp' && options.length > 0) {
                          event.preventDefault()
                          setIsEditingContactOptionsOpen(true)
                          setActiveEditingContactOptionIndex((optionIndex) => Math.max(optionIndex - 1, 0))
                        } else if (event.key === 'Enter' && isEditingContactOptionsOpen && options[activeEditingContactOptionIndex]) {
                          event.preventDefault()
                          selectContactForEdit(index, options[activeEditingContactOptionIndex])
                        } else if (event.key === 'Escape') {
                          setIsEditingContactOptionsOpen(false)
                        }
                      }}
                      role="combobox"
                      aria-autocomplete="list"
                      aria-haspopup="listbox"
                      aria-expanded={isEditingContactOptionsOpen && getFilteredContactEditOptions(index).length > 0}
                      aria-controls={`about-child-contact-edit-options-${index}`}
                      aria-activedescendant={isEditingContactOptionsOpen && activeEditingContactOptionIndex >= 0 ? `about-child-contact-edit-option-${index}-${activeEditingContactOptionIndex}` : undefined}
                      placeholder="Type member name & select"
                      aria-label={`Contact ${index + 1} name`}
                      maxLength={100}
                    />
                    <button className={`about-child-contact-name-toggle ${isEditingContactOptionsOpen ? 'is-open' : ''}`} type="button" aria-label={`Show names for contact ${index + 1}`} aria-expanded={isEditingContactOptionsOpen} onMouseDown={(event) => event.preventDefault()} onClick={() => setIsEditingContactOptionsOpen((isOpen) => !isOpen)}>
                      <Icon name="chevron" />
                    </button>
                    {isEditingContactOptionsOpen && getFilteredContactEditOptions(index).length > 0 && <div className="about-child-contact-name-popup">
                      <div className="about-child-contact-name-options" id={`about-child-contact-edit-options-${index}`} role="listbox">
                        {getFilteredContactEditOptions(index).map((option, optionIndex) => <button
                          id={`about-child-contact-edit-option-${index}-${optionIndex}`}
                          className="about-child-contact-name-option"
                          type="button"
                          role="option"
                          aria-selected={optionIndex === activeEditingContactOptionIndex}
                          key={option.memberId ?? `${option.name.toLowerCase()}-${optionIndex}`}
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => selectContactForEdit(index, option)}
                        >{option.name}</button>)}
                      </div>
                    </div>}
                  </div>
                  <input value={contact.designation} maxLength={100} onChange={(event) => { onChangeContact(index, 'designation', event.target.value); setContactValidationError('') }} aria-label={`Contact ${index + 1} designation`} />
                  <input value={contact.role} maxLength={100} onChange={(event) => { onChangeContact(index, 'role', event.target.value); setContactValidationError('') }} aria-label={`Contact ${index + 1} role`} />
                </> : <>
                  <span>{contact.name}</span>
                  <span>{contact.designation}</span>
                  <span>{contact.role}</span>
                </>}
                <div className={`about-child-contact-actions ${editingContactRows.has(index) ? 'is-editing' : ''}`}>
                  {editingContactRows.has(index) ? <>
                    <button type="button" className="cancel-edit" aria-label={`Cancel contact ${index + 1} edits`} data-tooltip="Cancel" onClick={() => cancelEditingContact(index)}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" /></svg>
                    </button>
                    <button type="button" className="confirm-edit" aria-label={`Confirm contact ${index + 1} edits`} data-tooltip="Confirm" onClick={() => {
                      const selectedOption = getContactEditOptions(index).find((option) => option.name.trim().toLowerCase() === editingContactNameQuery.trim().toLowerCase())
                      const editedContact = { ...contact, name: editingContactNameQuery, memberId: selectedOption?.memberId }
                      const validationError = validateContact(editedContact, index)
                      if (validationError) {
                        setContactValidationError(validationError)
                        return
                      }
                      onChangeContact(index, 'name', editedContact.name.trim())
                      onChangeContact(index, 'memberId', editedContact.memberId ?? '')
                      setContactValidationError('')
                      finishEditingContact(index)
                    }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 12 4 4L19 6" /></svg>
                    </button>
                  </> : <>
                    <button type="button" aria-label={`Edit contact ${index + 1}`} data-tooltip="Edit contact" onClick={() => startEditingContact(index)}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="lucide lucide-pencil icon icon--md"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" /><path d="m15 5 4 4" /></svg>
                    </button>
                    <button type="button" aria-label={`Move contact ${index + 1} up`} data-tooltip="Move up" onClick={() => onMoveContact(index, -1)} disabled={index === 0}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 19V5m-6 6 6-6 6 6" /></svg>
                    </button>
                    <button type="button" aria-label={`Move contact ${index + 1} down`} data-tooltip="Move down" onClick={() => onMoveContact(index, 1)} disabled={index === contacts.length - 1}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 5v14m6-6-6 6-6-6" /></svg>
                    </button>
                    <button type="button" className="danger" aria-label={`Remove contact ${index + 1}`} data-tooltip="Remove contact" onClick={() => onRemoveContact(index)}><DeleteIcon /></button>
                  </>}
                </div>
              </div>)}
          </div>}
        </section>

        <section className="about-child-manage-section">
          <div className="about-child-manage-section-heading">
            <h3>Team Mailbox</h3>
            <label className="about-child-manage-toggle">
              <input type="checkbox" checked={draft.ca_showteammailbox === true} onChange={(event) => {
                const showTeamMailbox = event.target.checked
                onChange('ca_showteammailbox', showTeamMailbox)
                if (!showTeamMailbox) onChange('ca_teammail', '')
              }} />
              <span>check to show the content.</span>
            </label>
          </div>
          <label className="about-child-manage-field about-child-manage-inline-field">
            <span className="visually-hidden">Team mailbox email</span>
            <input
              type="email"
              value={draft.ca_teammail ?? ''}
              maxLength={100}
              disabled={draft.ca_showteammailbox !== true}
              onChange={(event) => onChange('ca_teammail', event.target.value)}
              placeholder="team@mailbox.com"
            />
          </label>
        </section>
      </div>
    </section>
  )
}

function LeadershipContentEditor({ content, onChange, onImageFileChange, onCancel, onSave, saveError }: {
  content: LeadershipContent
  onChange: (key: keyof LeadershipContent, value: string | null) => void
  onImageFileChange: (key: 'firstImage' | 'secondImage', file: File | null) => void
  onCancel: () => void
  onSave: () => void
  saveError: string
}) {
  const [imageError, setImageError] = useState('')
  const handleImageUpload = (key: 'firstImage' | 'secondImage', event: { currentTarget: HTMLInputElement }) => {
    const file = event.currentTarget.files?.[0]
    event.currentTarget.value = ''
    if (!file) return
    const fileValidationError = validateAboutImageFile(file)
    if (fileValidationError) {
      setImageError(fileValidationError)
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      onChange(key, typeof reader.result === 'string' ? reader.result : null)
      onImageFileChange(key, file)
      setImageError('')
    }
    reader.onerror = () => setImageError('The image could not be read.')
    reader.readAsDataURL(file)
  }

  const renderImageEditor = (key: 'firstImage' | 'secondImage', image: string | null, label: string) => (
    <div className="leadership-image-field">
      <span className="leadership-field-label">Hierarchy image</span>
      <div className="leadership-image-actions">
        <label className="leadership-image-replace">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21m11-14v-4m-2 2h4" /></svg>
          {image ? 'Replace image' : 'Add image'}
          <input type="file" accept=".jpg,.jpeg,.png,image/jpeg,image/png" aria-label={`${image ? 'Replace' : 'Add'} ${label} hierarchy image`} onChange={(event) => handleImageUpload(key, event)} />
        </label>
        {image && <button className="leadership-image-remove" type="button" data-tooltip={`Remove ${label} image`} onClick={() => {
          onChange(key, null)
          onImageFileChange(key, null)
          setImageError('')
        }}>Remove</button>}
      </div>
      <div className={`leadership-image-preview ${image ? 'has-image' : 'is-empty'}`}>
        {image ? <img src={image} alt={`${label} hierarchy preview`} /> : <span className="leadership-empty-image">No image yet</span>}
      </div>
      {imageError && <p className="leadership-image-error" role="alert">{imageError}</p>}
    </div>
  )

  return (
    <section className="leadership-content-editor" aria-labelledby="leadership-editor-title">
      <header className="leadership-editor-header">
        <h2 id="leadership-editor-title">Manage Content</h2>
        <div className="edit-actions">
          <button className="cancel-button" type="button" data-tooltip="Cancel changes" onClick={onCancel}>Cancel</button>
          <button className="save-button" type="button" data-tooltip="Save changes" onClick={onSave}>Save Changes</button>
        </div>
      </header>
      {saveError && <p className="leadership-image-error" role="alert">{saveError}</p>}
      <div className="leadership-editor-section">
        <label className="leadership-field-label" htmlFor="leadership-first-title">Leadership 1 title</label>
        <input id="leadership-first-title" value={content.firstTitle} maxLength={100} onChange={(event) => onChange('firstTitle', event.target.value)} />
        <label className="leadership-field-label" htmlFor="leadership-first-description">Text</label>
        <textarea id="leadership-first-description" value={content.firstDescription} onChange={(event) => onChange('firstDescription', event.target.value)} />
        {renderImageEditor('firstImage', content.firstImage, 'Leadership 1')}
      </div>
      <div className="leadership-editor-section">
        <label className="leadership-field-label" htmlFor="leadership-second-title">Leadership 2 title</label>
        <input id="leadership-second-title" value={content.secondTitle} maxLength={100} onChange={(event) => onChange('secondTitle', event.target.value)} />
        <label className="leadership-field-label" htmlFor="leadership-second-description">Text</label>
        <textarea id="leadership-second-description" value={content.secondDescription} onChange={(event) => onChange('secondDescription', event.target.value)} placeholder="Type section text" />
        {renderImageEditor('secondImage', content.secondImage, 'Leadership 2')}
      </div>
    </section>
  )
}

function LeadershipPage({ content, canManageContent, onManage }: { content: LeadershipContent; canManageContent: boolean; onManage: () => void }) {
  return (
    <section className="leadership-page" aria-labelledby="leadership-page-title">
      <header className="leadership-page-header">
        <h2 id="leadership-page-title">Leadership</h2>
        <div className="leadership-page-actions">
          {canManageContent && <button type="button" className="leadership-action-button" data-tooltip="Manage" onClick={onManage}><ManageIcon /><span>Manage</span></button>}
        </div>
      </header>

      <section className="leadership-section" aria-labelledby="senior-team-title">
        <h3 id="senior-team-title">{content.firstTitle}</h3>
        {content.firstDescription && <p className="leadership-section-intro">{content.firstDescription}</p>}
        <div className={`leadership-chart-scroll ${content.firstImage ? '' : 'is-empty'}`}>
          {content.firstImage ? <img className="leadership-uploaded-image" src={content.firstImage} alt={`${content.firstTitle} hierarchy`} /> : <div className="leadership-display-empty">Org chart image — {content.firstTitle}</div>}
        </div>
      </section>

      <section className="leadership-section audit-leadership-section" aria-labelledby="audit-team-title">
        <h3 id="audit-team-title">{content.secondTitle}</h3>
        {content.secondDescription && <p className="leadership-section-intro">{content.secondDescription}</p>}
        <div className={`leadership-chart-scroll ${content.secondImage ? '' : 'is-empty'}`}>
          {content.secondImage ? <img className="leadership-uploaded-image" src={content.secondImage} alt={`${content.secondTitle} hierarchy`} /> : <div className="leadership-display-empty">Org chart image — {content.secondTitle}</div>}
        </div>
      </section>
    </section>
  )
}

export function AboutUsPage({ isAdmin, canManageContent }: { isAdmin: boolean; canManageContent: boolean }) {
  const [query, setQuery] = useState('')
  const [submittedQuery, setSubmittedQuery] = useState('')
  const [aboutSearchResults, setAboutSearchResults] = useState<AboutSearchResult[]>([])
  const [isSearchingAbout, setIsSearchingAbout] = useState(false)
  const [aboutSearchError, setAboutSearchError] = useState('')
  const [activeItem, setActiveItem] = useState('Mission')
  const [activeNavChildId, setActiveNavChildId] = useState<string | null>(null)
  const [activeChildId, setActiveChildId] = useState<string | null>(null)
  const [activeChildDetails, setActiveChildDetails] = useState<AboutChildDetails | null>(null)
  const [activeChildContacts, setActiveChildContacts] = useState<AboutChildContactRecord[]>([])
  const [availableChildContacts, setAvailableChildContacts] = useState<AboutChildContactDraft[]>([])
  const [resourceCategoryOptions, setResourceCategoryOptions] = useState<string[]>([])
  const [resourceSubcategoryOptions, setResourceSubcategoryOptions] = useState<string[]>([])
  const [resourceCategoryNameToId, setResourceCategoryNameToId] = useState<Record<string, string>>({})
  const [resourceSubcategoryOptionsByCategoryId, setResourceSubcategoryOptionsByCategoryId] = useState<Record<string, string[]>>({})
  const [resourceSubcategoryOptionsByCategoryName, setResourceSubcategoryOptionsByCategoryName] = useState<Record<string, string[]>>({})
  const [resourceSubcategoryIdByCategoryAndName, setResourceSubcategoryIdByCategoryAndName] = useState<Record<string, string>>({})
  const [activeChildContent, setActiveChildContent] = useState<AboutChildContentRecord[]>([])
  const [isLoadingChildDetails, setIsLoadingChildDetails] = useState(false)
  const [childDetailsError, setChildDetailsError] = useState('')
  const [childContactsError, setChildContactsError] = useState('')
  const [childContentError, setChildContentError] = useState('')
  const [isManagingChildDetails, setIsManagingChildDetails] = useState(false)
  const [draftChildDetails, setDraftChildDetails] = useState<AboutChildEditDraft | null>(null)
  const [draftChildContacts, setDraftChildContacts] = useState<AboutChildContactDraft[]>([])
  const [originalChildContacts, setOriginalChildContacts] = useState<AboutChildContactDraft[]>([])
  const [removedChildContactIds, setRemovedChildContactIds] = useState<string[]>([])
  const [draftChildContent, setDraftChildContent] = useState<AboutChildContentDraft[]>([])
  const [originalChildContent, setOriginalChildContent] = useState<AboutChildContentDraft[]>([])
  const [removedChildContentIds, setRemovedChildContentIds] = useState<string[]>([])
  const [isLoadingChildEditor, setIsLoadingChildEditor] = useState(false)
  const [isSavingChildDetails, setIsSavingChildDetails] = useState(false)
  const [childDetailsSaveError, setChildDetailsSaveError] = useState('')
  const [childDetailsSavedMessage, setChildDetailsSavedMessage] = useState('')
  const [childDetailsConfirmationTitle, setChildDetailsConfirmationTitle] = useState('Changes saved')
  const [aboutNavigation, setAboutNavigation] = useState<AboutNavigationItem[]>(loadCachedAboutNavigation)
  const [navigationLoadError, setNavigationLoadError] = useState('')
  const [leadershipContent, setLeadershipContent] = useState<LeadershipContent>(defaultLeadershipContent)
  const [draftLeadershipContent, setDraftLeadershipContent] = useState(leadershipContent)
  const [leadershipRecordId, setLeadershipRecordId] = useState<string | null>(null)
  const [leadershipStoredImages, setLeadershipStoredImages] = useState<{ first: boolean; second: boolean }>({ first: false, second: false })
  const [draftLeadershipFiles, setDraftLeadershipFiles] = useState<{ firstImage?: File | null; secondImage?: File | null }>({})
  const [isManagingLeadership, setIsManagingLeadership] = useState(false)
  const [leadershipSaveError, setLeadershipSaveError] = useState('')
  const [managingParent, setManagingParent] = useState<AboutNavigationItem | null>(null)
  const [isManagingMenu, setIsManagingMenu] = useState(false)
  const [draftParentItems, setDraftParentItems] = useState<AboutMenuDraftItem[]>([])
  const [newParentLabel, setNewParentLabel] = useState('')
  const [newParentHasSubcategory, setNewParentHasSubcategory] = useState(true)
  const [draftChildren, setDraftChildren] = useState<AboutNavigationChild[]>([])
  const [newChildLabel, setNewChildLabel] = useState('')
  const [isSavingParent, setIsSavingParent] = useState(false)
  const [parentSaveError, setParentSaveError] = useState('')
  const [menuSaveError, setMenuSaveError] = useState('')
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({})
  const [openChildMenu, setOpenChildMenu] = useState<string | null>(null)
  const [childActionError, setChildActionError] = useState('')
  const [pendingChildDelete, setPendingChildDelete] = useState<{ parent: AboutNavigationItem; childLabel: string } | null>(null)
  const [pendingContactDelete, setPendingContactDelete] = useState<{ index: number; name: string } | null>(null)
  const [isDeletingChild, setIsDeletingChild] = useState(false)
  const childDetailsRequestId = useRef(0)
  const isManagingChildDetailsPinned = useRef(false)
  const memberDirectoryCache = useRef<AboutChildContactDraft[] | null>(null)
  const memberDirectoryPromise = useRef<Promise<AboutChildContactDraft[]> | null>(null)
  const localDraftPreviewUrls = useRef<Set<string>>(new Set())
  const revokeDraftPreviewUrl = (url: string | undefined) => {
    if (!isBlobPreviewUrl(url)) return
    if (!localDraftPreviewUrls.current.has(url)) return
    URL.revokeObjectURL(url)
    localDraftPreviewUrls.current.delete(url)
  }
  const clearDraftPreviewUrls = (items: AboutChildContentDraft[]) => {
    items.forEach((item) => revokeDraftPreviewUrl(item.imageUrl))
  }
  const textImageBlockLimitCache = useRef<AboutTextImageBlockLimits | null>(null)
  const textImageBlockLimitPromise = useRef<Promise<AboutTextImageBlockLimits> | null>(null)
  const ensureTextImageBlockLimits = async (forceRefresh = false): Promise<AboutTextImageBlockLimits> => {
    if (!forceRefresh &&
      textImageBlockLimitCache.current &&
      (typeof textImageBlockLimitCache.current.maxImageBlocks === 'number' || typeof textImageBlockLimitCache.current.maxTextBlocks === 'number')) {
      return textImageBlockLimitCache.current
    }
    if (forceRefresh) {
      textImageBlockLimitCache.current = null
      textImageBlockLimitPromise.current = null
    }
    if (!textImageBlockLimitPromise.current) {
      textImageBlockLimitPromise.current = loadAboutTextImageBlockLimits().then((limits) => {
        if (typeof limits.maxImageBlocks === 'number' || typeof limits.maxTextBlocks === 'number') {
          textImageBlockLimitCache.current = limits
        }
        return limits
      }).finally(() => {
        textImageBlockLimitPromise.current = null
      })
    }
    return textImageBlockLimitPromise.current
  }
  const updateAboutNavigation = (items: AboutNavigationItem[]) => {
    setAboutNavigation(items)
    cacheAboutNavigation(items)
  }
  const ensureMemberDirectoryLoaded = async () => {
    if (memberDirectoryCache.current) return memberDirectoryCache.current
    if (!memberDirectoryPromise.current) {
      memberDirectoryPromise.current = loadActiveSystemUserDirectory()
    }
    try {
      const directory = await memberDirectoryPromise.current
      memberDirectoryCache.current = directory
      setAvailableChildContacts(directory)
      return directory
    } finally {
      memberDirectoryPromise.current = null
    }
  }
  useEffect(() => () => {
    localDraftPreviewUrls.current.forEach((url) => URL.revokeObjectURL(url))
    localDraftPreviewUrls.current.clear()
  }, [])
  const leaveAboutSubpage = (force = false) => {
    if (!force && isManagingChildDetailsPinned.current) return
    isManagingChildDetailsPinned.current = false
    childDetailsRequestId.current += 1
    setManagingParent(null)
    setIsManagingMenu(false)
    setIsManagingLeadership(false)
    setIsManagingChildDetails(false)
    setDraftChildDetails(null)
    setActiveNavChildId(null)
    setActiveChildId(null)
    setActiveChildDetails(null)
    setActiveChildContacts([])
    setActiveChildContent([])
    setIsLoadingChildDetails(false)
    setIsLoadingChildEditor(false)
  }
  const normalizedSubmittedQuery = submittedQuery.trim().toLowerCase()
  const matches = (label: string) => !normalizedSubmittedQuery || label.toLowerCase().includes(normalizedSubmittedQuery)
  const clearAboutSearch = () => {
    setQuery('')
    setSubmittedQuery('')
    setAboutSearchResults([])
    setAboutSearchError('')
    setIsSearchingAbout(false)
  }
  const getSelectedSubcategoryLabel = (): string | null => {
    if (!activeNavChildId) return null
    const selectedChild = aboutNavigation
      .flatMap((item) => item.childItems ?? [])
      .find((child) => child.id === activeNavChildId)
    return selectedChild?.label ?? null
  }
  const searchableAboutNavigation = aboutNavigation.filter((item) => item.icon
    ? matches(item.label)
    : item.isActive === true && (matches(item.label) || (item.childItems ?? []).some((child) => child.isActive === true && matches(child.label))))
  useEffect(() => {
    if (!normalizedSubmittedQuery) {
      setAboutSearchResults([])
      setAboutSearchError('')
      setIsSearchingAbout(false)
      return
    }
    let isMounted = true
    const runAboutSearch = async () => {
      setIsSearchingAbout(true)
      setAboutSearchError('')
      try {
        const subcategoryMetaById = new Map<string, { categoryLabel: string; hasSubcategory: boolean; subcategoryLabel: string }>()
        const categoryMetaByNormalizedLabel = new Map<string, { categoryLabel: string; hasSubcategory: boolean }>()
        aboutNavigation.forEach((item) => {
          const categoryLabel = item.label.trim()
          const hasSubcategory = item.hasSubcategory === true
          categoryMetaByNormalizedLabel.set(normalizeLabelForIdMatch(categoryLabel), { categoryLabel, hasSubcategory })
          ;(item.childItems ?? []).forEach((child) => {
            if (!child.id || child.isActive !== true) return
            subcategoryMetaById.set(child.id, {
              categoryLabel,
              hasSubcategory,
              subcategoryLabel: child.label.trim(),
            })
          })
        })

        const [subcategoriesResult, contentResult, contactsResult] = await Promise.all([
          Cp_aboutussubcategoriesesService.getAll({
            select: ['cp_aboutussubcategoriesid', 'cp_subcategory', '_cp_category_value', 'cp_resourcename', '_cp_refcategory_value', '_cp_refsubcategory_value', 'cp_teammail', 'cp_showcontactteam', 'statecode'],
            filter: 'statecode eq 0',
          }),
          Cp_aboutustextimaegeblocksesService.getAll({
            select: ['_cp_aboutussubcategory_value', 'cp_type', 'cp_text', 'cp_imagecaption', 'statecode'],
            filter: 'statecode eq 0',
          }),
          Cp_aboutuscontactteamdetailsesService.getAll({
            select: ['_cp_aboutussubcategory_value', '_cp_membername_value', 'cp_designation', 'cp_role', 'statecode'],
            filter: 'statecode eq 0',
          }),
        ])

        if (!subcategoriesResult.success) throw subcategoriesResult.error ?? new Error('Sub category search records could not be loaded.')
        if (!contentResult.success) throw contentResult.error ?? new Error('Sub category text/image records could not be loaded.')
        if (!contactsResult.success) throw contactsResult.error ?? new Error('Sub category contact records could not be loaded.')

        const contentBySubcategory = new Map<string, string[]>()
        ;(contentResult.data ?? [])
          .filter((content) => content.statecode !== 1)
          .forEach((content) => {
            const subcategoryId = (content._cp_aboutussubcategory_value ?? '').trim()
            if (!subcategoryId) return
            const bucket = contentBySubcategory.get(subcategoryId) ?? []
            if (content.cp_imagecaption?.trim()) bucket.push(content.cp_imagecaption.trim())
            const plainText = stripHtmlToPlainText(content.cp_text)
            if (plainText) bucket.push(plainText)
            contentBySubcategory.set(subcategoryId, bucket)
          })

        const memberIds = [...new Set((contactsResult.data ?? [])
          .filter((contact) => contact.statecode !== 1)
          .map((contact) => (contact._cp_membername_value ?? '').trim())
          .filter((memberId) => memberId.length > 0))]
        const memberNamesById = await resolveSystemUserNamesById(memberIds)
        const contactsBySubcategory = new Map<string, string[]>()
        ;(contactsResult.data ?? [])
          .filter((contact) => contact.statecode !== 1)
          .forEach((contact) => {
            const subcategoryId = (contact._cp_aboutussubcategory_value ?? '').trim()
            if (!subcategoryId) return
            const bucket = contactsBySubcategory.get(subcategoryId) ?? []
            const memberName = memberNamesById.get((contact._cp_membername_value ?? '').toLowerCase())
            if (memberName?.trim()) bucket.push(memberName.trim())
            if (contact.cp_designation?.trim()) bucket.push(contact.cp_designation.trim())
            if (contact.cp_role?.trim()) bucket.push(contact.cp_role.trim())
            contactsBySubcategory.set(subcategoryId, bucket)
          })

        const queryValue = normalizedSubmittedQuery
        const searchResults: AboutSearchResult[] = []
        ;(subcategoriesResult.data ?? [])
          .filter((subcategory) => subcategory.statecode !== 1)
          .forEach((subcategory) => {
            const subcategoryId = (subcategory.cp_aboutussubcategoriesid ?? '').trim()
            if (!subcategoryId) return
            const subcategoryLabel = subcategory.cp_subcategory?.trim() ?? ''
            if (!subcategoryLabel) return

            const rawRecord = subcategory as unknown as Record<string, unknown>
            const categoryLabelFromLookup = rawRecord['_cp_category_value@OData.Community.Display.V1.FormattedValue']
            const categoryLabel = typeof categoryLabelFromLookup === 'string' && categoryLabelFromLookup.trim()
              ? categoryLabelFromLookup.trim()
              : subcategoryMetaById.get(subcategoryId)?.categoryLabel ?? ''
            if (!categoryLabel) return
            const categoryMeta = subcategoryMetaById.get(subcategoryId)
              ?? categoryMetaByNormalizedLabel.get(normalizeLabelForIdMatch(categoryLabel))
              ?? { categoryLabel, hasSubcategory: true }
            const referenceCategory = getDataverseText(rawRecord, ['_cp_refcategory_value@OData.Community.Display.V1.FormattedValue', 'cp_refcategory', 'cp_REFCategory']).trim()
            const referenceSubcategory = getDataverseText(rawRecord, ['_cp_refsubcategory_value@OData.Community.Display.V1.FormattedValue', 'cp_refsubcategory', 'cp_REFSubCategory']).trim()
            const searchCandidates = [
              subcategoryLabel,
              categoryMeta.categoryLabel,
              subcategory.cp_resourcename?.trim() ?? '',
              referenceCategory,
              referenceSubcategory,
              subcategory.cp_teammail?.trim() ?? '',
              ...(contentBySubcategory.get(subcategoryId) ?? []),
              ...(subcategory.cp_showcontactteam === true ? (contactsBySubcategory.get(subcategoryId) ?? []) : []),
            ].filter((value) => value.length > 0)

            const firstMatch = searchCandidates.find((candidate) => candidate.toLowerCase().includes(queryValue))
            if (!firstMatch) return

            const path = categoryMeta.hasSubcategory
              ? `About Us / ${categoryMeta.categoryLabel} / ${subcategoryLabel}`
              : `About Us / ${categoryMeta.categoryLabel} /`
            searchResults.push({
              id: subcategoryId,
              categoryLabel: categoryMeta.categoryLabel,
              subcategoryLabel,
              subcategoryId,
              hasSubcategory: categoryMeta.hasSubcategory,
              path,
              title: subcategoryLabel,
              description: truncateSearchPreview(firstMatch),
            })
          })

        aboutNavigation
          .filter((item) => item.isActive === true && item.hasSubcategory !== true)
          .forEach((item) => {
            const categoryLabel = item.label.trim()
            if (!categoryLabel.toLowerCase().includes(queryValue)) return
            const path = `About Us / ${categoryLabel} /`
            searchResults.push({
              id: `category-${normalizeLabelForIdMatch(categoryLabel)}`,
              categoryLabel,
              hasSubcategory: false,
              path,
              title: categoryLabel,
              description: truncateSearchPreview(categoryLabel),
            })
          })

        if (isMounted) {
          setAboutSearchResults(searchResults)
          setAboutSearchError('')
        }
      } catch (error) {
        if (isMounted) {
          setAboutSearchResults([])
          setAboutSearchError(getDataErrorMessage(error, 'Search results could not be loaded.'))
        }
      } finally {
        if (isMounted) setIsSearchingAbout(false)
      }
    }
    void runAboutSearch()
    return () => { isMounted = false }
  }, [aboutNavigation, normalizedSubmittedQuery])
  const selectAboutChild = async (child: AboutNavigationChild): Promise<AboutChildDetails | null> => {
    if (!child.id) return null
    leaveAboutSubpage(true)
    setActiveNavChildId(child.id)
    const requestId = ++childDetailsRequestId.current
    setActiveItem(child.label)
    setActiveChildId(child.id)
    setActiveChildDetails(null)
    setActiveChildContacts([])
    setActiveChildContent([])
    setChildContactsError('')
    setChildContentError('')
    setIsLoadingChildDetails(true)
    setChildDetailsError('')
    try {
      const result = await Cp_aboutussubcategoriesesService.get(child.id)
      if (requestId !== childDetailsRequestId.current) return null
      if (!result.success) throw result.error ?? new Error('The selected section details could not be loaded.')
      const subcategoryRecord = result.data
      const subcategoryRecordData = subcategoryRecord as unknown as Record<string, unknown>
      const resourceCategory = getDataverseText(subcategoryRecordData, ['_cp_refcategory_value@OData.Community.Display.V1.FormattedValue', 'cp_refcategory', 'cp_REFCategory']).trim()
      const resourceSubcategory = getDataverseText(subcategoryRecordData, ['_cp_refsubcategory_value@OData.Community.Display.V1.FormattedValue', 'cp_refsubcategory', 'cp_REFSubCategory']).trim()
      const resourceName = getDataverseText(subcategoryRecordData, ['cp_resourcename']).trim()
      const teamMail = getDataverseText(subcategoryRecordData, ['cp_teammail'])
      const details: AboutChildDetails = {
        ca_about_us_childid: child.id,
        ca_childdisplayname: subcategoryRecord.cp_subcategory?.trim() || child.label,
        ca_id: subcategoryRecord.cp_subcategory?.trim() || child.label,
        ca_resourcename: resourceName,
        ca_refcategory: resourceCategory,
        ca_refsubcategory: resourceSubcategory,
        ca_showresources: Boolean(resourceName || resourceCategory || resourceSubcategory),
        ca_resourcepath: resourceCategory && resourceSubcategory ? `/references/${encodeURIComponent(resourceCategory)}/${encodeURIComponent(resourceSubcategory)}` : '',
        ca_showcontactteam: subcategoryRecord.cp_showcontactteam === true,
        ca_teammail: teamMail,
        ca_showteammailbox: Boolean(teamMail.trim()),
      }
      setActiveChildDetails(details)
      setIsLoadingChildDetails(details.ca_showcontactteam === true)
      return details
    } catch (error) {
      if (requestId !== childDetailsRequestId.current) return null
      setChildDetailsError(`Details for ${child.label} could not be loaded: ${getDataErrorMessage(error, 'Dataverse returned an unknown error.')}`)
      setIsLoadingChildDetails(false)
      return null
    }
  }
  const openAboutSearchResult = async (result: AboutSearchResult) => {
    if (result.hasSubcategory && result.subcategoryId) {
      const targetChild = aboutNavigation
        .flatMap((item) => item.childItems ?? [])
        .find((child) => child.id === result.subcategoryId)
      if (targetChild?.id) {
        await selectAboutChild(targetChild)
      }
    } else {
      leaveAboutSubpage(true)
      setActiveItem(result.categoryLabel)
    }
    clearAboutSearch()
  }
  const startManagingChildDetails = async (selectedChildDetails = activeChildDetails, selectedSubcategoryId = activeNavChildId) => {
    if (!selectedChildDetails || !selectedSubcategoryId) return
    const selectedSubcategoryLabel = selectedChildDetails.ca_childdisplayname?.trim() || getSelectedSubcategoryLabel()
    if (!selectedSubcategoryLabel) {
      setChildDetailsSaveError('The sub category could not be identified.')
      return
    }
    setDraftChildDetails({
      ca_childdisplayname: selectedChildDetails.ca_childdisplayname ?? '',
      ca_resourcename: selectedChildDetails.ca_resourcename ?? '',
      ca_refcategory: selectedChildDetails.ca_refcategory ?? '',
      ca_refsubcategory: selectedChildDetails.ca_refsubcategory ?? '',
      ca_resourcepath: selectedChildDetails.ca_resourcepath ?? '',
      ca_showresources: selectedChildDetails.ca_showresources === true,
      ca_showcontactteam: selectedChildDetails.ca_showcontactteam === true,
      ca_showteammailbox: selectedChildDetails.ca_showteammailbox === true,
      ca_teammail: selectedChildDetails.ca_teammail ?? '',
    })
    const initialContacts = activeChildContacts.map((contact) => ({
      id: contact.ca_about_us_contact_teamid,
      memberId: contact.ca_member_id,
      name: contact.ca_name,
      designation: contact.ca_designation ?? '',
      role: contact.ca_role ?? '',
    }))
    const existingContentDraft: AboutChildContentDraft[] = sortChildContent(activeChildContent).map((record) => ({
      id: record.ca_about_us_child_imagestextid,
      recordId: record.ca_about_us_child_imagestextid,
      type: normalizeAboutContentType(record.ca_type),
      caption: record.ca_caption ?? '',
      text: record.ca_text ?? '',
      imageUrl: record.ca_imagesource_url,
    }))
    setOriginalChildContacts(initialContacts)
    setDraftChildContacts(initialContacts)
    setRemovedChildContactIds([])
    setOriginalChildContent(existingContentDraft)
    setDraftChildContent(existingContentDraft)
    setRemovedChildContentIds([])
    setChildDetailsSaveError('')
    setIsLoadingChildEditor(true)
    setIsManagingChildDetails(true)
    isManagingChildDetailsPinned.current = true
    if (memberDirectoryCache.current) {
      setAvailableChildContacts(memberDirectoryCache.current)
    } else if (availableChildContacts.length === 0) {
      void ensureMemberDirectoryLoaded().catch((error: unknown) => {
        setChildDetailsSaveError(`Member directory could not be loaded: ${getDataErrorMessage(error, 'Dataverse returned an unknown error.')}`)
      })
    }
    try {
      const shouldFetchContentForEditor = existingContentDraft.length === 0
      const shouldFetchContactsForEditor = initialContacts.length === 0 && selectedChildDetails.ca_showcontactteam === true
      const [subcategoryResult, categoryOptionsResult, subcategoryOptionsResult, contentResult, contactsResult] = await Promise.all([
        Cp_aboutussubcategoriesesService.get(selectedSubcategoryId, {
          select: ['cp_aboutussubcategoriesid', 'cp_subcategory', 'cp_resourcename', '_cp_refcategory_value', '_cp_refsubcategory_value', 'cp_showcontactteam', 'cp_teammail', 'statecode'],
        }),
        Cp_refcategoriesesService.getAll({
          select: ['cp_refcategoriesid', 'cp_category', 'cp_sortorder', 'statecode'],
          orderBy: ['cp_sortorder asc'],
        }),
        Cp_refsubcategoriesesService.getAll({
          select: ['cp_refsubcategoriesid', 'cp_subcategory', '_cp_category_value', 'cp_sortorder', 'statecode'],
          orderBy: ['cp_sortorder asc'],
        }),
        shouldFetchContentForEditor ? Cp_aboutustextimaegeblocksesService.getAll({
          select: ['cp_aboutustextimaegeblocksid', '_cp_aboutussubcategory_value', 'cp_type', 'cp_imagecaption', 'cp_text', 'cp_imagesource_url', 'cp_sortorder', 'statecode'],
          filter: `_cp_aboutussubcategory_value eq ${selectedSubcategoryId} and statecode eq 0`,
          orderBy: ['cp_sortorder asc'],
        }) : Promise.resolve(null),
        shouldFetchContactsForEditor ? Cp_aboutuscontactteamdetailsesService.getAll({
          select: ['cp_aboutuscontactteamdetailsid', '_cp_aboutussubcategory_value', '_cp_membername_value', 'cp_designation', 'cp_role', 'cp_sortorder', 'statecode'],
          filter: `statecode eq 0 and _cp_aboutussubcategory_value eq ${selectedSubcategoryId}`,
          orderBy: ['cp_sortorder asc'],
        }) : Promise.resolve(null),
      ])
      if (!subcategoryResult.success) throw new Error(getDataErrorMessage(subcategoryResult.error, 'Sub category resource values could not be loaded.'))
      if (!categoryOptionsResult.success) throw new Error(getDataErrorMessage(categoryOptionsResult.error, 'Resource category options could not be loaded.'))
      if (!subcategoryOptionsResult.success) throw new Error(getDataErrorMessage(subcategoryOptionsResult.error, 'Resource sub category options could not be loaded.'))
      const subcategoryRecord = subcategoryResult.data
      const subcategoryRecordData = subcategoryRecord as unknown as Record<string, unknown>
      const resourceCategory = selectedChildDetails.ca_refcategory?.trim() ?? getDataverseText(subcategoryRecordData, ['_cp_refcategory_value@OData.Community.Display.V1.FormattedValue', 'cp_refcategory', 'cp_REFCategory']).trim()
      const resourceSubcategory = selectedChildDetails.ca_refsubcategory?.trim() ?? getDataverseText(subcategoryRecordData, ['_cp_refsubcategory_value@OData.Community.Display.V1.FormattedValue', 'cp_refsubcategory', 'cp_REFSubCategory']).trim()
      const resourceName = getDataverseText(subcategoryRecordData, ['cp_resourcename']).trim() || selectedChildDetails.ca_resourcename?.trim() || ''
      const showContactTeam = subcategoryRecord.cp_showcontactteam === true
      const teamMail = getDataverseText(subcategoryRecordData, ['cp_teammail'])
      const showResources = Boolean(resourceName || resourceCategory || resourceSubcategory)
      const resourcePath = showResources ? `/references/${encodeURIComponent(resourceCategory)}/${encodeURIComponent(resourceSubcategory)}` : ''
      setActiveChildDetails((details) => details
        ? {
          ...details,
          ca_resourcename: resourceName,
          ca_refcategory: resourceCategory,
          ca_refsubcategory: resourceSubcategory,
          ca_showresources: showResources,
          ca_showcontactteam: showContactTeam,
          ca_showteammailbox: Boolean(teamMail.trim()),
          ca_teammail: teamMail,
          ca_resourcepath: resourcePath,
        }
        : details)
      setDraftChildDetails({
        ca_childdisplayname: selectedChildDetails.ca_childdisplayname ?? '',
        ca_resourcename: resourceName,
        ca_refcategory: resourceCategory,
        ca_refsubcategory: resourceSubcategory,
        ca_showresources: showResources,
        ca_resourcepath: resourcePath,
        ca_showcontactteam: showContactTeam,
        ca_showteammailbox: Boolean(teamMail.trim()),
        ca_teammail: teamMail,
      })
      const categoryNameToId: Record<string, string> = {}
      const categoryNameKeyToId: Record<string, string> = {}
      const orderedCategoryNames: string[] = []
      const allCategories = categoryOptionsResult.data
      const activeCategories = allCategories.filter((item) => item.statecode === 0)
      const categoriesForOptions = activeCategories.length > 0 ? activeCategories : allCategories
      categoriesForOptions.forEach((item) => {
          const categoryName = item.cp_category?.trim() ?? ''
          const categoryId = item.cp_refcategoriesid?.trim() ?? ''
          const normalizedCategoryName = categoryName.toLowerCase()
          if (!categoryName || !categoryId || categoryNameKeyToId[normalizedCategoryName]) return
          categoryNameToId[categoryName] = categoryId
          categoryNameKeyToId[normalizedCategoryName] = categoryId
          orderedCategoryNames.push(categoryName)
      })
      const subcategoryOptionsByCategoryId: Record<string, string[]> = {}
      const subcategoryNameSetsByCategoryId: Record<string, Set<string>> = {}
      const subcategoryOptionsByCategoryName: Record<string, string[]> = {}
      const subcategoryNameSetsByCategoryName: Record<string, Set<string>> = {}
      const subcategoryIdByCategoryAndName: Record<string, string> = {}
      const allRefSubcategories = subcategoryOptionsResult.data
      const activeRefSubcategories = allRefSubcategories.filter((item) => item.statecode === 0)
      const refSubcategoriesForOptions = activeRefSubcategories.length > 0 ? activeRefSubcategories : allRefSubcategories
      refSubcategoriesForOptions.forEach((item) => {
          const categoryId = item._cp_category_value?.trim() ?? ''
          const subcategoryId = item.cp_refsubcategoriesid?.trim() ?? ''
          const subcategoryName = item.cp_subcategory?.trim() ?? ''
          if (!categoryId || !subcategoryName) return
          if (!subcategoryOptionsByCategoryId[categoryId]) {
            subcategoryOptionsByCategoryId[categoryId] = []
            subcategoryNameSetsByCategoryId[categoryId] = new Set()
          }
          const normalizedSubcategoryName = subcategoryName.toLowerCase()
          if (subcategoryNameSetsByCategoryId[categoryId].has(normalizedSubcategoryName)) return
          subcategoryNameSetsByCategoryId[categoryId].add(normalizedSubcategoryName)
          subcategoryOptionsByCategoryId[categoryId].push(subcategoryName)
          if (subcategoryId) {
            subcategoryIdByCategoryAndName[`${categoryId.toLowerCase()}|${normalizedSubcategoryName}`] = subcategoryId
          }
          const categoryName = categoriesForOptions.find((category) => category.cp_refcategoriesid === categoryId)?.cp_category?.trim() ?? ''
          const normalizedCategoryName = categoryName.toLowerCase()
          if (!normalizedCategoryName) return
          if (!subcategoryOptionsByCategoryName[normalizedCategoryName]) {
            subcategoryOptionsByCategoryName[normalizedCategoryName] = []
            subcategoryNameSetsByCategoryName[normalizedCategoryName] = new Set()
          }
          if (subcategoryNameSetsByCategoryName[normalizedCategoryName].has(normalizedSubcategoryName)) return
          subcategoryNameSetsByCategoryName[normalizedCategoryName].add(normalizedSubcategoryName)
          subcategoryOptionsByCategoryName[normalizedCategoryName].push(subcategoryName)
      })
      const selectedCategoryId = categoryNameKeyToId[resourceCategory.toLowerCase()] ?? ''
      const normalizedSelectedCategoryName = resourceCategory.toLowerCase()
      const filteredSubcategoryOptions = selectedCategoryId
        ? [...(subcategoryOptionsByCategoryId[selectedCategoryId] ?? [])]
        : [...(subcategoryOptionsByCategoryName[normalizedSelectedCategoryName] ?? [])]
      if (resourceSubcategory && !filteredSubcategoryOptions.some((value) => value.toLowerCase() === resourceSubcategory.toLowerCase())) {
        filteredSubcategoryOptions.unshift(resourceSubcategory)
      }
      if (resourceCategory && !orderedCategoryNames.some((value) => value.toLowerCase() === resourceCategory.toLowerCase())) {
        orderedCategoryNames.unshift(resourceCategory)
      }
      setResourceCategoryNameToId(categoryNameToId)
      setResourceSubcategoryOptionsByCategoryId(subcategoryOptionsByCategoryId)
      setResourceSubcategoryOptionsByCategoryName(subcategoryOptionsByCategoryName)
      setResourceSubcategoryIdByCategoryAndName(subcategoryIdByCategoryAndName)
      setResourceCategoryOptions(orderedCategoryNames)
      setResourceSubcategoryOptions(filteredSubcategoryOptions)
      if (contentResult) {
        if (!contentResult.success) throw contentResult.error ?? new Error('Child images and text could not be loaded.')
        const initialContent: AboutChildContentDraft[] = contentResult.data
          .filter((record) => record.statecode !== 1)
          .map((record) => ({
            id: record.cp_aboutustextimaegeblocksid ?? undefined,
            recordId: record.cp_aboutustextimaegeblocksid ?? '',
            type: normalizeAboutContentType(record.cp_type),
            caption: record.cp_imagecaption ?? '',
            text: record.cp_text ?? '',
            imageUrl: record.cp_imagesource_url ?? undefined,
          }))
          .filter((record) => Boolean(record.recordId))
        setOriginalChildContent(initialContent)
        setDraftChildContent(initialContent)
      }
      if (contactsResult) {
        if (!contactsResult.success) throw new Error(getDataErrorMessage(contactsResult.error, 'Contact the Team records could not be loaded.'))
        await hydrateDraftContacts(contactsResult.data)
      } else if (showContactTeam && initialContacts.length === 0) {
        await loadDraftContactsForSubcategory(selectedSubcategoryId)
      }
    } catch (error) {
      setChildDetailsSaveError(getDataErrorMessage(error, 'Child content could not be loaded.'))
    } finally {
      setIsLoadingChildEditor(false)
    }
  }
  const manageAboutChild = async (child: AboutNavigationChild) => {
    if (!child.id) return
    const details = await selectAboutChild(child)
    if (details) await startManagingChildDetails(details, child.id)
  }
  const hydrateDraftContacts = async (contactsData: Awaited<ReturnType<typeof Cp_aboutuscontactteamdetailsesService.getAll>>['data']) => {
    const memberNamesById = await resolveSystemUserNamesById(contactsData.map((contact) => contact._cp_membername_value ?? ''))
    const matchingContacts: AboutChildContactRecord[] = contactsData
      .filter((contact) => contact.statecode !== 1 && contact._cp_membername_value)
      .map((contact) => ({
        ca_about_us_contact_teamid: contact.cp_aboutuscontactteamdetailsid ?? '',
        ca_member_id: contact._cp_membername_value ?? '',
        ca_name: memberNamesById.get((contact._cp_membername_value ?? '').toLowerCase()) ?? '',
        ca_designation: contact.cp_designation ?? '',
        ca_role: contact.cp_role ?? '',
        ca_sortorder: contact.cp_sortorder ?? 0,
        ca_status: contact.statecode !== 1,
      }))
      .filter((contact) => contact.ca_about_us_contact_teamid && contact.ca_name.trim().length > 0)
    setActiveChildContacts(matchingContacts)
    const loadedContacts = matchingContacts.map((contact) => ({
      id: contact.ca_about_us_contact_teamid,
      memberId: contact.ca_member_id,
      name: contact.ca_name,
      designation: contact.ca_designation ?? '',
      role: contact.ca_role ?? '',
    }))
    setOriginalChildContacts(loadedContacts)
    setDraftChildContacts(loadedContacts)
  }
  const loadDraftContactsForSubcategory = async (selectedSubcategoryId: string) => {
    const contactsResult = await Cp_aboutuscontactteamdetailsesService.getAll({
      select: ['cp_aboutuscontactteamdetailsid', '_cp_aboutussubcategory_value', '_cp_membername_value', 'cp_designation', 'cp_role', 'cp_sortorder', 'statecode'],
      filter: `statecode eq 0 and _cp_aboutussubcategory_value eq ${selectedSubcategoryId}`,
      orderBy: ['cp_sortorder asc'],
    })
    if (!contactsResult.success) {
      throw new Error(getDataErrorMessage(contactsResult.error, 'Contact the Team records could not be loaded.'))
    }
    await hydrateDraftContacts(contactsResult.data)
  }
  const updateDraftChildDetails = (key: keyof AboutChildEditDraft, value: string | boolean) => {
    if (key === 'ca_refcategory' && typeof value === 'string') {
      const normalizedSelectedCategory = value.trim().toLowerCase()
      const selectedCategoryId = Object.entries(resourceCategoryNameToId).find(([categoryName]) => categoryName.toLowerCase() === normalizedSelectedCategory)?.[1] ?? ''
      const nextSubcategoryOptions = selectedCategoryId
        ? [...(resourceSubcategoryOptionsByCategoryId[selectedCategoryId] ?? [])]
        : [...(resourceSubcategoryOptionsByCategoryName[normalizedSelectedCategory] ?? [])]
      setResourceSubcategoryOptions(nextSubcategoryOptions)
      setDraftChildDetails((draft) => {
        if (!draft) return draft
        const shouldResetSubcategory = Boolean(
          draft.ca_refsubcategory &&
          !nextSubcategoryOptions.some((subcategoryName) => subcategoryName.toLowerCase() === draft.ca_refsubcategory?.trim().toLowerCase()),
        )
        return {
          ...draft,
          ca_refcategory: value,
          ca_refsubcategory: shouldResetSubcategory ? '' : draft.ca_refsubcategory,
        }
      })
      setChildDetailsSaveError('')
      return
    }
    if (key === 'ca_showcontactteam' && value === true && activeNavChildId && draftChildContacts.length === 0) {
      setIsLoadingChildEditor(true)
      void loadDraftContactsForSubcategory(activeNavChildId)
        .catch((error) => {
          setChildDetailsSaveError(getDataErrorMessage(error, 'Contact the Team records could not be loaded.'))
        })
        .finally(() => {
          setIsLoadingChildEditor(false)
        })
    }
    setDraftChildDetails((draft) => draft ? { ...draft, [key]: value } : draft)
    setChildDetailsSaveError('')
  }
  const hasChildDetailsChanges = () => {
    const originalDetails = activeChildDetails
    const currentDetails = draftChildDetails
    const detailsChanged = Boolean(originalDetails && currentDetails && (
      currentDetails.ca_childdisplayname !== (originalDetails.ca_childdisplayname ?? '') ||
      (currentDetails.ca_resourcepath ?? '') !== (originalDetails.ca_resourcepath ?? '') ||
      (currentDetails.ca_resourcename ?? '') !== (originalDetails.ca_resourcename ?? '') ||
      (currentDetails.ca_refcategory ?? '') !== (originalDetails.ca_refcategory ?? '') ||
      (currentDetails.ca_refsubcategory ?? '') !== (originalDetails.ca_refsubcategory ?? '') ||
      (currentDetails.ca_showresources === true) !== (originalDetails.ca_showresources === true) ||
      (currentDetails.ca_showcontactteam === true) !== (originalDetails.ca_showcontactteam === true) ||
      (currentDetails.ca_showteammailbox === true) !== (originalDetails.ca_showteammailbox === true) ||
      (currentDetails.ca_teammail ?? '') !== (originalDetails.ca_teammail ?? '')
    ))
    const contactsChanged = JSON.stringify(draftChildContacts.map(({ id, memberId, name, designation, role }) => ({ id, memberId, name, designation, role }))) !==
      JSON.stringify(originalChildContacts.map(({ id, memberId, name, designation, role }) => ({ id, memberId, name, designation, role })))
    const contentChanged = JSON.stringify(draftChildContent.map(({ id, recordId, type, caption, text, file }) => ({ id, recordId, type, caption, text, hasFile: Boolean(file) }))) !==
      JSON.stringify(originalChildContent.map(({ id, recordId, type, caption, text }) => ({ id, recordId, type, caption, text, hasFile: false })))
    return detailsChanged || contactsChanged || contentChanged || removedChildContactIds.length > 0 || removedChildContentIds.length > 0
  }
  const cancelManagingChildDetails = () => {
    const hadChanges = hasChildDetailsChanges()
    setChildDetailsSaveError('')
    if (!hadChanges) {
      isManagingChildDetailsPinned.current = false
      clearDraftPreviewUrls(draftChildContent)
      setDraftChildDetails(null)
      setDraftChildContacts([])
      setDraftChildContent([])
      setRemovedChildContactIds([])
      setRemovedChildContentIds([])
      setIsManagingChildDetails(false)
      return
    }
    setChildDetailsConfirmationTitle('Changes discarded')
    setChildDetailsSavedMessage('Your unsaved changes were discarded.')
  }
  const updateDraftChildContact = (index: number, key: keyof Omit<AboutChildContactDraft, 'id'>, value: string) => {
    setDraftChildContacts((contacts) => contacts.map((contact, contactIndex) => contactIndex === index ? { ...contact, [key]: value } : contact))
  }
  const addDraftChildContact = (name: string, designation: string, role: string, memberId: string) => {
    setDraftChildContacts((contacts) => [...contacts, { name, designation, role, memberId }])
  }
  const removeDraftChildContact = (index: number) => {
    const removed = draftChildContacts[index]
    if (removed?.id) setRemovedChildContactIds((ids) => [...ids, removed.id as string])
    setDraftChildContacts((contacts) => contacts.filter((_, contactIndex) => contactIndex !== index))
  }
  const requestDraftChildContactRemoval = (index: number) => {
    const contact = draftChildContacts[index]
    if (contact) setPendingContactDelete({ index, name: contact.name })
  }
  const moveDraftChildContact = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= draftChildContacts.length) return
    setDraftChildContacts((contacts) => {
      const reordered = [...contacts]
      ;[reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]]
      return reordered
    })
  }
  const getDraftContentBlockCount = (items: AboutChildContentDraft[], type: 1 | 2) => items.filter((content) => normalizeAboutContentType(content.type) === type).length
  const getEffectiveDraftContentMaxLimit = (type: 1 | 2, limits: AboutTextImageBlockLimits) => {
    const configuredLimit = type === 1 ? limits.maxImageBlocks : limits.maxTextBlocks
    if (typeof configuredLimit === 'number' && configuredLimit > 0) return configuredLimit
    return type === 1 ? defaultMaxImageBlocks : defaultMaxTextBlocks
  }
  const getDraftContentMaxLimitError = (type: 1 | 2, limit: number) => (
    type === 1
      ? `Reached Max image blocks. max limit is ${limit}`
      : `Reached Max text blocks. max limit is ${limit}`
  )
  const addDraftChildContent = async (type: 1 | 2) => {
    const textImageBlockLimits = await ensureTextImageBlockLimits()
    const maxBlockLimit = getEffectiveDraftContentMaxLimit(type, textImageBlockLimits)
    const recordId = createDraftRecordId()
    let limitError = ''
    setDraftChildContent((items) => {
      const currentBlockCount = getDraftContentBlockCount(items, type)
      if (currentBlockCount >= maxBlockLimit) {
        limitError = getDraftContentMaxLimitError(type, maxBlockLimit)
        return items
      }
      return [...items, { recordId, type, caption: '', text: '' }]
    })
    if (limitError) {
      setChildDetailsSaveError(limitError)
      return
    }
    setChildDetailsSaveError('')
  }
  const setDraftChildContentFile = async (index: number, file: File) => {
    const fileValidationError = validateAboutImageFile(file)
    if (fileValidationError) {
      setChildDetailsSaveError(fileValidationError)
      return
    }
    try {
      let imageUrl = ''
      if (typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function') {
        imageUrl = URL.createObjectURL(file)
        localDraftPreviewUrls.current.add(imageUrl)
      } else {
        imageUrl = await readBlobAsDataUrl(file)
      }
      setDraftChildContent((items) => items.map((item, itemIndex) => {
        if (itemIndex !== index) return item
        revokeDraftPreviewUrl(item.imageUrl)
        return { ...item, file, imageUrl }
      }))
      setChildDetailsSaveError('')
    } catch {
      setChildDetailsSaveError('The image preview could not be loaded.')
    }
  }
  const updateDraftChildContent = (index: number, key: 'caption' | 'text', value: string) => {
    setDraftChildContent((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item))
    setChildDetailsSaveError('')
  }
  const removeDraftChildContent = (index: number) => {
    const removed = draftChildContent[index]
    setChildDetailsSaveError('')
    if (removed?.id) setRemovedChildContentIds((ids) => [...ids, removed.id as string])
    revokeDraftPreviewUrl(removed?.imageUrl)
    setDraftChildContent((items) => items.filter((_, itemIndex) => itemIndex !== index))
  }
  const moveDraftChildContent = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= draftChildContent.length) return
    setChildDetailsSaveError('')
    setDraftChildContent((items) => {
      const reordered = [...items]
      ;[reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]]
      return reordered
    })
  }
  const saveChildDetails = async () => {
    if (!draftChildDetails || !hasChildDetailsChanges()) return
    const currentSubcategoryLabel = getSelectedSubcategoryLabel() ?? activeChildDetails?.ca_childdisplayname ?? ''
    if (!currentSubcategoryLabel) {
      setChildDetailsSaveError('The sub category could not be identified.')
      return
    }
    const hasEmptyImageBlock = draftChildContent.some((content) => normalizeAboutContentType(content.type) === 1 && !content.file && !content.imageUrl)
    const hasEmptyTextBlock = draftChildContent.some((content) => {
      if (normalizeAboutContentType(content.type) !== 2) return false
      const plainText = new DOMParser().parseFromString(content.text ?? '', 'text/html').body.textContent?.replace(/\u00a0/g, ' ').trim() ?? ''
      return !plainText
    })
    if (hasEmptyImageBlock && hasEmptyTextBlock) {
      setChildDetailsSaveError('Please fill Text and Image blocks')
      return
    }
    const textImageBlockLimits = await ensureTextImageBlockLimits()
    const maxImageBlocks = getEffectiveDraftContentMaxLimit(1, textImageBlockLimits)
    const maxTextBlocks = getEffectiveDraftContentMaxLimit(2, textImageBlockLimits)
    const imageBlockCount = getDraftContentBlockCount(draftChildContent, 1)
    const textBlockCount = getDraftContentBlockCount(draftChildContent, 2)
    if (textBlockCount > maxTextBlocks) {
      setChildDetailsSaveError(getDraftContentMaxLimitError(2, maxTextBlocks))
      return
    }
    if (imageBlockCount > maxImageBlocks) {
      setChildDetailsSaveError(getDraftContentMaxLimitError(1, maxImageBlocks))
      return
    }
    const displayName = draftChildDetails.ca_childdisplayname.trim()
    const displayNameValidationError = validateAboutTextInput(displayName, 'Display name')
    if (displayNameValidationError) {
      setChildDetailsSaveError(displayNameValidationError)
      return
    }
    const currentParent = aboutNavigation.find((item) =>
      (item.childItems ?? []).some((child) => child.id === activeNavChildId && child.isActive === true))
    const hasDuplicateInSameCategory = (currentParent?.childItems ?? []).some((child) =>
      child.id !== activeNavChildId &&
      child.isActive === true &&
      child.label.trim().toLowerCase() === displayName.toLowerCase(),
    )
    if (hasDuplicateInSameCategory) {
      setChildDetailsSaveError('The name already exist. Please give another name')
      return
    }
    if (draftChildDetails.ca_showcontactteam === true && draftChildContacts.length === 0) {
      setChildDetailsSaveError('Add atleast one contact member record')
      return
    }
    if (draftChildDetails.ca_showteammailbox === true && !draftChildDetails.ca_teammail?.trim()) {
      setChildDetailsSaveError('Please add Team Mail')
      return
    }
    if (draftChildDetails.ca_showteammailbox === true && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draftChildDetails.ca_teammail?.trim() ?? '')) {
      setChildDetailsSaveError('Please give valid Team Mail')
      return
    }
    if (hasEmptyImageBlock) {
      setChildDetailsSaveError('Please upload valid Image')
      return
    }
    if (draftChildContent.some((content) => normalizeAboutContentType(content.type) === 1 && content.caption.length > 100)) {
      setChildDetailsSaveError('Image captions must be 100 characters or fewer.')
      return
    }
    if (hasEmptyTextBlock) {
      setChildDetailsSaveError('give text for each text block before saving')
      return
    }
    if (draftChildDetails.ca_showresources === true && !draftChildDetails.ca_resourcename?.trim()) {
      setChildDetailsSaveError('Please fill Resource Name')
      return
    }
    if (draftChildDetails.ca_showresources === true) {
      const resourceNameValidationError = validateAboutTextInput(draftChildDetails.ca_resourcename?.trim() ?? '', 'Resource name')
      if (resourceNameValidationError) {
        setChildDetailsSaveError(resourceNameValidationError)
        return
      }
    }
    if (draftChildDetails.ca_showresources === true) {
      const resourceCategoryValidationError = validateAboutTextInput(draftChildDetails.ca_refcategory?.trim() ?? '', 'Category')
      if (resourceCategoryValidationError) {
        setChildDetailsSaveError(resourceCategoryValidationError)
        return
      }
    }
    if (draftChildDetails.ca_showresources === true) {
      const resourceSubcategoryValidationError = validateAboutTextInput(draftChildDetails.ca_refsubcategory?.trim() ?? '', 'SubCategory')
      if (resourceSubcategoryValidationError) {
        setChildDetailsSaveError(resourceSubcategoryValidationError)
        return
      }
    }
    if (draftChildDetails.ca_showresources === true && !draftChildDetails.ca_refcategory?.trim()) {
      setChildDetailsSaveError('Please fill Category')
      return
    }
    if (draftChildDetails.ca_showresources === true && !draftChildDetails.ca_refsubcategory?.trim()) {
      setChildDetailsSaveError('Please fill SubCategory')
      return
    }
    if (draftChildContent.some((content) => normalizeAboutContentType(content.type) === 2 && content.text.length > 4000)) {
      setChildDetailsSaveError('Text blocks must be 4000 characters or fewer.')
      return
    }
    const overLimitFields: Array<[string, string | undefined, string | undefined]> = [
      ['Resource name', draftChildDetails.ca_resourcename, activeChildDetails?.ca_resourcename],
      ['Category', draftChildDetails.ca_refcategory, activeChildDetails?.ca_refcategory],
      ['SubCategory', draftChildDetails.ca_refsubcategory, activeChildDetails?.ca_refsubcategory],
      ['Team email', draftChildDetails.ca_teammail, activeChildDetails?.ca_teammail],
    ]
    const invalidField = overLimitFields.find(([_, value, original]) => value !== (original ?? '') && (value?.length ?? 0) > 100)
    if (displayName.length > 100) {
      setChildDetailsSaveError('Display name must be 100 characters or fewer.')
      return
    }
    if (invalidField) {
      setChildDetailsSaveError(`${invalidField[0]} must be 100 characters or fewer.`)
      return
    }
    if (draftChildContacts.some((contact) => contact.designation.length > 100)) {
      setChildDetailsSaveError('Contact designations must be 100 characters or fewer.')
      return
    }

    setIsSavingChildDetails(true)
    setChildDetailsSaveError('')
    try {
      const normalizedResourceName = draftChildDetails.ca_showresources ? (draftChildDetails.ca_resourcename ?? '').trim() : ''
      const normalizedRefCategory = draftChildDetails.ca_showresources ? (draftChildDetails.ca_refcategory ?? '').trim() : ''
      const normalizedRefSubcategory = draftChildDetails.ca_showresources ? (draftChildDetails.ca_refsubcategory ?? '').trim() : ''
      const selectedCategoryId = normalizedRefCategory
        ? Object.entries(resourceCategoryNameToId).find(([name]) => name.toLowerCase() === normalizedRefCategory.toLowerCase())?.[1] ?? ''
        : ''
      const selectedSubcategoryId = selectedCategoryId && normalizedRefSubcategory
        ? resourceSubcategoryIdByCategoryAndName[`${selectedCategoryId.toLowerCase()}|${normalizedRefSubcategory.toLowerCase()}`] ?? ''
        : ''
      if (draftChildDetails.ca_showresources && !selectedCategoryId) {
        setChildDetailsSaveError('Please select a valid Category from the dropdown.')
        return
      }
      if (draftChildDetails.ca_showresources && !selectedSubcategoryId) {
        setChildDetailsSaveError('Please select a valid SubCategory from the dropdown.')
        return
      }

      if (activeNavChildId) {
        const subcategoryUpdatePayload: Record<string, unknown> = {
          cp_subcategory: displayName,
          cp_resourcename: draftChildDetails.ca_showresources ? normalizedResourceName : null,
          cp_showcontactteam: draftChildDetails.ca_showcontactteam === true,
          cp_teammail: draftChildDetails.ca_showteammailbox && draftChildDetails.ca_teammail?.trim() ? draftChildDetails.ca_teammail.trim() : null,
        }
        if (draftChildDetails.ca_showresources) {
          subcategoryUpdatePayload['cp_REFCategory@odata.bind'] = `/cp_refcategorieses(${selectedCategoryId})`
          subcategoryUpdatePayload['cp_REFSubCategory@odata.bind'] = `/cp_refsubcategorieses(${selectedSubcategoryId})`
        } else {
          subcategoryUpdatePayload['cp_REFCategory@odata.bind'] = null
          subcategoryUpdatePayload['cp_REFSubCategory@odata.bind'] = null
        }
        const subcategoryUpdateResult = await Cp_aboutussubcategoriesesService.update(activeNavChildId, subcategoryUpdatePayload as unknown as Cp_aboutussubcategoriesesBase)
        if (!subcategoryUpdateResult.success) throw new Error(`Updating sub category name failed: ${getDataErrorMessage(subcategoryUpdateResult.error, 'Dataverse did not provide an error detail.')}`)
      }

      const removedContactResults = await Promise.all(removedChildContactIds.map(async (id) => {
        const removedResult = await Cp_aboutuscontactteamdetailsesService.update(id, { statecode: 1 })
        if (!removedResult.success) throw new Error(`Removing contact ${id} failed: ${getDataErrorMessage(removedResult.error, 'Dataverse did not provide an error detail.')}`)
        return removedResult
      }))
      void removedContactResults
      const subcategoryBindPath = activeNavChildId ? `/cp_aboutussubcategorieses(${activeNavChildId})` : null
      if (!subcategoryBindPath) throw new Error('The sub category reference could not be identified.')
      await Promise.all(draftChildContacts.map(async (contact, index) => {
        const memberId = contact.memberId?.trim()
        if (!memberId) throw new Error(`Contact "${contact.name}" is missing member lookup selection.`)
        const values = {
          cp_designation: contact.designation.trim(),
          cp_role: contact.role,
          cp_sortorder: index + 1,
        }
        const contactResult = contact.id
          ? await Cp_aboutuscontactteamdetailsesService.update(contact.id, values)
          : await (async () => {
            const createResult = await Cp_aboutuscontactteamdetailsesService.create({
              ...values,
              statecode: 0,
              'cp_AboutUsSubCategory@odata.bind': subcategoryBindPath,
              'cp_MemberName@odata.bind': `/systemusers(${memberId})`,
            } as unknown as Record<string, unknown>)
            return createResult
          })()
        if (!contactResult.success) throw new Error(`Saving contact "${contact.name}" failed: ${getDataErrorMessage(contactResult.error, 'Dataverse did not provide an error detail.')}`)
      }))

      await Promise.all(removedChildContentIds.map(async (id) => {
        const removedResult = await Cp_aboutustextimaegeblocksesService.update(id, { statecode: 1 })
        if (!removedResult.success) throw new Error(`Removing content item ${id} failed: ${getDataErrorMessage(removedResult.error, 'Dataverse did not provide an error detail.')}`)
      }))
      await Promise.all(draftChildContent.map(async (content, index) => {
        const contentType = normalizeAboutContentType(content.type)
        const commonValues = {
          cp_type: contentType,
          cp_sortorder: index + 1,
        }
        const contentValues = contentType === 1
          ? { ...commonValues, cp_imagecaption: content.caption, cp_text: undefined }
          : { ...commonValues, cp_text: content.text, cp_imagecaption: undefined }
        if (content.id) {
          const contentResult = await Cp_aboutustextimaegeblocksesService.update(content.id, contentValues)
          if (!contentResult.success) throw new Error(`Updating content item ${index + 1} failed: ${getDataErrorMessage(contentResult.error, 'Dataverse did not provide an error detail.')}`)
          if (contentType === 1 && content.file) {
            const uploadResult = await Cp_aboutustextimaegeblocksesService.upload(content.id, 'cp_imagesource', content.file, content.file.name)
            if (!uploadResult.success) throw new Error(`Uploading image ${index + 1} failed: ${getDataErrorMessage(uploadResult.error, 'Dataverse did not provide an error detail.')}`)
          } else if (contentType === 1 && !content.imageUrl) {
            const deleteResult = await Cp_aboutustextimaegeblocksesService.deleteFileOrImage(content.id, 'cp_imagesource')
            if (!deleteResult.success) throw new Error(`Removing image ${index + 1} failed: ${getDataErrorMessage(deleteResult.error, 'Dataverse did not provide an error detail.')}`)
          }
          return
        }
        const contentResult = await Cp_aboutustextimaegeblocksesService.create({
          ...contentValues,
          statecode: 0,
          'cp_AboutUsSubCategory@odata.bind': subcategoryBindPath,
        } as unknown as Record<string, unknown>)
        if (!contentResult.success) throw new Error(`Adding content item ${index + 1} failed: ${getDataErrorMessage(contentResult.error, 'Dataverse did not provide an error detail.')}`)
        if (contentType === 1 && content.file) {
          const newContentId = contentResult.data.cp_aboutustextimaegeblocksid
          if (!newContentId) throw new Error(`Adding content item ${index + 1} succeeded but did not return an id.`)
          const uploadResult = await Cp_aboutustextimaegeblocksesService.upload(newContentId, 'cp_imagesource', content.file, content.file.name)
          if (!uploadResult.success) throw new Error(`Uploading image ${index + 1} failed: ${getDataErrorMessage(uploadResult.error, 'Dataverse did not provide an error detail.')}`)
        }
      }))
      const refreshedNavigation = await loadAboutNavigation()
      const refreshedChild = refreshedNavigation
        .flatMap((item) => item.childItems ?? [])
        .find((child) => child.id === activeNavChildId || child.label.toLowerCase() === displayName.toLowerCase())
      if (!refreshedChild || !activeChildDetails) throw new Error('Child details were saved but could not be refreshed.')
      updateAboutNavigation(refreshedNavigation)
      setActiveChildDetails({
        ...activeChildDetails,
        ...draftChildDetails,
        ca_childdisplayname: displayName,
        ca_resourcename: draftChildDetails.ca_showresources ? (draftChildDetails.ca_resourcename ?? '').trim() : '',
        ca_refcategory: draftChildDetails.ca_showresources ? (draftChildDetails.ca_refcategory ?? '').trim() : '',
        ca_refsubcategory: draftChildDetails.ca_showresources ? (draftChildDetails.ca_refsubcategory ?? '').trim() : '',
        ca_resourcepath: draftChildDetails.ca_showresources
          ? `/references/${encodeURIComponent((draftChildDetails.ca_refcategory ?? '').trim())}/${encodeURIComponent((draftChildDetails.ca_refsubcategory ?? '').trim())}`
          : '',
        ca_showteammailbox: draftChildDetails.ca_showteammailbox === true,
      })
      setActiveItem(refreshedChild.label)
      if (!draftChildDetails.ca_showcontactteam) setActiveChildContacts([])
      setChildContactsError('')
      clearDraftPreviewUrls(draftChildContent)
      setDraftChildDetails(null)
      setDraftChildContacts([])
      setDraftChildContent([])
      setRemovedChildContactIds([])
      setRemovedChildContentIds([])
      setIsManagingChildDetails(false)
      isManagingChildDetailsPinned.current = false
      setChildDetailsConfirmationTitle('Changes saved')
      setChildDetailsSavedMessage(`${refreshedChild.label} content has been saved.`)
    } catch (error) {
      setChildDetailsSaveError(getDataErrorMessage(error, 'Saving child details failed with an unknown error.'))
    } finally {
      setIsSavingChildDetails(false)
    }
  }
  const startManagingLeadership = () => {
    setDraftLeadershipContent(leadershipContent)
    setDraftLeadershipFiles({})
    setLeadershipSaveError('')
    setIsManagingLeadership(true)
  }
  const updateLeadershipContent = (key: keyof LeadershipContent, value: string | null) => {
    setDraftLeadershipContent((content) => ({ ...content, [key]: value }))
  }
  const updateLeadershipImageFile = (key: 'firstImage' | 'secondImage', file: File | null) => {
    setDraftLeadershipFiles((files) => ({ ...files, [key]: file }))
  }
  const cancelManagingLeadership = () => {
    setDraftLeadershipContent(leadershipContent)
    setDraftLeadershipFiles({})
    setLeadershipSaveError('')
    setIsManagingLeadership(false)
  }
  const saveLeadershipContent = async () => {
    setLeadershipSaveError('')
    const firstTitleValidationError = validateAboutTextInput(draftLeadershipContent.firstTitle, 'Leadership 1 title')
    if (firstTitleValidationError) {
      setLeadershipSaveError(firstTitleValidationError)
      return
    }
    const secondTitleValidationError = validateAboutTextInput(draftLeadershipContent.secondTitle, 'Leadership 2 title')
    if (secondTitleValidationError) {
      setLeadershipSaveError(secondTitleValidationError)
      return
    }
    const payload = {
      cp_leadership1title: draftLeadershipContent.firstTitle.trim(),
      cp_description1: draftLeadershipContent.firstDescription.trim(),
      cp_leadership2title: draftLeadershipContent.secondTitle.trim(),
      cp_description2: draftLeadershipContent.secondDescription.trim(),
    }
    try {
      let recordId = leadershipRecordId
      if (!recordId) {
        const createResult = await Cp_aboutusleadershipdetailsesService.create({
          ...payload,
          statecode: 0,
        })
        if (!createResult.success) throw createResult.error ?? new Error('Leadership content could not be created.')
        recordId = createResult.data.cp_aboutusleadershipdetailsid ?? null
        if (!recordId) throw new Error('Leadership content was created without an id.')
      } else {
        const updateResult = await Cp_aboutusleadershipdetailsesService.update(recordId, payload)
        if (!updateResult.success) throw updateResult.error ?? new Error('Leadership content could not be updated.')
      }

      if (draftLeadershipFiles.firstImage) {
        const uploadResult = await Cp_aboutusleadershipdetailsesService.upload(recordId, 'cp_hierarchyimage1', draftLeadershipFiles.firstImage, draftLeadershipFiles.firstImage.name)
        if (!uploadResult.success) throw uploadResult.error ?? new Error('Leadership 1 image could not be uploaded.')
      } else if (!draftLeadershipContent.firstImage && leadershipStoredImages.first) {
        const deleteResult = await Cp_aboutusleadershipdetailsesService.deleteFileOrImage(recordId, 'cp_hierarchyimage1')
        if (!deleteResult.success) throw deleteResult.error ?? new Error('Leadership 1 image could not be removed.')
      }

      if (draftLeadershipFiles.secondImage) {
        const uploadResult = await Cp_aboutusleadershipdetailsesService.upload(recordId, 'cp_hierarchyimg2', draftLeadershipFiles.secondImage, draftLeadershipFiles.secondImage.name)
        if (!uploadResult.success) throw uploadResult.error ?? new Error('Leadership 2 image could not be uploaded.')
      } else if (!draftLeadershipContent.secondImage && leadershipStoredImages.second) {
        const deleteResult = await Cp_aboutusleadershipdetailsesService.deleteFileOrImage(recordId, 'cp_hierarchyimg2')
        if (!deleteResult.success) throw deleteResult.error ?? new Error('Leadership 2 image could not be removed.')
      }

      setLeadershipContent(draftLeadershipContent)
      setLeadershipRecordId(recordId)
      setLeadershipStoredImages({
        first: Boolean(draftLeadershipContent.firstImage),
        second: Boolean(draftLeadershipContent.secondImage),
      })
      setDraftLeadershipFiles({})
      setLeadershipSaveError('')
      setIsManagingLeadership(false)
    } catch (error) {
      setLeadershipSaveError(getDataErrorMessage(error, 'Leadership content could not be saved.'))
    }
  }
  const startManagingMenu = () => {
    setManagingParent(null)
    setIsManagingMenu(true)
    setDraftParentItems(
      aboutNavigation
        .filter((item) => item.id && item.isActive === true)
        .map((item) => ({
          id: item.id,
          label: item.label,
          hasSubcategory: item.hasSubcategory === true,
          childItems: item.childItems,
        })),
    )
    setNewParentLabel('')
    setNewParentHasSubcategory(true)
    setMenuSaveError('')
  }
  const addParentItem = () => {
    const label = newParentLabel.trim()
    if (!label) return
    const labelValidationError = validateAboutTextInput(label, 'Menu item name')
    if (labelValidationError) {
      setMenuSaveError(labelValidationError)
      return
    }
    if (draftParentItems.some((item) => item.label.trim().toLowerCase() === label.toLowerCase())) {
      setMenuSaveError('The name already there. Please give another name')
      return
    }
    setDraftParentItems((items) => [...items, { label, hasSubcategory: newParentHasSubcategory, childItems: [] }])
    setNewParentLabel('')
    setNewParentHasSubcategory(true)
    setMenuSaveError('')
  }
  const updateDraftParent = (index: number, label: string) => {
    setDraftParentItems((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, label } : item))
    setMenuSaveError('')
  }
  const updateDraftParentHasSubcategory = (index: number, hasSubcategory: boolean) => {
    setDraftParentItems((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, hasSubcategory } : item))
    setMenuSaveError('')
  }
  const moveDraftParent = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= draftParentItems.length) return
    setDraftParentItems((items) => {
      const reordered = [...items]
      ;[reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]]
      return reordered
    })
  }
  const removeDraftParent = (index: number) => {
    setDraftParentItems((items) => items.filter((_, itemIndex) => itemIndex !== index))
  }
  const cancelManagingMenu = () => {
    setIsManagingMenu(false)
    setMenuSaveError('')
  }
  const saveParentMenu = async () => {
    if (draftParentItems.some((item) => !item.label.trim())) {
      setMenuSaveError('Enter a name for each menu item before saving.')
      return
    }
    const normalizedLabels = draftParentItems.map((item) => item.label.trim().toLowerCase())
    const invalidMenuItem = draftParentItems.find((item) => validateAboutTextInput(item.label.trim(), 'Menu item name'))
    if (invalidMenuItem) {
      setMenuSaveError(validateAboutTextInput(invalidMenuItem.label.trim(), 'Menu item name') ?? 'Please provide valid menu item names.')
      return
    }
    if (new Set(normalizedLabels).size !== normalizedLabels.length) {
      setMenuSaveError('The name already there. Please give another name')
      return
    }

    setIsSavingParent(true)
    setMenuSaveError('')
    try {
      const retainedLabels = new Set(
        draftParentItems.map((item) => item.label.trim().toLowerCase()),
      )
      const currentCategoriesResult = await Cp_aboutuscategoriesesService.getAll({
        select: ['cp_category', 'cp_aboutuscategoriesid', 'statecode'],
      })
      if (!currentCategoriesResult.success) {
        throw currentCategoriesResult.error ?? new Error('Current category records could not be loaded.')
      }
      const currentCategories = (currentCategoriesResult.data ?? [])
        .filter((category) => typeof category.cp_category === 'string' && category.cp_category.trim().length > 0 && category.statecode !== 1)
      const currentCategoryIdByLabel = new Map(
        currentCategories.map((category) => {
          const categoryRecord = category as unknown as Record<string, unknown>
          const resolvedId = (category.cp_aboutuscategoriesid?.trim() || getAboutCategoryRecordId(categoryRecord) || '').replace(/^\{/, '').replace(/\}$/, '')
          return [category.cp_category.trim().toLowerCase(), resolvedId]
        }),
      )
      const removedLabels = currentCategories
        .map((category) => category.cp_category.trim())
        .filter((label) => !retainedLabels.has(label.toLowerCase()))

      const removedParents = aboutNavigation.filter(
        (item) =>
          item.isActive === true &&
          removedLabels.some((label) => label.toLowerCase() === item.label.trim().toLowerCase()),
      )
      for (const parent of removedParents) {
        const childResults = await Promise.all((parent.childItems ?? [])
          .filter((child) => child.id && child.isActive === true)
          .map((child) => Cp_aboutussubcategoriesesService.update(child.id as string, { statecode: 1 })))
        const failedChild = childResults.find((result) => !result.success)
        if (failedChild && !failedChild.success) throw failedChild.error ?? new Error('A child item could not be deactivated.')
      }
      await Promise.all(removedLabels.map(async (label) => {
        const id = currentCategoryIdByLabel.get(label.toLowerCase())
        if (!id) return
        const result = await Cp_aboutuscategoriesesService.update(id, { statecode: 1 })
        if (!result.success) throw result.error ?? new Error('A parent item could not be deactivated.')
      }))
      const retainedCategoryIdByLabel = new Map<string, string>()
      for (const [index, item] of draftParentItems.entries()) {
        const nextLabel = item.label.trim()
        const existingId = currentCategoryIdByLabel.get(nextLabel.toLowerCase())
        if (existingId) {
          const result = await Cp_aboutuscategoriesesService.update(existingId, {
            cp_category: nextLabel,
            cp_sortorder: index + 1,
            cp_havesubcategory: item.hasSubcategory === true,
          })
          if (!result.success) throw result.error ?? new Error('A parent item could not be updated.')
          retainedCategoryIdByLabel.set(nextLabel.toLowerCase(), existingId)
          continue
        }
        const result = await Cp_aboutuscategoriesesService.create({
          cp_category: nextLabel,
          cp_sortorder: index + 1,
          cp_havesubcategory: item.hasSubcategory !== false,
        })
        if (!result.success) throw result.error ?? new Error('A parent item could not be added.')
        const createdCategoryRecord = result.data as unknown as Record<string, unknown>
        const createdCategoryId = (result.data.cp_aboutuscategoriesid?.trim() || getAboutCategoryRecordId(createdCategoryRecord) || '').replace(/^\{/, '').replace(/\}$/, '')
        if (!createdCategoryId) throw new Error('A parent item was created without an id.')
        retainedCategoryIdByLabel.set(nextLabel.toLowerCase(), createdCategoryId)
      }
      for (const item of draftParentItems.filter((entry) => entry.hasSubcategory !== true)) {
        const categoryLabel = item.label.trim()
        const categoryId = retainedCategoryIdByLabel.get(categoryLabel.toLowerCase())
        if (!categoryId) continue
        const subcategoriesResult = await Cp_aboutussubcategoriesesService.getAll({
          select: ['cp_aboutussubcategoriesid', 'cp_subcategory', '_cp_category_value', 'statecode'],
          filter: `_cp_category_value eq ${categoryId}`,
          orderBy: ['cp_sortorder asc'],
        })
        if (!subcategoriesResult.success) {
          throw subcategoriesResult.error ?? new Error(`Sub categories for ${categoryLabel} could not be loaded.`)
        }
        const activeSubcategories = (subcategoriesResult.data ?? []).filter((entry) => entry.statecode !== 1)
        const matchingSubcategory = activeSubcategories.find((entry) => entry.cp_subcategory?.trim().toLowerCase() === categoryLabel.toLowerCase())
        let defaultSubcategoryId = matchingSubcategory?.cp_aboutussubcategoriesid
        if (matchingSubcategory?.cp_aboutussubcategoriesid) {
          const ensureDefaultResult = await Cp_aboutussubcategoriesesService.update(matchingSubcategory.cp_aboutussubcategoriesid, {
            cp_subcategory: categoryLabel,
            cp_sortorder: 1,
            statecode: 0,
          })
          if (!ensureDefaultResult.success) {
            throw ensureDefaultResult.error ?? new Error(`Default sub category for ${categoryLabel} could not be updated.`)
          }
        } else {
          const createSubcategoryResult = await Cp_aboutussubcategoriesesService.create({
            cp_subcategory: categoryLabel,
            cp_sortorder: 1,
            statecode: 0,
            'cp_Category@odata.bind': `/cp_aboutuscategorieses(${categoryId})`,
          } as unknown as Cp_aboutussubcategoriesesBase)
          if (!createSubcategoryResult.success) {
            throw createSubcategoryResult.error ?? new Error(`Default sub category for ${categoryLabel} could not be created.`)
          }
          defaultSubcategoryId = createSubcategoryResult.data.cp_aboutussubcategoriesid
        }
        for (const subcategory of activeSubcategories) {
          if (!subcategory.cp_aboutussubcategoriesid || subcategory.cp_aboutussubcategoriesid === defaultSubcategoryId) continue
          const deactivateResult = await Cp_aboutussubcategoriesesService.update(subcategory.cp_aboutussubcategoriesid, { statecode: 1 })
          if (!deactivateResult.success) {
            throw deactivateResult.error ?? new Error(`Extra sub category under ${categoryLabel} could not be deactivated.`)
          }
        }
      }
      const items = await loadAboutNavigation()
      updateAboutNavigation(items)
      setIsManagingMenu(false)
    } catch (error) {
      setMenuSaveError(getDataErrorMessage(error, 'Menu changes could not be saved.'))
    } finally {
      setIsSavingParent(false)
    }
  }
  const startManagingParent = (item: AboutNavigationItem) => {
    if (!item.id) return
    setIsManagingMenu(false)
    setManagingParent(item)
    setDraftChildren((item.childItems ?? []).filter((child) => child.isActive === true).map((child) => ({ ...child })))
    setNewChildLabel('')
    setParentSaveError('')
  }
  const moveChildItem = async (item: AboutNavigationItem, childLabel: string, direction: -1 | 1) => {
    const children = (item.childItems ?? []).filter((child) => child.isActive === true)
    const currentIndex = children.findIndex((child) => child.label === childLabel)
    const targetIndex = currentIndex + direction
    if (currentIndex < 0 || targetIndex < 0 || targetIndex >= children.length) return

    const reorderedChildren = [...children]
    ;[reorderedChildren[currentIndex], reorderedChildren[targetIndex]] = [reorderedChildren[targetIndex], reorderedChildren[currentIndex]]
    try {
      const results = await Promise.all(reorderedChildren.map((child, index) => {
        if (!child.id) throw new Error('An item could not be reordered.')
        return Cp_aboutussubcategoriesesService.update(child.id, { cp_sortorder: index + 1 })
      }))
      const failedResult = results.find((result) => !result.success)
      if (failedResult && !failedResult.success) throw failedResult.error ?? new Error('The item could not be reordered.')
      updateAboutNavigation(await loadAboutNavigation())
      setChildActionError('')
    } catch (error) {
      setChildActionError(error instanceof Error ? error.message : 'The item could not be reordered.')
    } finally {
      setOpenChildMenu(null)
    }
  }
  const deleteChildItem = async (item: AboutNavigationItem, childLabel: string) => {
    const child = (item.childItems ?? []).find((entry) => entry.label === childLabel)
    if (!child?.id) return
    setIsDeletingChild(true)
    try {
      const result = await Cp_aboutussubcategoriesesService.update(child.id, { statecode: 1 })
      if (!result.success) throw result.error ?? new Error('The item could not be removed.')
      updateAboutNavigation(await loadAboutNavigation())
      setChildActionError('')
    } catch (error) {
      setChildActionError(error instanceof Error ? error.message : 'The item could not be deleted.')
    } finally {
      setIsDeletingChild(false)
      setOpenChildMenu(null)
    }
  }
  const addParentChild = () => {
    const label = newChildLabel.trim()
    if (!label) return
    const labelValidationError = validateAboutTextInput(label, 'Item name')
    if (labelValidationError) {
      setParentSaveError(labelValidationError)
      return
    }
    if (draftChildren.some((child) => child.label.trim().toLowerCase() === label.toLowerCase())) {
      setParentSaveError(`${label} already there. please give another name`)
      return
    }
    setDraftChildren((children) => [...children, { label }])
    setNewChildLabel('')
    setParentSaveError('')
  }
  const updateDraftChild = (index: number, label: string) => {
    setDraftChildren((children) => children.map((child, childIndex) => childIndex === index ? { ...child, label } : child))
    setParentSaveError('')
  }
  const moveDraftChild = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= draftChildren.length) return
    setDraftChildren((children) => {
      const reordered = [...children]
      ;[reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]]
      return reordered
    })
  }
  const removeDraftChild = (index: number) => {
    setDraftChildren((children) => children.filter((_, childIndex) => childIndex !== index))
  }
  const cancelManagingParent = () => {
    setManagingParent(null)
    setParentSaveError('')
  }
  const saveParentChildren = async () => {
    if (!managingParent) return
    if (draftChildren.some((child) => !child.label.trim())) {
      setParentSaveError('Enter a name for each item before saving.')
      return
    }
    const invalidChild = draftChildren.find((child) => validateAboutTextInput(child.label.trim(), 'Item name'))
    if (invalidChild) {
      setParentSaveError(validateAboutTextInput(invalidChild.label.trim(), 'Item name') ?? 'Please provide valid item names.')
      return
    }
    const normalizedChildLabels = draftChildren.map((child) => child.label.trim().toLowerCase())
    const duplicateIndex = normalizedChildLabels.findIndex((label, index) => normalizedChildLabels.indexOf(label) !== index)
    if (duplicateIndex !== -1) {
      setParentSaveError(`${draftChildren[duplicateIndex].label.trim()} already there. please give another name`)
      return
    }

    setIsSavingParent(true)
    setParentSaveError('')
    try {
      let effectiveDraftChildren = draftChildren.map((child) => ({ ...child }))
      let parentCategoryIdFromChildLookup = ''
      const unresolvedChildLabels = [...new Set(effectiveDraftChildren
        .filter((child) => !isGuid((child.id ?? '').trim()))
        .map((child) => child.label.trim())
        .filter((label) => label.length > 0))]
      if (unresolvedChildLabels.length > 0) {
        const subcategoryLabelFilter = unresolvedChildLabels
          .map((label) => `cp_subcategory eq '${escapeODataString(label)}'`)
          .join(' or ')
        const unresolvedLookupResult = await Cp_aboutussubcategoriesesService.getAll({
          select: ['cp_aboutussubcategoriesid', 'cp_subcategory', '_cp_category_value', 'statecode'],
          filter: `statecode eq 0 and (${subcategoryLabelFilter})`,
        })
        if (unresolvedLookupResult.success) {
          const normalizedManagedParentLabel = normalizeLabelForIdMatch(managingParent.label)
          const recordsForManagedParent = (unresolvedLookupResult.data ?? [])
            .filter((record) => record.statecode !== 1)
            .filter((record) => {
              const rawRecord = record as unknown as Record<string, unknown>
              const formattedParentLabel = rawRecord['_cp_category_value@OData.Community.Display.V1.FormattedValue']
              return typeof formattedParentLabel === 'string'
                && normalizeLabelForIdMatch(formattedParentLabel) === normalizedManagedParentLabel
            })

          const recordIdsByLabel = new Map<string, string[]>()
          const parentCategoryIds = new Set<string>()
          recordsForManagedParent.forEach((record) => {
            const rawRecord = record as unknown as Record<string, unknown>
            const subcategoryId = (record.cp_aboutussubcategoriesid?.trim() || getAboutSubcategoryRecordId(rawRecord) || '').replace(/^\{/, '').replace(/\}$/, '')
            const subcategoryLabel = record.cp_subcategory?.trim().toLowerCase() ?? ''
            if (isGuid(subcategoryId) && subcategoryLabel) {
              const bucket = recordIdsByLabel.get(subcategoryLabel) ?? []
              bucket.push(subcategoryId)
              recordIdsByLabel.set(subcategoryLabel, bucket)
            }
            const parentCategoryId = (record._cp_category_value ?? '').trim().replace(/^\{/, '').replace(/\}$/, '')
            if (isGuid(parentCategoryId)) parentCategoryIds.add(parentCategoryId)
          })
          if (parentCategoryIds.size === 1) {
            parentCategoryIdFromChildLookup = [...parentCategoryIds][0]
          }
          effectiveDraftChildren = effectiveDraftChildren.map((child) => {
            if (isGuid((child.id ?? '').trim())) return child
            const matchedIds = recordIdsByLabel.get(child.label.trim().toLowerCase()) ?? []
            if (matchedIds.length === 1) return { ...child, id: matchedIds[0] }
            return child
          })
        }
      }

      const hasNewChildrenToCreate = effectiveDraftChildren.some((child) => !isGuid((child.id ?? '').trim()))
      let parentCategoryBindPath = ''

      if (hasNewChildrenToCreate) {
        let parentCategoryId = (managingParent.id ?? '').trim().replace(/^\{/, '').replace(/\}$/, '')
        if (!isGuid(parentCategoryId) && isGuid(parentCategoryIdFromChildLookup)) {
          parentCategoryId = parentCategoryIdFromChildLookup
        }
        if (!isGuid(parentCategoryId)) {
          const normalizedManagedParentLabel = normalizeLabelForIdMatch(managingParent.label)
          const subcategoriesByParentResult = await Cp_aboutussubcategoriesesService.getAll({
            select: ['cp_aboutussubcategoriesid', '_cp_category_value', 'statecode'],
            filter: 'statecode eq 0',
          })
          if (subcategoriesByParentResult.success) {
            const categoryIdsByParentLabel = [...new Set((subcategoriesByParentResult.data ?? [])
              .filter((record) => record.statecode !== 1)
              .flatMap((record) => {
                const rawRecord = record as unknown as Record<string, unknown>
                const formattedParentLabel = rawRecord['_cp_category_value@OData.Community.Display.V1.FormattedValue']
                if (typeof formattedParentLabel !== 'string' || !formattedParentLabel.trim()) return []
                if (normalizeLabelForIdMatch(formattedParentLabel) !== normalizedManagedParentLabel) return []
                return [(record._cp_category_value ?? '').trim().replace(/^\{/, '').replace(/\}$/, '')]
              })
              .filter((id) => isGuid(id)))]
            if (categoryIdsByParentLabel.length === 1) {
              parentCategoryId = categoryIdsByParentLabel[0]
            }
          }
        }
        if (!isGuid(parentCategoryId)) {
          const existingSubcategoryLabels = [...new Set((managingParent.childItems ?? [])
            .filter((child) => child.isActive === true && child.label.trim().length > 0)
            .map((child) => child.label.trim()))]
          if (existingSubcategoryLabels.length > 0) {
            const subcategoryLabelFilter = existingSubcategoryLabels
              .map((label) => `cp_subcategory eq '${label.replace(/'/g, "''")}'`)
              .join(' or ')
            const existingSubcategoryLabelSet = new Set(existingSubcategoryLabels.map((label) => label.toLowerCase()))
            const subcategoryLookupResult = await Cp_aboutussubcategoriesesService.getAll({
              select: ['cp_aboutussubcategoriesid', '_cp_category_value', 'cp_subcategory', 'statecode'],
              filter: `statecode eq 0 and (${subcategoryLabelFilter})`,
            })
            if (subcategoryLookupResult.success) {
              const normalizedManagedParentLabel = normalizeLabelForIdMatch(managingParent.label)
              const lookupRecords = (subcategoryLookupResult.data ?? [])
                .filter((record) => record.statecode !== 1)
                .filter((record) => {
                  const subcategoryLabel = record.cp_subcategory?.trim().toLowerCase() ?? ''
                  return existingSubcategoryLabelSet.has(subcategoryLabel)
                })
              const categoryIdsForManagedParent = [...new Set(lookupRecords
                .flatMap((record) => {
                  const rawRecord = record as unknown as Record<string, unknown>
                  const parentLabelFromLookup = rawRecord['_cp_category_value@OData.Community.Display.V1.FormattedValue']
                  if (typeof parentLabelFromLookup !== 'string' || !parentLabelFromLookup.trim()) return []
                  return normalizeLabelForIdMatch(parentLabelFromLookup) === normalizedManagedParentLabel
                    ? [(record._cp_category_value ?? '').trim().replace(/^\{/, '').replace(/\}$/, '')]
                    : []
                })
                .filter((id) => isGuid(id)))]
              if (categoryIdsForManagedParent.length === 1) {
                parentCategoryId = categoryIdsForManagedParent[0]
              }
              const categoryIdsFromExistingChildren = [...new Set(lookupRecords
                .filter((record) => record.statecode !== 1)
                .map((record) => (record._cp_category_value ?? '').trim().replace(/^\{/, '').replace(/\}$/, ''))
                .filter((id) => isGuid(id)))]
              if (!isGuid(parentCategoryId) && categoryIdsFromExistingChildren.length === 1) {
                parentCategoryId = categoryIdsFromExistingChildren[0]
              }
            }
          }
        }
        if (!isGuid(parentCategoryId)) {
          const firstExistingChildId = effectiveDraftChildren.find((child) => child.id && isGuid(child.id))?.id
          if (firstExistingChildId) {
            const existingChildResult = await Cp_aboutussubcategoriesesService.get(firstExistingChildId, {
              select: ['cp_aboutussubcategoriesid', '_cp_category_value'],
            })
            if (existingChildResult.success) {
              const resolvedCategoryId = (existingChildResult.data._cp_category_value?.trim() ?? '').replace(/^\{/, '').replace(/\}$/, '')
              if (isGuid(resolvedCategoryId)) parentCategoryId = resolvedCategoryId
            }
          }
        }
        if (!isGuid(parentCategoryId)) {
          const categoriesResult = await Cp_aboutuscategoriesesService.getAll({
            select: ['cp_aboutuscategoriesid', 'cp_category', 'statecode'],
            filter: 'statecode eq 0',
          })
          if (!categoriesResult.success) {
            throw categoriesResult.error ?? new Error('Parent category could not be resolved.')
          }
          const categoriesWithIds = (categoriesResult.data ?? []).flatMap((category) => {
            if (category.statecode === 1) return []
            const label = category.cp_category?.trim() ?? ''
            if (!label) return []
            const categoryRecord = category as unknown as Record<string, unknown>
            const categoryId = (category.cp_aboutuscategoriesid?.trim() || getAboutCategoryRecordId(categoryRecord) || '').replace(/^\{/, '').replace(/\}$/, '')
            if (!isGuid(categoryId)) return []
            return [{ label, normalizedLabel: normalizeLabelForIdMatch(label), categoryId }]
          })
          const normalizedManagedLabel = managingParent.label.trim().replace(/\s+/g, ' ').toLowerCase()
          const normalizedManagedLabelKey = normalizeLabelForIdMatch(managingParent.label)
          const availableCategoryLabels = (categoriesResult.data ?? [])
            .map((category) => category.cp_category?.trim() ?? '')
            .filter((label) => label.length > 0)
          const exactMatch = categoriesWithIds.find((category) => category.label.replace(/\s+/g, ' ').toLowerCase() === normalizedManagedLabel)
          const normalizedMatches = categoriesWithIds.filter((category) => category.normalizedLabel === normalizedManagedLabelKey)
          const matchingCategoryId = exactMatch?.categoryId
            ?? (normalizedMatches.length === 1 ? normalizedMatches[0].categoryId : '')
          parentCategoryId = matchingCategoryId
          if (!isGuid(parentCategoryId) && availableCategoryLabels.length > 0) {
            const matchedLabel = availableCategoryLabels.find((label) => label.trim().replace(/\s+/g, ' ').toLowerCase() === normalizedManagedLabel)
            if (!matchedLabel) {
              throw new Error(`Parent category label ${managingParent.label} did not match Dataverse labels: ${availableCategoryLabels.join(', ')}`)
            }
          }
        }
        if (!isGuid(parentCategoryId)) {
          const resolvedCategoryIdByLabel = await resolveAboutCategoryIdByLabel(managingParent.label)
          if (resolvedCategoryIdByLabel) parentCategoryId = resolvedCategoryIdByLabel
        }
        if (!isGuid(parentCategoryId)) {
          throw new Error(`Parent category id for ${managingParent.label} could not be resolved. Ensure the category has a valid Dataverse GUID id.`)
        }
        parentCategoryId = parentCategoryId.trim().replace(/^\{/, '').replace(/\}$/, '')
        parentCategoryBindPath = `/cp_aboutuscategorieses(${parentCategoryId})`
      }

      const retainedChildIds = new Set(effectiveDraftChildren
        .flatMap((child) => {
          const childId = (child.id ?? '').trim().replace(/^\{/, '').replace(/\}$/, '')
          return isGuid(childId) ? [childId] : []
        }))
      const removedChildren = (managingParent.childItems ?? []).filter((child) => {
        const childId = (child.id ?? '').trim().replace(/^\{/, '').replace(/\}$/, '')
        return isGuid(childId) && child.isActive === true && !retainedChildIds.has(childId)
      })
      await Promise.all([
        ...removedChildren.map(async (child) => {
          const childId = (child.id ?? '').trim().replace(/^\{/, '').replace(/\}$/, '')
          const result = await Cp_aboutussubcategoriesesService.update(childId, { statecode: 1 })
          if (!result.success) throw result.error ?? new Error('An item could not be deactivated.')
        }),
        ...effectiveDraftChildren.map(async (child, index) => {
          const childId = (child.id ?? '').trim().replace(/^\{/, '').replace(/\}$/, '')
          if (isGuid(childId)) {
            const result = await Cp_aboutussubcategoriesesService.update(childId, {
              cp_subcategory: child.label.trim(),
              cp_sortorder: index + 1,
            })
            if (!result.success) throw result.error ?? new Error('An item could not be updated.')
            return
          }
          const createPayload: Record<string, unknown> = {
            cp_subcategory: child.label.trim(),
            cp_sortorder: index + 1,
            'cp_Category@odata.bind': parentCategoryBindPath,
          }
          const result = await Cp_aboutussubcategoriesesService.create(
            createPayload as unknown as Cp_aboutussubcategoriesesBase,
          )
          if (!result.success) throw result.error ?? new Error('An item could not be added.')
        }),
      ])
      const items = await loadAboutNavigation()
      updateAboutNavigation(items)
      setOpenSections((sections) => ({ ...sections, [managingParent.label]: true }))
      setManagingParent(null)
    } catch (error) {
      setParentSaveError(getDataErrorMessage(error, 'Changes could not be saved.'))
    } finally {
      setIsSavingParent(false)
    }
  }

  useEffect(() => {
    let isMounted = true
    loadAboutNavigation()
      .then((items) => {
        if (isMounted) {
          updateAboutNavigation(items)
          setNavigationLoadError('')
        }
      })
      .catch((error: unknown) => {
        if (isMounted) {
          setNavigationLoadError(`Dataverse sections could not be loaded: ${getDataErrorMessage(error, 'Check your Power Apps sign-in, Dataverse connection, and table permissions.')}`)
        }
      })

    return () => { isMounted = false }
  }, [])

  useEffect(() => {
    let isMounted = true
    const loadLeadership = async () => {
      try {
        const leadershipResult = await Cp_aboutusleadershipdetailsesService.getAll({
          select: [
            'cp_aboutusleadershipdetailsid',
            'cp_leadership1title',
            'cp_description1',
            'cp_hierarchyimage1_url',
            'cp_leadership2title',
            'cp_description2',
            'cp_hierarchyimg2_url',
          ],
          filter: 'statecode eq 0',
          top: 1,
        })
        if (!leadershipResult.success) throw leadershipResult.error ?? new Error('Leadership content could not be loaded.')
        const record = leadershipResult.data[0]
        if (!record) return

        const loadedContent: LeadershipContent = {
          firstTitle: record.cp_leadership1title?.trim() || defaultLeadershipContent.firstTitle,
          firstDescription: record.cp_description1 ?? '',
          firstImage: record.cp_hierarchyimage1_url ?? null,
          secondTitle: record.cp_leadership2title?.trim() || defaultLeadershipContent.secondTitle,
          secondDescription: record.cp_description2 ?? '',
          secondImage: record.cp_hierarchyimg2_url ?? null,
        }
        const storedImages = {
          first: Boolean(loadedContent.firstImage),
          second: Boolean(loadedContent.secondImage),
        }

        const imageErrors: string[] = []
        if (record.cp_aboutusleadershipdetailsid) {
          const imageColumns: Array<{ key: 'firstImage' | 'secondImage'; columnName: Cp_aboutusleadershipdetailsesImageColumnName; label: string }> = [
            { key: 'firstImage', columnName: 'cp_hierarchyimage1', label: 'Leadership 1' },
            { key: 'secondImage', columnName: 'cp_hierarchyimg2', label: 'Leadership 2' },
          ]
          for (const imageColumn of imageColumns) {
            try {
              const imageData = await downloadLeadershipImage(record.cp_aboutusleadershipdetailsid, imageColumn.columnName, true)
              if (!isMounted) return
              const buffer = new ArrayBuffer(imageData.byteLength)
              new Uint8Array(buffer).set(imageData)
              loadedContent[imageColumn.key] = await readBlobAsDataUrl(new Blob([buffer], { type: getImageMimeType(imageData) }))
              if (imageColumn.key === 'firstImage') storedImages.first = true
              if (imageColumn.key === 'secondImage') storedImages.second = true
            } catch (error) {
              if (!loadedContent[imageColumn.key]) {
                imageErrors.push(`${imageColumn.label}: ${getDataErrorMessage(error, 'Dataverse did not provide an error detail.')}`)
              }
            }
          }
        }

        if (isMounted) {
          setLeadershipRecordId(record.cp_aboutusleadershipdetailsid ?? null)
          setLeadershipContent(loadedContent)
          setDraftLeadershipContent(loadedContent)
          setLeadershipStoredImages(storedImages)
          if (imageErrors.length > 0) {
            setLeadershipSaveError(`Some leadership images could not be loaded: ${imageErrors.join('; ')}`)
          } else {
            setLeadershipSaveError('')
          }
        }
      } catch (error) {
        if (isMounted) {
          setLeadershipSaveError(`Leadership content could not be loaded: ${getDataErrorMessage(error, 'Dataverse returned an unknown error.')}`)
        }
      }
    }

    void loadLeadership()
    return () => { isMounted = false }
  }, [])

  useEffect(() => {
    const selectedSubcategoryId = activeNavChildId
    if (!selectedSubcategoryId || !activeChildDetails?.ca_showcontactteam) return
    let isMounted = true

    Cp_aboutuscontactteamdetailsesService.getAll({
      select: ['cp_aboutuscontactteamdetailsid', '_cp_aboutussubcategory_value', '_cp_membername_value', 'cp_designation', 'cp_role', 'cp_sortorder', 'statecode'],
      filter: `statecode eq 0 and _cp_aboutussubcategory_value eq ${selectedSubcategoryId}`,
      orderBy: ['cp_sortorder asc'],
    })
      .then(async (contactResult) => {
        if (!contactResult.success) throw new Error(getDataErrorMessage(contactResult.error, 'The Contact the Team option is enabled, but its contact records could not be loaded.'))
        const memberNamesById = await resolveSystemUserNamesById(contactResult.data.map((contact) => contact._cp_membername_value ?? ''))
        if (isMounted) {
          setActiveChildContacts(contactResult.data
            .filter((contact) => contact.statecode !== 1 && contact._cp_membername_value)
            .map((contact) => ({
              ca_about_us_contact_teamid: contact.cp_aboutuscontactteamdetailsid ?? '',
              ca_member_id: contact._cp_membername_value ?? '',
              ca_name: memberNamesById.get((contact._cp_membername_value ?? '').toLowerCase()) ?? '',
              ca_designation: contact.cp_designation ?? '',
              ca_role: contact.cp_role ?? '',
              ca_sortorder: contact.cp_sortorder ?? 0,
              ca_status: contact.statecode !== 1,
            }))
            .filter((contact) => contact.ca_about_us_contact_teamid !== '' && contact.ca_name.trim().length > 0))
        }
      })
      .catch((error: unknown) => {
        if (isMounted) setChildContactsError(`Contact records could not be loaded: ${getDataErrorMessage(error, 'Dataverse returned an unknown error.')}`)
      })
      .finally(() => {
        if (isMounted) setIsLoadingChildDetails(false)
      })

    return () => { isMounted = false }
  }, [activeChildDetails, activeNavChildId, aboutNavigation])

  useEffect(() => {
    const selectedSubcategoryId = activeNavChildId
    if (!selectedSubcategoryId || isManagingChildDetails) return
    let isMounted = true

    const loadContent = async () => {
      try {
        const contentResult = await Cp_aboutustextimaegeblocksesService.getAll({
          select: ['cp_aboutustextimaegeblocksid', '_cp_aboutussubcategory_value', 'cp_type', 'cp_imagecaption', 'cp_text', 'cp_imagesource_url', 'cp_sortorder', 'statecode'],
          filter: `_cp_aboutussubcategory_value eq ${selectedSubcategoryId} and statecode eq 0`,
          orderBy: ['cp_sortorder asc'],
        })
        if (!contentResult.success) throw contentResult.error ?? new Error('Child images and text could not be loaded.')

        const mappedItems: AboutChildContentRecord[] = contentResult.data
          .filter((item) => item.statecode !== 1)
          .map((item) => ({
            ca_about_us_child_imagestextid: item.cp_aboutustextimaegeblocksid ?? '',
            ca_id: item.cp_aboutustextimaegeblocksid ?? '',
            ca_type: normalizeAboutContentType(item.cp_type),
            ca_caption: item.cp_imagecaption ?? '',
            ca_text: item.cp_text ?? '',
            ca_imagesource_url: item.cp_imagesource_url ?? undefined,
            ca_isactive: item.statecode !== 1,
            ca_sortorder: item.cp_sortorder ?? 0,
          }))
          .filter((item) => item.ca_about_us_child_imagestextid !== '')

        const imageErrors: string[] = []
        const contentItems = await Promise.all(sortChildContent(mappedItems).map(async (item) => {
          if (item.ca_type !== 1) return item
          try {
            const imageData = await downloadSubcategoryContentImage(item.ca_about_us_child_imagestextid, 'cp_imagesource', true)
            if (!isMounted) return item

            const buffer = new ArrayBuffer(imageData.byteLength)
            new Uint8Array(buffer).set(imageData)
            const imageUrl = await readBlobAsDataUrl(new Blob([buffer], { type: getImageMimeType(imageData) }))
            return { ...item, ca_imagesource_url: imageUrl }
          } catch (error: unknown) {
            imageErrors.push(`${item.ca_id}: ${getDataErrorMessage(error, 'Dataverse did not provide an error detail.')}`)
            return { ...item, ca_imagesource_url: undefined }
          }
        }))

        if (isMounted) {
          setActiveChildContent(contentItems)
          setChildContentError(imageErrors.length > 0 ? `Some images could not be loaded: ${imageErrors.join('; ')}` : '')
        }
      } catch (error: unknown) {
        if (isMounted) setChildContentError(`Section content could not be loaded: ${getDataErrorMessage(error, 'Dataverse returned an unknown error.')}`)
      }
    }
    void loadContent()

    return () => {
      isMounted = false
    }
  }, [activeNavChildId, activeChildId, aboutNavigation, isManagingChildDetails])

  useEffect(() => {
    if (activeChildId || isManagingMenu || Boolean(managingParent) || isManagingLeadership || isManagingChildDetails) return
    if (activeItem.trim().toLowerCase() !== 'mission') return
    const missionParent = aboutNavigation.find((item) => item.label.trim().toLowerCase() === 'mission')
    const missionChild = (missionParent?.childItems ?? []).find((child) => child.id && child.isActive === true)
      ?? (missionParent?.childItems ?? []).find((child) => child.id)
    if (missionChild) void selectAboutChild(missionChild)
  }, [aboutNavigation, activeChildId, activeItem, isManagingChildDetails, isManagingLeadership, isManagingMenu, managingParent])

  const renderNavigationItem = (item: AboutNavigationItem, isLastParent = false) => {
    const hasChildren = item.hasSubcategory === true
    const isOpen = hasChildren && (Boolean(openSections[item.label]) || Boolean(normalizedSubmittedQuery))
    const navIcon = 'icon' in item ? item.icon : ''
    if (!matches(item.label) && !(hasChildren && (item.children ?? []).some(matches))) return null

    return (
      <div className={`about-nav-group ${hasChildren && isOpen ? 'open' : ''} ${isLastParent ? 'last-parent' : ''}`} key={item.label}>
        {hasChildren ? (
          <div className="about-nav-heading">
            <button className="about-nav-section" type="button" data-tooltip={item.label} onClick={() => {
              setOpenSections((sections) => ({ ...sections, [item.label]: !sections[item.label] }))
            }}>
              <span className="about-nav-section-label">{item.label}</span>
            </button>
            {isAdmin && item.hasSubcategory === true && <button className="about-nav-manage" type="button" data-tooltip="Manage" aria-label={`Manage ${item.label}`} onClick={() => {
              leaveAboutSubpage(true)
              startManagingParent(item)
            }}>
              <ManageIcon />
              <span>Manage</span>
            </button>}
            <button className="about-nav-toggle" type="button" data-tooltip={`${isOpen ? 'Collapse' : 'Expand'} ${item.label}`} aria-label={`${isOpen ? 'Collapse' : 'Expand'} ${item.label}`} aria-expanded={isOpen} onClick={() => setOpenSections((sections) => ({ ...sections, [item.label]: !sections[item.label] }))}>
              <svg className={`about-chevron ${isOpen ? 'expanded' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d={isOpen ? 'M6 15l6-6 6 6' : 'm6 9 6 6 6-6'} />
              </svg>
            </button>
          </div>
        ) : (
          <button className={`about-nav-item ${activeItem === item.label ? 'active' : ''}`} type="button" data-tooltip={item.label} onClick={() => {
            const defaultChild = item.childItems?.find((child) => child.id && child.isActive === true)
            const isMissionItem = item.label.trim().toLowerCase() === 'mission'
            if ((!item.icon || isMissionItem) && defaultChild) {
              void selectAboutChild(defaultChild)
              return
            }
            leaveAboutSubpage(true)
            setActiveItem(item.label)
          }}>
            <span className="about-nav-icon">{navIcon === 'users' ? <Icon name="users" /> : navIcon === 'target' ? <Icon name="target" /> : navIcon}</span><span className="about-nav-item-label">{item.label}</span>
          </button>
        )}
        {hasChildren && isOpen && (item.childItems ?? []).filter((child) => child.isActive === true && (matches(child.label) || matches(item.label))).map((child) => {
          const childLabel = child.label
          const childMenuKey = `${item.label}:${childLabel}`
          const isChildMenuOpen = openChildMenu === childMenuKey
          const activeChildren = (item.childItems ?? []).filter((childItem) => childItem.isActive === true)
          const childIndex = activeChildren.findIndex((childItem) => childItem.id === child.id)
          const childCount = activeChildren.length

          return (
            <div className={`about-nav-child-row ${childIndex === childCount - 1 ? 'last-child' : ''} ${isAdmin ? '' : 'without-actions'}`} key={child.id ?? childLabel}>
            <button className={`about-nav-child ${activeNavChildId === child.id ? 'active' : ''}`} type="button" data-tooltip={childLabel} onClick={() => {
              void selectAboutChild(child)
            }}><span className="about-nav-child-label">{childLabel}</span></button>
            {isAdmin && <div className="about-nav-child-actions">
              <button className="about-nav-child-menu-toggle" type="button" data-tooltip={`Options for ${childLabel}`} aria-label={`More options for ${childLabel}`} aria-haspopup="menu" aria-expanded={isChildMenuOpen} onClick={() => {
                setOpenChildMenu(isChildMenuOpen ? null : childMenuKey)
              }}>
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="12" cy="5" r="1.7" /><circle cx="12" cy="12" r="1.7" /><circle cx="12" cy="19" r="1.7" /></svg>
              </button>
                {isChildMenuOpen && <div className="about-nav-child-menu" role="menu">
                  <button type="button" role="menuitem" data-tooltip="Manage items" onClick={() => { void manageAboutChild(child); setOpenChildMenu(null) }}>
                    <ManageIcon />
                    <span>Manage</span>
                  </button>
                  <button type="button" role="menuitem" data-tooltip="Move up" onClick={() => void moveChildItem(item, childLabel, -1)} disabled={childIndex === 0}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 19V5m-6 6 6-6 6 6" /></svg>
                    <span>Move Up</span>
                  </button>
                  <button type="button" role="menuitem" data-tooltip="Move down" onClick={() => void moveChildItem(item, childLabel, 1)} disabled={childIndex === childCount - 1}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 5v14m6-6-6 6-6-6" /></svg>
                    <span>Move Down</span>
                  </button>
                  <button className="danger" type="button" role="menuitem" data-tooltip="Delete item" onClick={() => { setPendingChildDelete({ parent: item, childLabel }); setOpenChildMenu(null) }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M10 11v6" /><path d="M14 11v6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M3 6h18" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                    <span>Delete</span>
                  </button>
                </div>}
              </div>}
            </div>
          )
        })}
        {childActionError && <p className="about-navigation-error" role="alert">{childActionError}</p>}
      </div>
    )
  }

  return (
    <main className="about-page" id="about">
      <section className="about-hero">
        <div className="about-network" aria-hidden="true" />
        <div className="about-hero-copy">
          <p className="about-eyebrow"><span /> Global Audit and Assurance</p>
          <h1>GA&amp;A About Us</h1>
          <p>Internal portal for audit services. Stay informed, manage compliance, report and access your team resources.</p>
        </div>
      </section>

      <div className="about-workspace">
        <form className="about-search" role="search" aria-label="About Us sections" onSubmit={(event) => {
          event.preventDefault()
          const trimmedQuery = query.trim()
          setSubmittedQuery(trimmedQuery)
        }}>
          <span className="about-search-icon"><Icon name="search" /></span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === 'Escape') clearAboutSearch() }} placeholder="Search" aria-label="Search About Us sections" />
          {submittedQuery.trim()
            ? <button className="about-search-clear about-search-clear-with-text" type="button" data-tooltip="Clear search" aria-label="Clear search" onClick={clearAboutSearch}><Icon name="close" /><span>Clear</span></button>
            : query && <button className="about-search-clear" type="button" data-tooltip="Clear search" aria-label="Clear search" onClick={clearAboutSearch}><Icon name="close" /></button>}
          <span className="about-ai-badge">AI</span>
        </form>

        <div className={`about-browser${normalizedSubmittedQuery ? ' about-browser-search-mode' : ''}`}>
          {!normalizedSubmittedQuery && <aside className="about-sidebar" aria-label="About Us sections">
            {navigationLoadError && <p className="about-navigation-status about-navigation-error" role="alert">{navigationLoadError}</p>}
            <div className="about-static-nav">{searchableAboutNavigation.filter((item) => item.icon).map((item) => renderNavigationItem(item))}</div>
            {searchableAboutNavigation.filter((item) => !item.icon).map((item, index, items) => renderNavigationItem(item, index === items.length - 1))}
            {isAdmin && <div className="about-sidebar-footer">
              <button className="about-manage-menu" type="button" data-tooltip="Manage Menu" onClick={startManagingMenu} disabled={isManagingChildDetails}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                <span>Manage Menu</span>
              </button>
            </div>}
          </aside>}

          {normalizedSubmittedQuery ? (
            <section className="about-content about-search-results" aria-live="polite" aria-label="About Us search results">
              <header className="about-search-results-header">
                {isSearchingAbout
                  ? <p className="about-search-results-summary">Searching for “{submittedQuery.trim()}”...</p>
                  : <p className="about-search-results-summary">
                    {aboutSearchResults.length} {aboutSearchResults.length === 1 ? 'result' : 'results'} across {new Set(aboutSearchResults.map((result) => result.path)).size || 0} {new Set(aboutSearchResults.map((result) => result.path)).size === 1 ? 'area' : 'areas'} for “{submittedQuery.trim()}”
                  </p>}
                {aboutSearchError && <p className="about-search-results-error" role="alert">{aboutSearchError}</p>}
              </header>
              <div className="about-search-results-list">
                {!isSearchingAbout && !aboutSearchError && aboutSearchResults.length === 0 && <p className="about-search-results-empty">No results found for “{submittedQuery.trim()}”.</p>}
                {aboutSearchResults.map((result) => (
                  <button
                    key={result.id}
                    className="about-search-result-card"
                    type="button"
                    onClick={() => void openAboutSearchResult(result)}
                  >
                    <p className="about-search-result-path">{result.path}</p>
                    <h3>{result.title}</h3>
                    <p>{result.description}</p>
                    <span className="about-search-result-type">PAGE</span>
                  </button>
                ))}
              </div>
            </section>
          ) : isManagingMenu ? (
            <section className="parent-manager menu-manager" aria-labelledby="menu-manager-title">
              <header className="parent-manager-header">
                <div>
                  <h2 id="menu-manager-title">About Us Menu Configuration</h2>
                  <p>Manage the About Us side menu groups</p>
                </div>
                <div className="parent-manager-actions">
                  <span className="parent-manager-count">{draftParentItems.length} {draftParentItems.length === 1 ? 'item' : 'items'}</span>
                  <button className="parent-manager-cancel" type="button" data-tooltip="Cancel menu changes" onClick={cancelManagingMenu} disabled={isSavingParent}>Cancel</button>
                  <button className="parent-manager-save" type="button" data-tooltip={isSavingParent ? 'Saving menu changes' : 'Save menu changes'} onClick={saveParentMenu} disabled={isSavingParent}>{isSavingParent ? 'Saving...' : 'Save'}</button>
                </div>
              </header>
              <div className="parent-manager-body">
                <label className="parent-manager-label" htmlFor="new-parent-item">Add Items</label>
                <div className="parent-manager-add">
                  <input id="new-parent-item" value={newParentLabel} maxLength={100} onChange={(event) => { setNewParentLabel(event.target.value); setMenuSaveError('') }} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); addParentItem() } }} placeholder="Type Item Name" />
                  <label className="parent-manager-subcategory-toggle">
                    <input
                      type="checkbox"
                      checked={newParentHasSubcategory === true}
                      onChange={(event) => setNewParentHasSubcategory(event.target.checked)}
                    />
                    <span>Have Subcategory</span>
                  </label>
                  <button type="button" data-tooltip="Add menu item" onClick={addParentItem}>Add</button>
                </div>
                <h3 className="parent-manager-list-title">Menu Items</h3>
                <div className="parent-manager-list">
                  {draftParentItems.map((item, index) => (
                    <div className="parent-manager-row" key={item.id ?? `new-parent-${index}`}>
                      <span className="parent-manager-index">{index + 1}</span>
                      <input value={item.label} maxLength={100} onChange={(event) => updateDraftParent(index, event.target.value)} aria-label={`Menu item ${index + 1} name`} />
                      <label className="parent-manager-row-toggle">
                        <input
                          type="checkbox"
                          checked={item.hasSubcategory === true}
                          onChange={(event) => updateDraftParentHasSubcategory(index, event.target.checked)}
                          aria-label={`Menu item ${index + 1} have subcategory`}
                        />
                        <span>Have Subcategory</span>
                      </label>
                      <div className="parent-manager-row-actions">
                        <button type="button" aria-label={`Move menu item ${index + 1} up`} data-tooltip="Move up" onClick={() => moveDraftParent(index, -1)} disabled={index === 0}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 19V5m-6 6 6-6 6 6" /></svg>
                        </button>
                        <button type="button" aria-label={`Move menu item ${index + 1} down`} data-tooltip="Move down" onClick={() => moveDraftParent(index, 1)} disabled={index === draftParentItems.length - 1}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 5v14m6-6-6 6-6-6" /></svg>
                        </button>
                        <button className="parent-manager-delete" type="button" aria-label={`Remove menu item ${index + 1}`} data-tooltip="Remove item" onClick={() => removeDraftParent(index)}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M10 11v6" /><path d="M14 11v6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M3 6h18" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                        </button>
                      </div>
                    </div>
                  ))}
                  {draftParentItems.length === 0 && <p className="parent-manager-empty">No menu items yet.</p>}
                </div>
                {menuSaveError && <p className="parent-manager-error" role="alert">{menuSaveError}</p>}
              </div>
            </section>
          ) : managingParent ? (
            <section className="parent-manager" aria-labelledby="parent-manager-title">
              <header className="parent-manager-header">
                <div>
                  <h2 id="parent-manager-title">{managingParent.label}</h2>
                  <p>Manage the items listed under {managingParent.label}</p>
                </div>
                <div className="parent-manager-actions">
                  <span className="parent-manager-count">{draftChildren.length} {draftChildren.length === 1 ? 'item' : 'items'}</span>
                  <button className="parent-manager-cancel" type="button" data-tooltip="Cancel changes" onClick={cancelManagingParent} disabled={isSavingParent}>Cancel</button>
                  <button className="parent-manager-save" type="button" data-tooltip={isSavingParent ? 'Saving changes' : 'Save changes'} onClick={saveParentChildren} disabled={isSavingParent}>{isSavingParent ? 'Saving...' : 'Save'}</button>
                </div>
              </header>
              <div className="parent-manager-body">
                <label className="parent-manager-label" htmlFor="new-parent-child">Add Items</label>
                <div className="parent-manager-add">
                  <input id="new-parent-child" value={newChildLabel} maxLength={100} onChange={(event) => { setNewChildLabel(event.target.value); setParentSaveError('') }} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); addParentChild() } }} placeholder="Type Item Name" />
                  <button type="button" data-tooltip="Add item" onClick={addParentChild}>Add</button>
                </div>
                <h3 className="parent-manager-list-title">List Items</h3>
                <div className="parent-manager-list">
                  {draftChildren.map((child, index) => (
                    <div className="parent-manager-row" key={child.id ?? `new-${index}`}>
                      <span className="parent-manager-index">{index + 1}</span>
                      <input value={child.label} maxLength={100} onChange={(event) => updateDraftChild(index, event.target.value)} aria-label={`Item ${index + 1} name`} />
                      <div className="parent-manager-row-actions">
                        <button type="button" aria-label={`Move item ${index + 1} up`} data-tooltip="Move up" onClick={() => moveDraftChild(index, -1)} disabled={index === 0}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 19V5m-6 6 6-6 6 6" /></svg>
                        </button>
                        <button type="button" aria-label={`Move item ${index + 1} down`} data-tooltip="Move down" onClick={() => moveDraftChild(index, 1)} disabled={index === draftChildren.length - 1}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 5v14m6-6-6 6-6-6" /></svg>
                        </button>
                        <button className="parent-manager-delete" type="button" aria-label={`Remove item ${index + 1}`} data-tooltip="Remove item" onClick={() => removeDraftChild(index)}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M10 11v6" /><path d="M14 11v6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M3 6h18" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                        </button>
                      </div>
                    </div>
                  ))}
                  {draftChildren.length === 0 && <p className="parent-manager-empty">No items yet.</p>}
                </div>
                {parentSaveError && <p className="parent-manager-error" role="alert">{parentSaveError}</p>}
              </div>
            </section>
          ) : activeChildId ? (
            isManagingChildDetails && draftChildDetails ? (
              isLoadingChildEditor ? <section className="about-content about-child-detail-status" aria-live="polite">Loading section content...</section> : (
                <AboutChildManagePage
                  draft={draftChildDetails}
                  contacts={draftChildContacts}
                  availableContacts={availableChildContacts}
                  refCategoryOptions={resourceCategoryOptions}
                  refSubcategoryOptions={resourceSubcategoryOptions}
                  contentItems={draftChildContent}
                  onChange={updateDraftChildDetails}
                  onChangeContact={updateDraftChildContact}
                  onChangeContent={updateDraftChildContent}
                  onChangeContentFile={setDraftChildContentFile}
                  onAddContact={addDraftChildContact}
                  onRemoveContact={requestDraftChildContactRemoval}
                  onMoveContact={moveDraftChildContact}
                  onAddContent={addDraftChildContent}
                  onRemoveContent={removeDraftChildContent}
                  onMoveContent={moveDraftChildContent}
                  onCancel={cancelManagingChildDetails}
                  onSave={() => void saveChildDetails()}
                  isSaving={isSavingChildDetails}
                  hasChanges={hasChildDetailsChanges()}
                  saveError={childDetailsSaveError}
                />
              )
            ) : (
              <AboutChildDetailPage child={activeChildDetails} contacts={activeChildContacts} contentItems={activeChildContent} isLoading={isLoadingChildDetails} error={childDetailsError} contactError={childContactsError} contentError={childContentError} canManageContent={canManageContent} onManage={() => void startManagingChildDetails()} />
            )
          ) : activeItem === 'Leadership' ? (
            isManagingLeadership ? <LeadershipContentEditor content={draftLeadershipContent} onChange={updateLeadershipContent} onImageFileChange={updateLeadershipImageFile} onCancel={cancelManagingLeadership} onSave={saveLeadershipContent} saveError={leadershipSaveError} /> : <LeadershipPage content={leadershipContent} canManageContent={canManageContent} onManage={startManagingLeadership} />
          ) : (
            <section className="about-content about-child-detail-status">Select a section to view its details.</section>
          )}
        </div>
      </div>
      {pendingChildDelete && <div className="delete-confirm-backdrop">
        <section className="delete-confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="delete-confirm-title" aria-describedby="delete-confirm-description">
          <div className="delete-confirm-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 11v6" /><path d="M14 11v6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M3 6h18" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
          </div>
          <h2 id="delete-confirm-title">Delete menu item?</h2>
          <p id="delete-confirm-description"><strong>{pendingChildDelete.childLabel}</strong> will be removed from the menu. This can&apos;t be undone.</p>
          <div className="delete-confirm-actions">
            <button className="delete-confirm-cancel" type="button" data-tooltip="Cancel deletion" onClick={() => setPendingChildDelete(null)} disabled={isDeletingChild}>Cancel</button>
            <button className="delete-confirm-submit" type="button" data-tooltip="Confirm deletion" onClick={() => { const pending = pendingChildDelete; setPendingChildDelete(null); void deleteChildItem(pending.parent, pending.childLabel) }} disabled={isDeletingChild}>Delete</button>
          </div>
        </section>
      </div>}
      {pendingContactDelete && <div className="delete-confirm-backdrop">
        <section className="delete-confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="contact-delete-confirm-title" aria-describedby="contact-delete-confirm-description">
          <div className="delete-confirm-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 11v6" /><path d="M14 11v6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M3 6h18" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
          </div>
          <h2 id="contact-delete-confirm-title">Remove team member?</h2>
          <p id="contact-delete-confirm-description"><strong>{pendingContactDelete.name}</strong> will be removed from Contact the Team.</p>
          <div className="delete-confirm-actions">
            <button className="delete-confirm-cancel" type="button" data-tooltip="Cancel removal" onClick={() => setPendingContactDelete(null)}>Cancel</button>
            <button className="delete-confirm-submit" type="button" data-tooltip="Confirm removal" onClick={() => {
              const pending = pendingContactDelete
              setPendingContactDelete(null)
              removeDraftChildContact(pending.index)
            }}>Remove</button>
          </div>
        </section>
      </div>}
      {childDetailsSavedMessage && <div className="delete-confirm-backdrop">
        <section className="delete-confirm-dialog save-success-dialog" role="dialog" aria-modal="true" aria-labelledby="child-save-success-title" aria-describedby="child-save-success-description">
          {childDetailsConfirmationTitle === 'Changes discarded' && <button className="save-success-close" type="button" aria-label="Close confirmation" data-tooltip="Close confirmation" onClick={() => setChildDetailsSavedMessage('')}><Icon name="close" /></button>}
          <div className={`save-success-icon ${childDetailsConfirmationTitle === 'Changes discarded' ? 'discarded' : ''}`} aria-hidden="true">
            {childDetailsConfirmationTitle === 'Changes discarded'
              ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
              : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 4 4L19 6" /></svg>}
          </div>
          <h2 id="child-save-success-title">{childDetailsConfirmationTitle}</h2>
          <p id="child-save-success-description">{childDetailsSavedMessage}</p>
          <div className="delete-confirm-actions">
            <button className="save-success-done" type="button" data-tooltip="Close confirmation" onClick={() => {
              const wasDiscarded = childDetailsConfirmationTitle === 'Changes discarded'
              setChildDetailsSavedMessage('')
              if (!wasDiscarded) return
              setIsManagingChildDetails(false)
              isManagingChildDetailsPinned.current = false
              clearDraftPreviewUrls(draftChildContent)
              setDraftChildDetails(null)
              setDraftChildContacts([])
              setDraftChildContent([])
              setRemovedChildContactIds([])
              setRemovedChildContentIds([])
            }}>Done</button>
          </div>
        </section>
      </div>}
    </main>
  )
}

type RoleName = 'Admin' | 'Content Manager' | 'User'

function parseConfiguredGroupNames(value: string | undefined): string[] {
  const rawValue = (value ?? '').trim()
  if (!rawValue) return []

  const cleanedValue = ['[', ']', '{', '}', '(', ')', '"', "'"]
    .reduce((result, character) => result.replaceAll(character, ''), rawValue)

  const parsedValues = cleanedValue
    .split(/[;\n,|]+/)
    .map((groupName) => groupName.trim())
    .filter(Boolean)

  return [...new Set(parsedValues)]
}

function normalizeGroupName(value: string): string {
  return ['[', ']', '{', '}', '(', ')', '"', "'"]
    .reduce((result, character) => result.replaceAll(character, ''), value.trim())
    .replace(/\s+/g, '')
    .toLowerCase()
}

function getEnvironmentVariableValue(variableName: string, appSettings?: Record<string, unknown>): string | undefined {
  const appWindow = globalThis as typeof globalThis & {
    __ENV__?: Record<string, string | undefined>
    __powerAppEnv__?: Record<string, string | undefined>
    AppConfig?: Record<string, string | undefined>
    PowerPlatform?: Record<string, unknown>
    PowerApps?: Record<string, unknown>
    PowerPlatformEnvironment?: Record<string, string | undefined>
  }

  const importMetaEnv = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env
  const powerAppsEnvironment = appWindow.PowerApps?.Environment as Record<string, string | undefined> | undefined
  const candidateValues = [
    appSettings?.[variableName],
    importMetaEnv?.[variableName],
    appWindow.__ENV__?.[variableName],
    appWindow.__powerAppEnv__?.[variableName],
    appWindow.AppConfig?.[variableName],
    appWindow.PowerPlatform?.[variableName],
    appWindow.PowerPlatformEnvironment?.[variableName],
    appWindow.PowerApps?.[variableName],
    powerAppsEnvironment?.[variableName],
  ]

  return candidateValues.find((value): value is string => typeof value === 'string' && value.trim().length > 0)?.trim()
}

const roleEnvironmentVariableNames = ['ca_envVarAdmin', 'ca_envVarContentManager', 'ca_envVarUser'] as const

async function loadRoleEnvironmentVariables(): Promise<{ values: Record<string, string>; error?: string }> {
  const schemaFilter = roleEnvironmentVariableNames.map((name) => `schemaname eq '${name}'`).join(' or ')
  const definitionsResult = await EnvironmentvariabledefinitionsService.getAll({
    select: ['environmentvariabledefinitionid', 'schemaname', 'defaultvalue'],
    filter: schemaFilter,
  })

  if (!definitionsResult.success) {
    return { values: {}, error: getDataErrorMessage(definitionsResult.error, 'Environment variable definitions could not be read.') }
  }

  const definitions = definitionsResult.data ?? []
  const definitionIds = definitions.map((definition) => definition.environmentvariabledefinitionid).filter(Boolean)
  const valuesResult = definitionIds.length > 0
    ? await EnvironmentvariablevaluesService.getAll({
      select: ['value', '_environmentvariabledefinitionid_value'],
      filter: definitionIds.map((id) => `_environmentvariabledefinitionid_value eq ${id}`).join(' or '),
    })
    : undefined

  if (valuesResult && !valuesResult.success) {
    return { values: {}, error: getDataErrorMessage(valuesResult.error, 'Environment variable current values could not be read.') }
  }

  const valuesByDefinitionId = new Map(
    (valuesResult?.data ?? []).map((value) => [normalizeGroupName(value._environmentvariabledefinitionid_value ?? ''), value.value]),
  )
  const values: Record<string, string> = {}

  definitions.forEach((definition) => {
    const currentValue = valuesByDefinitionId.get(normalizeGroupName(definition.environmentvariabledefinitionid))
    const value = currentValue ?? definition.defaultvalue
    if (definition.schemaname && typeof value === 'string' && value.trim()) values[definition.schemaname] = value
  })

  return { values }
}

function getCurrentUserEmail(): string {
  const appWindow = globalThis as typeof globalThis & {
    appContext?: { user?: { objectId?: string; primaryEmail?: string; userPrincipalName?: string; email?: string; fullName?: string; groups?: string[] | string } }
    Xrm?: { Utility?: { getGlobalContext?: () => { userSettings?: { objectId?: string; primaryEmail?: string; userPrincipalName?: string; userName?: string; userGroups?: string[] | string } } } }
    PowerApps?: { getCurrentUser?: () => { objectId?: string; primaryEmail?: string; userPrincipalName?: string; email?: string } | undefined; userContext?: { groups?: string[] | string } }
    currentUserEmail?: string
    userEmail?: string
    primaryEmail?: string
    objectId?: string
  }

  const candidates = [
    appWindow.appContext?.user?.userPrincipalName,
    appWindow.Xrm?.Utility?.getGlobalContext?.()?.userSettings?.userPrincipalName,
    appWindow.PowerApps?.getCurrentUser?.()?.userPrincipalName,
    appWindow.appContext?.user?.primaryEmail,
    appWindow.Xrm?.Utility?.getGlobalContext?.()?.userSettings?.primaryEmail,
    appWindow.PowerApps?.getCurrentUser?.()?.primaryEmail,
    appWindow.primaryEmail,
    appWindow.currentUserEmail,
    appWindow.userEmail,
  ]

  return candidates.find((value): value is string => typeof value === 'string' && value.trim().length > 0)?.trim() ?? ''
}

function getCurrentUserObjectId(): string {
  const appWindow = globalThis as typeof globalThis & {
    appContext?: { user?: { objectId?: string; userPrincipalName?: string } }
    Xrm?: { Utility?: { getGlobalContext?: () => { userSettings?: { userId?: string; objectId?: string; userPrincipalName?: string } } } }
    PowerApps?: { getCurrentUser?: () => { objectId?: string; userPrincipalName?: string } | undefined }
    currentUserObjectId?: string
    userObjectId?: string
    objectId?: string
  }

  const candidates = [
    appWindow.appContext?.user?.objectId,
    appWindow.Xrm?.Utility?.getGlobalContext?.()?.userSettings?.objectId,
    appWindow.Xrm?.Utility?.getGlobalContext?.()?.userSettings?.userId,
    appWindow.PowerApps?.getCurrentUser?.()?.objectId,
    appWindow.currentUserObjectId,
    appWindow.userObjectId,
    appWindow.objectId,
  ]

  return candidates.find((value): value is string => typeof value === 'string' && value.trim().length > 0)?.trim() ?? ''
}

function logUserContextDebug(appSettings?: Record<string, unknown>): void {
  const appWindow = globalThis as typeof globalThis & {
    appContext?: { user?: { objectId?: string; userPrincipalName?: string; primaryEmail?: string; email?: string; fullName?: string; groups?: string[] | string } }
    Xrm?: { Utility?: { getGlobalContext?: () => { userSettings?: { objectId?: string; userName?: string; userPrincipalName?: string; primaryEmail?: string; userGroups?: string[] | string } } } }
    PowerApps?: { getCurrentUser?: () => { objectId?: string; primaryEmail?: string; email?: string; userPrincipalName?: string } | undefined; userContext?: { groups?: string[] | string } }
  }

  const currentEmail = getCurrentUserEmail()
  const currentObjectId = getCurrentUserObjectId()
  const configuredGroups = {
    Admin: parseConfiguredGroupNames(getEnvironmentVariableValue('ca_envVarAdmin', appSettings)),
    'Content Manager': parseConfiguredGroupNames(getEnvironmentVariableValue('ca_envVarContentManager', appSettings)),
    User: parseConfiguredGroupNames(getEnvironmentVariableValue('ca_envVarUser', appSettings)),
  }

  console.group('Power Apps User Context')
  console.log('appContext.user', appWindow.appContext?.user)
  console.log('appContext', appWindow.appContext)
  console.log('Xrm user settings', appWindow.Xrm?.Utility?.getGlobalContext?.()?.userSettings)
  console.log('PowerApps.getCurrentUser()', appWindow.PowerApps?.getCurrentUser?.())
  console.log('IUserContext userPrincipalName', appWindow.appContext?.user?.userPrincipalName ?? appWindow.Xrm?.Utility?.getGlobalContext?.()?.userSettings?.userPrincipalName ?? appWindow.PowerApps?.getCurrentUser?.()?.userPrincipalName)
  console.log('Resolved objectId', currentObjectId)
  console.log('Resolved email', currentEmail)
  console.log('Configured role groups from app settings / env vars', configuredGroups)
  console.log('Current user groups from app context', getCurrentUserGroups())
  console.groupEnd()
}

function getCurrentUserGroups(): string[] {
  const appWindow = globalThis as typeof globalThis & {
    appContext?: { user?: { groups?: string[] | string } }
    __currentUserGroups?: string[] | string
    currentUserGroups?: string[] | string
    userGroups?: string[] | string
    PowerApps?: { userContext?: { groups?: string[] | string } }
    Xrm?: { Utility?: { getGlobalContext?: () => { userSettings?: { userGroups?: string[] | string } } } }
  }

  const groups = [
    appWindow.appContext?.user?.groups,
    appWindow.__currentUserGroups,
    appWindow.currentUserGroups,
    appWindow.userGroups,
    appWindow.PowerApps?.userContext?.groups,
    appWindow.Xrm?.Utility?.getGlobalContext?.()?.userSettings?.userGroups,
  ]

  return groups
    .flatMap((groupList) => typeof groupList === 'string' ? groupList.split(/[;\n,|]+/) : Array.isArray(groupList) ? groupList : [])
    .map((groupName) => groupName.trim())
    .filter(Boolean)
}

type EntraGroupLookup = {
  groupIds: string[]
  matchedGroupIds: string[]
  status: string
}

async function getCurrentUserAdGroupNamesFromEntra(userUpn: string, userObjectId?: string, appSettings?: Record<string, unknown>): Promise<EntraGroupLookup> {
  const candidateIdentifiers = [...new Set([userObjectId, userUpn].filter((value): value is string => typeof value === 'string' && value.trim().length > 0).map((value) => value.trim()))]

  if (candidateIdentifiers.length === 0) return { groupIds: [], matchedGroupIds: [], status: 'No user ID or UPN is available.' }

  const envGroupValues = [
    getEnvironmentVariableValue('ca_envVarAdmin', appSettings),
    getEnvironmentVariableValue('ca_envVarContentManager', appSettings),
    getEnvironmentVariableValue('ca_envVarUser', appSettings),
  ]
    .flatMap((value) => parseConfiguredGroupNames(value))
    .map((groupId) => groupId.trim())
    .filter(Boolean)
    .map(normalizeGroupName)

  let receivedEmptyMembershipResponse = false

  for (const targetUserId of candidateIdentifiers) {
    try {
      const memberGroupsResult = await MicrosoftEntraIDService.GetMemberGroupsV2(targetUserId, { securityEnabledOnly: false })
      if (!memberGroupsResult.success || !memberGroupsResult.data?.value?.length) {
        console.warn('Unable to resolve Entra groups for user', targetUserId, memberGroupsResult.error)
        if (memberGroupsResult.success && memberGroupsResult.data?.value) receivedEmptyMembershipResponse = true
        continue
      }

      const groupIds = memberGroupsResult.data.value
        .filter((groupId): groupId is string => typeof groupId === 'string' && Boolean(groupId.trim()))
        .map((groupId) => groupId.trim())
      const matchedGroupIds = groupIds.filter((groupId) => envGroupValues.some((envGroupValue) => normalizeGroupName(envGroupValue) === normalizeGroupName(groupId)))

      return {
        groupIds,
        matchedGroupIds,
        status: envGroupValues.length === 0
          ? 'Entra groups loaded, but no configured role-group IDs were loaded.'
          : matchedGroupIds.length > 0
            ? 'Configured role-group match found.'
            : 'Entra groups loaded, but none match the configured role-group IDs.',
      }

      return { groupIds: [], matchedGroupIds: [], status: 'No Entra groups were returned for this user.' }
    } catch (error) {
      console.warn('Failed to load current user Entra group IDs for', targetUserId, error)
    }
  }

  if (receivedEmptyMembershipResponse) return { groupIds: [], matchedGroupIds: [], status: 'Entra returned no groups for this user.' }
  return { groupIds: [], matchedGroupIds: [], status: 'Entra group lookup failed for the available user identifiers.' }
}

const rolePriority = [
  { role: 'Admin', variableName: 'ca_envVarAdmin' },
  { role: 'Content Manager', variableName: 'ca_envVarContentManager' },
  { role: 'User', variableName: 'ca_envVarUser' },
] as const satisfies ReadonlyArray<{ role: RoleName; variableName: string }>

function getMatchedRolesFromEntraGroups(groupIds: string[], appSettings?: Record<string, unknown>): RoleName[] {
  const normalizedGroupIds = new Set(groupIds.map(normalizeGroupName))
  return rolePriority
    .filter(({ variableName }) => parseConfiguredGroupNames(getEnvironmentVariableValue(variableName, appSettings))
      .some((value) => normalizedGroupIds.has(normalizeGroupName(value))))
    .map(({ role }) => role)
}

function App() {
  const [selectedRole, setSelectedRole] = useState<RoleName>('User')

  useEffect(() => {
    let isMounted = true

    const hydrateUserContext = async () => {
      try {
        const context = await getContext()
        const nextUserObjectId = context?.user?.objectId ?? getCurrentUserObjectId()
        const nextUserUpn = context?.user?.userPrincipalName ?? getCurrentUserEmail()
        const appSettings = context?.app?.appSettings as Record<string, unknown> | undefined
        const environmentVariableResult = await loadRoleEnvironmentVariables()
        const roleSettings = { ...appSettings, ...environmentVariableResult.values }
        if (isMounted) {
          const lookup = await getCurrentUserAdGroupNamesFromEntra(nextUserUpn, nextUserObjectId, roleSettings)
          const matchedRoles = getMatchedRolesFromEntraGroups(lookup.groupIds, roleSettings)
          const resolvedRole = matchedRoles[0] ?? 'User'
          setSelectedRole(resolvedRole)
          console.log('Entra group lookup', { userUpn: nextUserUpn, roleEnvironmentVariables: environmentVariableResult, ...lookup })
        }
        if (isMounted) logUserContextDebug(roleSettings)
      } catch (error) {
        console.warn('Power Apps context is not available in this host.', error)
      }
    }

    hydrateUserContext()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand" aria-label="Johnson & Johnson Audit Verse">
          <span className="brand-mark">Johnson&amp;Johnson</span>
          <span className="brand-divider" />
          <span className="brand-product">Audit Verse</span>
        </div>
      </header>
      <AboutUsPage isAdmin={selectedRole === 'Admin'} canManageContent={selectedRole !== 'User'} />
    </div>
  )
}

export default App
