# Conclusión

Aquí dejaré mis conclusiones del proyecto, que trabajo he realizado, los problemas y cambios, y las mejoras
que podría hacer al proyecto.

## Trabajo realizado

> - Como se puede observar en la documentación, he realizado una *API* en `Flask`, usando una base de datos PostgreSQL
> con el ORM *SQLAlchemy*.
> 
> - También he realizado un frontend con `React` y `Vite` para crear una *SPA* para el emulador, dejando así
> una sola página con varios componentes cada uno con sus funciones.
> 
> - Por otra parte he aprendido y aplicado `TailwindCSS`, integrado `IA` con la *API de Google (Gemini)* y también
> he aprendido un poco de como compila `WebAssembly` y las funciones de gestión de ficheros en *IndexedDB* para
> navegadores.
> 
> - Por último ambas aplicaciones están dockerizadas, con `Nginx` para reverse proxy, `Certbot` para los certificados
> de *Let's Encrypt* y así tener conexión segura, todo listo para desplegar en plataformas como `AWS` en una
> instancia EC2.

## Problemas encontrados

> - El primer problema que encontré fue tener un emulador adaptado a `JavaScript` como mínimo, ya que sino
> supondría tener que compilar uno por mi cuenta, cosa que no tengo los conocimientos necesarios actualmente.
> Pero por suerte encontré un emulador de la mano de [thenick775](https://github.com/thenick775/mgba/tree/feature/wasm#readme)
> que he usado para mi web.
>
> - Otro problema que me surgió fue configurar `Nginx` con *headers* y *MIME types* necesarios para poder transmitir ficheros
> de un tamaño superior al de por defecto de `Nginx` y que también gestionara los tokens de sesión, pero se pudo solucionar
> buscando por internet distintos tipos de soluciones (StackOverflow tiene post muy antiguos...).
>
> - También tuve un problema a la hora de subir ficheros de guardado y ROMs desde navegador a un disco en la instancia
> de `AWS`, debido a las rutas que se guardaban en base de datos, esta vez use la documentación de `Flask`, ya que
> tiene una libreria propia para gestionar rutas a ficheros.
>
> - Por último tuve un problema a la hora de conectar el gamepad y recibir los inputs de forma correcta, por suerte
> en la documentación de [Gamepad_API](https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API) venía la 
> solución a mi problema.

## Modificaciones

> El proyecto en principio solo iba a ser el emulador, gestión de usuarios y guardar tus partidas, pero conforme
> fui realizando el proyecto, fui viendo mas posibilidades de añadirle cosas que lo hicieran destacar, como por
> ejemplo la posibilidad de usar un mando de consola, tener una IA como guía de videojuegos y también el permitir
> subir ROMs de juegos.

## Futuras mejoras

> Como futuras mejoras al proyecto tengo las siguientes:
> 
> - Añadir controles para móviles y tablets.
> 
> - Añadir personalización de perfiles y categoría de perfiles.
> 
> - Añadir temas al emulador, que cambién la interfaz según el tema seleccionado.
> 
> - Añadir soporte a juego multijugador.
> 
> - Rediseñar modales para que tengan efectos mas suaves.
> 
> - Mejorar los tiempos de subida y carga de ROMs.

Para abacar te dejo una bibliografía en el siguiente apartado para que consultes
los recursos utilizados en este proyecto.