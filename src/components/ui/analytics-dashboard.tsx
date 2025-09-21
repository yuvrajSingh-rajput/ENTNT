"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { TrendingUp, Users, Briefcase, Clock, CheckCircle } from "lucide-react"

interface AnalyticsData {
  totalJobs: number
  totalCandidates: number
  activeJobs: number
  hiredCandidates: number
  averageTimeToHire: number
  stageDistribution: Array<{ stage: string; count: number; color: string }>
  hiringTrend: Array<{ month: string; hired: number; applied: number }>
}

export function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate analytics data fetching
    const fetchAnalytics = async () => {
      setLoading(true)

      // Mock analytics data
      const mockData: AnalyticsData = {
        totalJobs: 25,
        totalCandidates: 1000,
        activeJobs: 18,
        hiredCandidates: 45,
        averageTimeToHire: 21,
        stageDistribution: [
          { stage: "Applied", count: 450, color: "#3b82f6" },
          { stage: "Screen", count: 280, color: "#eab308" },
          { stage: "Tech", count: 150, color: "#8b5cf6" },
          { stage: "Offer", count: 75, color: "#10b981" },
          { stage: "Hired", count: 45, color: "#059669" },
        ],
        hiringTrend: [
          { month: "Jan", hired: 8, applied: 120 },
          { month: "Feb", hired: 12, applied: 150 },
          { month: "Mar", hired: 15, applied: 180 },
          { month: "Apr", hired: 10, applied: 140 },
          { month: "May", hired: 18, applied: 200 },
          { month: "Jun", hired: 22, applied: 210 },
        ],
      }

      setTimeout(() => {
        setData(mockData)
        setLoading(false)
      }, 1000)
    }

    fetchAnalytics()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-muted rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalJobs}</div>
            <p className="text-xs text-muted-foreground">
              <Badge variant="outline" className="text-xs">
                {data.activeJobs} active
              </Badge>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Candidates</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalCandidates}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +12% from last month
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hired</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.hiredCandidates}</div>
            <p className="text-xs text-muted-foreground">
              {((data.hiredCandidates / data.totalCandidates) * 100).toFixed(1)}% conversion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Time to Hire</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.averageTimeToHire} days</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">-3 days from last month</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Hiring Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.hiringTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="applied" fill="#e2e8f0" name="Applied" />
                <Bar dataKey="hired" fill="#3b82f6" name="Hired" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Candidate Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.stageDistribution.map((stage) => (
                <div key={stage.stage} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>{stage.stage}</span>
                    <span className="font-medium">{stage.count}</span>
                  </div>
                  <Progress value={(stage.count / data.totalCandidates) * 100} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}