import { Link, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import EmptyState from '../components/EmptyState'
import ErrorAlert from '../components/ErrorAlert'
import LoadingState from '../components/LoadingState'
import PageHeader from '../components/PageHeader'
import { getPublicUserById, getPublicUserPredictions } from '../services/userService'
import { calculatePredictionPoints } from '../utils/calculatePredictionPoints'

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

const getFavoriteTeams = (user) =>
  (user?.user_favorite_teams ?? [])
    .map((favoriteTeam) => favoriteTeam.teams)
    .filter(Boolean)
    .slice(0, 4)

function UserDetail() {
  const { id } = useParams()
  const [user, setUser] = useState(null)
  const [predictions, setPredictions] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function loadUserDetail() {
      const [{ data: userData, error: userError }, { data: predictionsData, error: predictionsError }] =
        await Promise.all([getPublicUserById(id), getPublicUserPredictions(id)])

      const error = userError || predictionsError

      if (error) {
        setMessage(error.message)
        setLoading(false)
        return
      }

      setUser(userData)
      setPredictions(
        (predictionsData ?? [])
          .map((prediction) => ({
            ...prediction,
            points: calculatePredictionPoints(prediction.match, prediction),
          }))
          .sort((firstPrediction, secondPrediction) => {
            return new Date(firstPrediction.match?.match_date) - new Date(secondPrediction.match?.match_date)
          }),
      )
      setLoading(false)
    }

    loadUserDetail()
  }, [id])

  if (loading) {
    return <LoadingState text="Loading user details..." />
  }

  if (!user) {
    return (
      <>
        <ErrorAlert message={message} />
        <EmptyState
          title="User not found"
          description="Supabase profile data is not available."
          action={
            <Link
              className="inline-flex rounded-2xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700"
              to="/users"
            >
              Back to Users
            </Link>
          }
        />
      </>
    )
  }

  const favoriteTeams = getFavoriteTeams(user)
  const countedPredictions = predictions.filter((prediction) => prediction.match?.status === 'finished').length
  const totalPoints = predictions.reduce((points, prediction) => points + prediction.points, 0)

  return (
    <>
      <PageHeader
        title={user.full_name || 'Unnamed User'}
        description={`@${user.username || 'username-not-set'} • User profile and prediction history.`}
      />

      <div className="mb-6">
        <ErrorAlert message={message} />
      </div>

      <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <img
              src={user.avatar_url || 'https://i.pravatar.cc/150?img=12'}
              alt={user.full_name || user.username || 'User'}
              className="h-20 w-20 rounded-3xl object-cover ring-4 ring-blue-50"
            />
            <div className="min-w-0">
              <h2 className="truncate text-2xl font-bold text-slate-950">{user.full_name || 'Unnamed User'}</h2>
              <p className="truncate text-slate-500">@{user.username || 'username-not-set'}</p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Total Predictions</p>
              <p className="text-2xl font-black text-slate-950">{predictions.length}</p>
            </div>
            <div className="rounded-2xl bg-blue-50 p-4">
              <p className="text-sm text-blue-700">Counted</p>
              <p className="text-2xl font-black text-blue-700">{countedPredictions}</p>
            </div>
            <div className="rounded-2xl bg-green-50 p-4">
              <p className="text-sm text-green-700">Total Points</p>
              <p className="text-2xl font-black text-green-700">{totalPoints}</p>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="font-bold text-slate-950">Favorite Teams</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {favoriteTeams.length > 0 ? (
                favoriteTeams.map((team) => (
                  <span key={team.id} className="rounded-full bg-blue-100 px-3 py-1 text-sm font-bold text-blue-700">
                    {team.flag} {team.name}
                  </span>
                ))
              ) : (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-500">
                  No favorites selected
                </span>
              )}
            </div>
          </div>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-950">User Predictions</h2>
          <div className="mt-4 space-y-4">
            {predictions.length > 0 ? (
              predictions.map((prediction) => {
                const { match } = prediction
                const isFinished = match?.status === 'finished'

                return (
                  <div key={prediction.id} className="rounded-2xl bg-slate-50 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                        {match?.stage ?? '-'}
                      </span>
                      <span
                        className={[
                          'rounded-full px-3 py-1 text-xs font-bold',
                          isFinished ? 'bg-slate-200 text-slate-700' : 'bg-green-100 text-green-700',
                        ].join(' ')}
                      >
                        {isFinished ? 'Finished' : match?.status ?? 'Pending'}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
                      <div>
                        <p className="text-sm font-semibold text-slate-500">Home</p>
                        <h3 className="mt-1 flex items-center gap-2 font-bold text-slate-950">
                          <span>{getTeamFlag(match?.home_team)}</span>
                          {getTeamName(match?.home_team)}
                        </h3>
                      </div>
                      <div className="rounded-2xl bg-white px-5 py-3 text-center">
                        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Prediction</p>
                        <p className="text-xl font-black text-blue-700">
                          {prediction.predicted_home_score} - {prediction.predicted_away_score}
                        </p>
                      </div>
                      <div className="sm:text-right">
                        <p className="text-sm font-semibold text-slate-500">Away</p>
                        <h3 className="mt-1 flex items-center gap-2 font-bold text-slate-950 sm:justify-end">
                          <span>{getTeamFlag(match?.away_team)}</span>
                          {getTeamName(match?.away_team)}
                        </h3>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-3 sm:items-center">
                      <p className="text-sm text-slate-500">
                        {match?.match_date ? formatDate(match.match_date) : '-'}
                      </p>
                      <p className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-700">
                        Result: {isFinished ? `${match.home_score} - ${match.away_score}` : 'Not available yet'}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                        <span className="rounded-2xl bg-green-100 px-4 py-3 text-sm font-black text-green-700">
                          {isFinished ? `${prediction.points} points` : 'Pending'}
                        </span>
                        {match?.id ? (
                          <Link
                            to={`/matches/${match.id}`}
                            className="rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                          >
                            Match Details
                          </Link>
                        ) : null}
                      </div>
                    </div>
                  </div>
                )
              })
            ) : (
              <EmptyState
                title="No predictions yet"
                description="This user has not made any match predictions yet."
              />
            )}
          </div>
        </article>
      </section>
    </>
  )
}

export default UserDetail
