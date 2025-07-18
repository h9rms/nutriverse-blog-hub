import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Heart, MessageCircle, Share2, Send, Edit, Trash2, Copy, Check } from "lucide-react";
import { useLikes } from "@/hooks/useLikes";
import { useComments } from "@/hooks/useComments";
import { useToast } from "@/hooks/use-toast";

interface Post {
  id: string;
  title: string;
  content: string;
  category: string;
  image_url?: string | null;
  created_at: string;
  user_id: string;
}

interface Profile {
  user_id?: string;
  username?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
}

interface PostCardProps {
  post: Post;
  profile: Profile | null;
  showActions?: boolean;
  onLikeChange?: () => void;
  handleDeletePost?: (postId: string) => void;
}

const PostCard = ({ post, profile, showActions = false, onLikeChange, handleDeletePost }: PostCardProps) => {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [shareClicked, setShareClicked] = useState(false);
  
  const { isLiked, likesCount, loading: likesLoading, toggleLike } = useLikes(post.id, onLikeChange);
  const { comments, commentsCount, submitting, addComment } = useComments(post.id);
  const { toast } = useToast();

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

  const handleCommentSubmit = async () => {
    const success = await addComment(newComment);
    if (success) {
      setNewComment("");
    }
  };

  const handleShare = async () => {
    const shareUrl = window.location.origin + `/post/${post.id}`;
    const shareData = {
      title: post.title,
      text: post.content.slice(0, 100) + "...",
      url: shareUrl,
    };

    try {
      // Check if Web Share API is available and supported
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        return;
      }
    } catch (error) {
      console.log('Web Share API failed, falling back to clipboard:', error);
    }

    // Fallback to clipboard
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareClicked(true);
      toast({
        title: "Link copied!",
        description: "The post link has been copied to clipboard.",
      });
      
      // Reset icon after 2 seconds
      setTimeout(() => setShareClicked(false), 2000);
    } catch (clipboardError) {
      console.error('Clipboard API failed:', clipboardError);
      // Last resort: show the URL in a prompt
      window.prompt('Copy link:', shareUrl);
    }
  };

  return (
    <Card className="glass-effect hover-lift transition-all duration-500 border-0 backdrop-blur-sm h-[600px] flex flex-col overflow-hidden">
      <CardHeader className="flex-shrink-0 flex-grow-0">
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
        
        <Link to={`/post/${post.id}`} className="block hover:opacity-80 transition-opacity flex-grow">
          <h3 className="text-xl font-semibold mb-2 line-clamp-2 h-16 flex items-start">{post.title}</h3>
          <p className="text-muted-foreground mb-4 line-clamp-3 h-20 flex items-start">
            {post.content.length > 120 
              ? post.content.slice(0, 120) + "..." 
              : post.content}
          </p>
        </Link>
        
        {post.image_url && (
          <Link to={`/post/${post.id}`} className="block overflow-hidden rounded-lg mt-auto">
            <img
              src={post.image_url}
              alt={post.title}
              className="w-full h-48 object-cover hover:scale-110 transition-transform duration-500"
            />
          </Link>
        )}
        
        {!post.image_url && (
          <div className="h-48 flex items-center justify-center bg-muted rounded-lg">
            <p className="text-muted-foreground text-sm">No image</p>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="flex-shrink-0 mt-auto">
        <div className="flex items-center justify-between border-t pt-4">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={toggleLike}
              disabled={likesLoading}
              className="flex items-center space-x-2 hover:scale-110 transition-transform duration-200"
            >
              <Heart 
                className={`w-4 h-4 transition-all duration-300 ${isLiked ? 'fill-red-500 text-red-500 animate-pulse' : 'hover:text-red-400'}`} 
              />
              <span className="font-medium">{likesCount}</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-2 hover:scale-110 transition-transform duration-200"
            >
              <MessageCircle className={`w-4 h-4 transition-all duration-300 ${showComments ? 'text-primary' : 'hover:text-primary'}`} />
              <span className="font-medium">{commentsCount}</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleShare}
              className="flex items-center space-x-1 hover:scale-110 transition-transform duration-200"
            >
              {shareClicked ? (
                <Check className="w-4 h-4 text-green-600 animate-bounce" />
              ) : (
                <Share2 className="w-4 h-4 hover:text-accent transition-colors duration-300" />
              )}
            </Button>
          </div>
        </div>

        {showComments && (
          <div className="mt-4 space-y-4">
            {/* Add Comment */}
            <div className="flex space-x-2">
              <Textarea
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[80px]"
              />
              <Button 
                onClick={handleCommentSubmit}
                disabled={submitting || !newComment.trim()}
                size="sm"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>

            {/* Comments List */}
            <div className="space-y-3">
              {comments.map((comment) => (
                <div key={comment.id} className="flex space-x-3 p-3 bg-muted rounded-lg">
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
                    <p className="text-sm text-muted-foreground">
                      {comment.content}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {showActions && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <Button asChild variant="outline" size="xs">
                <Link to={`/edit-post/${post.id}`}>
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Link>
              </Button>
              <Button
                variant="destructive" size="xs"
                onClick={() => handleDeletePost?.(post.id)}
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PostCard;