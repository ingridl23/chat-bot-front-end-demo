Chatbot Inteligente con IA Generativa — Full Stack Developer

Desarrollo de una aplicación web de chatbot inteligente basada en arquitectura Full Stack, implementando un backend robusto con Java 17 y Spring Boot, y un frontend moderno con React + Vite.

El sistema integra modelos de inteligencia artificial mediante la API de Groq, permitiendo procesamiento de lenguaje natural y generación de respuestas contextuales. Se implementó una arquitectura RAG (Retrieval-Augmented Generation) utilizando Spring AI y PostgreSQL con extensión pgvector para almacenamiento y búsqueda semántica de documentos mediante embeddings.

En el backend se desarrolló una API REST segura utilizando Spring Security, autenticación mediante JWT (JSON Web Tokens) y control de acceso basado en roles y permisos. Se implementaron módulos para gestión de usuarios, organizaciones, áreas, documentos, configuraciones de IA y consultas conversacionales.

El frontend fue desarrollado con React, Vite y npm, consumiendo la API REST mediante Axios, incorporando manejo de autenticación, almacenamiento de tokens, protección de rutas y una interfaz dinámica para interacción con el asistente virtual.

El proyecto fue desplegado en infraestructura cloud utilizando Render para el backend y frontend, junto con una base de datos PostgreSQL administrada en Neon, configurando variables de entorno, conexión segura y ambientes de producción.

Tecnologías utilizadas:

Java 17
Spring Boot 3
Spring Security + JWT
Spring Data JPA / Hibernate
Spring AI
Groq API (LLM)
PostgreSQL + pgvector
React
Vite
npm
Axios
Git/GitHub
Render
Neon PostgreSQL

```
src/
├── index.css                 (reemplaza — ahora define tokens + tema)
├── main.jsx                  (igual que el tuyo)
├── App.jsx                   (reemplaza — envuelve todo en <ThemeProvider>)
├── context/
│   └── ThemeContext.jsx      (NUEVO — estado del tema + persistencia)
├── components/
│   ├── icons.jsx             (NUEVO — íconos de línea SVG)
│   ├── ThemeToggle.jsx       (NUEVO — toggle Claro/Oscuro reutilizable)
│   └── Layout.jsx            (reemplaza)
├── pages/
│   ├── Login.jsx             (reemplaza)
│   ├── Dashboard.jsx         (reemplaza)
│   ├── Documents.jsx         (reemplaza)
│   └── Chat.jsx              (reemplaza)
└── services/
    └── api.js                (igual que el tuyo)
```

## Cómo funciona el tema claro/oscuro

- Los colores viven como **variables CSS** en `index.css`: `:root` (claro) y
  `[data-theme="dark"]` (oscuro).
- `ThemeContext` setea el atributo `data-theme` en `<html>` y lo persiste en
  `localStorage` (clave `theme`).
- Los componentes usan utilidades arbitrarias de Tailwind v4 que referencian esas
  variables, p. ej. `bg-[var(--panel)]`, `text-[var(--text-2)]`. Al cambiar de
  tema, todo se re-colorea solo.

### Paleta (tokens)

| Token              | Claro     | Oscuro    | Uso                          |
|--------------------|-----------|-----------|------------------------------|
| `--bg`             | `#f6f5f3` | `#1c1b19` | Fondo de la app              |
| `--panel`          | `#ffffff` | `#252320` | Tarjetas, sidebar, inputs    |
| `--panel-2`        | `#efece7` | `#2f2c28` | Burbuja del bot, hovers       |
| `--border-strong`  | `#e7e4df` | `#3a352f` | Bordes de tarjetas/inputs    |
| `--text`           | `#2b2926` | `#eae7e1` | Texto principal              |
| `--text-2`         | `#6f6a62` | `#b3ada4` | Texto secundario             |
| `--muted`          | `#a39d94` | `#7a746b` | Texto tenue / placeholders   |
| `--accent`         | `#2b2926` | `#eae7e1` | Botones, nav activo, burbuja del usuario |
| `--accent-text`    | `#ffffff` | `#1c1b19` | Texto sobre el acento        |

## Notas

- **Tipografía:** Hanken Grotesk (UI) + IBM Plex Mono (`font-mono`, para nombres de
  archivo/metadatos). Se cargan desde Google Fonts vía `@import` en `index.css`.
- **Íconos:** los emoji se reemplazaron por componentes SVG en `components/icons.jsx`.
- **Chat:** si tu endpoint `/chat/ask` devuelve un campo `source` en la respuesta,
  se muestra automáticamente como "chip de fuente" bajo la respuesta del bot. Si no
  lo devuelve, simplemente no aparece (no rompe nada).
- **Inactividad:** se mantiene tal cual (10 min → aviso con cuenta regresiva de 60 s).
