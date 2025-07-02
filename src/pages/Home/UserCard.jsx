import React, { useState, useEffect } from 'react';
import './UserCard.css';
import { FaPlus, FaTrash, FaEdit, FaUserAlt } from 'react-icons/fa';
import { getUsuarios, createUsuario } from '../../services/api';

export default function UserCard({ visible, onClose }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [showNewUserForm, setShowNewUserForm] = useState(false);
  const [newUser, setNewUser] = useState({ 
    usuario: '', 
    email: '', 
    senha: '', 
    nomeCompleto: '',
    perfil: 'usuario'
  });

  // Buscar usuários da API quando o componente for montado
  useEffect(() => {
    if (visible) {
      fetchUsuarios();
    }
  }, [visible]);

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      const usuariosData = await getUsuarios();
      setUsers(usuariosData || []);
      setError(null);
    } catch (err) {
      console.error("Erro ao buscar usuários:", err);
      setError(err.message || "Não foi possível carregar os usuários");
    } finally {
      setLoading(false);
    }
  };

  // Validar o formulário antes de enviar
  const validateForm = () => {
    if (!newUser.usuario.trim()) {
      setError("O nome de usuário é obrigatório.");
      return false;
    }
    if (!newUser.email.trim()) {
      setError("O email é obrigatório.");
      return false;
    } else {
      // Validação simples de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newUser.email)) {
        setError("Por favor, insira um email válido.");
        return false;
      }
    }
    if (!newUser.senha.trim()) {
      setError("A senha é obrigatória.");
      return false;
    }
    if (!newUser.nomeCompleto.trim()) {
      setError("O nome completo é obrigatório.");
      return false;
    }
    return true;
  };

  const handleAddUser = async (e) => {
    // Se houver um evento, evite o comportamento padrão
    if (e) {
      e.preventDefault();
    }
    
    // Validar o formulário antes de enviar
    if (!validateForm()) {
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Tentar criar o usuário na API
      await createUsuario(newUser);
      
      // Se for bem-sucedido, busque a lista atualizada de usuários
      await fetchUsuarios();
      
      // Mostrar mensagem de sucesso
      setSuccess(`Usuário ${newUser.usuario} cadastrado com sucesso!`);
      
      // Limpar o formulário e redefinir estados
      setNewUser({ 
        usuario: '', 
        email: '', 
        senha: '', 
        nomeCompleto: '',
        perfil: 'usuario'
      });
      setError(null); // Limpar qualquer erro anterior
      
      // Após 2 segundos, fechar o formulário e limpar a mensagem de sucesso
      setTimeout(() => {
        setShowNewUserForm(false);
        setSuccess(null);
      }, 2000);
    } catch (err) {
      console.error("Erro ao criar usuário:", err);
      setError(err.message || "Não foi possível criar o usuário. Verifique os dados e tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  // Método alternativo para cadastrar usuários, sem depender da API


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser({ ...newUser, [name]: value });
  };

  if (!visible) return null;

  return (
    <div className="user-card-overlay">
      <div className="user-card">
        <div className="user-card-header">
          <h2>
            <FaUserAlt style={{ marginRight: '8px' }} />
            Gerenciamento de Usuários
          </h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        
        <div className="user-card-content">
          {!showNewUserForm ? (
            <>
              <div className="user-actions">
                <button 
                  className="add-user-button" 
                  onClick={() => setShowNewUserForm(true)}
                >
                  <FaPlus /> Novo Usuário
                </button>
              </div>
              
              <div className="user-table-container">
                {loading ? (
                  <div className="loading-message">Carregando usuários...</div>
                ) : error ? (
                  <div className="error-message">
                    <p>{error}</p>
                    <button onClick={fetchUsuarios} className="retry-button">Tentar novamente</button>
                  </div>
                ) : (
                  <table className="user-table">
                    <thead>
                      <tr>
                        <th>Usuário</th>
                        <th>Email</th>
                        <th>Data de Cadastro</th>
                        <th>Status</th>
                        <th>Perfil</th>
                        <th>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.length > 0 ? users.map((user, index) => (
                        <tr key={index}>
                          <td>{user.usuario}</td>
                          <td>{user.email}</td>
                          <td>{user.dataCadastro}</td>
                          <td>
                            <span className={`status-badge ${user.status?.toLowerCase()}`}>
                              {user.status}
                            </span>
                          </td>
                          <td>{user.perfil}</td>
                          <td className="action-column">
                            <button className="icon-button edit">
                              <FaEdit />
                            </button>
                            <button className="icon-button delete">
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan="6" className="no-data-message">Nenhum usuário encontrado</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          ) : (
            <div className="new-user-form">
              <h3>Novo Usuário</h3>
              {error && (
                <div className="form-error-message">
                  <p>{error}</p>
                </div>
              )}
              {success && (
                <div className="form-success-message">
                  <p>{success}</p>
                </div>
              )}
              <form>
                <div className="form-group">
                  <label htmlFor="usuario">Usuário</label>
                  <input
                    type="text"
                    id="usuario"
                    name="usuario"
                    value={newUser.usuario}
                    onChange={handleInputChange}
                    required
                    placeholder="Nome de usuário para login"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="nomeCompleto">Nome Completo</label>
                  <input
                    type="text"
                    id="nomeCompleto"
                    name="nomeCompleto"
                    value={newUser.nomeCompleto}
                    onChange={handleInputChange}
                    required
                    placeholder="Nome completo do usuário"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={newUser.email}
                    onChange={handleInputChange}
                    required
                    placeholder="exemplo@email.com"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="senha">Senha</label>
                  <input
                    type="password"
                    id="senha"
                    name="senha"
                    value={newUser.senha}
                    onChange={handleInputChange}
                    required
                    placeholder="Senha para acesso"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="perfil">Perfil</label>
                  <select
                    id="perfil"
                    name="perfil"
                    value={newUser.perfil}
                    onChange={handleInputChange}
                  >
                    <option value="usuario">Usuário</option>
                    <option value="moderador">Moderador</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
                
                <div className="form-actions">
                  <button 
                    type="button" 
                    className="cancel-button"
                    onClick={() => {
                      setShowNewUserForm(false);
                      setError(null);
                      setSuccess(null);
                    }}
                    disabled={submitting}
                  >
                    Cancelar
                  </button>
                  <button 
                    type="button" 
                    className="submit-button"
                    id="save-user-button"
                    onClick={handleAddUser}
                    disabled={submitting}
                  >
                    {submitting ? "Salvando..." : "Salvar"}
                  </button>

                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
