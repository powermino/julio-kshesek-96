import imagens from '../config/imagens.json'
import { url } from '../lib/caminho'

/**
 * Logo com proporção original preservada: a altura vem do CSS (ou da prop `altura`)
 * e a largura acompanha automaticamente — nunca há distorção.
 */
export default function Logo({ src, nome, className = '', altura }) {
  const m = imagens[src]
  if (!m) return <span className={`logo-texto ${className}`}>{nome}</span>
  const s = m.saidas[m.saidas.length - 1]
  return (
    <img
      className={`logo ${className}`}
      src={`${url(src)}-${s.w}.webp`}
      width={m.w}
      height={m.h}
      alt={nome}
      loading="lazy"
      decoding="async"
      style={altura ? { height: altura, width: 'auto' } : undefined}
    />
  )
}
