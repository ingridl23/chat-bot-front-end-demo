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
        if (error.response ? .status === 401 || error.response ? .status === 403) {
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

export const askChat = (question, organizationId) =>
    api.post('/chat/ask', { question, organizationId })

export default api