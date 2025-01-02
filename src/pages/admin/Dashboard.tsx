import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Users,
  FileText,
  Settings,
  Tag,
  Rss,
} from "lucide-react";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [articles, users, sources] = await Promise.all([
        supabase.from('articles').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('article_sources').select('*', { count: 'exact', head: true })
      ]);
      
      return {
        articles: articles.count || 0,
        users: users.count || 0,
        sources: sources.count || 0
      };
    }
  });

  const menuItems = [
    {
      title: "Articles",
      icon: <FileText className="h-6 w-6" />,
      description: `${stats?.articles || 0} articles in total`,
      path: "/admin/articles"
    },
    {
      title: "Users",
      icon: <Users className="h-6 w-6" />,
      description: `${stats?.users || 0} registered users`,
      path: "/admin/users"
    },
    {
      title: "Categories",
      icon: <BarChart3 className="h-6 w-6" />,
      description: "Manage news categories",
      path: "/admin/categories"
    },
    {
      title: "Tags",
      icon: <Tag className="h-6 w-6" />,
      description: "Manage article tags",
      path: "/admin/tags"
    },
    {
      title: "Sources",
      icon: <Rss className="h-6 w-6" />,
      description: `${stats?.sources || 0} active sources`,
      path: "/admin/sources"
    },
    {
      title: "Settings",
      icon: <Settings className="h-6 w-6" />,
      description: "System configuration",
      path: "/admin/settings"
    }
  ];

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map((item) => (
          <Card
            key={item.path}
            className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => navigate(item.path)}
          >
            <div className="flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                {item.icon}
              </div>
              <div>
                <h2 className="text-lg font-semibold">{item.title}</h2>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
