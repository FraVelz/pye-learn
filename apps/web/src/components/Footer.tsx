import { type MouseEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import logo from '../assets/logo.svg'

const YEAR = new Date().getFullYear()

const PLATFORM = [
  { to: '/cursos', label: 'Cursos' },
] as const

const ACCOUNT = [
  { to: '/login', label: 'Iniciar sesión' },
  { to: '/register', label: 'Crear cuenta' },
] as const

export function Footer() {
  const navigate = useNavigate()

  function goToFaq(e: MouseEvent<HTMLAnchorElement>) {
    e.preventDefault()
    const scroll = () => document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' })
    if (window.location.pathname === '/') {
      scroll()
      return
    }
    navigate('/')
    window.setTimeout(scroll, 120)
  }

  return (
    <footer className="site-footer" aria-labelledby="footer-heading">
      <div className="site-footer-inner">
        <div className="site-footer-brand">
          <Link to="/" className="footer-brand-link" id="footer-heading">
            <img src={logo} alt="" className="brand-logo h-8 w-8" />
            <span className="text-[1.05rem] font-extrabold tracking-tight">
              pye<span className="text-[var(--pye-blue)]">learn</span>
            </span>
          </Link>
          <p className="site-footer-tagline">
            Academia de la comunidad PyE. Cursos prácticos, directos y sin relleno.
          </p>
        </div>

        <nav className="site-footer-nav" aria-label="Enlaces del pie">
          <div className="site-footer-col">
            <p className="site-footer-heading">Plataforma</p>
            <ul>
              {PLATFORM.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="footer-link">
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <a href="/#faq" className="footer-link" onClick={goToFaq}>
                  Preguntas frecuentes
                </a>
              </li>
            </ul>
          </div>

          <div className="site-footer-col">
            <p className="site-footer-heading">Cuenta</p>
            <ul>
              {ACCOUNT.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="footer-link">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </div>

      <div className="site-footer-bottom">
        <p>© {YEAR} PyE Learn · Comunidad PyE</p>
        <p className="site-footer-bottom-note">Aprende con estructura</p>
      </div>
    </footer>
  )
}
