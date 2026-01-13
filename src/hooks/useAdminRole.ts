import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useAdminRole = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModerator, setIsModerator] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkRole = async () => {
      if (!user) {
        setIsAdmin(false);
        setIsModerator(false);
        setIsLoading(false);
        return;
      }

      try {
        // Check admin role using the has_role function
        const { data: adminData, error: adminError } = await supabase
          .rpc('has_role', { _user_id: user.id, _role: 'admin' });

        if (adminError) {
          console.error("Error checking admin role:", adminError);
          setIsAdmin(false);
        } else {
          setIsAdmin(adminData === true);
        }

        // Check moderator role
        const { data: modData, error: modError } = await supabase
          .rpc('has_role', { _user_id: user.id, _role: 'moderator' });

        if (modError) {
          console.error("Error checking moderator role:", modError);
          setIsModerator(false);
        } else {
          setIsModerator(modData === true);
        }
      } catch (error) {
        console.error("Error checking roles:", error);
        setIsAdmin(false);
        setIsModerator(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkRole();
  }, [user]);

  return { isAdmin, isModerator, isLoading, hasAdminAccess: isAdmin || isModerator };
};
