import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface Balance {
  chainId: string;
  amount: string;
}

export interface Result {
  address: string;
  type: 'address' | 'private_key' | 'mnemonic';
  balances: Balance[];
  status: 'pending' | 'checking' | 'done';
}

interface ResultsTableProps {
  results: Result[];
}

export const ResultsTable: React.FC<ResultsTableProps> = ({ results }) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Address</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Balances</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {results.map((result, index) => (
            <TableRow key={index}>
              <TableCell className="font-mono">{result.address}</TableCell>
              <TableCell>{result.type}</TableCell>
              <TableCell>
                {result.status === 'pending' && 'Pending'}
                {result.status === 'checking' && 'Checking...'}
                {result.status === 'done' && 'Complete'}
              </TableCell>
              <TableCell>
                {result.balances.map((balance, idx) => (
                  <div key={idx} className="text-sm">
                    {balance.chainId}: {balance.amount}
                  </div>
                ))}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};