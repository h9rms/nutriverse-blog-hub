import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";

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

const PostCard = ({ post, profile, showActions = false, handleDeletePost }: PostCardProps) => {
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
    <Card className="h-[600px] flex flex-col overflow-hidden relative">
      {showActions && (
        <div className="absolute bottom-4 right-4 z-20 flex gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link to={`/edit-post/${post.id}`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </Button>
          <Button
            variant="ghost" 
            size="sm"
            onClick={() => handleDeletePost?.(post.id)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      )}

      <CardHeader className="flex-shrink-0">
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
        
        <Link to={`/post/${post.id}`} className="block hover:opacity-80">
          <h3 className="text-xl font-semibold mb-2">
            {post.title}
          </h3>
          <p className="text-muted-foreground mb-4">
            {post.content.length > 120 
              ? post.content.slice(0, 120) + "..." 
              : post.content}
          </p>
        </Link>
        
        {post.image_url && (
          <Link to={`/post/${post.id}`} className="block">
            <img
              src={post.image_url}
              alt={post.title}
              className="w-full h-48 object-cover rounded-lg"
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
            <span className="text-sm text-muted-foreground">
              Post by {profile?.full_name || profile?.username || "Anonymous"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PostCard;