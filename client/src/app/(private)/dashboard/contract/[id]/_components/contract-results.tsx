"use client";

import ContractAnalysisResults from "@/components/analysis/contract-analysis-results";
import { useCurrentUser } from "@/hooks/use-current-user";
import { ContractAnalysis } from "@/interfaces/contract.interface";
import { api } from "@/lib/api";
import { notFound } from "next/navigation";
import { useEffect, useState } from "react";

interface IContractResultsProps {
  contractId: string;
}

export default function ContractResults({ contractId }: IContractResultsProps) {
  const { user } = useCurrentUser();
  const [analysisResults, setAnalysisResults] = useState<ContractAnalysis>();
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    const fetchAnalysisResults = async (id: string) => {
      try {
        const response = await api.get(`/contracts/contract/${id}`);
        setAnalysisResults(response.data);
        setError(false);
      } catch (fetchError) {
        console.error(fetchError);
        setError(true);
      }
    };

    if (user) {
      fetchAnalysisResults(contractId);
    }
  }, [user, contractId]);

  if (error) {
    return notFound();
  }

  if (!analysisResults) {
    return <div>Loading...</div>;
  }

  return (
    <ContractAnalysisResults
      contractId={contractId}
      analysisResults={analysisResults}
      isActive={true}
      onUpgrade={function (): void {
        throw new Error("Function not implemented.");
      }}
    />
  );
}
