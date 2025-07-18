import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import Layout from '@/components/Layout';
import { TrendingUp, Users, BookOpen, Dumbbell, Apple, Zap } from 'lucide-react';
import PostCard from '@/components/PostCard';
import { useScrollAnimation, useCountUp, useStaggerAnimation, usePageLoadAnimation } from '@/hooks/useScrollAnimation';

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

const Index = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Animation hooks
  const heroRef = useScrollAnimation('fade-in-up', 0);
  const statsRef = useScrollAnimation('fade-in-up', 200);
  const postsRef = useStaggerAnimation(150);
  const { ref: pageRef } = usePageLoadAnimation(100);

  // New state for section animation
  const [sectionVisible, setSectionVisible] = useState(false);
  const [countersStarted, setCountersStarted] = useState(false);

  // Refs for counters
  const articleCountRef = useRef<HTMLSpanElement>(null);
  const memberCountRef = useRef<HTMLSpanElement>(null);
  const storyCountRef = useRef<HTMLSpanElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Start counters after appearance animations
  useEffect(() => {
    if (countersStarted) {
      const animateCount = (element: HTMLSpanElement | null, end: number, suffix: string = '+') => {
        if (!element) return;
        
        let start = 0;
        const duration = 2000;
        const startTime = performance.now();

        const updateCount = (currentTime: number) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          
          const current = Math.floor(start + (end - start) * progress);
          element.textContent = `${current.toLocaleString()}${suffix}`;

          if (progress < 1) {
            requestAnimationFrame(updateCount);
          }
        };

        requestAnimationFrame(updateCount);
      };

      // Start all counters with delay
      setTimeout(() => animateCount(articleCountRef.current, 1000), 0);
      setTimeout(() => animateCount(memberCountRef.current, 5000), 200);
      setTimeout(() => animateCount(storyCountRef.current, 10000), 400);
    }
  }, [countersStarted]);

  // Intersection observer for the section
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !sectionVisible) {
            setSectionVisible(true);
            // Start counters after appearance animations (total delay: 1s + 0.8s stagger)
            setTimeout(() => setCountersStarted(true), 1800);
          }
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, [sectionVisible]);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      // First get posts
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(6);

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

  return (
    <Layout>
      <div ref={pageRef} className="page-load-animate">
        {/* Hero Section - Full Height */}
        <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/15 to-primary/10"></div>
          <div className="absolute inset-0 gradient-animated opacity-30"></div>
          
          {/* Enhanced Floating Elements with different animations */}
          <div className="absolute top-20 left-10 w-20 h-20 rounded-full bg-primary/20 float-slow stagger-1 blur-sm"></div>
          <div className="absolute top-40 right-20 w-16 h-16 rounded-full bg-accent/20 float stagger-2 blur-sm"></div>
          <div className="absolute bottom-40 left-20 w-24 h-24 rounded-full bg-secondary/20 float-reverse stagger-3 blur-sm"></div>
          <div className="absolute bottom-20 right-10 w-12 h-12 rounded-full bg-primary/30 float-slow stagger-4 blur-sm"></div>
          <div className="absolute top-1/2 left-5 w-8 h-8 rounded-full bg-accent/25 float stagger-5 blur-sm"></div>
          <div className="absolute top-1/3 right-5 w-14 h-14 rounded-full bg-secondary/25 float-reverse stagger-6 blur-sm"></div>
          
          <div className="relative container z-10">
            <div className="max-w-6xl mx-auto text-center">
              <div className="scale-in stagger-1">
                <h1 className="text-responsive-4xl md:text-8xl font-bold mb-8 bg-gradient-to-r from-primary via-accent to-primary-glow bg-clip-text text-transparent animate-gradient-x">
                  Your Fitness & Nutrition Journey
                </h1>
              </div>
              <div className="fade-in-up stagger-2">
                <p className="text-responsive-xl md:text-3xl text-muted-foreground mb-12 max-w-4xl mx-auto leading-relaxed">
                  Discover inspiring content, share your knowledge and become part of a community 
                  passionate about health and wellbeing.
                </p>
              </div>
              <div className="fade-in-up stagger-3">
                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                  <Button asChild size="lg" className="gradient-border bg-gradient-to-r from-primary to-primary-glow text-white hover:opacity-90 hover:scale-105 transition-all duration-300 px-8 py-6 text-lg shadow-2xl animate-pulse-glow magnetic">
                    <Link to="/posts">Discover All Posts</Link>
                  </Button>
                  {!user ? (
                    <Button asChild variant="outline" size="lg" className="glass-effect border-primary/30 text-foreground hover:bg-primary/10 hover:text-primary hover:scale-105 transition-all duration-300 px-8 py-6 text-lg magnetic">
                      <Link to="/auth">Join Now</Link>
                    </Button>
                  ) : (
                    <Button asChild variant="outline" size="lg" className="glass-effect border-primary/30 text-foreground hover:bg-primary/10 hover:text-primary hover:scale-105 transition-all duration-300 px-8 py-6 text-lg magnetic">
                      <Link to="/create-post">Create Your Own Post</Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section - Full Height */}
        <section ref={sectionRef} className="min-h-screen flex items-center justify-center border-y bg-gradient-to-br from-muted/30 via-accent/5 to-primary/5 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,_hsl(var(--primary))_0%,_transparent_50%)]"></div>
            <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_80%,_hsl(var(--accent))_0%,_transparent_50%)]"></div>
          </div>
          
          <div className="container relative z-10">
            <div className="max-w-6xl mx-auto">
              <div className={`text-center mb-20 ${sectionVisible ? 'fade-in-up' : 'opacity-0'}`}>
                <h2 className="text-responsive-3xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Why Choose Our Platform?
                </h2>
                <p className="text-responsive-lg text-muted-foreground max-w-3xl mx-auto">
                  Join thousands of fitness enthusiasts who are already transforming their lives
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                <div className={`text-center group ${sectionVisible ? 'fade-in-up stagger-2' : 'opacity-0'}`}>
                  <div className={`relative inline-block mb-8 ${sectionVisible ? 'scale-in stagger-3' : 'opacity-0'}`}>
                    <div className="flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary-glow text-primary-foreground mx-auto shadow-2xl group-hover:scale-110 transition-all duration-500">
                      <BookOpen className="h-12 w-12" />
                    </div>
                  </div>
                  <h3 className={`text-responsive-xl font-bold mb-4 group-hover:text-primary transition-colors ${sectionVisible ? 'fade-in-up stagger-4' : 'opacity-0'}`}>Knowledge Exchange</h3>
                  <p className={`text-muted-foreground text-responsive-base leading-relaxed mb-4 ${sectionVisible ? 'fade-in-up stagger-5' : 'opacity-0'}`}>Share your experiences and learn from others in our supportive community</p>
                  <div className={`${sectionVisible ? 'fade-in-up stagger-6' : 'opacity-0'}`}>
                    <span ref={articleCountRef} className="text-4xl font-bold text-primary block">0+</span>
                    <div className="text-sm text-muted-foreground">Articles shared</div>
                  </div>
                </div>
                
                <div className={`text-center group ${sectionVisible ? 'fade-in-up stagger-2' : 'opacity-0'}`}>
                  <div className={`relative inline-block mb-8 ${sectionVisible ? 'scale-in stagger-3' : 'opacity-0'}`}>
                    <div className="flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-accent to-secondary text-accent-foreground mx-auto shadow-2xl group-hover:scale-110 transition-all duration-500">
                      <Users className="h-12 w-12" />
                    </div>
                  </div>
                  <h3 className={`text-responsive-xl font-bold mb-4 group-hover:text-primary transition-colors ${sectionVisible ? 'fade-in-up stagger-4' : 'opacity-0'}`}>Community</h3>
                  <p className={`text-muted-foreground text-responsive-base leading-relaxed mb-4 ${sectionVisible ? 'fade-in-up stagger-5' : 'opacity-0'}`}>Connect with like-minded people who share your passion for health and fitness</p>
                  <div className={`${sectionVisible ? 'fade-in-up stagger-6' : 'opacity-0'}`}>
                    <span ref={memberCountRef} className="text-4xl font-bold text-accent block">0+</span>
                    <div className="text-sm text-muted-foreground">Active members</div>
                  </div>
                </div>
                
                <div className={`text-center group ${sectionVisible ? 'fade-in-up stagger-2' : 'opacity-0'}`}>
                  <div className={`relative inline-block mb-8 ${sectionVisible ? 'scale-in stagger-3' : 'opacity-0'}`}>
                    <div className="flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-secondary to-primary text-secondary-foreground mx-auto shadow-2xl group-hover:scale-110 transition-all duration-500">
                      <TrendingUp className="h-12 w-12" />
                    </div>
                  </div>
                  <h3 className={`text-responsive-xl font-bold mb-4 group-hover:text-primary transition-colors ${sectionVisible ? 'fade-in-up stagger-4' : 'opacity-0'}`}>Progress</h3>
                  <p className={`text-muted-foreground text-responsive-base leading-relaxed mb-4 ${sectionVisible ? 'fade-in-up stagger-5' : 'opacity-0'}`}>Document your achievements and track your transformation journey</p>
                  <div className={`${sectionVisible ? 'fade-in-up stagger-6' : 'opacity-0'}`}>
                    <span ref={storyCountRef} className="text-4xl font-bold text-primary block">0+</span>
                    <div className="text-sm text-muted-foreground">Success stories</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Latest Posts */}
        <section className="min-h-screen flex items-center justify-center py-20 bg-gradient-to-br from-background via-muted/10 to-background relative overflow-hidden">
          {/* Enhanced Decorative Elements */}
          <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full blur-3xl float-slow"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-br from-accent/10 to-secondary/10 rounded-full blur-3xl float-reverse"></div>
          <div className="absolute top-1/2 left-10 w-20 h-20 bg-gradient-to-br from-secondary/10 to-primary/10 rounded-full blur-2xl float"></div>
          
          <div className="container relative z-10">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-20 zoom-in stagger-1">
                <h2 className="text-responsive-3xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary-glow bg-clip-text text-transparent">
                  Latest Posts
                </h2>
                <p className="text-responsive-lg text-muted-foreground max-w-3xl mx-auto">
                  Discover the latest contributions from our amazing community of fitness enthusiasts
                </p>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className={`fade-in-up stagger-${(i % 6) + 2}`}>
                      <Card className="glass-card hover-lift animate-shimmer">
                        <div className="h-64 bg-gradient-to-r from-muted via-muted/50 to-muted rounded-t-lg relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-background/20 to-transparent animate-shimmer"></div>
                        </div>
                        <CardHeader>
                          <div className="h-6 bg-gradient-to-r from-muted to-muted/50 rounded w-3/4 mb-2 animate-shimmer"></div>
                          <div className="h-4 bg-gradient-to-r from-muted/70 to-muted/30 rounded w-1/2 animate-shimmer"></div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="h-4 bg-gradient-to-r from-muted to-muted/50 rounded animate-shimmer"></div>
                            <div className="h-4 bg-gradient-to-r from-muted/70 to-muted/30 rounded w-5/6 animate-shimmer"></div>
                            <div className="h-4 bg-gradient-to-r from-muted/50 to-muted/20 rounded w-4/6 animate-shimmer"></div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              ) : (
                <div ref={postsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {posts.map((post, index) => (
                    <div key={post.id} className="hover-lift magnetic">
                      <div className="gradient-border">
                        <PostCard 
                          post={post} 
                          profile={post.profiles} 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="text-center mt-16 rotate-in stagger-4">
                <Button asChild variant="outline" size="lg" className="glass-effect border-primary/30 text-foreground hover:bg-primary/10 hover:text-primary hover:scale-105 transition-all duration-300 px-8 py-4 text-lg gradient-border magnetic">
                  <Link to="/posts">View All Posts</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

      </div>
    </Layout>
  );
};

export default Index;
