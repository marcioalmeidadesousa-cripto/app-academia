import { useState, useEffect } from 'react'
import { DEFAULT_EXERCISES } from './data/exercises'
import { supabase } from './lib/supabase'
import { useAuth } from './hooks/useAuth'
import DayTabs from './components/DayTabs'
import WorkoutDay from './components/WorkoutDay'
import AuthScreen from './components/AuthScreen'
import AdminPanel from './components/AdminPanel'
import logo from './assets/logo.svg'
import styles from './App.module.css'

const DAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL

function buildEmptyWorkouts() {
  return DAYS.reduce((acc, day) => ({ ...acc, [day]: [] }), {})
}

export default function App() {
  const { user, loading: authLoading } = useAuth()
  const [dataLoading, setDataLoading] = useState(false)
  const [showAdmin, setShowAdmin] = useState(false)
  const [selectedDay, setSelectedDay] = useState(() => {
    const map = [5, 0, 1, 2, 3, 4, 5]
    return DAYS[map[new Date().getDay()]]
  })
  const [workouts, setWorkouts] = useState(buildEmptyWorkouts)
  const [customExercises, setCustomExercises] = useState([])

  // Load data from Supabase when user logs in
  useEffect(() => {
    if (!user) {
      setWorkouts(buildEmptyWorkouts())
      setCustomExercises([])
      return
    }

    async function loadData() {
      setDataLoading(true)

      const [{ data: workoutRows }, { data: customRows }] = await Promise.all([
        supabase.from('workouts').select('day, exercises').eq('user_id', user.id),
        supabase.from('custom_exercises').select('name').eq('user_id', user.id),
      ])

      if (workoutRows) {
        const loaded = buildEmptyWorkouts()
        workoutRows.forEach((row) => {
          if (loaded[row.day] !== undefined) {
            loaded[row.day] = (row.exercises || []).filter(
              (e) => e && typeof e.name === 'string' && e.name.trim() !== ''
            )
          }
        })
        setWorkouts(loaded)
      }

      if (customRows) {
        setCustomExercises(customRows.map((r) => r.name))
      }

      setDataLoading(false)
    }

    loadData()
  }, [user])

  async function saveWorkout(day, exercises) {
    if (!user) return
    await supabase
      .from('workouts')
      .upsert(
        { user_id: user.id, day, exercises, updated_at: new Date().toISOString() },
        { onConflict: 'user_id,day' }
      )
  }

  const allExercises = [...DEFAULT_EXERCISES, ...customExercises]

  function addExercise(day, name) {
    const exists = workouts[day].some((e) => e.name.toLowerCase() === name.toLowerCase())
    if (exists) return
    const entry = { id: crypto.randomUUID(), name, weight: '', reps: '' }
    const updated = [...workouts[day], entry]
    setWorkouts((prev) => ({ ...prev, [day]: updated }))
    saveWorkout(day, updated)
  }

  function removeExercise(day, id) {
    const updated = workouts[day].filter((e) => e.id !== id)
    setWorkouts((prev) => ({ ...prev, [day]: updated }))
    saveWorkout(day, updated)
  }

  function updateExercise(day, id, weight, reps) {
    const updated = workouts[day].map((e) => (e.id === id ? { ...e, weight, reps } : e))
    setWorkouts((prev) => ({ ...prev, [day]: updated }))
    saveWorkout(day, updated)
  }

  function reorderExercises(day, exercises) {
    setWorkouts((prev) => ({ ...prev, [day]: exercises }))
    saveWorkout(day, exercises)
  }

  async function addCustomExercise(name) {
    const trimmed = name.trim()
    if (!trimmed) return
    const exists = allExercises.some((e) => e.toLowerCase() === trimmed.toLowerCase())
    if (!exists) {
      setCustomExercises((prev) => [...prev, trimmed])
      if (user) {
        await supabase.from('custom_exercises').insert({ user_id: user.id, name: trimmed })
      }
    }
    return trimmed
  }

  async function handleLogout() {
    await supabase.auth.signOut()
  }

  // Auth loading
  if (authLoading) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.logoBox}>
          <img src={logo} alt="MSA" className={styles.logoImg} />
        </div>
      </div>
    )
  }

  // Not authenticated
  if (!user) return <AuthScreen />

  // Data loading
  if (dataLoading) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.logoBox}>
          <img src={logo} alt="MSA" className={styles.logoImg} />
        </div>
        <p className={styles.loadingText}>Carregando treinos...</p>
      </div>
    )
  }

  const isAdmin = user?.email === ADMIN_EMAIL

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.logoBox}>
          <img src={logo} alt="MSA Academia" className={styles.logoImg} />
        </div>
        <div className={styles.headerText}>
          <h1 className={styles.title}>MSA Academia</h1>
          <span className={styles.subtitle}>Meu Treino</span>
        </div>
        {isAdmin && (
          <button className={styles.adminBtn} onClick={() => setShowAdmin(true)} title="Administração">
            ⚙
          </button>
        )}
        <button className={styles.logoutBtn} onClick={handleLogout} title="Sair">
          Sair
        </button>
      </header>

      <DayTabs days={DAYS} selectedDay={selectedDay} onSelect={setSelectedDay} />

      <main className={styles.main}>
        <WorkoutDay
          day={selectedDay}
          exercises={workouts[selectedDay]}
          allExercises={allExercises}
          onAdd={(name) => addExercise(selectedDay, name)}
          onRemove={(id) => removeExercise(selectedDay, id)}
          onUpdateExercise={(id, weight, reps) => updateExercise(selectedDay, id, weight, reps)}
          onReorder={(exercises) => reorderExercises(selectedDay, exercises)}
          onAddCustom={addCustomExercise}
        />
      </main>

      {showAdmin && <AdminPanel onClose={() => setShowAdmin(false)} />}
    </div>
  )
}
