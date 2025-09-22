import { useState, useEffect, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Navigation } from "@/components/layout/Navigation"
import { AssessmentBuilder } from "@/components/assessments/AssessmentBuilder"
import { AssessmentPreview } from "@/components/assessments/AssessmentPreview"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Eye, EyeOff } from "lucide-react"
import type { Job, Assessment } from "@/lib/seed-data"

export default function AssessmentBuilderPage() {
  const { jobId } = useParams<{ jobId: string }>() 
  const navigate = useNavigate() 

  const [job, setJob] = useState<Job | null>(null)
  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch job
        const jobsResponse = await fetch("/api/jobs?search=&status=&page=1&pageSize=100&sort=order")
        if (!jobsResponse.ok) throw new Error("Failed to fetch jobs")
        const jobsData = await jobsResponse.json()
        const foundJob = jobsData.jobs.find((j: Job) => j.id === jobId)

        if (!foundJob) {
          setError("Job not found")
          return
        }
        setJob(foundJob)

        // Fetch existing assessment
        const assessmentResponse = await fetch(`/api/assessments/${jobId}`)
        if (assessmentResponse.ok) {
          const data = await assessmentResponse.json()
          if (data.assessment) {
            setAssessment(data.assessment)
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    if (jobId) {
      fetchData()
    }
  }, [jobId])

  const handleAssessmentChange = useCallback((updatedAssessment: Assessment) => {
    setAssessment(updatedAssessment)
  }, [])

  const handleSave = useCallback(
    async (assessmentData: Assessment) => {
      try {
        const response = await fetch(`/api/assessments/${jobId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(assessmentData),
        })

        if (!response.ok) throw new Error("Failed to save assessment")

        const savedAssessment = await response.json()
        setAssessment(savedAssessment)
        return savedAssessment
      } catch (error) {
        console.error("Failed to save assessment:", error)
        throw error
      }
    },
    [jobId]
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-muted rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-96 bg-muted rounded"></div>
              <div className="h-96 bg-muted rounded"></div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <Button variant="ghost" onClick={() => navigate("/assessments")} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Assessments
          </Button>
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-foreground mb-2">{error || "Job not found"}</h2>
            <p className="text-muted-foreground">
              The job you're looking for doesn't exist or has been removed.
            </p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => navigate("/assessments")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Assessments
          </Button>

          <Button variant="outline" onClick={() => setShowPreview(!showPreview)}>
            {showPreview ? (
              <>
                <EyeOff className="h-4 w-4 mr-2" />
                Hide Preview
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Show Preview
              </>
            )}
          </Button>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Assessment Builder: {job.title}</h1>
          <p className="text-muted-foreground">
            Create and customize assessment questions for this position
          </p>
        </div>

        <div className={`grid gap-6 ${showPreview ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"}`}>
          <div className="space-y-6">
            <AssessmentBuilder
              job={job}
              assessment={assessment}
              onAssessmentChange={handleAssessmentChange}
              onSave={handleSave}
            />
          </div>

          {showPreview && assessment && (
            <div className="space-y-6">
              <AssessmentPreview assessment={assessment} />
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
