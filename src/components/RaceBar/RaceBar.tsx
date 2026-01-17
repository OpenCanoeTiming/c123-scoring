import { Select, LiveBadge, Badge } from '@opencanoetiming/timing-design-system'
import type { ProcessedRace } from '../../hooks/useSchedule'
import './RaceBar.css'

interface RaceBarProps {
  races: ProcessedRace[]
  selectedRaceId: string | null
  onSelectRace: (raceId: string) => void
  selectedRace: ProcessedRace | null
}

export function RaceBar({
  races,
  selectedRaceId,
  onSelectRace,
  selectedRace,
}: RaceBarProps) {
  return (
    <div className="race-bar">
      <div className="race-bar-main">
        {/* Large race name display */}
        <h1 className="race-bar-title">
          {selectedRace?.mainTitle || 'No race selected'}
        </h1>

        {/* Race selector and status */}
        <div className="race-bar-controls">
          {races.length === 0 ? (
            <Badge variant="neutral">No active races</Badge>
          ) : (
            <>
              <Select
                size="lg"
                value={selectedRaceId ?? ''}
                onChange={(e) => onSelectRace(e.target.value)}
                aria-label="Select race"
                className="race-bar-select"
              >
                <option value="" disabled>
                  Select race...
                </option>
                {races.map((race) => (
                  <option key={race.raceId} value={race.raceId}>
                    {race.isRunning ? '\u25B6 ' : ''}
                    {race.shortTitle}
                  </option>
                ))}
              </Select>
              {selectedRace?.isRunning && <LiveBadge />}
              {selectedRace && !selectedRace.isRunning && selectedRace.isFinished && (
                <Badge variant="info">Finished</Badge>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
