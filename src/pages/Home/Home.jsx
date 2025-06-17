import React, { useState } from 'react';
import './Home.css';
import CustomSidebar from './CustomSidebar';
import UserCard from './UserCard';

export default function Home({ user, onLogout }) {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [showUserCard, setShowUserCard] = useState(false);

  const handleMenuItemClick = (section) => {
    setActiveSection(section);
    if (section === 'users') {
      setShowUserCard(true);
    }
  };

  return (
    <div className="home-layout">
      <CustomSidebar onMenuItemClick={handleMenuItemClick} />
      <div className="home-content">
        <div className="home-user-info">
          {user && (
            <span>Usuário: <b>{user.username}</b></span>
          )}
          <button onClick={onLogout}>Sair</button>
        </div>
        
        {activeSection === 'dashboard' && (
          <div className="home-dashboard">
            <h2>Dashboard</h2>
            <p>Conteúdo do dashboard virá aqui</p>
          </div>
        )}
        
        {/* Outros componentes específicos da seção serão renderizados aqui */}
        
        {/* Card de usuários exibido como modal */}
        <UserCard 
          visible={showUserCard} 
          onClose={() => setShowUserCard(false)}
        />
      </div>
    </div>
  );
}
