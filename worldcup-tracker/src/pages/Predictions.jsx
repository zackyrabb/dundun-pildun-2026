import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import StatCard from '../components/StatCard'
import { getCurrentUser } from '../services/authService'
import { getUserPredictions } from '../services/predictionService'
import { calculatePredictionPoints } from '../utils/calculatePredictionPoints'
import { canPredictMatch, getPredictionLockReason } from '../utils/matchStatusUtils'

const getTeamName = (team) => team?.name ?? 'Unknown team'
const getTeamFlag = (team) => team?.flag ?? ''

const formatDate = (date) =>
  new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))

function Predictions() {
  const navigate = useNavigate()
  const [userPredictions, setUserPredictions] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function loadPredictions() {
      const currentUser = await getCurrentUser()

      if (!currentUser) {
        navigate('/login')
        return
      }

      const { data, error } = await getUserPredictions(currentUser.id)

      if (error) {
        setMessage(error.message)
        setLoading(false)
        return
      }

      const predictionsWithPoints = (data ?? [])
        .map((prediction) => ({
          ...prediction,
          points: calculatePredictionPoints(prediction.match, prediction),
        }))
        .sort((firstPrediction, secondPrediction) => {
          return new Date(firstPrediction.match.match_date) - new Date(secondPrediction.match.match_date)
        })

      setUserPredictions(predictionsWithPoints)
      setLoading(false)
    }

    loadPredictions()
  }, [navigate])

  const totalPredictions = userPredictions.length
  const pendingPredictions = userPredictions.filter((prediction) => prediction.match.status === 'scheduled').length
  const countedPredictions = userPredictions.filter((prediction) => prediction.match.status === 'finished').length
  const totalPoints = userPredictions.reduce((points, prediction) => points + prediction.points, 0)

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="font-semibold text-slate-600">Loading my predictions...</p>
      </div>
    )
  }

  return (
    <>
      <PageHeader
        title="My Predictions"
        description="Score predictions you have saved for Dundun Pildun 2026 matches."
      />

      {message ? (
        <div className="mb-6 rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700">
          {message}
        </div>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Predictions" value={totalPredictions} helper="All your predictions" />
        <StatCard label="Upcoming" value={pendingPredictions} helper="Can still be updated" />
        <StatCard label="Counted" value={countedPredictions} helper="Finished matches" />
        <StatCard label="Total Points" value={totalPoints} helper="From finished results" />
      </section>

      {userPredictions.length === 0 ? (
        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h2 className="text-2xl font-bold text-slate-950">No predictions yet</h2>
          <p className="mx-auto mt-2 max-w-xl text-slate-600">
            Open the match list, choose an upcoming match, then save your score prediction.
          </p>
          <Link
            to="/matches"
            className="mt-6 inline-flex rounded-2xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            View Matches
          </Link>
        </section>
      ) : (
        <section className="mt-8 space-y-4">
          {userPredictions.map((prediction) => {
            const { match } = prediction
            const isFinished = match.status === 'finished'
            const canEditPrediction = canPredictMatch(match)

            return (
              <article
                key={prediction.id}
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                        {match.stage}
                      </span>
                      <span
                        className={[
                          'rounded-full px-3 py-1 text-xs font-bold',
                          isFinished ? 'bg-slate-100 text-slate-700' : 'bg-green-100 text-green-700',
                        ].join(' ')}
                      >
                        {isFinished ? 'Finished' : 'Pending'}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
                      <div>
                        <p className="text-sm font-semibold text-slate-500">Home</p>
                        <h2 className="mt-1 flex items-center gap-2 text-xl font-bold text-slate-950">
                          <span>{getTeamFlag(match.home_team)}</span>
                          {getTeamName(match.home_team)}
                        </h2>
                      </div>

                      <div className="rounded-2xl bg-slate-50 px-5 py-3 text-center">
                        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Prediction</p>
                        <p className="text-2xl font-black text-blue-700">
                          {prediction.predicted_home_score} - {prediction.predicted_away_score}
                        </p>
                      </div>

                      <div className="sm:text-right">
                        <p className="text-sm font-semibold text-slate-500">Away</p>
                        <h2 className="mt-1 flex items-center gap-2 text-xl font-bold text-slate-950 sm:justify-end">
                          <span>{getTeamFlag(match.away_team)}</span>
                          {getTeamName(match.away_team)}
                        </h2>
                      </div>
                    </div>

                    <p className="mt-4 text-sm text-slate-500">{formatDate(match.match_date)}</p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3 lg:min-w-80 lg:grid-cols-1">
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                        Final Score
                      </p>
                      <p className="mt-1 text-xl font-black text-slate-950">
                        {isFinished ? `${match.home_score} - ${match.away_score}` : 'Not played yet'}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-green-50 p-4">
                      <p className="text-xs font-bold uppercase tracking-wide text-green-700">Points</p>
                      <p className="mt-1 text-xl font-black text-green-700">
                        {isFinished ? prediction.points : 'Pending'}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Link
                        to={`/matches/${match.id}`}
                        className="rounded-2xl bg-blue-600 px-4 py-3 text-center font-semibold text-white shadow-sm transition hover:bg-blue-700"
                      >
                        View Details
                      </Link>
                      {canEditPrediction ? (
                        <Link
                          to={`/matches/${match.id}`}
                          className="rounded-2xl bg-green-500 px-4 py-3 text-center font-semibold text-white shadow-sm transition hover:bg-green-600"
                        >
                          Update Prediction
                        </Link>
                      ) : !isFinished ? (
                        <p className="rounded-2xl bg-slate-100 px-4 py-3 text-center text-sm font-semibold text-slate-600">
                          Prediction cannot be updated: {getPredictionLockReason(match)}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
              </article>
            )
          })}
        </section>
      )}
    </>
  )
}

export default Predictions
