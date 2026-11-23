import axios from 'axios'

export const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
  withXSRFToken: true,
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    Accept: 'application/json',
  },
})

export async function ensureCsrf() {
  await axios.get('/sanctum/csrf-cookie', { withCredentials: true })
}
