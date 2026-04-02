type HeaderProps = {
  title: string
  subtitle: string
}

export function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="header">
      <div>
        <p className="header-subtitle">{subtitle}</p>
        <h1 className="header-title">{title}</h1>
      </div>

      <div className="header-actions">
        <button className="ghost-btn" type="button">
          Bộ lọc
        </button>
        <button className="primary-btn" type="button">
          Xuất báo cáo
        </button>
      </div>
    </header>
  )
}
