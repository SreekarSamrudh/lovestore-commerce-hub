import { Link } from "react-router-dom";
import { ShoppingCart, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  stock: number;
  category: string;
  description?: string;
}

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const stockStatus = product.stock > 10 ? "in-stock" : product.stock > 0 ? "low-stock" : "out-of-stock";
  const stockBadgeClass = 
    stockStatus === "in-stock" ? "badge-success" : 
    stockStatus === "low-stock" ? "badge-warning" : 
    "badge-danger";

  const stockText = 
    stockStatus === "out-of-stock" ? "Out of Stock" : 
    `In Stock: ${product.stock}`;

  return (
    <Card className="card-hover overflow-hidden">
      <div className="aspect-square overflow-hidden">
        <img
          src={product.image || `https://placehold.co/300x300/f3f4f6/6b7280?text=${encodeURIComponent(product.name)}`}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>
      
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-lg leading-tight line-clamp-2">{product.name}</h3>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-primary">
              ${product.price.toFixed(2)}
            </span>
            <Badge className={stockBadgeClass}>
              {stockText}
            </Badge>
          </div>
          
          {product.category && (
            <Badge variant="outline" className="text-xs">
              {product.category}
            </Badge>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 space-y-2">
        <div className="flex gap-2 w-full">
          <Link to={`/product/${product.id}`} className="flex-1">
            <Button variant="outline" className="w-full" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Button>
          </Link>
          
          {product.stock > 0 && onAddToCart && (
            <Button
              onClick={() => onAddToCart(product)}
              className="flex-1"
              size="sm"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Add to Cart
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}