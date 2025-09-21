import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/layout/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BarChart3, PieChart, TrendingUp, Download } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { DatabaseService } from "@/lib/db";
import type { Job, Candidate } from "@/lib/seed-data";

interface AnalyticsData {
  candidatePipeline: { stage: string; count: number }[];
  hiringVelocity: { month: string; hires: number }[];
  assessmentScores: { scoreRange: string; count: number }[];
  topPerformingJobs: { jobTitle: string; applications: number }[];
}

export default function AnalyticsPage() {
  const navigate = useNavigate();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const [jobsData, candidatesData] = await Promise.all([
          DatabaseService.getJobs({ search: "", status: "", page: 1, pageSize: 100, sort: "order" }),
          DatabaseService.getCandidates({ search: "", stage: "", page: 1, pageSize: 1000 }),
        ]);

        const pipelineStages = ["applied", "screen", "tech", "offer", "hired", "rejected"];
        const candidatePipeline = pipelineStages.map((stage) => ({
          stage: stage.charAt(0).toUpperCase() + stage.slice(1),
          count: candidatesData.candidates.filter((c: Candidate) => c.stage === stage).length,
        }));

        const hiringVelocity = [
          { month: "Jan", hires: 5 },
          { month: "Feb", hires: 8 },
          { month: "Mar", hires: 12 },
          { month: "Apr", hires: 10 },
          { month: "May", hires: 15 },
          { month: "Jun", hires: 18 },
        ];

        const assessmentScores = [
          { scoreRange: "0-50", count: 10 },
          { scoreRange: "51-70", count: 20 },
          { scoreRange: "71-90", count: 30 },
          { scoreRange: "91-100", count: 15 },
        ];

        const topPerformingJobs = jobsData.jobs.slice(0, 5).map((job: Job) => ({
          jobTitle: job.title,
          applications: Math.floor(Math.random() * 50) + 10,
        }));

        setAnalyticsData({
          candidatePipeline,
          hiringVelocity,
          assessmentScores,
          topPerformingJobs,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const exportToCSV = () => {
    if (!analyticsData) return;

    // Combine all analytics data into a single CSV
    let csvContent = "data:text/csv;charset=utf-8,";

    // Candidate Pipeline
    csvContent += "Candidate Pipeline\n";
    csvContent += "Stage,Count\n";
    analyticsData.candidatePipeline.forEach(({ stage, count }) => {
      csvContent += `${stage},${count}\n`;
    });
    csvContent += "\n";

    // Hiring Velocity
    csvContent += "Hiring Velocity\n";
    csvContent += "Month,Hires\n";
    analyticsData.hiringVelocity.forEach(({ month, hires }) => {
      csvContent += `${month},${hires}\n`;
    });
    csvContent += "\n";

    // Assessment Scores
    csvContent += "Assessment Scores Distribution\n";
    csvContent += "Score Range,Count\n";
    analyticsData.assessmentScores.forEach(({ scoreRange, count }) => {
      csvContent += `${scoreRange},${count}\n`;
    });
    csvContent += "\n";

    // Top Performing Jobs
    csvContent += "Top Performing Jobs\n";
    csvContent += "Job Title,Applications\n";
    analyticsData.topPerformingJobs.forEach(({ jobTitle, applications }) => {
      csvContent += `"${jobTitle}",${applications}\n`;
    });

    // Encode and trigger download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `talentflow_analytics_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-muted rounded w-1/2 mb-8"></div>
            <div className="space-y-4">
              <div className="h-64 bg-muted rounded"></div>
              <div className="h-64 bg-muted rounded"></div>
              <div className="h-64 bg-muted rounded"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-foreground mb-2">Error Loading Analytics</h2>
            <p className="text-muted-foreground">{error}</p>
          </div>
        </main>
      </div>
    );
  }

  const COLORS = ['#0891b2', '#10b981', '#3b82f6', '#9333ea', '#ef4444', '#facc15'];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Analytics & Reports</h1>
            <p className="text-muted-foreground">Comprehensive hiring metrics and performance insights</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="ghost" onClick={() => navigate('/')} className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
            <Button onClick={exportToCSV} className="bg-primary hover:bg-primary/90 text-primary-foreground mb-4">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="rounded-xl shadow-md border-0">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-primary" />
                Candidate Pipeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsData?.candidatePipeline}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="stage" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#0891b2" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-md border-0">
            <CardHeader>
              <CardTitle className="flex items-center">
                <PieChart className="h-5 w-5 mr-2 text-primary" />
                Assessment Scores Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={analyticsData?.assessmentScores}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {analyticsData?.assessmentScores.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-md border-0 lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-primary" />
                Hiring Velocity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analyticsData?.hiringVelocity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="hires" stroke="#0891b2" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-md border-0 lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-primary" />
                Top Performing Jobs (by Applications)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData?.topPerformingJobs.map((job, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="font-medium">{job.jobTitle}</span>
                    <Badge variant="secondary">{job.applications} applications</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}