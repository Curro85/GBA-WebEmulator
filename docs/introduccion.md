# Introducción

El objetivo de este proyecto es desarrollar un emulador web de **Game Boy Advance (GBA)**
que permite a los usuarios jugar a sus juegos directamente en navegador, sin necesidad de
configuraciones excesivas.

## Características

- **Emulador GBA**: Compilado a WebAssembly
  por [thenick775](https://github.com/thenick775/mgba/tree/feature/wasm#readme).
- **API**: Realizada con `Flask`, con endpoints para gestionar las ROMs,
  partidas guardadas y usuarios.
- **Frontend**: Realizado con `React` y `Vite` con la intención de crear una SPA
  moderna y fácil de usar.
- **Reverse-proxy**: Usando `Nginx` con SSL.
- **Gemini**: Inteligencia artificial con `Gemini` de `Google`.
- **Despliegue**: Realizado en la plataforma `AWS`, con contenedores `Docker`.

## Tecnologías utilizadas

En este proyecto he utilizado las siguientes tecnologías:

- **Flask**: Con la idea de crear una API con los recursos justos y necesarios para mejor
  rendimiento en la web.
- **React + Vite**: Como quiero mantener el foco en el emulador, la idea de una SPA me parecía
  la mas correcta, por eso he utilizado React para mantener funcionalidades de forma asíncrona
  sin necesidad de usar páginas adicionales.
- **IA**: Con Gemini he introducido inteligencia artificial como guía de videojuegos.
- **Docker**: Con docker he podido contenedorizar la aplicación para desplegarlo en servicios
  serverless como AWS pudiendo automatizar el proceso.
- **Nginx**: Con Nginx junto a Let's Encrypt conseguimos tener un proxy inverso que redirige
  siempre a HTTPS para tener conexión segura.
- **TailwindCSS**: Para el diseño he usado Tailwind que es un framework similar a Bootstrap
  pero que permite mucha mas personalización.
- **AWS**: A través de una instancia EC2 que contiene el proyecto en una imagen docker realizo
  el último paso para tener la aplicación desplegada y servida por un dominio web.

## Estructura del proyecto

La estructura del proyecto consiste en dos aplicaciones, `gba-api` que es la API en `Flask`
y `gba-front`, que es el frontend en `React con Vite`.

```
gba-api/
|-- docs/
|-- Dockerfile
|-- app.py
|-- config.py
|-- models.py
|-- requirements.txt
|-- utils.py
|-- validators.py
gba-front/
|-- public/
|-- src/
|-- Dockerfile
|-- eslint.config.js
|-- index.html
|-- package-lock.json
|-- package.json
|-- vite.config.js
README.md
docker-compose.yml
```

En el siguiente apartado profundizaremos en la API.