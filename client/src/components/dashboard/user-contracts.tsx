import { ContractAnalysis } from "@/interfaces/contract.interface";
import { api } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { UploadModal } from "../modals/upload-modal";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Download, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "../ui/input";
import { toast } from "sonner";

export default function UserContracts() {
  const queryClient = useQueryClient();
  const { data: contracts } = useQuery<ContractAnalysis[]>({
    queryKey: ["user-contracts"],
    queryFn: () => fetchUserContracts(),
  });

  const [sorting, setSorting] = useState<SortingState>([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [search, setSearch] = useState("");

  const deleteMutation = useMutation({
    mutationFn: async (contractId: string) => {
      await api.delete(`/contracts/contract/${contractId}`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["user-contracts"] });
      toast.success("Contract deleted");
    },
    onError: () => {
      toast.error("Failed to delete contract");
    },
  });

  const contractTypeColors: { [key: string]: string } = {
    Employment: "bg-blue-100 text-blue-800 hover:bg-blue-200",
    "Non-Disclosure Agreement":
      "bg-green-100 text-green-800 hover:bg-green-200",
    Sales: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
    Lease: "bg-emerald-100 text-emerald-800 hover:bg-emerald-200",
    Services: "bg-pink-100 text-pink-800 hover:bg-pink-200",
    Other: "bg-gray-100 text-gray-800 hover:bg-gray-200",
  };

  const columns: ColumnDef<ContractAnalysis>[] = [
    {
      accessorKey: "_id",
      header: ({ column }) => {
        return <Button variant={"ghost"}>Contract ID</Button>;
      },
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue<string>("_id")}</div>
      ),
    },
    {
      accessorKey: "overallScore",
      header: ({ column }) => {
        return <Button variant={"ghost"}>Overall Score</Button>;
      },
      cell: ({ row }) => {
        const score = parseFloat(row.getValue("overallScore"));
        return (
          <Badge
            className="rounded-md"
            variant={
              score > 75 ? "success" : score < 50 ? "destructive" : "secondary"
            }
          >
            {score.toFixed(2)} Overall Score
          </Badge>
        );
      },
    },
    {
      accessorKey: "contractType",
      header: "Contract Type",
      cell: ({ row }) => {
        const contractType = row.getValue("contractType") as string;
        const colorClass =
          contractTypeColors[contractType] || contractTypeColors["Other"];
        return (
          <Badge className={cn("rounded-md", colorClass)}>{contractType}</Badge>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const contract = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant={"ghost"} className="size-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Link href={`/dashboard/contract/${contract._id}`}>
                  View Details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <span className="text-destructive">Delete Contract</span>
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      your contract and remove your data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => deleteMutation.mutate(contract._id)}
                    >
                      Continue
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const filteredContracts = useMemo(() => {
    const rows = contracts ?? [];
    if (!search.trim()) return rows;

    const query = search.toLowerCase();
    return rows.filter(
      (row) =>
        row._id.toLowerCase().includes(query) ||
        row.contractType.toLowerCase().includes(query)
    );
  }, [contracts, search]);

  const table = useReactTable({
    data: filteredContracts,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  });

  const totalContracts = contracts?.length || 0;
  const averageScore =
    totalContracts > 0
      ? (contracts?.reduce(
          (sum, contract) => sum + (contract.overallScore ?? 0),
          0
        ) ?? 0) / totalContracts
      : 0;

  const highRiskContracts =
    contracts?.filter((contract) =>
      contract.risks.some((risk) => risk.severity === "high")
    ).length ?? 0;

  const exportContractsToCsv = () => {
    if (!contracts || contracts.length === 0) return;

    const headers = [
      "contractId",
      "contractType",
      "overallScore",
      "createdAt",
      "riskCount",
      "opportunityCount",
    ];

    const rows = contracts.map((contract) => [
      contract._id,
      contract.contractType,
      String(contract.overallScore ?? 0),
      new Date(contract.createdAt).toISOString(),
      String(contract.risks?.length ?? 0),
      String(contract.opportunities?.length ?? 0),
    ]);

    const csv = [headers, ...rows]
      .map((line) => line.map((value) => `"${value.replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "contracts-export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto space-y-6 p-3 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold leading-tight sm:text-3xl">Your Contracts</h1>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <Button variant="outline" onClick={exportContractsToCsv} className="w-full sm:w-auto">
            <Download className="mr-2 size-4" />
            Export CSV
          </Button>
          <Button onClick={() => setIsUploadModalOpen(true)} className="w-full sm:w-auto">
            New Contract
          </Button>
        </div>
      </div>

      <div className="w-full sm:max-w-md">
        <Input
          placeholder="Search by contract ID or type..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalContracts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Contracts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageScore.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              High Risk Contracts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{highRiskContracts}</div>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant={"outline"}
          size={"sm"}
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant={"outline"}
          size={"sm"}
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadComplete={() => table.reset()}
      />
    </div>
  );
}

async function fetchUserContracts(): Promise<ContractAnalysis[]> {
  const response = await api.get("/contracts/user-contracts");
  return response.data;
}
