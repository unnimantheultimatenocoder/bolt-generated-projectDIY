import { type Article } from "./api";

    interface SwipeConfig {
      threshold: number;
      velocity: number;
      direction: 'vertical';
      resistance: number;
      preloadCount: number;
    }

    interface CardPosition {
      y: number;
      scale: number;
      opacity: number;
      zIndex: number;
    }

    interface CardState {
      current: CardPosition;
      next: CardPosition;
      previous: CardPosition;
    }

    export class CardStackManager {
      private cards: Article[];
      private currentIndex: number;
      private swipeConfig: SwipeConfig;
      private onCardChange: (index: number) => void;

      constructor(config: SwipeConfig, cards: Article[], onCardChange: (index: number) => void) {
        this.swipeConfig = config;
        this.cards = cards;
        this.currentIndex = 0;
        this.onCardChange = onCardChange;
      }

      getCurrentIndex() {
        return this.currentIndex;
      }

      handleSwipe(direction: 'up' | 'down', distance: number, velocity: number) {
        if (this.shouldTriggerCardChange(distance, velocity)) {
          this.transitionToNextCard(direction);
        } else {
          this.resetCurrentCard();
        }
      }

      private shouldTriggerCardChange(distance: number, velocity: number): boolean {
        return Math.abs(distance) > this.swipeConfig.threshold || 
               Math.abs(velocity) > this.swipeConfig.velocity;
      }

      private transitionToNextCard(direction: 'up' | 'down') {
        if (direction === 'up' && this.currentIndex > 0) {
          this.currentIndex--;
        } else if (direction === 'down' && this.currentIndex < this.cards.length - 1) {
          this.currentIndex++;
        }
        this.onCardChange(this.currentIndex);
      }

      private resetCurrentCard() {
        // Implement reset logic if needed
      }
    }
