export default function EmptyState({
  title = "No data available",
  description = "There is no data to display yet.",
  action,
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <h2 className="text-xl font-black text-slate-900">{title}</h2>

      <p className="mt-2 text-slate-500">{description}</p>

      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
