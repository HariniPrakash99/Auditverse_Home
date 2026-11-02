import type { ReactNode } from 'react'
import Icon from '../common/Icon'

interface SidebarSectionProps { label: string; expanded: boolean; onToggle: () => void; children?: ReactNode }

function SidebarSection({ label, expanded, onToggle, children }: SidebarSectionProps) {
  return <div className="sidebar-section"><button className="sidebar-section-heading" type="button" onClick={onToggle} aria-expanded={expanded}><span>{label}</span><Icon name="chevron" size={15} /></button>{expanded && children}</div>
}

export default SidebarSection