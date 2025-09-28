import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { EditJobDialog } from "./EditJobDialog"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import type { DropResult } from "@hello-pangea/dnd"
import { GripVertical, Edit, Archive, ArchiveRestore, Eye } from "lucide-react"
import { useToast } from "@/components/ui/toast-provider"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import type { Job } from "@/lib/seed-data"
import { useNavigate } from "react-router-dom"

interface JobsListProps {
  jobs: Job[]
  loading: boolean
  error: string | null
  pagination: {
    total: number
    totalPages: number
  }
  currentPage: number
  onPageChange: (page: number) => void
  onJobUpdated: () => void
  onViewJob?: (jobId: string) => void 
}

export const JobsList: React.FC<JobsListProps> = ({
  jobs,
  loading,
  error,
  pagination,
  currentPage,
  onPageChange,
  onJobUpdated,
}) => {
  const { addToast } = useToast()
  const [editingJob, setEditingJob] = useState<Job | null>(null)
  const [reorderLoading, setReorderLoading] = useState(false)
  const [optimisticJobs, setOptimisticJobs] = useState<Job[]>([])
  const navigate = useNavigate();

  useEffect(() => {
    setOptimisticJobs(jobs)
  }, [jobs])

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return

    const sourceIndex = result.source.index
    const destinationIndex = result.destination.index
    if (sourceIndex === destinationIndex) return

    const draggedJob = optimisticJobs[sourceIndex]
    const fromOrder = draggedJob.order
    const toOrder = optimisticJobs[destinationIndex].order

    const newJobs = Array.from(optimisticJobs)
    const [removed] = newJobs.splice(sourceIndex, 1)
    newJobs.splice(destinationIndex, 0, removed)
    setOptimisticJobs(newJobs)

    try {
      setReorderLoading(true)
      const response = await fetch(`/api/jobs/${draggedJob.id}/reorder`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fromOrder, toOrder }),
      })
      if (!response.ok) throw new Error("Failed to reorder job")

      addToast({
        title: "Job reordered",
        description: `"${draggedJob.title}" has been moved successfully.`,
        variant: "success",
      })
      onJobUpdated()
    } catch (err) {
      console.error(err)
      setOptimisticJobs(jobs)
      addToast({
        title: "Reorder failed",
        description: "Unable to reorder job. Please try again.",
        variant: "destructive",
      })
      onJobUpdated()
    } finally {
      setReorderLoading(false)
    }
  }

  const handleArchiveToggle = async (job: Job) => {
    try {
      const newStatus = job.status === "active" ? "archived" : "active"
      const response = await fetch(`/api/jobs/${job.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!response.ok) throw new Error("Failed to update job")

      addToast({
        title: `Job ${newStatus}`,
        description: `"${job.title}" has been ${newStatus}.`,
        variant: "success",
      })
      onJobUpdated()
    } catch (err) {
      console.error(err)
      addToast({
        title: "Update failed",
        description: "Unable to update job status. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-1/3"></div>
              <div className="h-4 bg-muted rounded w-1/2 mt-2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-4 bg-muted rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-destructive">{error}</p>
          <Button onClick={onJobUpdated} className="mt-4">
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (jobs.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <h3 className="text-lg font-semibold text-foreground mb-2">No jobs found</h3>
          <p className="text-muted-foreground">Try adjusting your filters or create a new job.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {reorderLoading && (
        <div className="flex items-center justify-center py-4">
          <LoadingSpinner className="mr-2" />
          <span className="text-sm text-muted-foreground">Reordering jobs...</span>
        </div>
      )}

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="jobs">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
              {optimisticJobs.map((job, index) => (
                <Draggable key={job.id} draggableId={job.id} index={index}>
                  {(provided, snapshot) => (
                    <Card
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`transition-all duration-200 ${
                        snapshot.isDragging ? "shadow-lg scale-105" : ""
                      } ${reorderLoading ? "opacity-50" : ""}`}
                    >
                      <CardHeader className="pb-3 flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <div
                            {...provided.dragHandleProps}
                            className="mt-1 text-muted-foreground hover:text-foreground cursor-grab"
                          >
                            <GripVertical className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="text-lg font-semibold text-foreground">{job.title}</h3>
                              <Badge
                                variant={job.status === "active" ? "default" : "secondary"}
                                className={
                                  job.status === "active"
                                    ? "bg-accent text-accent-foreground"
                                    : "bg-muted text-muted-foreground"
                                }
                              >
                                {job.status}
                              </Badge>
                            </div>
                            <div className="flex flex-wrap gap-2 mb-2">
                              {job.tags.map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {job.location && <span>{job.location} • </span>}
                              {job.type && <span className="capitalize">{job.type}</span>}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/jobs/${job.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setEditingJob(job)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleArchiveToggle(job)}>
                            {job.status === "active" ? <Archive className="h-4 w-4" /> : <ArchiveRestore className="h-4 w-4" />}
                          </Button>
                        </div>
                      </CardHeader>
                      {job.description && (
                        <CardContent className="pt-0">
                          <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>
                        </CardContent>
                      )}
                    </Card>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {jobs.length} of {pagination.total} jobs
          </p>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === pagination.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <EditJobDialog
        job={editingJob}
        open={!!editingJob}
        onOpenChange={(open) => !open && setEditingJob(null)}
        onJobUpdated={() => {
          setEditingJob(null)
          onJobUpdated()
        }}
      />
    </div>
  )
}
