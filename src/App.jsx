import { useState, useRef, useEffect } from 'react'
import './App.css'
import Payphone from './Payphone.jsx'

const STAGES = [
  { key: 'build', label: 'build', detail: 'npm ci · npm run build' },
  { key: 'test', label: 'test', detail: 'npm run test' },
  { key: 'deploy', label: 'deploy', detail: 'actions/deploy-pages' },
]

function App() {
  const [stageStatus, setStageStatus] = useState({ build: 'idle', test: 'idle', deploy: 'idle' })
  const [running, setRunning] = useState(false)
  const [history, setHistory] = useState(null)
  const [historyError, setHistoryError] = useState(false)
  const timers = useRef([])

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}history.json`)
      .then((res) => {
        if (!res.ok) throw new Error('no encontrado')
        return res.json()
      })
      .then(setHistory)
      .catch(() => setHistoryError(true))
  }, [])

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
          Rama <code>main</code> · dispara automáticamente en cada push
          {history && history.length > 0 && <> · último commit {history[0].date}</>}
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
        <h2>Historial de commits</h2>
        {historyError && (
          <p className="history-note">
            No se pudo cargar el historial. Ejecuta <code>npm run build</code>{' '}
            o <code>npm run dev</code> para generarlo desde tus commits locales.
          </p>
        )}
        {!history && !historyError && <p className="history-note">Cargando historial…</p>}
        {history && history.length > 0 && (
          <table>
            <tbody>
              {history.map((h) => (
                <tr key={h.hash}>
                  <td className="hash">{h.hash}</td>
                  <td className="msg">{h.msg}</td>
                  <td className="author">{h.author}</td>
                  <td className="time">{h.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <Payphone />

      <footer className="footer">
        Universidad Laica Eloy Alfaro de Manabí — Integración de Sistemas y Plataformas — Noveno Parcial
      </footer>
    </div>
  )
}

export default App