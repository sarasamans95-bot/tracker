import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Receipt, Users, TrendingUp, LogOut } from "lucide-react";
import { ExpenseList } from "@/components/ExpenseList";
import { AddExpenseDialog } from "@/components/AddExpenseDialog";
import { GroupsDialog } from "@/components/GroupsDialog";
import { SettlementsCard } from "@/components/SettlementsCard";

interface Stats {
  totalExpenses: number;
  yourShare: number;
  youOwe: number;
  youAreOwed: number;
}

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalExpenses: 0,
    yourShare: 0,
    youOwe: 0,
    youAreOwed: 0
  });
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isGroupsOpen, setIsGroupsOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user, refreshKey]);

  const loadStats = async () => {
    if (!user) return;

    // Get all expenses where user is involved
    const { data: expenses } = await supabase
      .from("expenses")
      .select("*, expense_splits(*)")
      .eq("expense_splits.user_id", user.id);

    if (expenses) {
      const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
      
      const yourShare = expenses.reduce((sum, exp) => {
        const split = exp.expense_splits?.find((s: any) => s.user_id === user.id);
        return sum + (split ? Number(split.amount) : 0);
      }, 0);

      // Calculate what you owe (expenses paid by others where you have a split)
      const youOwe = expenses.reduce((sum, exp) => {
        if (exp.paid_by !== user.id) {
          const split = exp.expense_splits?.find((s: any) => s.user_id === user.id);
          if (split && !split.is_settled) {
            return sum + Number(split.amount);
          }
        }
        return sum;
      }, 0);

      // Calculate what you are owed (expenses you paid where others have unsettled splits)
      const { data: paidExpenses } = await supabase
        .from("expenses")
        .select("*, expense_splits(*)")
        .eq("paid_by", user.id);

      const youAreOwed = paidExpenses?.reduce((sum, exp) => {
        const unsettledSplits = exp.expense_splits?.filter(
          (s: any) => s.user_id !== user.id && !s.is_settled
        ) || [];
        return sum + unsettledSplits.reduce((s: number, split: any) => s + Number(split.amount), 0);
      }, 0) || 0;

      setStats({ totalExpenses, yourShare, youOwe, youAreOwed });
    }
  };

  const handleExpenseAdded = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-hero flex items-center justify-center shadow-primary">
              <Receipt className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              ExpenseTracker
            </h1>
          </div>
          <Button variant="ghost" size="icon" onClick={signOut}>
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardDescription>Total Expenses</CardDescription>
              <CardTitle className="text-3xl">${stats.totalExpenses.toFixed(2)}</CardTitle>
            </CardHeader>
            <CardContent>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </CardContent>
          </Card>

          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardDescription>Your Share</CardDescription>
              <CardTitle className="text-3xl">${stats.yourShare.toFixed(2)}</CardTitle>
            </CardHeader>
            <CardContent>
              <Receipt className="w-4 h-4 text-muted-foreground" />
            </CardContent>
          </Card>

          <Card className="shadow-md hover:shadow-lg transition-shadow border-destructive/20">
            <CardHeader className="pb-3">
              <CardDescription className="text-destructive">You Owe</CardDescription>
              <CardTitle className="text-3xl text-destructive">${stats.youOwe.toFixed(2)}</CardTitle>
            </CardHeader>
          </Card>

          <Card className="shadow-md hover:shadow-lg transition-shadow border-success/20">
            <CardHeader className="pb-3">
              <CardDescription className="text-success">You Are Owed</CardDescription>
              <CardTitle className="text-3xl text-success">${stats.youAreOwed.toFixed(2)}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button 
            onClick={() => setIsAddExpenseOpen(true)}
            className="shadow-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Expense
          </Button>
          <Button 
            variant="outline"
            onClick={() => setIsGroupsOpen(true)}
          >
            <Users className="w-4 h-4 mr-2" />
            Manage Groups
          </Button>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ExpenseList key={refreshKey} />
          </div>
          <div>
            <SettlementsCard key={refreshKey} />
          </div>
        </div>
      </main>

      <AddExpenseDialog 
        open={isAddExpenseOpen} 
        onOpenChange={setIsAddExpenseOpen}
        onExpenseAdded={handleExpenseAdded}
      />
      <GroupsDialog 
        open={isGroupsOpen} 
        onOpenChange={setIsGroupsOpen}
      />
    </div>
  );
};

export default Dashboard;
