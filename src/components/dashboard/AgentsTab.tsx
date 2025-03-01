
import { Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { NewAgentDialog } from "./NewAgentDialog";

export const AgentsTab = () => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Users className="h-5 w-5" />
            AI Agents
          </h2>
          <NewAgentDialog />
        </div>
        <div className="text-sm text-center text-muted-foreground">
          No agents configured. Create your first AI agent to get started!
        </div>
      </CardContent>
    </Card>
  );
};
