import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import EmptyState from '../components/EmptyState'
import ErrorAlert from '../components/ErrorAlert'
import LoadingState from '../components/LoadingState'
import PageHeader from '../components/PageHeader'
import { getPublicUsers, getPublicUsersPredictions } from '../services/userService'
import { calculatePredictionPoints } from '../utils/calculatePredictionPoints'

const getFavoriteTeams = (user) =>
  (user.user_favorite_teams ?? [])
    .map((favoriteTeam) => favoriteTeam.teams)
    .filter(Boolean)
    .slice(0, 4)

function buildUserStats(users, predictions) {
  return users.map((user) => {
    const userPredictions = predictions.filter((prediction) => prediction.user_id === user.id)
    const countedPredictions = userPredictions.filter((prediction) => prediction.match?.status === 'finished')
    const totalPoints = userPredictions.reduce((points, prediction) => {
      return points + calculatePredictionPoints(prediction.match, prediction)
    }, 0)

    return {
      ...user,
      favoriteTeams: getFavoriteTeams(user),
      totalPredictions: userPredictions.length,
      countedPredictions: countedPredictions.length,
      totalPoints,
    }
  })
}

function Users() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function loadUsers() {
      const [{ data: usersData, error: usersError }, { data: predictionsData, error: predictionsError }] =
        await Promise.all([getPublicUsers(), getPublicUsersPredictions()])

      const error = usersError || predictionsError

      if (error) {
        setMessage(error.message)
        setLoading(false)
        return
      }

      setUsers(buildUserStats(usersData ?? [], predictionsData ?? []))
      setLoading(false)
    }

    loadUsers()
  }, [])

  if (loading) {
    return <LoadingState text="Loading users..." />
  }

  return (
    <>
      <PageHeader
        title="Users"
        description="Registered users, favorite teams, and prediction statistics from Supabase."
      />

      <div className="mb-6">
        <ErrorAlert message={message} />
      </div>

      {users.length === 0 ? (
        <EmptyState
          title="No users yet"
          description="Supabase profile data is not available yet."
        />
      ) : (
        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {users.map((user) => (
            <Link
              key={user.id}
              to={`/users/${user.id}`}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
            >
              <div className="flex items-start gap-4">
                <img
                  src={user.avatar_url || 'https://i.pravatar.cc/150?img=12'}
                  alt={user.full_name || user.username || 'User'}
                  className="h-16 w-16 rounded-2xl object-cover ring-4 ring-blue-50"
                />
                <div className="min-w-0">
                  <h2 className="truncate text-xl font-bold text-slate-950">
                    {user.full_name || 'Unnamed User'}
                  </h2>
                  <p className="truncate text-sm text-slate-500">
                    @{user.username || 'username-not-set'}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {user.favoriteTeams.length > 0 ? (
                  user.favoriteTeams.map((team) => (
                    <span
                      key={team.id}
                      className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700"
                    >
                      {team.flag} {team.name}
                    </span>
                  ))
                ) : (
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
                    No favorites selected
                  </span>
                )}
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Total Predictions</p>
                  <p className="mt-1 text-2xl font-black text-slate-950">{user.totalPredictions}</p>
                </div>
                <div className="rounded-2xl bg-green-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-green-700">Total Points</p>
                  <p className="mt-1 text-2xl font-black text-green-700">{user.totalPoints}</p>
                </div>
              </div>
            </Link>
          ))}
        </section>
      )}
    </>
  )
}

export default Users
