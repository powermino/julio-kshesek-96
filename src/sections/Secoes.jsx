/**
 * Seções do site. Marcação [ ] = conteúdo ainda provisório.
 * Galeria do caminhão: Pista.jsx · Bastidores: AlemDaPista.jsx · Comercial: Patrocinio.jsx
 */
import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { site } from '../config/site'
import FotoReal from '../components/Foto'

gsap.registerPlugin(ScrollTrigger, SplitText)
const reduzir = () => matchMedia('(prefers-reduced-motion: reduce)').matches

/* Foto provisória: troque por <img src="..." alt="..."> mantendo a classe. */
const Foto = ({ rotulo, className = '', n = 0 }) => (
  <div className={`placeholder-foto ${className}`} data-n={n}>
    <span>{rotulo}</span>
  </div>
)

/* ── Frase de impacto (tema escuro) ──────────────────────────────────── */
export function Frase() {
  const raiz = useRef(null)
  useEffect(() => {
    if (reduzir()) return
    const c = gsap.context(() => {
      const s = new SplitText('.frase-texto', { type: 'lines', mask: 'lines', linesClass: 'linha' })
      gsap.from(s.lines, {
        yPercent: 110, duration: 1.2, ease: 'expo.out', stagger: 0.09,
        scrollTrigger: { trigger: raiz.current, start: 'top 65%' },
      })
    }, raiz)
    return () => c.revert()
  }, [])
  return (
    <section className="frase" data-theme="dark" ref={raiz}>
      <div className="container">
        <p className="rotulo">04</p>
        <blockquote className="frase-texto">Por trás de cada corrida, existe uma história que vai muito além da velocidade.</blockquote>
      </div>
    </section>
  )
}

/* ── Na pista / Fora da pista ────────────────────────────────────────── */
export function PistaFora() {
  const raiz = useRef(null)
  useEffect(() => {
    if (reduzir()) return
    const c = gsap.context(() => {
      gsap.utils.toArray('.bloco').forEach((b) => {
        gsap.from(b.querySelector('.bloco-titulo'), {
          yPercent: 60, autoAlpha: 0, duration: 1.2, ease: 'expo.out',
          scrollTrigger: { trigger: b, start: 'top 75%' },
        })
        gsap.fromTo(b.querySelector('.bloco-midia img, .bloco-midia .placeholder-foto'), { yPercent: -8 }, {
          yPercent: 8, ease: 'none', scrollTrigger: { trigger: b, start: 'top bottom', end: 'bottom top', scrub: true },
        })
      })
    }, raiz)
    return () => c.revert()
  }, [])
  const blocos = [
    { alvo: '#pista', titulo: 'Na pista', texto: 'O caminhão #96, as curvas e as disputas da Fórmula Truck.', foto: '/img/caminhao/caminhao-corrida-96', alt: 'Caminhão 96 em disputa na pista' },
    { alvo: '#alem', titulo: 'Fora da pista', texto: 'Fãs, equipe, parceiros e os bastidores de cada etapa.', foto: '/img/bastidores/julio-criancas-fas', alt: 'Júlio com duas crianças em frente ao caminhão' },
  ]
  const ir = (e, href) => { e.preventDefault(); window.dispatchEvent(new CustomEvent('site:ir', { detail: href })) }
  return (
    <section className="pistafora" data-theme="dark" ref={raiz}>
      {blocos.map((b, i) => (
        <a key={b.alvo} href={b.alvo} onClick={(e) => ir(e, b.alvo)} className="bloco" data-cursor="ver">
          <div className="bloco-midia"><FotoReal src={b.foto} alt={b.alt} sizes="(max-width: 899px) 100vw, 50vw" /></div>
          <div className="bloco-texto">
            <span className="rotulo">0{i + 1}</span>
            <h2 className="bloco-titulo">{b.titulo}</h2>
            <p>{b.texto}</p>
            <span className="link-seta">Ver mais <i aria-hidden="true">↗</i></span>
          </div>
        </a>
      ))}
    </section>
  )
}

/* ── Contato ─────────────────────────────────────────────────────────── */
/**
 * Envio: usa SOMENTE os canais configurados em src/config/site.js → contato.
 *  - email preenchido  → envia pelo FormSubmit (gratuito; o 1º envio pede ativação no e-mail)
 *  - só whatsapp       → abre o WhatsApp com a mensagem montada
 *  - nenhum            → avisa que o canal ainda não foi configurado (nada é enviado)
 */
export function Contato() {
  const [assunto, setAssunto] = useState('Patrocínio')
  const [status, setStatus] = useState({ texto: '', tipo: '' })
  const [enviando, setEnviando] = useState(false)
  const nomeRef = useRef(null)

  // botões "Quero ser patrocinador" já chegam com o assunto escolhido
  useEffect(() => {
    const ouvir = (e) => {
      setAssunto(e.detail)
      setTimeout(() => nomeRef.current && nomeRef.current.focus({ preventScroll: true }), 1400)
    }
    window.addEventListener('site:assunto', ouvir)
    return () => window.removeEventListener('site:assunto', ouvir)
  }, [])

  const enviar = async (e) => {
    e.preventDefault()
    const form = e.currentTarget
    const dados = Object.fromEntries(new FormData(form))
    if (dados._honey) return // robô
    delete dados._honey
    const faltando = ['nome', 'email', 'mensagem'].filter((k) => !String(dados[k] || '').trim())
    if (faltando.length || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email)) {
      setStatus({ texto: 'Preencha nome, um e-mail válido e a mensagem.', tipo: 'erro' })
      return
    }
    const { email, whatsapp, mensagemWhatsapp } = site.contato
    if (email) {
      setEnviando(true)
      setStatus({ texto: 'Enviando…', tipo: '' })
      try {
        const r = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(email)}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ _subject: `${dados.assunto} · site ${site.nome} #${site.numero}`, _template: 'table', _captcha: 'false', ...dados }),
        })
        const j = await r.json().catch(() => ({}))
        if (!r.ok || String(j.success) === 'false') throw new Error(j.message || r.status)
        form.reset()
        setStatus({ texto: 'Mensagem enviada. A equipe do #96 vai responder em breve.', tipo: 'ok' })
      } catch {
        setStatus({ texto: 'Não foi possível enviar agora. Tente novamente em instantes.', tipo: 'erro' })
      } finally {
        setEnviando(false)
      }
      return
    }
    if (whatsapp) {
      const linhas = [mensagemWhatsapp, '', `Assunto: ${dados.assunto}`, `Nome: ${dados.nome}`]
      if (dados.empresa) linhas.push(`Empresa: ${dados.empresa}`)
      linhas.push(`E-mail: ${dados.email}`)
      if (dados.whatsapp) linhas.push(`WhatsApp: ${dados.whatsapp}`)
      linhas.push('', dados.mensagem)
      window.open(`https://wa.me/${whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(linhas.join('\n'))}`, '_blank', 'noopener')
      setStatus({ texto: 'Abrimos o WhatsApp com a sua mensagem pronta.', tipo: 'ok' })
      return
    }
    setStatus({ texto: 'O canal de envio ainda não foi configurado. Defina contato.email ou contato.whatsapp em src/config/site.js.', tipo: 'erro' })
  }

  return (
    <section id="contato" className="contato" data-theme="dark">
      <div className="container contato-grade">
        <div>
          <p className="rotulo">09 · Contato</p>
          <h2 className="titulo-grande">Patrocínio, imprensa e eventos</h2>
          <p className="contato-apoio">Conte um pouco sobre a sua empresa e o que você imagina. A equipe do #96 retorna com as possibilidades.</p>
        </div>
        <form className="form" onSubmit={enviar} noValidate>
          <div className="form-linha">
            <label className="campo"><span>Nome *</span><input ref={nomeRef} name="nome" required autoComplete="name" /></label>
            <label className="campo"><span>Empresa</span><input name="empresa" autoComplete="organization" /></label>
          </div>
          <div className="form-linha">
            <label className="campo"><span>E-mail *</span><input name="email" type="email" required autoComplete="email" /></label>
            <label className="campo"><span>WhatsApp</span><input name="whatsapp" type="tel" inputMode="tel" autoComplete="tel" placeholder="(DDD) 00000-0000" /></label>
          </div>
          <label className="campo"><span>Assunto</span>
            <select name="assunto" value={assunto} onChange={(e) => setAssunto(e.target.value)}>
              <option>Patrocínio</option><option>Proposta comercial</option><option>Imprensa</option><option>Eventos</option><option>Outro</option>
            </select>
          </label>
          <label className="campo"><span>Mensagem *</span><textarea name="mensagem" rows="4" required /></label>
          <input type="text" name="_honey" tabIndex={-1} autoComplete="off" className="form-mel" aria-hidden="true" />
          <button type="submit" className="botao" data-cursor="link" disabled={enviando}>Enviar mensagem <i aria-hidden="true">↗</i></button>
          <p className={`form-status ${status.tipo}`} role="status">{status.texto}</p>
        </form>
      </div>
    </section>
  )
}

/* ── Rodapé ──────────────────────────────────────────────────────────── */
export function Rodape() {
  const raiz = useRef(null)
  useEffect(() => {
    if (reduzir()) return
    const c = gsap.context(() => {
      gsap.from('.rodape-gigante span', {
        yPercent: 100, ease: 'expo.out', duration: 1.4, stagger: 0.04,
        scrollTrigger: { trigger: '.rodape-gigante', start: 'top 95%' },
      })
    }, raiz)
    return () => c.revert()
  }, [])
  return (
    <footer className="rodape" data-theme="green" ref={raiz}>
      <div className="container rodape-grade">
        <div>
          <p className="rotulo">Páginas</p>
          {site.menu.map((m) => <a key={m.href} href={m.href}>{m.rotulo}</a>)}
        </div>
        <div>
          <p className="rotulo">Redes</p>
          {site.redes.map((r) => <a key={r.nome} href={r.url} target={r.externo ? '_blank' : undefined} rel={r.externo ? 'noopener noreferrer' : undefined}>{r.nome}</a>)}
          <div className="rodape-sociais">
            <a href={site.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram oficial (abre em nova aba)" data-cursor="link">
              <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4.2" /><circle className="cheio" cx="17.4" cy="6.6" r="1.1" /></svg>
            </a>
            <a href={site.redes.find((r) => r.nome === 'WhatsApp').url} target="_blank" rel="noopener noreferrer" aria-label={`WhatsApp comercial ${site.contato.telefone} (abre em nova aba)`} data-cursor="link">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.2 19.8l1.1-3.9A8.5 8.5 0 1 1 8.4 19z" /><path className="fone" d="M9 8.2c.3-.6.6-.6.9-.6h.6c.2 0 .4.1.5.4l.7 1.7c.1.2 0 .4-.1.6l-.5.6c-.1.1-.1.3 0 .5.6 1 1.4 1.8 2.5 2.4.2.1.4.1.5-.1l.6-.7c.2-.2.4-.2.6-.1l1.6.8c.2.1.3.3.3.5 0 .5-.2 1.1-.7 1.4-.6.4-1.5.6-2.6.2-2.2-.8-4.1-2.6-5-4.8-.4-1.1-.2-2.1.1-2.6z" /></svg>
            </a>
          </div>
        </div>
        <div className="rodape-slogan">
          <p className="rotulo">#{site.numero}</p>
          <p>{site.slogan}</p>
        </div>
      </div>
      <div className="rodape-gigante" aria-hidden="true">
        {site.sobrenome.toUpperCase().split('').map((l, i) => <span key={i}>{l}</span>)}
      </div>
      <div className="container rodape-legal">
        <span>© {new Date().getFullYear()} {site.nome}</span>
        <span>{site.categoria}</span>
      </div>
    </footer>
  )
}
