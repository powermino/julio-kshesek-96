import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { site } from '../config/site'

/** Abertura: contador de 00 a 96 e a cortina sobe. */
export default function Loader({ aoTerminar }) {
  const raiz = useRef(null)
  const num = useRef(null)

  useEffect(() => {
    const reduzir = matchMedia('(prefers-reduced-motion: reduce)').matches
    const alvo = parseInt(site.numero, 10) || 100
    const fontes = document.fonts ? document.fonts.ready : Promise.resolve()
    const c = gsap.context(() => {
      const cont = { v: 0 }
      const tl = gsap.timeline({ paused: true, onComplete: aoTerminar })
      tl.to(cont, {
        v: alvo,
        duration: reduzir ? 0.2 : 1.6,
        ease: 'power2.inOut',
        onUpdate: () => { num.current.textContent = String(Math.round(cont.v)).padStart(2, '0') },
      })
        .to('.loader-barra i', { scaleX: 1, duration: reduzir ? 0.2 : 1.6, ease: 'power2.inOut' }, 0)
        .to('.loader-conteudo', { yPercent: -40, autoAlpha: 0, duration: 0.6, ease: 'power3.in' })
        .to(raiz.current, { clipPath: 'inset(0 0 100% 0)', duration: 1, ease: 'expo.inOut' }, '-=0.2')
        .set(raiz.current, { display: 'none' })
      fontes.then(() => tl.play())
    }, raiz)
    return () => c.revert()
  }, [aoTerminar])

  return (
    <div className="loader" ref={raiz} aria-hidden="true">
      <div className="loader-conteudo">
        <span className="loader-rotulo">{site.nome}</span>
        <span className="loader-num">
          <span className="loader-hash">#</span>
          <span ref={num}>00</span>
        </span>
        <span className="loader-barra"><i /></span>
      </div>
    </div>
  )
}
