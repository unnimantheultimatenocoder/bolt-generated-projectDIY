import { useEffect, useState } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { getArticles, getUserPreferences, getCategories } from "@/lib/api";
import { NewsCard } from "@/components/NewsCard";
import { CategoryFilter } from "@/components/CategoryFilter";
import { BottomNav } from "@/components/BottomNav";
import { AIChat } from "@/components/AIChat";
import { useAppStore } from "@/stores/useAppStore";
import { useInView } from "react-intersection-observer";

const ITEMS_PER_PAGE = 20;

const Index = () => {
  const { activeCategories, setPreferences } = useAppStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const { ref: loadMoreRef, inView } = useInView();

  const { data: preferences } = useQuery({
    queryKey: ['userPreferences'],
    queryFn: getUserPreferences,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => getCategories().then(data => data || []),
    staleTime: 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
  });

  useEffect(() => {
    if (preferences) {
      setPreferences(preferences);
    }
  }, [preferences, setPreferences]);

  const {
    data,
    isLoading: isArticlesLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['articles', { categories: activeCategories }],
    queryFn: async ({ pageParam = 1 }) => {
      const result = await getArticles({
        category: activeCategories[0],
        limit: ITEMS_PER_PAGE,
        page: pageParam,
      });
      return {
        articles: result.articles,
        nextPage: result.hasMore ? pageParam + 1 : undefined,
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    staleTime: 2 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js').catch(error => {
          console.error('Service Worker registration failed:', error);
        });
      });
    }
  }, []);

  if (isArticlesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
          <p className="mt-4 text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  const articles = data?.pages?.flatMap(page => page?.articles || []) || [];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-primary">News Feed</h1>
        </div>
      </header>

      <CategoryFilter 
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        categories={categories}
      />

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid gap-6 md:grid-cols-2"
            >
              {articles.map((article) => (
                <NewsCard
                  key={article.id}
                  id={article.id}
                  title={article.title}
                  summary={article.summary}
                  imageUrl={article.image_url || '/placeholder.svg'}
                  category={article.category?.name || 'Uncategorized'}
                  date={new Date(article.published_at).toLocaleDateString()}
                  url={article.original_url}
                />
              ))}
            </motion.div>
            {(hasNextPage || isFetchingNextPage) && (
              <div ref={loadMoreRef} className="flex justify-center mt-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
              </div>
            )}
          </div>
          <div className="lg:col-span-1">
            <AIChat />
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Index;
