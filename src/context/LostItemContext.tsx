import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { getStoredItems } from "../api/lost";
import { lostListData } from "../mock/lost";
import { LostItem } from "../types/lost";

interface LostItemContextValue {
  lostItems: LostItem[];
  isLoading: boolean;
  error: string;
  refresh: () => Promise<void>;
}

const LostItemContext = createContext<LostItemContextValue | null>(null);

export const LostItemProvider = ({ children }: { children: ReactNode }) => {
  const [lostItems, setLostItems] = useState<LostItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await getStoredItems({ size: 50 });
      setLostItems(response.content);
    } catch (requestError) {
      setLostItems(lostListData);
      setError(
        requestError instanceof Error
          ? requestError.message
          : "분실물 목록을 불러오지 못했습니다.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({ lostItems, isLoading, error, refresh }),
    [error, isLoading, lostItems, refresh],
  );

  return (
    <LostItemContext.Provider value={value}>
      {children}
    </LostItemContext.Provider>
  );
};

export const useLostItems = () => {
  const context = useContext(LostItemContext);
  if (!context) throw new Error("useLostItems must be used within LostItemProvider");
  return context;
};
