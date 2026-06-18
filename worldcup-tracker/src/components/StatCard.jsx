function StatCard({ label, value, helper }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-bold text-slate-950">{value}</p>
      {helper ? <p className="mt-2 text-sm text-green-600">{helper}</p> : null}
    </div>
  )
}

export default StatCard
