import { useCallback, useEffect, useMemo, useState } from 'react'
import { IconSearch } from '../../components/Icons.jsx'
import { api } from './api.js'
import { MESES, diasPara, fechaCorta, ordenarPorProximo, textoFaltan } from './dates.js'
import Avatar from './Avatar.jsx'
import PersonDialog from './PersonDialog.jsx'
import { ConfirmDialog, ImportDialog, PasswordDialog, WishesDialog } from './Dialogs.jsx'
import { Globos, Serpentinas } from './Celebration.jsx'
import { IconEdit, IconEye, IconEyeOff, IconHeart, IconKey, IconLock, IconLogout, IconPlus, IconTrash, IconUpload } from './icons.jsx'
import './cumpleanos.css'

/* Panel del gestor de cumpleaños: inicio de sesión y administración completa. */
export default function GestorPage() {
  const [user, setUser] = useState(undefined) // undefined = comprobando sesión

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
    api.yo().then(setUser).catch(() => setUser(null))
  }, [])

  if (user === undefined) return <div className="cb cb-gestor"><p className="cb-loading">Comprobando sesión…</p></div>
  if (!user) return <Login onLogin={setUser} />
  return <Panel user={user} onLogout={() => setUser(null)} />
}

function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function entrar(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      onLogin(await api.login(username, password))
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <div className="cb cb-login">
      <Serpentinas />
      <Globos />
      <form className="cb-login__card" onSubmit={entrar}>
        <span className="cb-login__icon"><IconLock width={26} height={26} /></span>
        <h1>Gestión de cumpleaños</h1>
        <p>Ingresa con tu usuario de gestor para agregar personas, subir fotos y decidir qué se publica.</p>

        <label className="cb-field">
          <span className="cb-label">Usuario</span>
          <input value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" autoCapitalize="none" required autoFocus />
        </label>
        <label className="cb-field">
          <span className="cb-label">Contraseña</span>
          <span className="cb-pass">
            <input type={show ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
            <button type="button" className="cb-icon-btn" onClick={() => setShow((s) => !s)} aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'} aria-pressed={show}>
              {show ? <IconEyeOff /> : <IconEye />}
            </button>
          </span>
        </label>

        {error && <p className="cb-alert cb-alert--error" role="alert">{error}</p>}

        <button type="submit" className="cb-btn cb-btn--block" disabled={busy}>{busy ? 'Ingresando…' : 'Ingresar'}</button>
        <a href="#cumpleanos" className="cb-link cb-login__back">Volver a cumpleaños</a>
      </form>
    </div>
  )
}

const FILTROS = [['todos', 'Todos'], ['publicados', 'Publicados'], ['ocultos', 'Ocultos']]

function Panel({ user, onLogout }) {
  const [personas, setPersonas] = useState(null)
  const [error, setError] = useState('')
  const [q, setQ] = useState('')
  const [filtro, setFiltro] = useState('todos')
  const [mes, setMes] = useState('')
  const [dialogo, setDialogo] = useState(null) // { tipo, persona }
  const [toast, setToast] = useState('')
  const hoy = useMemo(() => new Date(), [])

  const cargar = useCallback(() => {
    api.personas().then(setPersonas).catch((e) => {
      if (e.status === 401) onLogout()
      else setError(e.message)
    })
  }, [onLogout])
  useEffect(cargar, [cargar])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(''), 3200)
    return () => clearTimeout(t)
  }, [toast])

  const lista = personas || []
  const stats = [
    ['Personas registradas', lista.length],
    ['Publicadas', lista.filter((p) => p.published).length],
    ['Cumplen hoy', lista.filter((p) => p.published && diasPara(p, hoy) === 0).length],
    [`Cumplen en ${MESES[hoy.getMonth()]}`, lista.filter((p) => p.month === hoy.getMonth() + 1).length],
  ]

  const visibles = ordenarPorProximo(
    lista.filter((p) => {
      const texto = `${p.name} ${p.cargo} ${p.area}`.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()
      const busca = q.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim()
      return (!busca || texto.includes(busca))
        && (filtro === 'todos' || (filtro === 'publicados' ? p.published : !p.published))
        && (!mes || p.month === Number(mes))
    }),
    hoy,
  )

  async function alternar(p) {
    setPersonas((ps) => ps.map((x) => (x.id === p.id ? { ...x, published: !p.published } : x)))
    try {
      await api.publicar(p.id, !p.published)
      setToast(!p.published ? `${p.name} ahora se publica.` : `${p.name} quedó oculto.`)
    } catch (e) {
      setPersonas((ps) => ps.map((x) => (x.id === p.id ? p : x)))
      setToast(e.message)
    }
  }

  async function salir() {
    await api.logout().catch(() => {})
    onLogout()
  }

  const cerrar = () => setDialogo(null)

  return (
    <div className="cb cb-gestor">
      <header className="cb-bar">
        <div className="cb-wrap cb-bar__inner">
          <div>
            <p className="cb-eyebrow">Panel del gestor</p>
            <h1 className="cb-bar__title">Cumpleaños del equipo</h1>
          </div>
          <div className="cb-bar__actions">
            <span className="cb-user">Hola, <b>{user.name || user.username}</b></span>
            <a href="#cumpleanos" className="cb-btn cb-btn--ghost"><IconEye /> Ver página pública</a>
            <button type="button" className="cb-btn cb-btn--ghost" onClick={() => setDialogo({ tipo: 'clave' })}><IconKey /> Contraseña</button>
            <button type="button" className="cb-btn cb-btn--ghost" onClick={salir}><IconLogout /> Salir</button>
          </div>
        </div>
      </header>

      <main className="cb-wrap cb-panel">
        <ul className="cb-stats">
          {stats.map(([label, n], i) => (
            <li key={label} style={{ '--i': i }}><b>{personas ? n : '—'}</b><span>{label}</span></li>
          ))}
        </ul>

        <div className="cb-toolbar">
          <label className="cb-search">
            <IconSearch width={18} height={18} aria-hidden="true" />
            <span className="cb-sr">Buscar persona</span>
            <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nombre, cargo o área" />
          </label>
          <div className="cb-segment" role="group" aria-label="Filtrar por estado">
            {FILTROS.map(([id, label]) => (
              <button key={id} type="button" className={filtro === id ? 'is-on' : ''} aria-pressed={filtro === id} onClick={() => setFiltro(id)}>{label}</button>
            ))}
          </div>
          <select className="cb-select" value={mes} onChange={(e) => setMes(e.target.value)} aria-label="Filtrar por mes">
            <option value="">Todos los meses</option>
            {MESES.map((m, i) => <option key={m} value={i + 1}>{m[0].toUpperCase() + m.slice(1)}</option>)}
          </select>
          <div className="cb-toolbar__end">
            <button type="button" className="cb-btn cb-btn--ghost" onClick={() => setDialogo({ tipo: 'importar' })}><IconUpload /> Importar CSV</button>
            <button type="button" className="cb-btn" onClick={() => setDialogo({ tipo: 'persona' })}><IconPlus /> Agregar persona</button>
          </div>
        </div>

        {error && <p className="cb-alert cb-alert--error" role="alert">{error}</p>}

        {personas === null ? (
          <div className="cb-rows" aria-busy="true">{[0, 1, 2].map((i) => <div key={i} className="cb-row cb-skeleton" />)}</div>
        ) : visibles.length === 0 ? (
          <div className="cb-empty">
            <p>{lista.length ? 'Ninguna persona coincide con los filtros.' : 'Aún no hay personas registradas. Agrega la primera o importa un CSV.'}</p>
            {!lista.length && <button type="button" className="cb-btn" onClick={() => setDialogo({ tipo: 'persona' })}><IconPlus /> Agregar persona</button>}
          </div>
        ) : (
          <ul className="cb-rows">
            {visibles.map((p) => {
              const d = diasPara(p, hoy)
              return (
                <li key={p.id} className={`cb-row ${p.published ? '' : 'is-hidden'}`}>
                  <Avatar person={p} size={52} />
                  <div className="cb-row__main">
                    <b>{p.name}</b>
                    <span>{[p.cargo, p.area].filter(Boolean).join(' · ') || 'Sin cargo'}</span>
                  </div>
                  <div className="cb-row__date">
                    <b>{fechaCorta(p)}</b>
                    <span className={d === 0 ? 'is-hot' : ''}>{textoFaltan(d)}</span>
                  </div>
                  <label className="cb-switch cb-switch--compact">
                    <input type="checkbox" checked={p.published} onChange={() => alternar(p)} />
                    <span className="cb-switch__track" aria-hidden="true" />
                    <span>{p.published ? 'Publicado' : 'Oculto'}</span>
                  </label>
                  <div className="cb-row__actions">
                    <button type="button" className="cb-hearts" onClick={() => setDialogo({ tipo: 'deseos', persona: p })} aria-label={`Ver felicitaciones de ${p.name}: ${p.wishes || 0}`} title="Felicitaciones de este año">
                      <IconHeart width={18} height={18} /> {p.wishes || 0}
                    </button>
                    <button type="button" className="cb-icon-btn" onClick={() => setDialogo({ tipo: 'persona', persona: p })} aria-label={`Editar a ${p.name}`}><IconEdit /></button>
                    <button type="button" className="cb-icon-btn cb-icon-btn--danger" onClick={() => setDialogo({ tipo: 'eliminar', persona: p })} aria-label={`Eliminar a ${p.name}`}><IconTrash /></button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}

        <p className="cb-help cb-help--block">
          Las personas publicadas aparecen solas en la página de cumpleaños el día que cumplen, cada año. Solo se muestran el día y el mes.
        </p>
      </main>

      {dialogo?.tipo === 'persona' && (
        <PersonDialog
          person={dialogo.persona}
          onClose={cerrar}
          onSaved={(saved, editing) => {
            setPersonas((ps) => (editing ? ps.map((x) => (x.id === saved.id ? saved : x)) : [...ps, saved]))
            setToast(editing ? 'Cambios guardados.' : `${saved.name} fue agregado.`)
            cerrar()
          }}
        />
      )}
      {dialogo?.tipo === 'eliminar' && (
        <ConfirmDialog
          title="Eliminar persona"
          message={`¿Eliminar a ${dialogo.persona.name}? También se borrará su foto. Esta acción no se puede deshacer.`}
          confirmLabel="Eliminar"
          onClose={cerrar}
          onConfirm={async () => {
            try {
              await api.eliminar(dialogo.persona.id)
              setPersonas((ps) => ps.filter((x) => x.id !== dialogo.persona.id))
              setToast(`${dialogo.persona.name} fue eliminado.`)
            } catch (e) {
              setToast(e.message)
            }
            cerrar()
          }}
        />
      )}
      {dialogo?.tipo === 'deseos' && <WishesDialog person={dialogo.persona} onClose={cerrar} onChange={cargar} />}
      {dialogo?.tipo === 'importar' &&<ImportDialog onClose={cerrar} onDone={cargar} />}
      {dialogo?.tipo === 'clave' && <PasswordDialog onClose={cerrar} onDone={() => { setToast('Contraseña actualizada.'); cerrar() }} />}

      <div className={`cb-toast ${toast ? 'is-on' : ''}`} role="status" aria-live="polite">{toast}</div>
    </div>
  )
}
