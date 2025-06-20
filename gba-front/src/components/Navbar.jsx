import { CloudUpload, DoorOpen, Play, Settings, User } from 'lucide-react';
import { useAuth } from '../context/auth.context';
import { useModal } from '../context/modal.context';

function Navbar() {
  const { openModal } = useModal();
  const { user, logout } = useAuth();

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-gray-800 border-r border-purple-500/30 flex flex-col shadow-xl shadow-purple-500/10">
      <div className="p-6 border-b border-purple-500/30 text-center">
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
          GBA Web Emulator
        </h1>
        <p className="text-sm text-gray-400 mt-1">Desarrollado por
          <a className='text-amber-600' href='https://github.com/Curro85' target='_blank'> Curro85</a>
        </p>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <button
          className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800/50 transition-all group"
          onClick={() => openModal('uploadrom')}
        >
          <div className="p-1.5 rounded-md bg-purple-600/20 group-hover:bg-purple-600/30 transition-colors">
            <CloudUpload className='h-5 w-5 text-purple-400' />
          </div>
          <span className="text-gray-200 group-hover:text-white">Guardar ROMs</span>
        </button>

        <button
          className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800/50 transition-all group"
          onClick={() => openModal('loadroms')}
        >
          <div className="p-1.5 rounded-md bg-blue-600/20 group-hover:bg-blue-600/30 transition-colors">
            <Play className="h-5 w-5 text-blue-400" />
          </div>
          <span className="text-gray-200 group-hover:text-white">Mis ROMs</span>
        </button>

        <button
          className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800/50 transition-all group"
          onClick={() => openModal('profile')}
        >
          <div className="p-1.5 rounded-md bg-green-600/20 group-hover:bg-green-600/30 transition-colors">
            <User className="h-5 w-5 text-green-400" />
          </div>
          <span className="text-gray-200 group-hover:text-white">Perfil</span>
        </button>

        <button
          className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800/50 transition-all group"
          onClick={() => openModal('settings')}
        >
          <div className="p-1.5 rounded-md bg-gray-600/20 group-hover:bg-gray-600/30 transition-colors">
            <Settings className="h-5 w-5 text-gray-400" />
          </div>
          <span className="text-gray-200 group-hover:text-white">Configuración</span>
        </button>
      </nav>

      <div className="p-4 border-t border-purple-500/30">
        {user ? (
          <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
            <div className="flex items-center space-x-2 truncate">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-xs font-bold">
                {user.charAt(0).toUpperCase()}
              </div>
              <span className="text-gray-200 truncate">Hola, {user}</span>
            </div>
            <button
              onClick={logout}
              className="p-1.5 rounded-md hover:bg-gray-700/50 transition-colors text-gray-400 hover:text-red-400"
              title="Cerrar sesión"
            >
              <DoorOpen className="h-5 w-5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => openModal('login')}
            className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 text-white shadow-md hover:shadow-cyan-500/20 transition-all"
          >
            <span>Iniciar sesión</span>
          </button>
        )}
      </div>
    </aside>
  )
}

export default Navbar