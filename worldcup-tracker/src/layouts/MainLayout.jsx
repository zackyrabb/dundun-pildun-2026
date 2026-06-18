import { Outlet } from 'react-router-dom'

function MainLayout() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Outlet />
    </main>
  )
}

export default MainLayout
