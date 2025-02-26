
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [activeTab, setActiveTab] = useState<string>("workflows");

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

  return (
    <div className="container mx-auto p-4 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Flowise Dashboard</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> New Workflow
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="tools">Tools</TabsTrigger>
          <TabsTrigger value="chat">Chat</TabsTrigger>
        </TabsList>

        <TabsContent value="workflows" className="space-y-4">
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
      </Tabs>
    </div>
  );
};

export default Index;
