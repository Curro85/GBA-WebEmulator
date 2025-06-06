# Frontend: React con Vite

Ahora es el momento del Frontend, así que explicaré la estructura y partes más importantes del
mismo.

```
gba-front/
|-- public/
|-- src/
    |-- assets/
    |-- components/
    |-- context/
    |-- App.css
    |-- App.jsx
    |-- index.css
    |-- main.jsx
|-- Dockerfile
|-- eslint.config.js
|-- index.html
|-- package-lock.json
|-- package.json
|-- vite.config.js
```

## Ficheros y directorios útiles

Tenemos el directorio `public/` que es el encargado dar acceso a los ficheros estáticos a
react de forma predeterminada.

También tenemos el ya conocido `Dockerfile`, para contenedorizar y desplegar la aplicación.

En `React` también tenemos varios ficheros como `eslint.config.js` y `vite.config.js`, que
contienen configuración del proyecto, y también tenemos los ficheros `package.json` y
`package-lock.json` que tienen las dependencias y librerias instaladas en el proyecto.

Por último tenemos `index.html`, que es el HTML principal que se muestra al cargar nuestra
aplicación.

## Directorio `src/`

Aquí es donde realmente destaca `React`, aunque antes de ir a lo **principal**, explicaré los
ficheros y las carpetas más **secundarias**.

Esto consta de lo siguiente:

- **assets/**: Carpeta que contiene imágenes y ficheros, similar al directorio `public/`, pero
  solo accesible dentro de la misma.
- **App.css** e **index.css**: Ficheros de estilo para la aplicación que actualmente uso TailwindCSS.
- **App.jsx**: En este fichero se insertan los componentes creados para mostrarlos en la web.
- **main.jsx**: Este es el fichero principal de react, el que muestra el `index.html`
  mencionado anteriormente, e incluye `app.jsx` más los contextos creados.

## Directorio `context/`

En este directorio se crean contextos que sirven para crear funciones, variables reactivas y
utilidades que se transmiten a los componentes, para tener un código reutilizable y más fácil
de mantener y leer.

```
gba-front/
|-- public/
|-- src/
    |-- context/
      |-- auth.context.jsx
      |-- emulator.context.jsx
      |-- gamepad.context.jsx
      |-- modal.context.jsx
```

Estos son los contextos creados:
> [auth.context.jsx <sub><sup>(ver)</sup></sub>](https://github.com/Curro85/GBA-WebEmulator/blob/main/gba-front/src/context/auth.context.jsx)
>
> Este contexto contiene las funciones de registro, login, logout y todo lo necesario para gestionar los usuarios
> de la web.
>
> [emulator.context.jsx <sub><sup>(ver)</sup></sub>](https://github.com/Curro85/GBA-WebEmulator/blob/main/gba-front/src/context/emulator.context.jsx)
>
> Este contexto crea y entrega el emulador a los demás componentes, con funciones propias del mismo y algunas 
> creadas por mí para ajustarlas a mi idea de la web.
>
> [gamepad.context.jsx <sub><sup>(ver)</sup></sub>](https://github.com/Curro85/GBA-WebEmulator/blob/main/gba-front/src/context/gamepad.context.jsx)
>
> Este contexto contiene las funciones y el bucle que recibe los inputs del mando conectado al ordenador 
> permitiendo jugar al emulador con un mando conectado.
>
> [modal.context.jsx <sub><sup>(ver)</sup></sub>](https://github.com/Curro85/GBA-WebEmulator/blob/main/gba-front/src/context/modal.context.jsx)
>
> Este contexto se encarga de gestionar los modales de la web, de sus animaciones y de abrirlos y cerrarlos.

## Directorio `components/`

Dentro de components, crearemos los componentes que usaremos en la web, como si fuesen piezas
de un puzzle que luego vamos a colocar.

```
gba-front/
|-- public/
|-- src/
    |-- components/
      |-- Emulator.jsx
      |-- Gemini.jsx
      |-- LoginForm.jsx
      |-- Navbar.jsx
      |-- Profile.jsx
      |-- RegisterForm.jsx
      |-- RomList.jsx
      |-- Settings.jsx
      |-- UserRoms.jsx
```

Estos son los componentes actuales de la web:
> [Emulator.jsx <sub><sup>(ver)</sup></sub>](https://github.com/Curro85/GBA-WebEmulator/blob/main/gba-front/src/components/Emulator.jsx)
>
> Este componente muestra en pantalla el emulador con unos controladores para la velocidad, el volumen, un botón para cargar las
> roms y otro para reproducir/pausar la emulación.
>
> [Gemini.jsx <sub><sup>(ver)</sup></sub>](https://github.com/Curro85/GBA-WebEmulator/blob/main/gba-front/src/components/Gemini.jsx)
>
> Este componente se encarga de mostrar la IA introducida como guía de videojuegos, saludad a Jeremías.
>
> [Navbar.jsx <sub><sup>(ver)</sup></sub>](https://github.com/Curro85/GBA-WebEmulator/blob/main/gba-front/src/components/Navbar.jsx)
>
> Este componente contiene los modales que el usuario puede utilizar, como login, perfil, subir roms...
>
> [RomList.jsx <sub><sup>(ver)</sup></sub>](https://github.com/Curro85/GBA-WebEmulator/blob/main/gba-front/src/components/RomList.jsx)
>
> Este componente está dentro del modal *"Subir roms"*, sirve para listar y subir las roms que el usuario escoja.
>
> [UserRoms.jsx <sub><sup>(ver)</sup></sub>](https://github.com/Curro85/GBA-WebEmulator/blob/main/gba-front/src/components/UserRoms.jsx)
>
> Este componente está dentro del modal *"Mis roms"* y muestra las roms que el usuario tiene en base de datos pudiendo
> acceder a ellas e iniciar el juego que quiera desde la nube.
>
> [Profile.jsx <sub><sup>(ver)</sup></sub>](https://github.com/Curro85/GBA-WebEmulator/blob/main/gba-front/src/components/Profile.jsx)
>
> Este componente está dentro del modal de *"Perfil"* y muestra datos y estadísticas del usuario.
>
> [Settings.jsx <sub><sup>(ver)</sup></sub>](https://github.com/Curro85/GBA-WebEmulator/blob/main/gba-front/src/components/Settings.jsx)
>
> Este componente está dentro del modal *"Configuración"* y actualmente muestra los controles del emulador.
>
> [LoginForm.jsx <sub><sup>(ver)</sup></sub>](https://github.com/Curro85/GBA-WebEmulator/blob/main/gba-front/src/components/LoginForm.jsx)
>
> Este componente está dentro del modal de *"Iniciar sesión"* permite iniciar sesión en la web.
>
> [RegisterForm.jsx <sub><sup>(ver)</sup></sub>](https://github.com/Curro85/GBA-WebEmulator/blob/main/gba-front/src/components/RegisterForm.jsx)
>
> Este componente está dentro del modal de *"Registro"* y sirve para registrar a nuevos usuarios en la web.

En el siguiente apartado, llegó el momento, explicaremos el Emulador.
