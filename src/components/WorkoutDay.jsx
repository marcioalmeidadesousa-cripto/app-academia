import { useState, useEffect } from 'react'
import ExerciseCard from './ExerciseCard'
import AddExercise from './AddExercise'
import styles from './WorkoutDay.module.css'

const MAX_EXERCISES = 9

const DAY_FULL = {
  Seg: 'Segunda',
  Ter: 'Terça',
  Qua: 'Quarta',
  Qui: 'Quinta',
  Sex: 'Sexta',
  Sáb: 'Sábado',
}

export default function WorkoutDay({
  day,
  exercises,
  allExercises,
  onAdd,
  onRemove,
  onUpdateExercise,
  onReorder,
  onAddCustom,
}) {
  const [editMode, setEditMode] = useState(false)

  useEffect(() => {
    setEditMode(false)
  }, [day])

  const atLimit = exercises.length >= MAX_EXERCISES
  const count = exercises.length
  const countLabel = `${count} exercício${count !== 1 ? 's' : ''}`

  return (
    <div className={styles.container}>
      <div className={styles.subHeader}>
        <span className={styles.dayLabel}>
          {DAY_FULL[day]} · {countLabel}
        </span>
        {count > 0 && (
          <button
            className={`${styles.editToggle} ${editMode ? styles.editToggleActive : ''}`}
            onClick={() => setEditMode((e) => !e)}
          >
            {editMode ? 'Concluir' : 'Alterar'}
          </button>
        )}
      </div>

      {count === 0 ? (
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>📋</span>
          <p>Nenhum exercício configurado</p>
          <p className={styles.emptyHint}>Toque em Alterar para montar seu treino</p>
        </div>
      ) : (
        <div className={styles.list}>
          {exercises.map((exercise, index) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              index={index}
              total={exercises.length}
              editMode={editMode}
              onRemove={() => onRemove(exercise.id)}
              onUpdateExercise={(weight, reps) => onUpdateExercise(exercise.id, weight, reps)}
              onMoveUp={() => {
                if (index === 0) return
                const r = [...exercises]
                ;[r[index - 1], r[index]] = [r[index], r[index - 1]]
                onReorder(r)
              }}
              onMoveDown={() => {
                if (index === exercises.length - 1) return
                const r = [...exercises]
                ;[r[index], r[index + 1]] = [r[index + 1], r[index]]
                onReorder(r)
              }}
            />
          ))}
        </div>
      )}

      {editMode && (
        atLimit ? (
          <p className={styles.limitMsg}>Limite de {MAX_EXERCISES} exercícios por dia atingido</p>
        ) : (
          <AddExercise
            allExercises={allExercises}
            currentExercises={exercises.map((e) => e.name)}
            onAdd={onAdd}
            onAddCustom={onAddCustom}
          />
        )
      )}

      {count === 0 && (
        <button
          className={styles.emptyAddBtn}
          onClick={() => setEditMode(true)}
        >
          + Montar Treino
        </button>
      )}
    </div>
  )
}
