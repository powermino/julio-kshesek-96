import { useState } from 'react'

/**
 * Painel de alinhamento (abra o site com ?calibrar).
 * Mostra a foto com capacete por cima em transparência; ajuste até o macacão
 * coincidir e copie os valores para src/config/site.js → hero.alinhamento.
 */
export default function Calibrador({ alvo, calib, motor }) {
  const [v, setV] = useState({ ...alvo, opacidade: calib.opacidade, ativo: calib.ativo })

  const mudar = (chave, valor) => {
    const n = { ...v, [chave]: valor }
    setV(n)
    if (chave === 'opacidade') calib.opacidade = valor
    else if (chave === 'ativo') calib.ativo = valor
    else alvo[chave] = valor
    motor.current && motor.current.redesenhar()
  }

  const linha = (chave, rotulo, min, max, passo) => (
    <label className="calib-linha">
      <span>{rotulo}</span>
      <input type="range" min={min} max={max} step={passo} value={v[chave]} onChange={(e) => mudar(chave, parseFloat(e.target.value))} />
      <output>{Number(v[chave]).toFixed(3)}</output>
    </label>
  )

  const json = `alinhamento: { x: ${v.x.toFixed(4)}, y: ${v.y.toFixed(4)}, escala: ${v.escala.toFixed(4)} },`

  return (
    <div className="calib" onPointerDown={(e) => e.stopPropagation()}>
      <strong>Calibrar alinhamento</strong>
      <label className="calib-linha">
        <span>Sobrepor</span>
        <input type="checkbox" checked={v.ativo} onChange={(e) => mudar('ativo', e.target.checked)} />
        <output>{v.ativo ? 'sim' : 'não'}</output>
      </label>
      {linha('opacidade', 'Opacidade', 0, 1, 0.01)}
      {linha('x', 'Deslocar X', -0.3, 0.3, 0.001)}
      {linha('y', 'Deslocar Y', -0.4, 0.4, 0.001)}
      {linha('escala', 'Escala', 0.6, 1.4, 0.001)}
      <code>{json}</code>
      <button type="button" onClick={() => navigator.clipboard && navigator.clipboard.writeText(json)}>Copiar</button>
    </div>
  )
}
