import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Search, X } from "lucide-react"

interface CandidatesFiltersProps {
  filters: {
    search: string
    stage: string
  }
  onFilterChange: (filters: Partial<CandidatesFiltersProps["filters"]>) => void
  loading: boolean
}

const stages = [
  { value: "applied", label: "Applied" },
  { value: "screen", label: "Screening" },
  { value: "tech", label: "Technical" },
  { value: "offer", label: "Offer" },
  { value: "hired", label: "Hired" },
  { value: "rejected", label: "Rejected" },
]

export function CandidatesFilters({ filters, onFilterChange, loading }: CandidatesFiltersProps) {
  const handleClearFilters = () => {
    onFilterChange({ search: "", stage: "" })
  }

  const hasActiveFilters = filters.search || filters.stage

  return (
    <div className="flex flex-col sm:flex-row gap-4 p-4 bg-card rounded-lg border border-border">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search candidates by name or email..."
          value={filters.search}
          onChange={(e) => onFilterChange({ search: e.target.value })}
          className="pl-10"
          disabled={loading}
        />
      </div>

      <Select value={filters.stage} onValueChange={(value) => onFilterChange({ stage: value })} disabled={loading}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="All stages" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All stages</SelectItem>
          {stages.map((stage) => (
            <SelectItem key={stage.value} value={stage.value}>
              {stage.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <Button
          variant="outline"
          onClick={handleClearFilters}
          disabled={loading}
          className="w-full sm:w-auto bg-transparent"
        >
          <X className="h-4 w-4 mr-2" />
          Clear
        </Button>
      )}
    </div>
  )
}