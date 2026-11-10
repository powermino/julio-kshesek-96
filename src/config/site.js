/**
 * Configuração central do site. Tudo marcado com [ ] é PROVISÓRIO.
 */
// Canais oficiais
const INSTAGRAM = 'https://www.instagram.com/juliokshesek96/'
const WHATSAPP = '554196401478' // só dígitos (wa.me)
const MENSAGEM_WA = 'Olá, Júlio! Conheci seu site e gostaria de saber mais sobre as oportunidades de patrocínio e parceria.'

export const site = {
  nome: 'Júlio Kshesek',
  primeiroNome: 'Júlio',
  sobrenome: 'Kshesek',
  numero: '96',
  categoria: 'Fórmula Truck',
  instagram: INSTAGRAM,

  hero: {
    // O primeiro arquivo que existir em /public é usado (WebP otimizado primeiro; originais como reserva).
    base: ['/img/hero/julio-sem-capacete-1856.webp', '/julio-sem-capacete.png', '/julio-sem-capacete.jpg'],
    topo: ['/img/hero/julio-com-capacete-1856.webp', '/julio-com-capacete.png', '/julio-com-capacete.jpg'],

    // Ajuste fino da imagem com capacete sobre a sem capacete.
    // Fração do tamanho da foto (x/y) e escala. Calibre abrindo o site com ?calibrar
    alinhamento: { x: 0, y: 0, escala: 1 },

    // Região do rosto na foto (frações 0–1), usada na animação automática de demonstração.
    rosto: { x: 0.497, y: 0.29, rx: 0.13, ry: 0.15 },

    // Tamanho do pincel em fração do menor lado da tela.
    pincel: { desktop: 0.15, celular: 0.24 },
  },

  frase: 'Velocidade é mais que competição. É propósito.',

  // Slogan oficial (rodapé cinematográfico e rodapé final)
  slogan: 'A coragem acelera. A paixão não tem limites.',

  proximaEtapa: {
    rotulo: 'Próxima etapa',
    etapa: '[Etapa 00]',
    local: '[Autódromo · Cidade]',
    data: '[dd.mm.aaaa]',
  },

  contato: {
    whatsapp: WHATSAPP, // +55 41 9640-1478
    telefone: '+55 41 9640-1478',
    mensagemWhatsapp: MENSAGEM_WA,
    email: '', // e-mail que recebe o formulário
  },

  redes: [
    { nome: 'Instagram', url: INSTAGRAM, externo: true },
    { nome: 'WhatsApp', url: `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(MENSAGEM_WA)}`, externo: true },
  ],

  menu: [
    { rotulo: 'Início', href: '#inicio' },
    { rotulo: 'A pista', href: '#pista' },
    { rotulo: 'Além da pista', href: '#alem' },
    { rotulo: 'Impacto', href: '#impacto' },
    { rotulo: 'Patrocínio', href: '#patrocinio' },
    { rotulo: 'Contato', href: '#contato' },
  ],

  /**
   * MÉTRICAS DO MEDIA KIT — edite aqui quando houver números oficiais.
   *
   * status:
   *   'verificado'      → número com fonte/relatório; aparece como dado.
   *   'estimativa'      → número informado pela equipe, ainda sem documento; aparece com o selo "Estimativa".
   *   'em-atualizacao'  → sem número oficial; o card mostra "Dados em atualização".
   *
   * serie: valores reais para o gráfico (ex.: [{ rotulo: 'Jan', valor: 1200 }, ...]).
   *        Enquanto for null, o gráfico mostra uma CURVA ILUSTRATIVA identificada como tal,
   *        sem eixo numérico — nunca como crescimento real.
   */
  metricas: {
    /**
     * Dados reais do painel Meta Business Suite (Instagram + Facebook).
     * Os totais vêm ARREDONDADOS pelo próprio painel. Visualizadores, interações e cliques
     * são indicadores diferentes — não se somam às visualizações.
     */
    meta: {
      status: 'verificado',
      fonte: 'Meta Business Suite',
      periodo: '[período de referência a confirmar]', // ex.: '1º jan – 30 jun 2026'
      totais: [
        { chave: 'visualizacoes', valor: 523.9, sufixo: ' mil', rotulo: 'Visualizações totais · Meta', nota: 'Instagram + Facebook · valor arredondado pelo painel' },
        { chave: 'visualizadores', valor: 92.3, sufixo: ' mil', rotulo: 'Visualizadores', nota: 'Contas que viram o conteúdo' },
        { chave: 'interacoes', valor: 42.1, sufixo: ' mil', rotulo: 'Interações com conteúdo', nota: 'Curtidas, comentários, compartilhamentos e salvamentos' },
        { chave: 'cliques', valor: 19, sufixo: ' mil', rotulo: 'Cliques no link', nota: 'Acessos a partir dos links publicados' },
      ],
      plataformas: [
        { nome: 'Instagram', logo: '/img/logos/instagram', visualizacoes: 492555 },
        { nome: 'Facebook', logo: '/img/logos/facebook', visualizacoes: 31357 }, // sem PNG oficial no projeto: aparece em texto
      ],
      serie: null, // série temporal real (ex.: [{ rotulo: 'Jan', valor: 61000 }, ...]); enquanto null, a curva é ilustrativa
    },
    instagram: {
      status: 'verificado',
      visualizacoes: { valor: 492555, rotulo: 'visualizações no Instagram' },
      serie: null,
      fonte: 'Meta Business Suite',
    },
    publico: {
      status: 'estimativa',
      valor: 25, sufixo: ' mil',
      rotulo: 'Pessoas por etapa · estimativa de referência',
      nota: 'Estimativa de referência informada para o projeto. Não verificada.',
      referencia: {
        texto: 'Referência publicada: cerca de 15 mil pessoas na etapa de Santa Cruz do Sul (RS), em 15/03/2026.',
        fonte: 'Expansão',
        url: 'https://expansao.co/formula-truck-reune-cerca-de-15-mil-pessoas-no-autodromo-de-santa-cruz-do-sul/',
      },
      etapas: null,         // ex.: [18, 22, 25, ...] (mil pessoas por etapa, sem nomes de cidades)
    },
    youtube: {
      // Alcance acumulado de REFERÊNCIA do canal oficial da Fórmula Truck — não são visualizações exclusivas do piloto.
      status: 'referencia',
      visualizacoes: { valor: 9.7, prefixo: '+', sufixo: ' mi', rotulo: 'visualizações acumuladas no canal oficial da Fórmula Truck' },
      serie: null,
      fonte: 'Canal oficial da Fórmula Truck no YouTube (referência informada para o projeto)',
      periodo: '[data de referência a confirmar]',
    },
    bandsports: {
      status: 'em-atualizacao',
      audiencia: null,      // ex.: { valor: 2, sufixo: ' mi', rotulo: 'telespectadores por transmissão' }
      fonte: '',            // ex.: 'Relatório Kantar IBOPE, temporada 2026'
    },
  },

  /** Logos (arquivos otimizados em /public/img/logos, gerados a partir de /public/Logos e /public/Logos parceiros). */
  midia: [
    { nome: 'Fórmula Truck', src: '/img/logos/formula-truck', papel: 'Campeonato' },
    { nome: 'Band Sports', src: '/img/logos/bandsports', papel: 'Mídia' },
  ],
  plataformas: [
    { nome: 'Instagram', src: '/img/logos/instagram' },
    { nome: 'YouTube', src: '/img/logos/youtube' },
    { nome: 'Band Sports', src: '/img/logos/bandsports' },
  ],
  parceiros: [
    { nome: 'KS Oficina', src: '/img/logos/ks-oficina' },
    { nome: 'Tekne Car Funilaria Express', src: '/img/logos/tekne-car' },
    { nome: 'Trentini Distribuidora', src: '/img/logos/trentini' },
    { nome: 'Blind Auto Vidros', src: '/img/logos/blind-auto-vidros' },
    { nome: 'Passaúra Locações', src: '/img/logos/passaura-locacoes' },
    { nome: 'MR Estética Automotiva', src: '/img/logos/mr-estetica' },
    { nome: 'NEAT Automóveis', src: '/img/logos/neat-automoveis' },
    { nome: 'BW Football Club', src: '/img/logos/bw-football-club' },
    { nome: 'Sabor Fit', src: '/img/logos/sabor-fit' },
  ],
}
