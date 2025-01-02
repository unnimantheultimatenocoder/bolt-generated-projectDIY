import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const AuthPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        navigate("/");
      }
    });

    // Check for auth error in URL
    const params = new URLSearchParams(window.location.search);
    const error = params.get('error_description');
    if (error) {
      // Handle rate limit error specifically
      if (error.includes('rate_limit')) {
        toast({
          title: "Please Wait",
          description: "For security purposes, please wait a minute before trying again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Authentication Error",
          description: error,
          variant: "destructive",
        });
      }
    }

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center mb-6 text-primary">Welcome to News App</h1>
        <Auth
          supabaseClient={supabase}
          appearance={{ 
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: 'rgb(var(--color-primary))',
                  brandAccent: 'rgb(var(--color-primary))',
                }
              }
            },
            // Handle errors through the appearance prop
            style: {
              message: {
                color: 'rgb(239 68 68)'
              }
            }
          }}
          theme="light"
          providers={[]}
          redirectTo={`${window.location.origin}/auth/callback`}
          showLinks={true}
          view="sign_up"
          magicLink={false}
        />
      </div>
    </div>
  );
};

export default AuthPage;
