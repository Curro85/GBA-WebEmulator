import Navbar from './components/Navbar';
import Emulator from './components/Emulator';
import Gemini from './components/Gemini';
import './App.css';

function App() {

  return (
    <>
      <Navbar />
      <main className="flex-1 ml-64">
        <Emulator />
        <Gemini />
      </main>
    </>
  )
}

export default App
