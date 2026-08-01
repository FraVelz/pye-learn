import { Link, NavLink, Outlet } from 'react-router-dom'
import logo from '../assets/logo.svg'
import { Footer } from './Footer'
import { useAuth } from '../lib/use-auth'
import { useTheme } from '../lib/use-theme'

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

function IconSun() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

function IconMoon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M21 14.5A8.5 8.5 0 1110.5 3a7 7 0 0010.5 11.5z"
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
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="min-h-screen flex flex-col">
      <a href="#contenido" className="skip-link">
        Saltar al contenido
      </a>
      <header
        className="sticky top-0 z-30 border-b backdrop-blur-xl"
        style={{ borderColor: 'var(--pye-line)', background: 'var(--pye-header-bg)' }}
      >
        <div className="mx-auto grid max-w-6xl grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 py-3.5">
          <Link to="/" className="nav-link flex items-center gap-2.5 justify-self-start">
            <img src={logo} alt="" className="brand-logo h-8 w-8" />
            <span className="text-[1.05rem] font-extrabold tracking-tight">
              pye<span className="text-[var(--pye-blue)]">learn</span>
            </span>
          </Link>

          <nav aria-label="Principal" className="flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--pye-text-2)' }}>
            <NavLink
              to="/cursos"
              className={({ isActive }) =>
                `nav-link inline-flex items-center gap-2 transition hover:opacity-100 ${isActive ? 'text-[var(--pye-text)]' : 'opacity-80'}`
              }
            >
              <IconCamera />
              Cursos
            </NavLink>
          </nav>

          <div className="flex items-center justify-self-end gap-2">
            <button
              type="button"
              className="btn-icon"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'}
              title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
            >
              {theme === 'dark' ? <IconSun /> : <IconMoon />}
            </button>

            {user ? (
              <>
                <span className="hidden text-sm md:inline" style={{ color: 'var(--pye-text-3)' }}>
                  {user.name}
                </span>
                <button type="button" className="btn btn-ghost !py-2 !px-3 text-sm" onClick={() => void logout()}>
                  Salir
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="nav-link inline-flex items-center gap-2 rounded-full px-2 py-1.5 text-sm font-medium hover:bg-[var(--pye-hover)]"
              >
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

      <main id="contenido" className="flex-1" tabIndex={-1}>
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}
