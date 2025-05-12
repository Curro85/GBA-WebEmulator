import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Modal from 'react-modal'
import { EmulatorProvider } from './context/emulator.context';
import { ModalProvider } from './context/modal.context';
import { AuthProvider } from './context/auth.context'
import { GamepadProvider } from './context/gamepad.context.jsx'

Modal.setAppElement('#root')

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <EmulatorProvider>
        <GamepadProvider>
          <ModalProvider>
            <App />
          </ModalProvider>
        </GamepadProvider>
      </EmulatorProvider>
    </AuthProvider>
  </StrictMode>,
)
