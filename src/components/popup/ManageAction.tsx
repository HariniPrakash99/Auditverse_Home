import Icon from '../common/Icon'

interface ManageActionProps {
  onClick?: () => void
  label?: string
  className?: string
}

function ManageAction({ onClick, label = 'MANAGE', className = '' }: ManageActionProps) {
  return (
    <button
      className={`manage-action-btn ${className}`.trim()}
      type="button"
      style={{ color: '#eb1700', fontSize: '12px' }}
      onClick={(event) => {
        event.stopPropagation()
        onClick?.()
      }}
      aria-label={`${label} settings`}
    >
      <Icon name="manage" size={13} strokeWidth={2} />
      <span>{label}</span>
    </button>
  )
}

export default ManageAction