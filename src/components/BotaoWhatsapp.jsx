import { useEffect, useRef, useState } from 'react'
import { site } from '../config/site'

const MENSAGEM = 'Olá, Júlio! Conheci seu site e gostaria de conversar sobre oportunidades de patrocínio e parceria.'

/**
 * Botão flutuante do WhatsApp (fixo no canto inferior direito, em todas as telas).
 * Enquanto o card "Próxima etapa" do hero está visível no mesmo canto, o botão sobe
 * para não cobri-lo; depois volta ao lugar.
 */
export default function BotaoWhatsapp() {
  const [elevar, setElevar] = useState(0)
  const ref = useRef(null)
  const numero = String(site.contato.whatsapp || '').replace(/\D/g, '')

  useEffect(() => {
    let card = null
    let io = null
    let raf = 0
    const medir = () => {
      if (!card) return
      const r = card.getBoundingClientRect()
      // opacidade real (o card some com a animação do hero): multiplica a dos ancestrais
      let op = 1
      for (let el = card; el && el !== document.body; el = el.parentElement) {
        const cs = getComputedStyle(el)
        if (cs.visibility === 'hidden' || cs.display === 'none') { op = 0; break }
        op *= parseFloat(cs.opacity)
      }
      const visivel = r.bottom > 0 && r.top < innerHeight && r.width > 0 && op > 0.05
      setElevar(visivel ? Math.max(0, innerHeight - r.top + 12 - parseFloat(getComputedStyle(ref.current).bottom)) : 0)
    }
    const iniciar = () => {
      card = document.querySelector('.hero-etapa')
      if (!card) return
      io = new IntersectionObserver(() => medir(), { threshold: [0, 0.01, 1] })
      io.observe(card)
      medir()
    }
    const rolar = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(medir) }
    const t = setTimeout(iniciar, 300)
    addEventListener('scroll', rolar, { passive: true })
    addEventListener('resize', rolar)
    return () => { clearTimeout(t); io && io.disconnect(); removeEventListener('scroll', rolar); removeEventListener('resize', rolar); cancelAnimationFrame(raf) }
  }, [])

  if (!numero) return null
  return (
    <a
      ref={ref}
      className="wa-flutuante"
      href={`https://wa.me/${numero}?text=${encodeURIComponent(MENSAGEM)}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Fale com nossa equipe pelo WhatsApp (abre em nova aba)"
      style={{ '--elevar': `${elevar}px` }}
      data-cursor="link"
    >
      <span className="wa-flutuante-dica" aria-hidden="true">Fale com nossa equipe</span>
      <span className="wa-flutuante-botao">
        <svg viewBox="0 0 32 32" aria-hidden="true">
          <path className="wa-balao" d="M16 3.5C9.1 3.5 3.5 9 3.5 15.8c0 2.4.7 4.6 1.9 6.5L3.6 28.5l6.4-1.7c1.8 1 3.9 1.5 6 1.5 6.9 0 12.5-5.5 12.5-12.3S22.9 3.5 16 3.5z" />
          <path className="wa-fone" d="M11.6 9.6c.3-.6.6-.7 1-.7h.8c.3 0 .6.1.7.5l1 2.4c.1.3.1.6-.1.8l-.7.9c-.2.2-.2.4 0 .7.8 1.4 2 2.6 3.5 3.4.3.2.5.1.7-.1l.9-1c.2-.3.5-.3.8-.2l2.3 1.1c.3.1.4.4.4.7 0 .7-.3 1.5-1 2-.9.6-2.1.8-3.7.3-3.1-1.1-5.8-3.7-7-6.8-.5-1.5-.3-3 .4-4z" />
        </svg>
      </span>
    </a>
  )
}
