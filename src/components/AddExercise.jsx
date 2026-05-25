import { useState, useRef, useEffect } from 'react'
import styles from './AddExercise.module.css'

export default function AddExercise({
  allExercises,
  currentExercises,
  onAdd,
  onAddCustom,
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const inputRef = useRef(null)
  const containerRef = useRef(null)

  function normalize(str) {
    return str.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  }

  const filtered = query.trim()
    ? allExercises.filter((ex) => normalize(ex).includes(normalize(query)))
    : allExercises

  const queryIsNew =
    query.trim().length > 0 &&
    !allExercises.some((ex) => normalize(ex) === normalize(query.trim()))

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
    } else {
      setQuery('')
    }
  }, [open])

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleSelect(name) {
    onAdd(name)
    setQuery('')
    inputRef.current?.focus()
  }

  async function handleAddCustom() {
    const name = await onAddCustom(query)
    if (name) {
      onAdd(name)
      setQuery('')
      inputRef.current?.focus()
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Escape') setOpen(false)
    if (e.key === 'Enter' && queryIsNew) handleAddCustom()
    if (e.key === 'Enter' && !queryIsNew && filtered.length === 1) handleSelect(filtered[0])
  }

  return (
    <div ref={containerRef} className={styles.container}>
      {!open ? (
        <button className={styles.addButton} onClick={() => setOpen(true)}>
          <span className={styles.plus}>+</span> Adicionar Exercício
        </button>
      ) : (
        <div className={styles.panel}>
          <div className={styles.searchRow}>
            <input
              ref={inputRef}
              className={styles.searchInput}
              type="text"
              placeholder="Buscar exercício..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button className={styles.cancelBtn} onClick={() => setOpen(false)}>
              Cancelar
            </button>
          </div>

          <div className={styles.dropdown}>
            {queryIsNew && (
              <button
                className={`${styles.option} ${styles.newOption}`}
                onClick={handleAddCustom}
              >
                <span className={styles.newIcon}>+</span>
                Criar "{query.trim()}"
              </button>
            )}

            {filtered.length === 0 && !queryIsNew && (
              <div className={styles.noResults}>Nenhum exercício encontrado</div>
            )}

            {filtered.map((ex) => {
              const alreadyAdded = currentExercises.includes(ex)
              return (
                <button
                  key={ex}
                  className={`${styles.option} ${alreadyAdded ? styles.added : ''}`}
                  onClick={() => !alreadyAdded && handleSelect(ex)}
                  disabled={alreadyAdded}
                >
                  {ex}
                  {alreadyAdded && <span className={styles.addedTag}>adicionado</span>}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
