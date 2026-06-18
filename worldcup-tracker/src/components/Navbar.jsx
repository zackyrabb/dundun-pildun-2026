import { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { getCurrentUser, signOut } from '../services/authService'
import { getProfile } from '../services/profileService'

const navItems = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Leaderboard', path: '/leaderboard' },
  { label: 'Users', path: '/users' },
]

function Navbar() {
  const navigate = useNavigate()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const visibleNavItems = isAdmin ? [...navItems, { label: 'Admin', path: '/admin' }] : navItems

  useEffect(() => {
    let isMounted = true

    async function loadProfileRole() {
      const user = await getCurrentUser()

      if (!user) {
        if (isMounted) {
          setIsLoggedIn(false)
          setIsAdmin(false)
        }
        return
      }

      if (isMounted) {
        setIsLoggedIn(true)
      }

      const { data: profile } = await getProfile(user.id)

      if (isMounted) {
        setIsAdmin(profile?.role === 'admin')
      }
    }

    loadProfileRole()

    return () => {
      isMounted = false
    }
  }, [])

  async function handleLogout() {
    const { error } = await signOut()

    if (error) {
      alert(error.message)
      return
    }

    setIsLoggedIn(false)
    setIsAdmin(false)
    navigate('/login', { replace: true })
  }

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <NavLink to="/dashboard" className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-600 text-xl text-white shadow-sm">
            ⚽
          </span>
          <div>
            <p className="text-lg font-bold text-slate-950">Dundun Pildun 2026</p>
            <p className="text-xs font-medium text-slate-500">Track matches, teams, and predictions</p>
          </div>
        </NavLink>

        <div className="flex gap-2 overflow-x-auto pb-1 lg:pb-0">
          {visibleNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                [
                  'whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition',
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-blue-50 hover:text-blue-700',
                ].join(' ')
              }
            >
              {item.label}
            </NavLink>
          ))}

          {isLoggedIn ? (
            <button
              type="button"
              onClick={handleLogout}
              className="whitespace-nowrap rounded-full bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100 hover:text-red-700"
            >
              Logout
            </button>
          ) : null}
        </div>
      </nav>
    </header>
  )
}

export default Navbar
