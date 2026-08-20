import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { type ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTable } from '@/components/ui/data-table';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { DataTableFeatures } from '@/components/ui/data-table-features';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { deleteUserFn, getUsersFn, updateUserRoleFn } from '@/data/admin';
import { UserRole } from '@/generated/prisma/enums';
import { authClient } from '@/lib/auth-client';

import { UserAvatar } from '../user-profile';

const userRoles = ['ADMIN', 'SUPERADMIN', 'USER'];

export function UsersDataTable() {
  const { data: session } = useQuery({
    queryKey: ['session-user'],
    queryFn: async () => {
      const data = await authClient.getSession();
      if (data) return data.data;
      return null;
    },
  });
  const queryClient = useQueryClient();
  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const data = await getUsersFn();
      return data;
    },
  });
  const unified = React.useMemo(() => {
    if (!users) return [];

    return users;
  }, [users]);

  // type of array
  // type Unified = typeof unified

  // type of one array element
  type Unified = (typeof unified)[number];

  const columns: ColumnDef<DataTableFeatures, Unified>[] = [
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
        const item = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 cursor-pointer">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-transparent! backdrop-glass-lg" align="end">
              <DropdownMenuLabel>
                Actions for <span className="font-bold">{item.name}</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer hover:bg-white/20!"
                onClick={() => {
                  navigator.clipboard.writeText(item.id);
                  toast.success('User ID copied to clipboard');
                }}
              >
                Copy user ID
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer hover:bg-white/20!"
                onClick={() => {
                  navigator.clipboard.writeText(item.email);
                  toast.success('Email copied to clipboard');
                }}
              >
                Copy email
              </DropdownMenuItem>

              {session?.user?.role === 'SUPERADMIN' && item.role !== 'SUPERADMIN' && (
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
                {item.id === session?.user.id ? 'You cannot delete yourself' : 'Delete User'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer hover:bg-white/20!">
                <Link
                  to="/user/$userId"
                  params={{
                    userId: item.id,
                  }}
                  target="_blank"
                  className="w-full"
                >
                  View User
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
    {
      accessorKey: 'id',
      accessorFn: (row) => {
        const user = users?.find((user) => user.id === row.id);
        return user?.id ?? '';
      },
      header: ({ column }) => {
        return <DataTableColumnHeader column={column} title="User Id" />;
      },
      cell: ({ row }) => <span className="capitalize">{row.getValue('id')}</span>,
      filterFn: 'includesString',
    },
    {
      accessorKey: 'role',
      accessorFn: (row) => {
        const user = users?.find((user) => user.id === row.id);
        return user?.role ?? '';
      },
      header: ({ column }) => {
        return <DataTableColumnHeader column={column} title="Role" />;
      },
      cell: ({ row }) => <span>{row.getValue('role')}</span>,
      filterFn: 'includesString',
    },
    {
      accessorKey: 'name',
      header: ({ column }) => {
        return <DataTableColumnHeader column={column} title="Name" />;
      },
      cell: ({ row }) => <span className="capitalize">{row.getValue('name')}</span>,
      filterFn: 'includesString',
    },
    {
      accessorKey: 'email',
      accessorFn: (row) => {
        const user = users?.find((user) => user.id === row.id);
        return user?.email ?? '';
      },
      header: ({ column }) => {
        return <DataTableColumnHeader column={column} title="Email" />;
      },
      cell: ({ row }) => <span className="lowercase">{row.getValue('email')}</span>,
      filterFn: 'includesString',
    },
    {
      accessorKey: 'emailVerified',
      header: ({ column }) => {
        return <DataTableColumnHeader column={column} title="Email Verified" />;
      },
      accessorFn: (row) => {
        const user = users?.find((user) => user.id === row.id);
        return user?.emailVerified ? 'Verified' : 'Not Verified';
      },
      cell: ({ row }) => <span>{row.getValue('emailVerified')}</span>,
      filterFn: 'includesString',
    },
    {
      accessorKey: 'image',
      accessorFn: (row) => {
        const user = users?.find((user) => user.id === row.id);
        return user?.image ?? '';
      },
      header: ({ column }) => {
        return <DataTableColumnHeader column={column} title="Image" />;
      },
      cell: ({ row }) => {
        const imageUrl = row.getValue('image') as string;
        return (
          <>
            {imageUrl ? (
              <a href={imageUrl} target="_blank">
                <div className="w-10 h-10 relative">
                  <UserAvatar src={imageUrl} alt={row.getValue('name')} />
                </div>
              </a>
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-300" />
            )}
          </>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      accessorFn: (row) => {
        const user = users?.find((user) => user.id === row.id);
        return user?.createdAt
          ? new Date(user.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })
          : 'Not set';
      },
      header: ({ column }) => {
        return <DataTableColumnHeader column={column} title="Created At" />;
      },
      cell: ({ row }) => {
        return <span>{row.getValue('createdAt')}</span>;
      },
    },
  ];

  const updateUserRole = useMutation({
    mutationKey: ['update-user-role'],
    mutationFn: updateUserRoleFn,
    onMutate: () => {
      toast.loading('Updating user role...', {
        id: 'update-user-role',
      });
    },
    onError: (error) => {
      toast.dismiss('update-user-role');
      toast.error('Failed to update user role', {
        description: error.message,
      });
      // console.log(error.message);
    },
    onSuccess() {
      toast.success('User role updated successfully', {
        id: 'update-user-role',
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['users'],
      });
    },
  });

  const deleteUser = useMutation({
    mutationKey: ['delete-user'],
    mutationFn: deleteUserFn,
    onMutate: () => {
      toast.loading('Deleting user...', {
        id: 'delete-user',
      });
    },

    onError: (error) => {
      toast.dismiss('delete-user');
      toast.error('Failed to delete user', {
        description: error.message,
      });
      // console.log(error.message);
    },
    onSuccess() {
      toast.dismiss('delete-user');
      toast.success(`User deleted successfully`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['users'],
      });
    },
  });

  return (
    <div className="w-full">
      <DataTable columns={columns} data={unified || []} />
    </div>
  );
}
