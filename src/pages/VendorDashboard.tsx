import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Edit, Save, X, Package, TrendingUp, DollarSign, ShoppingCart } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type { User } from "@supabase/supabase-js";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  stock: number;
  category: string;
  description: string;
}

interface Profile {
  role: string;
}

export default function VendorDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingStock, setEditingStock] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStock: 0,
    totalValue: 0,
    outOfStock: 0,
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check authentication and role
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please log in to access the vendor dashboard.",
          variant: "destructive",
        });
        navigate("/login");
        return;
      }
      setUser(session.user);
      fetchProfile(session.user.id);
    });
  }, [navigate]);

  useEffect(() => {
    if (profile?.role === "vendor") {
      fetchProducts();
      
      // Set up real-time subscription for product updates
      const channel = supabase
        .channel('vendor-products-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'products'
          },
          (payload) => {
            console.log('Product change received:', payload);
            fetchProducts(); // Refresh products on any change
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [profile]);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();

      if (error) throw error;

      if (data.role !== "vendor") {
        toast({
          title: "Access denied",
          description: "You don't have vendor permissions.",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
      navigate("/");
    }
  };

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');

      if (error) throw error;

      const products = data || [];
      setProducts(products);
      
      // Calculate stats
      const totalProducts = products.length;
      const lowStock = products.filter(p => p.stock > 0 && p.stock <= 10).length;
      const outOfStock = products.filter(p => p.stock === 0).length;
      const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
      
      setStats({
        totalProducts,
        lowStock,
        outOfStock,
        totalValue,
      });
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error loading products",
        description: "Failed to load products. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditStock = (product: Product) => {
    setEditingId(product.id);
    setEditingStock(product.stock);
  };

  const handleSaveStock = async (productId: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ stock: editingStock })
        .eq('id', productId);

      if (error) throw error;

      toast({
        title: "Stock updated",
        description: "Product stock has been updated successfully.",
      });

      setEditingId(null);
      fetchProducts(); // Refresh to show updated data
    } catch (error) {
      console.error('Error updating stock:', error);
      toast({
        title: "Update failed",
        description: "Failed to update stock. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingStock(0);
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { text: "Out of Stock", class: "badge-danger" };
    if (stock <= 10) return { text: "Low Stock", class: "badge-warning" };
    return { text: "In Stock", class: "badge-success" };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">Loading vendor dashboard...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user || !profile || profile.role !== "vendor") {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold">Access Denied</h2>
            <p className="text-muted-foreground">You don't have permission to access this page.</p>
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
        <div className="space-y-4 mb-8">
          <h1 className="text-3xl md:text-4xl font-bold">Vendor Dashboard</h1>
          <p className="text-muted-foreground text-lg">
            Manage your product inventory and view sales analytics
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Package className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Products</p>
                  <p className="text-2xl font-bold">{stats.totalProducts}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-8 w-8 text-amber-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Low Stock</p>
                  <p className="text-2xl font-bold text-amber-500">{stats.lowStock}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <X className="h-8 w-8 text-destructive" />
                <div>
                  <p className="text-sm text-muted-foreground">Out of Stock</p>
                  <p className="text-2xl font-bold text-destructive">{stats.outOfStock}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-8 w-8 text-accent" />
                <div>
                  <p className="text-sm text-muted-foreground">Inventory Value</p>
                  <p className="text-2xl font-bold text-accent">${stats.totalValue.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Products Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Product Inventory
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => {
                    const stockStatus = getStockStatus(product.stock);
                    return (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <img
                              src={product.image || `https://placehold.co/40x40/f3f4f6/6b7280?text=${encodeURIComponent(product.name)}`}
                              alt={product.name}
                              className="w-10 h-10 object-cover rounded-md"
                            />
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {product.description}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{product.category}</Badge>
                        </TableCell>
                        <TableCell>${product.price.toFixed(2)}</TableCell>
                        <TableCell>
                          {editingId === product.id ? (
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                value={editingStock}
                                onChange={(e) => setEditingStock(Number(e.target.value))}
                                className="w-20"
                                min="0"
                              />
                              <Button
                                size="sm"
                                onClick={() => handleSaveStock(product.id)}
                              >
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={handleCancelEdit}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <span>{product.stock}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={stockStatus.class}>
                            {stockStatus.text}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          ${(product.price * product.stock).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          {editingId !== product.id && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditStock(product)}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit Stock
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {products.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No products found.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}