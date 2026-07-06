// El backend guarda el saludo y el tono del chat en un único campo systemPrompt (AISettings):
// estos marcadores permiten separarlos como dos campos en la UI y reunirlos de vuelta al guardar.
export const SALUDO_MARKER = '[SALUDO]'
export const INSTRUCCIONES_MARKER = '[INSTRUCCIONES]'

export function splitPrompt(systemPrompt) {
  if (!systemPrompt) return { greeting: '', tone: '' }
  const saludoIdx = systemPrompt.indexOf(SALUDO_MARKER)
  const instrIdx = systemPrompt.indexOf(INSTRUCCIONES_MARKER)
  if (saludoIdx === -1 || instrIdx === -1) {
    return { greeting: '', tone: systemPrompt }
  }
  return {
    greeting: systemPrompt.slice(saludoIdx + SALUDO_MARKER.length, instrIdx).trim(),
    tone: systemPrompt.slice(instrIdx + INSTRUCCIONES_MARKER.length).trim(),
  }
}

export function joinPrompt(greeting, tone) {
  return `${SALUDO_MARKER}\n${greeting.trim()}\n\n${INSTRUCCIONES_MARKER}\n${tone.trim()}`
}
