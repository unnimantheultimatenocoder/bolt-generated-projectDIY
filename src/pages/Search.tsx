import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Search as SearchIcon } from "lucide-react";
import { NewsCard } from "@/components/NewsCard";
import { BottomNav } from "@/components/BottomNav";
import { getArticles } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Search = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ['articles', { search: debouncedQuery }],
    queryFn: async () => {
      const result = await getArticles({ search: debouncedQuery });
      return result.articles;
    },
    enabled: debouncedQuery.length > 0,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setDebouncedQuery(searchQuery);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-primary mb-4">Search News</h1>
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              type="search"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button type="submit">
              <SearchIcon className="w-4 h-4 mr-2" />
              Search
            </Button>
          </form>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
          </div>
        ) : (
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
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default Search;
