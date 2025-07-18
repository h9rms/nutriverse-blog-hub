import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import Layout from '@/components/Layout';
import { PlusCircle, FileText, Bookmark, Heart, Edit, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import PostCard from '@/components/PostCard';
interface Post {
  id: string;
  title: string;
  content: string;
  category: string;
  image_url?: string;
  created_at: string;
  user_id: string;
  profiles: {
    username: string;
    full_name: string;
    avatar_url?: string;
  } | null;
}
const Dashboard = () => {
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [likedPosts, setLikedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const {
    user
  } = useAuth();
  const navigate = useNavigate();
  const {
    toast
  } = useToast();

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);
  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);
  const fetchDashboardData = async () => {
    if (!user) return;
    try {
      setLoading(true);

      // Fetch user's own posts
      const {
        data: postsData,
        error: postsError
      } = await supabase.from('posts').select('*').eq('user_id', user.id).order('created_at', {
        ascending: false
      });
      if (postsError) throw postsError;

      // Get profile for user's own posts
      const {
        data: profileData,
        error: profileError
      } = await supabase.from('profiles').select('user_id, username, full_name, avatar_url').eq('user_id', user.id).single();
      if (profileError) throw profileError;

      // Add profile to posts
      const postsWithProfile = (postsData || []).map(post => ({
        ...post,
        profiles: profileData
      }));

      // Fetch liked posts with better error handling
      const {
        data: likedData,
        error: likedError
      } = await supabase.from('likes').select('post_id').eq('user_id', user.id);
      let likedPostsProcessed: Post[] = [];
      if (likedError) {
        console.error('Error fetching liked posts:', likedError);
      } else if (likedData && likedData.length > 0) {
        try {
          const likedPostIds = likedData.map(like => like.post_id);
          const {
            data: likedPostsData,
            error: likedPostsError
          } = await supabase.from('posts').select('*').in('id', likedPostIds);
          if (likedPostsError) {
            console.error('Error fetching liked posts data:', likedPostsError);
          } else if (likedPostsData && likedPostsData.length > 0) {
            // Get profiles for liked posts
            const likedUserIds = [...new Set(likedPostsData.map(post => post.user_id))];
            if (likedUserIds.length > 0) {
              const {
                data: likedProfilesData,
                error: likedProfilesError
              } = await supabase.from('profiles').select('user_id, username, full_name, avatar_url').in('user_id', likedUserIds);
              const likedProfilesMap = new Map(likedProfilesData?.map(profile => [profile.user_id, profile]) || []);
              likedPostsProcessed = likedPostsData.map(post => ({
                ...post,
                profiles: likedProfilesMap.get(post.user_id) || null
              }));
            }
          }
        } catch (error) {
          console.error('Error processing liked posts:', error);
        }
      }

      // Fetch saved posts (simplified - just get post IDs for now)
      const {
        data: savedData,
        error: savedError
      } = await supabase.from('saved_posts').select('post_id').eq('user_id', user.id);
      if (savedError) throw savedError;
      setMyPosts(postsWithProfile);
      setSavedPosts([]); // Simplified for now
      setLikedPosts(likedPostsProcessed);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        variant: "destructive",
        title: "Fehler beim Laden",
        description: "Dashboard-Daten konnten nicht geladen werden."
      });
    } finally {
      setLoading(false);
    }
  };
  const handleDeletePost = async (postId: string) => {
    if (!confirm('Möchtest du diesen Post wirklich löschen?')) return;
    try {
      const {
        error
      } = await supabase.from('posts').delete().eq('id', postId);
      if (error) throw error;
      setMyPosts(prev => prev.filter(post => post.id !== postId));
      toast({
        title: "Post gelöscht",
        description: "Der Post wurde erfolgreich gelöscht."
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Fehler beim Löschen",
        description: error.message
      });
    }
  };
  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'fitness':
        return 'bg-primary text-primary-foreground';
      case 'nutrition':
        return 'bg-secondary text-secondary-foreground';
      case 'lifestyle':
        return 'bg-accent text-accent-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };
  if (!user) {
    return null; // Will redirect in useEffect
  }
  return <Layout>
      <div className="container py-8">
        {/* Header */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Dein Dashboard</h1>
              <p className="text-xl text-muted-foreground">
                Verwalte deine Posts und sieh deine Aktivitäten
              </p>
            </div>
            <Button asChild className="bg-gradient-to-r from-primary to-primary-glow hover:opacity-90">
              <Link to="/create-post">
                <PlusCircle className="mr-2 h-4 w-4" />
                Neuer Post
              </Link>
            </Button>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="max-w-6xl mx-auto">
          <Tabs defaultValue="my-posts" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="my-posts" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Meine Posts
              </TabsTrigger>
              
              <TabsTrigger value="liked" className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Geliked
              </TabsTrigger>
            </TabsList>

            {/* My Posts */}
            <TabsContent value="my-posts" className="mt-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold">Meine Posts ({myPosts.length})</h2>
                </div>

                {loading ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => <Card key={i} className="animate-pulse">
                        <div className="h-48 bg-muted rounded-t-lg"></div>
                        <CardHeader>
                          <div className="h-4 bg-muted rounded w-3/4"></div>
                          <div className="h-3 bg-muted rounded w-1/2"></div>
                        </CardHeader>
                      </Card>)}
                   </div> : myPosts.length === 0 ? <div className="text-center py-12">
                     <div className="max-w-md mx-auto">
                       <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                         <FileText className="h-8 w-8 text-muted-foreground" />
                       </div>
                       <h3 className="text-lg font-semibold mb-2">Noch keine Posts</h3>
                       <p className="text-muted-foreground mb-6">
                         Erstelle deinen ersten Post und teile dein Wissen mit der Community
                       </p>
                       <Button asChild className="bg-gradient-to-r from-primary to-primary-glow hover:opacity-90">
                         <Link to="/create-post">
                           <PlusCircle className="mr-2 h-4 w-4" />
                           Ersten Post erstellen
                         </Link>
                       </Button>
                     </div>
                   </div> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     {myPosts.map(post => <PostCard key={post.id} post={post} profile={post.profiles} showActions={true} />)}
                   </div>}
               </div>
             </TabsContent>

            {/* Saved Posts */}
            <TabsContent value="saved" className="mt-6">
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold">Gespeicherte Posts ({savedPosts.length})</h2>

                {loading ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => <Card key={i} className="animate-pulse">
                        <div className="h-48 bg-muted rounded-t-lg"></div>
                        <CardHeader>
                          <div className="h-4 bg-muted rounded w-3/4"></div>
                          <div className="h-3 bg-muted rounded w-1/2"></div>
                        </CardHeader>
                      </Card>)}
                  </div> : savedPosts.length === 0 ? <div className="text-center py-12">
                    <div className="max-w-md mx-auto">
                      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                        <Bookmark className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">Noch keine gespeicherten Posts</h3>
                      <p className="text-muted-foreground mb-6">
                        Speichere Posts, um sie später zu lesen
                      </p>
                      <Button asChild variant="outline">
                        <Link to="/posts">Posts entdecken</Link>
                      </Button>
                    </div>
                  </div> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {savedPosts.map(post => <PostCard key={post.id} post={post} profile={null} />)}
                  </div>}
              </div>
            </TabsContent>

            {/* Liked Posts */}
            <TabsContent value="liked" className="mt-6">
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold">Gelikte Posts ({likedPosts.length})</h2>

                {loading ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => <Card key={i} className="animate-pulse">
                        <div className="h-48 bg-muted rounded-t-lg"></div>
                        <CardHeader>
                          <div className="h-4 bg-muted rounded w-3/4"></div>
                          <div className="h-3 bg-muted rounded w-1/2"></div>
                        </CardHeader>
                      </Card>)}
                  </div> : likedPosts.length === 0 ? <div className="text-center py-12">
                    <div className="max-w-md mx-auto">
                      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                        <Heart className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">Noch keine gelikten Posts</h3>
                      <p className="text-muted-foreground mb-6">
                        Like Posts, die dir gefallen
                      </p>
                      <Button asChild variant="outline">
                        <Link to="/posts">Posts entdecken</Link>
                      </Button>
                    </div>
                  </div> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     {likedPosts.map(post => <PostCard key={post.id} post={post} profile={post.profiles} onLikeChange={fetchDashboardData} />)}
                   </div>}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>;
};
export default Dashboard;