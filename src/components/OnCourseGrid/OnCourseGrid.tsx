import type { C123OnCourseCompetitor, C123RaceConfigData } from '../../types/c123server'
import { parseGatesWithConfig, formatPenalty, getPenaltyClass } from '../../utils/gates'
import './OnCourseGrid.css'

export interface OnCourseGridProps {
  competitors: C123OnCourseCompetitor[]
  raceConfig: C123RaceConfigData | null
  selectedRaceId: string | null
}

export function OnCourseGrid({
  competitors,
  raceConfig,
  selectedRaceId,
}: OnCourseGridProps) {
  // Filter competitors by selected race
  const filteredCompetitors = selectedRaceId
    ? competitors.filter((c) => c.raceId === selectedRaceId)
    : competitors

  // Sort by position (1 = closest to finish)
  const sortedCompetitors = [...filteredCompetitors].sort(
    (a, b) => a.position - b.position
  )

  const nrGates = raceConfig?.nrGates ?? 0
  const gateConfig = raceConfig?.gateConfig ?? ''

  if (sortedCompetitors.length === 0) {
    return (
      <div className="on-course-grid on-course-grid--empty">
        <p>No competitors on course</p>
      </div>
    )
  }

  return (
    <div className="on-course-grid">
      <table className="on-course-table">
        <thead>
          <tr>
            <th className="col-pos">#</th>
            <th className="col-bib">Bib</th>
            <th className="col-name">Name</th>
            <th className="col-time">Time</th>
            <th className="col-pen">Pen</th>
            {Array.from({ length: nrGates }, (_, i) => {
              const gateType = gateConfig[i] ?? 'N'
              return (
                <th
                  key={i + 1}
                  className={`col-gate ${gateType === 'R' ? 'gate-reverse' : 'gate-normal'}`}
                >
                  {i + 1}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {sortedCompetitors.map((competitor) => {
            const penalties = parseGatesWithConfig(competitor.gates, gateConfig)

            return (
              <tr
                key={competitor.bib}
                className={`competitor-row ${competitor.completed ? 'completed' : 'on-course'}`}
              >
                <td className="col-pos">{competitor.position}</td>
                <td className="col-bib">{competitor.bib}</td>
                <td className="col-name">
                  <span className="name">{competitor.name}</span>
                  <span className="club">{competitor.club}</span>
                </td>
                <td className="col-time">{competitor.time}s</td>
                <td className="col-pen">{competitor.pen > 0 ? `+${competitor.pen}` : ''}</td>
                {penalties.map((penalty) => (
                  <td
                    key={penalty.gate}
                    className={`col-gate ${getPenaltyClass(penalty.value)} ${penalty.type === 'R' ? 'gate-reverse' : 'gate-normal'}`}
                  >
                    {formatPenalty(penalty.value)}
                  </td>
                ))}
                {/* Fill remaining columns if competitor has fewer gates than config */}
                {penalties.length < nrGates &&
                  Array.from({ length: nrGates - penalties.length }, (_, i) => (
                    <td key={`empty-${i}`} className="col-gate penalty-empty" />
                  ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
