
import { Bell } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const DashboardTab = () => {
  return (
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
          <div className="text-sm text-center text-muted-foreground">
            No new notifications at this time
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
