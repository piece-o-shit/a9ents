
import { Users, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const AgentsTab = () => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Users className="h-5 w-5" />
            AI Agents
          </h2>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Agent
          </Button>
        </div>
        <div className="text-sm text-center text-muted-foreground">
          No agents configured. Create your first AI agent to get started!
        </div>
      </CardContent>
    </Card>
  );
};
