import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export const useLikes = (postId: string, onLikeChange?: () => void) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch like status and count
  useEffect(() => {
    let isCancelled = false;
    
    const fetchLikes = async () => {
      if (!postId) return;
      
      try {
        // Get total likes count
        const { count, error: countError } = await supabase
          .from("likes")
          .select("*", { count: "exact", head: true })
          .eq("post_id", postId);

        if (countError) {
          console.error("Error fetching likes count:", countError);
          return;
        }

        if (!isCancelled) {
          setLikesCount(count || 0);
        }

        // Check if current user liked this post
        if (user && !isCancelled) {
          const { data, error: likeError } = await supabase
            .from("likes")
            .select("id")
            .eq("post_id", postId)
            .eq("user_id", user.id)
            .limit(1);

          if (likeError) {
            console.error("Error checking like status:", likeError);
            return;
          }

          if (!isCancelled) {
            setIsLiked(!!(data && data.length > 0));
          }
        }
      } catch (error) {
        console.error("Error in fetchLikes:", error);
      }
    };

    fetchLikes();
    
    return () => {
      isCancelled = true;
    };
  }, [postId, user]);

  const toggleLike = async () => {
    if (!user) {
      toast({
        title: "Anmeldung erforderlich",
        description: "Sie müssen angemeldet sein, um Posts zu liken.",
        variant: "destructive",
      });
      return;
    }

    if (loading) return;

    setLoading(true);

    try {
      if (isLiked) {
        // Unlike the post
        const { error } = await supabase
          .from("likes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", user.id);

        if (error) {
          console.error("Error unliking post:", error);
          toast({
            title: "Fehler",
            description: "Fehler beim Entfernen des Likes.",
            variant: "destructive",
          });
          return;
        }

        setIsLiked(false);
        setLikesCount(prev => prev - 1);
        onLikeChange?.(); // Call callback if provided
      } else {
        // Like the post
        const { error } = await supabase
          .from("likes")
          .insert({
            post_id: postId,
            user_id: user.id,
          });

        if (error) {
          console.error("Error liking post:", error);
          toast({
            title: "Fehler",
            description: "Fehler beim Liken des Posts.",
            variant: "destructive",
          });
          return;
        }

        setIsLiked(true);
        setLikesCount(prev => prev + 1);
        onLikeChange?.(); // Call callback if provided
      }
    } catch (error) {
      console.error("Error in toggleLike:", error);
      toast({
        title: "Fehler",
        description: "Ein unerwarteter Fehler ist aufgetreten.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    isLiked,
    likesCount,
    loading,
    toggleLike,
  };
};