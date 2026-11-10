import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Foto from '../components/Foto'

gsap.registerPlugin(ScrollTrigger)

/**
 * Bastidores reais. As legendas descrevem apenas o que a foto mostra —
 * sem nomes, parentescos, resultados ou histórias não confirmados.
 * `l` = classe de posição no mosaico (ver .m-01 … .m-11 no CSS); `v` = velocidade do parallax.
 */
const FOTOS = [
  { src: '/img/bastidores/julio-celebracao-caminhao', t: 'Comemoração', d: 'Braços erguidos sobre o caminhão.', l: 'm-01', v: 6 },
  { src: '/img/bastidores/julio-podio-trofeu', t: 'Pódio', d: 'Troféu nas mãos.', l: 'm-02 is-vertical', v: 12 },
  { src: '/img/bastidores/julio-criancas-fas', t: 'Pequenos fãs', d: 'Encontro com as crianças em frente ao #96.', l: 'm-03', v: 4 },
  { src: '/img/bastidores/julio-momento-familia', t: 'Afeto nos boxes', d: 'Um momento com quem está perto.', l: 'm-04 is-vertical', v: 10 },
  { src: '/img/bastidores/julio-relacionamento-equipe', t: 'Equipe', d: 'Conversa e risadas entre uma etapa e outra.', l: 'm-05', v: 7 },
  { src: '/img/bastidores/julio-encontro-pilotos', t: 'Entre pilotos', d: 'Encontro no paddock.', l: 'm-06', v: 5 },
  { src: '/img/bastidores/julio-piloto-paddock', t: 'Paddock', d: 'Ao lado do caminhão, pronto para a pista.', l: 'm-07 is-vertical', v: 11 },
  { src: '/img/bastidores/julio-parceiros-formula-truck', t: 'Parceiros', d: 'Diante do #96, já de capacete.', l: 'm-08', v: 4 },
  { src: '/img/bastidores/julio-comunicacao-boxes', t: 'Concentração', d: 'Rádio e comunicação nos boxes.', l: 'm-09', v: 8 },
  { src: '/img/bastidores/julio-convidados-evento', t: 'Convidados', d: 'Recebendo pessoas no espaço do evento.', l: 'm-10', v: 6 },
  { src: '/img/bastidores/julio-visao-cockpit', t: 'Cockpit', d: 'A visão de quem está ao volante.', l: 'm-11 is-vertical', v: 12 },
]

export default function AlemDaPista() {
  const raiz = useRef(null)

  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const c = gsap.context(() => {
      gsap.from('.alem-titulo .linha-interna', {
        yPercent: 110, duration: 1.3, ease: 'expo.out', stagger: 0.08,
        scrollTrigger: { trigger: '.alem-titulo', start: 'top 80%' },
      })
      gsap.utils.toArray('.mosaico-item').forEach((it) => {
        const v = parseFloat(it.dataset.v || 6)
        // entrada: a foto se abre de baixo para cima
        gsap.fromTo(it, { clipPath: 'inset(100% 0% 0% 0%)', y: 60 }, {
          clipPath: 'inset(0% 0% 0% 0%)', y: 0, duration: 1.3, ease: 'expo.out',
          scrollTrigger: { trigger: it, start: 'top 88%', toggleActions: 'play none none reverse' },
        })
        // parallax: cada foto em uma velocidade
        gsap.fromTo(it.querySelector('img'), { yPercent: -v }, {
          yPercent: v, ease: 'none',
          scrollTrigger: { trigger: it, start: 'top bottom', end: 'bottom top', scrub: true },
        })
      })
    }, raiz)
    return () => c.revert()
  }, [])

  return (
    <section id="alem" className="alem" data-theme="dark" ref={raiz}>
      <div className="container alem-topo">
        <p className="rotulo">05 · Além da pista</p>
        <h2 className="titulo-grande alem-titulo">
          <span className="linha-mascara"><span className="linha-interna">Além</span></span>
          <span className="linha-mascara"><span className="linha-interna">da pista.</span></span>
        </h2>
      </div>
      <div className="container mosaico">
        {FOTOS.map((f) => (
          <figure className={`mosaico-item ${f.l}`} data-v={f.v} key={f.src}>
            <Foto src={f.src} alt={`${f.t}: ${f.d}`} sizes={f.l.includes('vertical') ? '(max-width: 899px) 50vw, 26vw' : '(max-width: 899px) 100vw, 50vw'} />
            <figcaption>
              <b>{f.t}</b>
              <span>{f.d}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}
