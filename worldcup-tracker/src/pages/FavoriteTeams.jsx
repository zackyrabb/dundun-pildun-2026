import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ErrorAlert from '../components/ErrorAlert'
import { getCurrentUser } from '../services/authService'
import {
  getTeams,
  getUserFavoriteTeams,
  saveUserFavoriteTeams,
} from '../services/favoriteTeamService'

const MAX_FAVORITE_TEAMS = 4

function FavoriteTeams() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [teams, setTeams] = useState([])
  const [selectedTeamIds, setSelectedTeamIds] = useState([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function loadFavoriteTeamsPage() {
      const currentUser = await getCurrentUser()

      if (!currentUser) {
        navigate('/login')
        return
      }

      setUser(currentUser)

      const [{ data: teamsData, error: teamsError }, { data: favoriteTeamsData, error: favoritesError }] =
        await Promise.all([getTeams(), getUserFavoriteTeams(currentUser.id)])

      if (teamsError) {
        setMessage(teamsError.message)
      }

      if (favoritesError) {
        setMessage(favoritesError.message)
      }

      setTeams(teamsData ?? [])
      setSelectedTeamIds((favoriteTeamsData ?? []).map((favoriteTeam) => favoriteTeam.team_id))
      setLoading(false)
    }

    loadFavoriteTeamsPage()
  }, [navigate])

  const selectedCount = selectedTeamIds.length
  const isComplete = selectedCount === MAX_FAVORITE_TEAMS

  const toggleTeam = (teamId) => {
    setSelectedTeamIds((currentTeamIds) => {
      const isSelected = currentTeamIds.includes(teamId)

      if (isSelected) {
        return currentTeamIds.filter((currentTeamId) => currentTeamId !== teamId)
      }

      if (currentTeamIds.length >= MAX_FAVORITE_TEAMS) {
        return currentTeamIds
      }

      return [...currentTeamIds, teamId]
    })
  }

  const saveFavoriteTeams = async () => {
    if (saving || !user || !isComplete) {
      return
    }

    setSaving(true)
    setMessage('')

    const { error } = await saveUserFavoriteTeams(user.id, selectedTeamIds)

    setSaving(false)

    if (error) {
      setMessage(error.message)
      return
    }

    navigate('/dashboard')
  }

  if (loading) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="font-semibold text-slate-600">Loading favorite teams...</p>
      </section>
    )
  }

  return (
      <section className="mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-green-600">Profile Setup</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-950">Choose 4 Favorite Teams</h1>
            <p className="mt-2 max-w-2xl text-slate-600">
              Your choices are saved to Supabase for the signed-in account.
            </p>
          </div>
          <div className="rounded-2xl bg-blue-50 px-5 py-3 text-center">
            <p className="text-sm font-semibold text-blue-700">Selected</p>
            <p className="text-2xl font-black text-blue-950">
              {selectedCount}/{MAX_FAVORITE_TEAMS}
            </p>
          </div>
        </div>

        <div className="mb-6">
          <ErrorAlert message={message} />
        </div>

        {teams.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {teams.map((team) => {
              const isSelected = selectedTeamIds.includes(team.id)
              const isDisabled = !isSelected && selectedCount >= MAX_FAVORITE_TEAMS

              return (
                <button
                  key={team.id}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => toggleTeam(team.id)}
                  className={[
                    'relative rounded-2xl border p-5 text-left shadow-sm transition',
                    isSelected
                      ? 'border-green-500 bg-green-50 ring-4 ring-green-100'
                      : 'border-slate-200 bg-white hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50',
                    isDisabled
                      ? 'cursor-not-allowed opacity-45 hover:translate-y-0 hover:border-slate-200 hover:bg-white'
                      : '',
                  ].join(' ')}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-4xl">{team.flag}</span>
                    <span
                      className={[
                        'grid h-7 w-7 place-items-center rounded-full border text-sm font-bold',
                        isSelected
                          ? 'border-green-500 bg-green-500 text-white'
                          : 'border-slate-300 bg-white text-transparent',
                      ].join(' ')}
                    >
                      ✓
                    </span>
                  </div>
                  <h2 className="mt-4 text-lg font-bold text-slate-950">{team.name}</h2>
                  <p className="text-sm font-semibold text-blue-700">{team.code}</p>
                  <p className="mt-2 text-sm text-slate-500">
                    {team.group} • {team.confederation}
                  </p>
                </button>
              )
            })}
          </div>
        ) : (
          <div className="rounded-2xl bg-slate-50 p-6 text-center text-slate-600">
            No teams found in the teams table.
          </div>
        )}

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
          <p className="text-sm font-medium text-slate-500">
            {isComplete
              ? 'Your selection is complete. You can continue to the dashboard.'
              : `Choose ${MAX_FAVORITE_TEAMS - selectedCount} more teams to continue.`}
          </p>
          <button
            type="button"
            disabled={!isComplete || saving}
            onClick={saveFavoriteTeams}
            className="rounded-2xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
          >
            {saving ? 'Saving...' : 'Continue to Dashboard'}
          </button>
        </div>
      </section>
  )
}

export default FavoriteTeams
