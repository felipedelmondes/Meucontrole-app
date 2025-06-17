import React, { useState } from 'react';
import './UserCard.css';
import { FaPlus, FaTrash, FaEdit, FaUserAlt } from 'react-icons/fa';

export default function UserCard({ visible, onClose }) {
  const [users, setUsers] = useState([
    { id: 1, name: 'Admin', email: 'admin@meucontrole.com', role: 'Administrador' },
    { id: 2, name: 'João Silva', email: 'joao@empresa.com', role: 'Usuário' }
  ]);
  
  const [showNewUserForm, setShowNewUserForm] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'Usuário', password: '' });

  const handleAddUser = (e) => {
    e.preventDefault();
    const id = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
    setUsers([...users, { ...newUser, id }]);
    setNewUser({ name: '', email: '', role: 'Usuário', password: '' });
    setShowNewUserForm(false);
  };

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
                <table className="user-table">
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>Email</th>
                      <th>Permissão</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id}>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>{user.role}</td>
                        <td className="action-column">
                          <button className="icon-button edit">
                            <FaEdit />
                          </button>
                          <button className="icon-button delete">
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="new-user-form">
              <h3>Novo Usuário</h3>
              <form onSubmit={handleAddUser}>
                <div className="form-group">
                  <label htmlFor="name">Nome</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={newUser.name}
                    onChange={handleInputChange}
                    required
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
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="password">Senha</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={newUser.password}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="role">Permissão</label>
                  <select
                    id="role"
                    name="role"
                    value={newUser.role}
                    onChange={handleInputChange}
                  >
                    <option value="Usuário">Usuário</option>
                    <option value="Administrador">Administrador</option>
                    <option value="Editor">Editor</option>
                  </select>
                </div>
                
                <div className="form-actions">
                  <button 
                    type="button" 
                    className="cancel-button"
                    onClick={() => setShowNewUserForm(false)}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="submit-button">
                    Salvar
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
