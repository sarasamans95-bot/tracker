import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Receipt, Users, TrendingUp, Shield, ArrowRight } from "lucide-react";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
      {/* Hero Section */}
      <header className="container mx-auto px-4 py-8">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-hero flex items-center justify-center shadow-primary">
              <Receipt className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              ExpenseTracker
            </span>
          </div>
          <Button onClick={() => navigate("/auth")} variant="outline">
            Sign In
          </Button>
        </nav>
      </header>

      <main className="container mx-auto px-4">
        {/* Hero */}
        <section className="text-center py-20 space-y-6">
          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            Split Bills
            <span className="block bg-gradient-hero bg-clip-text text-transparent">
              Track Expenses
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            The easiest way to share costs with friends, roommates, and groups.
            Keep track of who owes what, effortlessly.
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Button
              size="lg"
              onClick={() => navigate("/auth")}
              className="shadow-primary text-lg"
            >
              Get Started Free
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl bg-gradient-card border shadow-md hover:shadow-xl transition-all">
            <div className="w-12 h-12 rounded-xl bg-gradient-hero flex items-center justify-center mb-4 shadow-primary">
              <Receipt className="w-6 h-6 text-primary-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-2">Easy Expense Tracking</h3>
            <p className="text-muted-foreground">
              Add expenses in seconds and automatically split them with your group.
              No more mental math or awkward conversations.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-card border shadow-md hover:shadow-xl transition-all">
            <div className="w-12 h-12 rounded-xl bg-gradient-accent flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-accent-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-2">Group Management</h3>
            <p className="text-muted-foreground">
              Create groups for roommates, trips, or any shared expenses.
              Keep everything organized in one place.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-card border shadow-md hover:shadow-xl transition-all">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mb-4 shadow-primary">
              <TrendingUp className="w-6 h-6 text-primary-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-2">Smart Settlements</h3>
            <p className="text-muted-foreground">
              See who owes what at a glance. Settle up with a tap and keep
              everyone on the same page.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 text-center">
          <div className="max-w-3xl mx-auto p-12 rounded-3xl bg-gradient-hero shadow-xl">
            <h2 className="text-4xl font-bold text-primary-foreground mb-4">
              Ready to simplify your shared expenses?
            </h2>
            <p className="text-lg text-primary-foreground/90 mb-8">
              Join thousands of groups already tracking expenses effortlessly.
            </p>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => navigate("/auth")}
              className="text-lg"
            >
              Start Tracking Now
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t py-8 mt-20">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2025 ExpenseTracker. Split bills, share costs, stay friends.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
