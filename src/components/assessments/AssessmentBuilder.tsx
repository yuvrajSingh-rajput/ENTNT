import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Trash2, GripVertical, Save } from "lucide-react"
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd"

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

interface Job {
  id: string
  title: string
}

interface AssessmentBuilderProps {
  job: Job
  assessment: Assessment | null
  onAssessmentChange: (assessment: Assessment) => void
  onSave: (assessment: Assessment) => Promise<Assessment>
}

const questionTypes = [
  { value: "single-choice", label: "Single Choice" },
  { value: "multi-choice", label: "Multiple Choice" },
  { value: "short-text", label: "Short Text" },
  { value: "long-text", label: "Long Text" },
  { value: "numeric", label: "Numeric" },
  { value: "file-upload", label: "File Upload" },
]

export function AssessmentBuilder({ job, assessment, onAssessmentChange, onSave }: AssessmentBuilderProps) {
  const [currentAssessment, setCurrentAssessment] = useState<Assessment>(() => {
    return (
      assessment || {
        id: `assessment-${job.id}`,
        jobId: job.id,
        title: `${job.title} Assessment`,
        description: `Assessment for ${job.title} position`,
        sections: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    )
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (assessment) {
      setCurrentAssessment(assessment)
    }
  }, [assessment])

  useEffect(() => {
    onAssessmentChange(currentAssessment)
  }, [currentAssessment, onAssessmentChange])

  const handleSave = async () => {
    try {
      setSaving(true)
      await onSave(currentAssessment)
    } catch (error) {
      console.error("Failed to save assessment:", error)
    } finally {
      setSaving(false)
    }
  }

  const addSection = () => {
    const newSection: AssessmentSection = {
      id: `section-${Date.now()}`,
      title: "New Section",
      description: "",
      questions: [],
    }

    setCurrentAssessment((prev) => ({
      ...prev,
      sections: [...prev.sections, newSection],
    }))
  }

  const updateSection = (sectionId: string, updates: Partial<AssessmentSection>) => {
    setCurrentAssessment((prev) => ({
      ...prev,
      sections: prev.sections.map((section) => (section.id === sectionId ? { ...section, ...updates } : section)),
    }))
  }

  const deleteSection = (sectionId: string) => {
    setCurrentAssessment((prev) => ({
      ...prev,
      sections: prev.sections.filter((section) => section.id !== sectionId),
    }))
  }

  const addQuestion = (sectionId: string) => {
    const newQuestion: AssessmentQuestion = {
      id: `question-${Date.now()}`,
      type: "short-text",
      question: "New Question",
      required: false,
      options: [],
      validation: {},
    }

    updateSection(sectionId, {
      questions: [...(currentAssessment.sections.find((s) => s.id === sectionId)?.questions || []), newQuestion],
    })
  }

  const updateQuestion = (sectionId: string, questionId: string, updates: Partial<AssessmentQuestion>) => {
    const section = currentAssessment.sections.find((s) => s.id === sectionId)
    if (!section) return

    const updatedQuestions = section.questions.map((question) =>
      question.id === questionId ? { ...question, ...updates } : question,
    )

    updateSection(sectionId, { questions: updatedQuestions })
  }

  const deleteQuestion = (sectionId: string, questionId: string) => {
    const section = currentAssessment.sections.find((s) => s.id === sectionId)
    if (!section) return

    const updatedQuestions = section.questions.filter((question) => question.id !== questionId)
    updateSection(sectionId, { questions: updatedQuestions })
  }

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return

    const { source, destination } = result

    if (result.type === "section") {
      const newSections = Array.from(currentAssessment.sections)
      const [removed] = newSections.splice(source.index, 1)
      newSections.splice(destination.index, 0, removed)

      setCurrentAssessment((prev) => ({
        ...prev,
        sections: newSections,
      }))
    } else if (result.type === "question") {
      const sectionId = source.droppableId
      const section = currentAssessment.sections.find((s) => s.id === sectionId)
      if (!section) return

      const newQuestions = Array.from(section.questions)
      const [removed] = newQuestions.splice(source.index, 1)
      newQuestions.splice(destination.index, 0, removed)

      updateSection(sectionId, { questions: newQuestions })
    }
  }

  return (
    <div className="space-y-6">
      {/* Assessment Header */}
      <div className="bg-white rounded-lg border border-border shadow-sm">
        <div className="p-6 pb-4">
          <h3 className="text-lg font-semibold text-slate-900">Assessment Details</h3>
        </div>
        <div className="px-6 pb-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={currentAssessment.title}
              onChange={(e) => setCurrentAssessment((prev) => ({ ...prev, title: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={currentAssessment.description}
              onChange={(e) => setCurrentAssessment((prev) => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>
          <Button onClick={handleSave} disabled={saving} className="bg-slate-800 hover:bg-slate-900">
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Saving..." : "Save Assessment"}
          </Button>
        </div>
      </div>

      {/* Sections */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="sections" type="section">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
              {currentAssessment.sections.map((section, sectionIndex) => (
                <Draggable key={section.id} draggableId={section.id} index={sectionIndex}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="bg-white rounded-lg border-2 border-dashed border-slate-300 shadow-sm"
                    >
                      <div className="p-6 pb-3">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-2 flex-1">
                            <div {...provided.dragHandleProps} className="cursor-grab">
                              <GripVertical className="h-4 w-4 text-slate-400" />
                            </div>
                            <Input
                              value={section.title}
                              onChange={(e) => updateSection(section.id, { title: e.target.value })}
                              className="font-semibold"
                            />
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => deleteSection(section.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <Textarea
                          placeholder="Section description (optional)"
                          value={section.description || ""}
                          onChange={(e) => updateSection(section.id, { description: e.target.value })}
                          rows={2}
                        />
                      </div>
                      <div className="px-6 pb-6 space-y-4">
                        <Droppable droppableId={section.id} type="question">
                          {(provided) => (
                            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                              {section.questions.map((question, questionIndex) => (
                                <QuestionBuilder
                                  key={question.id}
                                  question={question}
                                  questionIndex={questionIndex}
                                  sectionId={section.id}
                                  allQuestions={currentAssessment.sections.flatMap((s) => s.questions)}
                                  onUpdate={(updates) => updateQuestion(section.id, question.id, updates)}
                                  onDelete={() => deleteQuestion(section.id, question.id)}
                                />
                              ))}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                        <Button variant="outline" onClick={() => addQuestion(section.id)} className="w-full">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Question
                        </Button>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <Button onClick={addSection} variant="outline" className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Add Section
      </Button>
    </div>
  )
}

interface QuestionBuilderProps {
  question: AssessmentQuestion
  questionIndex: number
  sectionId: string
  allQuestions: AssessmentQuestion[]
  onUpdate: (updates: Partial<AssessmentQuestion>) => void
  onDelete: () => void
}

function QuestionBuilder({ question, questionIndex, allQuestions, onUpdate, onDelete }: QuestionBuilderProps) {
  const addOption = () => {
    const newOptions = [...(question.options || []), "New Option"]
    onUpdate({ options: newOptions })
  }

  const updateOption = (index: number, value: string) => {
    const newOptions = [...(question.options || [])]
    newOptions[index] = value
    onUpdate({ options: newOptions })
  }

  const deleteOption = (index: number) => {
    const newOptions = [...(question.options || [])]
    newOptions.splice(index, 1)
    onUpdate({ options: newOptions })
  }

  return (
    <Draggable draggableId={question.id} index={questionIndex}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className="bg-slate-50 rounded-lg border border-slate-200 shadow-sm"
        >
          <div className="p-4 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                <div {...provided.dragHandleProps} className="cursor-grab">
                  <GripVertical className="h-4 w-4 text-slate-400" />
                </div>
                <Badge variant="outline" className="text-xs">
                  Q{questionIndex + 1}
                </Badge>
              </div>
              <Button variant="ghost" size="sm" onClick={onDelete}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Question Type</Label>
                <Select
                  value={question.type}
                  onValueChange={(value: AssessmentQuestion["type"]) => onUpdate({ type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {questionTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`required-${question.id}`}
                  checked={question.required}
                  onCheckedChange={(checked) => onUpdate({ required: !!checked })}
                />
                <Label htmlFor={`required-${question.id}`}>Required</Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Question</Label>
              <Textarea value={question.question} onChange={(e) => onUpdate({ question: e.target.value })} rows={2} />
            </div>

            {/* Options for choice questions */}
            {(question.type === "single-choice" || question.type === "multi-choice") && (
              <div className="space-y-2">
                <Label>Options</Label>
                <div className="space-y-2">
                  {(question.options || []).map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Input
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                        placeholder={`Option ${index + 1}`}
                      />
                      <Button variant="ghost" size="sm" onClick={() => deleteOption(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={addOption}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Option
                  </Button>
                </div>
              </div>
            )}

            {/* Validation for text questions */}
            {(question.type === "short-text" || question.type === "long-text") && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Min Length</Label>
                  <Input
                    type="number"
                    value={question.validation?.minLength || ""}
                    onChange={(e) =>
                      onUpdate({
                        validation: {
                          ...question.validation,
                          minLength: e.target.value ? Number(e.target.value) : undefined,
                        },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Length</Label>
                  <Input
                    type="number"
                    value={question.validation?.maxLength || ""}
                    onChange={(e) =>
                      onUpdate({
                        validation: {
                          ...question.validation,
                          maxLength: e.target.value ? Number(e.target.value) : undefined,
                        },
                      })
                    }
                  />
                </div>
              </div>
            )}

            {/* Validation for numeric questions */}
            {question.type === "numeric" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Min Value</Label>
                  <Input
                    type="number"
                    value={question.validation?.min || ""}
                    onChange={(e) =>
                      onUpdate({
                        validation: {
                          ...question.validation,
                          min: e.target.value ? Number(e.target.value) : undefined,
                        },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Value</Label>
                  <Input
                    type="number"
                    value={question.validation?.max || ""}
                    onChange={(e) =>
                      onUpdate({
                        validation: {
                          ...question.validation,
                          max: e.target.value ? Number(e.target.value) : undefined,
                        },
                      })
                    }
                  />
                </div>
              </div>
            )}

            {/* Conditional Logic */}
            <div className="space-y-2">
              <Label>Conditional Logic (Optional)</Label>
              <div className="grid grid-cols-3 gap-2">
                <Select
                  value={question.conditionalLogic?.dependsOn || "none"}
                  onValueChange={(value) => {
                    if (value !== "none") {
                      onUpdate({
                        conditionalLogic: {
                          dependsOn: value,
                          condition: question.conditionalLogic?.condition ?? "equals",
                          value: question.conditionalLogic?.value ?? "",
                        },
                      })
                    } else {
                      onUpdate({ conditionalLogic: undefined })
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Depends on..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {allQuestions
                      .filter((q) => q.id !== question.id)
                      .map((q) => (
                        <SelectItem key={q.id} value={q.id}>
                          {q.question.substring(0, 30)}...
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Select
                  value={question.conditionalLogic?.condition || "equals"}
                  onValueChange={(value) =>
                    onUpdate({
                      conditionalLogic: question.conditionalLogic
                        ? {
                            ...question.conditionalLogic,
                            condition: value,
                          }
                        : undefined,
                    })
                  }
                  disabled={!question.conditionalLogic?.dependsOn || question.conditionalLogic.dependsOn === "none"}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="equals">Equals</SelectItem>
                    <SelectItem value="not_equals">Not Equals</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Value"
                  value={question.conditionalLogic?.value || ""}
                  onChange={(e) =>
                    onUpdate({
                      conditionalLogic: question.conditionalLogic
                        ? {
                            ...question.conditionalLogic,
                            value: e.target.value,
                          }
                        : undefined,
                    })
                  }
                  disabled={!question.conditionalLogic?.dependsOn || question.conditionalLogic.dependsOn === "none"}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  )
}