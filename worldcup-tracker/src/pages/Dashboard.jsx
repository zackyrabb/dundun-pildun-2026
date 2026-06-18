import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getCurrentUser } from '../services/authService'
import { getDashboardData } from '../services/dashboardService'
import { calculatePredictionPoints } from '../utils/calculatePredictionPoints'

const quickActions = [
  {
    title: 'My Predictions',
    description: 'Review and update your score picks.',
    path: '/predictions',
    icon: '🏆',
    accent: 'text-blue-700 bg-blue-100',
  },
  {
    title: 'Teams',
    description: 'Explore tournament teams and groups.',
    path: '/teams',
    icon: '🚩',
    accent: 'text-green-700 bg-green-100',
  },
  {
    title: 'Matches',
    description: 'See schedules, results, and details.',
    path: '/matches',
    icon: '📅',
    accent: 'text-blue-700 bg-blue-100',
  },
]

const formatDate = (date) =>
  new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))

const getTeamName = (team) => team?.name ?? 'Unknown team'

const buildPredictionRanking = (profiles, predictions) => {
  return profiles
    .map((profile) => {
      const userPredictions = predictions.filter((prediction) => prediction.user_id === profile.id)
      const totalPoints = userPredictions.reduce((points, prediction) => {
        return points + calculatePredictionPoints(prediction.match, prediction)
      }, 0)

      return {
        userId: profile.id,
        profile,
        totalPoints,
      }
    })
    .sort((firstUser, secondUser) => secondUser.totalPoints - firstUser.totalPoints)
    .slice(0, 5)
}

function Dashboard() {
  const navigate = useNavigate()
  const [currentProfile, setCurrentProfile] = useState(null)
  const [favoriteTeams, setFavoriteTeams] = useState([])
  const [nextFavoriteMatches, setNextFavoriteMatches] = useState([])
  const [latestResults, setLatestResults] = useState([])
  const [predictionRanking, setPredictionRanking] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function loadDashboard() {
      const currentUser = await getCurrentUser()

      if (!currentUser) {
        navigate('/login')
        return
      }

      const { data, error } = await getDashboardData(currentUser.id)

      if (error) {
        setMessage(error.message)
        setLoading(false)
        return
      }

      const favoriteRows = data.favoriteTeams ?? []
      const favoriteTeamIds = favoriteRows.map((favoriteTeam) => favoriteTeam.team_id)
      const profile = (data.profiles ?? []).find((profileItem) => profileItem.id === currentUser.id)
      const selectedFavoriteTeams = favoriteRows
        .map((favoriteTeam) => favoriteTeam.teams)
        .filter(Boolean)
        .slice(0, 4)
      const allMatches = data.matches ?? []

      const scheduledMatches = allMatches
        .filter(
          (match) =>
            match.status === 'scheduled' &&
            (favoriteTeamIds.includes(match.home_team_id) ||
              favoriteTeamIds.includes(match.away_team_id)),
        )
        .sort((firstMatch, secondMatch) => new Date(firstMatch.match_date) - new Date(secondMatch.match_date))
        .slice(0, 3)

      const finishedMatches = allMatches
        .filter((match) => match.status === 'finished')
        .sort((firstMatch, secondMatch) => new Date(secondMatch.match_date) - new Date(firstMatch.match_date))
        .slice(0, 3)

      setCurrentProfile(profile ?? null)
      setFavoriteTeams(selectedFavoriteTeams)
      setNextFavoriteMatches(scheduledMatches)
      setLatestResults(finishedMatches)
      setPredictionRanking(buildPredictionRanking(data.profiles ?? [], data.predictions ?? []))
      setLoading(false)
    }

    loadDashboard()
  }, [navigate])

  if (loading) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="font-semibold text-slate-600">Loading dashboard...</p>
      </section>
    )
  }

  const welcomeName = currentProfile?.full_name || currentProfile?.username || 'there'

  const dashboardHero = (
    <section className="rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-700 via-blue-600 to-green-500 p-6 text-white shadow-sm sm:p-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-100">DUNDUN PILDUN 2026</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
          Welcome back, {welcomeName}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-50 sm:text-base">
          Track your favorite teams, submit score predictions, and climb the leaderboard.
        </p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {quickActions.map((action) => (
          <Link
            key={action.path}
            to={action.path}
            className="rounded-3xl border border-white/70 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <span className={`grid h-12 w-12 place-items-center rounded-2xl text-2xl ${action.accent}`}>
              {action.icon}
            </span>
            <h2 className="mt-4 text-lg font-black text-slate-950">{action.title}</h2>
            <p className="mt-1 text-sm leading-5 text-slate-600">{action.description}</p>
          </Link>
        ))}
      </div>
    </section>
  )

  if (favoriteTeams.length === 0) {
    return (
      <>
          {dashboardHero}

          {message ? (
            <div className="mt-6 rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700">
              {message}
            </div>
          ) : null}

          <section className="mt-6 rounded-3xl border border-blue-100 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-blue-100 text-3xl text-blue-700">
              ⚽
            </div>
            <h2 className="mt-5 text-2xl font-bold text-slate-950">No favorite teams yet</h2>
            <p className="mx-auto mt-2 max-w-xl text-slate-600">
              The dashboard will show favorite teams, upcoming matches, latest results, and prediction rankings
              after you choose 4 teams.
            </p>
            <Link
              to="/favorite-teams"
              className="mt-6 inline-flex rounded-2xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              Choose Favorite Teams
            </Link>
          </section>
      </>
    )
  }

  return (
    <>
        {dashboardHero}

        {message ? (
          <div className="mt-6 rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700">
            {message}
          </div>
        ) : null}

        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-slate-950">4 Favorite Teams</h2>
            <Link className="text-sm font-semibold text-blue-700 hover:text-blue-800" to="/favorite-teams">
              Manage
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {favoriteTeams.map((team) => (
              <Link
                key={team.id}
                to={`/teams/${team.id}`}
                className="flex min-h-16 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
              >
                <span className="shrink-0 text-2xl">{team.flag}</span>
                <h3 className="truncate text-sm font-bold text-slate-950 sm:text-base">{team.name}</h3>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-8 grid items-stretch gap-6 lg:grid-cols-[0.95fr_1.35fr]">
          <section className="h-full rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-950">Top 5 Dukun</h2>
            <div className="mt-4 flex h-[calc(100%-2rem)] flex-col gap-3">
              {predictionRanking.map((user, index) => {
                const profile = user.profile ?? {}
                const displayName = profile.full_name ?? 'User'
                const username = profile.username ?? user.userId
                const initial = displayName.charAt(0).toUpperCase()

                return (
                  <Link
                    key={user.userId}
                    to={`/users/${user.userId}`}
                    className="grid gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 transition hover:border-blue-200 hover:bg-blue-50 sm:grid-cols-[auto_auto_1fr_auto] sm:items-center"
                  >
                    <div className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-600 text-sm font-bold text-white">
                      #{index + 1}
                    </div>
                    {profile.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={displayName}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="grid h-12 w-12 place-items-center rounded-full bg-green-100 text-base font-black text-green-700">
                        {initial}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="truncate font-bold text-slate-950">{displayName}</p>
                      <p className="truncate text-sm text-slate-500">@{username}</p>
                    </div>
                    <p className="font-black text-green-600 sm:text-right">{user.totalPoints} points</p>
                  </Link>
                )
              })}
            </div>
          </section>

          <div className="grid h-full gap-6">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-xl font-bold text-slate-950">Latest Results</h2>
                <Link className="text-sm font-semibold text-blue-700 hover:text-blue-800" to="/matches">
                  View all
                </Link>
              </div>
              <div className="mt-4 space-y-4">
                {latestResults.map((match) => (
                  <Link
                    key={match.id}
                    to={`/matches/${match.id}`}
                    className="block rounded-2xl bg-slate-50 p-4 transition hover:bg-blue-50"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <p className="font-bold text-slate-950">
                        {getTeamName(match.home_team)} vs {getTeamName(match.away_team)}
                      </p>
                      <span className="text-lg font-black text-blue-700">
                        {match.home_score} - {match.away_score}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-500">
                      {formatDate(match.match_date)} • {match.stage}
                    </p>
                  </Link>
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-xl font-bold text-slate-950">Upcoming Matches</h2>
                <Link className="text-sm font-semibold text-blue-700 hover:text-blue-800" to="/matches">
                  View all
                </Link>
              </div>
              <div className="mt-4 space-y-4">
                {nextFavoriteMatches.length > 0 ? (
                  nextFavoriteMatches.map((match) => (
                    <Link
                      key={match.id}
                      to={`/matches/${match.id}`}
                      className="block rounded-2xl bg-slate-50 p-4 transition hover:bg-blue-50"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <p className="font-bold text-slate-950">
                          {getTeamName(match.home_team)} vs {getTeamName(match.away_team)}
                        </p>
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                          {match.status}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-slate-500">
                        {formatDate(match.match_date)} • {match.stage}
                      </p>
                    </Link>
                  ))
                ) : (
                  <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                    No scheduled matches for favorite teams yet.
                  </p>
                )}
              </div>
            </section>
          </div>
        </section>
    </>
  )
}

export default Dashboard
