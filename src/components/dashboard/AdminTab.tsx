
import { Users, Settings } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const AdminTab = () => {
  const { data: users } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Management
          </h2>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            System Settings
          </Button>
        </div>
        <div className="relative overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-muted">
              <tr>
                <th className="px-6 py-3">Full Name</th>
                <th className="px-6 py-3">Admin Status</th>
                <th className="px-6 py-3">Created At</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users?.map((user) => (
                <tr key={user.id} className="border-b">
                  <td className="px-6 py-4">{user.full_name}</td>
                  <td className="px-6 py-4">
                    {user.is_admin ? (
                      <span className="text-green-600">Admin</span>
                    ) : (
                      <span className="text-gray-600">User</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
