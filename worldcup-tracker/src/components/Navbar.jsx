import { useEffect, useRef, useState } from 'react'
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
  const menuRef = useRef(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const visibleNavItems = isAdmin ? [...navItems, { label: 'Admin', path: '/admin' }] : navItems

  const email = user?.email ?? ''
  const displayName = profile?.full_name || profile?.username || email.split('@')[0] || 'User'
  const avatarInitial = displayName.charAt(0).toUpperCase()

  useEffect(() => {
    let isMounted = true

    async function loadProfileRole() {
      const user = await getCurrentUser()

      if (!user) {
        if (isMounted) {
          setIsLoggedIn(false)
          setIsAdmin(false)
          setUser(null)
          setProfile(null)
        }
        return
      }

      if (isMounted) {
        setIsLoggedIn(true)
        setUser(user)
      }

      const { data: profile } = await getProfile(user.id)

      if (isMounted) {
        setIsAdmin(profile?.role === 'admin')
        setProfile(profile ?? null)
      }
    }

    loadProfileRole()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (!isProfileMenuOpen) {
      return undefined
    }

    function handlePointerDown(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false)
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsProfileMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isProfileMenuOpen])

  async function handleLogout() {
    const { error } = await signOut()

    if (error) {
      alert(error.message)
      return
    }

    setIsLoggedIn(false)
    setIsAdmin(false)
    setUser(null)
    setProfile(null)
    setIsProfileMenuOpen(false)
    navigate('/login', { replace: true })
  }

  function handleGoToProfile() {
    setIsProfileMenuOpen(false)
    navigate('/complete-profile')
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

        <div className="flex items-center justify-between gap-3 lg:justify-end">
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
          </div>

          {isLoggedIn ? (
            <div ref={menuRef} className="relative shrink-0">
              <button
                type="button"
                onClick={() => setIsProfileMenuOpen((isOpen) => !isOpen)}
                className="grid h-11 w-11 place-items-center overflow-hidden rounded-full border border-slate-200 bg-white text-sm font-black text-blue-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50"
                aria-label="Open profile menu"
                aria-expanded={isProfileMenuOpen}
              >
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={displayName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  avatarInitial
                )}
              </button>

              {isProfileMenuOpen ? (
                <div className="absolute right-0 mt-3 w-[min(calc(100vw-2rem),20rem)] rounded-3xl border border-slate-200 bg-white p-4 shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-full bg-blue-100 text-lg font-black text-blue-700">
                      {profile?.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          alt={displayName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        avatarInitial
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-black text-slate-950">{displayName}</p>
                      <p className="truncate text-sm text-slate-500">{email}</p>
                    </div>
                  </div>

                  <div className="my-4 border-t border-slate-100" />

                  <div className="grid gap-2">
                    <button
                      type="button"
                      onClick={handleGoToProfile}
                      className="rounded-2xl bg-blue-600 px-4 py-3 text-left text-sm font-bold text-white transition hover:bg-blue-700"
                    >
                      Profil
                    </button>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="rounded-2xl bg-red-50 px-4 py-3 text-left text-sm font-bold text-red-600 transition hover:bg-red-100 hover:text-red-700"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </nav>
    </header>
  )
}

export default Navbar
