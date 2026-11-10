import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { createReveal } from '../lib/revealEngine'
import { site } from '../config/site'
import Calibrador from '../components/Calibrador'
import Assinatura from '../components/Assinatura'
import Topografia from '../components/Topografia'

gsap.registerPlugin(ScrollTrigger, SplitText)
ScrollTrigger.config({ ignoreMobileResize: true })

const querCalibrar = typeof window !== 'undefined' && new URLSearchParams(location.search).has('calibrar')

const LINHA_SERIF = 'Júlio Kshesek'
const LINHA_SANS = 'A coragem de acelerar. A determinação de vencer.'

export default function Hero({ pronto }) {
  const raiz = useRef(null)
  const palco = useRef(null)
  const tela = useRef(null)
  const motor = useRef(null)
  const calib = useRef({ ativo: querCalibrar, opacidade: 0.5 })
  const [status, setStatus] = useState({ pronto: false, faltando: [] })
  const [travado, setTravado] = useState(false)
  const toque = typeof window !== 'undefined' && matchMedia('(hover: none), (pointer: coarse)').matches

  // motor de revelação (inalterado)
  useEffect(() => {
    motor.current = createReveal({
      canvas: tela.current,
      stage: palco.current,
      config: site.hero,
      calibrar: calib.current,
      onStatus: setStatus,
    })
    return () => motor.current.destroy()
  }, [])

  // entrada (depois do loader)
  useEffect(() => {
    if (!pronto || !status.pronto) return
    const reduzir = matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduzir) return // movimento reduzido: tudo já aparece no lugar, sem animação de entrada
    const c = gsap.context(() => {
      const linhas = gsap.utils.toArray('.hero-nome-linha')
      const splits = linhas.map((l) => new SplitText(l, { type: 'chars', charsClass: 'hero-char' }))
      const chars = splits.flatMap((s) => s.chars)

      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })
      tl.from('.hero-tela', { scale: 1.08, autoAlpha: 0, duration: 1.6, ease: 'power3.out' })
        .from(chars, { yPercent: 115, duration: 1.3, stagger: 0.035 }, 0.15)
        .from('.hero-num', { yPercent: 100, autoAlpha: 0, duration: 1.2 }, 0.45)
        .from('.hero-reveal-up', { y: 24, autoAlpha: 0, duration: 1, stagger: 0.08 }, 0.7)
      tl.call(() => motor.current.demonstrar(0), null, 0.9)
    }, raiz)
    return () => c.revert()
  }, [pronto, status.pronto])

  /* ── Transição cinematográfica: retrato → retrato editorial P&B + assinatura ── */
  useEffect(() => {
    if (!status.pronto) return
    const reduzir = matchMedia('(prefers-reduced-motion: reduce)').matches
    const sec = raiz.current
    const moldura = sec.querySelector('.hero-moldura')
    const escala = sec.querySelector('.hero-escala')

    // medidas recalculadas a cada refresh (resize / rotação)
    const m = { W: 0, H: 0, fx: 0, fy: 0, s: 1, top: 0, left: 0, fw: 0, fh: 0, raio: 0 }
    const medir = () => {
      m.W = sec.clientWidth
      m.H = sec.clientHeight
      const r = motor.current.rosto()
      m.fx = r.x
      m.fy = r.y
      const celular = m.W < 900 || m.W / m.H < 0.9
      // retrato editorial vertical (4:5), centralizado
      m.fh = celular ? Math.min(m.H * 0.5, (m.W * 0.78) / 0.8) : m.H * 0.72
      m.fw = m.fh * 0.8
      m.top = (m.H - m.fh) / 2
      m.left = (m.W - m.fw) / 2
      m.raio = celular ? 14 : 22
      // escala para o pé da foto coincidir com a base do retrato; rosto fica parado (origem no rosto)
      const base = m.top + m.fh
      m.s = gsap.utils.clamp(0.4, 0.86, (base - m.fy) / Math.max(1, m.H - m.fy))
      gsap.set(escala, { transformOrigin: `${m.fx}px ${m.fy}px` })
    }

    const aplicar = (v) => {
      const t = m.top * v
      const l = m.left * v
      const b = (m.H - m.top - m.fh) * v
      const rgt = (m.W - m.left - m.fw) * v
      moldura.style.clipPath = `inset(${t}px ${rgt}px ${b}px ${l}px round ${m.raio * v}px)`
      gsap.set(escala, { scale: 1 + (m.s - 1) * v })
    }

    let temaAtual = 'light'
    const avisarTema = (p) => {
      const tema = p > 0.16 ? 'dark' : 'light'
      if (tema === temaAtual) return
      temaAtual = tema
      sec.dataset.theme = tema
      window.dispatchEvent(new CustomEvent('site:tema', { detail: tema }))
    }

    const c = gsap.context(() => {
      const tracos = gsap.utils.toArray('.assinatura-traco')
      gsap.set(tracos, { strokeDasharray: 1, strokeDashoffset: 1 })
      medir()
      aplicar(0)

      const proxy = { v: 0 }

      if (reduzir) {
        // movimento reduzido: sem zoom nem deslocamento — troca direta para a composição final
        let final = null
        const estado = (v) => {
          if (v === final) return
          final = v
          aplicar(v ? 1 : 0)
          gsap.set(['.hero-ui', '.hero-nome'], { autoAlpha: v ? 0 : 1 })
          gsap.set('.hero-tela', { filter: v ? 'grayscale(1) contrast(1.08)' : 'none' })
          gsap.set(tracos, { strokeDashoffset: v ? 0 : 1 })
          gsap.set(['.cena-textos', '.assinatura'], { autoAlpha: v ? 1 : 0 })
          avisarTema(v ? 1 : 0)
        }
        gsap.set(['.cena-textos', '.assinatura'], { autoAlpha: 0 })
        ScrollTrigger.create({
          trigger: sec,
          start: 'top top',
          end: () => '+=' + Math.round(m.H * 1.2),
          pin: true,
          refreshPriority: 1,
          invalidateOnRefresh: true,
          onRefresh: (st) => { medir(); final = null; estado(st.progress > 0.04) },
          onUpdate: (st) => estado(st.progress > 0.04),
        })
        return
      }

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: sec,
          start: 'top top',
          end: () => '+=' + Math.round(m.H * (m.W < 900 ? 2.8 : 3.4)),
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          refreshPriority: 1, // a Hero é a primeira da página: calcula antes dos outros pins
          scrub: 1,
          invalidateOnRefresh: true,
          onRefreshInit: () => { aplicar(0) },
          onRefresh: () => { medir(); aplicar(proxy.v) },
          onUpdate: (st) => {
            avisarTema(st.progress)
            motor.current.liberarDemo(st.progress < 0.02) // sem demonstração automática no meio da transição
          },
        },
      })

      // 0 → 1,0 : interface e nome saem
      tl.to('.hero-ui', { autoAlpha: 0, y: -30, duration: 0.9 }, 0)
        .to('.hero-nome', { autoAlpha: 0, yPercent: -6, duration: 1.4 }, 0)
        // 0 → 4,6 : o MESMO retrato encolhe para o formato editorial, rosto parado
        .to(proxy, { v: 1, duration: 4.6, ease: 'power2.inOut', onUpdate: () => aplicar(proxy.v) }, 0)
        // 0,3 → 4,2 : perde a cor até o preto e branco
        .fromTo('.hero-tela', { filter: 'grayscale(0) contrast(1)' }, { filter: 'grayscale(1) contrast(1.08)', duration: 3.9, ease: 'power1.inOut' }, 0.3)
        // cenário: topografia respira, textos gigantes atravessam em velocidades diferentes
        .fromTo('.topografia', { scale: 1.18, rotate: -3 }, { scale: 1, rotate: 0, duration: 10 }, 0)
        .fromTo('.cena-textos', { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.6 }, 1.2)
        .fromTo('.cena-linha--serif', { xPercent: 4 }, { xPercent: -46, duration: 10 }, 0)
        .fromTo('.cena-linha--sans', { xPercent: -52 }, { xPercent: -14, duration: 10 }, 0)

      // 4,6 → 9,4 : assinatura desenhada traço a traço, na ordem da escrita
      const inicio = 4.6, total = 4.8
      const soma = tracos.reduce((a, t) => a + parseFloat(t.dataset.peso || 1), 0)
      let cursor = inicio
      tracos.forEach((t) => {
        const d = (parseFloat(t.dataset.peso || 1) / soma) * total
        tl.to(t, { strokeDashoffset: 0, duration: d, ease: 'power1.inOut' }, cursor)
        cursor += d * 0.92 // leve sobreposição: a mão não para entre traços
      })
      tl.fromTo('.assinatura', { scale: 1.04 }, { scale: 1, duration: total, ease: 'power2.out' }, inicio)
      // 9,4 → 10 : respiro antes de liberar a rolagem
      tl.to({}, { duration: 0.6 })
    }, sec)

    ScrollTrigger.refresh()
    return () => {
      c.revert()
      moldura.style.clipPath = ''
      sec.dataset.theme = 'light'
    }
  }, [status.pronto])

  const { proximaEtapa: pe } = site
  const repetir = (txt, n) => Array.from({ length: n }, (_, i) => <span key={i}>{txt}</span>)

  return (
    <section id="inicio" className="hero" data-theme="light" ref={raiz}>
      {/* 1 · cenário escuro com topografia */}
      <div className="cena" aria-hidden="true">
        <Topografia />
        {/* 2 · tipografia gigante em duas camadas */}
        <div className="cena-textos">
          <div className="cena-linha cena-linha--serif">{repetir(LINHA_SERIF, 3)}</div>
          <div className="cena-linha cena-linha--sans">{repetir(LINHA_SANS, 3)}</div>
        </div>
      </div>

      {/* 3 · o retrato (o mesmo da abertura, só muda de forma) */}
      <div className="hero-moldura">
        <div className="hero-escala">
          <h1 className="hero-nome" aria-label={`${site.nome} #${site.numero}`}>
            <span className="hero-nome-linha hero-nome-linha--1" aria-hidden="true">{site.primeiroNome}</span>
            <span className="hero-nome-linha hero-nome-linha--2" aria-hidden="true">{site.sobrenome}</span>
          </h1>
          <div
            ref={palco}
            className={`hero-palco ${travado ? 'is-travado' : ''}`}
            data-cursor="revelar"
            aria-label="Passe o cursor ou o dedo sobre o rosto para revelar o capacete"
          >
            <canvas ref={tela} className="hero-tela" />
          </div>
        </div>
      </div>

      <div className="hero-ui">
        <p className="hero-eyebrow hero-reveal-up">
          <span className="ponto" /> Piloto · {site.categoria}
        </p>

        <p className="hero-frase hero-reveal-up">{site.frase}</p>

        <div className="hero-num" aria-hidden="true">
          <span className="hero-num-hash">#</span>
          {site.numero}
        </div>

        <a href="#pista" className="hero-etapa hero-reveal-up" data-cursor="ver">
          <span className="hero-etapa-rotulo">{pe.rotulo}</span>
          <span className="hero-etapa-nome">{pe.etapa}</span>
          <span className="hero-etapa-meta">{pe.local}</span>
          <span className="hero-etapa-meta">{pe.data}</span>
          <span className="hero-etapa-seta" aria-hidden="true">↗</span>
        </a>

        <div className="hero-dica hero-reveal-up">
          {toque ? (
            <button type="button" className="pill" onClick={() => setTravado((v) => !v)}>
              {travado ? 'Voltar a rolar' : 'Toque para travar e arraste no rosto'}
            </button>
          ) : (
            <span className="pill pill--fantasma">Passe o mouse no rosto</span>
          )}
        </div>

        <div className="hero-rolar hero-reveal-up" aria-hidden="true">
          <span>Role</span>
          <i />
        </div>
      </div>

      {/* 4 · assinatura neon por cima de tudo */}
      <Assinatura />

      {status.faltando.length > 0 && (
        <p className="hero-aviso">
          Imagem provisória: falta {status.faltando.join(' e ')} em <code>/public</code>
        </p>
      )}

      {querCalibrar && <Calibrador alvo={site.hero.alinhamento} calib={calib.current} motor={motor} />}
    </section>
  )
}
