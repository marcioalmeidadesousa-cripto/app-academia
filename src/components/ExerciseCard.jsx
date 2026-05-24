import { useState, useEffect, useRef } from 'react'
import styles from './ExerciseCard.module.css'

export default function ExerciseCard({
  exercise,
  index,
  total,
  editMode,
  onRemove,
  onUpdateWeight,
  onMoveUp,
  onMoveDown,
}) {
  const [editing, setEditing] = useState(false)
  const [localWeight, setLocalWeight] = useState(exercise.weight)
  const inputRef = useRef(null)

  useEffect(() => {
    if (!editing) setLocalWeight(exercise.weight)
  }, [exercise.weight, editing])

  useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  function handleSave() {
    onUpdateWeight(localWeight)
    setEditing(false)
  }

  function handleCancel() {
    setLocalWeight(exercise.weight)
    setEditing(false)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleSave()
    if (e.key === 'Escape') handleCancel()
  }

  return (
    <div className={`${styles.card} ${editing ? styles.editingWeight : ''}`}>
      {editMode && (
        <div className={styles.reorder}>
          <button
            className={styles.reorderBtn}
            onClick={onMoveUp}
            disabled={index === 0}
          >▲</button>
          <span className={styles.idx}>{index + 1}</span>
          <button
            className={styles.reorderBtn}
            onClick={onMoveDown}
            disabled={index === total - 1}
          >▼</button>
        </div>
      )}

      <span className={styles.name}>{exercise.name}</span>

      <div className={styles.right}>
        {editing ? (
          <>
            <input
              ref={inputRef}
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
              {exercise.weight !== '' && exercise.weight !== undefined
                ? exercise.weight
                : '—'}
            </span>
            <button
              className={styles.editBtn}
              onClick={() => setEditing(true)}
              title="Editar peso"
            >
              ✏
            </button>
          </>
        )}
      </div>

      {editMode && (
        <button className={styles.removeBtn} onClick={onRemove} title="Remover">
          ×
        </button>
      )}
    </div>
  )
}
