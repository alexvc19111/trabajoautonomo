import { useState, useRef, useEffect } from 'react'
import './App.css'

const STAGES = [
  { key: 'build', label: 'Build', detail: 'npm ci · npm run build' },
  { key: 'test', label: 'Test', detail: 'npm run test' },
  { key: 'deploy', label: 'Deploy', detail: 'actions/deploy-pages' },
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
      <header className="masthead">
        <div className="masthead-crest">ISP</div>
        <div className="masthead-text">
          <span className="masthead-university">Universidad Laica Eloy Alfaro de Manabí</span>
          <span className="masthead-course">Integración de Sistemas y Plataformas</span>
        </div>
      </header>

      <main className="sheet">
        <section className="cover">
          <span className="cover-tag">Trabajo Autónomo · Segundo Parcial</span>
          <h1>Unidad III — Integración Continua con GitHub Actions</h1>
          <p className="cover-sub">
            Demostración práctica de un pipeline de CI/CD que compila y despliega
            este proyecto de forma automática cada vez que se registra un cambio
            en la rama <code>main</code> del repositorio.
          </p>
          <dl className="cover-meta">
            <div><dt>Docente</dt><dd>Ing. Maholy Velásquez, Mg.</dd></div>
            <div><dt>Periodo académico</dt><dd>2026-1</dd></div>
            <div><dt>Repositorio</dt><dd>alexvc19111/trabajoautonomo</dd></div>
          </dl>
        </section>

        <section className="panel">
          <div className="panel-head">
            <h2>Demostración del pipeline</h2>
            <span className={`status-pill status-${overallStatus}`}>
              {overallStatus === 'idle' && 'En espera'}
              {overallStatus === 'running' && 'Ejecutando'}
              {overallStatus === 'success' && 'Completado'}
            </span>
          </div>
          <p className="panel-note">
            En producción, estas tres etapas las ejecuta GitHub Actions
            automáticamente. El botón simula la misma secuencia para fines
            de presentación.
          </p>

          <div className="pipeline">
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
          </div>

          <button className="run-btn" onClick={runPipeline} disabled={running}>
            {running ? 'Ejecutando…' : 'Ejecutar demostración'}
          </button>
        </section>

        <section className="panel">
          <h2>Historial de commits</h2>
          <p className="panel-note">
            Generado a partir de <code>git log</code> del repositorio en el
            momento del build (<code>scripts/generate-history.mjs</code>),
            no son datos de ejemplo.
          </p>
          {historyError && (
            <p className="panel-note">
              No se pudo cargar el historial. Ejecuta <code>npm run build</code>{' '}
              o <code>npm run dev</code> para generarlo desde tus commits locales.
            </p>
          )}
          {!history && !historyError && <p className="panel-note">Cargando historial…</p>}
          {history && history.length > 0 && (
            <table>
              <thead>
                <tr>
                  <th>Commit</th>
                  <th>Mensaje</th>
                  <th>Autor</th>
                  <th>Fecha</th>
                </tr>
              </thead>
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
      </main>

      <footer className="footer">
        Universidad Laica Eloy Alfaro de Manabí — Integración de Sistemas y Plataformas — Segundo Parcial
      </footer>
    </div>
  )
}

export default App
