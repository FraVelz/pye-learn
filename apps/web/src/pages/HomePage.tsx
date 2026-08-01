import { Link } from 'react-router-dom'
import logo from '../assets/logo.svg'

export function HomePage() {
  return (
    <section className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-6xl flex-col justify-center px-4 py-16">
      <div className="max-w-3xl">
        <div className="mb-6 flex items-center gap-3">
          <img src={logo} alt="PyE" className="h-12 w-12" />
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--pye-blue)]">
            PyE Learn
          </p>
        </div>
        <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl">
          Aprende programación sin saltar entre mil recursos
        </h1>
        <p className="mt-5 max-w-xl text-lg text-[var(--pye-text-2)]">
          Cursos prácticos de la comunidad PyE. Directos, con progreso y listos para practicar.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/cursos" className="btn btn-primary">
            Ver cursos
          </Link>
          <Link to="/register" className="btn btn-ghost">
            Crear cuenta
          </Link>
        </div>
      </div>
    </section>
  )
}
