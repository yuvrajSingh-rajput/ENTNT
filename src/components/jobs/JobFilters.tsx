import React from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Search, X } from "lucide-react"

interface JobFiltersProps {
  filters: {
    search: string
    status: string
    sort: string
  }
  onFilterChange: (filters: Partial<JobFiltersProps["filters"]>) => void
  loading: boolean
}

export const JobFilters: React.FC<JobFiltersProps> = ({ filters, onFilterChange, loading }) => {
  const handleClearFilters = () => {
    onFilterChange({ search: "", status: "", sort: "order" })
  }

  const hasActiveFilters = filters.search || filters.status || filters.sort !== "order"

  return (
    <div className="flex flex-col sm:flex-row gap-4 p-4 bg-card rounded-lg border border-border">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search jobs by title or tags..."
          value={filters.search}
          onChange={(e) => onFilterChange({ search: e.target.value })}
          className="pl-10"
          disabled={loading}
        />
      </div>

      <Select
        value={filters.status}
        onValueChange={(value) => onFilterChange({ status: value })}
        disabled={loading}
      >
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="All statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="archived">Archived</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.sort}
        onValueChange={(value) => onFilterChange({ sort: value })}
        disabled={loading}
      >
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="order">Order</SelectItem>
          <SelectItem value="title">Title</SelectItem>
          <SelectItem value="created">Created Date</SelectItem>
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
