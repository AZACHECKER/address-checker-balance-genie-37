import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";

export interface Balance {
  chainId: string;
  amount: string;
  rpcUrl?: string;
}

export interface Result {
  address: string;
  type: 'address' | 'private_key' | 'mnemonic';
  balances: Balance[];
  status: 'pending' | 'checking' | 'done';
  progress?: number;
  totalRpcs?: number;
  checkedRpcs?: number;
}

interface ResultsTableProps {
  results: Result[];
}

export const ResultsTable: React.FC<ResultsTableProps> = ({ results }) => {
  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[120px]">Address</TableHead>
            <TableHead className="min-w-[80px]">Type</TableHead>
            <TableHead className="min-w-[100px]">Status</TableHead>
            <TableHead className="min-w-[200px]">Progress</TableHead>
            <TableHead className="min-w-[200px]">Balances</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {results.map((result, index) => (
            <TableRow key={index}>
              <TableCell className="font-mono text-xs md:text-sm break-all">
                {result.address}
              </TableCell>
              <TableCell className="text-sm">{result.type}</TableCell>
              <TableCell className="text-sm">
                {result.status === 'pending' && 'Pending'}
                {result.status === 'checking' && (
                  <span className="text-yellow-500">Checking...</span>
                )}
                {result.status === 'done' && (
                  <span className="text-green-500">Complete</span>
                )}
              </TableCell>
              <TableCell>
                {(result.status === 'checking' || result.status === 'done') && (
                  <div className="space-y-2">
                    <Progress value={result.progress} className="h-2" />
                    <div className="text-xs text-muted-foreground">
                      Checked {result.checkedRpcs} of {result.totalRpcs} RPCs
                    </div>
                  </div>
                )}
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  {result.balances.map((balance, idx) => (
                    <div key={idx} className="text-xs md:text-sm">
                      <span className="font-medium">{balance.chainId}:</span>{' '}
                      <span className="font-mono">{balance.amount}</span>
                      {balance.rpcUrl && (
                        <div className="text-xs text-muted-foreground break-all">
                          RPC: {balance.rpcUrl}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};