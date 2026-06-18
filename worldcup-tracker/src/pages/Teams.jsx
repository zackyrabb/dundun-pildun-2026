import PageHeader from '../components/PageHeader'
import { teams } from '../data/teams'

function Teams() {
  return (
    <>
      <PageHeader
        title="Teams"
        description="Participating teams with simple early-stage statistics."
      />

      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {teams.map((team) => (
          <article key={team.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-5xl">{team.flag}</span>
                <h2 className="mt-4 text-2xl font-bold text-slate-950">{team.name}</h2>
                <p className="text-sm font-medium text-slate-500">Group {team.group} • {team.confederation}</p>
              </div>
              <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
                Group {team.group}
              </span>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-2xl bg-green-50 p-3">
                <p className="text-xs font-semibold text-green-700">Win</p>
                <p className="text-xl font-bold text-slate-950">{team.wins}</p>
              </div>
              <div className="rounded-2xl bg-blue-50 p-3">
                <p className="text-xs font-semibold text-blue-700">Draw</p>
                <p className="text-xl font-bold text-slate-950">{team.draws}</p>
              </div>
              <div className="rounded-2xl bg-slate-100 p-3">
                <p className="text-xs font-semibold text-slate-600">Loss</p>
                <p className="text-xl font-bold text-slate-950">{team.losses}</p>
              </div>
            </div>
          </article>
        ))}
      </section>
    </>
  )
}

export default Teams
