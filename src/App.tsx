import { MotionConfig } from 'motion/react'
import Header from './components/Header'
import PresentationMode from './components/PresentationMode'
import { useSimulationLoop } from './hooks/useSimulationLoop'
import Home from './pages/Home'

export default function App() {
  useSimulationLoop()
  return (
    <MotionConfig reducedMotion="user">
      <Header />
      <Home />
      <PresentationMode />
    </MotionConfig>
  )
}
