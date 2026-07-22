import { useEffect, useRef, useState } from 'react'

const TOKEN = "ZReJs6MhR-TV7M2UBmH1tQiNXmk6EHILe1Qh4dJNPugat3dtRVZs08UlLom1ArwzbfoKCsbREKsvXZGGY1OPLmnMHoD8lkBulHoRGMzyShGjer55ir_z4W1pBA3aLmB2MbpOTaQpIcUWZet9ZW63yBZctkHBr5NJdk0ahopPRhBYbKd9X28aLNIsi78jiq9ApHLcrG1TKajrCoqEqKQeECEVkOppZYtbVtZPV6gpycib6jHp9nKEMtR1XqzgpCOW9OOrd-figoXQTdGw_70t4knSdF91hfwMRR3WPkF9drjMhuhlD_y96dOSyNWWKhbBEqBVumvQYI6VO1j86lyhBtL91lU"
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
