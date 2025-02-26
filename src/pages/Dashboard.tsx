
import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users, Settings, Bell } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";

interface Profile {
  id: string;
  is_admin: boolean;
  full_name: string;
}

const Dashboard = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session?.user?.id)
        .single();

      if (error) throw error;
      return data as Profile;
    },
    enabled: !!session?.user?.id,
  });

  const { data: chatflows, isLoading } = useQuery({
    queryKey: ["chatflows"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chatflows")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const { data: users } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      if (!profile?.is_admin) return null;
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!profile?.is_admin,
  });

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!session) return <Navigate to="/auth" replace />;

  return (
    <div className="container mx-auto p-4 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Flowise Dashboard</h1>
          {profile?.is_admin && (
            <span className="inline-block bg-primary text-primary-foreground text-xs px-2 py-1 rounded mt-1">
              Admin
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {profile?.full_name}
          </span>
          <Button variant="outline" onClick={handleLogout}>
            Sign Out
          </Button>
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="tools">Tools</TabsTrigger>
          <TabsTrigger value="chat">Chat</TabsTrigger>
          {profile?.is_admin && (
            <TabsTrigger value="admin">Admin</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="dashboard">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Bell className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Recent Updates</h2>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Welcome to your Flowise dashboard! We'll keep you updated with the latest changes and notifications here.
                  </p>
                </div>
                {/* Placeholder for future notifications */}
                <div className="text-sm text-center text-muted-foreground">
                  No new notifications at this time
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workflows" className="space-y-4">
          <div className="flex justify-end">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> New Workflow
            </Button>
          </div>
          {isLoading ? (
            <div className="text-center">Loading workflows...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {chatflows?.map((flow) => (
                <Card key={flow.id} className="p-4">
                  <h3 className="font-semibold">{flow.name}</h3>
                  <p className="text-sm text-gray-500">{flow.description}</p>
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {flow.status}
                    </span>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </div>
                </Card>
              ))}
              {chatflows?.length === 0 && (
                <div className="col-span-full text-center py-8">
                  No workflows found. Create your first workflow to get started!
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="tools">
          <div className="text-center py-8">
            Tools configuration coming soon...
          </div>
        </TabsContent>

        <TabsContent value="chat">
          <div className="text-center py-8">
            Chat interface coming soon...
          </div>
        </TabsContent>

        {profile?.is_admin && (
          <TabsContent value="admin">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    User Management
                  </h2>
                  <Button variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    System Settings
                  </Button>
                </div>
                <div className="relative overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase bg-muted">
                      <tr>
                        <th className="px-6 py-3">Full Name</th>
                        <th className="px-6 py-3">Admin Status</th>
                        <th className="px-6 py-3">Created At</th>
                        <th className="px-6 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users?.map((user) => (
                        <tr key={user.id} className="border-b">
                          <td className="px-6 py-4">{user.full_name}</td>
                          <td className="px-6 py-4">
                            {user.is_admin ? (
                              <span className="text-green-600">Admin</span>
                            ) : (
                              <span className="text-gray-600">User</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {new Date(user.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default Dashboard;
