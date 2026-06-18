import { Outlet, useLocation } from 'react-router-dom'
import BackButton from '../components/BackButton'

const routesWithoutBackButton = new Set([
  '/',
  '/login',
  '/register',
  '/check-onboarding',
  '/complete-profile',
  '/dashboard',
  '/leaderboard',
  '/users',
  '/admin',
])

function MainLayout() {
  const location = useLocation()
  const showBackButton = !routesWithoutBackButton.has(location.pathname)

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {showBackButton ? <BackButton /> : null}
      <Outlet />
    </main>
  )
}

export default MainLayout
