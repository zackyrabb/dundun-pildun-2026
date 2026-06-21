import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import { getAllPredictions } from '../services/predictionService'
import { getAllProfiles } from '../services/profileService'
import { calculatePredictionPoints } from '../utils/calculatePredictionPoints'

const pointRules = [
  { label: 'Exact score', points: 3 },
  { label: 'Correct result', points: 2 },
  { label: 'One score correct', points: 1 },
  { label: 'All wrong', points: 0 },
]

const buildRanking = (profiles, predictions) => {
  return profiles
    .map((profile) => {
      const userPredictions = predictions.filter((prediction) => prediction.user_id === profile.id)
      const countedPredictions = userPredictions.filter((prediction) => prediction.match?.status === 'finished')
      const totalPoints = userPredictions.reduce((points, prediction) => {
        return points + calculatePredictionPoints(prediction.match, prediction)
      }, 0)

      return {
        ...profile,
        totalPredictions: userPredictions.length,
        countedPredictions: countedPredictions.length,
        totalPoints,
      }
    })
    .sort((firstProfile, secondProfile) => secondProfile.totalPoints - firstProfile.totalPoints)
}

function Leaderboard() {
  const [ranking, setRanking] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function loadLeaderboard() {
      const [{ data: profilesData, error: profilesError }, { data: predictionsData, error: predictionsError }] =
        await Promise.all([getAllProfiles(), getAllPredictions()])

      const error = profilesError || predictionsError

      if (error) {
        setMessage(error.message)
        setLoading(false)
        return
      }

      setRanking(buildRanking(profilesData ?? [], predictionsData ?? []))
      setLoading(false)
    }

    loadLeaderboard()
  }, [])

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="font-semibold text-slate-600">Loading leaderboard...</p>
      </div>
    )
  }

  return (
    <>
      <PageHeader
        title="Leaderboard"
        description="Temporary ranking based on predictions for finished matches."
      />

      {message ? (
        <div className="mb-6 rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700">
          {message}
        </div>
      ) : null}

      <section className="grid gap-6 lg:grid-cols-[1.5fr_0.8fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="space-y-3">
            {ranking.map((profile, index) => (
              <Link
                key={profile.id}
                to={`/users/${profile.id}`}
                className="grid gap-4 rounded-2xl bg-slate-50 p-4 transition hover:bg-blue-50 md:grid-cols-[auto_auto_1fr_auto] md:items-center"
              >
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-600 font-bold text-white">
                  #{index + 1}
                </div>

                <img
                  src={profile.avatar_url || 'https://i.pravatar.cc/150?img=12'}
                  alt={profile.full_name || profile.username || 'User'}
                  className="h-12 w-12 rounded-2xl object-cover ring-2 ring-white"
                />

                <div>
                  <h2 className="text-lg font-bold text-slate-950">{profile.full_name || 'User'}</h2>
                  <p className="text-sm text-slate-500">@{profile.username || profile.id}</p>
                  <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                    <p className="rounded-2xl bg-white px-3 py-2 text-slate-600">
                      Total predictions:{' '}
                      <span className="font-bold text-slate-950">{profile.totalPredictions}</span>
                    </p>
                    <p className="rounded-2xl bg-white px-3 py-2 text-slate-600">
                      Counted:{' '}
                      <span className="font-bold text-slate-950">{profile.countedPredictions}</span>
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl bg-green-100 px-5 py-3 text-center">
                  <p className="text-xs font-bold uppercase tracking-wide text-green-700">Total Points</p>
                  <p className="text-3xl font-black text-green-700">{profile.totalPoints}</p>
                </div>
              </Link>
            ))}

            {ranking.length === 0 ? (
              <p className="rounded-2xl bg-slate-50 p-4 text-center text-slate-600">
                No profiles are available yet.
              </p>
            ) : null}
          </div>
        </div>

        <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-950">Scoring Rules</h2>
          <div className="mt-4 space-y-3">
            {pointRules.map((rule) => (
              <div key={rule.label} className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                <p className="font-semibold text-slate-700">{rule.label}</p>
                <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-black text-blue-700">
                  {rule.points}
                </span>
              </div>
            ))}
          </div>
        </aside>
      </section>
    </>
  )
}

export default Leaderboard
