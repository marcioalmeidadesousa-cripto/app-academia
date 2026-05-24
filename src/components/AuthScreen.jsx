import { useState } from 'react'
import { supabase } from '../lib/supabase'
import logo from '../assets/logo.svg'
import styles from './AuthScreen.module.css'

export default function AuthScreen() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  function switchMode(m) {
    setMode(m)
    setError('')
    setSuccess('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError('Email ou senha incorretos.')
    } else {
      if (password.length < 6) {
        setError('A senha deve ter pelo menos 6 caracteres.')
        setLoading(false)
        return
      }
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) {
        if (error.message.toLowerCase().includes('already')) {
          setError('Este email já está cadastrado. Tente fazer login.')
        } else {
          setError(error.message)
        }
      } else {
        setSuccess('Conta criada! Verifique seu email para confirmar o cadastro.')
      }
    }

    setLoading(false)
  }

  return (
    <div className={styles.screen}>
      <div className={styles.top}>
        <div className={styles.logoBox}>
          <img src={logo} alt="MSA Academia" className={styles.logoImg} />
        </div>
        <h1 className={styles.appName}>MSA Academia</h1>
        <p className={styles.tagline}>Seu treino, onde estiver</p>
      </div>

      <div className={styles.card}>
        <div className={styles.modeTabs}>
          <button
            className={`${styles.modeTab} ${mode === 'login' ? styles.modeActive : ''}`}
            onClick={() => switchMode('login')}
            type="button"
          >
            Entrar
          </button>
          <button
            className={`${styles.modeTab} ${mode === 'register' ? styles.modeActive : ''}`}
            onClick={() => switchMode('register')}
            type="button"
          >
            Cadastrar
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <input
              className={styles.input}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              autoComplete="email"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Senha</label>
            <input
              className={styles.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === 'register' ? 'Mínimo 6 caracteres' : '••••••••'}
              required
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}
          {success && <p className={styles.successMsg}>{success}</p>}

          <button
            className={styles.submitBtn}
            type="submit"
            disabled={loading}
          >
            {loading ? 'Aguarde...' : mode === 'login' ? 'Entrar' : 'Criar conta'}
          </button>
        </form>
      </div>
    </div>
  )
}
