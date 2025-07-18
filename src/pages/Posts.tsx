// Fixed Card import issue
import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import Layout from '@/components/Layout';
import { Search, Filter, Dumbbell, Apple, Zap, BookOpen } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { enUS } from 'date-fns/locale';
import PostCard from '@/components/PostCard';
import { useStaggerAnimation } from '@/hooks/useScrollAnimation';

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
  likes: { count: number }[];
  comments: { count: number }[];
}

const Posts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  
  // Animation refs
  const headerRef = useStaggerAnimation(100);
  const filtersRef = useStaggerAnimation(150);
  const postsGridRef = useStaggerAnimation(200);

  useEffect(() => {
    const category = searchParams.get('category');
    if (category) {
      setSelectedCategory(category);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchPosts();
  }, [sortBy, selectedCategory]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      
      // First get posts with filters
      let query = supabase.from('posts').select('*');

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

      if (sortBy === 'likes') {
        query = query.order('created_at', { ascending: false });
      } else {
        query = query.order(sortBy, { ascending: false });
      }

      const { data: postsData, error: postsError } = await query;
      if (postsError) throw postsError;

      // Then get profiles for the post authors
      const userIds = postsData?.map(post => post.user_id) || [];
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, username, full_name, avatar_url')
        .in('user_id', userIds);

      if (profilesError) throw profilesError;

      // Combine posts with profiles
      const postsWithProfiles = (postsData || []).map(post => {
        const profile = profilesData?.find(p => p.user_id === post.user_id);
        return {
          ...post,
          profiles: profile || null,
          likes: [{ count: 0 }],
          comments: [{ count: 0 }]
        };
      });
      
      setPosts(postsWithProfiles);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.profiles?.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'fitness': return <Dumbbell className="h-4 w-4" />;
      case 'nutrition': return <Apple className="h-4 w-4" />;
      case 'lifestyle': return <Zap className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'fitness': return 'bg-primary text-primary-foreground';
      case 'nutrition': return 'bg-secondary text-secondary-foreground';
      case 'lifestyle': return 'bg-accent text-accent-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'fitness', label: 'Fitness' },
    { value: 'nutrition', label: 'Nutrition' },
    { value: 'lifestyle', label: 'Lifestyle' },
  ];

  return (
    <Layout>
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 container py-8">
        {/* Header */}
        <div ref={headerRef} className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 fade-in-up stagger-1">All Posts</h1>
          <p className="text-xl text-muted-foreground fade-in-up stagger-2">
            Discover inspiring content about fitness, nutrition and lifestyle
          </p>
        </div>

        {/* Filters */}
        <div ref={filtersRef} className="max-w-6xl mx-auto mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md fade-in-up stagger-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Category Filter */}
              <div className="fade-in-up stagger-2">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full sm:w-48">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sort */}
              <div className="fade-in-up stagger-3">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="created_at">Newest first</SelectItem>
                    <SelectItem value="title">Alphabetical</SelectItem>
                    <SelectItem value="likes">Most popular</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {user && (
              <div className="fade-in-up stagger-4">
                <Button asChild className="bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 transition-all duration-300 hover:scale-105">
                  <Link to="/create-post">Create New Post</Link>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Results Count */}
        <div className="max-w-6xl mx-auto mb-6">
          <p className="text-muted-foreground fade-in-up">
            {filteredPosts.length} {filteredPosts.length === 1 ? 'post found' : 'posts found'}
          </p>
        </div>

        {/* Posts Grid */}
        <div ref={postsGridRef} className="max-w-6xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(9)].map((_, i) => (
                <Card key={i} className="animate-pulse fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>
                  <div className="h-48 bg-muted rounded-t-lg"></div>
                  <CardHeader>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded"></div>
                      <div className="h-3 bg-muted rounded w-5/6"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-12 fade-in-up">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4 animate-bounce">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No posts found</h3>
                <p className="text-muted-foreground mb-6">
                  Try different search terms or filters
                </p>
                <Button onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                }} variant="outline" className="transition-all duration-300 hover:scale-105">
                  Reset filters
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post, index) => (
                <div 
                  key={post.id} 
                  className={`fade-in-up stagger-${Math.min(index + 1, 12)} transition-all duration-300 hover:scale-105`}
                >
                  <PostCard 
                    post={post} 
                    profile={post.profiles}
                  />
                </div>
              ))}
            </div>
          )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Posts;