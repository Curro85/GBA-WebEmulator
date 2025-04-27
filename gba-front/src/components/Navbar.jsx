import { useEmulator } from '../context/emulator.context';
import { useModal } from '../context/modal.context';

function Navbar() {
  const { emulator } = useEmulator();
  const { openModal } = useModal();

  return (
    <nav className="bg-gray-800 text-white px-6 py-4 flex justify-between items-center">
      <div className="space-x-4">
        <button className="cursor-pointer bg-amber-950 rounded w-30 h-10 hover:underline">Cargar ROM</button>
        <button className="cursor-pointer bg-amber-950 rounded w-30 h-10 hover:underline">Play</button>
        <button className="cursor-pointer bg-amber-950 rounded w-30 h-10 hover:underline">x2</button>
        <button className="cursor-pointer bg-amber-950 rounded w-30 h-10 hover:underline">Volumen</button>
        <input
          className="bg-amber-50 text-blue-400"
          type="text"
          disabled={!emulator}
          onFocus={() => {
            emulator.toggleInput(false);
            emulator.pauseGame();
          }}
          onBlur={() => {
            emulator.toggleInput(true);
            emulator.resumeGame();
          }}
          placeholder='Hola'
        />
        <button onClick={() => openModal('login')}>Loginga</button>
      </div>
    </nav>
  )
}

export default Navbar