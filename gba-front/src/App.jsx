import { EmulatorProvider } from './context/emulator.context';
import { ModalProvider } from './context/modal.context';
import Navbar from './components/Navbar';
import Emulator from './components/Emulator';
import './App.css';

function App() {

  return (
    <>
      <ModalProvider>
        <EmulatorProvider>
          <Navbar />
          <Emulator />
        </EmulatorProvider>
      </ModalProvider>
    </>
  )
}

export default App
