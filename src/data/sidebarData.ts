export type SidebarNodeType = 'heading' | 'category' | 'item'

export interface SidebarNodeData {
  id: string
  label: string
  type: SidebarNodeType
  children?: SidebarNodeData[]
}

// Only the two section headings are fixed; categories and items come from Dataverse.
export const sidebarData: SidebarNodeData[] = [
  { id: 'quick-links', label: 'QUICK LINKS', type: 'heading', children: [] },
  { id: 'references', label: 'REFERENCES', type: 'heading', children: [] },
]
