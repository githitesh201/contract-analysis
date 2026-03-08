"use client";

import { ContractAnalysis } from "@/interfaces/contract.interface";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function OverviewPage() {
  const { data: contracts = [] } = useQuery<ContractAnalysis[]>({
    queryKey: ["user-contracts"],
    queryFn: async () => {
      const response = await api.get("/contracts/user-contracts");
      return response.data;
    },
  });

  const totalContracts = contracts.length;
  const averageScore =
    totalContracts > 0
      ? contracts.reduce((sum, contract) => sum + (contract.overallScore ?? 0), 0) /
        totalContracts
      : 0;
  const highRiskCount = contracts.filter((contract) =>
    contract.risks?.some((risk) => risk.severity === "high")
  ).length;
  const lowRiskCount = contracts.filter((contract) =>
    contract.risks?.every((risk) => risk.severity !== "high")
  ).length;

  const trendData = contracts
    .map((contract) => ({
      date: new Date(contract.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      score: contract.overallScore ?? 0,
    }))
    .reverse();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Overview</h1>
        <p className="text-muted-foreground">
          Quick snapshot of your workspace and contract portfolio.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Contracts</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">{totalContracts}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Average Score</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">
            {averageScore.toFixed(1)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">High Risk Contracts</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">{highRiskCount}</CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Contract Score Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#0f172a"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Risk Snapshot</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md border p-3">
              <p className="text-sm text-muted-foreground">High Risk</p>
              <p className="text-2xl font-bold text-red-600">{highRiskCount}</p>
            </div>
            <div className="rounded-md border p-3">
              <p className="text-sm text-muted-foreground">Low/Medium Risk</p>
              <p className="text-2xl font-bold text-emerald-600">{lowRiskCount}</p>
            </div>
            <div className="rounded-md border p-3">
              <p className="text-sm text-muted-foreground">Risk Ratio</p>
              <p className="text-2xl font-bold">
                {totalContracts > 0
                  ? `${Math.round((highRiskCount / totalContracts) * 100)}%`
                  : "0%"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
