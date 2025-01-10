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

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'address':
        return 'Адрес';
      case 'private_key':
        return 'Приватный ключ';
      case 'mnemonic':
        return 'Мнемоника';
      default:
        return type;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Ожидание';
      case 'checking':
        return 'Проверка...';
      case 'done':
        return 'Завершено';
      default:
        return status;
    }
  };

  return (
    <>
      <div className="rounded-md border overflow-x-auto bg-white/5 backdrop-blur-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-white/5">
              <TableHead className="min-w-[120px] text-white/70">Адрес</TableHead>
              <TableHead className="min-w-[80px] text-white/70">Тип</TableHead>
              <TableHead className="min-w-[100px] text-white/70">Статус</TableHead>
              <TableHead className="min-w-[200px] text-white/70">Прогресс</TableHead>
              <TableHead className="min-w-[200px] text-white/70">Балансы</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.map((result, index) => (
              <TableRow key={index} className="hover:bg-white/5">
                <TableCell 
                  className="font-mono text-xs md:text-sm break-all cursor-pointer hover:text-blue-400 transition-colors text-white/90"
                  onClick={() => setSelectedResult(result)}
                >
                  {result.address}
                </TableCell>
                <TableCell className="text-sm text-white/90">{getTypeLabel(result.type)}</TableCell>
                <TableCell className="text-sm">
                  {result.status === 'pending' && <span className="text-white/60">Ожидание</span>}
                  {result.status === 'checking' && (
                    <span className="text-yellow-500 animate-pulse">Проверка...</span>
                  )}
                  {result.status === 'done' && (
                    <span className="text-green-400">Завершено</span>
                  )}
                </TableCell>
                <TableCell>
                  {(result.status === 'checking' || result.status === 'done') && (
                    <div className="space-y-2">
                      <Progress value={result.progress} className="h-2" />
                      <div className="text-xs text-white/60">
                        Проверено {result.checkedRpcs} из {result.totalRpcs} RPC
                      </div>
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {result.balances.map((balance, idx) => (
                      <div key={idx} className="text-xs md:text-sm bg-white/5 p-2 rounded-md backdrop-blur-sm">
                        <span className="font-medium text-white/90">{balance.chainId}:</span>{' '}
                        <span className="font-mono text-white/90">{balance.amount}</span>
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
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-gray-900/95 backdrop-blur-sm text-white">
          <DialogHeader>
            <DialogTitle>Детали проверки баланса</DialogTitle>
          </DialogHeader>
          
          {selectedResult && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="text-sm text-white/60">Адрес</div>
                <div className="font-mono text-sm break-all bg-white/5 p-3 rounded-lg">
                  {selectedResult.address}
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm text-white/60">Тип</div>
                <div className="capitalize bg-white/5 p-3 rounded-lg">
                  {getTypeLabel(selectedResult.type)}
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm text-white/60">Статус</div>
                <div className="bg-white/5 p-3 rounded-lg">
                  {selectedResult.status === 'pending' && 'Ожидание'}
                  {selectedResult.status === 'checking' && (
                    <span className="text-yellow-500 animate-pulse">Проверка...</span>
                  )}
                  {selectedResult.status === 'done' && (
                    <span className="text-green-400">Завершено</span>
                  )}
                </div>
              </div>

              {(selectedResult.status === 'checking' || selectedResult.status === 'done') && (
                <div className="space-y-2">
                  <div className="text-sm text-white/60">Прогресс</div>
                  <Progress value={selectedResult.progress} className="h-2" />
                  <div className="text-xs text-white/60">
                    Проверено {selectedResult.checkedRpcs} из {selectedResult.totalRpcs} RPC
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <div className="text-sm text-white/60">Балансы</div>
                <div className="space-y-3 border border-white/10 rounded-lg p-4 bg-white/5">
                  {selectedResult.balances.length > 0 ? (
                    selectedResult.balances.map((balance, idx) => (
                      <div key={idx} className="space-y-1 p-3 bg-white/5 rounded-lg">
                        <div className="font-medium text-white/90">{balance.chainId}</div>
                        <div className="font-mono text-sm text-white/90">{balance.amount}</div>
                        {balance.rpcUrl && (
                          <div className="text-xs text-white/60 break-all">
                            RPC: {balance.rpcUrl}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-white/60">
                      {selectedResult.status === 'pending' && 'Ожидание начала проверки...'}
                      {selectedResult.status === 'checking' && 'Проверка балансов...'}
                      {selectedResult.status === 'done' && 'Балансы не найдены'}
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