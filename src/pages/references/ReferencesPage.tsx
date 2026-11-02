import type { Cp_refitemses } from '../../generated/models/Cp_refitemsesModel'
import ResourceContent from '../../components/table/ResourceContent'
import type { ContentItem, ResourceItem } from '../../data/contentData'

interface ReferencesPageProps {
  content: ContentItem
  resources: ResourceItem[]
  searchTerm: string
  referenceItems?: Cp_refitemses[]
}

export default function ReferencesPage(props: ReferencesPageProps) {
  return <ResourceContent {...props} />
}
