import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { authAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Bell, Settings, LogOut, ChevronDown, ShoppingCart } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";

const DashboardContent = () => {
  const navigate = useNavigate();
  const { state, isMobile } = useSidebar();
  const [user, setUser] = useState<any | null>(null);
  const [notificationsCount, setNotificationsCount] = useState(3);
  const sidebarWidth = state === "expanded" ? "16rem" : "0";

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      toast.success("Logged out successfully");
      navigate("/auth");
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  const getUserInitials = () => {
    if (!user) return "U";
    const email = user.email || "";
    const name = email.split("@")[0];
    if (name.length >= 2) {
      return name.substring(0, 2).toUpperCase();
    }
    return email.charAt(0).toUpperCase();
  };

  const getUserName = () => {
    if (!user) return "User";
    const email = user.email || "";
    const name = email.split("@")[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { session } = await authAPI.getSession();
      setUser(session?.user || null);
      } catch {
        setUser(null);
      }
    };
    checkAuth();
    const interval = setInterval(checkAuth, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex w-full bg-background">
      <AppSidebar />
      <main className="flex-1 flex flex-col">
        <header 
          className="fixed top-0 z-50 flex h-16 items-center justify-between gap-4 border-b px-6 shadow-sm transition-all duration-200 ease-linear" 
          style={{ 
            backgroundColor: '#171923',
            ...(!isMobile && {
              left: sidebarWidth,
              width: state === "collapsed" ? "100%" : `calc(100% - ${sidebarWidth})`
            }),
            ...(isMobile && {
              left: "0",
              width: "100%"
            })
          }}
        >
          <div className="flex items-center gap-4">
            <SidebarTrigger className="text-white" />
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center p-0.5 transition-transform duration-300 hover:scale-110 hover:shadow-lg cursor-pointer">
              <img 
                src="/logo.png" 
                alt="Logo" 
                className="w-full h-full object-contain rounded-full transition-transform duration-300"
              />
            </div>
            <h1 className="text-lg font-semibold text-white">travooz</h1>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10"
              >
                <Bell className="w-5 h-5" />
                {notificationsCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs">
                    {notificationsCount}
                  </Badge>
                )}
              </Button>
            </div>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 text-white hover:bg-white/10"
                >
                  <Avatar className="h-8 w-8 bg-blue-500">
                    <AvatarFallback className="bg-blue-500 text-white text-xs font-semibold">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{getUserName()}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/settings")} className="cursor-pointer">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/pos")} className="cursor-pointer">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Go to POS
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 cursor-pointer">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <div className="flex-1 overflow-auto pt-16">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

const DashboardLayout = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    authAPI.getSession().then(({ session }) => {
      setSession(session);
      if (!session) {
        navigate("/auth");
      }
      setLoading(false);
    }).catch(() => {
      setLoading(false);
      navigate("/auth");
    });

    // Check auth every 30 seconds
    const interval = setInterval(async () => {
      try {
        const { session } = await authAPI.getSession();
      setSession(session);
      if (!session) {
          navigate("/auth");
        }
      } catch {
        navigate("/auth");
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <SidebarProvider>
      <DashboardContent />
    </SidebarProvider>
  );
};

export default DashboardLayout;