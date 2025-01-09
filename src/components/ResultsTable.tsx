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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  const [selectedResult, setSelectedResult] = React.useState<Result | null>(null);

  return (
    <>
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
                <TableCell 
                  className="font-mono text-xs md:text-sm break-all cursor-pointer hover:text-blue-500"
                  onClick={() => setSelectedResult(result)}
                >
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
                      </div>
                    ))}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selectedResult} onOpenChange={() => setSelectedResult(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Balance Check Details</DialogTitle>
          </DialogHeader>
          
          {selectedResult && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Address</div>
                <div className="font-mono text-sm break-all">{selectedResult.address}</div>
              </div>

              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Type</div>
                <div className="capitalize">{selectedResult.type}</div>
              </div>

              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Status</div>
                <div>
                  {selectedResult.status === 'pending' && 'Pending'}
                  {selectedResult.status === 'checking' && (
                    <span className="text-yellow-500">Checking...</span>
                  )}
                  {selectedResult.status === 'done' && (
                    <span className="text-green-500">Complete</span>
                  )}
                </div>
              </div>

              {(selectedResult.status === 'checking' || selectedResult.status === 'done') && (
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Progress</div>
                  <Progress value={selectedResult.progress} className="h-2" />
                  <div className="text-xs text-muted-foreground">
                    Checked {selectedResult.checkedRpcs} of {selectedResult.totalRpcs} RPCs
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Balances</div>
                <div className="space-y-3 border rounded-lg p-4">
                  {selectedResult.balances.length > 0 ? (
                    selectedResult.balances.map((balance, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="font-medium">{balance.chainId}</div>
                        <div className="font-mono text-sm">{balance.amount}</div>
                        {balance.rpcUrl && (
                          <div className="text-xs text-muted-foreground break-all">
                            RPC: {balance.rpcUrl}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      {selectedResult.status === 'pending' && 'Waiting to start balance check...'}
                      {selectedResult.status === 'checking' && 'Checking balances...'}
                      {selectedResult.status === 'done' && 'No balances found'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};