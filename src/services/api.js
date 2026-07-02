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
        if (error.response.status === 401 || error.response.status === 403) {
            localStorage.removeItem('token')
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

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

export const updateUser = (id, data) =>
    api.put(`/users/${id}`, data)

// --- Organización (branding del chatbot) ---
export const getOrganization = (id) =>
    api.get(`/organizations/${id}`)

export const updateOrganization = (id, data) =>
    api.put(`/organizations/${id}`, data)

// --- Configuración de IA de la organización ---
export const getActiveAISettings = (organizationId) =>
    api.get(`/aisettings/active/${organizationId}`)

export const createAISettings = (data) =>
    api.post('/aisettings', data)

export const updateAISettings = (id, data) =>
    api.patch(`/aisettings/${id}`, data)

// --- Miembros de la organización ---
export const getUsers = () =>
    api.get('/users')

export default api