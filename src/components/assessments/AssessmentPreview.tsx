import { Badge } from "@/components/ui/badge"
import { Eye, AlertCircle, CheckCircle2 } from "lucide-react"

// Define types locally
interface AssessmentQuestion {
  id: string
  type: "single-choice" | "multi-choice" | "short-text" | "long-text" | "numeric" | "file-upload"
  question: string
  required: boolean
  options?: string[]
  validation?: {
    minLength?: number
    maxLength?: number
    min?: number
    max?: number
  }
  conditionalLogic?: {
    dependsOn: string
    condition: string
    value: string
  }
}

interface AssessmentSection {
  id: string
  title: string
  description?: string
  questions: AssessmentQuestion[]
}

interface Assessment {
  id: string
  jobId: string
  title: string
  description: string
  sections: AssessmentSection[]
  createdAt: string
  updatedAt: string
}

interface AssessmentPreviewProps {
  assessment: Assessment
}

export function AssessmentPreview({ assessment }: AssessmentPreviewProps) {
  const totalQuestions = assessment.sections.reduce((sum, section) => sum + section.questions.length, 0)
  const totalSections = assessment.sections.length

  return (
    <div className="space-y-6">
      {/* Preview Header */}
      <div className="bg-slate-100 border border-slate-200 rounded-lg shadow-sm">
        <div className="p-6 pb-4">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center">
              <Eye className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Live Preview</h3>
              <p className="text-sm text-slate-600">This is how candidates will see your assessment</p>
            </div>
          </div>
          
          {/* Assessment Stats */}
          <div className="flex items-center space-x-4 text-sm text-slate-600">
            <div className="flex items-center space-x-1">
              <span>{totalSections}</span>
              <span>section{totalSections !== 1 ? 's' : ''}</span>
            </div>
            <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
            <div className="flex items-center space-x-1">
              <span>{totalQuestions}</span>
              <span>question{totalQuestions !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Content */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
        <div className="p-8">
          {/* Assessment Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-3">{assessment.title}</h1>
            {assessment.description && (
              <p className="text-lg text-slate-600 leading-relaxed">{assessment.description}</p>
            )}
          </div>

          {/* Sections */}
          <div className="space-y-8">
            {assessment.sections.map((section, sectionIndex) => (
              <div key={section.id} className="space-y-6">
                {/* Section Header */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
                  <div className="flex items-center space-x-3 mb-2">
                    <Badge variant="outline" className="bg-white border-slate-300 text-slate-700">
                      Section {sectionIndex + 1}
                    </Badge>
                    <h2 className="text-xl font-semibold text-slate-900">{section.title}</h2>
                  </div>
                  {section.description && (
                    <p className="text-slate-600 mt-2">{section.description}</p>
                  )}
                </div>

                {/* Questions */}
                <div className="space-y-4">
                  {section.questions.map((question, questionIndex) => (
                    <div key={question.id} className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
                      <div className="space-y-4">
                        {/* Question Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3 flex-1">
                            <Badge variant="outline" className="text-xs mt-0.5 bg-slate-100 border-slate-300">
                              {sectionIndex + 1}.{questionIndex + 1}
                            </Badge>
                            <div className="flex-1">
                              <p className="text-base font-medium text-slate-900 leading-relaxed">
                                {question.question}
                                {question.required && <span className="text-red-500 ml-1">*</span>}
                              </p>
                              
                              {/* Question Type Badge */}
                              <div className="mt-2">
                                <Badge variant="secondary" className="text-xs">
                                  {question.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Question Content */}
                        <div className="ml-12">
                          {question.type === "single-choice" && (
                            <div className="space-y-3">
                              {(question.options || []).map((option, index) => (
                                <div key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                                  <div className="w-4 h-4 border-2 border-slate-400 rounded-full bg-white"></div>
                                  <span className="text-sm text-slate-700">{option}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {question.type === "multi-choice" && (
                            <div className="space-y-3">
                              {(question.options || []).map((option, index) => (
                                <div key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                                  <div className="w-4 h-4 border-2 border-slate-400 rounded bg-white"></div>
                                  <span className="text-sm text-slate-700">{option}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {question.type === "short-text" && (
                            <div className="w-full h-11 border-2 border-slate-300 rounded-lg bg-slate-50/50 px-3 flex items-center">
                              <span className="text-sm text-slate-400">Enter your answer...</span>
                            </div>
                          )}

                          {question.type === "long-text" && (
                            <div className="w-full h-28 border-2 border-slate-300 rounded-lg bg-slate-50/50 p-3">
                              <span className="text-sm text-slate-400">Enter your detailed answer...</span>
                            </div>
                          )}

                          {question.type === "numeric" && (
                            <div className="w-48 h-11 border-2 border-slate-300 rounded-lg bg-slate-50/50 px-3 flex items-center">
                              <span className="text-sm text-slate-400">Enter a number...</span>
                            </div>
                          )}

                          {question.type === "file-upload" && (
                            <div className="w-full h-20 border-2 border-dashed border-slate-300 rounded-lg bg-slate-50/50 flex flex-col items-center justify-center space-y-2">
                              <div className="w-8 h-8 text-slate-400">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                              </div>
                              <span className="text-sm text-slate-400">Click to upload file</span>
                            </div>
                          )}

                          {/* Validation Info */}
                          {question.validation && (
                            <div className="mt-3 flex items-center space-x-2 text-xs text-slate-500 bg-slate-50 p-2 rounded">
                              <AlertCircle className="h-3 w-3 flex-shrink-0" />
                              <span>
                                {question.validation.minLength && `Min: ${question.validation.minLength} chars`}
                                {question.validation.maxLength && ` Max: ${question.validation.maxLength} chars`}
                                {question.validation.min !== undefined && `Min value: ${question.validation.min}`}
                                {question.validation.max !== undefined && ` Max value: ${question.validation.max}`}
                              </span>
                            </div>
                          )}

                          {/* Conditional Logic Info */}
                          {question.conditionalLogic && (
                            <div className="mt-3 flex items-center space-x-2 text-xs text-blue-600 bg-blue-50 p-2 rounded border border-blue-200">
                              <CheckCircle2 className="h-3 w-3 flex-shrink-0" />
                              <span className="italic">
                                Conditional: Shows when previous answer {question.conditionalLogic.condition} "{question.conditionalLogic.value}"
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Preview Footer */}
          <div className="mt-8 pt-8 border-t border-slate-200">
            <div className="flex justify-between items-center">
              <div className="text-sm text-slate-600">
                Assessment preview - candidates will see a submit button here
              </div>
              <div className="bg-slate-200 text-slate-500 px-6 py-2 rounded-lg text-sm font-medium">
                Submit Assessment (Preview Only)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}