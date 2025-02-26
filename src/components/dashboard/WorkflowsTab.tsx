
import { Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { WorkflowEditor } from "@/components/workflows/WorkflowEditor";
import type { Workflow } from "@/utils/langchainUtils";

export const WorkflowsTab = () => {
  const { toast } = useToast();
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const { data: chatflows, isLoading, refetch } = useQuery({
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

  const handleEdit = (flow: any) => {
    setSelectedWorkflow(flow.flow_data);
    setIsEditing(true);
  };

  const handleNewWorkflow = () => {
    setSelectedWorkflow(null);
    setIsEditing(true);
  };

  if (isEditing) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">
            {selectedWorkflow ? "Edit Workflow" : "New Workflow"}
          </h2>
          <Button variant="outline" onClick={() => setIsEditing(false)}>
            Back to List
          </Button>
        </div>
        <WorkflowEditor
          workflow={selectedWorkflow || undefined}
          onSave={() => {
            refetch();
            setIsEditing(false);
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={handleNewWorkflow}>
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
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleEdit(flow)}
                >
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
    </div>
  );
};
