import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { site } from '../config/site'
import Menu from './Menu'

gsap.registerPlugin(ScrollTrigger)

/** Cabeçalho fixo que troca de tema conforme a seção embaixo dele. */
export default function Header({ lenis, pronto }) {
  const raiz = useRef(null)
  const [tema, setTema] = useState('light')
  const [aberto, setAberto] = useState(false)

  useEffect(() => {
    if (!pronto) return
    const triggers = gsap.utils.toArray('[data-theme]').map((sec) =>
      ScrollTrigger.create({
        trigger: sec,
        start: 'top 40px',
        end: 'bottom 40px',
        refreshPriority: -1, // calcula depois dos pins das seções
        onToggle: (s) => s.isActive && setTema(sec.dataset.theme),
      })
    )
    // esconde ao descer, mostra ao subir
    const st = ScrollTrigger.create({
      start: 'top -120',
      onUpdate: (s) => raiz.current.classList.toggle('is-oculto', s.direction === 1 && s.scroll() > 200),
    })
    ScrollTrigger.refresh()
    return () => { triggers.forEach((t) => t.kill()); st.kill() }
  }, [pronto])

  // a Hero troca o tema durante a transição (ela fica fixada enquanto escurece)
  useEffect(() => {
    const ouvir = (e) => setTema(e.detail)
    window.addEventListener('site:tema', ouvir)
    return () => window.removeEventListener('site:tema', ouvir)
  }, [])

  useEffect(() => {
    if (!lenis || !pronto) return
    aberto ? lenis.stop() : lenis.start()
  }, [aberto, lenis, pronto])

  const irPara = (e, href) => {
    e.preventDefault()
    setAberto(false)
    if (lenis) lenis.scrollTo(href, { duration: 1.6, offset: 0 })
    else document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <header ref={raiz} className={`header tema-${aberto ? 'dark' : tema}`}>
        <a href="#inicio" className="header-logo" onClick={(e) => irPara(e, '#inicio')} aria-label={site.nome}>
          {/* Troque por <img src="/logo.svg" alt="" /> quando o logo chegar */}
          <span className="logo-provisorio">JK<em>{site.numero}</em></span>
        </a>

        <nav className="header-links" aria-label="Atalhos">
          <a href="#pista" onClick={(e) => irPara(e, '#pista')}>A pista</a>
          <a href="#alem" onClick={(e) => irPara(e, '#alem')}>Além da pista</a>
          <a href="#patrocinio" onClick={(e) => irPara(e, '#patrocinio')}>Patrocínio</a>
          <a href="#contato" onClick={(e) => irPara(e, '#contato')}>Contato</a>
        </nav>

        <button
          type="button"
          className={`header-menu ${aberto ? 'is-aberto' : ''}`}
          onClick={() => setAberto((v) => !v)}
          aria-expanded={aberto}
          aria-controls="menu"
          data-cursor="menu"
        >
          <span className="header-menu-texto">{aberto ? 'Fechar' : 'Menu'}</span>
          <span className="header-menu-icone" aria-hidden="true"><i /><i /></span>
        </button>
      </header>
      <Menu aberto={aberto} irPara={irPara} />
    </>
  )
}
