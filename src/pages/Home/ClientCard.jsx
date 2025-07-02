import React, { useState, useEffect } from 'react';
import './ClientCard.css';
import { FaPlus, FaTrash, FaEdit, FaUserFriends, FaSave } from 'react-icons/fa';
import { getAllClientes, editCliente, addCliente } from '../../services/api';

export default function ClientCard({ visible, onClose }) {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [currentClient, setCurrentClient] = useState(null);
  const [formData, setFormData] = useState({
    nome_cliente: '',
    telefone: '',
    email: '',
    observacao: ''
  });
  
  // Estados para validação e feedback visual
  const [fieldErrors, setFieldErrors] = useState({});
  const [formTouched, setFormTouched] = useState(false);
  
  // Estado para o formulário de novo cliente
  const [newClientData, setNewClientData] = useState({
    nome_cliente: '',
    telefone: '',
    email: '',
    observacao: ''
  });
  
  // Estados para validação do formulário de novo cliente
  const [newClientErrors, setNewClientErrors] = useState({});
  const [newClientFormTouched, setNewClientFormTouched] = useState(false);
  
  // Buscar clientes da API quando o componente for montado
  useEffect(() => {
    if (visible) {
      fetchClientes();
    }
  }, [visible]);

  const fetchClientes = async () => {
    try {
      setLoading(true);
      setSuccess(null);
      const clientesData = await getAllClientes();
      console.log("Dados retornados da API:", clientesData);
      
      if (Array.isArray(clientesData)) {
        setClients(clientesData);
        console.log(`${clientesData.length} clientes carregados com sucesso.`);
        setError(null);
        setSuccess(`${clientesData.length} cliente(s) carregado(s) com sucesso!`);
        // O sucesso é mostrado por 3 segundos e depois desaparece
        setTimeout(() => setSuccess(null), 3000);
      } else {
        console.warn("A resposta da API não é um array:", clientesData);
        setClients([]);
        setError("Formato de resposta inesperado. Por favor, tente novamente.");
      }
    } catch (err) {
      console.error("Erro ao buscar clientes:", err);
      setError(err.message || "Não foi possível carregar os clientes");
    } finally {
      setLoading(false);
    }
  };

  // Manipula a edição de um cliente
  const handleEditClient = (client) => {
    // Reseta estados de validação
    setFieldErrors({});
    setFormTouched(false);
    
    // Formata o telefone ao carregar o formulário
    let formattedPhone = client.telefone || '';
    if (formattedPhone) {
      const phoneDigits = formattedPhone.replace(/\D/g, '');
      
      if (phoneDigits.length === 10) {
        formattedPhone = `(${phoneDigits.slice(0,2)}) ${phoneDigits.slice(2,6)}-${phoneDigits.slice(6)}`;
      } else if (phoneDigits.length === 11) {
        formattedPhone = `(${phoneDigits.slice(0,2)}) ${phoneDigits.slice(2,7)}-${phoneDigits.slice(7)}`;
      }
    }
    
    // Define dados do cliente atual
    setCurrentClient(client);
    setFormData({
      nome_cliente: client.nome_cliente || '',
      telefone: formattedPhone,
      email: client.email || '',
      observacao: client.observacoes || ''  // Note que a API usa 'observacao' mas o retorno tem 'observacoes'
    });
    
    // Exibe o formulário
    setShowEditForm(true);
  };

  // Validação de campos
  const validateForm = () => {
    const errors = {};
    
    if (!formData.nome_cliente.trim()) {
      errors.nome_cliente = 'O nome do cliente é obrigatório';
    }
    
    if (formData.telefone.trim() && !(/^\d{10,11}$/.test(formData.telefone.replace(/\D/g, '')))) {
      errors.telefone = 'Formato de telefone inválido';
    }
    
    if (formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        errors.email = 'Formato de email inválido';
      }
    }
    
    return errors;
  };

  // Atualiza o estado do formulário quando os campos são alterados
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    
    // Formata telefone automaticamente enquanto digita
    if (name === 'telefone') {
      const numbers = value.replace(/\D/g, '').slice(0, 11); // Limita a 11 dígitos
      
      if (numbers) {
        if (numbers.length <= 10) {
          newValue = numbers
            .replace(/(\d{2})/, '($1) ')
            .replace(/(\d{4})(\d)/, '$1-$2');
        } else {
          newValue = numbers
            .replace(/(\d{2})/, '($1) ')
            .replace(/(\d{5})(\d)/, '$1-$2');
        }
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
    
    // Marca o formulário como tocado para ativar validações visuais
    if (!formTouched) {
      setFormTouched(true);
    }
    
    // Valida o campo atual quando o usuário digita
    if (formTouched) {
      const fieldValidation = {};
      
      // Validação específica para cada campo
      if (name === 'nome_cliente' && !newValue.trim()) {
        fieldValidation.nome_cliente = 'O nome do cliente é obrigatório';
      }
      
      if (name === 'telefone' && newValue.trim()) {
        const digits = newValue.replace(/\D/g, '');
        if (digits.length < 10 || digits.length > 11) {
          fieldValidation.telefone = 'Telefone deve ter 10 ou 11 dígitos';
        }
      }
      
      if (name === 'email' && newValue) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newValue)) {
          fieldValidation.email = 'Formato de email inválido';
        }
      }
      
      // Atualiza apenas o erro do campo atual, mantendo os outros erros
      setFieldErrors(prev => ({
        ...prev,
        [name]: fieldValidation[name] || null
      }));
    }
  };

  // Salva as alterações do cliente
  const handleSaveEdit = async () => {
    try {
      // Valida o formulário antes de enviar
      const errors = validateForm();
      const hasErrors = Object.keys(errors).length > 0;
      
      if (hasErrors) {
        setFieldErrors(errors);
        return;
      }
      
      // Indica que está salvando
      setLoading(true);
      setError(null);
      
      // Verifica se há um cliente selecionado para edição
      if (!currentClient || !currentClient.id) {
        throw new Error('Cliente não identificado para edição.');
      }

      // Prepara os dados para envio à API
      const apiData = {
        nome_cliente: formData.nome_cliente.trim(),
        telefone: formData.telefone.replace(/\D/g, ''), // Remove formatação
        email: formData.email.trim(),
        observacao: formData.observacao.trim()
      };

      // Envia a requisição para a API
      await editCliente(currentClient.id, apiData);
      
      // Atualiza a lista de clientes após edição bem-sucedida
      await fetchClientes();
      
      // Fecha o formulário de edição
      setShowEditForm(false);
      setCurrentClient(null);
      setSuccess('Cliente atualizado com sucesso!');
      
      // O sucesso é mostrado por 3 segundos e depois desaparece
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Erro ao editar cliente:", err);
      setError(err.message || "Não foi possível editar o cliente");
    } finally {
      setLoading(false);
      
      // Reseta os estados de validação para o próximo uso
      setTimeout(() => {
        setFieldErrors({});
        setFormTouched(false);
      }, 300);
    }
  };

  // Valida o formulário de novo cliente
  const validateNewClientForm = () => {
    const errors = {};
    
    if (!newClientData.nome_cliente.trim()) {
      errors.nome_cliente = 'O nome do cliente é obrigatório';
    }
    
    if (newClientData.telefone.trim() && !(/^\d{10,11}$/.test(newClientData.telefone.replace(/\D/g, '')))) {
      errors.telefone = 'Formato de telefone inválido';
    }
    
    if (newClientData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newClientData.email)) {
        errors.email = 'Formato de email inválido';
      }
    }
    
    return errors;
  };
  
  // Manipula mudanças nos campos do formulário de novo cliente
  const handleNewClientInputChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    
    // Formata telefone automaticamente enquanto digita
    if (name === 'telefone') {
      const numbers = value.replace(/\D/g, '').slice(0, 11); // Limita a 11 dígitos
      
      if (numbers) {
        if (numbers.length <= 10) {
          newValue = numbers
            .replace(/(\d{2})/, '($1) ')
            .replace(/(\d{4})(\d)/, '$1-$2');
        } else {
          newValue = numbers
            .replace(/(\d{2})/, '($1) ')
            .replace(/(\d{5})(\d)/, '$1-$2');
        }
      }
    }
    
    setNewClientData(prev => ({
      ...prev,
      [name]: newValue
    }));
    
    // Marca o formulário como tocado para ativar validações visuais
    if (!newClientFormTouched) {
      setNewClientFormTouched(true);
    }
    
    // Valida o campo atual quando o usuário digita
    if (newClientFormTouched) {
      const fieldValidation = {};
      
      // Validação específica para cada campo
      if (name === 'nome_cliente' && !newValue.trim()) {
        fieldValidation.nome_cliente = 'O nome do cliente é obrigatório';
      }
      
      if (name === 'telefone' && newValue.trim()) {
        const digits = newValue.replace(/\D/g, '');
        if (digits.length < 10 || digits.length > 11) {
          fieldValidation.telefone = 'Telefone deve ter 10 ou 11 dígitos';
        }
      }
      
      if (name === 'email' && newValue) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newValue)) {
          fieldValidation.email = 'Formato de email inválido';
        }
      }
      
      // Atualiza apenas o erro do campo atual, mantendo os outros erros
      setNewClientErrors(prev => ({
        ...prev,
        [name]: fieldValidation[name] || null
      }));
    }
  };
  
  // Função para adicionar novo cliente
  const handleAddClient = async () => {
    try {
      // Valida o formulário antes de enviar
      const errors = validateNewClientForm();
      const hasErrors = Object.keys(errors).length > 0;
      
      if (hasErrors) {
        setNewClientErrors(errors);
        return;
      }
      
      // Indica que está salvando
      setLoading(true);
      setError(null);
      
      // Prepara os dados para envio à API
      const apiData = {
        nome_cliente: newClientData.nome_cliente.trim(),
        telefone: newClientData.telefone.replace(/\D/g, ''), // Remove formatação
        email: newClientData.email.trim(),
        observacao: newClientData.observacao.trim()
      };
      
      // Envia a requisição para a API
      await addCliente(apiData);
      
      // Limpa o formulário
      setNewClientData({
        nome_cliente: '',
        telefone: '',
        email: '',
        observacao: ''
      });
      
      // Fecha o formulário de adição
      setShowNewClientForm(false);
      
      // Atualiza a lista de clientes
      await fetchClientes();
      
      // Exibe mensagem de sucesso
      setSuccess('Cliente adicionado com sucesso!');
      
      // O sucesso é mostrado por 3 segundos e depois desaparece
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Erro ao adicionar cliente:", err);
      setError(err.message || "Não foi possível adicionar o cliente");
    } finally {
      setLoading(false);
      
      // Reseta os estados de validação para o próximo uso
      setTimeout(() => {
        setNewClientErrors({});
        setNewClientFormTouched(false);
      }, 300);
    }
  };

  // Renderizar mensagens de erro ou sucesso
  const renderMessages = () => {
    return (
      <>
        {error && (
          <div className="error-message">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '10px'}}>
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            {error}
          </div>
        )}
        {success && (
          <div className="success-message">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '10px'}}>
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            {success}
          </div>
        )}
      </>
    );
  };

  // Renderizar tabela de clientes
  const renderClientesTable = () => {
    if (loading) {
      return (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Carregando clientes...</p>
        </div>
      );
    }

    if (clients.length === 0) {
      return (
        <div className="empty-list-container">
          <p>Nenhum cliente cadastrado.</p>
          <button 
            className="reload-button" 
            onClick={fetchClientes}
          >
            Recarregar dados
          </button>
        </div>
      );
    }

    return (
      <table className="clients-table">
        <thead>
          <tr>
            <th className="client-name-col client-header-highlight">Nome do Cliente</th>
            <th className="client-phone-col">Telefone</th>
            <th className="client-email-col">Email</th>
            <th className="client-obs-col">Observações</th>
            <th className="client-actions-col">Ações</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client, index) => (
            <tr key={client.id || `client-${index}`}>
              <td className="client-name client-cell-text">{client.nome_cliente || 'Nome não informado'}</td>
              <td className="client-truncate client-cell-text">{client.telefone || 'Não informado'}</td>
              <td className="client-truncate client-cell-text">{client.email || 'Não informado'}</td>
              <td className="client-observation-truncate client-cell-text">
                {client.observacoes ? client.observacoes : <span className="empty-field">Sem observações</span>}
              </td>
              <td>
                <div className="client-actions">
                  <button 
                    className="client-action-button client-edit-button" 
                    title="Editar cliente"
                    onClick={() => handleEditClient(client)}
                  >
                    <FaEdit />
                  </button>
                  <button 
                    className="client-action-button client-delete-button" 
                    title="Excluir cliente"
                    onClick={() => console.log('Excluir cliente:', client)}
                  >
                    <FaTrash />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  if (!visible) return null;

  return (
    <div className="client-card-overlay">
      <div className="client-card high-contrast-text">
        <div className="client-card-header">
          <h2>
            <FaUserFriends /> Gerenciamento de Clientes
          </h2>
          <button onClick={onClose}>×</button>
        </div>
        
        <div className="client-card-content">
          {renderMessages()}
          
          {showNewClientForm ? (
            <div className="client-edit-form">
              <h3 className="edit-form-title">Novo Cliente</h3>
              <div className="edit-form-row">
                <div className="edit-form-group">
                  <label htmlFor="nome_cliente">Nome do Cliente</label>
                  <input 
                    type="text" 
                    id="nome_cliente" 
                    name="nome_cliente"
                    placeholder="Nome completo" 
                    value={newClientData.nome_cliente}
                    onChange={handleNewClientInputChange}
                    className={`edit-form-input ${newClientErrors.nome_cliente ? 'input-error' : ''}`}
                    autoFocus
                  />
                  {newClientErrors.nome_cliente && (
                    <div className="input-error-message">{newClientErrors.nome_cliente}</div>
                  )}
                </div>
                <div className="edit-form-group">
                  <label htmlFor="telefone">Telefone</label>
                  <input 
                    type="tel" 
                    id="telefone" 
                    name="telefone"
                    placeholder="(00) 00000-0000" 
                    value={newClientData.telefone}
                    onChange={handleNewClientInputChange}
                    className={`edit-form-input ${newClientErrors.telefone ? 'input-error' : ''}`}
                  />
                  {newClientErrors.telefone && (
                    <div className="input-error-message">{newClientErrors.telefone}</div>
                  )}
                </div>
              </div>

              <div className="edit-form-group">
                <label htmlFor="email">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email"
                  placeholder="email@exemplo.com" 
                  value={newClientData.email}
                  onChange={handleNewClientInputChange}
                  className={`edit-form-input ${newClientErrors.email ? 'input-error' : ''}`}
                />
                {newClientErrors.email && (
                  <div className="input-error-message">{newClientErrors.email}</div>
                )}
              </div>

              <div className="edit-form-group">
                <label htmlFor="observacao">Observações</label>
                <textarea 
                  id="observacao" 
                  name="observacao"
                  placeholder="Informações adicionais sobre o cliente" 
                  value={newClientData.observacao}
                  onChange={handleNewClientInputChange}
                  className="edit-form-textarea"
                ></textarea>
              </div>

              <div className="edit-form-buttons">
                <button 
                  type="button" 
                  className="cancel-button"
                  onClick={() => {
                    setShowNewClientForm(false);
                    setNewClientErrors({});
                    setNewClientData({
                      nome_cliente: '',
                      telefone: '',
                      email: '',
                      observacao: ''
                    });
                  }}
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button 
                  type="button" 
                  className={`save-button ${loading ? 'button-loading' : ''}`}
                  onClick={handleAddClient}
                  disabled={loading}
                >
                  <span className="button-text">{loading ? 'Salvando...' : 'Salvar'}</span>
                  {loading ? (
                    <span className="spinner-small"></span>
                  ) : (
                    <span className="button-arrow">➔</span>
                  )}
                </button>
              </div>
            </div>
          ) : showEditForm ? (
            <div className="client-edit-form">
              <h3 className="edit-form-title">Editar Cliente</h3>
              
              <div className="edit-form-row">
                <div className="edit-form-group">
                  <label htmlFor="nome_cliente">Nome do Cliente</label>
                  <input 
                    type="text" 
                    id="nome_cliente" 
                    name="nome_cliente"
                    value={formData.nome_cliente}
                    onChange={handleInputChange}
                    className={`edit-form-input ${fieldErrors.nome_cliente ? 'input-error' : ''}`}
                    autoFocus
                  />
                  {fieldErrors.nome_cliente && (
                    <div className="input-error-message">{fieldErrors.nome_cliente}</div>
                  )}
                </div>
                <div className="edit-form-group">
                  <label htmlFor="telefone">Telefone</label>
                  <input 
                    type="tel" 
                    id="telefone" 
                    name="telefone"
                    value={formData.telefone}
                    onChange={handleInputChange}
                    className={`edit-form-input ${fieldErrors.telefone ? 'input-error' : ''}`}
                    placeholder="(00) 00000-0000"
                  />
                  {fieldErrors.telefone && (
                    <div className="input-error-message">{fieldErrors.telefone}</div>
                  )}
                </div>
              </div>

              <div className="edit-form-group">
                <label htmlFor="email">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`edit-form-input ${fieldErrors.email ? 'input-error' : ''}`}
                  placeholder="email@exemplo.com"
                />
                {fieldErrors.email && (
                  <div className="input-error-message">{fieldErrors.email}</div>
                )}
              </div>

              <div className="edit-form-group">
                <label htmlFor="observacao">Observações</label>
                <textarea 
                  id="observacao" 
                  name="observacao"
                  value={formData.observacao}
                  onChange={handleInputChange}
                  className="edit-form-textarea"
                  placeholder="Informações adicionais sobre o cliente"
                ></textarea>
              </div>

              <div className="edit-form-buttons">
                <button 
                  type="button" 
                  className="cancel-button"
                  onClick={() => {
                    if (loading) return;
                    setShowEditForm(false);
                    setFieldErrors({});
                  }}
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button 
                  type="button" 
                  className={`save-button ${loading ? 'button-loading' : ''}`}
                  onClick={handleSaveEdit}
                  disabled={loading}
                >
                  <span className="button-text">{loading ? 'Salvando...' : 'Salvar'}</span>
                  {loading ? (
                    <span className="spinner-small"></span>
                  ) : (
                    <span className="button-arrow">➔</span>
                  )}
                </button>
              </div>
            </div>
          ) : (
            renderClientesTable()
          )}
        </div>

        <div className="client-card-actions">
          <div className="client-card-actions-left">
            <button 
              className="client-refresh-button"
              onClick={fetchClientes}
              disabled={loading}
            >
              Atualizar lista
            </button>
          </div>
          <div className="client-card-actions-right">
            <button 
              className="client-add-button"
              onClick={() => setShowNewClientForm(true)}
            >
              <FaPlus /> Novo Cliente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
