/**
 * Converte um caminho de /public ("/img/x.webp") para o endereço correto
 * conforme a base do build (raiz no desenvolvimento, subpasta no GitHub Pages).
 */
export const url = (p) => (typeof p === 'string' && p.startsWith('/') ? import.meta.env.BASE_URL + p.slice(1) : p)
