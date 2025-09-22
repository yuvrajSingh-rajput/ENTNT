import { useState, useMemo } from "react"
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Eye, Mail } from "lucide-react"
import { useNavigate } from "react-router-dom" 

interface Candidate {
  id: string
  name: string
  email: string
  stage: "applied" | "screen" | "tech" | "offer" | "hired" | "rejected"
  createdAt: string
}

interface CandidatesKanbanProps {
  candidates: Candidate[]
  loading: boolean
  error: string | null
  onCandidateUpdated: () => void
}

const stages = [
  { id: "applied", title: "Applied", color: "bg-blue-50 border-blue-200" },
  { id: "screen", title: "Screening", color: "bg-yellow-50 border-yellow-200" },
  { id: "tech", title: "Technical", color: "bg-purple-50 border-purple-200" },
  { id: "offer", title: "Offer", color: "bg-green-50 border-green-200" },
  { id: "hired", title: "Hired", color: "bg-emerald-50 border-emerald-200" },
  { id: "rejected", title: "Rejected", color: "bg-red-50 border-red-200" },
]

export function CandidatesKanban({ candidates = [], loading, error, onCandidateUpdated }: CandidatesKanbanProps) {
  const navigate = useNavigate()
  const [dragLoading, setDragLoading] = useState(false)

  const candidatesByStage = useMemo(() => {
    const grouped: Record<string, Candidate[]> = {}
    stages.forEach((stage) => {
      grouped[stage.id] = candidates.filter((candidate) => candidate.stage === stage.id)
    })
    return grouped
  }, [candidates])

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return

    const { source, destination, draggableId } = result

    // If dropped in the same position, do nothing
    if (source.droppableId === destination.droppableId && source.index === destination.index) return

    const candidateId = draggableId
    const newStage = destination.droppableId as Candidate["stage"]

    try {
      setDragLoading(true)
      const response = await fetch(`/api/candidates/${candidateId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: newStage }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to update candidate stage: ${errorText}`)
      }

      onCandidateUpdated()
    } catch (error) {
      console.error("Failed to update candidate:", error)
      alert("Failed to update candidate. Please try again.")
      onCandidateUpdated() 
    } finally {
      setDragLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stages.map((stage) => (
          <div key={stage.id} className={`rounded-lg border-2 ${stage.color} p-4`}>
            <h3 className="font-semibold mb-4">{stage.title}</h3>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse bg-white rounded-lg border border-border shadow-sm p-4">
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 bg-muted rounded-full"></div>
                    <div className="h-4 bg-muted rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-border shadow-sm">
        <div className="py-8 text-center px-4">
          <p className="text-destructive">{error}</p>
          <Button onClick={onCandidateUpdated} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stages.map((stage) => (
          <div key={stage.id} className={`rounded-lg border-2 ${stage.color} p-4 min-h-[500px]`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">{stage.title}</h3>
              <Badge variant="secondary" className="text-xs">
                {candidatesByStage[stage.id]?.length || 0}
              </Badge>
            </div>

            <Droppable droppableId={stage.id}>
              {(provided, snapshot) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={`space-y-3 min-h-[400px] ${snapshot.isDraggingOver ? "bg-muted/50 rounded-md p-2" : ""}`}
                >
                  {candidatesByStage[stage.id]?.map((candidate, index) => {
                    const initials = candidate.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()

                    return (
                      <Draggable key={candidate.id} draggableId={candidate.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`bg-white rounded-lg border border-border shadow-sm cursor-grab hover:shadow-md transition-shadow ${
                              snapshot.isDragging ? "shadow-lg rotate-2" : ""
                            } ${dragLoading ? "opacity-50" : ""}`}
                          >
                            <div className="p-4 pb-2">
                              <div className="flex items-start justify-between">
                                <div className="flex items-center space-x-2 flex-1 min-w-0">
                                  <Avatar className="h-8 w-8 flex-shrink-0">
                                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                      {initials}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="min-w-0 flex-1">
                                    <h4 className="font-medium text-sm truncate">{candidate.name}</h4>
                                    <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                                      <Mail className="h-3 w-3 flex-shrink-0" />
                                      <span className="truncate">{candidate.email}</span>
                                    </div>
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    e.preventDefault()
                                    navigate(`/candidates/${candidate.id}`) 
                                  }}
                                  className="h-6 w-6 p-0 flex-shrink-0"
                                >
                                  <Eye className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            <div className="px-4 pb-4">
                              <div className="text-xs text-muted-foreground">
                                {new Date(candidate.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    )
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  )
}