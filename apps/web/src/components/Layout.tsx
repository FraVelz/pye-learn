import { Link, NavLink, Outlet } from 'react-router-dom'
import logo from '../assets/logo.svg'
import { useAuth } from '../lib/auth'

export function Layout() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[color-mix(in_srgb,var(--pye-bg)_85%,transparent)] backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="" className="h-8 w-8 text-white" style={{ color: 'white' }} />
            <span className="text-lg font-extrabold tracking-tight">
              PyE <span className="text-[var(--pye-blue)]">Learn</span>
            </span>
          </Link>
          <nav className="flex items-center gap-4 text-sm font-medium text-[var(--pye-text-2)]">
            <NavLink to="/cursos" className={({ isActive }) => (isActive ? 'text-white' : 'hover:text-white')}>
              Cursos
            </NavLink>
            {user ? (
              <>
                <span className="hidden sm:inline text-white/70">{user.name}</span>
                <button type="button" className="btn btn-ghost !py-2 !px-3 text-sm" onClick={logout}>
                  Salir
                </button>
              </>
            ) : (
              <Link to="/login" className="btn btn-primary !py-2 !px-3 text-sm">
                Iniciar sesión
              </Link>
            )}
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-white/10 py-8 text-center text-sm text-white/50">
        Comunidad PyE · Aprende con estructura
      </footer>
    </div>
  )
}
