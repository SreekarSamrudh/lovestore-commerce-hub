import { useState, useEffect } from "react";
import { Search, ShoppingCart, User, Menu, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface Profile {
  role: string;
}

export default function Header() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-primary text-primary-foreground shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center">
              <ShoppingCart className="h-5 w-5 text-secondary-foreground" />
            </div>
            <span className="text-xl font-bold hidden sm:block">E-Commerce Store</span>
          </Link>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white text-foreground border-0 pr-12"
              />
              <Button
                type="submit"
                size="sm"
                className="absolute right-1 top-1 bg-secondary hover:bg-secondary/90 text-secondary-foreground"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </form>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="nav-link text-primary-foreground hover:text-secondary">
              Home
            </Link>
            <Link to="/products" className="nav-link text-primary-foreground hover:text-secondary">
              Products
            </Link>
            <Link to="/cart" className="nav-link text-primary-foreground hover:text-secondary">
              Cart
            </Link>
            
            {user ? (
              <>
                <Link to="/profile" className="nav-link text-primary-foreground hover:text-secondary">
                  Profile
                </Link>
                {profile?.role === "vendor" && (
                  <Link to="/vendor" className="nav-link text-primary-foreground hover:text-secondary">
                    Vendor Dashboard
                  </Link>
                )}
                <Button
                  onClick={handleSignOut}
                  variant="outline"
                  size="sm"
                  className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="outline" size="sm" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                    Login
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden text-primary-foreground"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Search */}
        <form onSubmit={handleSearch} className="md:hidden pb-4">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white text-foreground border-0 pr-12"
            />
            <Button
              type="submit"
              size="sm"
              className="absolute right-1 top-1 bg-secondary hover:bg-secondary/90 text-secondary-foreground"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </form>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden pb-4 space-y-2">
            <Link
              to="/"
              className="block py-2 nav-link text-primary-foreground hover:text-secondary"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/products"
              className="block py-2 nav-link text-primary-foreground hover:text-secondary"
              onClick={() => setIsMenuOpen(false)}
            >
              Products
            </Link>
            <Link
              to="/cart"
              className="block py-2 nav-link text-primary-foreground hover:text-secondary"
              onClick={() => setIsMenuOpen(false)}
            >
              Cart
            </Link>
            
            {user ? (
              <>
                <Link
                  to="/profile"
                  className="block py-2 nav-link text-primary-foreground hover:text-secondary"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
                {profile?.role === "vendor" && (
                  <Link
                    to="/vendor"
                    className="block py-2 nav-link text-primary-foreground hover:text-secondary"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Vendor Dashboard
                  </Link>
                )}
                <Button
                  onClick={() => {
                    handleSignOut();
                    setIsMenuOpen(false);
                  }}
                  variant="outline"
                  size="sm"
                  className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <div className="space-y-2">
                <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                    Login
                  </Button>
                </Link>
                <Link to="/signup" onClick={() => setIsMenuOpen(false)}>
                  <Button size="sm" className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}