import styles from './DayTabs.module.css'

export default function DayTabs({ days, selectedDay, onSelect }) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.tabs}>
        {days.map((day) => (
          <button
            key={day}
            className={`${styles.tab} ${selectedDay === day ? styles.active : ''}`}
            onClick={() => onSelect(day)}
          >
            {day}
          </button>
        ))}
      </div>
    </div>
  )
}
