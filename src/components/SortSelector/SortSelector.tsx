import { Select } from '@opencanoetiming/timing-design-system'
import type { ResultsSortOption } from '../../types/ui'
import { RESULTS_SORT_LABELS } from '../../types/ui'
import './SortSelector.css'

export interface SortSelectorProps {
  value: ResultsSortOption
  onChange: (value: ResultsSortOption) => void
}

const SORT_OPTIONS: ResultsSortOption[] = ['startOrder', 'rank', 'bib']

export function SortSelector({ value, onChange }: SortSelectorProps) {
  return (
    <div className="sort-selector">
      <span className="sort-selector__label">Sort:</span>
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value as ResultsSortOption)}
        size="sm"
        aria-label="Sort competitors by"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {RESULTS_SORT_LABELS[option]}
          </option>
        ))}
      </Select>
    </div>
  )
}
