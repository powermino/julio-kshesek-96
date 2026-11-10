/**
 * Monograma gráfico "JK96" — elemento ILUSTRATIVO original, desenhado como
 * caminhos SVG independentes. Não é, nem deve ser apresentado como, a
 * assinatura manuscrita do piloto.
 *
 * Cada <path> usa pathLength="1": a animação vai de stroke-dashoffset 1 → 0
 * (traçado progressivo). data-peso = comprimento relativo, para distribuir o tempo.
 */
export const TRACOS = [
  // J — barra superior em arco, com leve inclinação de velocidade
  { d: 'M118 132 C196 102 292 92 382 102', peso: 0.6 },
  // J — haste que mergulha e volta em laço
  { d: 'M300 104 C318 182 300 300 250 382 C210 446 136 462 98 420 C70 388 96 348 152 352', peso: 1.5 },
  // K — haste inclinada
  { d: 'M478 92 C470 200 452 320 424 442', peso: 0.9 },
  // K — braço e perna num só traço, com chicote final
  { d: 'M620 96 C568 168 516 230 458 278 C526 272 566 322 590 382 C608 426 640 446 686 422', peso: 1.2 },
  // 9 — laço superior e descida longa
  { d: 'M852 214 C840 172 774 168 756 212 C740 254 784 288 826 264 C852 248 858 222 852 214 C862 302 840 384 790 448', peso: 1.2 },
  // 6 — entrada alta e laço inferior
  { d: 'M1018 166 C956 198 918 290 928 362 C938 424 1006 434 1028 384 C1048 338 1010 300 974 316 C946 330 930 354 928 376', peso: 1.1 },
  // marcas de velocidade
  { d: 'M1074 150 C1094 140 1114 130 1136 120', peso: 0.2 },
  { d: 'M1082 196 C1110 184 1138 172 1166 160', peso: 0.25 },
  // sublinhado longo que atravessa a fotografia
  { d: 'M80 482 C320 436 640 414 900 422 C1040 426 1130 444 1210 424 C1240 416 1262 402 1272 388', peso: 1.4 },
]

export default function Assinatura({ className = '' }) {
  return (
    <svg
      className={`assinatura ${className}`}
      viewBox="60 60 1240 460"
      fill="none"
      role="img"
      aria-label="Monograma gráfico JK96 (elemento ilustrativo)"
    >
      <g className="assinatura-tracos">
        {TRACOS.map((t, i) => (
          <path key={i} d={t.d} pathLength="1" data-peso={t.peso} className="assinatura-traco" />
        ))}
      </g>
    </svg>
  )
}
