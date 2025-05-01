// import { useEmulator } from '../context/emulator.context';
import { CloudArrowUpIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/auth.context';
import { useModal } from '../context/modal.context';

function Navbar() {
  // const { emulator } = useEmulator();
  const { openModal } = useModal();
  const { user, logout } = useAuth();

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-gray-800 text-white flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-xl font-bold">GBA Web Emulator</h1>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <button className="w-full flex items-center space-x-2 p-2 rounded hover:bg-gray-700 transition-colors">
          <CloudArrowUpIcon className="h-5 w-5" />
          <span>Guardar en la nube</span>
        </button>

        <button className="w-full flex items-center space-x-2 p-2 rounded hover:bg-gray-700 transition-colors">
          <span>Play/Pausa</span>
        </button>

        <button className="w-full flex items-center space-x-2 p-2 rounded hover:bg-gray-700 transition-colors">
          <span>Velocidad x2</span>
        </button>

        <button className="w-full flex items-center space-x-2 p-2 rounded hover:bg-gray-700 transition-colors">
          <span>Volumen</span>
        </button>
      </nav>

      <div className="p-4 border-t border-gray-700">
        {user ? (
          <div className="flex items-center justify-between">
            <span className="truncate">Hola, {user}</span>
            <button
              onClick={logout}
              className="px-3 py-1 bg-red-600 rounded hover:bg-red-400 transition-colors cursor-pointer"
              title="Cerrar sesión"
            >
              Salir
            </button>
          </div>
        ) : (
          <button
            onClick={() => openModal('login')}
            className="w-full py-2 bg-amber-600 rounded hover:bg-amber-700 transition-colors cursor-pointer"
          >
            Iniciar sesión
          </button>
        )}
      </div>
    </aside>
  )
}

export default Navbar