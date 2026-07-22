import { useEffect, useRef, useState } from 'react'

const TOKEN = "deV5WnzwThEjqbnLYY8oD396k1UHgd2ugZVSYm8xz-or7zqI0xZJ9_5q05sayNKk58PBC_pkBXo2l2hN_PbC7mvy7g3Y_2pPhJ68IZuylQuPvV2ZP5KtNQtPbzJqMLgXwD25diUlT1Ti8FxSt6tX3XyXHvDO6xv239ydJcX_-eLcOz5qYtdtvtyn7A4v0jRuJ87pk9_bi-Kc2HBDjW_VLrJkizOA3fSyFtKh9AANiIfOqh5QVXPzKpk6LvQenIfuJIYAchdqRpu2vLugmBd6E6RT5zOoL01l-GSU7keg7slCMAnifsTpSAPLw3NvMS475lNOrM8l6BiBQ9NMOcz_RDyjamc"
const STORE_ID = "f4806a5c-f9e4-43b8-ba0e-e9427819521a"
const CONFIRM_URL = "https://paymentbox.payphonetodoesposible.com/api/confirm"

const AMOUNT_CENTS = 100
const REFERENCE = 'pipelineISP - pago de prueba'

export default function Payphone() {
  const [phase, setPhase] = useState('idle') // idle | box | result
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const boxRef = useRef(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const id = params.get('id')
    const clientTxId = params.get('clientTransactionId')
    if (id && clientTxId) {
      setPhase('result')
      confirmarTransaccion(id, clientTxId)
    }
  }, [])

  async function confirmarTransaccion(id, clientTxId) {
    try {
      const res = await fetch(CONFIRM_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${TOKEN}`,
        },
        body: JSON.stringify({ id: parseInt(id, 10), clientTxId }),
      })
      const data = await res.json()
      setResult({ ...data, clientTxId })
    } catch (err) {
      setError('Error al conectar con el servidor: ' + err.message)
    }
  }

  function abrirCajita() {
    if (typeof window.PPaymentButtonBox === 'undefined') {
      setError('El widget de Payphone aún no ha cargado. Intenta de nuevo en un momento.')
      return
    }
    setError(null)
    setPhase('box')
    const clientTxId = `PIPELINE-${Date.now()}`

    setTimeout(() => {
      if (boxRef.current) boxRef.current.innerHTML = ''
      new window.PPaymentButtonBox({
        token: TOKEN,
        storeId: STORE_ID,
        clientTransactionId: clientTxId,
        amount: AMOUNT_CENTS,
        amountWithoutTax: AMOUNT_CENTS,
        amountWithTax: 0,
        tax: 0,
        service: 0,
        tip: 0,
        currency: 'USD',
        reference: REFERENCE,
        lang: 'es',
        defaultMethod: 'card',
        timeZone: -5,
      }).render('pp-button')
    }, 0)
  }

  function cerrarResultado() {
    history.replaceState(null, '', window.location.pathname)
    setResult(null)
    setPhase('idle')
  }

  if (phase === 'result') {
    return (
      <section className="panel payphone">
        <h2>Pago con Payphone</h2>
        {!result && !error && <p className="panel-note">Verificando tu pago...</p>}
        {error && <p className="panel-note">{error}</p>}
        {result && (
          <div className="payphone-result">
            <p className={`payphone-status status-${result.statusCode === 3 ? 'success' : result.statusCode === 2 ? 'idle' : 'running'}`}>
              {result.statusCode === 3 ? '✓ Pago aprobado' : result.statusCode === 2 ? '✕ Pago cancelado' : '⚠ ' + (result.message || 'No se pudo procesar el pago')}
            </p>
            <table>
              <tbody>
                <tr><td className="hash">Transaction ID</td><td className="msg">{result.transactionId || 'N/A'}</td></tr>
                <tr><td className="hash">Autorización</td><td className="msg">{result.authorizationCode || 'N/A'}</td></tr>
                <tr><td className="hash">Monto</td><td className="msg">${((result.amount || 0) / 100).toFixed(2)} USD</td></tr>
                <tr><td className="hash">Referencia</td><td className="msg">{result.clientTxId}</td></tr>
              </tbody>
            </table>
          </div>
        )}
        <button className="run-btn" onClick={cerrarResultado}>Volver</button>
      </section>
    )
  }

  return (
    <section className="panel payphone">
      <h2>Pago con Payphone</h2>
      {phase === 'idle' && (
        <button className="run-btn" onClick={abrirCajita}>Pagar con Payphone</button>
      )}
      {error && <p className="panel-note">{error}</p>}
      <div id="pp-button" ref={boxRef} style={{ marginTop: phase === 'box' ? 16 : 0 }} />
    </section>
  )
}
