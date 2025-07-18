import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Share2, ArrowLeft } from "lucide-react";
import { useLikes } from "@/hooks/useLikes";
import { useComments } from "@/hooks/useComments";

interface Post {
  id: string;
  title: string;
  content: string;
  category: string;
  image_url: string | null;
  created_at: string;
  user_id: string;
}

interface Profile {
  user_id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
}

const PostDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");

  const { isLiked, likesCount, loading: likesLoading, toggleLike } = useLikes(id || "");
  const { comments, commentsCount, submitting, addComment } = useComments(id || "");

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;

      try {
        // Fetch post
        const { data: postData, error: postError } = await supabase
          .from("posts")
          .select("*")
          .eq("id", id)
          .single();

        if (postError) {
          console.error("Error fetching post:", postError);
          return;
        }

        setPost(postData);

        // Fetch author profile
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", postData.user_id)
          .single();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
        } else {
          setProfile(profileData);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  const handleCommentSubmit = async () => {
    const success = await addComment(newComment);
    if (success) {
      setNewComment("");
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Post not found</h1>
          <Link to="/posts">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Posts
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      technology: "bg-blue-100 text-blue-800",
      lifestyle: "bg-green-100 text-green-800",
      travel: "bg-purple-100 text-purple-800",
      food: "bg-orange-100 text-orange-800",
      health: "bg-red-100 text-red-800",
      business: "bg-gray-100 text-gray-800",
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link to="/posts">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Posts
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={profile?.avatar_url || ""} />
                  <AvatarFallback>
                    {profile?.username?.[0]?.toUpperCase() || 
                     profile?.full_name?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {profile?.full_name || profile?.username || "Anonymous"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(post.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <Badge className={getCategoryColor(post.category)}>
                {post.category}
              </Badge>
            </div>
            
            <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
            
            {post.image_url && (
              <div className="mb-6">
                <img
                  src={post.image_url}
                  alt={post.title}
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
            )}
          </CardHeader>
          
          <CardContent>
            <div className="prose prose-gray max-w-none mb-6">
              <p className="text-lg leading-relaxed whitespace-pre-wrap">
                {post.content}
              </p>
            </div>
            
            <div className="flex items-center space-x-4 pt-4 border-t">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={toggleLike}
                disabled={likesLoading}
                className="flex items-center space-x-2"
              >
                <Heart 
                  className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} 
                />
                <span>{likesCount}</span>
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowComments(!showComments)}
                className="flex items-center space-x-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{commentsCount}</span>
              </Button>
              
              <Button variant="ghost" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>

            {/* Comments Section */}
            {showComments && (
              <div className="mt-6 space-y-4">
                <h3 className="text-lg font-semibold">Kommentare</h3>
                
                {/* Add Comment */}
                <div className="flex space-x-2">
                  <textarea
                    placeholder="Kommentar schreiben..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="flex-1 min-h-[80px] p-3 border rounded-lg resize-none"
                  />
                  <Button 
                    onClick={handleCommentSubmit}
                    disabled={submitting || !newComment.trim()}
                    size="sm"
                  >
                    Senden
                  </Button>
                </div>

                {/* Comments List */}
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex space-x-3 p-4 bg-muted rounded-lg">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={comment.profiles?.avatar_url || ""} />
                        <AvatarFallback>
                          {comment.profiles?.username?.[0]?.toUpperCase() || 
                           comment.profiles?.full_name?.[0]?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium text-sm">
                          {comment.profiles?.full_name || 
                           comment.profiles?.username || "Anonymous"}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {comment.content}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default PostDetail;