import { api } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface AppSettings {
  projectName: string;
  projectDescription: string;
  defaultLanguage: string;
  timezone: string;
}

const defaults: AppSettings = {
  projectName: "My First Project",
  projectDescription: "Contract analysis workspace",
  defaultLanguage: "English",
  timezone: "Asia/Kolkata",
};

export function useAppSettings() {
  const queryClient = useQueryClient();

  const settingsQuery = useQuery<AppSettings>({
    queryKey: ["app-settings"],
    queryFn: async () => {
      try {
        const response = await api.get("/auth/settings");
        return response.data;
      } catch {
        return defaults;
      }
    },
  });

  const updateSettings = useMutation({
    mutationFn: async (payload: Partial<AppSettings>) => {
      const response = await api.put("/auth/settings", payload);
      return response.data as AppSettings;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["app-settings"], data);
    },
  });

  return {
    settings: settingsQuery.data ?? defaults,
    isLoading: settingsQuery.isLoading,
    isError: settingsQuery.isError,
    updateSettings,
  };
}
