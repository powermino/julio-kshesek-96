import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Foto from '../components/Foto'
import Topografia from '../components/Topografia'

gsap.registerPlugin(ScrollTrigger)

/**
 * "Mais que um piloto" — seção clara com as duas versões do Júlio em lados opostos
 * (foto real "Duelo entre piloto e capacete", dividida em duas metades) e, abaixo,
 * as fotos "pose triunfante" (capacete e macacão) e "retrato com o capacete".
 * Imagens em /public/fotos-julio-premium (originais preservados; WebP em /public/img/premium).
 */
export default function Historia() {
  const raiz = useRef(null)

  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const c = gsap.context(() => {
      gsap.from('.historia-titulo .linha-interna', {
        yPercent: 110, duration: 1.4, ease: 'expo.out', stagger: 0.1,
        scrollTrigger: { trigger: '.historia-titulo', start: 'top 82%' },
      })
      gsap.fromTo('.historia .topografia', { yPercent: -4 }, {
        yPercent: 4, ease: 'none',
        scrollTrigger: { trigger: raiz.current, start: 'top bottom', end: 'bottom top', scrub: true },
      })

      // Duelo: as duas metades entram por máscaras opostas e se afastam com a rolagem
      const duelo = { trigger: '.duelo', start: 'top 85%', end: 'bottom 30%', scrub: 1 }
      const mm = gsap.matchMedia()
      mm.add('(min-width: 900px)', () => {
        gsap.timeline({ scrollTrigger: duelo })
          .fromTo('.duelo-lado--a', { clipPath: 'inset(0% 100% 0% 0%)', xPercent: 10 }, { clipPath: 'inset(0% 0% 0% 0%)', xPercent: -4, ease: 'power2.out' }, 0)
          .fromTo('.duelo-lado--b', { clipPath: 'inset(0% 0% 0% 100%)', xPercent: -10 }, { clipPath: 'inset(0% 0% 0% 0%)', xPercent: 4, ease: 'power2.out' }, 0)
          .fromTo('.duelo-lado img', { scale: 1.18 }, { scale: 1, ease: 'none' }, 0)
          .fromTo('.duelo-centro', { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, ease: 'power2.out', duration: 0.5 }, 0.35)
      })
      mm.add('(max-width: 899px)', () => {
        gsap.utils.toArray('.duelo-lado').forEach((el, i) => {
          gsap.fromTo(el, { clipPath: i ? 'inset(0% 0% 0% 100%)' : 'inset(0% 100% 0% 0%)' }, {
            clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.out',
            scrollTrigger: { trigger: el, start: 'top 85%' },
          })
        })
        gsap.from('.duelo-centro', { autoAlpha: 0, y: 30, duration: 1, scrollTrigger: { trigger: '.duelo-centro', start: 'top 85%' } })
      })

      // Atleta × pessoa: revelação por máscara + parallax interno em profundidades diferentes
      gsap.utils.toArray('.historia-quadro').forEach((q, i) => {
        gsap.fromTo(q, { clipPath: 'inset(18% 10% 18% 10% round 1.5rem)' }, {
          clipPath: 'inset(0% 0% 0% 0% round 1.5rem)', ease: 'power2.out',
          scrollTrigger: { trigger: q, start: 'top 90%', end: 'top 35%', scrub: 1 },
        })
        gsap.fromTo(q.querySelector('img'), { yPercent: -8, scale: 1.15 }, {
          yPercent: 8, scale: 1.04, ease: 'none',
          scrollTrigger: { trigger: q, start: 'top bottom', end: 'bottom top', scrub: true },
        })
        gsap.fromTo(q, { y: i ? 120 : 40 }, {
          y: i ? -60 : -20, ease: 'none',
          scrollTrigger: { trigger: '.historia-quadros', start: 'top bottom', end: 'bottom top', scrub: true },
        })
      })
      gsap.from('.historia-legenda', {
        y: 24, autoAlpha: 0, duration: 1, ease: 'expo.out', stagger: 0.12,
        scrollTrigger: { trigger: '.historia-quadros', start: 'top 65%' },
      })
    }, raiz)
    return () => c.revert()
  }, [])

  return (
    <section id="historia" className="historia" data-theme="light" ref={raiz}>
      <div className="historia-topo-fundo" aria-hidden="true"><Topografia /></div>

      <div className="container historia-cabeca">
        <p className="rotulo">07 · O piloto</p>
        <h2 className="historia-titulo">
          <span className="linha-mascara"><span className="linha-interna">Mais que um piloto.</span></span>
          <span className="linha-mascara"><span className="linha-interna historia-titulo-serif">Uma história que acelera.</span></span>
        </h2>
      </div>

      <div className="duelo">
        <figure className="duelo-lado duelo-lado--a">
          <Foto src="/img/premium/duelo-capacete" alt="Júlio Kshesek de capacete e macacão de corrida, de perfil" sizes="(max-width: 899px) 100vw, 46vw" />
          <figcaption>Dentro das pistas</figcaption>
        </figure>
        <div className="duelo-centro">
          <span className="duelo-n">#96</span>
          <p>Determinação dentro das pistas. Conexões que vão muito além delas.</p>
        </div>
        <figure className="duelo-lado duelo-lado--b">
          <Foto src="/img/premium/duelo-bone" alt="Júlio Kshesek de boné, em visual casual, de perfil" sizes="(max-width: 899px) 100vw, 46vw" />
          <figcaption>Fora delas</figcaption>
        </figure>
      </div>

      <div className="container historia-quadros">
        <figure className="historia-item historia-item--a">
          <div className="historia-quadro">
            <Foto src="/img/premium/pose-capacete" alt="Júlio Kshesek de capacete e macacão, com o punho erguido" sizes="(max-width: 899px) 100vw, 60vw" />
          </div>
          <figcaption className="historia-legenda"><b>O atleta</b><span>Capacete, macacão e punho erguido.</span></figcaption>
        </figure>
        <figure className="historia-item historia-item--b">
          <div className="historia-quadro">
            <Foto src="/img/premium/retrato-capacete" alt="Júlio Kshesek de boné ao lado do seu capacete" sizes="(max-width: 899px) 100vw, 44vw" />
          </div>
          <figcaption className="historia-legenda"><b>O atleta e a pessoa</b><span>Lado a lado com o capacete.</span></figcaption>
        </figure>
      </div>
    </section>
  )
}
