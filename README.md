# Rediseño visual — dirección "Graphite"

Port del rediseño (gris cálido, corporativo, tema claro/oscuro, íconos SVG) a tus
componentes React reales. **Solo cambia lo visual**: se conserva toda tu lógica
(react-query, axios, react-router, control de inactividad, localStorage).

## Cómo integrarlo

Copiá el contenido de esta carpeta `src/` sobre el `src/` de tu repo
`chat-bot-front-end-demo`. Se respeta tu estructura, así que es reemplazo directo:

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

No cambian dependencias ni `package.json`. Corré `npm run dev` como siempre.

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
