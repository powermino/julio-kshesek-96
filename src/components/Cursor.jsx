import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

const ROTULOS = { revelar: 'Revelar', ver: 'Ver', menu: '', arrastar: 'Arraste' }

/** Cursor personalizado (só em dispositivos com mouse). */
export default function Cursor() {
  const raiz = useRef(null)
  const rotulo = useRef(null)

  useEffect(() => {
    if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return
    const el = raiz.current
    el.style.display = 'block'
    document.documentElement.classList.add('tem-cursor')
    const xTo = gsap.quickTo(el, 'x', { duration: 0.45, ease: 'power3' })
    const yTo = gsap.quickTo(el, 'y', { duration: 0.45, ease: 'power3' })

    let ux = -100, uy = -100
    const classificar = (alvoEl) => {
      const alvo = alvoEl && alvoEl.closest && alvoEl.closest('[data-cursor], a, button')
      const tipo = alvo ? alvo.dataset.cursor || 'link' : ''
      el.dataset.tipo = tipo
      rotulo.current.textContent = ROTULOS[tipo] || ''
    }
    const mover = (e) => { ux = e.clientX; uy = e.clientY; xTo(ux); yTo(uy); classificar(e.target) }
    const aoRolar = () => classificar(document.elementFromPoint(ux, uy))
    const sair = () => el.classList.add('is-fora')
    const entrar = () => el.classList.remove('is-fora')
    window.addEventListener('pointermove', mover)
    window.addEventListener('scroll', aoRolar, { passive: true })
    document.addEventListener('mouseleave', sair)
    document.addEventListener('mouseenter', entrar)
    return () => {
      window.removeEventListener('pointermove', mover)
      window.removeEventListener('scroll', aoRolar)
      document.removeEventListener('mouseleave', sair)
      document.removeEventListener('mouseenter', entrar)
      document.documentElement.classList.remove('tem-cursor')
    }
  }, [])

  return (
    <div className="cursor" ref={raiz} aria-hidden="true">
      <div className="cursor-bola"><span ref={rotulo} /></div>
    </div>
  )
}
