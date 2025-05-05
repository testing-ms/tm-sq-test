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

interface SearchTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  tableSize?: number;
  tableSizeChangeable?: boolean;
  className?: string;
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
}

export function SearchTable<TData, TValue>({
  columns,
  data,
  tableSize = 10,
  tableSizeChangeable = true,
  className,
  sorting: externalSorting,
  onSortingChange: externalOnSortingChange,
}: SearchTableProps<TData, TValue>) {
  const [filter, setFilter] = useState("");
  const [internalSorting, setInternalSorting] = useState<SortingState>([]);

  const sorting = externalSorting ?? internalSorting;
  const onSortingChange = externalOnSortingChange ?? setInternalSorting;

  useEffect(() => {
    table.setPageSize(tableSize);
  }, []);

  const table = useReactTable({
    data,
    columns,
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
  });

  return (
    <div className={cn("space-y-4 flex flex-col", className)}>
      <div className="flex items-center justify-between flex-none">
        <div className="flex items-center space-x-2 w-72">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="h-9 pl-9 text-sm bg-white focus-visible:ring-1 focus-visible:ring-tertiary"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Total:</span>
          <Badge variant="outline" className="text-xs border-tertiary text-tertiary">
            {data.length}
          </Badge>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="rounded-lg border bg-white shadow-sm h-full overflow-hidden">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="bg-tertiary/5 hover:bg-tertiary/5 border-b border-gray-200">
                  {headerGroup.headers.map((header, index) => (
                    <TableHead
                      key={header.id}
                      style={{ width: header.id === "actions" ? "200px" : header.id === "fecha" ? "250px" : "auto" }}
                      className={cn(
                        "h-11 px-4 text-sm font-medium text-gray-700 text-center align-middle whitespace-nowrap",
                        index === 0 && "rounded-tl-lg",
                        index === headerGroup.headers.length - 1 && "rounded-tr-lg"
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
                    className="hover:bg-tertiary/5 transition-colors border-b border-gray-100 last:border-none"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        style={{ width: cell.column.id === "actions" ? "200px" : cell.column.id === "fecha" ? "250px" : "auto" }}
                        className="px-4 py-3 text-sm text-center align-middle whitespace-nowrap"
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
                    className="h-24 text-center"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Search className="h-8 w-8 text-gray-400" />
                      <p className="text-sm text-gray-500">No se encontraron resultados.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex items-center justify-between flex-none">
        <div className="flex items-center gap-2">
          <Select
            value={tableSize.toString()}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
            disabled={!tableSizeChangeable}
          >
            <SelectTrigger className="h-8 w-[70px] text-sm bg-white border-gray-200">
              <SelectValue placeholder={tableSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[5, 10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={pageSize.toString()} className="text-sm">
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-gray-500">registros por página</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="h-8 bg-white border-gray-200 text-gray-700 hover:bg-tertiary/5 hover:text-tertiary hover:border-tertiary disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <p className="text-sm text-gray-500">
            Página {table.getState().pagination.pageIndex + 1} de{" "}
            {table.getPageCount()}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="h-8 bg-white border-gray-200 text-gray-700 hover:bg-tertiary/5 hover:text-tertiary hover:border-tertiary disabled:opacity-50"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
