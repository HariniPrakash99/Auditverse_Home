import { useState, useRef } from 'react'
import Icon from '../common/Icon'
import './SectionManageContent.css'
import { validateName } from '../../utils/nameValidation'

export interface ManageListItem {
  id: string | null
  name: string
  description?: string
}

interface SectionManageContentProps {
  sectionTitle: string
  items: ManageListItem[]
  onItemsChange: (items: ManageListItem[]) => void
  onCancel: () => void
  onSave: (items: ManageListItem[]) => void | Promise<void>
  hasDescription?: boolean
}

function SectionManageContent({
  sectionTitle,
  items,
  onItemsChange,
  onCancel,
  onSave,
  hasDescription = false,
}: SectionManageContentProps) {
  const [newItem, setNewItem] = useState('')
  const [newItemDesc, setNewItemDesc] = useState('')
  const [message, setMessageState] = useState('')
  const messageTimeoutRef = useRef<number | null>(null)

  const setMessage = (msg: string) => {
    if (messageTimeoutRef.current) {
      window.clearTimeout(messageTimeoutRef.current)
    }
    setMessageState(msg)
    if (msg) {
      messageTimeoutRef.current = window.setTimeout(() => {
        setMessageState('')
        messageTimeoutRef.current = null
      }, 5000)
    }
  }

  const moveItem = (index: number, direction: -1 | 1) => {
    const target = index + direction
    if (target < 0 || target >= items.length) {
      return
    }
    const next = [...items]
    const [item] = next.splice(index, 1)
    next.splice(target, 0, item)
    onItemsChange(next)
    setMessage('')
  }

  const addItem = () => {
    const value = newItem.trim()
    const descValue = newItemDesc.trim()
    const nameError = validateName(newItem)
    if (nameError) {
      setMessage(nameError)
      return
    }

    if (hasDescription && !descValue) {
      setMessage('Please enter a description.')
      return
    }

    if (hasDescription && descValue && !/[a-zA-Z0-9]/.test(descValue)) {
      setMessage('Only special characters are not allowed.')
      return
    }

    const isNameDuplicate = items.some(
      (item) => item.name.trim().toLowerCase() === value.toLowerCase(),
    )
    const isDescDuplicate =
      hasDescription && descValue
        ? items.some(
            (item) =>
              (item.description ?? '').trim().toLowerCase() ===
              descValue.toLowerCase(),
          )
        : false

    if (isNameDuplicate && isDescDuplicate) {
      setMessage(
        `Item name "${value}" and description "${descValue}" already exist.`,
      )
      return
    }

    if (isNameDuplicate) {
      setMessage(`Item name "${value}" already exists.`)
      return
    }

    if (isDescDuplicate) {
      setMessage(`Description "${descValue}" already exists.`)
      return
    }

    onItemsChange([
      ...items,
      {
        id: null,
        name: value,
        ...(hasDescription ? { description: descValue } : {}),
      },
    ])
    setNewItem('')
    setNewItemDesc('')
    setMessage('')
  }

  const updateItem = (
    index: number,
    field: 'name' | 'description',
    value: string,
  ) => {
    const next = items.map((item, itemIndex) =>
      itemIndex === index ? { ...item, [field]: value } : item,
    )
    onItemsChange(next)
    setMessage('')
  }

  const deleteItem = (index: number) => {
    onItemsChange(items.filter((_, itemIndex) => itemIndex !== index))
    setMessage('')
  }

  const handleSave = async () => {
    const invalidItem = items.find((item) => validateName(item.name))
    if (invalidItem) {
      setMessage(validateName(invalidItem.name) ?? 'Invalid name.')
      return
    }

    if (hasDescription) {
      const hasBlankDesc = items.some(
        (item) => !(item.description ?? '').trim(),
      )
      if (hasBlankDesc) {
        setMessage('Description cannot be blank.')
        return
      }

      const hasOnlySpecialDesc = items.some(
        (item) => (item.description ?? '').trim() && !/[a-zA-Z0-9]/.test((item.description ?? '').trim()),
      )
      if (hasOnlySpecialDesc) {
        setMessage('Only special characters are not allowed.')
        return
      }
    }

    const normalizedItems = items.map((item) => item.name.trim().toLowerCase())
    const duplicateNameIndex = normalizedItems.findIndex(
      (item, index) => normalizedItems.indexOf(item) !== index,
    )
    const isNameDuplicate = duplicateNameIndex !== -1

    let isDescDuplicate = false
    let duplicateDescIndex = -1
    if (hasDescription) {
      const normalizedDescs = items.map((item) =>
        (item.description ?? '').trim().toLowerCase(),
      )
      duplicateDescIndex = normalizedDescs.findIndex(
        (desc, index) => desc !== '' && normalizedDescs.indexOf(desc) !== index,
      )
      isDescDuplicate = duplicateDescIndex !== -1
    }

    if (isNameDuplicate && isDescDuplicate) {
      setMessage(
        `Duplicate item name "${items[duplicateNameIndex].name}" and duplicate description "${items[duplicateDescIndex].description}" are not allowed.`,
      )
      return
    }

    if (isNameDuplicate) {
      setMessage(
        `Duplicate item name "${items[duplicateNameIndex].name}" is not allowed.`,
      )
      return
    }

    if (isDescDuplicate) {
      setMessage(
        `Duplicate description "${items[duplicateDescIndex].description}" is not allowed.`,
      )
      return
    }

    try {
      setMessage('')
      await onSave(
        items.map((item) => ({
          id: item.id,
          name: item.name.trim(),
          ...(hasDescription || item.description !== undefined
            ? { description: (item.description ?? '').trim() }
            : {}),
        })),
      )
    } catch (caughtError) {
      console.error('SECTION MANAGE SAVE ERROR:', caughtError)
      setMessage(
        caughtError instanceof Error ? caughtError.message : 'Unable to save changes.',
      )
    }
  }

  return (
    <section className="section-manage-pane pane">
      {/* Nested Inner Big Box */}
      <div className="manage-inner-card">
        {message && (
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
              <span className="toast-message" style={{ color: '#ffffff' }}>{message}</span>
            </div>
          </div>
        )}

        {/* 2. Top Header Banner */}
        <div className="manage-header">
          <div className="manage-header-left">
            <h2 className="manage-header-title">{sectionTitle}</h2>
            <p className="manage-header-subtitle">
              Manage the items listed under {sectionTitle}
            </p>
          </div>

          <div className="manage-header-actions">
            <span className="manage-header-badge">{items.length} items</span>

            <button
              type="button"
              className="manage-header-cancel"
              onClick={onCancel}
            >
              Cancel
            </button>

            <button
              type="button"
              className="manage-header-save"
              onClick={handleSave}
            >
              Save
            </button>
          </div>
        </div>

        {/* 3. "Add Items" Section */}
        <div className="manage-add-section">
          <h3 className="manage-add-label">Add Items</h3>
          {(() => {
            const isAddDisabled = !newItem.trim() || (hasDescription && !newItemDesc.trim())
            return (
              <div className={`manage-add-row ${hasDescription ? 'manage-add-row-with-desc' : ''}`}>
                <input
                  type="text"
                  className="manage-add-input manage-add-name-input"
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      if (!isAddDisabled) {
                        addItem()
                      }
                    }
                  }}
                  placeholder="Type Item Name"
                  aria-label="Type Item Name"
                />
                {hasDescription && (
                  <input
                    type="text"
                    className="manage-add-input manage-add-desc-input"
                    value={newItemDesc}
                    onChange={(e) => setNewItemDesc(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        if (!isAddDisabled) {
                          addItem()
                        }
                      }
                    }}
                    placeholder="Type description"
                    aria-label="Type description"
                  />
                )}
                <button
                  type="button"
                  className="manage-add-btn"
                  onClick={addItem}
                  disabled={isAddDisabled}
                >
                  Add
                </button>
              </div>
            )
          })()}
        </div>

        {/* 4. "List items" Section & Editable Cards */}
        <div className="manage-list-section">
          <h3 className="manage-list-heading">List items</h3>

          <div className="manage-card-list">
            {items.map((item, index) => {
              const isFirstItem = index === 0
              const isLastItem = index === items.length - 1

              return (
                <div
                  key={item.id ?? `item-${index}`}
                  className={`manage-card-row ${hasDescription ? 'manage-card-row-with-desc' : ''}`}
                >
                  {/* Left Section (Order Number + Text Input Control(s)) */}
                  <div className={`manage-card-left ${hasDescription ? 'manage-card-left-with-desc' : ''}`}>
                    <span className="manage-card-index">{index + 1}</span>
                    <input
                      type="text"
                      className="manage-card-title-input"
                      value={item.name}
                      placeholder="Type Item Name"
                      onChange={(e) => updateItem(index, 'name', e.target.value)}
                      aria-label={`Edit ${item.name || `item ${index + 1}`} name`}
                    />
                    {hasDescription && (
                      <input
                        type="text"
                        className="manage-card-desc-input"
                        value={item.description ?? ''}
                        placeholder="Type description"
                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                        aria-label={`Edit ${item.name || `item ${index + 1}`} description`}
                      />
                    )}
                  </div>

                  {/* Right Action Icons Toolbar */}
                  <div className="manage-card-actions">
                    <button
                      type="button"
                      className="manage-card-action-btn move-up"
                      disabled={isFirstItem}
                      onClick={() => moveItem(index, -1)}
                      title="Move Up"
                      aria-label={`Move ${item.name || `item ${index + 1}`} up`}
                    >
                      <Icon name="arrow-up" size={16} strokeWidth={2} />
                    </button>

                    <button
                      type="button"
                      className="manage-card-action-btn move-down"
                      disabled={isLastItem}
                      onClick={() => moveItem(index, 1)}
                      title="Move Down"
                      aria-label={`Move ${item.name || `item ${index + 1}`} down`}
                    >
                      <Icon name="arrow-down" size={16} strokeWidth={2} />
                    </button>

                    <button
                      type="button"
                      className="manage-card-action-btn delete"
                      onClick={() => deleteItem(index)}
                      title="Delete"
                      aria-label={`Delete ${item.name || `item ${index + 1}`}`}
                    >
                      <Icon name="trash" size={16} strokeWidth={2} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

export default SectionManageContent
