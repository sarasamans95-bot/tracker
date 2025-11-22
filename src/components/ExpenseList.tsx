import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Receipt, Calendar, User } from "lucide-react";
import { format } from "date-fns";

interface Expense {
  id: string;
  description: string;
  amount: number;
  currency: string;
  expense_date: string;
  category: string | null;
  paid_by: string;
  profiles: {
    username: string;
  };
}

export const ExpenseList = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadExpenses();
    }
  }, [user]);

  const loadExpenses = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("expenses")
      .select(`
        *,
        profiles:paid_by (username)
      `)
      .order("expense_date", { ascending: false })
      .limit(20);

    if (data) {
      setExpenses(data as any);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Expenses</CardTitle>
        <CardDescription>Your latest shared expenses</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {expenses.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Receipt className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No expenses yet. Add your first one!</p>
          </div>
        ) : (
          expenses.map((expense) => (
            <div
              key={expense.id}
              className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold">{expense.description}</h4>
                  {expense.category && (
                    <Badge variant="secondary" className="text-xs">
                      {expense.category}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {expense.profiles?.username || 'Unknown'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(expense.expense_date), 'MMM d, yyyy')}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-primary">
                  ${Number(expense.amount).toFixed(2)}
                </div>
                <div className="text-xs text-muted-foreground">{expense.currency}</div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};
