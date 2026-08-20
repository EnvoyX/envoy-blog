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
import { deleteAccountFn, getAccountsFn } from '@/data/admin';

import { UserAvatar } from '../user-profile';

export default function AccountsDataTable() {
  const queryClient = useQueryClient();
  const { data: accounts } = useQuery({
    queryKey: ['accounts'],
    queryFn: async () => {
      const data = await getAccountsFn();
      return data;
    },
  });
  const unified = React.useMemo(() => {
    if (!accounts) return [];

    return accounts;
  }, [accounts]);

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
        const item = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-transparent! backdrop-glass-lg" align="end">
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
        );
      },
    },
    {
      accessorKey: 'id',
      accessorFn: (row) => row.id,
      header: ({ column }) => {
        return <DataTableColumnHeader column={column} title="Id" />;
      },
      cell: ({ row }) => <div className="">{row.getValue('id')}</div>,
    },
    {
      accessorKey: 'accountId',
      accessorFn: (row) => row.accountId,
      header: ({ column }) => {
        return <DataTableColumnHeader column={column} title="Account Id" />;
      },
      cell: ({ row }) => <div className="">{row.getValue('accountId')}</div>,
    },
    {
      accessorKey: 'providerId',
      accessorFn: (row) => row.providerId,
      header: ({ column }) => {
        return <DataTableColumnHeader column={column} title="Provider Id" />;
      },
      cell: ({ row }) => <div className="capitalize">{row.getValue('providerId')}</div>,
    },
    {
      accessorKey: 'userId',
      accessorFn: (row) => row.userId,
      header: ({ column }) => {
        return <DataTableColumnHeader column={column} title="User Id" />;
      },
      cell: ({ row }) => <div className="">{row.getValue('userId')}</div>,
    },
    {
      accessorKey: 'userName',
      accessorFn: (row) => {
        return row.user?.name ?? '';
      },
      header: ({ column }) => {
        return <DataTableColumnHeader column={column} title="Name" />;
      },
      cell: ({ row }) => <span className="capitalize">{row.getValue('userName')}</span>,
      filterFn: 'includesString',
    },
    {
      accessorKey: 'userEmail',
      accessorFn: (row) => {
        return row.user?.email ?? '';
      },
      header: ({ column }) => {
        return <DataTableColumnHeader column={column} title="Email" />;
      },
      cell: ({ row }) => <span className="lowercase">{row.getValue('userEmail')}</span>,
      filterFn: 'includesString',
    },
    {
      accessorKey: 'emailVerified',
      header: ({ column }) => {
        return <DataTableColumnHeader column={column} title="Email Verified" />;
      },
      accessorFn: (row) => {
        return row.user?.emailVerified ? 'True' : 'False';
      },
      cell: ({ row }) => <span>{row.getValue('emailVerified')}</span>,
      filterFn: 'includesString',
    },
    {
      accessorKey: 'image',
      accessorFn: (row) => {
        return row.user?.image ?? '';
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
                  <UserAvatar src={imageUrl} alt={row.getValue('userName')} />
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
      accessorKey: 'refreshToken',
      accessorFn: (row) => row.refreshToken,
      header: ({ column }) => {
        return <DataTableColumnHeader column={column} title="Refresh Token" />;
      },
      cell: ({ row }) => <div className="">{row.getValue('refreshToken') ?? 'Null'}</div>,
    },
    {
      accessorKey: 'idToken',
      accessorFn: (row) => row.idToken,
      header: ({ column }) => {
        return <DataTableColumnHeader column={column} title="Id Token" />;
      },
      cell: ({ row }) => <div className="truncate w-64">{row.getValue('idToken') ?? 'Null'}</div>,
    },
    {
      accessorKey: 'accessTokenExpiresAt',
      accessorFn: (row) => row.accessTokenExpiresAt,
      header: ({ column }) => {
        return <DataTableColumnHeader column={column} title="Access Token Expires At" />;
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
        return <DataTableColumnHeader column={column} title="Refresh Token Expires At" />;
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
        return <DataTableColumnHeader column={column} title="Scope" />;
      },
      cell: ({ row }) => <div className="">{row.getValue('scope') ?? 'Null'}</div>,
    },
    {
      accessorKey: 'createdAt',
      accessorFn: (row) => row.createdAt,
      header: ({ column }) => {
        return <DataTableColumnHeader column={column} title="Created At" />;
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
        return <DataTableColumnHeader column={column} title="Updated At" />;
      },
      cell: ({ row }) => (
        <div className="">
          {row.getValue('updatedAt')
            ? new Date(row.getValue('updatedAt')).toLocaleString()
            : 'Null'}
        </div>
      ),
    },
  ];

  const deleteAccount = useMutation({
    mutationKey: ['delete-account'],
    mutationFn: deleteAccountFn,
    onMutate: () => {
      toast.loading('Deleting account...', {
        id: 'delete-account',
      });
    },

    onError: (error) => {
      toast.dismiss('delete-account');
      toast.error('Failed to delete account', {
        description: error.message,
      });
      // console.log(error.message);
    },
    onSuccess() {
      toast.dismiss('delete-account');
      toast.success(`Account deleted successfully`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['accounts'],
      });
    },
  });

  return (
    <div className="w-full">
      <DataTable columns={columns} data={unified || []} />
    </div>
  );
}
