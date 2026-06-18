import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import { getCurrentUser } from '../services/authService'
import { getMatchById } from '../services/matchService'
import { getPredictionByMatch, upsertPrediction } from '../services/predictionService'
import { canPredictMatch, getPredictionLockReason } from '../utils/matchStatusUtils'

const formatDate = (date) =>
  new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))

const getTeamName = (team) => team?.name ?? 'Unknown team'
const getTeamFlag = (team) => team?.flag ?? ''

function MatchDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [match, setMatch] = useState(null)
  const [currentPrediction, setCurrentPrediction] = useState(null)
  const [predictedHomeScore, setPredictedHomeScore] = useState('')
  const [predictedAwayScore, setPredictedAwayScore] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    async function loadMatchDetail() {
      const currentUser = await getCurrentUser()

      if (!currentUser) {
        navigate('/login')
        return
      }

      setUser(currentUser)

      const { data: matchData, error: matchError } = await getMatchById(id)

      if (matchError) {
        setErrorMessage(matchError.message)
        setLoading(false)
        return
      }

      setMatch(matchData)

      const { data: predictionData, error: predictionError } = await getPredictionByMatch(
        currentUser.id,
        id,
      )

      if (predictionError) {
        setErrorMessage(predictionError.message)
      }

      if (predictionData) {
        setCurrentPrediction(predictionData)
        setPredictedHomeScore(predictionData.predicted_home_score?.toString() ?? '')
        setPredictedAwayScore(predictionData.predicted_away_score?.toString() ?? '')
      }

      setLoading(false)
    }

    loadMatchDetail()
  }, [id, navigate])

  const savePrediction = async (event) => {
    event.preventDefault()

    if (saving) {
      return
    }

    if (!user || !match) {
      return
    }

    if (!canPredictMatch(match)) {
      setSuccessMessage('')
      setErrorMessage(getPredictionLockReason(match))
      return
    }

    const homeScore = Number(predictedHomeScore)
    const awayScore = Number(predictedAwayScore)
    const hasEmptyScore = predictedHomeScore === '' || predictedAwayScore === ''
    const hasInvalidScore =
      hasEmptyScore ||
      !Number.isInteger(homeScore) ||
      !Number.isInteger(awayScore) ||
      homeScore < 0 ||
      awayScore < 0

    if (hasInvalidScore) {
      setSuccessMessage('')
      setErrorMessage('Scores are required, must be whole numbers, and cannot be negative.')
      return
    }

    setSaving(true)
    setErrorMessage('')
    setSuccessMessage('')

    const { data, error } = await upsertPrediction({
      userId: user.id,
      matchId: match.id,
      predictedHomeScore: homeScore,
      predictedAwayScore: awayScore,
    })

    setSaving(false)

    if (error) {
      setErrorMessage(error.message)
      return
    }

    setCurrentPrediction(data)
    setSuccessMessage('Prediction saved successfully.')
  }

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="font-semibold text-slate-600">Loading match details...</p>
      </div>
    )
  }

  if (!match) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-slate-950">Match not found</h1>
        {errorMessage ? <p className="mt-2 text-slate-600">{errorMessage}</p> : null}
        <Link className="mt-4 inline-block font-semibold text-blue-700" to="/matches">
          Back to Matches
        </Link>
      </div>
    )
  }

  const isScheduled = match.status === 'scheduled'
  const isFinished = match.status === 'finished'
  const canPredict = canPredictMatch(match)

  return (
    <>
      <PageHeader
        title={`${getTeamName(match.home_team)} vs ${getTeamName(match.away_team)}`}
        description={`${formatDate(match.match_date)} • ${match.stage}`}
      />

      <section className="rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-10">
        <div className="mb-6 flex flex-wrap justify-center gap-2">
          <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-bold text-blue-700">
            {match.stage}
          </span>
          <span
            className={[
              'rounded-full px-4 py-2 text-sm font-bold',
              isScheduled ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700',
            ].join(' ')}
          >
            {isScheduled ? 'Upcoming' : 'Finished'}
          </span>
        </div>

        <div className="grid items-center gap-6 md:grid-cols-[1fr_auto_1fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Home</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-950">
              <span className="mr-2">{getTeamFlag(match.home_team)}</span>
              {getTeamName(match.home_team)}
            </h2>
          </div>

          <div className="rounded-3xl bg-slate-50 px-8 py-6">
            <p className="text-5xl font-black text-blue-700">
              {isFinished ? `${match.home_score} : ${match.away_score}` : '- : -'}
            </p>
            <p className="mt-3 text-sm font-semibold text-slate-500">{formatDate(match.match_date)}</p>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Away</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-950">
              <span className="mr-2">{getTeamFlag(match.away_team)}</span>
              {getTeamName(match.away_team)}
            </h2>
          </div>
        </div>
      </section>

      {canPredict ? (
        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-xl font-bold text-slate-950">Score Prediction</h2>
            {currentPrediction ? (
              <p className="mt-2 text-sm text-slate-600">
                Previous prediction: {currentPrediction.predicted_home_score} -{' '}
                {currentPrediction.predicted_away_score}
              </p>
            ) : (
              <p className="mt-2 text-sm text-slate-600">Enter your score prediction for this match.</p>
            )}
          </div>

          <form className="grid gap-4 sm:grid-cols-[1fr_1fr_auto]" onSubmit={savePrediction}>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">
                {getTeamName(match.home_team)}
              </span>
              <input
                type="number"
                min="0"
                step="1"
                value={predictedHomeScore}
                onChange={(event) => setPredictedHomeScore(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                placeholder="0"
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">
                {getTeamName(match.away_team)}
              </span>
              <input
                type="number"
                min="0"
                step="1"
                value={predictedAwayScore}
                onChange={(event) => setPredictedAwayScore(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                placeholder="0"
              />
            </label>

            <button
              type="submit"
              disabled={saving}
              className="self-end rounded-2xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {saving ? 'Saving...' : currentPrediction ? 'Update Prediction' : 'Save Prediction'}
            </button>
          </form>

          {errorMessage ? (
            <p className="mt-4 rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700">
              {errorMessage}
            </p>
          ) : null}
          {successMessage ? (
            <p className="mt-4 rounded-2xl bg-green-50 p-4 text-sm font-semibold text-green-700">
              {successMessage}
            </p>
          ) : null}
        </section>
      ) : (
        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-950">Prediction Locked</h2>
          <p className="mt-2 text-slate-600">
            {getPredictionLockReason(match)}
          </p>
          {currentPrediction ? (
            <p className="mt-3 rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-700">
              Saved prediction: {currentPrediction.predicted_home_score} -{' '}
              {currentPrediction.predicted_away_score}
            </p>
          ) : null}
          {errorMessage ? (
            <p className="mt-4 rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700">
              {errorMessage}
            </p>
          ) : null}
        </section>
      )}
    </>
  )
}

export default MatchDetail
