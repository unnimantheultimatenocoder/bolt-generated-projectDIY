import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

interface ArticleFormData {
  title: string;
  summary: string;
  original_url: string;
  image_url: string;
  category_id: string;
  scheduled_for: Date | null;
  status: 'draft' | 'published' | 'archived';
  source: string;
}

const defaultValues: Partial<ArticleFormData> = {
  title: '',
  summary: '',
  original_url: '',
  image_url: '',
  category_id: '',
  scheduled_for: null,
  status: 'draft',
  source: 'manual', // Default source for manually created articles
};

export default function ArticleForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const form = useForm<ArticleFormData>({
    defaultValues,
  });

  // Fetch categories for the select input
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  // Fetch article data if editing
  const { data: article } = useQuery({
    queryKey: ['article', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Set form values when article data is loaded
  useEffect(() => {
    if (article) {
      form.reset({
        title: article.title,
        summary: article.summary,
        original_url: article.original_url,
        image_url: article.image_url || '',
        category_id: article.category_id || '',
        scheduled_for: article.scheduled_for ? new Date(article.scheduled_for) : null,
        status: article.status as 'draft' | 'published' | 'archived',
        source: article.source,
      });
    }
  }, [article, form]);

  // Handle form submission
  const mutation = useMutation({
    mutationFn: async (data: ArticleFormData) => {
      const { data: userData } = await supabase.auth.getUser();
      const articleData = {
        ...data,
        moderated_by: userData.user?.id,
        moderated_at: new Date().toISOString(),
        scheduled_for: data.scheduled_for?.toISOString() || null,
      };

      if (id) {
        const { error } = await supabase
          .from('articles')
          .update(articleData)
          .eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('articles')
          .insert([articleData]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: `Article ${id ? 'updated' : 'created'} successfully`,
      });
      navigate('/admin/articles');
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to ${id ? 'update' : 'create'} article: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ArticleFormData) => {
    mutation.mutate(data);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">
        {id ? 'Edit Article' : 'Create New Article'}
      </h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="summary"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Summary</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="original_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Original URL</FormLabel>
                <FormControl>
                  <Input {...field} type="url" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="image_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Image URL</FormLabel>
                <FormControl>
                  <Input {...field} type="url" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories?.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="scheduled_for"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Schedule Publication</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={`w-[240px] pl-3 text-left font-normal ${
                          !field.value && "text-muted-foreground"
                        }`}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date < new Date()
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-4">
            <Button type="submit" disabled={mutation.isPending}>
              {id ? 'Update Article' : 'Create Article'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin/articles')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
