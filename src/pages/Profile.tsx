import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import Layout from '@/components/Layout';
import { User, Edit3, Save, X, Camera, Mail, Calendar, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';

interface UserProfile {
  id: string;
  user_id: string;
  username: string;
  full_name: string;
  bio?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

const Profile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userPosts, setUserPosts] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [editForm, setEditForm] = useState({
    username: '',
    full_name: '',
    bio: ''
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchUserPosts();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      setProfile(data);
      setEditForm({
        username: data.username || '',
        full_name: data.full_name || '',
        bio: data.bio || ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        variant: "destructive",
        title: "Fehler beim Laden",
        description: "Profil konnte nicht geladen werden.",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPosts = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('posts')
        .select('id, title, category, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setUserPosts(data || []);
    } catch (error) {
      console.error('Error fetching user posts:', error);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadAvatar = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user?.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      return null;
    }
  };

  const handleSave = async () => {
    if (!user || !profile) return;

    setSaving(true);
    try {
      let avatarUrl = profile.avatar_url;

      // Upload new avatar if selected
      if (avatarFile) {
        setUploadingAvatar(true);
        const uploadedAvatarUrl = await uploadAvatar(avatarFile);
        if (uploadedAvatarUrl) {
          avatarUrl = uploadedAvatarUrl;
        } else {
          toast({
            variant: "destructive",
            title: "Fehler",
            description: "Avatar konnte nicht hochgeladen werden",
          });
          return;
        }
        setUploadingAvatar(false);
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          username: editForm.username,
          full_name: editForm.full_name,
          bio: editForm.bio,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;

      // Update local state
      setProfile({
        ...profile,
        username: editForm.username,
        full_name: editForm.full_name,
        bio: editForm.bio,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString()
      });

      setIsEditing(false);
      setAvatarFile(null);
      setAvatarPreview(null);
      toast({
        title: "Profil aktualisiert",
        description: "Deine Änderungen wurden gespeichert.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Fehler beim Speichern",
        description: error.message,
      });
    } finally {
      setSaving(false);
      setUploadingAvatar(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setEditForm({
        username: profile.username || '',
        full_name: profile.full_name || '',
        bio: profile.bio || ''
      });
    }
    setAvatarFile(null);
    setAvatarPreview(null);
    setIsEditing(false);
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'fitness': return 'bg-primary text-primary-foreground';
      case 'nutrition': return 'bg-secondary text-secondary-foreground';
      case 'lifestyle': return 'bg-accent text-accent-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (!user) {
    return null; // Will redirect in useEffect
  }

  if (loading) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded w-48 mb-8"></div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                  <Card>
                    <CardHeader className="text-center">
                      <div className="w-24 h-24 bg-muted rounded-full mx-auto mb-4"></div>
                      <div className="h-6 bg-muted rounded w-32 mx-auto mb-2"></div>
                      <div className="h-4 bg-muted rounded w-24 mx-auto"></div>
                    </CardHeader>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl md:text-4xl font-bold">Mein Profil</h1>
            {!isEditing ? (
              <Button 
                onClick={() => setIsEditing(true)}
                className="bg-gradient-to-r from-primary to-primary-glow hover:opacity-90"
              >
                <Edit3 className="mr-2 h-4 w-4" />
                Bearbeiten
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={saving}>
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? 'Speichern...' : 'Speichern'}
                </Button>
                <Button variant="outline" onClick={handleCancel}>
                  <X className="mr-2 h-4 w-4" />
                  Abbrechen
                </Button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader className="text-center">
                  <div className="relative">
                    <Avatar className="w-24 h-24 mx-auto mb-4">
                      <AvatarImage src={avatarPreview || profile?.avatar_url} />
                      <AvatarFallback className="text-2xl">
                        {profile?.username?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          className="hidden"
                          id="avatar-upload"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          className="absolute bottom-0 right-1/2 transform translate-x-1/2 translate-y-2"
                          onClick={() => document.getElementById('avatar-upload')?.click()}
                          disabled={uploadingAvatar}
                        >
                          {uploadingAvatar ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                          ) : (
                            <Camera className="h-4 w-4" />
                          )}
                        </Button>
                      </>
                    )}
                  </div>

                  {!isEditing ? (
                    <>
                      <CardTitle className="text-xl">
                        {profile?.full_name || 'Kein Name'}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        @{profile?.username || 'kein-username'}
                      </CardDescription>
                    </>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="full_name">Vollständiger Name</Label>
                        <Input
                          id="full_name"
                          value={editForm.full_name}
                          onChange={(e) => setEditForm({...editForm, full_name: e.target.value})}
                          placeholder="Dein vollständiger Name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="username">Benutzername</Label>
                        <Input
                          id="username"
                          value={editForm.username}
                          onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                          placeholder="dein-username"
                        />
                      </div>
                    </div>
                  )}
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    {/* Bio Section */}
                    <div>
                      <h4 className="font-semibold mb-2">Über mich</h4>
                      {!isEditing ? (
                        <p className="text-muted-foreground text-sm">
                          {profile?.bio || 'Noch keine Bio hinzugefügt.'}
                        </p>
                      ) : (
                        <Textarea
                          value={editForm.bio}
                          onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                          placeholder="Erzähle etwas über dich..."
                          rows={4}
                        />
                      )}
                    </div>

                    {/* Account Info */}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        {user.email}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        Beigetreten {formatDistanceToNow(new Date(profile?.created_at || ''), { 
                          addSuffix: true, 
                          locale: de 
                        })}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <FileText className="h-4 w-4" />
                        {userPosts.length} Posts veröffentlicht
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Recent Posts */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Meine neuesten Posts
                  </CardTitle>
                  <CardDescription>
                    Deine zuletzt veröffentlichten Beiträge
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {userPosts.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                        <FileText className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">Noch keine Posts</h3>
                      <p className="text-muted-foreground mb-4">
                        Erstelle deinen ersten Post und teile dein Wissen
                      </p>
                      <Button asChild>
                        <Link to="/create-post">Ersten Post erstellen</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {userPosts.map((post: any) => (
                        <div key={post.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{post.title}</h4>
                              <Badge className={getCategoryColor(post.category)} variant="secondary">
                                {post.category}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {formatDistanceToNow(new Date(post.created_at), { 
                                addSuffix: true, 
                                locale: de 
                              })}
                            </p>
                          </div>
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/post/${post.id}`}>Ansehen</Link>
                          </Button>
                        </div>
                      ))}
                      
                      {userPosts.length >= 5 && (
                        <div className="text-center pt-4">
                          <Button variant="outline" asChild>
                            <Link to="/dashboard">Alle Posts ansehen</Link>
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Account Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Account-Einstellungen</CardTitle>
                  <CardDescription>
                    Verwalte deine Account-Einstellungen
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-start">
                    <User className="mr-2 h-4 w-4" />
                    Passwort ändern
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Mail className="mr-2 h-4 w-4" />
                    E-Mail-Adresse ändern
                  </Button>
                  <Button variant="destructive" className="w-full justify-start">
                    Account löschen
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;