import axios from 'axios'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
})

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
})

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token')
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

// Mensaje de error legible a partir de una respuesta de axios.
// 403 se traduce a un mensaje de permisos por defecto para no dejar la UI en silencio.
export const getErrorMessage = (err, fallback = 'Error desconocido') => {
    const status = err?.response?.status
    const serverMsg = err?.response?.data?.message
    if (status === 403) return serverMsg || 'No tenés permisos para realizar esta acción.'
    return serverMsg || (status ? `Error ${status}` : err?.message) || fallback
}

export const login = (userName, password) =>
    api.post('/auth/login', { userName, password })

export const uploadDocument = (formData) =>
    api.post('/documents/upload', formData)

export const getDocuments = () =>
    api.get('/documents')

export const deleteDocument = (id) =>
    api.delete(`/documents/${id}`)

export const askChat = (question, organizationId) =>
    api.post('/chat/ask', { question, organizationId })

// --- Usuario logueado ---
export const getCurrentUser = () =>
    api.get('/users/me')

export const updateCurrentUser = (data) =>
    api.put('/users/me', data)

export const updateCurrentUserPassword = (data) =>
    api.put('/users/me/password', data)

// --- Organización (branding del chatbot) ---
export const getOrganization = (id) =>
    api.get(`/organizations/${id}`)

export const updateOrganization = (id, data) =>
    api.put(`/organizations/${id}`, data)

// --- Configuración de IA de la organización (y, opcionalmente, por área) ---
export const getActiveAISettings = (organizationId) =>
    api.get(`/aisettings/active/${organizationId}`)

export const getAISettingsByOrganization = (organizationId) =>
    api.get(`/aisettings/organization/${organizationId}`)

// Lista todas las configuraciones (organización + por área) de la organización del admin logueado.
export const getAllAISettings = () =>
    api.get('/aisettings')

export const createAISettings = (data) =>
    api.post('/aisettings', data)

export const updateAISettings = (id, data) =>
    api.patch(`/aisettings/${id}`, data)

// --- Miembros de la organización ---
export const getUsers = () =>
    api.get('/users')

export const getUsersByArea = (areaId) =>
    api.get(`/users/area/${areaId}`)

export const createUser = (data) =>
    api.post('/users', data)

// --- Roles y áreas (para selects de administración) ---
export const getRoles = () =>
    api.get('/roles')

export const getAreas = () =>
    api.get('/areas')

export default api
