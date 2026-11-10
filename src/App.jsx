import { useCallback, useEffect, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import Loader from './components/Loader'
import Header from './components/Header'
import Cursor from './components/Cursor'
import Hero from './sections/Hero'
import Pista from './sections/Pista'
import AlemDaPista from './sections/AlemDaPista'
import Patrocinio from './sections/Patrocinio'
import Historia from './sections/Historia'
import Impacto from './sections/Impacto'
import Encerramento from './sections/Encerramento'
import { Frase, PistaFora, Contato, Rodape } from './sections/Secoes'

gsap.registerPlugin(ScrollTrigger)

export default function App() {
  const [pronto, setPronto] = useState(false)
  const [lenis, setLenis] = useState(null)

  // rolagem suave (Lenis) sincronizada com o ScrollTrigger
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const l = new Lenis({ lerp: 0.09, wheelMultiplier: 1, smoothWheel: true })
    l.on('scroll', ScrollTrigger.update)
    const raf = (t) => l.raf(t * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)
    l.stop()
    setLenis(l)
    return () => { gsap.ticker.remove(raf); l.destroy() }
  }, [])

  // navegação interna (botões de seção, CTA de patrocínio): rolagem suave até o alvo
  useEffect(() => {
    const ir = (e) => {
      const alvo = document.querySelector(e.detail)
      if (!alvo) return
      if (lenis) lenis.scrollTo(alvo, { duration: 1.6 })
      else alvo.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
    }
    window.addEventListener('site:ir', ir)
    return () => window.removeEventListener('site:ir', ir)
  }, [lenis])

  const terminar = useCallback(() => {
    setPronto(true)
    document.documentElement.classList.add('is-pronto')
  }, [])

  useEffect(() => {
    if (pronto && lenis) lenis.start()
    if (pronto) requestAnimationFrame(() => ScrollTrigger.refresh())
  }, [pronto, lenis])

  return (
    <>
      <Loader aoTerminar={terminar} />
      <Cursor />
      <Header lenis={lenis} pronto={pronto} />
      <main>
        <Hero pronto={pronto} />
        <PistaFora />
        <Pista />
        <Frase />
        <AlemDaPista />
        <Impacto />
        <Historia />
        <Patrocinio />
        <Encerramento />
        <Contato />
      </main>
      <Rodape />
    </>
  )
}
