import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/hooks/useAuth';
import { 
  Leaf, 
  Menu, 
  QrCode, 
  BarChart3, 
  Users, 
  Shield,
  Home,
  Search,
  LogOut,
  User
} from 'lucide-react';

export const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'QR Scanner', href: '/scanner', icon: QrCode },
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
  ];

  const handleSignOut = async () => {
    setIsOpen(false);
    await signOut();
    navigate('/auth');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center">
        {/* Logo */}
        <Link to="/" className="mr-8 flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-forest flex items-center justify-center">
              <Leaf className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl text-foreground">AgriChain</span>
          </div>
          <Badge variant="secondary" className="ml-2 bg-harvest/10 text-harvest border-harvest/20">
            Beta
          </Badge>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className="flex items-center space-x-2 transition-colors hover:text-forest text-foreground/60 hover:text-foreground"
            >
              <item.icon className="h-4 w-4" />
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="flex flex-1 items-center justify-end space-x-4">
          {/* Action Buttons */}
          <div className="hidden md:flex items-center space-x-2">
            {user ? (
              <>
                <div className="flex items-center space-x-2 text-sm">
                  <User className="h-4 w-4" />
                  <span>{profile?.full_name || user.email}</span>
                  {profile?.role && (
                    <Badge variant="outline" className="capitalize">
                      {profile.role}
                    </Badge>
                  )}
                </div>
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate('/auth')}>
                  <Shield className="h-4 w-4 mr-2" />
                  Login
                </Button>
                <Button size="sm" className="bg-forest hover:bg-forest/90" onClick={() => navigate('/auth')}>
                  Get Started
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col space-y-4 mt-8">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center space-x-3 text-lg font-medium transition-colors hover:text-forest"
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                ))}
                <div className="pt-4 border-t border-border">
                  <div className="space-y-3">
                    {user ? (
                      <>
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <p className="font-medium">{profile?.full_name || user.email}</p>
                          {profile?.role && (
                            <Badge variant="outline" className="mt-1 capitalize">
                              {profile.role}
                            </Badge>
                          )}
                        </div>
                        <Button variant="ghost" className="w-full justify-start" onClick={handleSignOut}>
                          <LogOut className="h-4 w-4 mr-2" />
                          Sign Out
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button variant="ghost" className="w-full justify-start" onClick={() => navigate('/auth')}>
                          <Shield className="h-4 w-4 mr-2" />
                          Login
                        </Button>
                        <Button className="w-full bg-forest hover:bg-forest/90" onClick={() => navigate('/auth')}>
                          Get Started
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};