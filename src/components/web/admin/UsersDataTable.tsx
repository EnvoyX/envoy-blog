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
import {
  BadgeCheckIcon,
  Clock,
  ListFilter,
  Loader2,
  MoreHorizontal,
  RefreshCw,
} from 'lucide-react'

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
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header'
import { DataTablePagination } from '@/components/ui/data-table-pagination'
import { DataTableViewOptions } from '@/components/ui/data-table-view-options'
import { toast } from 'sonner'
import { IconFileExport, IconTableExport } from '@tabler/icons-react'
import {
  exportAllToXlsx,
  exportCurrentPageToXlsx,
  exportFilteredRowsToXlsx,
} from '@/utils/xlsx'
import { authClient } from '@/lib/auth-client'
import {
  deleteUserFn,
  deleteUsersByManyFn,
  getUsersFn,
  updateUserRoleByManyFn,
  updateUserRoleFn,
} from '@/data/admin'
import { UserAvatar } from '../user-profile'
import { UserRole } from '@/generated/prisma/enums'

const userRoles = ['ADMIN', 'SUPERADMIN', 'USER']

export function UsersDataTable() {
  const {
    data: session,
    isFetched,
    isPending,
  } = useQuery({
    queryKey: ['session-user'],
    queryFn: async () => {
      const data = await authClient.getSession()
      if (data) return data.data
      return null
    },
  })
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  )
  const [filterColumn, setFilterColumn] = React.useState<string>('email')
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const queryClient = useQueryClient()
  const {
    data: users,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const data = await getUsersFn()
      return data
    },
  })
  const unified = React.useMemo(() => {
    if (!users) return []

    return users
  }, [users])

  // type of array
  // type Unified = typeof unified

  // type of one array element
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
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
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
              <Button variant="ghost" className="h-8 w-8 p-0 cursor-pointer">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="bg-transparent! backdrop-glass-lg"
              align="end"
            >
              <DropdownMenuLabel>
                Actions for <span className="font-bold">{item.name}</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer hover:bg-white/20!"
                onClick={() => {
                  navigator.clipboard.writeText(item.id)
                  toast.success('User ID copied to clipboard')
                }}
              >
                Copy user ID
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer hover:bg-white/20!"
                onClick={() => {
                  navigator.clipboard.writeText(item.email)
                  toast.success('Email copied to clipboard')
                }}
              >
                Copy email
              </DropdownMenuItem>

              {session?.user?.role === 'SUPERADMIN' &&
                item.role !== 'SUPERADMIN' && (
                  <>
                    {userRoles
                      .filter((role) => role !== item.role)
                      .map((role) => (
                        <DropdownMenuItem
                          key={role}
                          className="cursor-pointer text-yellow-500 hover:text-yellow-500! hover:bg-yellow-900/60!"
                          onClick={() =>
                            updateUserRole.mutate({
                              data: {
                                userId: item.id,
                                role: role as UserRole,
                              },
                            })
                          }
                        >
                          Update role to {role}
                        </DropdownMenuItem>
                      ))}
                  </>
                )}
              <DropdownMenuItem
                className="cursor-pointer text-red-500"
                onClick={() =>
                  deleteUser.mutate({
                    data: {
                      userId: item.id,
                      role: item.role as UserRole,
                    },
                  })
                }
                variant="destructive"
                disabled={item.id === session?.user.id}
              >
                {item.id === session?.user.id
                  ? 'You cannot delete yourself'
                  : 'Delete User'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {/*<DropdownMenuItem className="cursor-pointer hover:bg-white/20!">
                <Link
                  href={`/admin/users/${item.id}`}
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
      accessorFn: (row) => {
        const user = users?.find((user) => user.id === row.id)
        return user?.id ?? ''
      },
      header: ({ column }) => {
        return <DataTableColumnHeader column={column} title="User Id" />
      },
      cell: ({ row }) => (
        <span className="capitalize">{row.getValue('id')}</span>
      ),
      filterFn: 'includesString',
    },
    {
      accessorKey: 'role',
      accessorFn: (row) => {
        const user = users?.find((user) => user.id === row.id)
        return user?.role ?? ''
      },
      header: ({ column }) => {
        return <DataTableColumnHeader column={column} title="Role" />
      },
      cell: ({ row }) => <span>{row.getValue('role')}</span>,
      filterFn: 'includesString',
    },
    {
      accessorKey: 'name',
      header: ({ column }) => {
        return <DataTableColumnHeader column={column} title="Name" />
      },
      cell: ({ row }) => (
        <span className="capitalize">{row.getValue('name')}</span>
      ),
      filterFn: 'includesString',
    },
    {
      accessorKey: 'email',
      accessorFn: (row) => {
        const user = users?.find((user) => user.id === row.id)
        return user?.email ?? ''
      },
      header: ({ column }) => {
        return <DataTableColumnHeader column={column} title="Email" />
      },
      cell: ({ row }) => (
        <span className="lowercase">{row.getValue('email')}</span>
      ),
      filterFn: 'includesString',
    },
    {
      accessorKey: 'emailVerified',
      header: ({ column }) => {
        return <DataTableColumnHeader column={column} title="Email Verified" />
      },
      accessorFn: (row) => {
        const user = users?.find((user) => user.id === row.id)
        return user?.emailVerified ? 'Verified' : 'Not Verified'
      },
      cell: ({ row }) => <span>{row.getValue('emailVerified')}</span>,
      filterFn: 'includesString',
    },
    {
      accessorKey: 'image',
      accessorFn: (row) => {
        const user = users?.find((user) => user.id === row.id)
        return user?.image ?? ''
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
      accessorKey: 'createdAt',
      accessorFn: (row) => {
        const user = users?.find((user) => user.id === row.id)
        return user?.createdAt
          ? new Date(user.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })
          : 'Not set'
      },
      header: ({ column }) => {
        return <DataTableColumnHeader column={column} title="Created At" />
      },
      cell: ({ row }) => {
        return <span>{row.getValue('createdAt')}</span>
      },
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

  const updateUserRole = useMutation({
    mutationKey: ['update-user-role'],
    mutationFn: updateUserRoleFn,
    onMutate: () => {
      toast.loading('Updating user role...', {
        id: 'update-user-role',
      })
    },
    onError: (error) => {
      toast.dismiss('update-user-role')
      toast.error('Failed to update user role', {
        description: error.message,
      })
      // console.log(error.message);
    },
    onSuccess() {
      toast.success('User role updated successfully', {
        id: 'update-user-role',
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['users'],
      })
    },
  })
  const updateUserRoleByMany = useMutation({
    mutationKey: ['update-user-role-by-many'],
    mutationFn: updateUserRoleByManyFn,
    onMutate: () => {
      toast.loading('Updating users role...', {
        id: 'update-user-role',
      })
    },
    onError: (error) => {
      toast.dismiss('update-user-role')
      toast.error('Failed to update users role', {
        description: error.message,
      })
      // console.log(error.message);
    },
    onSuccess(data, variables) {
      toast.dismiss('update-user-role')
      toast.success(
        `User role updated successfully for ${variables.data.userIds.length} users`,
      )
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['users'],
      })
      table.resetRowSelection()
    },
  })

  const deleteUser = useMutation({
    mutationKey: ['delete-user'],
    mutationFn: deleteUserFn,
    onMutate: () => {
      toast.loading('Deleting user...', {
        id: 'delete-user',
      })
    },

    onError: (error) => {
      toast.dismiss('delete-user')
      toast.error('Failed to delete user', {
        description: error.message,
      })
      // console.log(error.message);
    },
    onSuccess() {
      toast.dismiss('delete-user')
      toast.success(`User deleted successfully`)
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['users'],
      })
    },
  })

  const deleteUserByMany = useMutation({
    mutationKey: ['delete-users'],
    mutationFn: deleteUsersByManyFn,
    onMutate: () => {
      toast.loading('Deleting users...', {
        id: 'delete-user',
      })
    },
    onError: (error) => {
      toast.dismiss('delete-user')
      toast.error('Failed to delete users', {
        description: error.message,
      })
      // console.log(error.message);
    },
    onSuccess(data, variables) {
      toast.dismiss('delete-user')
      toast.success(
        `Deleted ${variables.data.userIds.length} users successfully`,
      )
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['users'],
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
                    setFilterColumn('verifiedStatus')
                    table.getColumn('verifiedStatus')?.setFilterValue('')
                    table.resetColumnFilters()
                  }}
                >
                  Verified Status
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer hover:bg-white/20!"
                  onClick={() => {
                    setFilterColumn('id')
                    table.getColumn('id')?.setFilterValue('')
                    table.resetColumnFilters()
                  }}
                >
                  User Id
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer hover:bg-white/20!"
                  onClick={() => {
                    setFilterColumn('name')
                    table.getColumn('name')?.setFilterValue('')
                    table.resetColumnFilters()
                  }}
                >
                  Name
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer hover:bg-white/20!"
                  onClick={() => {
                    setFilterColumn('email')
                    table.getColumn('email')?.setFilterValue('')
                    table.resetColumnFilters()
                  }}
                >
                  Email
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer hover:bg-white/20!"
                  onClick={() => {
                    setFilterColumn('phoneNumber')
                    table.getColumn('phoneNumber')?.setFilterValue('')
                    table.resetColumnFilters()
                  }}
                >
                  Phone Number
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer hover:bg-white/20!"
                  onClick={() => {
                    setFilterColumn('institution')
                    table.getColumn('institution')?.setFilterValue('')
                    table.resetColumnFilters()
                  }}
                >
                  Institution
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer hover:bg-white/20!"
                  onClick={() => {
                    setFilterColumn('major')
                    table.getColumn('major')?.setFilterValue('')
                    table.resetColumnFilters()
                  }}
                >
                  Major
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer hover:bg-white/20!"
                  onClick={() => {
                    setFilterColumn('domicile')
                    table.getColumn('domicile')?.setFilterValue('')
                    table.resetColumnFilters()
                  }}
                >
                  Domicile
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer hover:bg-white/20!"
                  onClick={() => {
                    setFilterColumn('education')
                    table.getColumn('education')?.setFilterValue('')
                    table.resetColumnFilters()
                  }}
                >
                  Education
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer hover:bg-white/20!"
                  onClick={() => {
                    setFilterColumn('role')
                    table.getColumn('role')?.setFilterValue('')
                    table.resetColumnFilters()
                  }}
                >
                  Role
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer hover:bg-white/20!"
                  onClick={() => {
                    setFilterColumn('comp_registration')
                    table.getColumn('comp_registration')?.setFilterValue('')
                    table.resetColumnFilters()
                  }}
                >
                  Competition
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer hover:bg-white/20!"
                  onClick={() => {
                    setFilterColumn('userRegisteredTeam')
                    table.getColumn('userRegisteredTeam')?.setFilterValue('')
                    table.resetColumnFilters()
                  }}
                >
                  User Registered Team
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
                  exportCurrentPageToXlsx(table, 'users.xlsx')
                }}
              >
                <IconFileExport />
                Export current rows to .xlsx
              </DropdownMenuItem>
              {table.getFilteredSelectedRowModel().rows.length ? (
                <DropdownMenuItem
                  className="cursor-pointer hover:bg-white/20!"
                  onClick={() => {
                    exportFilteredRowsToXlsx(table, 'users.xlsx')
                  }}
                >
                  <IconFileExport />
                  Export selected to .xlsx
                </DropdownMenuItem>
              ) : null}
              <DropdownMenuItem
                className="cursor-pointer hover:bg-white/20!"
                onClick={() => {
                  exportAllToXlsx(table, 'users.xlsx')
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
                    exportFilteredRowsToXlsx(table, 'users.xlsx')
                  }}
                >
                  <IconFileExport />
                  Export selected to .xlsx
                </DropdownMenuItem>
                {session?.user.role === 'SUPERADMIN' && (
                  <>
                    <DropdownMenuItem
                      onClick={() => {
                        const userIds = table
                          .getFilteredSelectedRowModel()
                          .rows.map((row) => row.original.id)
                        updateUserRoleByMany.mutate({
                          data: {
                            userIds,
                            role: 'USER',
                          },
                        })
                      }}
                      className="cursor-pointer text-yellow-500 hover:text-yellow-500! hover:bg-yellow-900/60!"
                    >
                      Update {table.getFilteredSelectedRowModel().rows.length}{' '}
                      user&apos;ss role to USER
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        const userIds = table
                          .getFilteredSelectedRowModel()
                          .rows.map((row) => row.original.id)
                        updateUserRoleByMany.mutate({
                          data: {
                            userIds,
                            role: 'ADMIN',
                          },
                        })
                      }}
                      className="cursor-pointer text-yellow-500 hover:text-yellow-500! hover:bg-yellow-900/60!"
                    >
                      Update {table.getFilteredSelectedRowModel().rows.length}{' '}
                      user&apos;ss role to ADMIN
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => {
                    const userIds = table
                      .getFilteredSelectedRowModel()
                      .rows.map((row) => row.original.id)
                    const roles = table
                      .getFilteredSelectedRowModel()
                      .rows.map((row) => row.original.role)
                    deleteUserByMany.mutate({
                      data: {
                        userIds,
                        roles,
                      },
                    })
                  }}
                  className="cursor-pointer"
                >
                  Delete {table.getFilteredSelectedRowModel().rows.length} users
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </div>

        <DataTableViewOptions table={table} />
      </div>
      <div className="w-full overflow-x-auto rounded-md border mb-2">
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
