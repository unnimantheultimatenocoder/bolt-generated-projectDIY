import React from "react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import Routes from "./Routes";
import "./App.css";

const queryClient = new QueryClient();

function App() {
  return (
    <React.StrictMode>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <BrowserRouter>
          <QueryClientProvider client={queryClient}>
            <TooltipProvider>
              <Routes />
              <Toaster />
            </TooltipProvider>
          </QueryClientProvider>
        </BrowserRouter>
      </ThemeProvider>
    </React.StrictMode>
  );
}

export default App;
