import { useMemo, useState } from 'react'
import { IconCalendar, IconChevronLeft, IconChevronRight } from './Icons.jsx'
import { getColombianHolidays } from '../data/holidays.js'

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]
const WEEKDAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

const NOW = new Date()
const TODAY_KEY = keyOf(NOW.getFullYear(), NOW.getMonth(), NOW.getDate())

function keyOf(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

export default function CorporateCalendar() {
  const [view, setView] = useState({ year: NOW.getFullYear(), month: NOW.getMonth() })
  const [selected, setSelected] = useState(null)

  const holidays = useMemo(() => getColombianHolidays(view.year), [view.year])

  const weeks = useMemo(() => {
    const first = new Date(view.year, view.month, 1)
    const days = new Date(view.year, view.month + 1, 0).getDate()
    const offset = (first.getDay() + 6) % 7
    const cells = []
    for (let i = 0; i < offset; i += 1) cells.push(null)
    for (let d = 1; d <= days; d += 1) cells.push(d)
    while (cells.length % 7 !== 0) cells.push(null)
    const rows = []
    for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7))
    return rows
  }, [view])

  const shift = (delta) => {
    setSelected(null)
    setView((v) => {
      const m = v.month + delta
      return { year: v.year + Math.floor(m / 12), month: ((m % 12) + 12) % 12 }
    })
  }

  const goToday = () => {
    setSelected(null)
    setView({ year: NOW.getFullYear(), month: NOW.getMonth() })
  }

  const detail = selected ? getColombianHolidays(Number(selected.slice(0, 4)))[selected] : null
  const detailParts = selected ? selected.split('-').map(Number) : null

  return (
    <section className="cal card" aria-labelledby="cal-title">
      <div className="card__head">
        <IconCalendar className="card__head-icon" width={20} height={20} />
        <h2 id="cal-title" className="card__title">Calendario corporativo</h2>
        <button type="button" className="card__link cal__today" onClick={goToday}>
          Hoy
        </button>
      </div>

      <div className="cal__body">
        <div className="cal__nav">
          <button type="button" onClick={() => shift(-1)} aria-label="Mes anterior">
            <IconChevronLeft width={16} height={16} />
          </button>
          <strong>{MONTHS[view.month]} {view.year}</strong>
          <button type="button" onClick={() => shift(1)} aria-label="Mes siguiente">
            <IconChevronRight width={16} height={16} />
          </button>
        </div>

        <table className="cal__grid">
          <thead>
            <tr>
              {WEEKDAYS.map((w, i) => (
                <th key={i} scope="col">{w}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weeks.map((row, ri) => (
              <tr key={ri}>
                {row.map((day, ci) => {
                  if (!day) return <td key={ci} className="cal__cell is-empty" />
                  const k = keyOf(view.year, view.month, day)
                  const holiday = holidays[k]
                  const isToday = k === TODAY_KEY

                  if (holiday) {
                    return (
                      <td key={ci} className="cal__cell">
                        <button
                          type="button"
                          className={`cal__day is-holiday${isToday ? ' is-today' : ''}${
                            selected === k ? ' is-selected' : ''
                          }`}
                          title={holiday.name}
                          aria-pressed={selected === k}
                          onClick={() => setSelected(selected === k ? null : k)}
                        >
                          {day}
                        </button>
                      </td>
                    )
                  }

                  return (
                    <td key={ci} className="cal__cell">
                      <span className={`cal__day${isToday ? ' is-today' : ''}`}>{day}</span>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>

        <div className="cal__legend">
          <span><i className="cal__key cal__key--red" />Festivo</span>
          <span><i className="cal__key cal__key--today" />Hoy</span>
        </div>

        <div className="cal__detail">
          {detail ? (
            <div className="cal__event">
              <div className="cal__date cal__date--red">
                <span className="cal__date-day">{detailParts[2]}</span>
                <span className="cal__date-mon">
                  {MONTHS[detailParts[1] - 1].slice(0, 3).toUpperCase()}
                </span>
              </div>
              <div className="cal__event-info">
                <p className="cal__event-name">
                  {detail.name}
                  <span className="cal__badge">Festivo</span>
                </p>
                <p className="cal__detail-desc">{detail.description}</p>
                {detail.moved && (
                  <p className="cal__detail-moved">
                    Trasladado al lunes por la Ley Emiliani.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <p className="cal__detail-hint">
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
