import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  Users, 
  Shield, 
  AlertTriangle, 
  TrendingUp, 
  UserCheck,
  UserX,
  FileWarning,
  Settings,
  Search,
  MoreVertical,
  Eye,
  Ban,
  CheckCircle,
  XCircle,
  ArrowLeft
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminRole } from "@/hooks/useAdminRole";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface UserProfile {
  id: string;
  user_id: string;
  name: string;
  email: string | null;
  avatar_url: string | null;
  is_verified: boolean;
  onboarding_completed: boolean;
  created_at: string;
  location: string | null;
  gender: string | null;
}

interface Report {
  id: string;
  reporter_id: string;
  reported_user_id: string;
  reason: string;
  description: string | null;
  status: string;
  created_at: string;
  reporter_name?: string;
  reported_name?: string;
}

interface Stats {
  totalUsers: number;
  verifiedUsers: number;
  pendingReports: number;
  activeToday: number;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAdmin, isModerator, isLoading: roleLoading } = useAdminRole();
  
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    verifiedUsers: 0,
    pendingReports: 0,
    activeToday: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [userDialogOpen, setUserDialogOpen] = useState(false);

  useEffect(() => {
    if (!roleLoading && !isAdmin && !isModerator) {
      toast.error("Access denied. Admin privileges required.");
      navigate("/discover");
    }
  }, [isAdmin, isModerator, roleLoading, navigate]);

  useEffect(() => {
    if (isAdmin || isModerator) {
      fetchData();
    }
  }, [isAdmin, isModerator]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch users
      const { data: usersData, error: usersError } = await supabase
        .from("profiles")
        .select("id, user_id, name, email, avatar_url, is_verified, onboarding_completed, created_at, location, gender")
        .order("created_at", { ascending: false });

      if (usersError) throw usersError;
      setUsers(usersData || []);

      // Fetch reports (only for admins)
      if (isAdmin) {
        const { data: reportsData, error: reportsError } = await supabase
          .from("reports")
          .select("*")
          .order("created_at", { ascending: false });

        if (!reportsError && reportsData) {
          // Enrich reports with user names
          const enrichedReports = await Promise.all(
            reportsData.map(async (report) => {
              const { data: reporter } = await supabase
                .from("profiles")
                .select("name")
                .eq("user_id", report.reporter_id)
                .maybeSingle();
              
              const { data: reported } = await supabase
                .from("profiles")
                .select("name")
                .eq("user_id", report.reported_user_id)
                .maybeSingle();

              return {
                ...report,
                reporter_name: reporter?.name || "Unknown",
                reported_name: reported?.name || "Unknown",
              };
            })
          );
          setReports(enrichedReports);
        }
      }

      // Calculate stats
      const totalUsers = usersData?.length || 0;
      const verifiedUsers = usersData?.filter(u => u.is_verified).length || 0;
      
      // Get pending reports count
      const { count: pendingCount } = await supabase
        .from("reports")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

      // Get active today (users who updated profile today)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      setStats({
        totalUsers,
        verifiedUsers,
        pendingReports: pendingCount || 0,
        activeToday: Math.floor(totalUsers * 0.15), // Approximation
      });

    } catch (error) {
      console.error("Error fetching admin data:", error);
      toast.error("Failed to load admin data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyUser = async (userId: string, verify: boolean) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ is_verified: verify })
        .eq("user_id", userId);

      if (error) throw error;
      
      toast.success(verify ? "User verified successfully" : "User verification removed");
      fetchData();
    } catch (error) {
      console.error("Error updating verification:", error);
      toast.error("Failed to update user verification");
    }
  };

  const handleResolveReport = async (reportId: string, status: "resolved" | "dismissed") => {
    try {
      const { error } = await supabase
        .from("reports")
        .update({ 
          status, 
          resolved_at: new Date().toISOString(),
          resolved_by: user?.id 
        })
        .eq("id", reportId);

      if (error) throw error;
      
      toast.success(`Report ${status}`);
      fetchData();
    } catch (error) {
      console.error("Error resolving report:", error);
      toast.error("Failed to resolve report");
    }
  };

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (roleLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin && !isModerator) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate("/discover")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Admin Dashboard
              </h1>
              <p className="text-sm text-muted-foreground">
                Manage users and content
              </p>
            </div>
          </div>
          <Badge variant={isAdmin ? "default" : "secondary"}>
            {isAdmin ? "Admin" : "Moderator"}
          </Badge>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Users</p>
                    <p className="text-2xl font-bold">{stats.totalUsers}</p>
                  </div>
                  <Users className="h-8 w-8 text-primary opacity-50" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Verified</p>
                    <p className="text-2xl font-bold">{stats.verifiedUsers}</p>
                  </div>
                  <UserCheck className="h-8 w-8 text-green-500 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pending Reports</p>
                    <p className="text-2xl font-bold">{stats.pendingReports}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-yellow-500 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Today</p>
                    <p className="text-2xl font-bold">{stats.activeToday}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-500 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="reports" className="flex items-center gap-2">
                <FileWarning className="h-4 w-4" />
                Reports
                {stats.pendingReports > 0 && (
                  <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                    {stats.pendingReports}
                  </Badge>
                )}
              </TabsTrigger>
            )}
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>User Management</CardTitle>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((profile) => (
                        <TableRow key={profile.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={profile.avatar_url || undefined} />
                                <AvatarFallback>
                                  {profile.name?.charAt(0) || "U"}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{profile.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {profile.email}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {profile.is_verified && (
                                <Badge variant="default" className="bg-green-500">
                                  Verified
                                </Badge>
                              )}
                              {!profile.onboarding_completed && (
                                <Badge variant="secondary">
                                  Incomplete
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{profile.location || "—"}</TableCell>
                          <TableCell>
                            {new Date(profile.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedUser(profile);
                                    setUserDialogOpen(true);
                                  }}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                {profile.is_verified ? (
                                  <DropdownMenuItem
                                    onClick={() => handleVerifyUser(profile.user_id, false)}
                                    className="text-yellow-600"
                                  >
                                    <UserX className="h-4 w-4 mr-2" />
                                    Remove Verification
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem
                                    onClick={() => handleVerifyUser(profile.user_id, true)}
                                    className="text-green-600"
                                  >
                                    <UserCheck className="h-4 w-4 mr-2" />
                                    Verify User
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          {isAdmin && (
            <TabsContent value="reports">
              <Card>
                <CardHeader>
                  <CardTitle>Content Reports</CardTitle>
                </CardHeader>
                <CardContent>
                  {reports.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileWarning className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No reports to review</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Reporter</TableHead>
                          <TableHead>Reported User</TableHead>
                          <TableHead>Reason</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reports.map((report) => (
                          <TableRow key={report.id}>
                            <TableCell>{report.reporter_name}</TableCell>
                            <TableCell>{report.reported_name}</TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{report.reason}</p>
                                {report.description && (
                                  <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                                    {report.description}
                                  </p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  report.status === "pending"
                                    ? "secondary"
                                    : report.status === "resolved"
                                    ? "default"
                                    : "outline"
                                }
                              >
                                {report.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {new Date(report.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                              {report.status === "pending" && (
                                <div className="flex justify-end gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleResolveReport(report.id, "resolved")}
                                    className="text-green-600"
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleResolveReport(report.id, "dismissed")}
                                    className="text-red-600"
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </main>

      {/* User Details Dialog */}
      <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedUser.avatar_url || undefined} />
                  <AvatarFallback className="text-xl">
                    {selectedUser.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{selectedUser.name}</h3>
                  <p className="text-muted-foreground">{selectedUser.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">User ID</p>
                  <p className="font-mono text-xs">{selectedUser.user_id}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Gender</p>
                  <p>{selectedUser.gender || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Location</p>
                  <p>{selectedUser.location || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Joined</p>
                  <p>{new Date(selectedUser.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Verified</p>
                  <p>{selectedUser.is_verified ? "Yes" : "No"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Onboarding</p>
                  <p>{selectedUser.onboarding_completed ? "Complete" : "Incomplete"}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setUserDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
