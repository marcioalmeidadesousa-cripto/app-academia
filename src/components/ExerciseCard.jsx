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

function emptySet() {
  return { series: '', reps: '', weight: '' }
}

function formatSet(s) {
  const se = s.series !== '' && s.series !== undefined ? s.series : '—'
  const r = s.reps !== '' && s.reps !== undefined ? s.reps : '—'
  const w = s.weight !== '' && s.weight !== undefined ? s.weight : '—'
  return { se, r, w }
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
  const sets = exercise.sets && exercise.sets.length > 0
    ? exercise.sets
    : [{ series: exercise.series ?? '', reps: exercise.reps ?? '', weight: exercise.weight ?? '' }]

  const [editing, setEditing] = useState(false)
  const [localSets, setLocalSets] = useState(sets)
  const firstRepsRef = useRef(null)

  useEffect(() => {
    if (!editing) setLocalSets(sets)
  }, [exercise.sets, exercise.weight, exercise.reps, editing])

  useEffect(() => {
    if (editing) firstRepsRef.current?.focus()
  }, [editing])

  function handleSave() {
    onUpdateExercise(localSets)
    setEditing(false)
  }

  function handleCancel() {
    setLocalSets(sets)
    setEditing(false)
  }

  function updateLocalSet(i, field, val) {
    setLocalSets((prev) => prev.map((s, idx) => idx === i ? { ...s, [field]: val } : s))
  }

  function addLocalSet() {
    setLocalSets((prev) => [...prev, emptySet()])
  }

  function removeLocalSet(i) {
    setLocalSets((prev) => prev.filter((_, idx) => idx !== i))
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleSave()
    if (e.key === 'Escape') handleCancel()
  }

  return (
    <div className={`${styles.card} ${editing ? styles.editingWeight : ''}`}>
      {editMode && (
        <div className={styles.reorder}>
          <button className={styles.reorderBtn} onClick={onMoveUp} disabled={index === 0}>▲</button>
          <span className={styles.idx}>{index + 1}</span>
          <button className={styles.reorderBtn} onClick={onMoveDown} disabled={index === total - 1}>▼</button>
        </div>
      )}

      <div className={styles.cardMain}>
      <span className={styles.name}>{exercise.name}</span>

      {editing ? (
        <div className={styles.setsEdit}>
          {localSets.map((s, i) => (
            <div key={i} className={styles.setInputRow}>
              <div className={styles.inputCol}>
                {i === 0 && <span className={styles.inputLabel}>Séries</span>}
                <input
                  ref={i === 0 ? firstRepsRef : null}
                  className={styles.weightInput}
                  type="number" min="0" step="1"
                  value={s.series} placeholder="0"
                  onChange={(e) => updateLocalSet(i, 'series', e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>
              <span className={`${styles.xSep} ${i === 0 ? styles.xSepLabeled : ''}`}>x</span>
              <div className={styles.inputCol}>
                {i === 0 && <span className={styles.inputLabel}>Rep</span>}
                <input
                  className={styles.weightInput}
                  type="number" min="0" step="1"
                  value={s.reps} placeholder="0"
                  onChange={(e) => updateLocalSet(i, 'reps', e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>
              <span className={`${styles.xSep} ${i === 0 ? styles.xSepLabeled : ''}`}>x</span>
              <div className={styles.inputCol}>
                {i === 0 && <span className={styles.inputLabel}>Carga</span>}
                <input
                  className={`${styles.weightInput} ${styles.weightInputCarga}`}
                  type="number" min="0" step="0.5"
                  value={s.weight} placeholder="0"
                  onChange={(e) => updateLocalSet(i, 'weight', e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>
              {i > 0 && (
                <button className={styles.removeSetBtn} onClick={() => removeLocalSet(i)}>×</button>
              )}
            </div>
          ))}
          {localSets.length < 5 && (
            <button className={styles.addSetInlineBtn} onClick={addLocalSet}>+ série</button>
          )}
          <div className={styles.editActions}>
            <button className={styles.saveBtn} onClick={handleSave}>Salvar</button>
            <button className={styles.cancelEdit} onClick={handleCancel}>✕</button>
          </div>
        </div>
      ) : (
        <div className={styles.right}>
          <div className={styles.setsDisplay}>
            {sets.map((s, i) => (
              <div key={i} className={styles.setDisplayRow}>
                <div className={styles.displayCol}>
                  {i === 0 && <span className={styles.displayLabel}>Séries</span>}
                  <span className={styles.displayBox}>{formatSet(s).se}</span>
                </div>
                <span className={`${styles.xSep} ${i === 0 ? styles.xSepLabeled : ''}`}>x</span>
                <div className={styles.displayCol}>
                  {i === 0 && <span className={styles.displayLabel}>Rep</span>}
                  <span className={styles.displayBox}>{formatSet(s).r}</span>
                </div>
                <span className={`${styles.xSep} ${i === 0 ? styles.xSepLabeled : ''}`}>x</span>
                <div className={styles.displayCol}>
                  {i === 0 && <span className={styles.displayLabel}>Carga</span>}
                  <span className={`${styles.displayBox} ${styles.displayBoxCarga}`}>{formatSet(s).w}</span>
                </div>
              </div>
            ))}
          </div>
          <button className={styles.editBtn} onClick={() => setEditing(true)} title="Editar">
            <EditIcon />
          </button>
        </div>
      )}
      </div>

      {editMode && (
        <button className={styles.removeBtn} onClick={onRemove} title="Remover">×</button>
      )}
    </div>
  )
}
