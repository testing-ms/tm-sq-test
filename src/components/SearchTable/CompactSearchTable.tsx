import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  OnChangeFn,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CompactSearchTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  tableSize?: number;
  tableSizeChangeable?: boolean;
  className?: string;
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
  meta?: Record<string, unknown>;
}

export function CompactSearchTable<TData, TValue>({
  columns,
  data,
  tableSize = 10,
  tableSizeChangeable = true,
  className,
  sorting: externalSorting,
  onSortingChange: externalOnSortingChange,
  meta,
}: CompactSearchTableProps<TData, TValue>) {
  const [filter, setFilter] = useState("");
  const [internalSorting, setInternalSorting] = useState<SortingState>([]);

  const sorting = externalSorting ?? internalSorting;
  const onSortingChange = externalOnSortingChange ?? setInternalSorting;

  useEffect(() => {
    table.setPageSize(tableSize);
  }, [tableSize]);

  const table = useReactTable({
    data,
    columns,
    meta,
    state: {
      globalFilter: filter,
      sorting,
    },
    onGlobalFilterChange: setFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: onSortingChange,
    getSortedRowModel: getSortedRowModel(),
    manualSorting: true,
    enableSorting: false,
  });

  return (
    <div className={cn("space-y-3 flex flex-col", className)}>
      <div className="flex items-center justify-between flex-none">
        <div className="flex items-center space-x-2 w-72">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <Input
              placeholder="Buscar..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="h-8 pl-9 text-xs bg-white border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Total:</span>
          <Badge variant="outline" className="text-xs border-tertiary text-tertiary">
            {data.length}
          </Badge>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="overflow-x-auto rounded-md border-x border-t border-gray-200 shadow-sm h-full">
          <Table className="min-w-full">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="bg-gray-50 hover:bg-gray-50 border-b border-gray-200">
                  {headerGroup.headers.map((header, index) => (
                    <TableHead
                      key={header.id}
                      className={cn(
                        "h-9 px-3 text-xs font-semibold text-gray-700 text-center align-middle whitespace-nowrap uppercase tracking-wider bg-gray-50",
                        index === 0 && "rounded-tl-md",
                        index === headerGroup.headers.length - 1 && "rounded-tr-md"
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-none h-9"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="px-3 py-2 text-xs text-center align-middle whitespace-nowrap"
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-20 text-center"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Search className="h-6 w-6 text-gray-400" />
                      <p className="text-xs text-gray-500">No se encontraron resultados.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex items-center justify-between flex-none">
        <div className="flex items-center gap-1">
          <Select
            value={tableSize.toString()}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
            disabled={!tableSizeChangeable}
          >
            <SelectTrigger className="h-7 w-[60px] text-xs bg-white border-gray-200">
              <SelectValue placeholder={tableSize} />
            </SelectTrigger>
            <SelectContent side="top" className="min-w-[60px]">
              {[5, 10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={pageSize.toString()} className="text-xs">
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500">registros</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="h-7 w-7 bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-tertiary hover:border-tertiary disabled:opacity-50"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <p className="text-xs text-gray-500">
            {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
          </p>
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="h-7 w-7 bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-tertiary hover:border-tertiary disabled:opacity-50"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}