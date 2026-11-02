export interface ResourceItem {
  id: string
  name: string
  type: 'link' | 'folder'
  count?: number
  url?: string
  description?: string
}

export interface ContentItem {
  id: string
  title: string
  description?: string
  section: 'quickLinks' | 'references'
  breadcrumb: string[]
  resources: ResourceItem[]
}
