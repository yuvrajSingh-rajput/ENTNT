import { useNavigate } from "react-router-dom" 
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Eye, FileText } from "lucide-react"
import type { Job, Assessment } from "@/lib/seed-data"

interface AssessmentsListProps {
  jobs: Job[]
  assessments: Record<string, Assessment>
  loading: boolean
  error: string | null
  onCreateAssessment: (jobId: string) => void
  onEditAssessment: (jobId: string) => void
}

export function AssessmentsList({
  jobs,
  assessments,
  loading,
  error,
  onCreateAssessment,
  onEditAssessment,
}: AssessmentsListProps) {
  const navigate = useNavigate() // Changed from useRouter

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse rounded-xl shadow-md border-0">
            <CardHeader>
              <div className="h-6 bg-slate-200/70 rounded w-2/3 mb-2"></div>
              <div className="h-4 bg-slate-200/70 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-4 bg-slate-200/70 rounded w-full mb-3"></div>
              <div className="h-8 bg-slate-200/70 rounded w-1/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card className="rounded-xl shadow-md border-0">
        <CardContent className="py-12 text-center">
          <p className="text-red-600 font-medium">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (jobs.length === 0) {
    return (
      <Card className="rounded-xl shadow-md border-0">
        <CardContent className="py-16 text-center">
          <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No active jobs found</h3>
          <p className="text-slate-500">Create some active jobs first to build assessments for them.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {jobs.map((job) => {
        const assessment = assessments[job.id]
        const questionCount = assessment?.sections.reduce((total, section) => total + section.questions.length, 0) || 0

        return (
          <Card
            key={job.id}
            className="group hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-[1.02] rounded-xl border-0 shadow-md bg-white"
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-xl font-semibold text-slate-900 mb-3">{job.title}</CardTitle>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge
                      variant="outline"
                      className="text-xs bg-slate-100 text-slate-700 border-slate-200"
                    >
                      {job.location}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="text-xs capitalize bg-slate-100 text-slate-700 border-slate-200"
                    >
                      {job.type}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {assessment ? (
                <div className="space-y-4">
                  <div className="text-sm text-slate-500">
                    <strong>{assessment.sections.length}</strong> sections, <strong>{questionCount}</strong> questions
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-2">{assessment.description}</p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditAssessment(job.id)}
                      className="flex-1 hover:bg-slate-100"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/assessments/${job.id}/take`)} // Changed from router.push
                      className="flex-1 hover:bg-slate-100"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-slate-500">No assessment created yet for this position.</p>
                  <Button
                    onClick={() => onCreateAssessment(job.id)}
                    className="w-full bg-slate-800 hover:bg-slate-900 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Assessment
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}