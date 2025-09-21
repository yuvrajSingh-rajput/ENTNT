import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import JobsPage from "./pages/jobs/Index";
import CandidatesPage from "./pages/candidates/Index";
import AssessmentsPage from "./pages/asssessments/Index";
import AssessmentBuilderPage from "./pages/asssessments/builder/Index";
import TakeAssessmentPage from "./pages/asssessments/take/Index";
import CandidateDetailPage from "./pages/candidates/details/Index";
import NotFoundPage from "./pages/NotFound";
import JobDetailPage from "./pages/jobs/details/Index";
import AnalyticsPage from "./pages/AnalyticsPage";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/jobs" element={<JobsPage/>}/>
        <Route path="/jobs/:jobId" element={<JobDetailPage/>}/>
        <Route path="/candidates" element={<CandidatesPage/>}/>
        <Route path="/assessments" element={<AssessmentsPage />} />
        <Route path="/assessments/:jobId/builder" element={<AssessmentBuilderPage />} />
        <Route path="/assessments/:jobId/take" element={<TakeAssessmentPage />} />
        <Route path="/candidates/:candidateId" element={<CandidateDetailPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;
