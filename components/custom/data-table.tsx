/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck

'use client';

import React, { useState, useEffect } from 'react';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { ChevronsUpDown, ChevronsDown, ChevronsUp } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { cn } from '@/lib/utils';
import { renderPaginationLinks } from './pagination-links';

const statusColorMap = {
  NEW: 'bg-[#FFFF] text-[#007BFF]', // New: Light Blue with Blue text
  APPROVED: 'bg-[#DFF5E1] text-[#28A745]', // Approved: Light Green with Green text
  'IN PROGRESS': 'bg-[#FFE6CC] text-[#FD7E14]', // In Progress: Light Orange with Orange text
  SKIPPED: 'bg-[#E9ECEF] text-[#6C757D]', // Skipped: Light Gray with Gray text
  'BACK ORDER': 'bg-[#E8D9F3] text-[#6F42C1]', // Back Order: Light Purple with Purple text
  FULFILLED: 'bg-[#D3F4ED] text-[#20C997]', // Fulfilled: Light Teal with Teal text
};

const scanStatusColorMap = {
  skipped: 'bg-[#E9ECEF] text-[#6C757D]', // Skipped Scan: Same Light Gray theme
};

// New checkbox component
const Checkbox = ({
  checked,
  onChange,
  isDisabled,
}: {
  checked: boolean;
  onChange: () => void;
  isDisabled: boolean;
}) => (
  <input
    type="checkbox"
    checked={checked}
    onChange={onChange}
    disabled={isDisabled}
    className="cursor-pointer"
  />
);
type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

type DataTableProps<T> = {
  data: T[];
  columns: ColumnDef<T>[];
  isLoading: boolean;
  className?: string;
  onRowSelect?: (selectedRowIds: T[] | undefined) => void;
  pagination: PaginationProps;
  showCheckBox: boolean;
};

const DataTable = <T,>({
  data = [],
  columns,
  onRowSelect,
  isLoading,
  className = '',
  pagination,
  showCheckBox = false,
}: DataTableProps<T>) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable({
    data,
    columns,
    manualPagination: true, // Enable server-side pagination
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,

    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  useEffect(() => {
    // const selectedIds = new Set(
    //   table.getSelectedRowModel().rows.map(row => row.original.id)
    // );
    const selectedRows = table.getSelectedRowModel().rows;
    onRowSelect?.(
      selectedRows ? selectedRows.map(row => row.original) : undefined
    );
  }, [rowSelection, onRowSelect, table]);

  const handleSelectAll = () => {
    const allSelected = table.getIsAllRowsSelected();
    table.toggleAllRowsSelected(!allSelected);
  };

  const handleRowSelect = (id: string | number) => {
    const row = table.getRow(id.toString());
    row?.toggleSelected(!row.getIsSelected());
  };

  return (
    <div className={`overflow-x-auto rounded-lg border shadow-sm ${className}`}>
      <Table className="min-w-full divide-y divide-gray-200">
        <TableHeader className="bg-gray-50">
          <TableRow>
            <TableHead className="p-2 text-center">
              {showCheckBox && (
                <Checkbox
                  checked={table?.getIsAllRowsSelected() || false}
                  onChange={handleSelectAll}
                  isDisabled={isLoading}
                />
              )}
            </TableHead>
            {table.getHeaderGroups().map(headerGroup =>
              headerGroup.headers.map(header => (
                <TableHead
                  key={header.id}
                  className={cn(
                    `cursor-pointer p-1 text-left text-[12px] text-[#222222]`,
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-expect-error
                    header.column.columnDef?.meta?.isNumber && 'text-right'
                  )}
                  onClick={header.column.getToggleSortingHandler()}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  {header.column.columnDef.enableSorting &&
                    (header.column.getIsSorted() === 'desc' ? (
                      <ChevronsDown size="12" className="mx-1 inline-block" />
                    ) : header.column.getIsSorted() ? (
                      <ChevronsUp size="12" className="mx-1 inline-block" />
                    ) : (
                      <ChevronsUpDown size="12" className="mx-1 inline-block" />
                    ))}
                </TableHead>
              ))
            )}
          </TableRow>
        </TableHeader>

        <TableBody className="divide-y divide-gray-200 bg-white">
          {table.getRowModel().rows.length && !isLoading ? (
            table.getRowModel().rows.map(row => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
                className={cn(
                  statusColorMap[
                    row.original?.status?.toUpperCase() as keyof typeof statusColorMap
                  ] || '',
                  scanStatusColorMap[
                    row.original?.status as keyof typeof scanStatusColorMap
                  ] || '',
                  {
                    'bg-blue-50': row.isSelected,
                    'hover:bg-gray-50': !row.isSelected,
                  }
                )}
                onClick={() => handleRowSelect(row.id)}
              >
                <TableCell className="p-2 text-center">
                  {showCheckBox && (
                    <Checkbox
                      checked={row.getIsSelected()}
                      onChange={() => handleRowSelect(row.id)}
                      isDisabled={isLoading}
                    />
                  )}
                </TableCell>
                {row.getVisibleCells().map(cell => (
                  <TableCell
                    key={cell.id}
                    className={cn(
                      statusColorMap[row.original?.status.toUpperCase()],
                      scanStatusColorMap[row.original?.scan_status],
                      'whitespace-nowrap px-4 py-3 text-sm',
                      row.getIsSelected() && 'bg-yellow-100'
                    )}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length + 1}
                className="px-4 py-6 text-center text-gray-500"
              >
                {isLoading && 'Loading...'}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className="border-t border-gray-200 px-4 py-3">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() =>
                  pagination.onPageChange(
                    Math.max(pagination.currentPage - 1, 1)
                  )
                }
                className="cursor-pointer"
                aria-disabled={pagination.currentPage === 1}
              />
            </PaginationItem>

            {renderPaginationLinks(
              pagination.totalPages,
              pagination.currentPage,
              pagination.onPageChange
            )}

            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  pagination.onPageChange(
                    Math.min(pagination.currentPage + 1, pagination.totalPages)
                  )
                }
                className="cursor-pointer"
                aria-disabled={pagination.currentPage === pagination.totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
};

export default DataTable;
