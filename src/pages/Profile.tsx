import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { getUserPreferences, updateUserPreferences } from "@/lib/api";
import { BottomNav } from "@/components/BottomNav";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { TrendingArticles } from "@/components/TrendingArticles";

const Profile = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch user data
  useEffect(() => {
    const getUserEmail = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email || "");
      }
      setLoading(false);
    };
    getUserEmail();
  }, []);

  const { data: preferences, isLoading: preferencesLoading } = useQuery({
    queryKey: ['userPreferences'],
    queryFn: getUserPreferences,
  });

  const mutation = useMutation({
    mutationFn: updateUserPreferences,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userPreferences'] });
      toast({
        title: "Success",
        description: "Your preferences have been updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update preferences. Please try again.",
        variant: "destructive",
      });
      console.error("Error updating preferences:", error);
    },
  });

  const handleNotificationToggle = (type: 'email' | 'push') => {
    if (!preferences) return;

    const newSettings = {
      ...preferences,
      notification_settings: {
        ...preferences.notification_settings,
        [type]: !preferences.notification_settings[type],
      },
    };

    mutation.mutate(newSettings);
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading || preferencesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-secondary">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-primary">Profile</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <h2 className="text-xl font-semibold text-primary mb-4">Account Information</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                disabled
                className="mt-1"
              />
            </div>
            <Button
              variant="destructive"
              onClick={handleSignOut}
              className="w-full sm:w-auto"
            >
              Sign Out
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <h2 className="text-xl font-semibold text-primary mb-6">Notification Preferences</h2>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Email Notifications</h3>
                <p className="text-secondary text-sm">Receive news updates via email</p>
              </div>
              <Switch
                checked={preferences?.notification_settings.email}
                onCheckedChange={() => handleNotificationToggle('email')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Push Notifications</h3>
                <p className="text-secondary text-sm">Get instant updates on your device</p>
              </div>
              <Switch
                checked={preferences?.notification_settings.push}
                onCheckedChange={() => handleNotificationToggle('push')}
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <TrendingArticles />
        </motion.div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Profile;
