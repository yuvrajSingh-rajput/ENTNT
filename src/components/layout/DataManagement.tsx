import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DatabaseService } from "@/lib/db"
import { Download, Trash2, Database, AlertTriangle } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function DataManagement() {
  const [loading, setLoading] = useState(false)
  const [exportData, setExportData] = useState<any>(null)

  const handleExportData = async () => {
    try {
      setLoading(true)
      const data = await DatabaseService.exportData()
      setExportData(data)

      // Create and download JSON file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `talentflow-data-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Failed to export data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleClearData = async () => {
    try {
      setLoading(true)
      await DatabaseService.clearAllData()
      // Reinitialize with seed data
      await DatabaseService.initialize()
      window.location.reload() // Refresh to show new data
    } catch (error) {
      console.error("Failed to clear data:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Database className="h-5 w-5" />
          <span>Data Management</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Badge variant="outline" className="text-xs">
            IndexedDB
          </Badge>
          <span>Local browser storage with automatic persistence</span>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Export Data</p>
              <p className="text-sm text-muted-foreground">Download all data as JSON</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleExportData} disabled={loading}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Reset Database</p>
              <p className="text-sm text-muted-foreground">Clear all data and restore seed data</p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" disabled={loading}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    <span>Reset Database</span>
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all your data including jobs, candidates, assessments, and timeline
                    entries. The database will be restored with fresh seed data. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleClearData}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Reset Database
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {exportData && (
          <div className="mt-4 p-3 bg-muted rounded-md">
            <p className="text-sm font-medium mb-2">Export Summary:</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>Jobs: {exportData.jobs?.length || 0}</div>
              <div>Candidates: {exportData.candidates?.length || 0}</div>
              <div>Assessments: {exportData.assessments?.length || 0}</div>
              <div>Timeline: {exportData.timeline?.length || 0}</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}