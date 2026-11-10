import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { site } from '../config/site'

/** Menu em tela cheia: painel desce, links sobem um a um, imagem muda no hover. */
export default function Menu({ aberto, irPara }) {
  const raiz = useRef(null)
  const tl = useRef(null)
  const [foco, setFoco] = useState(0)

  useEffect(() => {
    const c = gsap.context(() => {
      tl.current = gsap
        .timeline({ paused: true, defaults: { ease: 'expo.out' } })
        .set(raiz.current, { visibility: 'visible' })
        .fromTo(raiz.current, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 0.9, ease: 'expo.inOut' })
        .from('.menu-link span', { yPercent: 110, duration: 1, stagger: 0.06 }, 0.45)
        .from('.menu-visual', { autoAlpha: 0, scale: 1.1, duration: 1.2 }, 0.5)
        .from('.menu-rodape > *', { autoAlpha: 0, y: 16, duration: 0.8, stagger: 0.05 }, 0.7)
    }, raiz)
    return () => c.revert()
  }, [])

  useEffect(() => {
    if (!tl.current) return
    if (aberto) tl.current.timeScale(1).play()
    else tl.current.timeScale(1.8).reverse()
  }, [aberto])

  return (
    <div id="menu" className="menu" ref={raiz} aria-hidden={!aberto}>
      <div className="menu-grade">
        <ul className="menu-links">
          {site.menu.map((m, i) => (
            <li key={m.href}>
              <a
                href={m.href}
                className={`menu-link ${foco === i ? 'is-foco' : ''}`}
                onClick={(e) => irPara(e, m.href)}
                onMouseEnter={() => setFoco(i)}
                tabIndex={aberto ? 0 : -1}
              >
                <span>
                  <small>{String(i + 1).padStart(2, '0')}</small>
                  {m.rotulo}
                </span>
              </a>
            </li>
          ))}
        </ul>

        <div className="menu-visual" aria-hidden="true">
          {site.menu.map((m, i) => (
            <div key={m.href} className={`menu-visual-item placeholder-foto ${foco === i ? 'is-ativo' : ''}`} data-n={i}>
              <span>Foto provisória · {m.rotulo}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="menu-rodape">
        <span>{site.categoria} · #{site.numero}</span>
        <div className="menu-redes">
          {site.redes.map((r) => (
            <a key={r.nome} href={r.url} target={r.externo ? '_blank' : undefined} rel={r.externo ? 'noopener noreferrer' : undefined} tabIndex={aberto ? 0 : -1}>{r.nome}</a>
          ))}
        </div>
      </div>
    </div>
  )
}
