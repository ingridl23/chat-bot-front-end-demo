import { useTheme } from '../context/ThemeContext'
import { IconSun, IconMoon } from './icons'

// Toggle segmentado Claro / Oscuro.
// Los colores del estado activo salen de las variables --tg-*,
// que se resuelven solas según el tema, sin lógica extra.
export default function ThemeToggle({ className = '' }) {
  const { theme, setTheme } = useTheme()

  return (
    <div
      className={`flex items-center rounded-[10px] p-[3px] gap-[2px] ${className}`}
      style={{ background: 'var(--panel-2)' }}
    >
      <button
        type="button"
        onClick={() => setTheme('light')}
        aria-pressed={theme === 'light'}
        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg text-[11.5px] font-semibold cursor-pointer transition"
        style={{
          background: 'var(--tg-light-bg)',
          color: 'var(--tg-light-fg)',
          boxShadow: 'var(--tg-light-sh)',
        }}
      >
        <IconSun /> Claro
      </button>
      <button
        type="button"
        onClick={() => setTheme('dark')}
        aria-pressed={theme === 'dark'}
        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg text-[11.5px] font-semibold cursor-pointer transition"
        style={{
          background: 'var(--tg-dark-bg)',
          color: 'var(--tg-dark-fg)',
          boxShadow: 'var(--tg-dark-sh)',
        }}
      >
        <IconMoon /> Oscuro
      </button>
    </div>
  )
}
