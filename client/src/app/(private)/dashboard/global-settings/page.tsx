"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useAppSettings } from "@/hooks/use-app-settings";
import { toast } from "sonner";

export default function GlobalSettingsPage() {
  const { settings, updateSettings } = useAppSettings();
  const [defaultLanguage, setDefaultLanguage] = useState(settings.defaultLanguage);
  const [timezone, setTimezone] = useState(settings.timezone);

  useEffect(() => {
    setDefaultLanguage(settings.defaultLanguage);
    setTimezone(settings.timezone);
  }, [settings.defaultLanguage, settings.timezone]);

  const handleSave = async () => {
    try {
      await updateSettings.mutateAsync({
        defaultLanguage,
        timezone,
      });
      toast.success("Global settings updated");
    } catch {
      toast.error("Failed to update global settings");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Global Settings</h1>
        <p className="text-muted-foreground">
          Configure defaults applied across your account.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Workspace Defaults</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="language">Default Language</Label>
            <Input
              id="language"
              value={defaultLanguage}
              onChange={(e) => setDefaultLanguage(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Input
              id="timezone"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
            />
          </div>
          <Button type="button" onClick={handleSave} disabled={updateSettings.isPending}>
            {updateSettings.isPending ? "Updating..." : "Update Defaults"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
