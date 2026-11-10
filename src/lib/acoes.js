import { site } from '../config/site'

/** Rola suavemente até uma seção e, se informado, pré-seleciona o assunto do formulário. */
export function irPara(href, assunto) {
  if (assunto) window.dispatchEvent(new CustomEvent('site:assunto', { detail: assunto }))
  window.dispatchEvent(new CustomEvent('site:ir', { detail: href }))
}

/** Link do WhatsApp comercial (ou null se o número ainda não foi configurado em site.js). */
export function linkWhatsapp(texto = site.contato.mensagemWhatsapp) {
  const n = String(site.contato.whatsapp || '').replace(/\D/g, '')
  return n ? `https://wa.me/${n}?text=${encodeURIComponent(texto)}` : null
}

/** Props de <a> para chamadas comerciais: WhatsApp em nova aba; sem número, vai ao formulário. */
export function propsComercial(assunto = 'Patrocínio') {
  const url = linkWhatsapp()
  if (url) return { href: url, target: '_blank', rel: 'noopener noreferrer' }
  return { href: '#contato', onClick: (e) => { e.preventDefault(); irPara('#contato', assunto) } }
}

/** Props de <a> para links externos (nova aba). */
export const externo = (href) => ({ href, target: '_blank', rel: 'noopener noreferrer' })

/**
 * "Seja um patrocinador": abre o WhatsApp comercial já com a mensagem.
 * Sem número configurado, leva ao formulário de contato com o assunto "Patrocínio".
 */
export function sejaPatrocinador(e) {
  const url = linkWhatsapp()
  if (url) return // o próprio <a href> abre o WhatsApp
  if (e) e.preventDefault()
  irPara('#contato', 'Patrocínio')
}
