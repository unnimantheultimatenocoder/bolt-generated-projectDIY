import { useMemo } from 'react';
    import { type Article } from '@/lib/api';

    const useViewportCards = (allCards: Article[], currentIndex: number) => {
      const visibleCards = useMemo(() => {
        const start = Math.max(0, currentIndex - 1);
        const end = Math.min(allCards.length, currentIndex + 2);
        return allCards.slice(start, end);
      }, [allCards, currentIndex]);

      return visibleCards;
    };

    export default useViewportCards;
