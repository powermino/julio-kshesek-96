import { useMemo } from 'react'

/**
 * Linhas topográficas geradas por código (curvas de nível em volta de "picos").
 * Determinístico: o desenho é sempre o mesmo, sem imagem externa.
 */
function curvas() {
  const picos = [
    { x: 330, y: 300, aneis: 15, r0: 26, passo: 30, fase: 0.4 },
    { x: 1290, y: 760, aneis: 17, r0: 20, passo: 32, fase: 2.1 },
    { x: 980, y: 120, aneis: 9, r0: 30, passo: 34, fase: 4.0 },
  ]
  const caminhos = []
  for (const p of picos) {
    for (let k = 0; k < p.aneis; k++) {
      const r = p.r0 + k * p.passo
      const pts = []
      const n = 120
      for (let i = 0; i <= n; i++) {
        const a = (i / n) * Math.PI * 2
        const ruido =
          1 +
          0.16 * Math.sin(3 * a + p.fase + k * 0.33) +
          0.07 * Math.sin(5 * a - k * 0.21 + p.fase * 2) +
          0.04 * Math.sin(9 * a + k * 0.5)
        pts.push([p.x + Math.cos(a) * r * ruido * 1.25, p.y + Math.sin(a) * r * ruido * 0.82])
      }
      caminhos.push({
        d: 'M' + pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(' L') + 'Z',
        forte: k % 5 === 4,
      })
    }
  }
  return caminhos
}

export default function Topografia() {
  const linhas = useMemo(curvas, [])
  return (
    <svg className="topografia" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      {linhas.map((l, i) => (
        <path key={i} d={l.d} className={l.forte ? 'topo-forte' : ''} vectorEffect="non-scaling-stroke" />
      ))}
    </svg>
  )
}
