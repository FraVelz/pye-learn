import { Link, NavLink, Outlet } from 'react-router-dom'
import logo from '../assets/logo.svg'
import { useAuth } from '../lib/auth'

function IconCamera() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M15 10l4.55-2.27A1 1 0 0121 8.62v6.76a1 1 0 01-1.45.89L15 14M5 6h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function Layout() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-[color-mix(in_srgb,var(--pye-bg)_80%,transparent)] backdrop-blur-xl">
        <div className="mx-auto grid max-w-6xl grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 py-3.5">
          <Link to="/" className="flex items-center gap-2.5 justify-self-start">
            <img src={logo} alt="" className="h-8 w-8 brightness-0 invert" />
            <span className="text-[1.05rem] font-extrabold tracking-tight">
              pye<span className="text-[var(--pye-blue)]">learn</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-medium text-white/70 sm:flex">
            <NavLink
              to="/cursos"
              className={({ isActive }) =>
                `inline-flex items-center gap-2 transition hover:text-white ${isActive ? 'text-white' : ''}`
              }
            >
              <IconCamera />
              Cursos
            </NavLink>
          </nav>

          <div className="flex items-center justify-self-end gap-2">
            {user ? (
              <>
                <span className="hidden text-sm text-white/60 md:inline">{user.name}</span>
                <button type="button" className="btn btn-ghost !py-2 !px-3 text-sm" onClick={logout}>
                  Salir
                </button>
              </>
            ) : (
              <Link to="/login" className="inline-flex items-center gap-2 rounded-full px-2 py-1.5 text-sm font-medium text-white/90 hover:bg-white/5">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[var(--pye-blue)] text-white">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path
                      d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                Iniciar sesión
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-white/[0.06] py-10 text-center text-sm text-white/40">
        Comunidad PyE · Aprende con estructura
      </footer>
    </div>
  )
}
