import { useState, useRef } from 'react'
import './App.css'

const STAGES = [
  { key: 'build', label: 'build', detail: 'npm ci · npm run build' },
  { key: 'test', label: 'test', detail: 'npm run test' },
  { key: 'deploy', label: 'deploy', detail: 'actions/deploy-pages' },
]

const HISTORY = [
  { hash: 'a3f9c1e', msg: 'Ajustar workflow a Node 22', author: 'alexvc19111', time: 'hace 3 min', status: 'success', duration: '18s' },
  { hash: '7d2b8aa', msg: 'Corregir configuración de Pages', author: 'alexvc19111', time: 'hace 1 h', status: 'success', duration: '21s' },
  { hash: 'f01e44c', msg: 'Primer intento de deploy', author: 'alexvc19111', time: 'hace 2 h', status: 'failed', duration: '9s' },
  { hash: '9c6a102', msg: 'Proyecto inicial con pipeline CI/CD', author: 'alexvc19111', time: 'hace 3 h', status: 'success', duration: '24s' },
]

function App() {
  const [stageStatus, setStageStatus] = useState({ build: 'idle', test: 'idle', deploy: 'idle' })
  const [running, setRunning] = useState(false)
  const timers = useRef([])

  const runPipeline = () => {
    if (running) return
    setRunning(true)
    timers.current.forEach(clearTimeout)
    timers.current = []

    const sequence = [
      [0, () => setStageStatus({ build: 'running', test: 'idle', deploy: 'idle' })],
      [1200, () => setStageStatus({ build: 'success', test: 'running', deploy: 'idle' })],
      [2200, () => setStageStatus({ build: 'success', test: 'success', deploy: 'running' })],
      [3200, () => { setStageStatus({ build: 'success', test: 'success', deploy: 'success' }); setRunning(false) }],
    ]
    sequence.forEach(([delay, fn]) => timers.current.push(setTimeout(fn, delay)))
  }

  const overallStatus = Object.values(stageStatus).includes('running')
    ? 'running'
    : Object.values(stageStatus).every((s) => s === 'success')
    ? 'success'
    : 'idle'

  return (
    <div className="app">
      <nav className="topbar">
        <div className="brand">
          <span className="brand-mark">▲</span>
          <span>pipelineISP</span>
        </div>
        <div className="topbar-links">
          <span>Workflows</span>
          <span>Entornos</span>
          <span>Ajustes</span>
        </div>
      </nav>

      <header className="hero">
        <div className="breadcrumb">alexvc19111 / trabajoautonomo</div>
        <div className="hero-row">
          <h1>deploy.yml</h1>
          <span className={`status-pill status-${overallStatus}`}>
            {overallStatus === 'idle' && 'En espera'}
            {overallStatus === 'running' && 'Ejecutando'}
            {overallStatus === 'success' && 'Passing'}
          </span>
        </div>
        <p className="hero-sub">
          Rama <code>main</code> · dispara automáticamente en cada push · última ejecución {HISTORY[0].time}
        </p>
        <button className="run-btn" onClick={runPipeline} disabled={running}>
          {running ? 'Ejecutando…' : 'Ejecutar pipeline'}
        </button>
      </header>

      <section className="pipeline">
        {STAGES.map((stage, i) => (
          <div className="stage-wrap" key={stage.key}>
            <div className={`stage-node stage-${stageStatus[stage.key]}`}>
              <div className="stage-icon">
                {stageStatus[stage.key] === 'success' && '✓'}
                {stageStatus[stage.key] === 'running' && '●'}
                {stageStatus[stage.key] === 'idle' && '○'}
              </div>
              <div className="stage-text">
                <span className="stage-label">{stage.label}</span>
                <span className="stage-detail">{stage.detail}</span>
              </div>
            </div>
            {i < STAGES.length - 1 && (
              <div className={`stage-connector ${stageStatus[STAGES[i + 1].key] !== 'idle' ? 'lit' : ''}`} />
            )}
          </div>
        ))}
      </section>

      <section className="history">
        <h2>Historial de ejecuciones</h2>
        <table>
          <tbody>
            {HISTORY.map((h) => (
              <tr key={h.hash}>
                <td className={`dot dot-${h.status}`} aria-hidden="true" />
                <td className="hash">{h.hash}</td>
                <td className="msg">{h.msg}</td>
                <td className="author">{h.author}</td>
                <td className="time">{h.time}</td>
                <td className="duration">{h.duration}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <footer className="footer">
        Universidad Laica Eloy Alfaro de Manabí — Integración de Sistemas y Plataformas — Segundo Parcial
      </footer>
    </div>
  )
}

export default App