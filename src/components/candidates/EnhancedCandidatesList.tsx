import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { useDebounce } from "@/hooks/use-debounce";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Eye, Mail } from "lucide-react";
import type { Candidate } from "@/lib/seed-data";

interface EnhancedCandidatesListProps {
  candidates: Candidate[];
  loading: boolean;
  searchTerm: string;
  stageFilter: string;
  pagination: {
    total: number;
    totalPages: number;
  };
  currentPage: number;
  onPageChange: (page: number) => void;
}

export function EnhancedCandidatesList({
  candidates,
  loading,
  searchTerm,
  stageFilter,
  pagination,
  currentPage,
  onPageChange,
}: EnhancedCandidatesListProps) {
  const navigate = useNavigate(); 
  const debouncedSearch = useDebounce(searchTerm, 300);

  const filteredCandidates = useMemo(() => {
    return candidates.filter((candidate) => {
      const matchesSearch =
        !debouncedSearch ||
        candidate.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        candidate.email.toLowerCase().includes(debouncedSearch.toLowerCase());

      const matchesStage = !stageFilter || candidate.stage === stageFilter;

      return matchesSearch && matchesStage;
    });
  }, [candidates, debouncedSearch, stageFilter]);

  const getStageColor = (stage: string) => {
    const colors = {
      applied: "bg-blue-100 text-blue-800",
      screen: "bg-yellow-100 text-yellow-800",
      tech: "bg-purple-100 text-purple-800",
      offer: "bg-green-100 text-green-800",
      hired: "bg-emerald-100 text-emerald-800",
      rejected: "bg-red-100 text-red-800",
    };
    return colors[stage as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" className="mr-3" />
        <span className="text-muted-foreground">Loading candidates...</span>
      </div>
    );
  }

  if (filteredCandidates.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No candidates found
          </h3>
          <p className="text-muted-foreground">
            {searchTerm || stageFilter
              ? "Try adjusting your search or filters."
              : "No candidates have been added yet."}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        Showing {filteredCandidates.length} of {candidates.length} candidates
      </div>

      <div className="border rounded-lg max-h-96 overflow-y-auto">
        <div className="space-y-2 p-2">
          {filteredCandidates.map((candidate, _) => (
            <div key={candidate.id} className="px-4 py-2">
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {candidate.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {candidate.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {candidate.email}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge className={getStageColor(candidate.stage)}>
                            {candidate.stage}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Applied{" "}
                            {new Date(candidate.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          window.open(
                            `https://mail.google.com/mail/?view=cm&fs=1&to=${candidate.email}`,
                            "_blank"
                          )
                        }
                      >
                        <Mail className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/candidates/${candidate.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-muted-foreground">
            Showing {candidates.length} of {pagination.total} candidates
          </p>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === pagination.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
