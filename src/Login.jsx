import './Login.css';
import { useState } from 'react';
import logo from './assets/logo-meucontrole.svg';

export default function Login({ onLogin }) {
  const [username, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const version = import.meta.env.VITE_APP_VERSION || '1.0.0';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Preencha todos os campos.');
      return;
    }
    setError('');
    onLogin?.(username, password);
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <img src={logo} alt="Logo MeuControle" style={{ width: 80, margin: '0 auto 1rem auto', display: 'block' }} />
        <h2>Meu Controle</h2>
        <div className="login-label-group">
          <label htmlFor="uermane">Usuário</label>
          <input
            id="username"
            type="username"
            placeholder="Usuario"
            value={username}
            onChange={e => setEmail(e.target.value)}
          />
        </div>
        <div className="login-label-group">
          <label htmlFor="password">Senha</label>
          <input
            id="password"
            type="password"
            placeholder="Senha"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>
        {error && <div className="login-error">{error}</div>}
        <button type="submit">Entrar</button>
        <footer style={{ marginTop: 16, color: '#aaa', fontSize: 13, textAlign: 'center' }}>
          v{version}
        </footer>
      </form>
    </div>
  );
}
