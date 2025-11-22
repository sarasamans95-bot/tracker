import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Users, Plus, Trash2 } from "lucide-react";

interface Group {
  id: string;
  name: string;
  description: string | null;
  created_by: string;
}

interface GroupsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const GroupsDialog = ({ open, onOpenChange }: GroupsDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [newGroup, setNewGroup] = useState({ name: "", description: "" });
  const [memberEmail, setMemberEmail] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  useEffect(() => {
    if (open && user) {
      loadGroups();
    }
  }, [open, user]);

  const loadGroups = async () => {
    const { data } = await supabase
      .from("groups")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) {
      setGroups(data);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      const { data: group, error: groupError } = await supabase
        .from("groups")
        .insert({
          name: newGroup.name,
          description: newGroup.description || null,
          created_by: user.id
        })
        .select()
        .single();

      if (groupError) throw groupError;

      // Add creator as member
      const { error: memberError } = await supabase
        .from("group_members")
        .insert({
          group_id: group.id,
          user_id: user.id
        });

      if (memberError) throw memberError;

      toast({
        title: "Group created!",
        description: `${newGroup.name} is ready`
      });

      setNewGroup({ name: "", description: "" });
      loadGroups();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroupId) return;

    setLoading(true);

    try {
      // Find user by email
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", memberEmail)
        .single();

      if (profileError || !profile) {
        throw new Error("User not found with that email");
      }

      // Add to group
      const { error: memberError } = await supabase
        .from("group_members")
        .insert({
          group_id: selectedGroupId,
          user_id: profile.id
        });

      if (memberError) {
        if (memberError.code === "23505") {
          throw new Error("User is already a member of this group");
        }
        throw memberError;
      }

      toast({
        title: "Member added!",
        description: `${memberEmail} joined the group`
      });

      setMemberEmail("");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Manage Groups</DialogTitle>
          <DialogDescription>Create groups and add members</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="groups" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="groups">My Groups</TabsTrigger>
            <TabsTrigger value="create">Create Group</TabsTrigger>
          </TabsList>

          <TabsContent value="groups" className="space-y-4">
            {groups.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No groups yet. Create your first one!</p>
              </div>
            ) : (
              groups.map((group) => (
                <Card key={group.id}>
                  <CardHeader>
                    <CardTitle>{group.name}</CardTitle>
                    {group.description && (
                      <CardDescription>{group.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleAddMember} className="flex gap-2">
                      <Input
                        placeholder="Add member by email"
                        type="email"
                        value={selectedGroupId === group.id ? memberEmail : ""}
                        onChange={(e) => {
                          setMemberEmail(e.target.value);
                          setSelectedGroupId(group.id);
                        }}
                      />
                      <Button
                        type="submit"
                        size="sm"
                        disabled={loading || selectedGroupId !== group.id}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="create">
            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="group-name">Group Name</Label>
                <Input
                  id="group-name"
                  placeholder="Roommates, Trip to Paris..."
                  value={newGroup.name}
                  onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="group-description">Description (optional)</Label>
                <Input
                  id="group-description"
                  placeholder="What's this group for?"
                  value={newGroup.description}
                  onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Group
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
