import { motion } from "framer-motion";

interface Category {
  id: string;
  name: string;
}

interface CategoryFilterProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  categories?: Category[];
}

export const CategoryFilter = ({
  selectedCategory,
  onSelectCategory,
  categories,
}: CategoryFilterProps) => {
  const safeCategories = Array.isArray(categories) ? categories : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-x-auto scrollbar-hide py-4 relative"
    >
      <div className="flex space-x-2 px-4 min-w-max">
        <button
          onClick={() => onSelectCategory('All')}
          className="relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105"
        >
          {selectedCategory === 'All' && (
            <motion.div
              layoutId="categoryPill"
              className="absolute inset-0 bg-blue-500 rounded-full"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          <span className={`relative z-10 ${
            selectedCategory === 'All'
              ? "text-white"
              : "text-gray-700 dark:text-gray-300"
          }`}>
            All
          </span>
        </button>
        {safeCategories.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.name)}
            className="relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105"
          >
            {selectedCategory === category.name && (
              <motion.div
                layoutId="categoryPill"
                className="absolute inset-0 bg-blue-500 rounded-full"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className={`relative z-10 ${
              selectedCategory === category.name
                ? "text-white"
                : "text-gray-700 dark:text-gray-300"
            }`}>
              {category.name}
            </span>
          </button>
        ))}
      </div>
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white dark:from-gray-900 pointer-events-none" />
    </motion.div>
  );
};
