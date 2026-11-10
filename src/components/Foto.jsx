import imagens from '../config/imagens.json'
import { url } from '../lib/caminho'

/**
 * Foto real otimizada (WebP em várias larguras, gerado a partir dos PNG originais).
 * `src` é a chave do manifesto, ex.: '/img/caminhao/caminhao-frente-96'.
 */
export default function Foto({ src, alt, sizes = '100vw', className = '', prioridade = false, style }) {
  const m = imagens[src]
  if (!m) return <div className={`placeholder-foto ${className}`}><span>{alt}</span></div>
  const s = m.saidas
  const srcSet = s.map((o) => `${url(src)}-${o.w}.webp ${o.w}w`).join(', ')
  const padrao = s[Math.min(1, s.length - 1)].w
  return (
    <img
      className={className}
      src={`${url(src)}-${padrao}.webp`}
      srcSet={srcSet}
      sizes={sizes}
      width={m.w}
      height={m.h}
      alt={alt}
      loading={prioridade ? 'eager' : 'lazy'}
      decoding="async"
      style={style}
    />
  )
}
