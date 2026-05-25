import { useState, useEffect, useRef } from 'react'
import styles from './ExerciseCard.module.css'

function EditIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 20H8L18.5 9.5C19.3284 8.67157 19.3284 7.32843 18.5 6.5C17.6716 5.67157 16.3284 5.67157 15.5 6.5L5 17V20Z"
        fill="#4A9EDB" stroke="#4A9EDB" strokeWidth="1.2" strokeLinejoin="round"/>
      <path d="M4 20H20" stroke="#4A9EDB" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M14 8L17 11" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  )
}

export default function ExerciseCard({
  exercise,
  index,
  total,
  editMode,
  onRemove,
  onUpdateExercise,
  onMoveUp,
  onMoveDown,
}) {
  const [editing, setEditing] = useState(false)
  const [localWeight, setLocalWeight] = useState(exercise.weight ?? '')
  const [localReps, setLocalReps] = useState(exercise.reps ?? '')
  const repsRef = useRef(null)

  useEffect(() => {
    if (!editing) {
      setLocalWeight(exercise.weight ?? '')
      setLocalReps(exercise.reps ?? '')
    }
  }, [exercise.weight, exercise.reps, editing])

  useEffect(() => {
    if (editing) repsRef.current?.focus()
  }, [editing])

  function handleSave() {
    onUpdateExercise(localWeight, localReps)
    setEditing(false)
  }

  function handleCancel() {
    setLocalWeight(exercise.weight ?? '')
    setLocalReps(exercise.reps ?? '')
    setEditing(false)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleSave()
    if (e.key === 'Escape') handleCancel()
  }

  const repsDisplay = exercise.reps !== '' && exercise.reps !== undefined ? exercise.reps : '—'
  const weightDisplay = exercise.weight !== '' && exercise.weight !== undefined ? exercise.weight : '—'

  return (
    <div className={`${styles.card} ${editing ? styles.editingWeight : ''}`}>
      {editMode && (
        <div className={styles.reorder}>
          <button className={styles.reorderBtn} onClick={onMoveUp} disabled={index === 0}>▲</button>
          <span className={styles.idx}>{index + 1}</span>
          <button className={styles.reorderBtn} onClick={onMoveDown} disabled={index === total - 1}>▼</button>
        </div>
      )}

      <span className={styles.name}>{exercise.name}</span>

      <div className={styles.right}>
        {editing ? (
          <>
            <input
              ref={repsRef}
              className={styles.weightInput}
              type="number"
              min="0"
              step="1"
              value={localReps}
              onChange={(e) => setLocalReps(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="0"
            />
            <span className={styles.xSep}>x</span>
            <input
              className={styles.weightInput}
              type="number"
              min="0"
              step="0.5"
              value={localWeight}
              onChange={(e) => setLocalWeight(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="0"
            />
            <button className={styles.saveBtn} onClick={handleSave}>Salvar</button>
            <button className={styles.cancelEdit} onClick={handleCancel}>✕</button>
          </>
        ) : (
          <>
            <span className={styles.weightDisplay}>
              {repsDisplay} <span className={styles.xSep}>x</span> {weightDisplay}
            </span>
            <button className={styles.editBtn} onClick={() => setEditing(true)} title="Editar">
              <EditIcon />
            </button>
          </>
        )}
      </div>

      {editMode && (
        <button className={styles.removeBtn} onClick={onRemove} title="Remover">×</button>
      )}
    </div>
  )
}
