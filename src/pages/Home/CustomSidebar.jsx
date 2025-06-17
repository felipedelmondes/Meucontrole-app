import React, { useState } from 'react';
import { FaTachometerAlt, FaCog, FaFileAlt, FaUsers, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import './CustomSidebar.css';

export default function CustomSidebar({ onMenuItemClick }) {
  const [expandedGroup, setExpandedGroup] = useState(null);

  const toggleGroup = (name) => {
    setExpandedGroup(expandedGroup === name ? null : name);
  };

  return (
    <div className="custom-sidebar">
      <div className="sidebar-header">
        <h2>Meu Controle</h2>
      </div>
      <nav className="sidebar-nav">
        <div className="nav-item" onClick={() => onMenuItemClick && onMenuItemClick('dashboard')}>
          <FaTachometerAlt className="nav-icon" />
          <span className="nav-text">Dashboard</span>
        </div>
        <div className="nav-item" onClick={() => onMenuItemClick && onMenuItemClick('config')}>
          <FaCog className="nav-icon" />
          <span className="nav-text">Configurações</span>
        </div>
        <div className="nav-item" onClick={() => onMenuItemClick && onMenuItemClick('reports')}>
          <FaFileAlt className="nav-icon" />
          <span className="nav-text">Relatórios</span>
        </div>
        <div className="nav-item" onClick={() => onMenuItemClick && onMenuItemClick('users')}>
          <FaUsers className="nav-icon" />
          <span className="nav-text">Usuários</span>
        </div>

        <div className="nav-divider">Outros</div>
        
        <div className="nav-group">
          <div className="nav-item" onClick={() => toggleGroup('opcoes')}>
            <span className="nav-icon-placeholder"></span>
            <span className="nav-text">Mais opções</span>
            {expandedGroup === 'opcoes' ? 
              <FaChevronUp className="nav-arrow" /> : 
              <FaChevronDown className="nav-arrow" />
            }
          </div>
          
          {expandedGroup === 'opcoes' && (
            <div className="nav-group-items">
              <div className="nav-subitem" onClick={() => onMenuItemClick && onMenuItemClick('option1')}>Opção 1</div>
              <div className="nav-subitem" onClick={() => onMenuItemClick && onMenuItemClick('option2')}>Opção 2</div>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
}
