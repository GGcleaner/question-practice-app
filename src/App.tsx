import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import QuestionBanks from "./pages/QuestionBanks";
import Practice from "./pages/Practice";
import Exam from "./pages/Exam";
import WrongQuestions from "./pages/WrongQuestions";
import Favorites from "./pages/Favorites";
import Stats from "./pages/Stats";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/banks" element={<QuestionBanks />} />
            <Route path="/practice" element={<Practice />} />
            <Route path="/exam" element={<Exam />} />
            <Route path="/wrong" element={<WrongQuestions />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
