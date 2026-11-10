import { url } from './caminho'
/**
 * Motor de revelação por máscara suave (canvas 2D).
 *
 * Camadas:
 *  1. foto base (sem capacete)
 *  2. foto do topo (com capacete) recortada por uma máscara em tons de alfa
 *
 * A máscara é pintada com um "pincel" radial que segue o ponteiro (suavizado),
 * deixa um rastro e se dissolve sozinha com o tempo, como tinta evaporando.
 * As fotos têm o fundo de estúdio removido automaticamente (recortar), então
 * o canvas é transparente fora do piloto e o nome gigante fica atrás dele.
 */
import { gsap } from 'gsap'

const carregar = (src) =>
  new Promise((ok) => {
    const img = new Image()
    img.decoding = 'async'
    img.onload = () => ok(img)
    img.onerror = () => ok(null)
    img.src = src
  })

const primeiraQueExiste = async (lista) => {
  for (const src of lista) {
    const img = await carregar(src)
    if (img) return { img, src }
  }
  return null
}

/**
 * Recorta o piloto do fundo de estúdio: preenche a partir das bordas tudo o que
 * tem a cor do fundo e deixa só a silhueta (alfa com borda suavizada).
 * Assim o nome gigante passa de verdade ATRÁS do piloto.
 */
function recortar(img, tolerancia = 26) {
  const W = img.naturalWidth || img.width, H = img.naturalHeight || img.height
  // máscara calculada em meia resolução (rápido) e ampliada com suavização
  const f = Math.min(1, 1100 / H)
  const w = Math.round(W * f), h = Math.round(H * f)
  const pc = document.createElement('canvas')
  pc.width = w; pc.height = h
  const px = pc.getContext('2d', { willReadFrequently: true })
  px.drawImage(img, 0, 0, w, h)
  const dados = px.getImageData(0, 0, w, h)
  const d = dados.data

  // cor do fundo = média dos cantos superiores
  let r0 = 0, g0 = 0, b0 = 0, n = 0
  for (const [cx, cy] of [[2, 2], [w - 12, 2]]) {
    for (let y = cy; y < cy + 10; y++) for (let x = cx; x < cx + 10; x++) {
      const i = (y * w + x) * 4; r0 += d[i]; g0 += d[i + 1]; b0 += d[i + 2]; n++
    }
  }
  r0 /= n; g0 /= n; b0 /= n
  const tol2 = tolerancia * tolerancia
  const ehFundo = (i) => {
    const dr = d[i] - r0, dg = d[i + 1] - g0, db = d[i + 2] - b0
    return dr * dr + dg * dg + db * db < tol2
  }

  const fundo = new Uint8Array(w * h)
  const pilha = new Int32Array(w * h)
  let topo = 0
  const semear = (x, y) => {
    const k = y * w + x
    if (!fundo[k] && ehFundo(k * 4)) { fundo[k] = 1; pilha[topo++] = k }
  }
  for (let x = 0; x < w; x++) { semear(x, 0); semear(x, h - 1) }
  for (let y = 0; y < h; y++) { semear(0, y); semear(w - 1, y) }
  while (topo) {
    const k = pilha[--topo]
    const x = k % w, y = (k / w) | 0
    if (x > 0) semear(x - 1, y)
    if (x < w - 1) semear(x + 1, y)
    if (y > 0) semear(x, y - 1)
    if (y < h - 1) semear(x, y + 1)
  }

  // alfa: 0 no fundo, 255 no piloto; borda amaciada com 2 passadas de média 3x3
  let a = new Float32Array(w * h)
  for (let k = 0; k < a.length; k++) a[k] = fundo[k] ? 0 : 1
  for (let passada = 0; passada < 2; passada++) {
    const b = new Float32Array(w * h)
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      let s = 0, c = 0
      for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) {
        const xx = x + i, yy = y + j
        if (xx >= 0 && yy >= 0 && xx < w && yy < h) { s += a[yy * w + xx]; c++ }
      }
      b[y * w + x] = s / c
    }
    a = b
  }
  for (let k = 0; k < a.length; k++) {
    d[k * 4] = d[k * 4 + 1] = d[k * 4 + 2] = 0
    d[k * 4 + 3] = Math.round(a[k] * 255)
  }
  px.putImageData(dados, 0, 0)

  const c = document.createElement('canvas')
  c.width = W; c.height = H
  const x = c.getContext('2d')
  x.drawImage(img, 0, 0)
  x.globalCompositeOperation = 'destination-in'
  x.imageSmoothingQuality = 'high'
  x.drawImage(pc, 0, 0, W, H)
  x.globalCompositeOperation = 'source-over'
  return c
}

/** Silhueta provisória enquanto as fotos não chegam. */
function provisoria(comCapacete) {
  const c = document.createElement('canvas')
  c.width = 1856
  c.height = 2304
  const x = c.getContext('2d')
  x.fillStyle = '#fff'
  x.fillRect(0, 0, c.width, c.height)
  // tronco
  x.fillStyle = '#16181a'
  x.beginPath()
  x.moveTo(120, 2304)
  x.bezierCurveTo(140, 1500, 360, 1240, 928, 1180)
  x.bezierCurveTo(1496, 1240, 1716, 1500, 1736, 2304)
  x.fill()
  x.fillStyle = '#3fd42a'
  x.fillRect(420, 1300, 70, 1004)
  x.fillRect(1366, 1300, 70, 1004)
  // cabeça
  if (comCapacete) {
    const g = x.createLinearGradient(0, 300, 0, 1300)
    g.addColorStop(0, '#0e1116')
    g.addColorStop(0.55, '#3fd42a')
    g.addColorStop(1, '#1d7a1a')
    x.fillStyle = g
    x.beginPath()
    x.ellipse(928, 800, 470, 540, 0, 0, Math.PI * 2)
    x.fill()
    x.fillStyle = '#c9ced4'
    x.fillRect(560, 740, 736, 230)
  } else {
    x.fillStyle = '#c99c80'
    x.beginPath()
    x.ellipse(928, 640, 270, 350, 0, 0, Math.PI * 2)
    x.fill()
    x.fillStyle = '#2a211b'
    x.beginPath()
    x.ellipse(928, 400, 285, 150, 0, Math.PI, Math.PI * 2)
    x.fill()
  }
  x.fillStyle = 'rgba(0,0,0,.35)'
  x.font = '600 54px Inter Tight, sans-serif'
  x.textAlign = 'center'
  x.fillText(comCapacete ? 'foto com capacete (provisória)' : 'foto sem capacete (provisória)', 928, 2180)
  return c
}

/** Sprite do pincel: gradiente radial com borda bem macia. */
function criarPincel() {
  const s = 256
  const c = document.createElement('canvas')
  c.width = c.height = s
  const x = c.getContext('2d')
  const g = x.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2)
  g.addColorStop(0, 'rgba(0,0,0,1)')
  g.addColorStop(0.45, 'rgba(0,0,0,0.95)')
  g.addColorStop(0.75, 'rgba(0,0,0,0.35)')
  g.addColorStop(1, 'rgba(0,0,0,0)')
  x.fillStyle = g
  x.fillRect(0, 0, s, s)
  return c
}

export function createReveal({ canvas, stage, config, onStatus = () => {}, calibrar = null }) {
  const ctx = canvas.getContext('2d')
  const camada = document.createElement('canvas') // topo recortado
  const cctx = camada.getContext('2d')
  const mascara = document.createElement('canvas')
  const mctx = mascara.getContext('2d')
  const pincel = criarPincel()

  const reduzir = matchMedia('(prefers-reduced-motion: reduce)').matches
  const toque = matchMedia('(hover: none), (pointer: coarse)').matches
  const ESCALA_MASCARA = 0.5

  let base = null, topo = null
  let W = 0, H = 0, dpr = 1
  let foto = { x: 0, y: 0, w: 0, h: 0 }
  let ativo = true, destruido = false, visivel = true

  // ponteiro: alvo (real), suave (seguido), anterior (para o rastro)
  const p = { tx: 0, ty: 0, x: 0, y: 0, px: 0, py: 0, dentro: false, raio: 0, forca: 0 }
  const auto = { x: 0, y: 0, on: false }
  let ultimoToque = 0
  let tlAuto = null
  let demoLiberada = true // a Hero desliga a demonstração durante a transição

  const alinhamento = config.alinhamento

  /* ── Layout ─────────────────────────────────────────────────────────── */
  function medir() {
    // tamanho de layout (ignora transform: a Hero encolhe com scale na transição)
    W = Math.max(1, stage.clientWidth)
    H = Math.max(1, stage.clientHeight)
    dpr = Math.min(window.devicePixelRatio || 1, 2)
    for (const c of [canvas, camada]) {
      c.width = Math.round(W * dpr)
      c.height = Math.round(H * dpr)
    }
    canvas.style.width = W + 'px'
    canvas.style.height = H + 'px'
    mascara.width = Math.round(W * ESCALA_MASCARA)
    mascara.height = Math.round(H * ESCALA_MASCARA)

    if (base) {
      const iw = base.width, ih = base.height
      const retrato = W / H < 0.9
      // ancorada embaixo; no celular menor, para o nome caber acima da cabeça
      const s = retrato ? (H * 0.8) / ih : (H * 0.96) / ih
      const w = iw * s, h = ih * s
      foto = { x: (W - w) / 2, y: H - h, w, h }
    }
  }

  const rostoPx = () => ({
    x: foto.x + config.rosto.x * foto.w,
    y: foto.y + config.rosto.y * foto.h,
    rx: config.rosto.rx * foto.w,
    ry: config.rosto.ry * foto.h,
  })

  const raioBase = () => Math.min(W, H) * (toque ? config.pincel.celular : config.pincel.desktop)

  /* ── Máscara ────────────────────────────────────────────────────────── */
  function carimbar(x, y, r, a) {
    const s = ESCALA_MASCARA
    const d = r * 2 * s
    mctx.globalAlpha = a
    mctx.drawImage(pincel, x * s - d / 2, y * s - d / 2, d, d)
  }

  function pintar(dt) {
    // dissolve
    const taxa = reduzir ? 0.25 : 0.045
    const f = 1 - Math.pow(1 - taxa, dt * 60)
    mctx.globalCompositeOperation = 'destination-out'
    mctx.globalAlpha = 1
    mctx.fillStyle = `rgba(0,0,0,${f})`
    mctx.fillRect(0, 0, mascara.width, mascara.height)
    mctx.globalCompositeOperation = 'source-over'

    const usandoAuto = auto.on && !p.dentro
    const alvoX = usandoAuto ? auto.x : p.tx
    const alvoY = usandoAuto ? auto.y : p.ty
    const ligado = p.dentro || auto.on

    // segue com atraso (sensação de fluido)
    const k = 1 - Math.pow(1 - 0.16, dt * 60)
    p.px = p.x; p.py = p.y
    p.x += (alvoX - p.x) * k
    p.y += (alvoY - p.y) * k

    // raio cresce ao entrar e encolhe ao sair
    const kr = 1 - Math.pow(1 - 0.08, dt * 60)
    p.raio += ((ligado ? raioBase() : 0) - p.raio) * kr

    if (p.raio < 1) return
    const dx = p.x - p.px, dy = p.y - p.py
    const dist = Math.hypot(dx, dy)
    const vel = dist / Math.max(dt * 60, 0.5)
    p.forca += (Math.min(vel / 30, 0.7) - p.forca) * 0.15
    const r = p.raio * (1 + p.forca * 0.5)

    // carimbos ao longo do caminho para não "pontilhar"
    const passo = Math.max(r * 0.18, 2)
    const n = Math.min(40, Math.ceil(dist / passo))
    for (let i = 1; i <= n; i++) {
      const t = i / n
      carimbar(p.px + dx * t, p.py + dy * t, r, 0.38)
    }
    carimbar(p.x, p.y, r, 0.32)
  }

  /* ── Composição ─────────────────────────────────────────────────────── */
  function desenharTopo(alvo) {
    const a = alinhamento
    const w = foto.w * a.escala, h = foto.h * a.escala
    const x = foto.x + (foto.w - w) / 2 + a.x * foto.w
    const y = foto.y + (foto.h - h) + a.y * foto.h
    alvo.drawImage(topo, x, y, w, h)
  }

  function compor() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, W, H)
    if (!base) return
    ctx.drawImage(base, foto.x, foto.y, foto.w, foto.h)
    if (!topo) return

    if (calibrar && calibrar.ativo) {
      ctx.globalAlpha = calibrar.opacidade
      desenharTopo(ctx)
      ctx.globalAlpha = 1
      return
    }

    cctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    cctx.globalCompositeOperation = 'source-over'
    cctx.clearRect(0, 0, W, H)
    desenharTopo(cctx)
    cctx.globalCompositeOperation = 'destination-in'
    cctx.drawImage(mascara, 0, 0, W, H)
    cctx.globalCompositeOperation = 'source-over'

    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.drawImage(camada, 0, 0)
  }

  const tick = (_t, deltaMs) => {
    if (!ativo || !visivel || !base) return
    const dt = Math.min(deltaMs / 1000, 0.05) || 1 / 60
    pintar(dt)
    compor()
  }

  /* ── Demonstração automática (passeio pelo rosto) ───────────────────── */
  function passear(atraso = 0) {
    if (reduzir || !base || !demoLiberada) return
    tlAuto && tlAuto.kill()
    const r = rostoPx()
    auto.x = r.x - r.rx * 1.6
    auto.y = r.y + r.ry * 0.3
    tlAuto = gsap.timeline({
      delay: atraso,
      onStart: () => { auto.on = true; if (!p.dentro) { p.x = auto.x; p.y = auto.y } },
      onComplete: () => { auto.on = false },
    })
    tlAuto
      .to(auto, { x: r.x - r.rx * 0.4, y: r.y - r.ry * 0.35, duration: 0.7, ease: 'power2.out' })
      .to(auto, { x: r.x + r.rx * 0.6, y: r.y - r.ry * 0.1, duration: 0.8, ease: 'sine.inOut' })
      .to(auto, { x: r.x + r.rx * 0.1, y: r.y + r.ry * 0.45, duration: 0.7, ease: 'sine.inOut' })
      .to(auto, { x: r.x - r.rx * 0.5, y: r.y + r.ry * 0.05, duration: 0.7, ease: 'sine.inOut' })
      .to(auto, { x: r.x + r.rx * 1.8, y: r.y - r.ry * 0.6, duration: 0.9, ease: 'power2.in' })
  }

  // no celular, sem interação, a demonstração volta de tempos em tempos
  let relogio = null
  if (toque && !reduzir) {
    relogio = setInterval(() => {
      if (visivel && !p.dentro && performance.now() - ultimoToque > 6000 && !(tlAuto && tlAuto.isActive())) passear()
    }, 7000)
  }

  /* ── Eventos ────────────────────────────────────────────────────────── */
  // converte a posição da tela para o espaço do canvas, mesmo com a Hero reduzida por scale
  const local = (e) => {
    const r = stage.getBoundingClientRect()
    return { x: (e.clientX - r.left) * (W / (r.width || W)), y: (e.clientY - r.top) * (H / (r.height || H)) }
  }
  const mover = (e) => {
    const { x, y } = local(e)
    if (!p.dentro) { p.x = x; p.y = y; p.px = x; p.py = y }
    p.tx = x; p.ty = y
    if (e.pointerType === 'mouse' || e.pointerType === 'pen') p.dentro = true
  }
  const sair = (e) => { if (e.pointerType !== 'touch') p.dentro = false }
  const descer = (e) => {
    if (e.pointerType !== 'touch') return
    ultimoToque = performance.now()
    tlAuto && tlAuto.kill(); auto.on = false
    const { x, y } = local(e)
    p.x = p.px = p.tx = x; p.y = p.py = p.ty = y
    p.dentro = true
    p.raio = Math.max(p.raio, raioBase() * 0.6) // resposta imediata ao toque
  }
  const subir = (e) => { if (e.pointerType === 'touch') { p.dentro = false; ultimoToque = performance.now() } }

  stage.addEventListener('pointermove', mover)
  stage.addEventListener('pointerleave', sair)
  stage.addEventListener('pointerdown', descer)
  window.addEventListener('pointerup', subir)
  window.addEventListener('pointercancel', subir)

  const ro = new ResizeObserver(() => { medir(); compor() })
  ro.observe(stage)
  const io = new IntersectionObserver(([e]) => { visivel = e.isIntersecting })
  io.observe(stage)

  gsap.ticker.add(tick)

  /* ── Carregamento ───────────────────────────────────────────────────── */
  ;(async () => {
    const [b, t] = await Promise.all([primeiraQueExiste(config.base.map(url)), primeiraQueExiste(config.topo.map(url))])
    if (destruido) return
    base = recortar(b ? b.img : provisoria(false))
    topo = recortar(t ? t.img : provisoria(true))
    medir()
    compor()
    onStatus({ pronto: true, faltando: [!b && 'sem capacete', !t && 'com capacete'].filter(Boolean) })
  })()

  return {
    /** centro do rosto em px do palco (sem transform), usado pela transição */
    rosto: () => {
      if (!base) { medir(); return { x: W / 2, y: H * 0.32, foto } }
      return { ...rostoPx(), foto }
    },
    demonstrar: (atraso) => passear(atraso),
    liberarDemo: (v) => {
      if (v === demoLiberada) return
      demoLiberada = v
      if (!v && tlAuto) { tlAuto.kill(); auto.on = false }
    },
    redesenhar: () => compor(),
    pausar: (v) => { ativo = !v },
    destroy() {
      destruido = true
      gsap.ticker.remove(tick)
      tlAuto && tlAuto.kill()
      clearInterval(relogio)
      ro.disconnect(); io.disconnect()
      stage.removeEventListener('pointermove', mover)
      stage.removeEventListener('pointerleave', sair)
      stage.removeEventListener('pointerdown', descer)
      window.removeEventListener('pointerup', subir)
      window.removeEventListener('pointercancel', subir)
    },
  }
}
