import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Briefcase, Users, FileText, ArrowRight } from "lucide-react"
import { useDebounce } from "@/hooks/use-debounce"

interface SearchResult {
  id: string
  title: string
  type: "job" | "candidate" | "assessment"
  description?: string
  url: string
}

interface SearchCommandProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SearchCommand({ open, onOpenChange }: SearchCommandProps) {
  const navigate = useNavigate()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const debouncedQuery = useDebounce(query, 150)

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([])
      return
    }

    const searchData = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`)
        if (!response.ok) throw new Error("Search failed")
        const data = await response.json()
        setResults(data.results)
      } catch (error) {
        console.error("Search error:", error)
        setResults([])
      } finally {
        setLoading(false)
      }
    }

    searchData()
  }, [debouncedQuery])

  const handleSelect = (result: SearchResult) => {
    navigate(result.url)
    onOpenChange(false)
    setQuery("")
    setSelectedIndex(0)
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault()
          setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1))
          break
        case "ArrowUp":
          e.preventDefault()
          setSelectedIndex((prev) => Math.max(prev - 1, 0))
          break
        case "Enter":
          e.preventDefault()
          if (results[selectedIndex]) {
            handleSelect(results[selectedIndex])
          }
          break
        case "Escape":
          e.preventDefault()
          onOpenChange(false)
          break
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [open, results, selectedIndex])

  // Reset index when results change
  useEffect(() => {
    setSelectedIndex(0)
  }, [results])

  const getIcon = (type: string) => {
    switch (type) {
      case "job":
        return <Briefcase className="h-4 w-4" />
      case "candidate":
        return <Users className="h-4 w-4" />
      case "assessment":
        return <FileText className="h-4 w-4" />
      default:
        return <Search className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "job":
        return "bg-primary/10 text-primary"
      case "candidate":
        return "bg-secondary/10 text-secondary"
      case "assessment":
        return "bg-accent/10 text-accent"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0">
        <div className="flex items-center border-b px-4 py-3">
          <Search className="h-4 w-4 text-muted-foreground mr-3" />
          <Input
            placeholder="Search jobs, candidates, assessments..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border-0 focus-visible:ring-0 text-base"
            autoFocus
          />
        </div>

        <div className="max-h-96 overflow-y-auto">
          {loading && <div className="p-4 text-center text-muted-foreground">Searching...</div>}

          {!loading && results.length === 0 && query && (
            <div className="p-4 text-center text-muted-foreground">No results found for "{query}"</div>
          )}

          {!loading && results.length === 0 && !query && (
            <div className="p-4 text-center text-muted-foreground">
              Start typing to search across jobs, candidates, and assessments
            </div>
          )}

          {results.map((result, index) => (
            <Button
              key={result.id}
              variant="ghost"
              className={`w-full justify-start p-4 h-auto hover:bg-muted/50 ${
                index === selectedIndex ? "bg-muted/50" : ""
              }`}
              onClick={() => handleSelect(result)}
            >
              <div className="flex items-center space-x-3 w-full">
                <div className={`p-2 rounded-lg ${getTypeColor(result.type)}`}>{getIcon(result.type)}</div>
                <div className="flex-1 text-left">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{result.title}</span>
                    <Badge variant="outline" className="text-xs capitalize">
                      {result.type}
                    </Badge>
                  </div>
                  {result.description && <p className="text-sm text-muted-foreground mt-1">{result.description}</p>}
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </Button>
          ))}
        </div>

        {results.length > 0 && (
          <div className="border-t px-4 py-3 text-xs text-muted-foreground">
            Use ↑↓ to navigate, Enter to select, Esc to close
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
