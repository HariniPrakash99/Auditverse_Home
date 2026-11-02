import { useState, useRef } from 'react'
import Icon from '../common/Icon'
import type { ContentItem, ResourceItem } from '../../data/contentData'
import { validateName } from '../../utils/nameValidation'
import { isValidHttpsUrl } from '../../utils/urlValidation'

interface ManageContentProps {
  content: ContentItem
  onCancel: () => void
  onSave: (content: ContentItem) => void
}

function ManageContent({ content, onCancel, onSave }: ManageContentProps) {
  const [title, setTitle] = useState(content.title)
  const [description, setDescription] = useState(content.description ?? '')
  const [items, setItems] = useState<ResourceItem[]>([...content.resources])
  const [newTitle, setNewTitle] = useState('')
  const [newUrl, setNewUrl] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editUrl, setEditUrl] = useState('')

  const [errorMsg, setErrorMsgState] = useState<string | null>(null)
  const errorMsgTimeoutRef = useRef<number | null>(null)

  const setErrorMsg = (msg: string | null) => {
    if (errorMsgTimeoutRef.current) {
      window.clearTimeout(errorMsgTimeoutRef.current)
    }
    setErrorMsgState(msg)
    if (msg) {
      errorMsgTimeoutRef.current = window.setTimeout(() => {
        setErrorMsgState(null)
        errorMsgTimeoutRef.current = null
      }, 5000)
    }
  }

  const validateItem = (itemTitle: string, itemUrl: string, ignoreId?: string): string | null => {
    const trimmedTitle = itemTitle.trim()
    const trimmedUrl = itemUrl.trim()
    const titleError = validateName(itemTitle, 'Title')
    if (titleError) return titleError
    if (!trimmedUrl) return 'Please enter a URL.'
    if (!/[a-zA-Z0-9]/.test(trimmedUrl)) return 'Only special characters are not allowed.'
    const duplicateTitle = items.some(
      (i) => i.id !== ignoreId && i.name.trim().toLowerCase() === trimmedTitle.toLowerCase(),
    )
    const duplicateLink = items.some(
      (i) => i.id !== ignoreId && i.url && i.url.trim().toLowerCase() === trimmedUrl.toLowerCase(),
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

  const updateItem = (id: string, update: Partial<ResourceItem>) => setItems((current) => current.map((item) => item.id === id ? { ...item, ...update } : item))
  const moveItem = (index: number, direction: -1 | 1) => {
    const target = index + direction
    if (target < 0 || target >= items.length) return
    setItems((current) => {
      const next = [...current]
      const [item] = next.splice(index, 1)
      next.splice(target, 0, item)
      return next
    })
  }
  const startEdit = (item: ResourceItem) => { setErrorMsg(null); setEditingId(item.id); setEditTitle(item.name); setEditUrl(item.url ?? '') }
  const saveEdit = (id: string) => {
    const name = editTitle.trim()
    const url = editUrl.trim()
    const err = validateItem(name, url, id)
    if (err) {
      setErrorMsg(err)
      return
    }
    setErrorMsg(null)
    updateItem(id, { name, url })
    setEditingId(null)
  }
  const addItem = () => {
    const name = newTitle.trim()
    const url = newUrl.trim()
    const err = validateItem(name, url)
    if (err) {
      setErrorMsg(err)
      return
    }
    setErrorMsg(null)
    setItems((current) => [...current, { id: `${content.id}-resource-${Date.now()}`, name, type: 'link', url }])
    setNewTitle('')
    setNewUrl('')
  }

  return <div className="manage-content-view">
    {errorMsg && (
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
          <span className="toast-message" style={{ color: '#ffffff' }}>{errorMsg}</span>
        </div>
      </div>
    )}
    <div className="manage-content-header"><h2>Manage Content</h2><div className="manage-content-actions"><button className="manage-cancel" type="button" onClick={onCancel}>Cancel</button><button className="manage-save" type="button" onClick={() => {
      const titleError = validateName(title, 'Title')
      if (titleError) {
        setErrorMsg(titleError)
        return
      }
      if (description.trim() && !/[a-zA-Z0-9]/.test(description.trim())) {
        setErrorMsg('Only special characters are not allowed.')
        return
      }
      const specialOnly = items.find((i) => i.name.trim() && !/[a-zA-Z0-9]/.test(i.name.trim()))
      if (specialOnly) {
        setErrorMsg('Only special characters are not allowed.')
        return
      }
      onSave({ ...content, title, description, resources: items })
    }}>Save Changes</button></div></div>
    <label className="manage-field"><span>Title</span><input value={title} onChange={(event) => setTitle(event.target.value)} /></label>
    <label className="manage-field"><span>Description</span><textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={3} /></label>
    <h3 className="manage-add-heading">Add Items</h3>
    <div className="manage-add-row"><input value={newTitle} onChange={(event) => setNewTitle(event.target.value)} placeholder="Link Title" /><input value={newUrl} onChange={(event) => setNewUrl(event.target.value)} placeholder="Link URL" /><button className="manage-add-button" type="button" onClick={addItem} disabled={!newTitle.trim() || !newUrl.trim()} style={{ backgroundColor: '#ed1b24', color: '#ffffff', opacity: !newTitle.trim() || !newUrl.trim() ? 0.45 : 1, cursor: !newTitle.trim() || !newUrl.trim() ? 'not-allowed' : 'pointer' }}>Add</button></div>
    <div className="manage-items">{items.map((item, index) => editingId === item.id ? <div className="manage-item manage-item-editing" key={item.id}><input value={editTitle} onChange={(event) => setEditTitle(event.target.value)} aria-label="Edit link title" /><input value={editUrl} onChange={(event) => setEditUrl(event.target.value)} placeholder="Link URL" aria-label="Edit link URL" /><button type="button" onClick={() => saveEdit(item.id)}>Save</button><button type="button" onClick={() => setEditingId(null)}>Cancel</button></div> : <div className="manage-item" key={item.id}><span className="manage-item-name"><Icon name="link" size={13} />{item.name}</span><div className="manage-item-actions"><button type="button" aria-label={`Edit ${item.name}`} onClick={() => startEdit(item)}><Icon name="edit" size={13} /></button><button type="button" aria-label={`Move ${item.name} up`} onClick={() => moveItem(index, -1)}><Icon name="arrow-up" size={13} /></button><button type="button" aria-label={`Move ${item.name} down`} onClick={() => moveItem(index, 1)}><Icon name="arrow-down" size={13} /></button><button className="manage-delete" type="button" aria-label={`Delete ${item.name}`} onClick={() => setItems((current) => current.filter((currentItem) => currentItem.id !== item.id))}><Icon name="trash" size={13} /></button></div></div>)}</div>
  </div>
}

export default ManageContent