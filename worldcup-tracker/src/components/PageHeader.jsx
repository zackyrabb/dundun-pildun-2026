function PageHeader({ title, description, action }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-green-600">Dundun Pildun 2026</p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">{title}</h1>
        {description ? <p className="mt-2 max-w-2xl text-slate-600">{description}</p> : null}
      </div>
      {action}
    </div>
  )
}

export default PageHeader
