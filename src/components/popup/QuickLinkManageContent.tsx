import { useEffect, useRef, useState } from 'react'
import type { QuickLinkItem } from '../../hooks/useQuickLinks'
import type { UserRole } from '../../services/roleService'
import './QuickLinkManageContent.css'
import { validateName } from '../../utils/nameValidation'
import { isValidHttpsUrl } from '../../utils/urlValidation'

interface QuickLinkSubcategory {
  id: string
  name: string
  description: string
  sortOrder: number
  items: QuickLinkItem[]
}

interface QuickLinkManageContentProps {
  subcategory: QuickLinkSubcategory
  saving: boolean
  role: UserRole
  canEditSubcategoryName: boolean
  onCancel: () => void
  onSave: (
    draft: QuickLinkSubcategory | undefined,
  ) => Promise<void>
}

/* =========================================================
   ICONS
   ========================================================= */

const PencilIcon = () => (
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
    className="quick-link-manage-icon"
    aria-hidden="true"
  >
    <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
    <path d="m15 5 4 4" />
  </svg>
)

/*
 * Exact Link-2 icon supplied by user
 */
const LinkIcon = () => (
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
    className="quick-link-gallery-link-icon"
    aria-hidden="true"
  >
    <path d="M9 17H7A5 5 0 0 1 7 7h2" />
    <path d="M15 7h2a5 5 0 1 1 0 10h-2" />
    <line x1="8" x2="16" y1="12" y2="12" />
  </svg>
)

const CheckIcon = () => (
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
    className="quick-link-manage-icon"
    aria-hidden="true"
  >
    <path d="M20 6 9 17l-5-5" />
  </svg>
)

const CrossIcon = () => (
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
    className="quick-link-manage-icon"
    aria-hidden="true"
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
)

const TrashIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="quick-link-manage-icon"
    aria-hidden="true"
  >
    <path d="M3 6h18" />
    <path d="M8 6V4h8v2" />
    <path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v5" />
    <path d="M14 11v5" />
  </svg>
)

const ArrowUpIcon = () => (
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
    className="lucide lucide-arrow-up preview-icon"
    aria-hidden="true"
  >
    <path d="m5 12 7-7 7 7" />
    <path d="M12 19V5" />
  </svg>
)

const ArrowDownIcon = () => (
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
    className="lucide lucide-arrow-down preview-icon"
    aria-hidden="true"
  >
    <path d="M12 5v14" />
    <path d="m19 12-7 7-7-7" />
  </svg>
)

/* =========================================================
   VALIDATION
   ========================================================= */

const normalizeValue = (value: string) =>
  value.trim().toLowerCase()

/* =========================================================
   COMPONENT
   ========================================================= */

const QuickLinkManageContent = ({
  subcategory,
  saving,
  role,
  canEditSubcategoryName,
  onCancel,
  onSave,
}: QuickLinkManageContentProps) => {
  const canEditDescriptionForRole = role === 'admin'
  /*
   * Local draft.
   * Add/Edit/Delete/Move operate only on this draft.
   */
  const [draft, setDraft] =
    useState<QuickLinkSubcategory>(() => ({
      ...subcategory,
      items: subcategory.items.map(
        (item) => ({
          ...item,
        }),
      ),
    }))

  const [editingItemId, setEditingItemId] =
    useState<string | null>(null)

  const [editName, setEditName] =
    useState('')

  const [editLink, setEditLink] =
    useState('')

  const [newName, setNewName] =
    useState('')

  const [newLink, setNewLink] =
    useState('')

  const [notification, setNotification] =
    useState<string | null>(null)
  const notificationTimeoutRef =
    useRef<number | null>(null)

  /*
   * Reset local draft when a different
   * subcategory is selected.
   */
  useEffect(() => {
    setDraft({
      ...subcategory,
      items: subcategory.items.map(
        (item) => ({
          ...item,
        }),
      ),
    })

    setEditingItemId(null)
    setEditName('')
    setEditLink('')
    setNewName('')
    setNewLink('')
    setNotification(null)
    setShowDeleteModal(false)
    setItemToDelete(null)
  }, [subcategory.id])

  useEffect(() => {
    return () => {
      if (notificationTimeoutRef.current) {
        window.clearTimeout(
          notificationTimeoutRef.current,
        )
      }
    }
  }, [])

  /* =========================================================
     NOTIFICATION
     ========================================================= */

  const showNotification = (
    message: string,
  ) => {
    if (notificationTimeoutRef.current) {
      window.clearTimeout(
        notificationTimeoutRef.current,
      )
    }

    setNotification(message)

    notificationTimeoutRef.current =
      window.setTimeout(() => {
        setNotification(null)
        notificationTimeoutRef.current = null
      }, 5000)
  }

  /* =========================================================
     UPDATE LOCAL ITEM
     ========================================================= */

  const updateDraftItem = (
    itemId: string,
    updates: Partial<QuickLinkItem>,
  ) => {
    setDraft((current) => ({
      ...current,
      items: current.items.map(
        (item) =>
          item.id === itemId
            ? {
                ...item,
                ...updates,
              }
            : item,
      ),
    }))
  }

  /* =========================================================
     VALIDATION
     ========================================================= */

  const validateLink = (
    name: string,
    link: string,
    ignoreItemId?: string,
  ): string | null => {
    const trimmedName = name.trim()
    const trimmedLink = link.trim()

    const nameError = validateName(name, 'Link Title')
    if (nameError) {
      return nameError
    }

    if (!trimmedLink) {
      return 'Please enter a Link URL.'
    }

    if (!/[a-zA-Z0-9]/.test(trimmedLink)) {
      return 'Only special characters are not allowed.'
    }

    /*
     * Check duplicate name and duplicate URL.
     */
    const duplicateName =
      draft.items.some(
        (item) =>
          item.id !== ignoreItemId &&
          normalizeValue(item.name) ===
            normalizeValue(trimmedName),
      )

    const duplicateLink =
      draft.items.some(
        (item) =>
          item.id !== ignoreItemId &&
          normalizeValue(item.link) ===
            normalizeValue(trimmedLink),
      )

    if (duplicateName && duplicateLink) {
      return `Title "${trimmedName}" and link "${trimmedLink}" already exist.`
    }

    if (duplicateName) {
      return `Title "${trimmedName}" already exists.`
    }

    if (!isValidHttpsUrl(trimmedLink)) {
      return 'URL must start with https:// and be a valid HTTPS link.'
    }

    if (duplicateLink) {
      return `Link "${trimmedLink}" already exists.`
    }

    return null
  }

  /* =========================================================
     ADD ITEM
     ========================================================= */

  const handleAddItem = () => {
    const trimmedName = newName.trim()
    const trimmedLink = newLink.trim()

    const nameError = validateName(newName, 'Link Title')
    if (nameError) {
      showNotification(nameError)
      return
    }

    if (!trimmedLink) {
      showNotification('Please enter a Link URL.')
      return
    }

    if (!/[a-zA-Z0-9]/.test(trimmedLink)) {
      showNotification('Only special characters are not allowed.')
      return
    }

    const validationError =
      validateLink(
        trimmedName,
        trimmedLink,
      )

    if (validationError) {
      showNotification(validationError)
      return
    }

    const newItem: QuickLinkItem = {
      id: `new-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}`,
      name: trimmedName,
      link: trimmedLink,
      sortOrder:
        draft.items.length + 1,
      isNew: true,
    }

    /*
     * LOCAL UPDATE ONLY.
     */
    setDraft((current) => ({
      ...current,
      items: [
        ...current.items,
        newItem,
      ],
    }))

    setNewName('')
    setNewLink('')
    setNotification(null)
  }

  /* =========================================================
     START EDIT
     ========================================================= */

  const handleStartEdit = (
    item: QuickLinkItem,
  ) => {
    setEditingItemId(item.id)
    setEditName(item.name)
    setEditLink(item.link)
    setNotification(null)
  }

  /* =========================================================
     SAVE ITEM EDIT
     ========================================================= */

  const handleSaveItemEdit = () => {
    if (!editingItemId) {
      return
    }

    const trimmedName = editName.trim()
    const trimmedLink = editLink.trim()

    const validationError =
      validateLink(
        trimmedName,
        trimmedLink,
        editingItemId,
      )

    if (validationError) {
      showNotification(validationError)
      return
    }

    /*
     * LOCAL UPDATE ONLY.
     */
    updateDraftItem(
      editingItemId,
      {
        name: trimmedName,
        link: trimmedLink,
      },
    )

    setEditingItemId(null)
    setEditName('')
    setEditLink('')
    setNotification(null)
  }

  /* =========================================================
     CANCEL ITEM EDIT
     ========================================================= */

  const handleCancelItemEdit = () => {
    setEditingItemId(null)
    setEditName('')
    setEditLink('')
    setNotification(null)
  }

  /* =========================================================
     DELETE ITEM CONFIRMATION FLOW
     ========================================================= */

  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false)
  const [itemToDelete, setItemToDelete] = useState<{
    id: string
    title: string
    parent: string
  } | null>(null)

  const handleRequestDeleteItem = (item: QuickLinkItem) => {
    const parentName = draft.name || subcategory.name || 'J&J'
    setItemToDelete({
      id: item.id,
      title: item.name,
      parent: parentName,
    })
    setShowDeleteModal(true)
  }

  const handleConfirmDelete = () => {
    if (!itemToDelete) return
    const itemId = itemToDelete.id
    setDraft((current) => ({
      ...current,
      items: current.items
        .filter((item) => item.id !== itemId)
        .map((item, index) => ({
          ...item,
          sortOrder: index + 1,
        })),
    }))

    if (editingItemId === itemId) {
      handleCancelItemEdit()
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

  /* =========================================================
     MOVE ITEM
     ========================================================= */

  const handleMoveItem = (
    itemId: string,
    direction: 'up' | 'down',
  ) => {
    setDraft((current) => {
      const currentIndex =
        current.items.findIndex(
          (item) =>
            item.id === itemId,
        )

      if (currentIndex === -1) {
        return current
      }

      const newIndex =
        direction === 'up'
          ? currentIndex - 1
          : currentIndex + 1

      if (
        newIndex < 0 ||
        newIndex >=
          current.items.length
      ) {
        return current
      }

      const items = [
        ...current.items,
      ]

      const [movedItem] =
        items.splice(
          currentIndex,
          1,
        )

      items.splice(
        newIndex,
        0,
        movedItem,
      )

      return {
        ...current,
        items: items.map(
          (item, index) => ({
            ...item,
            sortOrder:
              index + 1,
          }),
        ),
      }
    })
  }

  /* =========================================================
     FINAL SAVE VALIDATION
     ========================================================= */

  const validateEntireDraft = () => {
    const subcategoryNameError = validateName(draft.name, 'Subcategory name')
    if (subcategoryNameError) {
      return subcategoryNameError
    }

    if (draft.description.trim() && !/[a-zA-Z0-9]/.test(draft.description.trim())) {
      return 'Only special characters are not allowed.'
    }

    for (
      let index = 0;
      index < draft.items.length;
      index++
    ) {
      const item =
        draft.items[index]

      const itemNameError = validateName(item.name, 'Link Title')
      if (itemNameError) {
        return itemNameError
      }

      const originalItem = subcategory.items.find(
        (candidate) => candidate.id === item.id,
      )
      const isNewOrChangedLink =
        !originalItem ||
        item.isNew ||
        item.link.trim() !== originalItem.link.trim()

      const trimmedLink = item.link.trim()

      if (isNewOrChangedLink) {
        if (!trimmedLink) {
          return 'Please enter a Link URL.'
        }

        if (!/[a-zA-Z0-9]/.test(trimmedLink)) {
          return 'Only special characters are not allowed.'
        }

        if (!isValidHttpsUrl(trimmedLink)) {
          return `"${item.name || 'Link'}": URL must start with https:// and be a valid HTTPS link.`
        }
      }

      for (
        let secondIndex =
          index + 1;
        secondIndex <
        draft.items.length;
        secondIndex++
      ) {
        const secondItem =
          draft.items[
            secondIndex
          ]

        const isNameDuplicate =
          normalizeValue(item.name) ===
          normalizeValue(secondItem.name)
        const isLinkDuplicate =
          normalizeValue(item.link) ===
          normalizeValue(secondItem.link)

        if (isNameDuplicate && isLinkDuplicate) {
          return `Duplicate link name "${item.name}" and duplicate URL "${item.link}" are not allowed.`
        }

        if (isNameDuplicate) {
          return `Duplicate link name "${item.name}" is not allowed.`
        }

        if (isLinkDuplicate) {
          return `Duplicate URL "${item.link}" is not allowed.`
        }
      }
    }

    return null
  }

  /* =========================================================
     SAVE CHANGES
     ========================================================= */

  const handleSave = async () => {
    const validationError =
      validateEntireDraft()

    if (validationError) {
      showNotification(
        validationError,
      )
      return
    }

    /*
     * Only Save Changes sends the complete
     * draft to the parent.
     */
    await onSave(
      canEditSubcategoryName
        ? {
            ...draft,
            description: canEditDescriptionForRole
              ? draft.description
              : subcategory.description,
          }
        : {
            ...draft,
            name: subcategory.name,
            description: subcategory.description,
          },
    )
  }

  /* =========================================================
     RENDER
     ========================================================= */

  return (
    <section className="quick-link-manage-card">

      {/* Notification */}
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

      {/* Header */}
      <div className="quick-link-manage-header">
        <h2>Manage Content</h2>

        <div className="quick-link-manage-header-actions">

          <button
            type="button"
            className="quick-link-manage-cancel"
            onClick={onCancel}
            disabled={saving}
          >
            Cancel
          </button>

          <button
            type="button"
            className="quick-link-manage-save"
            onClick={handleSave}
            disabled={saving}
          >
            {saving
              ? 'Saving...'
              : 'Save Changes'}
          </button>

        </div>
      </div>

      {/* Subcategory Name */}
      <div className="quick-link-manage-field">
        <input
          id="quick-link-subcategory-name"
          type="text"
          value={draft.name}
          onChange={(event) =>
            setDraft((current) => ({
              ...current,
              name: event.target.value,
            }))
          }
          disabled={saving || !canEditSubcategoryName}
          aria-label="Subcategory Name"
        />
      </div>

      {/* Description */}
      <div className="quick-link-manage-field">
        <textarea
          id="quick-link-subcategory-description"
          value={draft.description}
          onChange={(event) => {
            if (!canEditDescriptionForRole) return
            setDraft((current) => ({
              ...current,
              description: event.target.value,
            }))
          }}
          disabled={saving || !canEditDescriptionForRole}
          readOnly={!canEditDescriptionForRole}
          aria-disabled={!canEditDescriptionForRole}
          rows={2}
          aria-label="Description"
        />
      </div>

      {/* Add Items */}
      <div className="quick-link-manage-add-heading">
        Add Items
      </div>

      <div className="quick-link-manage-add-row">

        <input
          type="text"
          placeholder="Link Title"
          value={newName}
          onChange={(event) => {
            setNewName(
              event.target.value,
            )
            if (notification) {
              setNotification(null)
            }
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              if (newName.trim() && newLink.trim()) {
                handleAddItem()
              }
            }
          }}
          disabled={saving}
        />

        <input
          type="text"
          placeholder="Link URL"
          value={newLink}
          onChange={(event) => {
            setNewLink(
              event.target.value,
            )
            if (notification) {
              setNotification(null)
            }
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              if (newName.trim() && newLink.trim()) {
                handleAddItem()
              }
            }
          }}
          disabled={saving}
        />

        {(() => {
          const isAddDisabled = saving || !newName.trim() || !newLink.trim()
          return (
            <button
              type="button"
              className="quick-link-manage-add-button"
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
          )
        })()}

      </div>


      {/* =====================================================
          GALLERY
          ===================================================== */}

      <div className="quick-link-manage-items">

        {draft.items.map(
          (item, index) => {

            /* =========================
               EDIT MODE
               ========================= */

            if (
              editingItemId ===
              item.id
            ) {
              return (
                <div
                  key={item.id}
                  className="quick-link-manage-item quick-link-manage-item-editing"
                >

                  <input
                    type="text"
                    value={editName}
                    onChange={(event) =>
                      setEditName(
                        event.target
                          .value,
                      )
                    }
                    disabled={saving}
                    aria-label="Link Name"
                  />

                  <input
                    type="text"
                    value={editLink}
                    onChange={(event) =>
                      setEditLink(
                        event.target
                          .value,
                      )
                    }
                    disabled={saving}
                    aria-label="Link URL"
                  />

                  <div className="quick-link-edit-actions">

                    {/* Red X */}
                    <button
                      type="button"
                      className="quick-link-edit-cancel-button"
                      onClick={
                        handleCancelItemEdit
                      }
                      disabled={saving}
                      aria-label="Cancel"
                      title="Cancel"
                    >
                      <CrossIcon />
                    </button>

                    {/* Green Check */}
                    <button
                      type="button"
                      className="quick-link-edit-confirm-button"
                      onClick={
                        handleSaveItemEdit
                      }
                      disabled={
                        saving ||
                        !editName.trim() ||
                        !editLink.trim()
                      }
                      aria-label="Save"
                      title="Save"
                    >
                      <CheckIcon />
                    </button>

                  </div>
                </div>
              )
            }

            /* =========================
               NORMAL MODE
               ========================= */

            return (
              <div
                key={item.id}
                className="quick-link-manage-item"
              >

                {/* Link icon + title */}
                <div className="quick-link-manage-item-name">

                  <LinkIcon />

                  <span>
                    {item.name}
                  </span>

                </div>

                {/* Actions */}
                <div className="quick-link-manage-item-actions">

                  {/* Edit */}
                  <button
                    type="button"
                    className="quick-link-manage-edit-button"
                    onClick={() =>
                      handleStartEdit(
                        item,
                      )
                    }
                    disabled={saving}
                    aria-label={`Edit ${item.name}`}
                    title="Edit"
                  >
                    <PencilIcon />
                  </button>

                  {/* Up */}
                  <button
                    type="button"
                    className="quick-link-manage-move-button"
                    onClick={() =>
                      handleMoveItem(
                        item.id,
                        'up',
                      )
                    }
                    disabled={
                      saving ||
                      index === 0
                    }
                    aria-label={`Move ${item.name} up`}
                    title="Move up"
                  >
                    <ArrowUpIcon />
                  </button>

                  {/* Down */}
                  <button
                    type="button"
                    className="quick-link-manage-move-button"
                    onClick={() =>
                      handleMoveItem(
                        item.id,
                        'down',
                      )
                    }
                    disabled={
                      saving ||
                      index ===
                        draft.items
                          .length -
                          1
                    }
                    aria-label={`Move ${item.name} down`}
                    title="Move down"
                  >
                    <ArrowDownIcon />
                  </button>

                  {/* Delete */}
                  <button
                    type="button"
                    className="quick-link-manage-delete-button"
                    onClick={() =>
                      handleRequestDeleteItem(
                        item,
                      )
                    }
                    disabled={saving}
                    aria-label={`Delete ${item.name}`}
                    title="Delete"
                  >
                    <TrashIcon />
                  </button>

                </div>
              </div>
            )
          },
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

export default QuickLinkManageContent