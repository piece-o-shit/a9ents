
import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Settings, 
  BookOpen, 
  GitBranch,
  Wrench,
  MessageSquare,
  Shield
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { DashboardTab } from "@/components/dashboard/DashboardTab";
import { AgentsTab } from "@/components/dashboard/AgentsTab";
import { KnowledgeTab } from "@/components/dashboard/KnowledgeTab";
import { WorkflowsTab } from "@/components/dashboard/WorkflowsTab";
import { SettingsTab } from "@/components/dashboard/SettingsTab";
import { AdminTab } from "@/components/dashboard/AdminTab";

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
        <TabsList className="flex-wrap">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="agents">
            <Users className="h-4 w-4 mr-2" />
            Agents
          </TabsTrigger>
          <TabsTrigger value="knowledge">
            <BookOpen className="h-4 w-4 mr-2" />
            Knowledge
          </TabsTrigger>
          <TabsTrigger value="workflows">
            <GitBranch className="h-4 w-4 mr-2" />
            Workflows
          </TabsTrigger>
          <TabsTrigger value="tools">
            <Wrench className="h-4 w-4 mr-2" />
            Tools
          </TabsTrigger>
          <TabsTrigger value="chat">
            <MessageSquare className="h-4 w-4 mr-2" />
            Chat
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
          {profile?.is_admin && (
            <TabsTrigger value="admin">
              <Shield className="h-4 w-4 mr-2" />
              Admin
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="dashboard">
          <DashboardTab />
        </TabsContent>

        <TabsContent value="agents">
          <AgentsTab />
        </TabsContent>

        <TabsContent value="knowledge">
          <KnowledgeTab />
        </TabsContent>

        <TabsContent value="workflows">
          <WorkflowsTab />
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

        <TabsContent value="settings">
          <SettingsTab />
        </TabsContent>

        {profile?.is_admin && (
          <TabsContent value="admin">
            <AdminTab />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default Dashboard;
