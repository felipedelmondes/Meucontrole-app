import React from 'react';
import { FaTachometerAlt, FaUsers, FaUserFriends, FaBoxOpen } from 'react-icons/fa';
import './CustomSidebar.css';

export default function CustomSidebar({ onMenuItemClick, activeSection = 'dashboard' }) {

  return (
    <div className="custom-sidebar">
      <div className="sidebar-header">
        <h2>Meu Controle</h2>
      </div>
      <nav className="sidebar-nav">
        <div 
          className={`nav-item ${activeSection === 'dashboard' ? 'active' : ''}`} 
          onClick={() => onMenuItemClick && onMenuItemClick('dashboard')}
        >
          <FaTachometerAlt className="nav-icon" />
          <span className="nav-text">Dashboard</span>
        </div>
        <div 
          className={`nav-item ${activeSection === 'users' ? 'active' : ''}`}
          onClick={() => onMenuItemClick && onMenuItemClick('users')}
        >
          <FaUsers className="nav-icon" />
          <span className="nav-text">Usuários</span>
        </div>
        
        <div 
          className={`nav-item ${activeSection === 'clients' ? 'active' : ''}`}
          onClick={() => onMenuItemClick && onMenuItemClick('clients')}
        >
          <FaUserFriends className="nav-icon" />
          <span className="nav-text">Clientes</span>
        </div>
        
        <div 
          className={`nav-item ${activeSection === 'products' ? 'active' : ''}`}
          onClick={() => onMenuItemClick && onMenuItemClick('products')}
        >
          <FaBoxOpen className="nav-icon" />
          <span className="nav-text">Produtos</span>
        </div>
        
        {/* Espaço reservado para menus futuros */}
        <div className="nav-divider">
          <small>Em desenvolvimento</small>
        </div>
      </nav>
    </div>
  );
}
