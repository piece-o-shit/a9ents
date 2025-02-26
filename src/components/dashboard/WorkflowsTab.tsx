
import { Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { flowiseClient } from "@/integrations/flowise/client";
import { useToast } from "@/components/ui/use-toast";

export const WorkflowsTab = () => {
  const { toast } = useToast();
  
  const { data: flows, isLoading } = useQuery({
    queryKey: ["flows"],
    queryFn: async () => {
      try {
        return await flowiseClient.getFlows();
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch workflows. Make sure Flowise is running.",
          variant: "destructive",
        });
        return [];
      }
    },
  });

  const handleNewWorkflow = () => {
    // Open Flowise UI in a new tab
    window.open('http://localhost:3000', '_blank');
  };

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
          {flows?.map((flow: any) => (
            <Card key={flow.id} className="p-4">
              <h3 className="font-semibold">{flow.name}</h3>
              <p className="text-sm text-gray-500">{flow.description || 'No description'}</p>
              <div className="flex justify-between items-center mt-4">
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                  {flow.deployed ? 'Deployed' : 'Draft'}
                </span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.open(`http://localhost:3000/flow/${flow.id}`, '_blank')}
                >
                  Edit
                </Button>
              </div>
            </Card>
          ))}
          {(!flows || flows.length === 0) && (
            <div className="col-span-full text-center py-8">
              No workflows found. Create your first workflow to get started!
            </div>
          )}
        </div>
      )}
    </div>
  );
};

