import Navbar from './components/Navbar';
import Emulator from './components/Emulator';
import './App.css';

function App() {

  return (
    <>
      <Navbar />
      <main className="flex-1 ml-64">
        <Emulator />
      </main>
    </>
  )
}

export default App
