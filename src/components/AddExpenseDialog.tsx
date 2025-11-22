import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface Group {
  id: string;
  name: string;
}

interface GroupMember {
  user_id: string;
  profiles: {
    username: string;
  };
}

interface AddExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExpenseAdded: () => void;
}

export const AddExpenseDialog = ({ open, onOpenChange, onExpenseAdded }: AddExpenseDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());

  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    category: "",
    groupId: "",
    splitType: "equal"
  });

  useEffect(() => {
    if (open && user) {
      loadGroups();
    }
  }, [open, user]);

  useEffect(() => {
    if (formData.groupId) {
      loadGroupMembers(formData.groupId);
    }
  }, [formData.groupId]);

  const loadGroups = async () => {
    const { data } = await supabase
      .from("groups")
      .select("id, name")
      .order("created_at", { ascending: false });

    if (data) {
      setGroups(data);
    }
  };

  const loadGroupMembers = async (groupId: string) => {
    const { data } = await supabase
      .from("group_members")
      .select("user_id, profiles(username)")
      .eq("group_id", groupId);

    if (data) {
      setMembers(data as any);
      // Auto-select all members
      setSelectedMembers(new Set(data.map(m => m.user_id)));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || selectedMembers.size === 0) return;

    setLoading(true);

    try {
      const amount = parseFloat(formData.amount);
      const splitAmount = amount / selectedMembers.size;

      // Create expense
      const { data: expense, error: expenseError } = await supabase
        .from("expenses")
        .insert({
          description: formData.description,
          amount,
          category: formData.category || null,
          group_id: formData.groupId,
          paid_by: user.id
        })
        .select()
        .single();

      if (expenseError) throw expenseError;

      // Create splits
      const splits = Array.from(selectedMembers).map(userId => ({
        expense_id: expense.id,
        user_id: userId,
        amount: splitAmount,
        is_settled: userId === user.id // Auto-settle for the payer
      }));

      const { error: splitsError } = await supabase
        .from("expense_splits")
        .insert(splits);

      if (splitsError) throw splitsError;

      toast({
        title: "Expense added!",
        description: `Split ${selectedMembers.size} ways`
      });

      onExpenseAdded();
      onOpenChange(false);
      resetForm();
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

  const resetForm = () => {
    setFormData({
      description: "",
      amount: "",
      category: "",
      groupId: "",
      splitType: "equal"
    });
    setSelectedMembers(new Set());
  };

  const toggleMember = (userId: string) => {
    const newSelected = new Set(selectedMembers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedMembers(newSelected);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Expense</DialogTitle>
          <DialogDescription>Split a bill with your group</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="group">Group</Label>
            <Select
              value={formData.groupId}
              onValueChange={(value) => setFormData({ ...formData, groupId: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a group" />
              </SelectTrigger>
              <SelectContent>
                {groups.map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="Dinner, groceries, etc."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                placeholder="Food, Travel..."
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />
            </div>
          </div>

          {members.length > 0 && (
            <div className="space-y-2">
              <Label>Split with</Label>
              <div className="border rounded-lg p-3 space-y-2 max-h-40 overflow-y-auto">
                {members.map((member) => (
                  <div key={member.user_id} className="flex items-center gap-2">
                    <Checkbox
                      id={member.user_id}
                      checked={selectedMembers.has(member.user_id)}
                      onCheckedChange={() => toggleMember(member.user_id)}
                    />
                    <Label htmlFor={member.user_id} className="cursor-pointer">
                      {member.profiles?.username}
                      {member.user_id === user?.id && " (You)"}
                    </Label>
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                Split amount: ${selectedMembers.size > 0 ? (parseFloat(formData.amount || "0") / selectedMembers.size).toFixed(2) : "0.00"} per person
              </p>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading || selectedMembers.size === 0}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Add Expense
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
