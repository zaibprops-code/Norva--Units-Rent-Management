"use client";

import { useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";
import type { Organization } from "@/types";

interface UseOrganizationResult {
  organization: Organization | null;
  loading: boolean;
  error: string | null;
}

export function useOrganization(): UseOrganizationResult {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          setError("Not authenticated");
          return;
        }
        const { data, error: dbError } = await supabase
          .from("organizations")
          .select("*")
          .eq("owner_id", user.id)
          .single();
        if (dbError) throw dbError;
        setOrganization(data as Organization);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load organization"
        );
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return { organization, loading, error };
}
