import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface Post {
  id: string;
  title: string;
  content: string;
  category: string;
}

interface Profile {
  username?: string | null;
  full_name?: string | null;
}

interface SimplePostCardProps {
  post: Post;
  profile: Profile | null;
}

const SimplePostCard = ({ post, profile }: SimplePostCardProps) => {
  return (
    <Card className="h-auto border rounded-lg">
      <CardHeader>
        <h3 className="text-lg font-semibold">{post.title}</h3>
        <p className="text-sm text-muted-foreground">
          By {profile?.full_name || profile?.username || "Anonymous"}
        </p>
      </CardHeader>
      <CardContent>
        <p className="text-sm">{post.content}</p>
        <span className="inline-block mt-2 px-2 py-1 text-xs bg-gray-100 rounded">
          {post.category}
        </span>
      </CardContent>
    </Card>
  );
};

export default SimplePostCard;