export default function LoadingState({ text = "Loading data..." }) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center bg-slate-50 px-4">
      <div className="rounded-2xl border border-slate-200 bg-white px-6 py-4 shadow-sm">
        <p className="font-semibold text-slate-600">{text}</p>
      </div>
    </div>
  );
}
