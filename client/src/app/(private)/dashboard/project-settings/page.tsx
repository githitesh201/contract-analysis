"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useAppSettings } from "@/hooks/use-app-settings";
import { toast } from "sonner";

export default function ProjectSettingsPage() {
  const { settings, updateSettings } = useAppSettings();
  const [projectName, setProjectName] = useState(settings.projectName);
  const [projectDescription, setProjectDescription] = useState(
    settings.projectDescription
  );

  useEffect(() => {
    setProjectName(settings.projectName);
    setProjectDescription(settings.projectDescription);
  }, [settings.projectName, settings.projectDescription]);

  const handleSave = async () => {
    try {
      await updateSettings.mutateAsync({
        projectName,
        projectDescription,
      });
      toast.success("Project settings saved");
    } catch {
      toast.error("Failed to save project settings");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Project Settings</h1>
        <p className="text-muted-foreground">
          Manage workspace-level project details.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My First Project</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="projectName">Project Name</Label>
            <Input
              id="projectName"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="projectDesc">Description</Label>
            <Input
              id="projectDesc"
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
            />
          </div>
          <Button type="button" onClick={handleSave} disabled={updateSettings.isPending}>
            {updateSettings.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
