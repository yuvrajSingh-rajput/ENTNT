import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useToast } from "./toast-provider"

export function KeyboardShortcuts() {
  const navigate = useNavigate()
  const { addToast } = useToast()

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore when typing inside input fields
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement
      ) {
        return
      }

      // Ctrl/Cmd + K = global search
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        addToast({
          title: "Search",
          description: "Global search coming soon!",
          variant: "default",
        })
      }

      // Ctrl/Cmd + Shift + Key → Navigation
      if ((event.metaKey || event.ctrlKey) && event.shiftKey) {
        switch (event.key.toLowerCase()) {
          case "j":
            event.preventDefault()
            navigate("/jobs")
            break
          case "c":
            event.preventDefault()
            navigate("/candidates")
            break
          case "a":
            event.preventDefault()
            navigate("/assessments")
            break
          case "h":
            event.preventDefault()
            navigate("/")
            break
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [navigate, addToast])

  return null
}
