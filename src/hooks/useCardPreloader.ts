import { useEffect } from 'react';
    import { type Article } from '@/lib/api';

    const useCardPreloader = (cards: Article[], currentIndex: number) => {
      const preloadCount = 3;

      useEffect(() => {
        const preloadImages = cards
          .slice(currentIndex, currentIndex + preloadCount)
          .map(card => {
            const img = new Image();
            img.src = card.image_url || '';
            return img;
          });

        return () => {
          preloadImages.forEach(img => {
            img.src = '';
          });
        };
      }, [currentIndex, cards]);
    };

    export default useCardPreloader;
