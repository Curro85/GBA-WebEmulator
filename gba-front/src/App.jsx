import { EmulatorProvider } from './context/emulator.context'
import Navbar from './components/Navbar'
import Emulator from './components/Emulator'
import './App.css'

function App() {

  return (
    <>
      <EmulatorProvider>
        <Navbar />
        <Emulator />
      </EmulatorProvider>
    </>
  )
}

export default App
