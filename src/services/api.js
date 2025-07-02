// src/services/api.js
// Serviço central para requisições HTTP

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:7026/api';

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
    
    // Primeiro tente obter o corpo da resposta como JSON
    let responseData = {};
    if (response.headers.get('content-length') !== '0') {
      try {
        responseData = await response.json();
      } catch {
        // Se não for JSON, continua com objeto vazio
      }
    }
    
    // Trata os status codes específicos
    if (response.status === 200) {
      // Ok (200) para sucesso
      return responseData;
    } else if (response.status === 400) {
      // BadRequest (400) para usuário inválido
      throw new Error(responseData.message || 'Dados inválidos. Verifique as informações e tente novamente.');
    } else if (response.status === 409) {
      // Conflict (409) caso o usuário já exista ou ocorra erro
      throw new Error(responseData.message || 'Usuário já existe ou ocorreu um conflito.');
    } else if (!response.ok) {
      // Outros erros
      throw new Error(responseData.message || `Erro na requisição: ${response.status}`);
    }
    
    return responseData;
  } catch (err) {
    if (err instanceof TypeError) {
      throw new Error('Não foi possível conectar ao servidor. Verifique sua conexão ou se o backend está online.');
    }
    throw err;
  }
}

// Função auxiliar para verificar e lidar com o erro 404 no login
export async function checkAndFixLoginEndpoint() {
  console.log('Verificando endpoint de login...');
  console.log('URL Base atual:', API_BASE_URL);
  
  // Lista de possíveis endpoints para o login
  const possibleEndpoints = [
    '/usuario/login',  // Endpoint correto
    '/Login',
    '/login',
    '/auth/login',
    '/authenticate',
    '/token',
    '/users/login',
    '/api/login',  // Caso o API_BASE_URL já inclua /api
    '/auth'
  ];
  
  // Se o esquema é https, tentar http também
  const alternativeBaseUrl = API_BASE_URL.replace('https://', 'http://');
  
  // Status dos testes
  const results = [];
  let workingEndpoint = null;
  
  // Testar os endpoints com a URL base padrão
  console.log('Testando endpoints com URL base:', API_BASE_URL);
  for (const endpoint of possibleEndpoints) {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      console.log(`Testando endpoint: ${url}`);
      
      const response = await fetch(url, {
        method: 'OPTIONS', // Usar OPTIONS para não interferir no sistema
        headers: { 'Content-Type': 'application/json' }
      });
      
      const status = response.status;
      const result = { endpoint, url, status };
      results.push(result);
      console.log('Resultado:', result);
      
      // Se não é 404, pode ser um endpoint válido
      if (status !== 404) {
        workingEndpoint = endpoint;
        console.log('Endpoint potencialmente válido encontrado:', endpoint);
        break;
      }
    } catch (error) {
      console.log('Erro ao testar endpoint:', endpoint, error);
    }
  }
  
  // Se nada funcionou com a URL base padrão, tentar com a URL alternativa
  if (!workingEndpoint && alternativeBaseUrl !== API_BASE_URL) {
    console.log('Testando endpoints com URL alternativa:', alternativeBaseUrl);
    for (const endpoint of possibleEndpoints) {
      try {
        const url = `${alternativeBaseUrl}${endpoint}`;
        console.log(`Testando endpoint alternativo: ${url}`);
        
        const response = await fetch(url, {
          method: 'OPTIONS',
          headers: { 'Content-Type': 'application/json' }
        });
        
        const status = response.status;
        const result = { endpoint, url, status, alternativeBase: true };
        results.push(result);
        console.log('Resultado (alternativo):', result);
        
        // Se não é 404, pode ser um endpoint válido
        if (status !== 404) {
          workingEndpoint = { endpoint, alternativeBaseUrl };
          console.log('Endpoint alternativo potencialmente válido:', endpoint);
          break;
        }
      } catch (error) {
        console.log('Erro ao testar endpoint alternativo:', endpoint, error);
      }
    }
  }
  
  return { results, workingEndpoint };
}

// Função para login
export async function login(username, senha) {
  try {
    // Tentar login com o endpoint padrão
    const data = await apiRequest('/usuario/login', {
      method: 'POST',
      body: JSON.stringify({ username, senha }),
    });
    if (data.token) {
      window.saveToken(data.token);
    }
    return data;
  } catch (error) {
    // Se for erro 404, o endpoint pode estar errado
    if (error.message && error.message.includes('404')) {
      console.error('Erro 404 no login. Endpoint incorreto.');
      
      // Tentar verificar o endpoint correto (opcionalmente)
      try {
        const { workingEndpoint } = await checkAndFixLoginEndpoint();
        if (workingEndpoint) {
          console.log('Encontrado possível endpoint de login:', workingEndpoint);
          
          // Se for um objeto com URL alternativa
          if (typeof workingEndpoint === 'object') {
            const alternativeUrl = `${workingEndpoint.alternativeBaseUrl}${workingEndpoint.endpoint}`;
            alert(`O endpoint de login pode estar em: ${alternativeUrl}\nAtualize a configuração da API.`);
          } else {
            // Tentar novamente com o endpoint encontrado
            console.log('Tentando novamente com o endpoint:', workingEndpoint);
            const data = await apiRequest(workingEndpoint, {
              method: 'POST',
              body: JSON.stringify({ username, senha }),
            });
            if (data.token) {
              window.saveToken(data.token);
              return data;
            }
          }
        }
      } catch (checkError) {
        console.error('Erro ao verificar endpoints alternativos:', checkError);
      }
      
      // Se chegou aqui, não conseguiu resolver automaticamente
      throw new Error(`Erro 404: Endpoint de login não encontrado. Verifique a configuração da API em ${API_BASE_URL}`);
    }
    
    // Outros erros são repassados normalmente
    throw error;
  }
}

// Função para buscar usuários
export async function getUsuarios() {
  return await apiRequest('/usuario/GetUsuarios');
}

// Função para buscar todos os clientes
export async function getAllClientes() {
  return await apiRequest('/Cliente/ListarClientes');
}

// Função para adicionar um novo cliente
export async function addCliente(clienteData) {
  return await apiRequest('/Cliente/Adicionar', {
    method: 'POST',
    body: JSON.stringify(clienteData)
  });
}

// Função para editar um cliente
export async function editCliente(id, clienteData) {
  return await apiRequest(`/Cliente/Editar?id=${id}`, {
    method: 'PUT',
    body: JSON.stringify(clienteData)
  });
}

// Função para criar um novo usuário
export async function createUsuario(userData) {
  try {
    // Criar a URL completa
    const url = `${API_BASE_URL}/usuarios/AdicionaUsuario`;
    
    const token = window.getToken && window.getToken();
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Fazer a requisição
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(userData),
    });
    
    // Tentar obter o corpo da resposta como JSON
    let responseData = {};
    try {
      const responseText = await response.text();
      if (responseText) {
        responseData = JSON.parse(responseText);
      }
    } catch (e) {
      console.error('Erro ao parsear resposta:', e);
    }
    
    // Verificar o status da resposta
    if (response.status === 200) {
      return responseData;
    } else if (response.status === 400) {
      throw new Error('Dados de usuário inválidos. Verifique os campos e tente novamente.');
    } else if (response.status === 409) {
      throw new Error('Este nome de usuário já está em uso. Por favor, escolha outro.');
    } else {
      throw new Error(`Erro ao criar usuário: ${responseData.message || response.statusText || 'Falha na requisição'}`);
    }
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    throw error;
  }
}

// Funções para gerenciamento de produtos

// Função para buscar todos os produtos
export async function getAllProducts() {
  return await apiRequest('/Produto/ListarProdutos');
}

// Função para adicionar um novo produto
export async function addProduct(productData) {
  return await apiRequest('/Produto/Adicionar', {
    method: 'POST',
    body: JSON.stringify(productData)
  });
}

// Função para editar um produto
export async function editProduct(id, productData) {
  return await apiRequest(`/Produto/Editar?id=${id}`, {
    method: 'PUT',
    body: JSON.stringify(productData)
  });
}

// Função para excluir um produto
export async function deleteProduct(id) {
  return await apiRequest(`/Produto/Deletar?id=${id}`, {
    method: 'DELETE'
  });
}

export { API_BASE_URL };
