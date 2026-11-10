import { useEffect, useMemo, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Logo from '../components/Logo'
import { site } from '../config/site'

gsap.registerPlugin(ScrollTrigger)

const M = site.metricas
const reduzir = () => matchMedia('(prefers-reduced-motion: reduce)').matches

/* Formas ILUSTRATIVAS usadas só enquanto não houver série oficial (sem eixo numérico). */
const DEMO_CURVA = [0.18, 0.22, 0.2, 0.31, 0.36, 0.34, 0.47, 0.52, 0.6, 0.58, 0.72, 0.86]
const DEMO_CURVA_YT = [0.12, 0.2, 0.17, 0.28, 0.4, 0.37, 0.5, 0.63, 0.59, 0.74, 0.8, 0.92]
const DEMO_BARRAS = [0.62, 0.78, 0.7, 0.88, 0.95, 0.74, 0.84, 1]

const STATUS = {
  verificado: 'Dado verificado',
  estimativa: 'Estimativa não verificada',
  referencia: 'Referência',
  'em-atualizacao': 'Dados em atualização',
}

function Selo({ status }) {
  return <span className={`selo selo--${status}`}><i aria-hidden="true" />{STATUS[status]}</span>
}

const fmt = (v) => v.toLocaleString('pt-BR', { maximumFractionDigits: 1 })

/* ── Curva suave (Catmull-Rom → Bézier) ─────────────────────────────────── */
function caminho(pts) {
  let d = `M${pts[0][0]},${pts[0][1]}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6]
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]
    d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`
  }
  return d
}

/**
 * Gráfico de área/linha de telemetria. `serie` real → valores no tooltip;
 * `serie` null → curva ilustrativa (tooltip informa que o dado está em atualização).
 */
function GraficoCurva({ id, serie, demo, unidade = '' }) {
  const W = 600, H = 260, P = { t: 24, r: 16, b: 34, l: 16 }
  const real = Array.isArray(serie) && serie.length > 1
  const pontos = useMemo(() => {
    const vals = real ? serie.map((s) => s.valor) : demo
    const max = Math.max(...vals) || 1
    return vals.map((v, i) => [
      P.l + (i / (vals.length - 1)) * (W - P.l - P.r),
      H - P.b - (v / max) * (H - P.t - P.b) * 0.92,
    ])
  }, [serie, demo, real])
  const rotulos = real ? serie.map((s) => s.rotulo) : pontos.map((_, i) => `P${String(i + 1).padStart(2, '0')}`)
  const linha = caminho(pontos)
  const area = `${linha} L${pontos[pontos.length - 1][0]},${H - P.b} L${pontos[0][0]},${H - P.b} Z`
  const [foco, setFoco] = useState(null)
  const svg = useRef(null)

  const mover = (e) => {
    const r = svg.current.getBoundingClientRect()
    const x = ((e.clientX - r.left) / r.width) * W
    let melhor = 0
    pontos.forEach((p, i) => { if (Math.abs(p[0] - x) < Math.abs(pontos[melhor][0] - x)) melhor = i })
    setFoco(melhor)
  }
  const p = foco != null ? pontos[foco] : null

  return (
    <div className="grafico" data-grafico="curva">
      <svg ref={svg} viewBox={`0 0 ${W} ${H}`} className="grafico-svg" role="img"
        aria-label={real ? 'Gráfico de evolução' : 'Curva ilustrativa, sem dados oficiais'}
        onPointerMove={mover} onPointerDown={mover} onPointerLeave={() => setFoco(null)}>
        <defs>
          <linearGradient id={`g-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--neon)" stopOpacity="0.32" />
            <stop offset="1" stopColor="var(--neon)" stopOpacity="0" />
          </linearGradient>
          <clipPath id={`c-${id}`}><rect className="grafico-revela" x="0" y="0" width={W} height={H} /></clipPath>
          <filter id={`brilho-${id}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <line key={f} className="grafico-grade" x1={P.l} x2={W - P.r} y1={H - P.b - f * (H - P.t - P.b)} y2={H - P.b - f * (H - P.t - P.b)} />
        ))}
        <line className="grafico-base" x1={P.l} x2={W - P.r} y1={H - P.b} y2={H - P.b} />
        {pontos.map((pt, i) => (
          <line key={i} className="grafico-tique" x1={pt[0]} x2={pt[0]} y1={H - P.b} y2={H - P.b + 5} />
        ))}
        <g clipPath={`url(#c-${id})`}>
          <path d={area} fill={`url(#g-${id})`} />
        </g>
        <path className="grafico-linha" d={linha} pathLength="1" />
        <circle className="grafico-ponto-vivo" r="5" cx={pontos[0][0]} cy={pontos[0][1]} filter={`url(#brilho-${id})`} />
        {p && (
          <g className="grafico-foco">
            <line x1={p[0]} x2={p[0]} y1={P.t - 8} y2={H - P.b} />
            <circle cx={p[0]} cy={p[1]} r="6" />
          </g>
        )}
        <text className="grafico-eixo" x={P.l} y={H - 10}>{rotulos[0]}</text>
        <text className="grafico-eixo" x={W - P.r} y={H - 10} textAnchor="end">{rotulos[rotulos.length - 1]}</text>
      </svg>
      {p && (
        <div className="grafico-dica" style={{ left: `${(p[0] / W) * 100}%`, top: `${(p[1] / H) * 100}%` }}>
          <b>{rotulos[foco]}</b>
          <span>{real ? `${fmt(serie[foco].valor)}${unidade}` : 'Ilustrativo · dado em atualização'}</span>
        </div>
      )}
    </div>
  )
}

/** Barras por etapa (sem nomes de cidades). */
function GraficoBarras({ etapas, demo }) {
  const real = Array.isArray(etapas) && etapas.length > 0
  const vals = real ? etapas : demo
  const max = Math.max(...vals) || 1
  const [foco, setFoco] = useState(null)
  return (
    <div className="grafico grafico--barras" data-grafico="barras">
      <div className="barras" role="img" aria-label={real ? 'Público por etapa' : 'Barras ilustrativas de público por etapa'}>
        {vals.map((v, i) => (
          <button type="button" className={`barra ${foco === i ? 'is-foco' : ''}`} key={i}
            onPointerEnter={() => setFoco(i)} onPointerLeave={() => setFoco(null)} onFocus={() => setFoco(i)} onBlur={() => setFoco(null)}
            aria-label={`Etapa ${i + 1}: ${real ? `${fmt(v)} mil pessoas` : 'valor em validação'}`}>
            <span className="barra-coluna"><i style={{ height: `${(v / max) * 100}%` }} /></span>
            <span className="barra-rotulo">E{String(i + 1).padStart(2, '0')}</span>
            {foco === i && <span className="grafico-dica grafico-dica--barra"><b>Etapa {i + 1}</b><span>{real ? `${fmt(v)} mil` : 'Ilustrativo · em validação'}</span></span>}
          </button>
        ))}
      </div>
    </div>
  )
}

/** Sinal de TV: ondas de transmissão; mostra a audiência só quando houver relatório. */
function GraficoSinal({ audiencia }) {
  return (
    <div className="grafico grafico--sinal" data-grafico="sinal">
      <svg viewBox="0 0 600 260" className="grafico-svg" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((k) => (
          <path key={k} className="sinal-onda" pathLength="1" style={{ '--k': k }}
            d={`M${300 - k * 46},${210 - k * 4} A${k * 48},${k * 40} 0 0 1 ${300 + k * 46},${210 - k * 4}`} />
        ))}
        <circle className="sinal-centro" cx="300" cy="214" r="7" />
        <line className="grafico-base" x1="16" x2="584" y1="226" y2="226" />
      </svg>
      <p className="sinal-texto">{audiencia ? `${fmt(audiencia.valor)}${audiencia.sufixo || ''} · ${audiencia.rotulo}` : 'Dados em atualização'}</p>
    </div>
  )
}

function Contador({ valor, sufixo = '', prefixo = '' }) {
  return (
    <span className={`numero-valor ${String(Math.round(valor)).length > 4 ? 'numero-valor--longo' : ''}`}>
      {prefixo && <span className="numero-extra">{prefixo}</span>}
      <span className="contador-valor" data-valor={valor}>{fmt(valor)}</span>
      {sufixo && <span className="numero-extra">{sufixo}</span>}
    </span>
  )
}

/** Bloco "Conexões reais": dados do Meta Business Suite (Instagram + Facebook). */
function Digital() {
  const meta = M.meta
  const total = meta.plataformas.reduce((s, p) => s + p.visualizacoes, 0)
  return (
    <div className="digital">
      <div className="container digital-cabeca">
        <p className="rotulo">Impacto digital</p>
        <h3 className="digital-titulo">
          <span className="linha-mascara"><span className="linha-interna">Mais que velocidade.</span></span>
          <span className="linha-mascara"><span className="linha-interna"><em>Conexões reais.</em></span></span>
        </h3>
        <p className="digital-sub">Centenas de milhares de visualizações, milhares de interações e uma presença digital que aproxima marcas de pessoas.</p>
        <p className="digital-fonte"><Selo status={meta.status} /> Fonte: {meta.fonte} · Período: {meta.periodo}</p>
      </div>

      <div className="container digital-cards">
        {meta.totais.map((t, i) => (
          <article className={`digital-card ${i === 0 ? 'digital-card--total' : ''}`} key={t.chave}>
            <span className="digital-card-n">{String(i + 1).padStart(2, '0')}</span>
            <Contador valor={t.valor} sufixo={t.sufixo} />
            <h4>{t.rotulo}</h4>
            <p>{t.nota}</p>
          </article>
        ))}
      </div>

      <div className="container digital-plataformas">
        {meta.plataformas.map((p, i) => (
          <article className={`plataforma plataforma--${i ? 'secundaria' : 'principal'}`} key={p.nome}>
            <header>
              <Logo src={p.logo} nome={p.nome} className="plataforma-logo" />
              <span>{((p.visualizacoes / total) * 100).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}% das visualizações</span>
            </header>
            <Contador valor={p.visualizacoes} />
            <h4>visualizações no {p.nome}</h4>
            <div className="plataforma-barra" aria-hidden="true"><i style={{ width: `${(p.visualizacoes / total) * 100}%` }} /></div>
          </article>
        ))}
        <p className="digital-nota">
          Visualizações totais = Instagram + Facebook (valor arredondado pelo painel). Visualizadores, interações e cliques são indicadores
          distintos e não se somam às visualizações.
        </p>
      </div>
    </div>
  )
}

const Fonte = ({ texto }) => (texto ? <span className="painel-fonte">Fonte: {texto}</span> : null)

export default function Impacto() {
  const raiz = useRef(null)

  useEffect(() => {
    const r = reduzir()
    const c = gsap.context(() => {
      // contadores
      gsap.utils.toArray('.contador-valor').forEach((el) => {
        const fim = parseFloat(el.dataset.valor)
        if (r) return
        el.textContent = '0'
        const o = { v: 0 }
        gsap.to(o, {
          v: fim, duration: 2, ease: 'power3.out',
          onUpdate: () => { el.textContent = fmt(Number.isInteger(fim) ? Math.round(o.v) : Math.round(o.v * 10) / 10) },
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        })
      })
      if (r) return

      // ── logos: linhas desenhadas a partir do centro e placas em profundidades diferentes
      const tl = gsap.timeline({ scrollTrigger: { trigger: '.impacto-logos', start: 'top 75%' } })
      tl.from('.impacto-centro', { scale: 0.6, autoAlpha: 0, duration: 1.2, ease: 'expo.out' })
        .fromTo('.impacto-conexoes path', { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.2, ease: 'power2.inOut', stagger: 0.12 }, 0.2)
        .from('.impacto-placa', { y: 50, autoAlpha: 0, duration: 1, ease: 'expo.out', stagger: 0.12 }, 0.45)
      gsap.utils.toArray('.impacto-placa').forEach((pl, i) => {
        gsap.fromTo(pl, { yPercent: 18 + i * 12 }, {
          yPercent: -(18 + i * 12), ease: 'none',
          scrollTrigger: { trigger: '.impacto-logos', start: 'top bottom', end: 'bottom top', scrub: true },
        })
      })
      gsap.from('.impacto-titulo .linha-interna', {
        yPercent: 110, duration: 1.4, ease: 'expo.out', stagger: 0.1,
        scrollTrigger: { trigger: '.impacto-titulo', start: 'top 82%' },
      })

      // ── painéis de telemetria
      gsap.utils.toArray('.painel').forEach((pn) => {
        const t = gsap.timeline({ scrollTrigger: { trigger: pn, start: 'top 80%' } })
        t.from(pn, { y: 60, autoAlpha: 0, duration: 1, ease: 'expo.out' })
        const linha = pn.querySelector('.grafico-linha')
        if (linha) {
          const revela = pn.querySelector('.grafico-revela')
          const vivo = pn.querySelector('.grafico-ponto-vivo')
          const L = linha.getTotalLength()
          const o = { p: 0 }
          linha.style.strokeDashoffset = 1
          revela.setAttribute('width', 0)
          t.fromTo(o, { p: 0 }, {
            p: 1, duration: 2.2, ease: 'power2.inOut',
            onUpdate: () => {
              linha.style.strokeDashoffset = 1 - o.p
              revela.setAttribute('width', 600 * o.p)
              const pt = linha.getPointAtLength(L * o.p)
              vivo.setAttribute('cx', pt.x); vivo.setAttribute('cy', pt.y)
            },
          }, 0.2)
        }
        const barras = pn.querySelectorAll('.barra-coluna i')
        if (barras.length) t.from(barras, { scaleY: 0, duration: 1.2, ease: 'expo.out', stagger: 0.07 }, 0.25)
        const ondas = pn.querySelectorAll('.sinal-onda')
        if (ondas.length) t.fromTo(ondas, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.2, ease: 'power2.out', stagger: 0.12 }, 0.2)
      })

      // parallax suave: cada gráfico flutua em velocidade própria dentro do painel
      gsap.matchMedia().add('(min-width: 900px)', () => {
        gsap.utils.toArray('.painel .grafico').forEach((g, i) => {
          gsap.fromTo(g, { yPercent: 6 + (i % 2) * 4 }, {
            yPercent: -(6 + (i % 2) * 4), ease: 'none',
            scrollTrigger: { trigger: g, start: 'top bottom', end: 'bottom top', scrub: true },
          })
        })
      })

      // ── impacto digital (Meta)
      gsap.from('.digital-titulo .linha-interna', {
        yPercent: 110, duration: 1.4, ease: 'expo.out', stagger: 0.1,
        scrollTrigger: { trigger: '.digital-titulo', start: 'top 82%' },
      })
      gsap.from('.digital-card, .plataforma', {
        y: 70, autoAlpha: 0, duration: 1.1, ease: 'expo.out', stagger: 0.08,
        scrollTrigger: { trigger: '.digital-cards', start: 'top 82%' },
      })
      gsap.from('.plataforma-barra i', {
        scaleX: 0, duration: 1.8, ease: 'power3.inOut', stagger: 0.2,
        scrollTrigger: { trigger: '.digital-plataformas', start: 'top 80%' },
      })

      // ── números gigantes
      gsap.from('.numero', {
        y: 80, autoAlpha: 0, duration: 1.2, ease: 'expo.out', stagger: 0.1,
        scrollTrigger: { trigger: '.numeros', start: 'top 80%' },
      })
    }, raiz)
    return () => c.revert()
  }, [])

  const ig = M.instagram, pub = M.publico, yt = M.youtube, band = M.bandsports
  const [plaIg, plaYt, plaBand] = site.plataformas
  const ft = site.midia[0]

  return (
    <section id="impacto" className="impacto" data-theme="dark" ref={raiz}>
      {/* ── O impacto vai além das pistas ── */}
      <div className="container impacto-cabeca">
        <p className="rotulo">06 · Alcance e impacto</p>
        <h2 className="impacto-titulo">
          <span className="linha-mascara"><span className="linha-interna">O impacto vai</span></span>
          <span className="linha-mascara"><span className="linha-interna"><em>além das pistas.</em></span></span>
        </h2>
        <p className="impacto-sub">Uma plataforma de visibilidade, conexão e oportunidades para marcas que querem acelerar junto com o esporte.</p>
      </div>

      <div className="impacto-logos">
        <svg className="impacto-conexoes" viewBox="0 0 1000 560" preserveAspectRatio="none" aria-hidden="true">
          <path pathLength="1" d="M500 280 C 380 260, 300 170, 190 130" />
          <path pathLength="1" d="M500 280 C 620 260, 700 170, 810 130" />
          <path pathLength="1" d="M500 280 C 500 360, 520 420, 500 470" />
          <ellipse cx="500" cy="280" rx="300" ry="170" pathLength="1" />
          <ellipse cx="500" cy="280" rx="440" ry="250" pathLength="1" />
        </svg>
        <div className="impacto-centro">
          <span className="impacto-centro-rotulo">Campeonato</span>
          <Logo src={ft.src} nome={ft.nome} className="impacto-logo-ft" />
        </div>
        <div className="impacto-placa impacto-placa--ig"><Logo src={plaIg.src} nome={plaIg.nome} /><span>{plaIg.nome}</span></div>
        <div className="impacto-placa impacto-placa--yt"><Logo src={plaYt.src} nome={plaYt.nome} /><span>{plaYt.nome}</span></div>
        <div className="impacto-placa impacto-placa--band"><Logo src={plaBand.src} nome={plaBand.nome} /><span>Transmissão</span></div>
      </div>

      <Digital />

      {/* ── Telemetria (gráficos) ── */}
      <div className="container telemetria">
        <div className="telemetria-cabeca">
          <p className="rotulo">Telemetria de alcance</p>
          <p className="telemetria-aviso">
            Os gráficos mostram a evolução quando há dados oficiais. Onde aparece <b>“ilustrativo”</b>, a forma é demonstrativa e não
            representa resultado real — os números serão publicados assim que forem confirmados.
          </p>
        </div>
        <div className="paineis">
          <article className="painel painel--largo">
            <header className="painel-topo">
              <span className="painel-n">T-01</span>
              <Logo src={plaIg.src} nome="Instagram" className="painel-logo" />
              <Selo status={ig.status} />
            </header>
            <h3 className="painel-titulo">Conexão digital</h3>
            <p className="painel-destaque"><Contador valor={ig.visualizacoes.valor} /></p>
            <p className="painel-desc">Visualizações no Instagram · {M.meta.fonte}</p>
            <GraficoCurva id="ig" serie={ig.serie} demo={DEMO_CURVA} />
            <footer className="painel-rodape">{ig.serie ? <Fonte texto={ig.fonte} /> : <span>Total verificado · {M.meta.fonte} · {M.meta.periodo}. Curva ilustrativa: o painel não forneceu série temporal.</span>}</footer>
          </article>

          <article className="painel">
            <header className="painel-topo">
              <span className="painel-n">T-02</span>
              <span className="painel-icone" aria-hidden="true">
                <svg viewBox="0 0 24 24"><path d="M3 20h18M5 20V10l7-5 7 5v10M9 20v-6h6v6" /></svg>
              </span>
              <Selo status={pub.status} />
            </header>
            <h3 className="painel-titulo">A energia das arquibancadas</h3>
            <p className="painel-destaque"><Contador valor={pub.valor} sufixo={pub.sufixo} /></p>
            <p className="painel-desc">{pub.rotulo}</p>
            <GraficoBarras etapas={pub.etapas} demo={DEMO_BARRAS} />
            <footer className="painel-rodape">
              <span>{pub.nota}{!pub.etapas && ' Barras ilustrativas; valores por etapa em validação.'}</span>
            </footer>
          </article>

          <article className="painel">
            <header className="painel-topo">
              <span className="painel-n">T-03</span>
              <Logo src={plaYt.src} nome="YouTube" className="painel-logo painel-logo--yt" />
              <Selo status={yt.status} />
            </header>
            <h3 className="painel-titulo">Alcance que ultrapassa fronteiras</h3>
            {yt.visualizacoes && <p className="painel-destaque"><Contador valor={yt.visualizacoes.valor} prefixo={yt.visualizacoes.prefixo} sufixo={yt.visualizacoes.sufixo} /></p>}
            <p className="painel-desc">Alcance acumulado de referência do canal oficial da Fórmula Truck — não são visualizações exclusivas do piloto.</p>
            <GraficoCurva id="yt" serie={yt.serie} demo={DEMO_CURVA_YT} />
            <footer className="painel-rodape">{yt.serie ? <Fonte texto={yt.fonte} /> : <span>Fonte: {yt.fonte} · {yt.periodo}. Curva ilustrativa: sem série temporal.</span>}</footer>
          </article>

          <article className="painel painel--largo">
            <header className="painel-topo">
              <span className="painel-n">T-04</span>
              <Logo src={plaBand.src} nome="Band Sports" className="painel-logo" />
              <Selo status={band.status} />
            </header>
            <h3 className="painel-titulo">Visibilidade na televisão</h3>
            <p className="painel-desc">Audiência televisiva das transmissões da categoria.</p>
            <GraficoSinal audiencia={band.audiencia} />
            <footer className="painel-rodape">{band.audiencia ? <Fonte texto={band.fonte} /> : <span>Sem relatório oficial no momento · campo editável em site.js</span>}</footer>
          </article>
        </div>
      </div>

      {/* ── Números gigantes ── */}
      <div className="container numeros">
        <div className="numero">
          <span className="numero-rotulo">Meta · visualizações totais</span>
          <Contador valor={M.meta.totais[0].valor} sufixo={M.meta.totais[0].sufixo} />
          <span className="numero-nota"><Selo status={M.meta.status} /> Instagram + Facebook · Fonte: {M.meta.fonte} · {M.meta.periodo}</span>
        </div>
        <div className="numero numero--destaque">
          <span className="numero-rotulo">Público presencial · pessoas por etapa</span>
          <Contador valor={pub.valor} sufixo={pub.sufixo} />
          <span className="numero-nota"><Selo status={pub.status} /> {pub.nota}</span>
        </div>
        <div className="numero">
          <span className="numero-rotulo">YouTube · canal oficial da Fórmula Truck</span>
          {yt.visualizacoes ? <Contador {...yt.visualizacoes} /> : <span className="numero-valor numero-valor--pendente">Em atualização</span>}
          <span className="numero-nota"><Selo status={yt.status} /> {yt.visualizacoes ? `${yt.visualizacoes.rotulo} — não exclusivas do piloto.` : 'Exibido somente com número verificado.'}</span>
        </div>
        <div className="numero">
          <span className="numero-rotulo">Band Sports · audiência</span>
          {band.audiencia ? <Contador {...band.audiencia} /> : <span className="numero-valor numero-valor--pendente">Dados em atualização</span>}
          <span className="numero-nota">{band.audiencia ? band.audiencia.rotulo : 'Aguardando relatório oficial de audiência.'}</span>
        </div>
      </div>
    </section>
  )
}
