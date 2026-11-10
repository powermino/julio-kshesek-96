# Júlio Kshesek #96 · site

React + Vite + GSAP (ScrollTrigger, SplitText) + Lenis.

```bash
npm install
npm run dev      # http://localhost:5188
npm run build    # gera /dist para publicar
```

## Hero (revelação do capacete)
- Fotos em `public/`: `julio-sem-capacete.png` e `julio-com-capacete.png`
  (se não houver .png, usa os .jpg). Mesmo tamanho e enquadramento.
- O fundo de estúdio é recortado automaticamente, então o nome gigante passa atrás do piloto.
  Funciona melhor com fundo liso e claro.
- Alinhamento fino: abra `http://localhost:5188/?calibrar`, ajuste os controles e copie
  os valores para `src/config/site.js` → `hero.alinhamento`.
- Celular: arrastar na horizontal revela; o botão "Toque para travar" permite arrastar livremente.

## Onde editar
- Textos, links, próxima etapa, WhatsApp, e-mail: `src/config/site.js`
- Seções: `src/sections/Secoes.jsx` (tudo entre [colchetes] é provisório)
- Cores e fontes: topo de `src/styles/global.css`
