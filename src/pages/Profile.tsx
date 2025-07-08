import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { User, Mail, Calendar, Shield, Package } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface Profile {
  role: string;
  email: string;
  created_at: string;
}

export default function Profile() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check authentication
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please log in to view your profile.",
          variant: "destructive",
        });
        navigate("/login");
        return;
      }
      setUser(session.user);
      fetchProfile(session.user.id);
    });
  }, [navigate]);

  const fetchProfile = async (userId: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast({
        title: "Error loading profile",
        description: "Failed to load profile information.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed out successfully",
        description: "You have been logged out.",
      });
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Error signing out",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case "vendor":
        return "bg-primary text-primary-foreground";
      case "customer":
        return "bg-secondary text-secondary-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">Loading profile...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold">Profile Not Found</h2>
            <p className="text-muted-foreground">Unable to load profile information.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Page Header */}
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto">
              <User className="h-10 w-10 text-primary-foreground" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold">Your Profile</h1>
            <p className="text-muted-foreground text-lg">
              Manage your account information and preferences
            </p>
          </div>

          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Email */}
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-surface rounded-lg flex items-center justify-center">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Email Address</p>
                  <p className="text-muted-foreground">{user.email}</p>
                </div>
              </div>

              {/* Role */}
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-surface rounded-lg flex items-center justify-center">
                  <Package className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Account Type</p>
                  <Badge className={getRoleBadgeClass(profile.role)}>
                    {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                  </Badge>
                </div>
              </div>

              {/* Member Since */}
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-surface rounded-lg flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Member Since</p>
                  <p className="text-muted-foreground">{formatDate(profile.created_at)}</p>
                </div>
              </div>

              {/* User ID */}
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-surface rounded-lg flex items-center justify-center">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">User ID</p>
                  <p className="text-muted-foreground text-sm font-mono">{user.id}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile.role === "vendor" && (
                <Button
                  onClick={() => navigate("/vendor")}
                  className="w-full"
                  variant="outline"
                >
                  <Package className="mr-2 h-4 w-4" />
                  Go to Vendor Dashboard
                </Button>
              )}
              
              <Button
                onClick={() => navigate("/cart")}
                className="w-full"
                variant="outline"
              >
                <Package className="mr-2 h-4 w-4" />
                View Shopping Cart
              </Button>
              
              <Button
                onClick={handleSignOut}
                variant="destructive"
                className="w-full"
              >
                Sign Out
              </Button>
            </CardContent>
          </Card>

          {/* Account Features */}
          <Card>
            <CardHeader>
              <CardTitle>Account Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Customer Features</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Browse and purchase products</li>
                    <li>• Real-time inventory updates</li>
                    <li>• Shopping cart management</li>
                    <li>• Order history</li>
                  </ul>
                </div>
                
                {profile.role === "vendor" && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Vendor Features</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Inventory management</li>
                      <li>• Real-time stock updates</li>
                      <li>• Sales analytics</li>
                      <li>• Product management</li>
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}