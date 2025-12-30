export const API_BASE = 'https://api.didin.in/api';


export function authFetch(url, opts = {}) {
const token = localStorage.getItem('didin_token');
const headers = opts.headers || {};
if (token) headers['Authorization'] = `Bearer ${token}`;
headers['Accept'] = 'application/json';
return fetch(API_BASE + url, {...opts, headers});
}