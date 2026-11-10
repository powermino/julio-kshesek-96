import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Foto from '../components/Foto'
import { site } from '../config/site'

gsap.registerPlugin(ScrollTrigger)

const ir = (href, assunto) => {
  if (assunto) window.dispatchEvent(new CustomEvent('site:assunto', { detail: assunto }))
  window.dispatchEvent(new CustomEvent('site:ir', { detail: href }))
}

/* Ícones minimalistas de traço (24×24), desenhados no hover. */
const ICONES = {
  exposicao: 'M3 7h11v9H3zM14 10h4l3 3v3h-7M6.5 19a1.5 1.5 0 1 0 0-.01M17.5 19a1.5 1.5 0 1 0 0-.01',
  midia: 'M3 5h18v12H3zM8 21h8M10 9l5 2-5 2z',
  conteudo: 'M4 8h3l2-3h6l2 3h3v11H4zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  experiencias: 'M4 8a2 2 0 0 0 0 4v4h16v-4a2 2 0 0 0 0-4V4H4zM12 4v16',
  conexao: 'M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM16 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM2 20c0-3 3-5 6-5s6 2 6 5M14 15.5c.6-.3 1.3-.5 2-.5 3 0 6 2 6 5',
  posicionamento: 'M8 4h8v5a4 4 0 0 1-8 0zM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8 20h8',
  digital: 'M7 2h10v20H7zM11 18h2M10 9l4 2-4 2z',
  relacionamento: 'M2 12l4-4 4 2 3-2 4 1 5 4M6 8v6l4 4 2-1 2 2 2-1 2 1 2-3M10 18l-2-2M13 17l-2-2',
}

const BENEFICIOS = [
  { i: 'exposicao', t: 'Exposição de marca', d: 'Possibilidade de aplicação de marca no caminhão, macacão, materiais visuais e conteúdos oficiais do piloto, conforme a cota contratada.' },
  { i: 'digital', t: 'Presença digital', d: 'Conteúdos no Instagram, vídeos, bastidores e ações promocionais com a marca parceira.' },
  { i: 'experiencias', t: 'Experiências exclusivas', d: 'Possibilidade de ações nos boxes, relacionamento com convidados e experiências de marca durante eventos, conforme disponibilidade e autorização.' },
  { i: 'conexao', t: 'Conexão com o público', d: 'Associação ao automobilismo, à superação, à tecnologia e à paixão pelas pistas.' },
  { i: 'conteudo', t: 'Conteúdo audiovisual', d: 'Possibilidade de produção de fotos, vídeos, reels e materiais comerciais com o piloto.' },
  { i: 'relacionamento', t: 'Relacionamento comercial', d: 'Oportunidades de ativações, networking e fortalecimento da presença institucional.' },
]

/* Áreas do caminhão (posição em % sobre a foto lateral). Possibilidades — não indicam disponibilidade. */
const AREAS = [
  { id: 'defletor', x: 58, y: 23, t: 'Defletor superior', d: 'Topo da cabine: área alta, presente nas fotos de frente e de perfil.' },
  { id: 'cabine', x: 49, y: 38, t: 'Lateral da cabine', d: 'Painel atrás da porta, junto ao número 96.' },
  { id: 'porta', x: 67, y: 48, t: 'Porta do piloto', d: 'Centro da lateral, destaque nas imagens de perfil.' },
  { id: 'saia', x: 51, y: 72, t: 'Saia lateral', d: 'Faixa longa entre os eixos, com boa leitura em movimento.' },
  { id: 'traseira', x: 12, y: 74, t: 'Para-lamas traseiros', d: 'Aparecem nas fotos de traseira e nas disputas lado a lado.' },
  { id: 'frente', x: 84, y: 70, t: 'Spoiler dianteiro', d: 'Parte baixa da frente, visível nas fotos de curva.' },
]

const PALAVRAS = ['Velocidade', 'Visibilidade', 'Conexão', 'Performance', 'Parcerias']

export default function Patrocinio() {
  const raiz = useRef(null)
  const [area, setArea] = useState(AREAS[0].id)
  const atual = AREAS.find((a) => a.id === area)

  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const c = gsap.context(() => {

      // abertura: foto de fundo aproxima, fotos laterais em velocidades diferentes
      const ab = { trigger: '.patro-abertura', start: 'top bottom', end: 'bottom top', scrub: true }
      gsap.fromTo('.patro-fundo img', { scale: 1.25, yPercent: -6 }, { scale: 1.02, yPercent: 6, ease: 'none', scrollTrigger: ab })
      gsap.fromTo('.patro-flutua--1', { yPercent: 40 }, { yPercent: -50, ease: 'none', scrollTrigger: ab })
      gsap.fromTo('.patro-flutua--2', { yPercent: 70 }, { yPercent: -30, ease: 'none', scrollTrigger: ab })
      gsap.from('.patro-titulo .linha-interna', {
        yPercent: 110, duration: 1.4, ease: 'expo.out', stagger: 0.1,
        scrollTrigger: { trigger: '.patro-titulo', start: 'top 80%' },
      })
      gsap.from('.patro-sub, .patro-abertura .botao', {
        y: 30, autoAlpha: 0, duration: 1.1, ease: 'expo.out', stagger: 0.1,
        scrollTrigger: { trigger: '.patro-titulo', start: 'top 70%' },
      })
      // cartões entram em cascata
      gsap.from('.beneficio', {
        y: 70, autoAlpha: 0, duration: 1.1, ease: 'expo.out', stagger: { each: 0.08, grid: 'auto' },
        scrollTrigger: { trigger: '.beneficios', start: 'top 80%' },
      })
      gsap.fromTo('.hotspot', { scale: 0 }, {
        scale: 1, duration: 0.8, ease: 'back.out(2)', stagger: 0.07, clearProps: 'transform,scale',
        scrollTrigger: { trigger: '.caminhao-mapa', start: 'top 70%' },
      })
      gsap.from('.beneficios-acao', {
        y: 30, autoAlpha: 0, duration: 1, ease: 'expo.out',
        scrollTrigger: { trigger: '.beneficios-acao', start: 'top 92%' },
      })

      // faixa animada
      const trilhos = gsap.utils.toArray('.faixa-palavras-trilho')
      const tweens = trilhos.map((t, i) =>
        gsap.fromTo(t, { xPercent: i ? -50 : 0 }, { xPercent: i ? 0 : -50, ease: 'none', duration: 22, repeat: -1 })
      )
      let dir = 1, extra = 0
      ScrollTrigger.create({
        trigger: '.faixa-palavras', start: 'top bottom', end: 'bottom top',
        onUpdate: (s) => { dir = s.direction; extra = Math.min(Math.abs(s.getVelocity()) / 300, 5) },
      })
      const ticar = () => { extra *= 0.92; tweens.forEach((t) => t.timeScale(dir * (1 + extra))) }
      gsap.ticker.add(ticar)
      return () => gsap.ticker.remove(ticar)
    }, raiz)
    return () => c.revert()
  }, [])

  const linhaPalavras = PALAVRAS.map((p) => (
    <span className="faixa-palavra" key={p}>{p}<i aria-hidden="true">•</i></span>
  ))

  return (
    <section id="patrocinio" className="patrocinio" data-theme="dark" ref={raiz}>
      {/* ── Abertura cinematográfica ── */}
      <div className="patro-abertura">
        <div className="patro-fundo" aria-hidden="true">
          <Foto src="/img/caminhao/caminhao-corrida-96" alt="" sizes="100vw" />
        </div>
        <figure className="patro-flutua patro-flutua--1">
          <Foto src="/img/bastidores/julio-convidados-evento" alt="Convidados no espaço do evento" sizes="(max-width: 899px) 45vw, 24vw" />
        </figure>
        <figure className="patro-flutua patro-flutua--2">
          <Foto src="/img/bastidores/julio-comunicacao-boxes" alt="Comunicação por rádio nos boxes" sizes="(max-width: 899px) 45vw, 22vw" />
        </figure>
        <div className="container patro-conteudo">
          <p className="rotulo">08 · Patrocínio</p>
          <h2 className="patro-titulo">
            <span className="linha-mascara"><span className="linha-interna">Sua marca não</span></span>
            <span className="linha-mascara"><span className="linha-interna">assiste à corrida.</span></span>
            <span className="linha-mascara"><span className="linha-interna destaque">Ela faz parte dela.</span></span>
          </h2>
          <p className="patro-sub">
            Conecte sua empresa à emoção, à velocidade e à comunidade do automobilismo ao lado de {site.nome} #{site.numero}.
          </p>
          <a href="#contato" className="botao" onClick={(e) => { e.preventDefault(); ir('#contato', 'Patrocínio') }} data-cursor="link">
            Quero ser patrocinador <i aria-hidden="true">↗</i>
          </a>
        </div>
      </div>

      {/* ── Benefícios ── */}
      <div className="container">
        <div className="secao-topo secao-topo--linha">
          <p className="rotulo">O que o patrocínio pode incluir</p>
          <h3 className="titulo-medio">Sua marca na linha de frente.</h3>
        </div>
        <div className="beneficios">
          {BENEFICIOS.map((b, i) => (
            <article className="beneficio" key={b.t} tabIndex={0}>
              <div className="beneficio-topo">
                <svg className="beneficio-icone" viewBox="0 0 24 24" aria-hidden="true">
                  <path d={ICONES[b.i]} pathLength="1" />
                </svg>
                <span className="beneficio-n">{String(i + 1).padStart(2, '0')}</span>
              </div>
              <h4>{b.t}</h4>
              <p>{b.d}</p>
            </article>
          ))}
        </div>
        <div className="beneficios-acao">
          <a href="#contato" className="botao botao--grande" onClick={(e) => { e.preventDefault(); ir('#contato', 'Patrocínio') }} data-cursor="link">
            Quero patrocinar o Júlio <i aria-hidden="true">↗</i>
          </a>
          <p>Cotas, formatos e contrapartidas são definidos em proposta. Inserções na transmissão de TV não fazem parte das cotas sem confirmação contratual.</p>
        </div>
      </div>

      {/* ── Caminhão interativo ── */}
      <div className="container caminhao-bloco">
        <div className="secao-topo secao-topo--linha">
          <p className="rotulo">Áreas de exposição</p>
          <h3 className="titulo-medio">Onde a sua marca pode aparecer.</h3>
        </div>
        <div className="caminhao-grade">
          <div className="caminhao-mapa">
            <Foto src="/img/caminhao/caminhao-lateral-96" alt="Caminhão 96 em vista lateral, com pontos que indicam áreas possíveis de exposição" sizes="(max-width: 899px) 100vw, 62vw" />
            {AREAS.map((a, i) => (
              <button
                type="button"
                key={a.id}
                className={`hotspot ${area === a.id ? 'is-ativo' : ''}`}
                style={{ left: `${a.x}%`, top: `${a.y}%` }}
                onMouseEnter={() => setArea(a.id)}
                onFocus={() => setArea(a.id)}
                onClick={() => setArea(a.id)}
                aria-pressed={area === a.id}
                aria-label={a.t}
              >
                <span>{i + 1}</span>
              </button>
            ))}
          </div>
          <div className="caminhao-info" aria-live="polite">
            <span className="caminhao-info-n">{String(AREAS.indexOf(atual) + 1).padStart(2, '0')} / {String(AREAS.length).padStart(2, '0')}</span>
            <h4>{atual.t}</h4>
            <p>{atual.d}</p>
            <ul className="caminhao-lista">
              {AREAS.map((a, i) => (
                <li key={a.id}>
                  <button type="button" className={area === a.id ? 'is-ativo' : ''} onClick={() => setArea(a.id)}>
                    <span>{i + 1}</span>{a.t}
                  </button>
                </li>
              ))}
              <li className="caminhao-lista-extra">+ Macacão do piloto e materiais da equipe</li>
            </ul>
            <p className="caminhao-aviso">
              As áreas indicadas são possibilidades de aplicação. Disponibilidade, formatos e condições dependem de negociação e das
              regras da categoria. As marcas que aparecem hoje no caminhão pertencem aos apoiadores atuais.
            </p>
          </div>
        </div>
      </div>

      {/* ── Faixa animada ── */}
      <div className="faixa-palavras" aria-label={PALAVRAS.join(' • ')}>
        {[0, 1].map((k) => (
          <div className={`faixa-palavras-linha ${k ? 'is-inversa' : ''}`} key={k} aria-hidden="true">
            <div className="faixa-palavras-trilho">{linhaPalavras}{linhaPalavras}</div>
          </div>
        ))}
      </div>

    </section>
  )
}
