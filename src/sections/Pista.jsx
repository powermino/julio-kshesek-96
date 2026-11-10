import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import Foto from '../components/Foto'

gsap.registerPlugin(ScrollTrigger, SplitText)

/** Fotos reais do caminhão #96. Legendas descrevem só o que a imagem mostra. */
const CENAS = [
  { src: '/img/caminhao/caminhao-frente-96', n: '01', t: 'Na curva', d: 'O #96 de frente, contornando a curva.', alt: 'Caminhão azul e laranja número 96 em curva, visto de frente' },
  { src: '/img/caminhao/caminhao-corrida-96', n: '02', t: 'Disputa', d: 'Lado a lado com outro competidor.', alt: 'Caminhão 96 disputando posição com outro caminhão na pista' },
  { src: '/img/caminhao/caminhao-traseira-96', n: '03', t: 'Pela traseira', d: 'A saída de curva vista de trás.', alt: 'Caminhão 96 visto pela traseira na pista' },
  { src: '/img/caminhao/caminhao-lateral-96', n: '04', t: 'Em movimento', d: 'O perfil do #96 em velocidade.', alt: 'Caminhão 96 em movimento, vista lateral' },
  { src: '/img/bastidores/julio-caminhao-box-cascavel', n: '05', t: 'Nos boxes', d: 'Box 01 · Cascavel.', alt: 'Caminhão 96 estacionado no box 01 de Cascavel', vertical: true },
]

export default function Pista() {
  const raiz = useRef(null)

  useEffect(() => {
    const reduzir = matchMedia('(prefers-reduced-motion: reduce)').matches
    const sec = raiz.current
    if (reduzir) { sec.classList.add('sem-movimento'); return }

    const c = gsap.context(() => {
      // frase: palavras acendem com a rolagem
      const s = new SplitText('.pista-frase', { type: 'words', wordsClass: 'palavra' })
      gsap.fromTo(s.words, { opacity: 0.16 }, {
        opacity: 1, stagger: 0.1, ease: 'none',
        scrollTrigger: { trigger: '.pista-frase', start: 'top 85%', end: 'bottom 55%', scrub: true },
      })
      gsap.from('.pista-titulo .linha-interna', {
        yPercent: 110, duration: 1.3, ease: 'expo.out', stagger: 0.08,
        scrollTrigger: { trigger: '.pista-titulo', start: 'top 80%' },
      })

      // galeria horizontal ligada à rolagem vertical
      const galeria = sec.querySelector('.galeria')
      const trilho = sec.querySelector('.galeria-trilho')
      const barra = sec.querySelector('.galeria-barra i')
      const contador = sec.querySelector('.galeria-contador b')
      const itens = gsap.utils.toArray('.galeria-item', sec)
      const distancia = () => Math.max(0, trilho.scrollWidth - window.innerWidth)

      const viagem = gsap.to(trilho, {
        x: () => -distancia(),
        ease: 'none',
        scrollTrigger: {
          trigger: galeria,
          start: 'top top',
          end: () => '+=' + distancia(),
          pin: true,
          scrub: 0.8,
          invalidateOnRefresh: true,
          onUpdate: (st) => {
            gsap.set(barra, { scaleX: st.progress })
            contador.textContent = String(Math.min(itens.length, Math.floor(st.progress * itens.length) + 1)).padStart(2, '0')
          },
        },
      })

      // profundidade: cada foto cresce ao chegar ao centro e recua ao sair; zoom interno lento
      itens.forEach((it) => {
        const st = { trigger: it, containerAnimation: viagem, start: 'left right', end: 'right left', scrub: true }
        gsap.timeline({ scrollTrigger: st })
          .fromTo(it, { scale: 0.86, autoAlpha: 0.55 }, { scale: 1, autoAlpha: 1, ease: 'power1.out', duration: 1 })
          .to(it, { scale: 0.9, autoAlpha: 0.6, ease: 'power1.in', duration: 1 })
        gsap.fromTo(it.querySelector('img'), { scale: 1.22, xPercent: -5 }, { scale: 1.02, xPercent: 5, ease: 'none', scrollTrigger: st })
        gsap.from(it.querySelectorAll('figcaption > *'), {
          y: 24, autoAlpha: 0, duration: 0.9, ease: 'expo.out', stagger: 0.07,
          scrollTrigger: { trigger: it, containerAnimation: viagem, start: 'left 65%', toggleActions: 'play none none reverse' },
        })
      })
    }, sec)
    return () => c.revert()
  }, [])

  return (
    <section id="pista" className="pista" data-theme="dark" ref={raiz}>
      <div className="container pista-topo">
        <p className="rotulo">03 · A pista</p>
        <h2 className="titulo-grande pista-titulo">
          <span className="linha-mascara"><span className="linha-interna">A pista é o</span></span>
          <span className="linha-mascara"><span className="linha-interna">nosso território.</span></span>
        </h2>
        <p className="pista-frase">Cada curva é um desafio. Cada volta, uma nova oportunidade.</p>
      </div>

      <div className="galeria" data-cursor="arrastar">
        <div className="galeria-trilho">
          {CENAS.map((c) => (
            <figure className={`galeria-item ${c.vertical ? 'is-vertical' : ''}`} key={c.n}>
              <div className="galeria-midia">
                <Foto src={c.src} alt={c.alt} sizes={c.vertical ? '(max-width: 899px) 70vw, 34vw' : '(max-width: 899px) 88vw, 64vw'} />
              </div>
              <figcaption>
                <span className="galeria-n">{c.n}</span>
                <span className="galeria-t">{c.t}</span>
                <span className="galeria-d">{c.d}</span>
              </figcaption>
            </figure>
          ))}
        </div>
        <div className="galeria-ui container" aria-hidden="true">
          <span className="galeria-contador"><b>01</b> / {String(CENAS.length).padStart(2, '0')}</span>
          <span className="galeria-barra"><i /></span>
          <span>Caminhão #96 · Fórmula Truck</span>
        </div>
      </div>
    </section>
  )
}
