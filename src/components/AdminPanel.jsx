import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import styles from './AdminPanel.module.css'

async function callAdmin(body) {
  const { data: { session } } = await supabase.auth.getSession()
  const res = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-ops`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
        apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
      body: JSON.stringify(body),
    }
  )
  return res.json()
}

export default function AdminPanel({ onClose }) {
  const [users, setUsers] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function loadUsers() {
    setLoadingUsers(true)
    const data = await callAdmin({ action: 'list' })
    setUsers(data.users || [])
    setLoadingUsers(false)
  }

  useEffect(() => { loadUsers() }, [])

  async function handleCreate(e) {
    e.preventDefault()
    setCreating(true)
    setError('')
    setSuccess('')
    const data = await callAdmin({ action: 'create', email, password, name })
    if (data.error) {
      setError(data.error)
    } else {
      setSuccess(`Usuário ${email} criado!`)
      setName('')
      setEmail('')
      setPassword('')
      loadUsers()
    }
    setCreating(false)
  }

  async function handleDelete(userId, userEmail) {
    if (!window.confirm(`Remover acesso de ${userEmail}?`)) return
    await callAdmin({ action: 'delete', userId })
    loadUsers()
  }

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <h2 className={styles.panelTitle}>Administração</h2>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Novo Usuário</h3>
          <form className={styles.form} onSubmit={handleCreate}>
            <input
              className={styles.input}
              placeholder="Nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <input
              className={styles.input}
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              className={styles.input}
              type="password"
              placeholder="Senha (mín. 6 caracteres)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
            {error && <p className={styles.error}>{error}</p>}
            {success && <p className={styles.success}>{success}</p>}
            <button className={styles.createBtn} type="submit" disabled={creating}>
              {creating ? 'Criando...' : 'Criar Usuário'}
            </button>
          </form>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>
            Usuários {!loadingUsers && `(${users.length})`}
          </h3>
          {loadingUsers ? (
            <p className={styles.hint}>Carregando...</p>
          ) : (
            <ul className={styles.userList}>
              {users.map((u) => (
                <li key={u.id} className={styles.userItem}>
                  <div className={styles.userInfo}>
                    <span className={styles.userName}>
                      {u.user_metadata?.name || u.email.split('@')[0]}
                    </span>
                    <span className={styles.userEmail}>{u.email}</span>
                  </div>
                  {u.email !== import.meta.env.VITE_ADMIN_EMAIL && (
                    <button
                      className={styles.deleteBtn}
                      onClick={() => handleDelete(u.id, u.email)}
                    >
                      Remover
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
