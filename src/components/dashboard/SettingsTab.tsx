
import { Settings } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const SettingsTab = () => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center mb-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Settings className="h-5 w-5" />
            System Settings
          </h2>
        </div>
        <div className="space-y-4">
          <div className="grid gap-4">
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-medium mb-2">General Settings</h3>
              <p className="text-sm text-muted-foreground">
                Configure your application settings and preferences here.
              </p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-medium mb-2">API Configuration</h3>
              <p className="text-sm text-muted-foreground">
                Manage your API keys and integrations.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
