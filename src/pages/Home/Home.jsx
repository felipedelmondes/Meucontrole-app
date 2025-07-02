import React, { useState } from 'react';
import './Home.css';
import CustomSidebar from './CustomSidebar';
import UserCard from './UserCard';
import ClientCard from './ClientCard';
import ProductCard from './ProductCard';
import { FaUsers, FaAddressCard, FaBoxOpen } from 'react-icons/fa';

export default function Home({ user, onLogout }) {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [showUserCard, setShowUserCard] = useState(false);
  const [showClientCard, setShowClientCard] = useState(false);
  const [showProductCard, setShowProductCard] = useState(false);

  const handleMenuItemClick = (section) => {
    setActiveSection(section);
    if (section === 'users') {
      setShowUserCard(true);
      setShowClientCard(false);
      setShowProductCard(false);
    } else if (section === 'clients') {
      setShowClientCard(true);
      setShowUserCard(false);
      setShowProductCard(false);
    } else if (section === 'products') {
      setShowProductCard(true);
      setShowUserCard(false);
      setShowClientCard(false);
    }
  };

  return (
    <div className="home-layout">
      <CustomSidebar 
        onMenuItemClick={handleMenuItemClick} 
        activeSection={activeSection}
      />
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
            <div className="dashboard-welcome">
              <p className="welcome-message">Bem-vindo ao sistema de gerenciamento Meu Controle!</p>
              <p className="welcome-instruction">Utilize o menu lateral para navegar entre as funcionalidades do sistema:</p>
              
              <div className="feature-container">
                <div className="feature-item">
                  <div className="feature-icon users-icon">
                    <FaUsers />
                  </div>
                  <div className="feature-content">
                    <h3>Usuários</h3>
                    <p>Gerenciamento de usuários do sistema, incluindo cadastro, edição e controle de permissões.</p>
                  </div>
                </div>
                
                <div className="feature-item">
                  <div className="feature-icon clients-icon">
                    <FaAddressCard />
                  </div>
                  <div className="feature-content">
                    <h3>Clientes</h3>
                    <p>Cadastro e gerenciamento completo de clientes, incluindo dados de contato e histórico.</p>
                  </div>
                </div>
                
                <div className="feature-item">
                  <div className="feature-icon products-icon">
                    <FaBoxOpen />
                  </div>
                  <div className="feature-content">
                    <h3>Produtos</h3>
                    <p>Cadastro e gerenciamento de produtos, incluindo descrição, valores e controle de estoque.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* O conteúdo será exibido pelo modal ClientCard */}
        
        {/* Outros componentes específicos da seção serão renderizados aqui */}
        
        {/* Card de usuários exibido como modal */}
        <UserCard 
          visible={showUserCard} 
          onClose={() => setShowUserCard(false)}
        />
        
        {/* Card de clientes exibido como modal */}
        <ClientCard 
          visible={showClientCard} 
          onClose={() => setShowClientCard(false)}
        />
        
        {/* Card de produtos exibido como modal */}
        <ProductCard 
          visible={showProductCard} 
          onClose={() => setShowProductCard(false)}
        />
      </div>
    </div>
  );
}
