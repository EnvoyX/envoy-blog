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
import { DataTablePagination } from '@/components/ui/data-table-pagination'
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header'
import { DataTableViewOptions } from '@/components/ui/data-table-view-options'
import { cn } from '@/lib/utils'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { IconFileExport, IconTableExport } from '@tabler/icons-react'
import {
  exportAllToXlsx,
  exportCurrentPageToXlsx,
  exportFilteredRowsToXlsx,
} from '@/utils/xlsx'
import {
  deleteSessionFn,
  deleteSessionsByManyFn,
  getSessionsFn,
} from '@/data/admin'
import { UserAvatar } from '../user-profile'

export default function SessionsDataTable() {
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
    data: sessions,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ['sessions'],
    queryFn: async () => {
      const data = await getSessionsFn()
      return data
    },
  })
  const unified = React.useMemo(() => {
    if (!sessions) return []

    return sessions
  }, [sessions])

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
                  deleteSession.mutate({
                    data: {
                      sessionId: item.id,
                    },
                  })
                }
              >
                Delete Session
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {/*<DropdownMenuItem className="cursor-pointer hover:bg-white/20!">
                <Link
                  href={`/admin/users/${item.userId}`}
                  target="_blank"
                  className="w-full"
                >
                  View User
                </Link>
              </DropdownMenuItem>*/}
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
      accessorKey: 'token',
      accessorFn: (row) => row.token,
      header: ({ column }) => {
        return <DataTableColumnHeader column={column} title="Token" />
      },
      cell: ({ row }) => <div className="">{row.getValue('token')}</div>,
    },
    {
      accessorKey: 'expiresAt',
      accessorFn: (row) => row.expiresAt,
      header: ({ column }) => {
        return <DataTableColumnHeader column={column} title="Expires At" />
      },
      cell: ({ row }) => (
        <div className="">
          {row.getValue('expiresAt')
            ? new Date(row.getValue('expiresAt')).toLocaleString()
            : 'Null'}
        </div>
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
      accessorKey: 'userAgent',
      accessorFn: (row) => row.userAgent,
      header: ({ column }) => {
        return <DataTableColumnHeader column={column} title="User Agent" />
      },
      cell: ({ row }) => <div className="">{row.getValue('userAgent')}</div>,
    },
    {
      accessorKey: 'ipAddress',
      accessorFn: (row) => row.ipAddress,
      header: ({ column }) => {
        return <DataTableColumnHeader column={column} title="IP Address" />
      },
      cell: ({ row }) => <div className="">{row.getValue('ipAddress')}</div>,
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

  const deleteSession = useMutation({
    mutationKey: ['delete-session'],
    mutationFn: deleteSessionFn,
    onMutate: () => {
      toast.loading('Deleting session...', {
        id: 'delete-session',
      })
    },

    onError: (error) => {
      toast.dismiss('delete-session')
      toast.error('Failed to delete session', {
        description: error.message,
      })
      // console.log(error.message);
    },
    onSuccess() {
      toast.dismiss('delete-session')
      toast.success(`Session deleted successfully`)
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['sessions'],
      })
    },
  })

  const deleteSessionsByMany = useMutation({
    mutationKey: ['delete-sessions'],
    mutationFn: deleteSessionsByManyFn,
    onMutate: () => {
      toast.loading('Deleting sessions...', {
        id: 'delete-sessions',
      })
    },
    onError: (error) => {
      toast.dismiss('delete-sessions')
      toast.error('Failed to delete sessions', {
        description: error.message,
      })
      // console.log(error.message);
    },
    onSuccess(data, variables) {
      toast.dismiss('delete-sessions')
      toast.success(
        `Deleted ${variables.data.sessionIds.length} sessions successfully`,
      )
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['sessions'],
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
                className="bg-transparent! backdrop-glass-xl"
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
                    setFilterColumn('token')
                    table.getColumn('token')?.setFilterValue('')
                    table.resetColumnFilters()
                  }}
                >
                  Token
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
              className="bg-transparent backdrop-glass-xl"
              align="end"
            >
              <DropdownMenuItem
                className="cursor-pointer hover:bg-white/20!"
                onClick={() => {
                  exportCurrentPageToXlsx(table, 'sessions.xlsx')
                }}
              >
                <IconFileExport />
                Export current rows to .xlsx
              </DropdownMenuItem>
              {table.getFilteredSelectedRowModel().rows.length ? (
                <DropdownMenuItem
                  className="cursor-pointer hover:bg-white/20!"
                  onClick={() => {
                    exportFilteredRowsToXlsx(table, 'sessions.xlsx')
                  }}
                >
                  <IconFileExport />
                  Export selected to .xlsx
                </DropdownMenuItem>
              ) : null}
              <DropdownMenuItem
                className="cursor-pointer hover:bg-white/20!"
                onClick={() => {
                  exportAllToXlsx(table, 'sessions.xlsx')
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
                className="bg-transparent backdrop-glass-xl"
                align="end"
              >
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer hover:bg-white/20!"
                  onClick={() => {
                    exportFilteredRowsToXlsx(table, 'sessions.xlsx')
                  }}
                >
                  <IconFileExport />
                  Export selected to .xlsx
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  className="cursor-pointer"
                  onClick={() => {
                    const sessionIds = table
                      .getFilteredSelectedRowModel()
                      .rows.map((row) => row.original.id)
                    deleteSessionsByMany.mutate({
                      data: {
                        sessionIds,
                      },
                    })
                  }}
                >
                  Delete {table.getFilteredSelectedRowModel().rows.length}{' '}
                  sessions
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
