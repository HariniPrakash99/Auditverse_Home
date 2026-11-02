import Icon from '../common/Icon'

interface ResourceLinkProps { name: string }

function ResourceLink({ name }: ResourceLinkProps) {
  return <button className={`resource-link ${name === 'CREDO Hotline' ? 'highlighted' : ''}`} type="button" onClick={() => console.log(`Selected resource link: ${name}`)}><span className="resource-link-name"><span className="link-icon"><Icon name="link" size={17} /></span>{name}</span><Icon name="arrow" size={18} /></button>
}

export default ResourceLink