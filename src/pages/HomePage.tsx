import { useNavigate } from "react-router-dom" 
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Briefcase, FileText, BarChart3, ArrowRight, Sparkles, Zap, Shield } from "lucide-react"
import { Navigation } from "@/components/layout/Navigation"

export default function HomePage() {
  const navigate = useNavigate() 

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-slate-100">
      <Navigation />

      <main className="flex-1 container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-full text-sm font-medium mb-8 border border-slate-200">
            <Sparkles className="h-4 w-4" />
            Professional Hiring Platform
          </div>
          <h1 className="text-6xl font-bold text-slate-900 mb-6 leading-tight">
            Streamline Your<br />
            <span className="text-slate-600">Hiring Process</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed mb-10">
            The complete talent management platform designed for modern HR teams. 
            Manage jobs, candidates, and assessments with professional efficiency.
          </p>
          <div className="flex gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => navigate("/candidates")}
              className="bg-slate-800 hover:bg-slate-900 text-white px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              onClick={() => navigate('/jobs')}
              variant="outline" 
              size="lg"
              className="px-8 py-3 rounded-lg border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-700 transition-all duration-300"
            >
              View Demo
            </Button>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {/* Job Management */}
          <Card 
            className="group hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-[1.02] border-0 shadow-md bg-white" 
            onClick={() => navigate("/jobs")}
          >
            <CardHeader className="pb-4">
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-slate-200 transition-all duration-300">
                <Briefcase className="h-6 w-6 text-slate-700" />
              </div>
              <CardTitle className="text-xl font-semibold text-slate-900">Job Management</CardTitle>
              <CardDescription className="text-slate-600">
                Create and organize job postings with advanced filtering and search capabilities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" className="w-full text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all duration-300">
                Manage Jobs
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
            </CardContent>
          </Card>

          {/* Candidate Pipeline */}
          <Card 
            className="group hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-[1.02] border-0 shadow-md bg-white" 
            onClick={() => navigate("/candidates")}
          >
            <CardHeader className="pb-4">
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-slate-200 transition-all duration-300">
                <Users className="h-6 w-6 text-slate-700" />
              </div>
              <CardTitle className="text-xl font-semibold text-slate-900">Candidate Pipeline</CardTitle>
              <CardDescription className="text-slate-600">
                Visual kanban boards to track candidates through your hiring stages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" className="w-full text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all duration-300">
                View Pipeline
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
            </CardContent>
          </Card>

          {/* Smart Assessments */}
          <Card 
            className="group hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-[1.02] border-0 shadow-md bg-white"
            onClick={() => navigate("/assessments")}
          >
            <CardHeader className="pb-4">
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-slate-200 transition-all duration-300">
                <FileText className="h-6 w-6 text-slate-700" />
              </div>
              <CardTitle className="text-xl font-semibold text-slate-900">Smart Assessments</CardTitle>
              <CardDescription className="text-slate-600">
                Build custom assessments with multiple question types and validation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" className="w-full text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all duration-300">
                Create Assessment
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
            </CardContent>
          </Card>

          {/* Analytics */}
          <Card className="group hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] border-0 shadow-md bg-white" onClick={() => navigate('/analytics')}>
            <CardHeader className="pb-4">
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-slate-700" />
              </div>
              <CardTitle className="text-xl font-semibold text-slate-900">Analytics & Reports</CardTitle>
              <CardDescription className="text-slate-600">
                Comprehensive hiring metrics and performance insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" className="w-full text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all duration-300">
                Analytics & Reports
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-20">
          <div className="lg:col-span-2">
            <h2 className="text-4xl font-bold text-slate-900 mb-12 text-center lg:text-left">
              Built for Professional Teams
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Intelligent Matching */}
              <div className="p-8 rounded-xl bg-white shadow-md hover:shadow-lg transition-all duration-300">
                <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center mb-6">
                  <Briefcase className="h-8 w-8 text-slate-700" />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-slate-900">Intelligent Matching</h3>
                <p className="text-slate-600 leading-relaxed">
                  Advanced algorithms help match the right candidates with suitable positions, improving hiring efficiency and success rates.
                </p>
              </div>

              {/* Pipeline Visibility */}
              <div className="p-8 rounded-xl bg-white shadow-md hover:shadow-lg transition-all duration-300">
                <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center mb-6">
                  <Users className="h-8 w-8 text-slate-700" />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-slate-900">Pipeline Visibility</h3>
                <p className="text-slate-600 leading-relaxed">
                  Complete visibility into your hiring pipeline with drag-and-drop functionality and real-time status updates.
                </p>
              </div>

              {/* Fast Performance */}
              <div className="p-8 rounded-xl bg-white shadow-md hover:shadow-lg transition-all duration-300">
                <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center mb-6">
                  <Zap className="h-8 w-8 text-slate-700" />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-slate-900">Fast Performance</h3>
                <p className="text-slate-600 leading-relaxed">
                  Built with modern technology for lightning-fast loading times and smooth user experience across all devices.
                </p>
              </div>

              {/* Data Security */}
              <div className="p-8 rounded-xl bg-white shadow-md hover:shadow-lg transition-all duration-300">
                <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center mb-6">
                  <Shield className="h-8 w-8 text-slate-700" />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-slate-900">Data Security</h3>
                <p className="text-slate-600 leading-relaxed">
                  Your hiring data remains secure with local storage and enterprise-grade security measures built into every feature.
                </p>
              </div>
            </div>
          </div>

          {/* Data Management */}
          <div className="bg-slate-800 rounded-xl p-8 text-white shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center">
                <Shield className="h-6 w-6 text-slate-300" />
              </div>
              <h3 className="text-2xl font-semibold">Data Management</h3>
            </div>
            <p className="text-slate-300 mb-8 leading-relaxed">
              Complete control over your hiring data with local storage, instant backups, and seamless data portability for maximum security.
            </p>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-all duration-300">
                <span className="font-medium">Export All Data</span>
                <Button variant="secondary" size="sm" className="bg-slate-600 hover:bg-slate-500 text-white border-0" onClick={() => navigate('/analytics')}>
                  Export
                </Button>
              </div>
              <div className="flex justify-between items-center p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-all duration-300">
                <span className="font-medium">Reset Database</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-slate-700/50 rounded-lg">
                <span className="font-medium">Storage Status</span>
                <span className="text-slate-300 text-sm font-medium">Local & Secure</span>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-slate-800 rounded-2xl p-12 text-white shadow-xl">
          <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 text-slate-300 max-w-2xl mx-auto">
            Join forward-thinking HR professionals who have streamlined their hiring process with TalentFlow's comprehensive platform.
          </p>
          <div className="flex gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => navigate("/candidates")}
              className="bg-white text-slate-800 hover:bg-slate-100 px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Start Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-slate-600 text-slate-300 bg-slate-700 hover:text-white px-8 py-3 rounded-lg transition-all duration-300"
            >
              Learn More
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-8">
        <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} TalentFlow. All rights reserved.</p>
          <p className="mt-2 md:mt-0">
            Made with ❤️ by <span className="font-medium text-foreground">Yuvraj Singh</span>
          </p>
        </div>
      </footer>
    </div>
  )
}
