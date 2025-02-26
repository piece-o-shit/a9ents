
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Plus, Save, Play, GitBranch } from "lucide-react";
import type { Workflow, WorkflowStep, WorkflowState } from "@/utils/langchainUtils";
import { executeWorkflow } from "@/utils/langchainUtils";
import { supabase } from "@/integrations/supabase/client";

export const WorkflowEditor = ({ 
  workflow: initialWorkflow,
  onSave
}: { 
  workflow?: Workflow;
  onSave?: () => void;
}) => {
  const { toast } = useToast();
  const [workflow, setWorkflow] = useState<Workflow>(initialWorkflow || {
    id: crypto.randomUUID(),
    name: "",
    description: "",
    steps: [],
    status: "draft",
  });

  const addStep = () => {
    const newStep: WorkflowStep = {
      id: crypto.randomUUID(),
      type: "process",
      name: `Step ${workflow.steps.length + 1}`,
      prompt: "",
    };
    setWorkflow({
      ...workflow,
      steps: [...workflow.steps, newStep],
    });
  };

  const addBranch = (stepId: string) => {
    const step = workflow.steps.find(s => s.id === stepId);
    if (step) {
      const branches = step.branches || [];
      const newStep: WorkflowStep = {
        id: crypto.randomUUID(),
        type: "process",
        name: `Branch ${branches.length + 1}`,
        prompt: "",
      };
      
      setWorkflow({
        ...workflow,
        steps: [...workflow.steps, newStep],
      });

      // Update the original step with the new branch
      updateStep(stepId, {
        branches: [...branches, newStep.id],
        condition: step.condition || "Evaluate the previous output and decide which branch to take.",
      });
    }
  };

  const updateStep = (stepId: string, updates: Partial<WorkflowStep>) => {
    setWorkflow({
      ...workflow,
      steps: workflow.steps.map((step) =>
        step.id === stepId ? { ...step, ...updates } : step
      ),
    });
  };

  const saveWorkflow = async () => {
    try {
      const { error } = await supabase
        .from("chatflows")
        .upsert({
          id: workflow.id,
          name: workflow.name,
          description: workflow.description,
          status: workflow.status,
          flow_data: workflow,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Workflow saved successfully",
      });

      onSave?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const runWorkflow = async () => {
    try {
      const result = await executeWorkflow(workflow, "Start the workflow", {
        startTime: new Date().toISOString(),
      });
      
      const message = result.error 
        ? `Error: ${result.error}`
        : `Result: ${result.output || 'No output'}`;
      
      toast({
        title: "Workflow Executed",
        description: message,
        variant: result.error ? "destructive" : "default",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Workflow Name</Label>
          <Input
            id="name"
            value={workflow.name}
            onChange={(e) => setWorkflow({ ...workflow, name: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            value={workflow.description}
            onChange={(e) => setWorkflow({ ...workflow, description: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Steps</h3>
          <Button onClick={addStep} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" /> Add Step
          </Button>
        </div>

        {workflow.steps.map((step) => (
          <Card key={step.id} className="p-4 space-y-4">
            <div className="flex justify-between items-center">
              <Input
                value={step.name}
                onChange={(e) => updateStep(step.id, { name: e.target.value })}
                placeholder="Step name"
                className="flex-1 mr-2"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => addBranch(step.id)}
                title="Add branch"
              >
                <GitBranch className="h-4 w-4" />
              </Button>
            </div>
            
            <Input
              value={step.prompt || ""}
              onChange={(e) => updateStep(step.id, { prompt: e.target.value })}
              placeholder="Enter prompt for this step"
            />
            
            {step.branches && step.branches.length > 0 && (
              <div className="mt-2">
                <Label>Condition for branching</Label>
                <Input
                  value={step.condition || ""}
                  onChange={(e) => updateStep(step.id, { condition: e.target.value })}
                  placeholder="Enter condition for selecting branches"
                />
                <div className="mt-2 text-sm text-gray-500">
                  Branches: {step.branches.join(", ")}
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      <div className="flex justify-end space-x-2">
        <Button onClick={runWorkflow} variant="secondary">
          <Play className="h-4 w-4 mr-2" /> Run
        </Button>
        <Button onClick={saveWorkflow}>
          <Save className="h-4 w-4 mr-2" /> Save
        </Button>
      </div>
    </div>
  );
};
