import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Leaf, Truck, Store, User } from 'lucide-react';

const Auth = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    role: '',
    organization: '',
    location: '',
    phone: ''
  });

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (user && !loading) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.email || !formData.password || !formData.fullName || !formData.role) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      toast({
        title: "Validation Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            full_name: formData.fullName,
            role: formData.role,
            organization: formData.organization,
            location: formData.location,
            phone: formData.phone
          }
        }
      });

      if (authError) {
        console.error('Signup error:', authError);
        toast({
          title: "Signup Error",
          description: authError.message || "Failed to create account. Please try again.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (data?.user) {
        // Check if user has a session (auto-confirmed) or needs email confirmation
        if (data.session) {
          toast({
            title: "Success!",
            description: "Account created and logged in successfully!",
          });
          setTimeout(() => {
            navigate('/dashboard');
          }, 500);
        } else {
          // Email confirmation is required
          toast({
            title: "Almost there!",
            description: "Please check your email and click the confirmation link. Email confirmation is required before you can sign in.",
            duration: 8000,
          });
          // Clear the form
          setFormData({
            email: '',
            password: '',
            fullName: '',
            role: '',
            organization: '',
            location: '',
            phone: ''
          });
        }
      }
    } catch (error: any) {
      console.error('Unexpected signup error:', error);
      toast({
        title: "Connection Error",
        description: error?.message || "Unable to connect to authentication service. Please check your internet connection.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.email || !formData.password) {
      toast({
        title: "Validation Error",
        description: "Please enter both email and password",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        console.error('Sign in error:', error);
        
        // Check if it's an email confirmation issue
        let errorMessage = error.message || "Invalid email or password. Please try again.";
        if (error.message?.includes('Email not confirmed') || error.code === 'email_not_confirmed') {
          errorMessage = "Please confirm your email address before signing in. Check your inbox for the confirmation link.";
        } else if (error.message?.includes('Invalid login credentials')) {
          errorMessage = "Invalid email or password. If you just signed up, please confirm your email first.";
        }
        
        toast({
          title: "Login Error",
          description: errorMessage,
          variant: "destructive",
          duration: 6000,
        });
        setLoading(false);
        return;
      }

      if (data?.session) {
        toast({
          title: "Welcome back!",
          description: "Successfully signed in.",
        });
        
        setTimeout(() => {
          navigate('/dashboard');
        }, 300);
      }
    } catch (error: any) {
      console.error('Unexpected sign in error:', error);
      toast({
        title: "Connection Error",
        description: error?.message || "Unable to connect to authentication service. Please check your internet connection.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'farmer': return <Leaf className="w-4 h-4" />;
      case 'distributor': return <Truck className="w-4 h-4" />;
      case 'retailer': return <Store className="w-4 h-4" />;
      case 'consumer': return <User className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-forest/5 via-background to-earth/5 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Leaf className="h-8 w-8 text-forest mr-2" />
            <span className="text-2xl font-bold">AgriChain</span>
          </div>
          <CardTitle>Join the Supply Chain Network</CardTitle>
          <CardDescription>
            Connect as a stakeholder in the agricultural supply chain
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin" className="space-y-4">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Signing In...' : 'Sign In'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup" className="space-y-4">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Create password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Your full name"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="role">Role in Supply Chain</Label>
                  <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your role">
                        {formData.role && (
                          <div className="flex items-center">
                            {getRoleIcon(formData.role)}
                            <span className="ml-2 capitalize">{formData.role}</span>
                          </div>
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="farmer">
                        <div className="flex items-center">
                          <Leaf className="w-4 h-4 mr-2" />
                          Farmer
                        </div>
                      </SelectItem>
                      <SelectItem value="distributor">
                        <div className="flex items-center">
                          <Truck className="w-4 h-4 mr-2" />
                          Distributor
                        </div>
                      </SelectItem>
                      <SelectItem value="retailer">
                        <div className="flex items-center">
                          <Store className="w-4 h-4 mr-2" />
                          Retailer
                        </div>
                      </SelectItem>
                      <SelectItem value="consumer">
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-2" />
                          Consumer
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="organization">Organization</Label>
                    <Input
                      id="organization"
                      type="text"
                      placeholder="Company/Farm name"
                      value={formData.organization}
                      onChange={(e) => handleInputChange('organization', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      type="text"
                      placeholder="City, Country"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone (Optional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                </div>
                
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;