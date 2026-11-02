import Icon from './Icon'

export default function PageHeader({ icon, title, subtitle }) {
  return (
    <header className="page-header mb-4">
      <h1 className="h2 fw-bold d-flex align-items-center gap-2 mb-1">
        {icon && <span className="page-icon"><Icon name={icon} size={24} /></span>}
        {title}
      </h1>
      {subtitle && <p className="text-muted mb-0">{subtitle}</p>}
    </header>
  )
}
