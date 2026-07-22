import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="container">
      <h1>Integración de Sistemas y Plataformas</h1>
      <h2>Demo de CI/CD con GitHub Actions</h2>
      <div className="card">
        <p>
          Esta aplicación se compila y despliega automáticamente en
          GitHub Pages cada vez que se hace push a la rama <code>main</code>.
        </p>
        <button onClick={() => setCount((c) => c + 1)}>
          Contador: {count}
        </button>
        <p className="status">✅ Si ves esta página, el pipeline funcionó.</p>
      </div>
      <footer>
        <p>Universidad Laica Eloy Alfaro de Manabí — Segundo Parcial</p>
      </footer>
    </div>
  )
}

export default App
