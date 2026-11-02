import { useLayoutEffect, useRef, useState } from 'react'
import { sidebarData } from '../../data/sidebarData'
import type { SidebarNodeData } from '../../data/sidebarData'
import SidebarNode from './SidebarNode'
import type { QuickLinkCategory } from '../../hooks/useQuickLinks'
import type { ReferenceCategory } from '../../hooks/useReferences'

interface SidebarProps {
  selectedItem: string
  onSelectItem: (item: string) => void
  userId?: string
  quickLinkCategories?: string[]
  referenceCategories?: string[]
  categoryItems?: Record<string, string[]>
  quickLinkData?: QuickLinkCategory[]
  referenceData?: ReferenceCategory[]
  onManageSection?: (sectionId: string) => void
  onManageCategory?: (
    section: 'quickLinks' | 'references',
    categoryId: string,
    categoryLabel: string,
  ) => void
}

const defaultExpandedNodeIds = ['quick-links', 'references']

const getInitialExpandedNodes = (userId?: string) => {
  if (!userId) {
    return new Set(defaultExpandedNodeIds)
  }

  try {
    const saved = window.localStorage.getItem(`auditverse-sidebar-expanded:${userId}`)
    const parsed = saved ? JSON.parse(saved) : null
    return Array.isArray(parsed) && parsed.every((id) => typeof id === 'string')
      ? new Set(parsed)
      : new Set(defaultExpandedNodeIds)
  } catch {
    return new Set(defaultExpandedNodeIds)
  }
}

function Sidebar({
  selectedItem,
  onSelectItem,
  userId,
  quickLinkCategories = [],
  referenceCategories = [],
  categoryItems = {},
  quickLinkData = [],
  referenceData = [],
  onManageSection,
  onManageCategory,
}: SidebarProps) {
  /*
   * Clean hierarchy:
   * QUICK LINKS (expanded ⌃)
   *   - Resource Links (expanded ⌃)
   *   - Auditor Internal Links (collapsed ⌄)
   *   - Auditor External Link (collapsed ⌄)
   * REFERENCES (expanded ⌃)
   *   - GA&A (expanded ⌃)
   *   - Training (collapsed ⌄)
   *   - Access (collapsed ⌄)
   */
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(() =>
    getInitialExpandedNodes(userId),
  )

  const navRef = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const updateMaxHeight = () => {
      const nav = navRef.current
      if (!nav) return
      if (window.matchMedia('(max-width: 820px)').matches) {
        nav.style.maxHeight = ''
        return
      }
      const stickyTop = 16
      const parent = nav.parentElement
      const parentTop = parent ? parent.getBoundingClientRect().top : 0
      const paddingTop = parent ? parseFloat(getComputedStyle(parent).paddingTop) || 0 : 0
      const visibleTop = Math.max(parentTop + paddingTop, stickyTop)
      nav.style.maxHeight = `${Math.max(window.innerHeight - visibleTop - 16, 120)}px`
    }
    updateMaxHeight()
    window.addEventListener('scroll', updateMaxHeight, { passive: true })
    window.addEventListener('resize', updateMaxHeight)
    return () => {
      window.removeEventListener('scroll', updateMaxHeight)
      window.removeEventListener('resize', updateMaxHeight)
    }
  }, [])

  const toggleNode = (id: string) => {
    setExpandedNodes((current) => {
      const next = new Set(current)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      if (userId) {
        try {
          window.localStorage.setItem(
            `auditverse-sidebar-expanded:${userId}`,
            JSON.stringify([...next]),
          )
        } catch {
        }
      }
      return next
    })
  }

  const selectNode = (node: SidebarNodeData) => {
    onSelectItem(node.id)
  }

  const findQuickLinkSubcategory = (category: SidebarNodeData, label: string) => {
    const normalizedLabel = label.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
    const quickLinkCategory = quickLinkData.find(
      (quickLink) =>
        quickLink.name.trim().toLowerCase() === category.label.trim().toLowerCase(),
    )

    return quickLinkCategory?.subcategories.find(
      (subcategory) =>
        subcategory.name.trim().toLowerCase() === label.trim().toLowerCase() ||
        subcategory.name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() === normalizedLabel,
    )
  }

  const findReferenceSubcategory = (category: SidebarNodeData, label: string) => {
    const normalizedLabel = label.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
    const referenceCategory = referenceData.find(
      (reference) =>
        reference.name.trim().toLowerCase() === category.label.trim().toLowerCase(),
    )

    return referenceCategory?.subcategories.find(
      (subcategory) =>
        subcategory.name.trim().toLowerCase() === label.trim().toLowerCase() ||
        subcategory.name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() === normalizedLabel,
    )
  }

  const applyCategoryChildren = (
    node: SidebarNodeData,
    isReferenceHierarchy = false,
  ): SidebarNodeData => {
    const labels = categoryItems[node.id]

    if (!labels) {
      return {
        ...node,
        children: node.children?.map((child) =>
          applyCategoryChildren(child, isReferenceHierarchy),
        ),
      }
    }

    const nextChildren = labels.map((label) => {
      const existingChild = node.children?.find((child) => child.label === label)

      if (existingChild) {
        const dataverseSubcategory = isReferenceHierarchy
          ? findReferenceSubcategory(node, label)
          : findQuickLinkSubcategory(node, label)

        if (dataverseSubcategory) {
          return {
            ...existingChild,
            id: dataverseSubcategory.id,
            label: dataverseSubcategory.name,
            type: 'item' as const,
          }
        }
        return existingChild
      }

      const dataverseSubcategory = isReferenceHierarchy
        ? findReferenceSubcategory(node, label)
        : findQuickLinkSubcategory(node, label)

      if (dataverseSubcategory) {
        return {
          id: dataverseSubcategory.id,
          label: dataverseSubcategory.name,
          type: 'item' as const,
        }
      }

      return {
        id: `${node.id}-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
        label,
        type: 'item' as const,
      }
    })

    return {
      ...node,
      children: nextChildren.map((child) =>
        applyCategoryChildren(child, isReferenceHierarchy),
      ),
    }
  }

  const nodes = sidebarData.map((node) => {
    if (node.id === 'quick-links') {
      const staticCategories = node.children ?? []
      return {
        ...node,
        children: quickLinkCategories.map((label, index) => {
          const staticCategory = staticCategories[index]
          if (!staticCategory) {
            const dynamicId = `quick-links-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
            return applyCategoryChildren({
              id: dynamicId,
              label,
              type: 'category' as const,
              children: [],
            })
          }
          return applyCategoryChildren({
            ...staticCategory,
            label,
          })
        }),
      }
    }

    if (node.id === 'references') {
      const staticCategories = node.children ?? []
      return {
        ...node,
        children: referenceCategories.map((label, index) => {
          const staticCategory = staticCategories[index]
          if (!staticCategory) {
            const dynamicId = `references-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
            return applyCategoryChildren({
              id: dynamicId,
              label,
              type: 'category' as const,
              children: [],
            }, true)
          }
          return applyCategoryChildren({
            ...staticCategory,
            label,
          }, true)
        }),
      }
    }

    return node
  })

  const loadedDefaultSelectionNode = [...quickLinkData]
    .sort((left, right) => left.sortOrder - right.sortOrder)
    .flatMap((category) =>
      [...category.subcategories].sort((left, right) => left.sortOrder - right.sortOrder),
    )[0]

  const defaultSelectionNode = loadedDefaultSelectionNode
    ? {
        id: loadedDefaultSelectionNode.id,
        label: loadedDefaultSelectionNode.name,
        type: 'item' as const,
      }
    : nodes
    .find((node) => node.id === 'quick-links')
    ?.children?.[0]
    ?.children?.[0]

  const isItemNode = (node: SidebarNodeData): boolean => {
    if (node.type === 'item' && node.id === selectedItem) {
      return true
    }
    return Boolean(node.children?.some(isItemNode))
  }

  const selectedNodeIsItem = nodes.some(isItemNode)

  return (
    <nav ref={navRef} className="section-nav sidebar-card-container">
      <div className="sidebar-tree">
        {nodes.map((node, index) => (
          <div key={node.id} className="sidebar-section-wrapper">
            {index > 0 && <div className="sidebar-divider" />}
            <SidebarNode
              node={node}
              depth={0}
              isReferenceSection={node.id === 'references'}
              expandedNodes={expandedNodes}
              selectedNode={selectedItem}
              defaultSelectionNode={defaultSelectionNode}
              selectedNodeIsItem={selectedNodeIsItem}
              onToggle={toggleNode}
              onSelect={selectNode}
              onManageSection={onManageSection}
              onManageCategory={onManageCategory}
            />
          </div>
        ))}
      </div>
    </nav>
  )
}

export default Sidebar
