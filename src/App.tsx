
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { useUserStore } from "@/store/userStore";
import AuthChoice from "@/components/auth/AuthChoice";
import UserDashboard from "@/components/dashboard/UserDashboard";

const queryClient = new QueryClient();

const App = () => {
  const { isAuthenticated } = useUserStore();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          {isAuthenticated ? <UserDashboard /> : <AuthChoice />}
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;