import { Link } from 'react-router-dom'

function AuthLayout({ title, description, children, footerText, footerLink, footerLinkText }) {
  return (
    <main className="grid min-h-screen place-items-center bg-gradient-to-br from-blue-50 via-white to-green-50 px-4 py-10">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-blue-100/60">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-blue-600 text-2xl text-white">
            ⚽
          </div>
          <h1 className="text-3xl font-bold text-slate-950">{title}</h1>
          <p className="mt-2 text-slate-600">{description}</p>
        </div>

        {children}

        <p className="mt-6 text-center text-sm text-slate-600">
          {footerText}{' '}
          <Link className="font-semibold text-blue-700 hover:text-blue-800" to={footerLink}>
            {footerLinkText}
          </Link>
        </p>
      </section>
    </main>
  )
}

export default AuthLayout
