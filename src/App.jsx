import Login from './pages/Login';
import { useState, useEffect } from 'react';
import Home from './pages/Home';
import './App.css';

function isTokenValid() {
  const token = window.getToken && window.getToken();
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    // exp está em segundos
    if (!payload.exp) return false;
    const now = Math.floor(Date.now() / 1000);
    return payload.exp > now;
  } catch {
    return false;
  }
}

function getUserFromToken() {
  const token = window.getToken && window.getToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return { username: payload.unique_name };
  } catch {
    return null;
  }
}

function App() {
  const [user, setUser] = useState(null);

  // Sempre verifica o token ao carregar e a cada 10s
  useEffect(() => {
    function checkToken() {
      if (!isTokenValid()) {
        setUser(null);
        if (window.removeToken) window.removeToken();
      } else {
        setUser(getUserFromToken());
      }
    }
    checkToken(); // verifica imediatamente ao carregar
    const interval = setInterval(checkToken, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = (username, loginResult) => {
    setUser({ username, ...loginResult });
  };

  const handleLogout = () => {
    setUser(null);
    if (window.removeToken) window.removeToken();
  };

  if (!user) {
    return (
      <div className="app-container">
        <Login onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <div className="app-container">
      <Home user={user} onLogout={handleLogout} />
    </div>
  );
}

export default App
