import Hero from '../components/Hero'
import Simulator from '../components/simulator/Simulator'
import EngineeringExplorer from '../components/EngineeringExplorer'
import EconomicCalculator from '../components/EconomicCalculator'
import Comparison from '../components/Comparison'
import SocialImpact from '../components/SocialImpact'
import Roadmap from '../components/Roadmap'
import HackaSanta from '../components/HackaSanta'
import Footer from '../components/Footer'
import { usePresentationStore } from '../store/presentationStore'

export default function Home() {
  const demo = usePresentationStore((s) => s.active)
  return (
    <>
      <main>
        <Hero />
        <Simulator />
        <EngineeringExplorer />
        <EconomicCalculator />
        <Comparison />
        <SocialImpact />
        <Roadmap />
        <HackaSanta />
      </main>
      <Footer />
      {demo && <div aria-hidden className="h-40" />}
    </>
  )
}
