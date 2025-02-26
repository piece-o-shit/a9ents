
import { Database, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const KnowledgeTab = () => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Database className="h-5 w-5" />
            Knowledge Base
          </h2>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Source
          </Button>
        </div>
        <div className="text-sm text-center text-muted-foreground">
          No knowledge sources added. Add documents or data sources to begin.
        </div>
      </CardContent>
    </Card>
  );
};
