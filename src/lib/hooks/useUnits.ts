"use client";

import { useEffect, useState, useCallback } from "react";

import { createClient } from "@/lib/supabase/client";
import type { Unit } from "@/types";

interface UseUnitsResult {
  units: Unit[];
  loading: boolean;
  refetch: () => Promise<void>;
}

export function useUnits(propertyId: string | null): UseUnitsResult {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUnits = useCallback(async () => {
    if (!propertyId) {
      setUnits([]);
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from("units")
        .select("*")
        .eq("property_id", propertyId)
        .order("unit_number");
      setUnits(data ?? []);
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  useEffect(() => {
    fetchUnits();
  }, [fetchUnits]);

  return { units, loading, refetch: fetchUnits };
}
