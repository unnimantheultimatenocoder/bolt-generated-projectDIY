import { useState, useEffect, useRef } from "react";
    import { motion } from "framer-motion";
    import { ArrowUpRight, Bookmark, Clock, Share2, X } from "lucide-react";
    import { Card } from "@/components/ui/card";
    import { supabase } from "@/integrations/supabase/client";
    import { useToast } from "@/hooks/use-toast";
    import { calculateReadingTime } from "@/lib/utils";
    import {
      DropdownMenu,
      DropdownMenuContent,
      DropdownMenuItem,
      DropdownMenuTrigger,
    } from "@/components/ui/dropdown-menu";
    import { type Article } from "@/lib/api";
    import {
      Dialog,
      DialogContent,
      DialogDescription,
      DialogHeader,
      DialogTitle,
      DialogTrigger,
    } from "@/components/ui/dialog";
    import { Button } from "@/components/ui/button";
    import { Loader2 } from "lucide-react";

    interface NewsCardProps {
      article: Article;
      onSwipe: (direction: 'up' | 'down') => void;
    }

    export const NewsCard = ({ article, onSwipe }: NewsCardProps) => {
      const [isIntersecting, setIsIntersecting] = useState(false);
      const [imageLoaded, setImageLoaded] = useState(false);
      const [isSaved, setIsSaved] = useState(false);
      const [isSaving, setIsSaving] = useState(false);
      const [isSharing, setIsSharing] = useState(false);
      const { toast } = useToast();
      const readingTime = calculateReadingTime(article.summary);
      const cardRef = useRef<HTMLDivElement>(null);
      const [open, setOpen] = useState(false);
      const [lowResImage, setLowResImage] = useState<string | null>(null);

      useEffect(() => {
        const observer = new IntersectionObserver(
          ([entry]) => {
            setIsIntersecting(entry.isIntersecting);
          },
          { rootMargin: "50px" }
        );

        const element = cardRef.current;
        if (element) observer.observe(element);

        return () => {
          if (element) observer.unobserve(element);
        };
      }, [article.image_url]);

      useEffect(() => {
        const checkIfSaved = async () => {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data } = await supabase
              .from('saved_articles')
              .select('*')
              .eq('article_id', article.id)
              .eq('user_id', user.id)
              .single();
            setIsSaved(!!data);
          }
        };
        checkIfSaved();
      }, [article.id]);

      useEffect(() => {
        if (article.image_url) {
          const lowRes = article.image_url.replace(/(\.[a-z]+)$/, '_lowres$1');
          setLowResImage(lowRes);
        }
      }, [article.image_url]);

      const handleSave = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsSaving(true);
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            toast({
              title: "Error",
              description: "Please login to save articles",
              variant: "destructive",
            });
            return;
          }

          if (isSaved) {
            await supabase
              .from('saved_articles')
              .delete()
              .eq('article_id', article.id)
              .eq('user_id', user.id);
            setIsSaved(false);
            toast({
              title: "Removed",
              description: "Article removed from saved articles",
            });
          } else {
            await supabase
              .from('saved_articles')
              .insert([{ article_id: article.id, user_id: user.id }]);
            setIsSaved(true);
            toast({
              title: "Saved",
              description: "Article saved successfully",
            });
          }
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to save article",
            variant: "destructive",
          });
        } finally {
          setIsSaving(false);
        }
      };

      const handleShare = async (platform: 'twitter' | 'facebook' | 'linkedin' | 'email' | 'copy') => {
        setIsSharing(true);
        const shareText = `Check out this article: ${article.title}`;
        const shareUrl = article.original_url;

        try {
          switch (platform) {
            case 'twitter':
              window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
              break;
            case 'facebook':
              window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
              break;
            case 'linkedin':
              window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank');
              break;
            case 'email':
              window.location.href = `mailto:?subject=${encodeURIComponent(article.title)}&body=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`;
              break;
            case 'copy':
              await navigator.clipboard.writeText(shareUrl);
              toast({
                title: "Copied",
                description: "Link copied to clipboard",
              });
              break;
          }
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to share article",
            variant: "destructive",
          });
        } finally {
          setIsSharing(false);
        }
      };

      const cardVariants = {
        active: {
          y: 0,
          scale: 1,
          opacity: 1,
          zIndex: 1,
          rotate: 0,
        },
        previous: {
          y: '-100%',
          scale: 0.9,
          opacity: 0.5,
          zIndex: 0,
          rotate: -10,
        },
        next: {
          y: '100%',
          scale: 0.9,
          opacity: 0.5,
          zIndex: 0,
          rotate: 10,
        }
      };

      return (
        <motion.div
          ref={cardRef}
          className="w-full"
          variants={cardVariants}
          initial="next"
          animate="active"
          exit="previous"
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.7}
          onDragEnd={(_, info) => {
            const direction = info.offset.y > 0 ? 'down' : 'up';
            onSwipe(direction);
          }}
          style={{
            rotate: 0,
          }}
        >
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Card className="overflow-hidden cursor-pointer group relative card-hover-effect bg-white dark:bg-gray-800">
                <div className="absolute top-4 right-4 z-10 flex gap-2">
                  <button
                    onClick={handleSave}
                    className="p-2 bg-white/90 dark:bg-gray-800/90 rounded-full shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors backdrop-blur-sm"
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Bookmark
                        className={`w-4 h-4 ${isSaved ? 'fill-current text-blue-500' : 'text-gray-500'}`}
                      />
                    )}
                  </button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-2 bg-white/90 dark:bg-gray-800/90 rounded-full shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors backdrop-blur-sm">
                        <Share2 className="w-4 h-4 text-gray-500" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => handleShare('twitter')}>
                        Share on Twitter
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleShare('facebook')}>
                        Share on Facebook
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleShare('linkedin')}>
                        Share on LinkedIn
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleShare('email')}>
                        Share via Email
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleShare('copy')}>
                        Copy Link
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="relative h-48 overflow-hidden">
                  {isIntersecting && (
                    <>
                      {lowResImage && (
                        <img
                          src={lowResImage}
                          alt={article.title}
                          className="w-full h-full object-cover absolute top-0 left-0 blur-sm transition-opacity duration-500"
                          style={{ opacity: imageLoaded ? 0 : 1 }}
                          loading="lazy"
                        />
                      )}
                      <img
                        src={article.image_url || "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d"}
                        alt={article.title}
                        className={`w-full h-full object-cover transition-all duration-700 ${
                          imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                        } group-hover:scale-110`}
                        loading="lazy"
                        onLoad={() => setImageLoaded(true)}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </>
                  )}
                  {!imageLoaded && (
                    <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" />
                  )}
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-blue-500 text-white rounded-full text-sm font-medium shadow-lg">
                      {article.category?.name || "Uncategorized"}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-500 dark:text-gray-400">{new Date(article.published_at).toLocaleDateString()}</span>
                      <div className="flex items-center text-gray-500 dark:text-gray-400">
                        <Clock className="w-4 h-4 mr-1" />
                        <span className="text-sm">{readingTime} min read</span>
                      </div>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-500 transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 line-clamp-3 text-sm">
                    {article.summary}
                  </p>
                </div>
              </Card>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>{article.title}</DialogTitle>
                <DialogDescription>
                  {article.summary}
                </DialogDescription>
              </DialogHeader>
              <div className="relative h-[60vh] overflow-hidden">
                <img
                  src={article.image_url || "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d"}
                  alt={article.title}
                  className="w-full h-full object-contain"
                  loading="lazy"
                />
              </div>
              <div className="p-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Published on {new Date(article.published_at).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Source: {article.source}
                </p>
                <div className="flex justify-end mt-4">
                  <Button
                    variant="outline"
                    onClick={() => window.open(article.original_url, '_blank')}
                  >
                    View Original
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>
      );
    };
