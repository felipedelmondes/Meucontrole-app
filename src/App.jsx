import Login from './Login'
import { useState } from 'react'
import logo from './assets/logo-meucontrole.svg';

function App() {
  const [isLogged, setIsLogged] = useState(false)
  const version = import.meta.env.VITE_APP_VERSION || '1.0.0'

  const handleLogin = () => {
    setIsLogged(true)
  }

  if (!isLogged) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <div style={{ color: '#fff', textAlign: 'center', marginTop: '3rem' }}>
      <img src={logo} alt="Logo MeuControle" style={{ width: 120, marginBottom: 16 }} />
      <h1>Bem-vindo ao MeuControle!</h1>
      <p>Você está autenticado.</p>
      <footer style={{ marginTop: 40, color: '#aaa', fontSize: 14 }}>
        v{version}
      </footer>
    </div>
  )
}

export default App
