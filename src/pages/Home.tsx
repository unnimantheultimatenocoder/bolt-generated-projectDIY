import { useState, useEffect, useRef } from "react";
    import { useInfiniteQuery } from "@tanstack/react-query";
    import { motion } from "framer-motion";
    import PullToRefresh from "react-pull-to-refresh";
    import { NewsCard } from "@/components/NewsCard";
    import { BottomNav } from "@/components/BottomNav";
    import { CategoryFilter } from "@/components/CategoryFilter";
    import { getArticles, type Article, type Category } from "@/lib/api";
    import { useToast } from "@/components/ui/use-toast";
    import { useInView } from "react-intersection-observer";
    import useCardPreloader from "@/hooks/useCardPreloader";
    import useViewportCards from "@/hooks/useViewportCards";
    import { CardStackManager } from "@/lib/cardStackManager";
    import { useQuery } from "@tanstack/react-query";
    import { Progress } from "@/components/ui/progress";

    const ITEMS_PER_PAGE = 10;

    const Home = () => {
      const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
      const { toast } = useToast();
      const { ref: loadMoreRef, inView } = useInView();
      const [currentIndex, setCurrentIndex] = useState(0);
      const [readingProgress, setReadingProgress] = useState(0);
      const cardStackManagerRef = useRef<CardStackManager | null>(null);

      const { data: categories } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
          const { data, error } = await supabase
            .from('categories')
            .select('*')
            .order('name');
          if (error) throw error;
          return data as Category[];
        },
      });

      const {
        data,
        isLoading: articlesLoading,
        fetchNextPage,
        hasNextPage,
        refetch,
      } = useInfiniteQuery({
        queryKey: ['articles', { category: selectedCategory }],
        queryFn: ({ pageParam = 1 }) => getArticles({
          category: selectedCategory || undefined,
          page: pageParam,
          limit: ITEMS_PER_PAGE,
        }),
        initialPageParam: 1,
        getNextPageParam: (lastPage) => lastPage.nextPage,
      });

      const allArticles = data?.pages.flatMap(page => page.articles) || [];
      const visibleCards = useViewportCards(allArticles, currentIndex);

      useEffect(() => {
        if (allArticles.length > 0) {
          cardStackManagerRef.current = new CardStackManager(
            {
              threshold: 50,
              velocity: 50,
              direction: 'vertical',
              resistance: 0.7,
              preloadCount: 3,
            },
            allArticles,
            setCurrentIndex
          );
        }
      }, [allArticles]);

      useCardPreloader(allArticles, currentIndex);

      useEffect(() => {
        if (inView && hasNextPage) {
          fetchNextPage();
        }
      }, [inView, hasNextPage, fetchNextPage]);

      const handleRefresh = async () => {
        try {
          await refetch();
          toast({
            title: "Refreshed",
            description: "Latest articles loaded",
          });
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to refresh articles",
            variant: "destructive",
          });
        }
      };

      const handleSwipe = (direction: 'up' | 'down') => {
        cardStackManagerRef.current?.handleSwipe(direction, 100, 100);
        if (cardStackManagerRef.current) {
          setReadingProgress(
            (cardStackManagerRef.current.getCurrentIndex() + 1) / allArticles.length * 100
          );
        }
      };

      const handleCategoryChange = (category: string | null) => {
        setSelectedCategory(category);
        setCurrentIndex(0);
        if (allArticles.length > 0) {
          cardStackManagerRef.current = new CardStackManager(
            {
              threshold: 50,
              velocity: 50,
              direction: 'vertical',
              resistance: 0.7,
              preloadCount: 3,
            },
            allArticles,
            setCurrentIndex
          );
        }
      };

      if (articlesLoading) {
        return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto" />
              <p className="mt-4 text-secondary">Loading articles...</p>
            </div>
          </div>
        );
      }

      return (
        <div className="min-h-screen bg-gray-50 pb-20">
          <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 py-4">
              <h1 className="text-2xl font-bold text-primary">Global News</h1>
              <CategoryFilter
                selectedCategory={selectedCategory || "All"}
                onSelectCategory={handleCategoryChange}
                categories={categories}
              />
            </div>
          </header>

          <main className="max-w-7xl mx-auto px-4 py-6">
            <PullToRefresh onRefresh={handleRefresh}>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {visibleCards.map((article) => (
                  <NewsCard
                    key={article.id}
                    article={article}
                    onSwipe={handleSwipe}
                  />
                ))}
              </motion.div>
              {hasNextPage && (
                <div ref={loadMoreRef} className="flex justify-center mt-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
                </div>
              )}
            </PullToRefresh>
          </main>
          <div className="fixed bottom-20 left-4 right-4">
            <Progress value={readingProgress} />
          </div>
          <BottomNav />
        </div>
      );
    };

    export default Home;
