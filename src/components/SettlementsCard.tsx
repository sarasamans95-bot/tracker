import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Settlement {
  fromUser: string;
  toUser: string;
  amount: number;
  expenseIds: string[];
}

export const SettlementsCard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settlements, setSettlements] = useState<Settlement[]>([]);

  useEffect(() => {
    if (user) {
      calculateSettlements();
    }
  }, [user]);

  const calculateSettlements = async () => {
    if (!user) return;

    // Get all unsettled splits
    const { data: splits } = await supabase
      .from("expense_splits")
      .select(`
        id,
        amount,
        user_id,
        expense_id,
        expenses:expense_id (
          paid_by,
          profiles:paid_by (username)
        )
      `)
      .eq("is_settled", false)
      .neq("user_id", user.id);

    if (!splits) return;

    // Group by debtor and creditor
    const balances: Record<string, Record<string, { amount: number; expenseIds: string[] }>> = {};

    splits.forEach((split: any) => {
      const debtor = split.user_id;
      const creditor = split.expenses.paid_by;
      
      if (!balances[debtor]) balances[debtor] = {};
      if (!balances[debtor][creditor]) {
        balances[debtor][creditor] = { amount: 0, expenseIds: [] };
      }
      
      balances[debtor][creditor].amount += Number(split.amount);
      balances[debtor][creditor].expenseIds.push(split.expense_id);
    });

    // Convert to settlements array
    const settlementsArray: Settlement[] = [];
    for (const debtor in balances) {
      for (const creditor in balances[debtor]) {
        if (debtor === user.id || creditor === user.id) {
          settlementsArray.push({
            fromUser: debtor,
            toUser: creditor,
            amount: balances[debtor][creditor].amount,
            expenseIds: balances[debtor][creditor].expenseIds
          });
        }
      }
    }

    setSettlements(settlementsArray);
  };

  const handleSettle = async (settlement: Settlement) => {
    try {
      const { error } = await supabase
        .from("expense_splits")
        .update({ is_settled: true, settled_at: new Date().toISOString() })
        .in("expense_id", settlement.expenseIds)
        .eq("user_id", settlement.fromUser);

      if (error) throw error;

      toast({
        title: "Settled!",
        description: "Payment marked as complete"
      });

      calculateSettlements();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Settlements</CardTitle>
        <CardDescription>Who owes what</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {settlements.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>All settled up!</p>
          </div>
        ) : (
          settlements.map((settlement, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 rounded-lg border bg-card"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant={settlement.fromUser === user?.id ? "destructive" : "default"}>
                    {settlement.fromUser === user?.id ? "You owe" : "Owes you"}
                  </Badge>
                  <ArrowRight className="w-3 h-3" />
                  <span className="font-medium">${settlement.amount.toFixed(2)}</span>
                </div>
              </div>
              {settlement.toUser === user?.id && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleSettle(settlement)}
                >
                  Mark Settled
                </Button>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};
