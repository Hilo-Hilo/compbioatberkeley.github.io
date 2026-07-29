import { useEffect, useState } from "react";
import { publicAssetPath } from "@/lib/publicAsset";
import { Officer } from "@/types/officers";

export const useOfficersSp26 = () => {
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOfficers = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          publicAssetPath("officers/archive/sp26/officers-sp26.json"),
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch SP26 officers data: ${response.status}`);
        }

        const data = (await response.json()) as Officer[];
        const sortedData = [...data].sort((a, b) => a.name.localeCompare(b.name));
        setOfficers(sortedData);
      } catch (err) {
        console.error("Error fetching SP26 officers:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch SP26 officers data");
        setOfficers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOfficers();
  }, []);

  return { officers, loading, error };
};
