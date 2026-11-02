import { useState } from 'react'
import Icon from '../common/Icon'
import type { ResourceItem } from '../../data/contentData'

interface ResourceRowProps {
  resource: ResourceItem
}

function ResourceRow({ resource }: ResourceRowProps) {
  const [isHovered, setIsHovered] = useState(false)

  const handleClick = () => {
    if (!resource.url) {
      return
    }

    window.open(resource.url, '_blank', 'noopener,noreferrer')
  }

  const isFolder = resource.type === 'folder'

  return (
    <div
      className={`resource-card-row ${isHovered ? 'hovered' : ''}`}
      role="link"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          handleClick()
        }
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="resource-card-left">
        <span className="resource-chain-icon" aria-hidden="true">
          <Icon name={isFolder ? 'folder' : 'link'} size={18} strokeWidth={2} />
        </span>
        <span className="resource-card-title">{resource.name}</span>
      </div>

      <span className="resource-card-arrow" aria-hidden="true">
        <Icon name="arrow-right" size={16} strokeWidth={2} />
      </span>
    </div>
  )
}

export default ResourceRow