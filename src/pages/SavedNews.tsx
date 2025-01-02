import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { NewsCard } from "@/components/NewsCard";
import { BottomNav } from "@/components/BottomNav";
import { getArticles } from "@/lib/api";

const SavedNews = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['savedArticles'],
    queryFn: async () => {
      const result = await getArticles({ saved: true });
      return result.articles;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
          <p className="mt-4 text-secondary">Loading saved articles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-primary">Saved Articles</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {data?.map((article) => (
            <NewsCard
              key={article.id}
              id={article.id}
              title={article.title}
              summary={article.summary}
              imageUrl={article.image_url || "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d"}
              category={article.category?.name || "Uncategorized"}
              date={new Date(article.published_at).toLocaleDateString()}
              url={article.original_url}
            />
          ))}
        </motion.div>
      </main>

      <BottomNav />
    </div>
  );
};

export default SavedNews;
