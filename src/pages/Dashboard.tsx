import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import { useAuth } from '@/hooks/useAuth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    } else {
      setLoading(false);
    }
  }, [user, navigate]);

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
          <p className="text-muted-foreground">Manage your posts and activity</p>
        </div>

        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="posts">My Posts</TabsTrigger>
            <TabsTrigger value="saved">Saved Posts</TabsTrigger>
            <TabsTrigger value="liked">Liked Posts</TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="mt-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">My Posts</h2>
                <Button asChild>
                  <Link to="/create-post">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Post
                  </Link>
                </Button>
              </div>
              <div className="text-center py-8 text-muted-foreground">
                <p>Your posts will appear here.</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="saved" className="mt-6">
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold">Saved Posts</h2>
              <div className="text-center py-8 text-muted-foreground">
                <p>Your saved posts will appear here.</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="liked" className="mt-6">
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold">Liked Posts</h2>
              <div className="text-center py-8 text-muted-foreground">
                <p>Your liked posts will appear here.</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Dashboard;