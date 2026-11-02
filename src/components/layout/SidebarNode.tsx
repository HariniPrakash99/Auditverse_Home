import Icon from '../common/Icon'
import type { SidebarNodeData } from '../../data/sidebarData'

interface SidebarNodeProps {
  node: SidebarNodeData
  depth: number
  isReferenceSection?: boolean
  expandedNodes: Set<string>
  selectedNode: string
  defaultSelectionNode?: SidebarNodeData
  selectedNodeIsItem?: boolean
  onToggle: (id: string) => void
  onSelect: (node: SidebarNodeData) => void
  onManageSection?: (sectionId: string) => void
  onManageCategory?: (
    section: 'quickLinks' | 'references',
    categoryId: string,
    categoryLabel: string,
  ) => void
}

function SidebarNode({
  node,
  depth,
  isReferenceSection = false,
  expandedNodes,
  selectedNode,
  defaultSelectionNode,
  selectedNodeIsItem = false,
  onToggle,
  onSelect,
  onManageSection,
  onManageCategory,
}: SidebarNodeProps) {
  const hasChildren = Array.isArray(node.children) && node.children.length > 0
  const isExpanded = expandedNodes.has(node.id)

  const isSelected =
    (node.type === 'item' || (node.type === 'category' && !hasChildren)) &&
    selectedNode === node.id

  const isHeading = node.type === 'heading'
  const isCategory = node.type === 'category'
  const isItem = node.type === 'item'

  const isRef =
    isReferenceSection ||
    node.id === 'references' ||
    node.id.startsWith('references') ||
    node.id === 'gaa' ||
    node.id === 'access' ||
    node.id === 'reference-training'

  const isRefSubcategory = isRef && (depth >= 2 || isItem)

  const hasSelectedChild = Boolean(
    hasChildren &&
      node.children?.some(
        (child) =>
          child.id === selectedNode ||
          child.children?.some((grandChild) => grandChild.id === selectedNode),
      ),
  )

  const handleNodeClick = () => {
    if (isHeading) {
      onToggle(node.id)
      return
    }

    if (isCategory) {
      onToggle(node.id)
      if (selectedNodeIsItem) {
        return
      }
      const defaultChild =
        defaultSelectionNode ??
        (node.label.trim().toLowerCase() === 'resource links'
          ? node.children?.find(
              (child) => child.label.trim().toLowerCase() === 'j&j',
            )
          : node.children?.[0])
      onSelect(defaultChild ?? node)
      return
    }

    if (hasChildren) {
      onToggle(node.id)
      return
    }

    onSelect(node)
  }

  return (
    <div
      className={[
        'sidebar-node',
        `sidebar-node-${node.type}`,
        `sidebar-depth-${depth}`,
        (isHeading || isCategory || hasChildren) ? (isExpanded ? 'node-expanded' : 'node-collapsed') : '',
        isHeading ? 'sidebar-section-header' : '',
        isSelected ? 'is-selected' : '',
        hasSelectedChild ? 'has-selected-child' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div
        className={`sidebar-row-content ${isSelected ? 'selected' : ''}`}
        onClick={handleNodeClick}
        role="button"
        tabIndex={0}
        aria-expanded={hasChildren ? isExpanded : undefined}
        data-expanded={isExpanded ? 'true' : 'false'}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleNodeClick()
          }
        }}
      >
        {/* Left side: Icon + Label */}
        <div className="sidebar-row-left">
          {isCategory && !isRefSubcategory && (
            <span
              className="sidebar-icon folder-icon"
              style={{ color: 'rgb(49, 44, 42)', stroke: 'rgb(49, 44, 42)' }}
              aria-hidden="true"
            >
              {isRef ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="rgb(49, 44, 42)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-folder-open folder-category-icon"
                  style={{ color: 'rgb(49, 44, 42)', stroke: 'rgb(49, 44, 42)' }}
                >
                  <path d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="rgb(49, 44, 42)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-folder-symlink folder-category-icon"
                  style={{ color: 'rgb(49, 44, 42)', stroke: 'rgb(49, 44, 42)' }}
                >
                  <path d="M2 9.35V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h7" />
                  <path d="m8 16 3-3-3-3" />
                </svg>
              )}
            </span>
          )}

          {isItem && !isRefSubcategory && (
            <span
              className={`sidebar-icon link-icon ${isSelected ? 'active-icon' : ''}`}
              style={isSelected ? undefined : { color: 'rgb(49, 44, 42)', stroke: 'rgb(49, 44, 42)' }}
              aria-hidden="true"
            >
              <Icon
                name="link"
                size={14}
                strokeWidth={2}
                style={isSelected ? undefined : { color: 'rgb(49, 44, 42)', stroke: 'rgb(49, 44, 42)' }}
              />
            </span>
          )}

          <span
            className="sidebar-node-label"
            title={node.label}
            style={
              isHeading
                ? { color: '#6e6259', fontSize: '12px', fontWeight: 400 }
                : isCategory
                ? {
                    color: '#312c2a',
                    fontSize: '14px',
                    fontWeight: isExpanded ? 600 : 400,
                    textTransform: 'none',
                  }
                : isItem
                ? {
                    color: '#312c2a',
                    fontSize: '14px',
                    fontWeight: isSelected ? 600 : 400,
                    textTransform: 'none',
                  }
                : { color: '#312c2a', fontSize: '14px', fontWeight: 400, textTransform: 'none' }
            }
          >
            {node.label}
          </span>
        </div>

        {/* Right side: Red pencil icon + MANAGE + collapsible chevron */}
        <div className="sidebar-row-actions">
          {((isHeading && Boolean(onManageSection)) || (isCategory && depth <= 1 && Boolean(onManageCategory))) && (
            <button
              type="button"
              className="sidebar-manage-btn"
              style={{ color: '#eb1700', fontSize: '12px' }}
              onClick={(e) => {
                e.stopPropagation()
                if (isHeading) {
                  onManageSection?.(node.id)
                } else if (isCategory) {
                  onManageCategory?.(
                    isReferenceSection || node.id.startsWith('references') || node.id === 'gaa' || node.id === 'access'
                      ? 'references'
                      : 'quickLinks',
                    node.id,
                    node.label,
                  )
                }
              }}
              title={`Manage ${node.label}`}
              aria-label={`Manage ${node.label}`}
            >
              <Icon name="manage" size={13} strokeWidth={2} />
              <span>MANAGE</span>
            </button>
          )}

          {(isHeading || isCategory || hasChildren) && (
            <span
              className="sidebar-chevron-indicator"
              style={{ color: 'rgb(110, 98, 89)', stroke: 'rgb(110, 98, 89)' }}
              aria-hidden="true"
            >
              <Icon
                name={isExpanded ? 'chevron-up' : 'chevron-down'}
                size={12}
                strokeWidth={2.2}
                style={{ color: 'rgb(110, 98, 89)', stroke: 'rgb(110, 98, 89)' }}
              />
            </span>
          )}
        </div>
      </div>

      {/* Children list */}
      {hasChildren && isExpanded && (
        <div className="sidebar-node-children">
          {node.children?.map((child) => (
            <SidebarNode
              key={child.id}
              node={child}
              depth={depth + 1}
              isReferenceSection={isReferenceSection || node.id === 'references'}
              expandedNodes={expandedNodes}
              selectedNode={selectedNode}
              defaultSelectionNode={defaultSelectionNode}
              selectedNodeIsItem={selectedNodeIsItem}
              onToggle={onToggle}
              onSelect={onSelect}
              onManageSection={onManageSection}
              onManageCategory={onManageCategory}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default SidebarNode