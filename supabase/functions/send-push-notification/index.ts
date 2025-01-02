import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get article data from request
    const { articleId, categoryId } = await req.json()

    // Get all users who have subscribed to this category
    const { data: userPreferences } = await supabase
      .from('user_category_preferences')
      .select('user_id')
      .eq('category_id', categoryId)

    if (!userPreferences) {
      return new Response(
        JSON.stringify({ error: 'No users found for this category' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get article details
    const { data: article } = await supabase
      .from('articles')
      .select('title, category:categories(name)')
      .eq('id', articleId)
      .single()

    if (!article) {
      return new Response(
        JSON.stringify({ error: 'Article not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Insert notifications for each user
    const notifications = userPreferences.map((pref) => ({
      user_id: pref.user_id,
      article_id: articleId,
      message: `New article in ${article.category.name}: ${article.title}`,
    }))

    const { error: notificationError } = await supabase
      .from('notifications')
      .insert(notifications)

    if (notificationError) {
      throw notificationError
    }

    return new Response(
      JSON.stringify({ message: 'Notifications sent successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
