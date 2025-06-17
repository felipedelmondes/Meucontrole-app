// src/services/api.js
// Serviço central para requisições HTTP

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5041/api';

// Função para salvar e obter o token JWT
defineTokenHelpers();

function defineTokenHelpers() {
  // Salva o token no localStorage
  window.saveToken = (token) => {
    localStorage.setItem('jwt_token', token);
  };
  // Obtém o token do localStorage
  window.getToken = () => {
    return localStorage.getItem('jwt_token');
  };
  // Remove o token do localStorage
  window.removeToken = () => {
    localStorage.removeItem('jwt_token');
  };
}

export async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = window.getToken && window.getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  try {
    const response = await fetch(url, {
      headers,
      ...options,
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Erro na requisição');
    }
    return response.json();
  } catch (err) {
    if (err instanceof TypeError) {
      throw new Error('Não foi possível conectar ao servidor. Verifique sua conexão ou se o backend está online.');
    }
    throw err;
  }
}

// Função para login
export async function login(username, senha) {
  const data = await apiRequest('/Login', {
    method: 'POST',
    body: JSON.stringify({ username, senha }),
  });
  if (data.token) {
    window.saveToken(data.token);
  }
  return data;
}

export { API_BASE_URL };
