import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Foto from '../components/Foto'
import Logo from '../components/Logo'
import Topografia from '../components/Topografia'
import { site } from '../config/site'
import { irPara, linkWhatsapp, sejaPatrocinador } from '../lib/acoes'

gsap.registerPlugin(ScrollTrigger)

/**
 * Encerramento cinematográfico: foto real do Júlio (capacete e macacão, fundo removido
 * do arquivo "pose triunfante") à frente de parte do texto gigante, e faixa de logos.
 */
export default function Encerramento() {
  const raiz = useRef(null)
  const wa = linkWhatsapp()

  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const c = gsap.context(() => {
      const cena = { trigger: '.fim-cena', start: 'top bottom', end: 'bottom top', scrub: true }
      gsap.fromTo('.fim-linha--1', { xPercent: 4, yPercent: 20 }, { xPercent: -4, yPercent: -10, ease: 'none', scrollTrigger: cena })
      gsap.fromTo('.fim-linha--2', { xPercent: -4, yPercent: 30 }, { xPercent: 4, yPercent: -10, ease: 'none', scrollTrigger: cena })
      gsap.fromTo('.fim-titulo', { scale: 1.06 }, { scale: 0.98, ease: 'none', scrollTrigger: cena })
      gsap.fromTo('.fim-piloto', { yPercent: 14, scale: 0.94 }, { yPercent: -4, scale: 1, ease: 'none', scrollTrigger: cena })
      gsap.fromTo('.fim .topografia', { yPercent: -6, scale: 1.08 }, { yPercent: 6, scale: 1, ease: 'none', scrollTrigger: cena })
      gsap.from('.fim-linha .linha-interna', {
        yPercent: 110, duration: 1.5, ease: 'expo.out', stagger: 0.12,
        scrollTrigger: { trigger: '.fim-cena', start: 'top 70%' },
      })
      gsap.from('.fim-piloto', {
        autoAlpha: 0, duration: 1.6, ease: 'power2.out',
        scrollTrigger: { trigger: '.fim-cena', start: 'top 70%' },
      })
      gsap.from('.fim-acoes > *', {
        y: 30, autoAlpha: 0, duration: 1.1, ease: 'expo.out', stagger: 0.1,
        scrollTrigger: { trigger: '.fim-acoes', start: 'top 90%' },
      })
    }, raiz)
    return () => c.revert()
  }, [])

  const faixa = site.parceiros.map((p) => (
    <li className="logos-item" key={p.nome}><Logo src={p.src} nome={p.nome} /></li>
  ))

  return (
    <section id="encerramento" className="fim" data-theme="dark" ref={raiz}>
      <div className="fim-fundo" aria-hidden="true"><Topografia /></div>

      <div className="fim-cena">
        {/* Slogan oficial atrás do piloto (parte do corpo sobrepõe as letras) */}
        <h2 className="fim-titulo" aria-label={site.slogan}>
          <span className="fim-linha fim-linha--1 linha-mascara" aria-hidden="true"><span className="linha-interna">A <em>coragem</em> acelera.</span></span>
          <span className="fim-linha fim-linha--2 linha-mascara" aria-hidden="true"><span className="linha-interna fim-split"><span>A <em>paixão</em> não</span> <span>tem limites.</span></span></span>
        </h2>
        <div className="fim-piloto">
          <Foto src="/img/premium/pose-recorte" alt="Júlio Kshesek de capacete e macacão, com o punho erguido" sizes="(max-width: 899px) 92vw, 46vw" />
        </div>
      </div>

      <div className="container fim-acoes">
        <h3 className="fim-chamada">A próxima conquista pode ter <em>sua marca.</em></h3>
        <p className="fim-texto">Sua marca pode fazer parte dessa história dentro e fora das pistas.</p>
        <div className="fim-botoes">
          <a className="botao botao--grande" href={wa || '#contato'} onClick={sejaPatrocinador}
            target={wa ? '_blank' : undefined} rel={wa ? 'noopener noreferrer' : undefined} data-cursor="link">
            Seja um patrocinador <i aria-hidden="true">↗</i>
          </a>
          <a className="botao botao--contorno botao--grande" href="#contato" data-cursor="link"
            onClick={(e) => { e.preventDefault(); irPara('#contato', 'Proposta comercial') }}>
            Receber proposta comercial <i aria-hidden="true">→</i>
          </a>
        </div>
      </div>

      {/* ── Logos ── */}
      <div className="logos">
        <div className="container logos-cabeca">
          <p className="rotulo">Parceiros do #96</p>
          <div className="logos-midia">
            {site.midia.map((m) => (
              <span className="logos-midia-item" key={m.nome}>
                <small>{m.papel}</small>
                <Logo src={m.src} nome={m.nome} />
              </span>
            ))}
          </div>
        </div>
        <div className="logos-faixa" aria-label={`Parceiros: ${site.parceiros.map((p) => p.nome).join(', ')}`}>
          <ul className="logos-trilho">{faixa}</ul>
          <ul className="logos-trilho" aria-hidden="true">{faixa}</ul>
        </div>
      </div>
    </section>
  )
}
