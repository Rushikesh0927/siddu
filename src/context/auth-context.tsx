
import { 
  createContext, 
  useContext, 
  useState, 
  useEffect, 
  ReactNode 
} from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/types";

type AuthContextType = {
  session: Session | null;
  user: User | null;
  userRole: UserRole | null;
  loading: boolean;
  signOut: () => Promise<void>;
  login: (user: User, session: Session) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  // Function to handle login
  const login = (newUser: User, newSession: Session) => {
    setUser(newUser);
    setSession(newSession);
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // Get the user's role if logged in
        if (currentSession?.user) {
          try {
            // Use setTimeout to avoid deadlock
            setTimeout(async () => {
              const { data: profileData, error } = await supabase
                .from("profiles")
                .select("role")
                .eq("id", currentSession.user.id)
                .single();
                
              if (error) {
                console.error("Error fetching user role:", error);
              } else if (profileData) {
                setUserRole(profileData.role as UserRole);
              }
              
              setLoading(false);
            }, 0);
          } catch (error) {
            console.error("Error in auth state change:", error);
            setLoading(false);
          }
        } else {
          setUserRole(null);
          setLoading(false);
        }
      }
    );

    // THEN check for existing session
    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        
        if (initialSession?.user) {
          const { data: profileData, error } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", initialSession.user.id)
            .single();
            
          if (error) {
            console.error("Error fetching initial user role:", error);
          } else if (profileData) {
            setUserRole(profileData.role as UserRole);
          }
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        setLoading(false);
      }
    };
    
    initializeAuth();

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUserRole(null);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const value = {
    session,
    user,
    userRole,
    loading,
    signOut,
    login
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  return context;
};
