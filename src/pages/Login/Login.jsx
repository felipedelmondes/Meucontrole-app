import './Login.css';
import { useState } from 'react';
import Logo from '../../components/Logo';
import VersionFooter from '../../components/VersionFooter';
import { login as loginApi } from '../../services/api';

export default function Login({ onLogin }) {
  const [username, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Preencha todos os campos.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const result = await loginApi(username, password);
      if (result.success) {
        onLogin?.(username, result);
      } else {
        setError(result.mensagem || 'Falha no login');
      }
    } catch (err) {
      setError(err.message || 'Erro ao conectar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <Logo style={{ width: 80, margin: '0 auto 1rem auto', display: 'block' }} />
        <h2>Meu Controle</h2>
        <div className="login-label-group">
          <label htmlFor="uermane">Usuário</label>
          <input
            id="username"
            type="username"
            placeholder="Usuario"
            value={username}
            onChange={e => setEmail(e.target.value)}
            disabled={loading}
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
            disabled={loading}
          />
        </div>
        {error && <div className="login-error">{error}</div>}
        <button type="submit" disabled={loading}>{loading ? 'Entrando...' : 'Entrar'}</button>
        <VersionFooter />
      </form>
    </div>
  );
}
