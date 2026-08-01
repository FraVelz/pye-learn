import { useState } from 'react'

const FAQS = [
  {
    q: '¿Qué incluye PyE Learn?',
    a: 'Cursos prácticos con temario, lecciones en markdown/video y seguimiento de progreso. La idea es aprender con estructura, sin saltar entre mil recursos.',
  },
  {
    q: '¿Es gratis?',
    a: 'El prototipo actual incluye cursos gratuitos de demo. Puedes registrarte, inscribirte y marcar lecciones como completadas.',
  },
  {
    q: '¿Para qué nivel es?',
    a: 'Hay contenido introductorio y práctico pensado tanto para quien empieza como para quien quiere reforzar fundamentos (Go, React, Postgres).',
  },
  {
    q: '¿Cómo empiezo?',
    a: 'Crea una cuenta, entra a Cursos, inscríbete y abre la primera lección. Tu progreso queda guardado en tu perfil.',
  },
  {
    q: '¿Habrá más cursos?',
    a: 'Sí. Este MVP es la base de la plataforma de cursos de la comunidad PyE; el catálogo se irá ampliando.',
  },
]

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section className="mx-auto max-w-3xl px-4 py-20">
      <div className="text-center">
        <p className="eyebrow">Dudas frecuentes</p>
        <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">Preguntas antes de unirte</h2>
        <p className="mx-auto mt-3 max-w-xl text-[var(--pye-text-2)]">
          Lo esencial para decidir con tranquilidad si la academia encaja contigo.
        </p>
      </div>

      <div className="mt-10">
        {FAQS.map((item, i) => {
          const isOpen = open === i
          return (
            <div key={item.q} className="faq-item">
              <button type="button" onClick={() => setOpen(isOpen ? null : i)} aria-expanded={isOpen}>
                <span>{item.q}</span>
                <span className="faq-plus" aria-hidden>
                  {isOpen ? '−' : '+'}
                </span>
              </button>
              {isOpen && <p className="pb-5 pr-8 text-[var(--pye-text-2)] leading-relaxed">{item.a}</p>}
            </div>
          )
        })}
      </div>
    </section>
  )
}
