import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { Heart, PlusCircle, User, LogOut, Menu, Dumbbell } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ThemeToggle } from '@/components/theme-toggle';
interface LayoutProps {
  children: React.ReactNode;
}
const Layout: React.FC<LayoutProps> = ({
  children
}) => {
  const {
    user,
    signOut
  } = useAuth();
  const location = useLocation();
  const {
    toast
  } = useToast();
  const [userProfile, setUserProfile] = useState<any>(null);
  const handleSignOut = async () => {
    await signOut();
  };
  const isActive = (path: string) => location.pathname === path;

  // Fetch user profile when user changes
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        try {
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();
          setUserProfile(data);
        } catch (error) {
          console.error('Error fetching profile:', error);
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }
    };
    fetchUserProfile();
  }, [user]);
  return <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-primary to-primary-glow">
              <Dumbbell className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              FitLife
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className={`text-sm font-medium transition-colors hover:text-primary ${isActive('/') ? 'text-primary' : 'text-muted-foreground'}`}>
              Home
            </Link>
            <Link to="/posts" className={`text-sm font-medium transition-colors hover:text-primary ${isActive('/posts') ? 'text-primary' : 'text-muted-foreground'}`}>
              All Posts
            </Link>
            {user && <Link to="/create-post" className={`text-sm font-medium transition-colors hover:text-primary ${isActive('/create-post') ? 'text-primary' : 'text-muted-foreground'}`}>
                Create Post
              </Link>}
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            {user ? <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={userProfile?.avatar_url} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {userProfile?.username?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-card border" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{userProfile?.full_name || userProfile?.username || user.email}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="flex items-center">
                      <Heart className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/create-post" className="flex items-center">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      <span>Create Post</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu> : <div className="flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link to="/auth">Sign In</Link>
                </Button>
                <Button asChild className="bg-gradient-to-r from-primary to-primary-glow hover:opacity-90">
                  <Link to="/auth?mode=register">Register</Link>
                </Button>
              </div>}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/50">
        <div className="container py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-r from-primary to-primary-glow">
                  <Dumbbell className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="font-bold text-lg bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  FitLife
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Your platform for fitness and nutrition. Share knowledge, find inspiration.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Navigation</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/" className="hover:text-primary transition-colors">Home</Link></li>
                <li><Link to="/posts" className="hover:text-primary transition-colors">All Posts</Link></li>
                {user && <li><Link to="/create-post" className="hover:text-primary transition-colors">Create Post</Link></li>}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Categories</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/posts?category=fitness" className="hover:text-primary transition-colors">Fitness</Link></li>
                <li><Link to="/posts?category=nutrition" className="hover:text-primary transition-colors">Nutrition</Link></li>
                <li><Link to="/posts?category=lifestyle" className="hover:text-primary transition-colors">Lifestyle</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="#" className="hover:text-primary transition-colors">Help</Link></li>
                <li><Link to="#" className="hover:text-primary transition-colors">Contact</Link></li>
                <li><Link to="#" className="hover:text-primary transition-colors">Privacy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>© 2025 FitLife. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>;
};
export default Layout;