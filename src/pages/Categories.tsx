import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { getCategories } from "@/lib/api";
import { BottomNav } from "@/components/BottomNav";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const Categories = () => {
  const navigate = useNavigate();
  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
          <p className="mt-4 text-secondary">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-primary">Categories</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {Array.isArray(categories) && categories.map((category) => (
            <Card
              key={category.id}
              className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate(`/?category=${category.slug}`)}
            >
              <h3 className="text-lg font-semibold text-primary">{category.name}</h3>
              {category.description && (
                <p className="mt-2 text-secondary text-sm">{category.description}</p>
              )}
            </Card>
          ))}
        </motion.div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Categories;
