import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Upload, CheckCircle2 } from "lucide-react"

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

interface AssessmentFormProps {
  assessment: Assessment
  onSubmit: (responses: Record<string, any>) => void
}

export function AssessmentForm({ assessment, onSubmit }: AssessmentFormProps) {
  const [responses, setResponses] = useState<Record<string, any>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  // Get all questions flattened for easier access
  const allQuestions = assessment.sections.flatMap((section) =>
    section.questions.map((q) => ({ ...q, sectionId: section.id })),
  )

  // Check if a question should be shown based on conditional logic
  const shouldShowQuestion = (question: AssessmentQuestion): boolean => {
    if (!question.conditionalLogic) return true

    const dependentResponse = responses[question.conditionalLogic.dependsOn]
    if (!dependentResponse) return false

    switch (question.conditionalLogic.condition) {
      case "equals":
        return dependentResponse === question.conditionalLogic.value
      case "not_equals":
        return dependentResponse !== question.conditionalLogic.value
      default:
        return true
    }
  }

  // Validate a single question
  const validateQuestion = (question: AssessmentQuestion, value: any): string | null => {
    if (question.required && (!value || (Array.isArray(value) && value.length === 0))) {
      return "This field is required"
    }

    if (question.type === "short-text" || question.type === "long-text") {
      if (value && question.validation?.minLength && value.length < question.validation.minLength) {
        return `Minimum ${question.validation.minLength} characters required`
      }
      if (value && question.validation?.maxLength && value.length > question.validation.maxLength) {
        return `Maximum ${question.validation.maxLength} characters allowed`
      }
    }

    if (question.type === "numeric") {
      const numValue = Number(value)
      if (value && isNaN(numValue)) {
        return "Please enter a valid number"
      }
      if (value && question.validation?.min !== undefined && numValue < question.validation.min) {
        return `Minimum value is ${question.validation.min}`
      }
      if (value && question.validation?.max !== undefined && numValue > question.validation.max) {
        return `Maximum value is ${question.validation.max}`
      }
    }

    return null
  }

  // Update response for a question
  const updateResponse = (questionId: string, value: any) => {
    setResponses((prev) => ({ ...prev, [questionId]: value }))

    // Clear error for this question
    if (errors[questionId]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[questionId]
        return newErrors
      })
    }
  }

  // Validate all visible questions
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    allQuestions.forEach((question) => {
      if (shouldShowQuestion(question)) {
        const error = validateQuestion(question, responses[question.id])
        if (error) {
          newErrors[question.id] = error
        }
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      setSubmitting(true)
      await onSubmit(responses)
    } catch (error) {
      console.error("Failed to submit assessment:", error)
    } finally {
      setSubmitting(false)
    }
  }

  // Calculate progress
  const totalVisibleQuestions = allQuestions.filter(shouldShowQuestion).length
  const answeredQuestions = allQuestions.filter(q => 
    shouldShowQuestion(q) && responses[q.id] && 
    (Array.isArray(responses[q.id]) ? responses[q.id].length > 0 : true)
  ).length
  const progressPercentage = totalVisibleQuestions > 0 ? (answeredQuestions / totalVisibleQuestions) * 100 : 0

  const renderQuestion = (question: AssessmentQuestion & { sectionId: string }) => {
    if (!shouldShowQuestion(question)) return null

    const value = responses[question.id]
    const error = errors[question.id]
    const isAnswered = value && (Array.isArray(value) ? value.length > 0 : true)

    return (
      <div key={question.id} className="space-y-3 p-6 bg-white rounded-lg border border-slate-200 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <Label className="text-base font-medium text-slate-900">
              {question.question}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </Label>

            {/* Show validation hints */}
            {question.validation && (
              <div className="text-xs text-slate-500 space-x-2">
                {question.validation.minLength && <span>Min: {question.validation.minLength} chars</span>}
                {question.validation.maxLength && <span>Max: {question.validation.maxLength} chars</span>}
                {question.validation.min !== undefined && <span>Min: {question.validation.min}</span>}
                {question.validation.max !== undefined && <span>Max: {question.validation.max}</span>}
              </div>
            )}
          </div>
          
          {isAnswered && !error && (
            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          )}
        </div>

        {/* Render different question types */}
        <div className="space-y-3">
          {question.type === "single-choice" && (
            <RadioGroup value={value || ""} onValueChange={(newValue) => updateResponse(question.id, newValue)}>
              <div className="space-y-3">
                {(question.options || []).map((option, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                    <RadioGroupItem value={option} id={`${question.id}-${index}`} />
                    <Label htmlFor={`${question.id}-${index}`} className="flex-1 cursor-pointer">{option}</Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          )}

          {question.type === "multi-choice" && (
            <div className="space-y-3">
              {(question.options || []).map((option, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                  <Checkbox
                    id={`${question.id}-${index}`}
                    checked={(value || []).includes(option)}
                    onCheckedChange={(checked) => {
                      const currentValues = value || []
                      const newValues = checked
                        ? [...currentValues, option]
                        : currentValues.filter((v: string) => v !== option)
                      updateResponse(question.id, newValues)
                    }}
                  />
                  <Label htmlFor={`${question.id}-${index}`} className="flex-1 cursor-pointer">{option}</Label>
                </div>
              ))}
            </div>
          )}

          {question.type === "short-text" && (
            <Input
              value={value || ""}
              onChange={(e) => updateResponse(question.id, e.target.value)}
              placeholder="Enter your answer..."
              className={`transition-all duration-200 ${error ? "border-red-500 focus-visible:ring-red-200" : "focus-visible:ring-slate-200"}`}
            />
          )}

          {question.type === "long-text" && (
            <Textarea
              value={value || ""}
              onChange={(e) => updateResponse(question.id, e.target.value)}
              placeholder="Enter your detailed answer..."
              rows={4}
              className={`transition-all duration-200 resize-none ${error ? "border-red-500 focus-visible:ring-red-200" : "focus-visible:ring-slate-200"}`}
            />
          )}

          {question.type === "numeric" && (
            <Input
              type="number"
              value={value || ""}
              onChange={(e) => updateResponse(question.id, e.target.value)}
              placeholder="Enter a number..."
              className={`transition-all duration-200 ${error ? "border-red-500 focus-visible:ring-red-200" : "focus-visible:ring-slate-200"}`}
            />
          )}

          {question.type === "file-upload" && (
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-slate-400 transition-colors">
              <Upload className="h-8 w-8 text-slate-400 mx-auto mb-3" />
              <p className="text-sm text-slate-600 mb-3">File upload functionality would be implemented here</p>
              <Button variant="outline" size="sm" disabled className="text-slate-500">
                Choose File
              </Button>
            </div>
          )}
        </div>

        {error && (
          <div className="flex items-center space-x-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Assessment Header */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">{assessment.title}</h1>
        <p className="text-slate-600 mb-4">{assessment.description}</p>
        
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-600">Progress</span>
            <span className="text-slate-900 font-medium">{Math.round(progressPercentage)}% Complete</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div 
              className="bg-slate-800 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <div className="text-xs text-slate-500">
            {answeredQuestions} of {totalVisibleQuestions} questions answered
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {assessment.sections.map((section, sectionIndex) => {
          const visibleQuestions = section.questions.filter((q) => shouldShowQuestion(q))

          if (visibleQuestions.length === 0) return null

          return (
            <div key={section.id} className="space-y-6">
              {/* Section Header */}
              <div className="bg-slate-50 rounded-lg border border-slate-200 p-6">
                <div className="flex items-center space-x-3 mb-2">
                  <Badge variant="outline" className="bg-white">Section {sectionIndex + 1}</Badge>
                  <h2 className="text-xl font-semibold text-slate-900">{section.title}</h2>
                </div>
                {section.description && (
                  <p className="text-slate-600 mt-2">{section.description}</p>
                )}
              </div>

              {/* Questions */}
              <div className="space-y-4">
                {section.questions.map((question) => renderQuestion({ ...question, sectionId: section.id }))}
              </div>
            </div>
          )
        })}

        {/* Submit Button */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
          <div className="flex justify-between items-center">
            <div className="text-sm text-slate-600">
              Ready to submit? Make sure all required fields are completed.
            </div>
            <Button 
              type="submit" 
              disabled={submitting || progressPercentage === 0} 
              className="bg-slate-800 hover:bg-slate-900 text-white px-8 py-2 disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit Assessment"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}