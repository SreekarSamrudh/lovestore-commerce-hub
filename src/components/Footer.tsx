import { Link } from "react-router-dom";
import { ShoppingCart, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-surface border-t mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <ShoppingCart className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">E-Commerce Store</span>
            </div>
            <p className="text-muted-foreground">
              Your trusted partner for quality products and exceptional service.
            </p>
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>support@ecommerce.com</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <nav className="flex flex-col space-y-2">
              <Link to="/" className="nav-link text-muted-foreground hover:text-primary">
                Home
              </Link>
              <Link to="/products" className="nav-link text-muted-foreground hover:text-primary">
                All Products
              </Link>
              <Link to="/products?category=Electronics" className="nav-link text-muted-foreground hover:text-primary">
                Electronics
              </Link>
              <Link to="/products?category=Clothing" className="nav-link text-muted-foreground hover:text-primary">
                Clothing
              </Link>
              <Link to="/products?category=Groceries" className="nav-link text-muted-foreground hover:text-primary">
                Groceries
              </Link>
            </nav>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Customer Service</h3>
            <nav className="flex flex-col space-y-2">
              <a href="#" className="nav-link text-muted-foreground hover:text-primary">
                About Us
              </a>
              <a href="#" className="nav-link text-muted-foreground hover:text-primary">
                Contact
              </a>
              <a href="#" className="nav-link text-muted-foreground hover:text-primary">
                Shipping Info
              </a>
              <a href="#" className="nav-link text-muted-foreground hover:text-primary">
                Returns
              </a>
              <a href="#" className="nav-link text-muted-foreground hover:text-primary">
                FAQ
              </a>
            </nav>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>1-800-555-0123</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>123 Commerce St, City, State 12345</span>
              </div>
              <div className="text-sm text-muted-foreground">
                <strong>Business Hours:</strong><br />
                Mon-Fri: 9am-6pm<br />
                Sat-Sun: 10am-4pm
              </div>
            </div>
          </div>
        </div>

        <div className="border-t mt-12 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2024 E-Commerce Store. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}