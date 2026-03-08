"use client";

import { useModalStore } from "@/store/zustand";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { api, getApiBaseUrl } from "@/lib/api";
import { Input } from "../ui/input";
const demoAuthEnabled = process.env.NEXT_PUBLIC_ENABLE_DEMO_AUTH === "true";

function googleSignIn(): Promise<void> {
  return new Promise((resolve) => {
    window.location.href = `${getApiBaseUrl()}/auth/google`;
    resolve();
  });
}

const demoSignIn = async () => {
  await api.post("/auth/demo-login");
};

export function ConnectAccountModal() {
  const [isAgreed, setIsAgreed] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const modalKey = "connectAccountModal";
  const { isOpen, closeModal } = useModalStore();
  const queryClient = useQueryClient();

  const googleMutation = useMutation({
    mutationFn: googleSignIn,
    onSuccess: () => {
      closeModal(modalKey);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const demoMutation = useMutation({
    mutationFn: demoSignIn,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      closeModal(modalKey);
      window.location.href = "/dashboard";
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const localLoginMutation = useMutation({
    mutationFn: async () => {
      await api.post("/auth/local-login", {
        email: email.trim(),
        password,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      closeModal(modalKey);
      window.location.href = "/dashboard";
    },
    onError: (error: Error) => {
      toast.error(error.message || "Invalid email or password");
    },
  });

  const handleGoogleSignIn = async () => {
    if (isAgreed) {
      googleMutation.mutate();
    } else {
      toast.error("Please agree to the terms and conditions");
    }
  };

  const handleDemoSignIn = async () => {
    if (isAgreed) {
      demoMutation.mutate();
    } else {
      toast.error("Please agree to the terms and conditions");
    }
  };

  return (
    <Dialog
      open={isOpen(modalKey)}
      onOpenChange={() => closeModal(modalKey)}
      key={modalKey}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sign In</DialogTitle>
          <DialogDescription>
            Use Google sign-in or continue with the built-in demo account.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <Button
            onClick={handleGoogleSignIn}
            disabled={
              !isAgreed ||
              googleMutation.isPending ||
              demoMutation.isPending ||
              localLoginMutation.isPending
            }
            className="w-full"
          >
            {googleMutation.isPending ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <>Sign in with Google</>
            )}
          </Button>
          {demoAuthEnabled && (
            <div className="space-y-2 rounded-md border p-3">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="demo@contractanalysis.local"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="demo1234"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button
                onClick={() => localLoginMutation.mutate()}
                disabled={
                  !isAgreed ||
                  !email.trim() ||
                  !password ||
                  googleMutation.isPending ||
                  demoMutation.isPending ||
                  localLoginMutation.isPending
                }
                className="w-full"
                variant="outline"
              >
                {localLoginMutation.isPending ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <>Login with Email & Password</>
                )}
              </Button>
            </div>
          )}
          {demoAuthEnabled && (
            <Button
              onClick={handleDemoSignIn}
              disabled={
                !isAgreed ||
                googleMutation.isPending ||
                demoMutation.isPending ||
                localLoginMutation.isPending
              }
              className="w-full"
              variant="secondary"
            >
              {demoMutation.isPending ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <>Continue with Demo Account</>
              )}
            </Button>
          )}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="terms"
              checked={isAgreed}
              onCheckedChange={(checked) => setIsAgreed(checked as boolean)}
            />
            <Label
              htmlFor="terms"
              className="text-sm text-gray-500 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I agree to the terms and conditions
            </Label>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
