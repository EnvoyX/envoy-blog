import * as React from 'react'
import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from '@tanstack/react-table'
import { ListFilter, Loader2, MoreHorizontal, RefreshCw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { cn } from '@/lib/utils'
import { DataTablePagination } from '@/components/ui/data-table-pagination'
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header'
import { DataTableViewOptions } from '@/components/ui/data-table-view-options'
import { toast } from 'sonner'
import { IconFileExport, IconTableExport } from '@tabler/icons-react'
import {
  exportAllToXlsx,
  exportCurrentPageToXlsx,
  exportFilteredRowsToXlsx,
} from '@/utils/xlsx'
import {
  deleteAccountFn,
  deleteAccountsByManyFn,
  getAccountsFn,
} from '@/data/admin'
import { UserAvatar } from '../user-profile'
import { Link } from '@tanstack/react-router'

export default function AccountsDataTable() {
  const queryClient = useQueryClient()
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  )
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [filterColumn, setFilterColumn] = React.useState<string>('id')
  const {
    data: accounts,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ['accounts'],
    queryFn: async () => {
      const data = await getAccountsFn()
      return data
    },
  })
  const unified = React.useMemo(() => {
    if (!accounts) return []

    return accounts
  }, [accounts])

  type Unified = (typeof unified)[number]

  const columns: ColumnDef<Unified>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        const item = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="bg-transparent! backdrop-glass-lg"
              align="end"
            >
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                className="cursor-pointer"
                onClick={() =>
                  deleteAccount.mutate({
                    data: {
                      accountId: item.id,
                    },
                  })
                }
              >
                Delete Account
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer hover:bg-white/20!">
                <Link
                  to="/user/$userId"
                  params={{
                    userId: item.userId,
                  }}
                  target="_blank"
                  className="w-full"
                >
                  View User
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
    {
      accessorKey: 'id',
      accessorFn: (row) => row.id,
      header: ({ column }) => {
        return <DataTableColumnHeader column={column} title="Id" />
      },
      cell: ({ row }) => <div className="">{row.getValue('id')}</div>,
    },
    {
      accessorKey: 'accountId',
      accessorFn: (row) => row.accountId,
      header: ({ column }) => {
        return <DataTableColumnHeader column={column} title="Account Id" />
      },
      cell: ({ row }) => <div className="">{row.getValue('accountId')}</div>,
    },
    {
      accessorKey: 'providerId',
      accessorFn: (row) => row.providerId,
      header: ({ column }) => {
        return <DataTableColumnHeader column={column} title="Provider Id" />
      },
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue('providerId')}</div>
      ),
    },
    {
      accessorKey: 'userId',
      accessorFn: (row) => row.userId,
      header: ({ column }) => {
        return <DataTableColumnHeader column={column} title="User Id" />
      },
      cell: ({ row }) => <div className="">{row.getValue('userId')}</div>,
    },
    {
      accessorKey: 'userName',
      accessorFn: (row) => {
        return row.user?.name ?? ''
      },
      header: ({ column }) => {
        return <DataTableColumnHeader column={column} title="Name" />
      },
      cell: ({ row }) => (
        <span className="capitalize">{row.getValue('userName')}</span>
      ),
      filterFn: 'includesString',
    },
    {
      accessorKey: 'userEmail',
      accessorFn: (row) => {
        return row.user?.email ?? ''
      },
      header: ({ column }) => {
        return <DataTableColumnHeader column={column} title="Email" />
      },
      cell: ({ row }) => (
        <span className="lowercase">{row.getValue('userEmail')}</span>
      ),
      filterFn: 'includesString',
    },
    {
      accessorKey: 'emailVerified',
      header: ({ column }) => {
        return <DataTableColumnHeader column={column} title="Email Verified" />
      },
      accessorFn: (row) => {
        return row.user?.emailVerified ? 'True' : 'False'
      },
      cell: ({ row }) => <span>{row.getValue('emailVerified')}</span>,
      filterFn: 'includesString',
    },
    {
      accessorKey: 'image',
      accessorFn: (row) => {
        return row.user?.image ?? ''
      },
      header: ({ column }) => {
        return <DataTableColumnHeader column={column} title="Image" />
      },
      cell: ({ row }) => {
        const imageUrl = row.getValue('image') as string
        return (
          <>
            {imageUrl ? (
              <a href={imageUrl} target="_blank">
                <div className="w-10 h-10 relative">
                  <UserAvatar src={imageUrl} alt={row.getValue('userName')} />
                </div>
              </a>
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-300" />
            )}
          </>
        )
      },
    },
    {
      accessorKey: 'refreshToken',
      accessorFn: (row) => row.refreshToken,
      header: ({ column }) => {
        return <DataTableColumnHeader column={column} title="Refresh Token" />
      },
      cell: ({ row }) => (
        <div className="">{row.getValue('refreshToken') ?? 'Null'}</div>
      ),
    },
    {
      accessorKey: 'idToken',
      accessorFn: (row) => row.idToken,
      header: ({ column }) => {
        return <DataTableColumnHeader column={column} title="Id Token" />
      },
      cell: ({ row }) => (
        <div className="truncate w-64">{row.getValue('idToken') ?? 'Null'}</div>
      ),
    },
    {
      accessorKey: 'accessTokenExpiresAt',
      accessorFn: (row) => row.accessTokenExpiresAt,
      header: ({ column }) => {
        return (
          <DataTableColumnHeader
            column={column}
            title="Access Token Expires At"
          />
        )
      },
      cell: ({ row }) => (
        <div className="">
          {row.getValue('accessTokenExpiresAt')
            ? new Date(row.getValue('accessTokenExpiresAt')).toLocaleString()
            : 'Null'}
        </div>
      ),
    },
    {
      accessorKey: 'refreshTokenExpiresAt',
      accessorFn: (row) => row.refreshTokenExpiresAt,
      header: ({ column }) => {
        return (
          <DataTableColumnHeader
            column={column}
            title="Refresh Token Expires At"
          />
        )
      },
      cell: ({ row }) => (
        <div className="">
          {row.getValue('refreshTokenExpiresAt')
            ? new Date(row.getValue('refreshTokenExpiresAt')).toLocaleString()
            : 'Null'}
        </div>
      ),
    },
    {
      accessorKey: 'scope',
      accessorFn: (row) => row.scope,
      header: ({ column }) => {
        return <DataTableColumnHeader column={column} title="Scope" />
      },
      cell: ({ row }) => (
        <div className="">{row.getValue('scope') ?? 'Null'}</div>
      ),
    },
    {
      accessorKey: 'createdAt',
      accessorFn: (row) => row.createdAt,
      header: ({ column }) => {
        return <DataTableColumnHeader column={column} title="Created At" />
      },
      cell: ({ row }) => (
        <div className="">
          {row.getValue('createdAt')
            ? new Date(row.getValue('createdAt')).toLocaleString()
            : 'Null'}
        </div>
      ),
    },
    {
      accessorKey: 'updatedAt',
      accessorFn: (row) => row.updatedAt,
      header: ({ column }) => {
        return <DataTableColumnHeader column={column} title="Updated At" />
      },
      cell: ({ row }) => (
        <div className="">
          {row.getValue('updatedAt')
            ? new Date(row.getValue('updatedAt')).toLocaleString()
            : 'Null'}
        </div>
      ),
    },
  ]

  const table = useReactTable({
    data: unified ?? [],
    columns,
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
  })

  const deleteAccount = useMutation({
    mutationKey: ['delete-account'],
    mutationFn: deleteAccountFn,
    onMutate: () => {
      toast.loading('Deleting account...', {
        id: 'delete-account',
      })
    },

    onError: (error) => {
      toast.dismiss('delete-account')
      toast.error('Failed to delete account', {
        description: error.message,
      })
      // console.log(error.message);
    },
    onSuccess() {
      toast.dismiss('delete-account')
      toast.success(`Account deleted successfully`)
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['accounts'],
      })
    },
  })

  const deleteAccountsByMany = useMutation({
    mutationKey: ['delete-accounts'],
    mutationFn: deleteAccountsByManyFn,
    onMutate: () => {
      toast.loading('Deleting accounts...', {
        id: 'delete-accounts',
      })
    },
    onError: (error) => {
      toast.dismiss('delete-accounts')
      toast.error('Failed to delete accounts', {
        description: error.message,
      })
      // console.log(error.message);
    },
    onSuccess(data, variables) {
      toast.dismiss('delete-accounts')
      toast.success(
        `Deleted ${variables.data.accountIds.length} accounts successfully`,
      )
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['accounts'],
      })
      table.resetRowSelection()
    },
  })

  return (
    <div className="w-full">
      <div className="flex flex-wrap sm:flex-nowrap gap-3 items-center py-4">
        <div className="flex flex-wrap sm:flex-nowrap gap-2 w-full md:w-auto">
          <Input
            placeholder="Filter..."
            value={
              (table.getColumn(filterColumn)?.getFilterValue() as string) ?? ''
            }
            onChange={(event) =>
              table.getColumn(filterColumn)?.setFilterValue(event.target.value)
            }
            className="max-w-sm w-full"
          />
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-fit cursor-pointer">
                  <ListFilter />
                  <span className="">Filter:</span>
                  <span className="capitalize">{filterColumn}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="bg-transparent! backdrop-glass-lg"
                align="end"
              >
                <DropdownMenuLabel>Columns</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer hover:bg-white/20!"
                  onClick={() => {
                    setFilterColumn('id')
                    table.getColumn('id')?.setFilterValue('')
                    table.resetColumnFilters()
                  }}
                >
                  Id
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer hover:bg-white/20!"
                  onClick={() => {
                    setFilterColumn('accountId')
                    table.getColumn('accountId')?.setFilterValue('')
                    table.resetColumnFilters()
                  }}
                >
                  Account Id
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer hover:bg-white/20!"
                  onClick={() => {
                    setFilterColumn('providerId')
                    table.getColumn('providerId')?.setFilterValue('')
                    table.resetColumnFilters()
                  }}
                >
                  Provider Id
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer hover:bg-white/20!"
                  onClick={() => {
                    setFilterColumn('userId')
                    table.getColumn('userId')?.setFilterValue('')
                    table.resetColumnFilters()
                  }}
                >
                  User Id
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer hover:bg-white/20!"
                  onClick={() => {
                    setFilterColumn('userName')
                    table.getColumn('userName')?.setFilterValue('')
                    table.resetColumnFilters()
                  }}
                >
                  User Name
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer hover:bg-white/20!"
                  onClick={() => {
                    setFilterColumn('userEmail')
                    table.getColumn('userEmail')?.setFilterValue('')
                    table.resetColumnFilters()
                  }}
                >
                  User Email
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <Button
            variant="outline"
            className={cn(
              'cursor-pointer w-fit',
              isFetching && 'cursor-not-allowed',
            )}
            disabled={isFetching}
            onClick={() => queryClient.invalidateQueries()}
          >
            <RefreshCw
              className={cn('w-4 h-4', {
                'animate-spin': isFetching,
              })}
            />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="relative cursor-pointer"
                disabled={isFetching}
              >
                <IconTableExport />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="bg-transparent backdrop-glass-lg"
              align="end"
            >
              <DropdownMenuItem
                className="cursor-pointer hover:bg-white/20!"
                onClick={() => {
                  exportCurrentPageToXlsx(table, 'accounts.xlsx')
                }}
              >
                <IconFileExport />
                Export current rows to .xlsx
              </DropdownMenuItem>
              {table.getFilteredSelectedRowModel().rows.length ? (
                <DropdownMenuItem
                  className="cursor-pointer hover:bg-white/20!"
                  onClick={() => {
                    exportFilteredRowsToXlsx(table, 'accounts.xlsx')
                  }}
                >
                  <IconFileExport />
                  Export selected to .xlsx
                </DropdownMenuItem>
              ) : null}
              <DropdownMenuItem
                className="cursor-pointer hover:bg-white/20!"
                onClick={() => {
                  exportAllToXlsx(table, 'accounts.xlsx')
                }}
              >
                <IconFileExport />
                Export all rows to .xlsx
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {table.getFilteredSelectedRowModel().rows.length ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="relative cursor-pointer"
                  disabled={isFetching}
                >
                  <div
                    className={cn(
                      'absolute -top-1 -right-1 w-4 h-4 border rounded-full bg-white text-black flex justify-center items-center',
                      {
                        'w-6':
                          table.getFilteredSelectedRowModel().rows.length > 9,
                        'w-7':
                          table.getFilteredSelectedRowModel().rows.length > 99,
                      },
                    )}
                  >
                    <p>{table.getFilteredSelectedRowModel().rows.length}</p>
                  </div>
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="bg-transparent backdrop-glass-lg"
                align="end"
              >
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer hover:bg-white/20!"
                  onClick={() => {
                    exportFilteredRowsToXlsx(table, 'accounts.xlsx')
                  }}
                >
                  <IconFileExport />
                  Export selected to .xlsx
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  className="cursor-pointer"
                  onClick={() => {
                    const accountIds = table
                      .getFilteredSelectedRowModel()
                      .rows.map((row) => row.original.id)
                    deleteAccountsByMany.mutate({
                      data: {
                        accountIds: accountIds,
                      },
                    })
                  }}
                >
                  Delete {table.getFilteredSelectedRowModel().rows.length}{' '}
                  accounts
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </div>
        <DataTableViewOptions table={table} />
      </div>
      <div className="overflow-x-auto rounded-md border mb-2">
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
                            header.getContext(),
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  <span className="flex justify-center items-center">
                    <Loader2 className="animate-spin w-6 h-6" />
                  </span>
                </TableCell>
              </TableRow>
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
      <DataTablePagination table={table} />
    </div>
  )
}
