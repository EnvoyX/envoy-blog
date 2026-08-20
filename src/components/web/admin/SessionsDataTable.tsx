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
// import { exportAllToXlsx, exportCurrentPageToXlsx, exportFilteredRowsToXlsx } from '@/utils/xlsx';
import { deleteSessionFn, getSessionsFn } from '@/data/admin';

import { UserAvatar } from '../user-profile';

export default function SessionsDataTable() {
  const queryClient = useQueryClient();
  const { data: sessions } = useQuery({
    queryKey: ['sessions'],
    queryFn: async () => {
      const data = await getSessionsFn();
      return data;
    },
  });
  const unified = React.useMemo(() => {
    if (!sessions) return [];

    return sessions;
  }, [sessions]);

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
      accessorKey: 'token',
      accessorFn: (row) => row.token,
      header: ({ column }) => {
        return <DataTableColumnHeader column={column} title="Token" />;
      },
      cell: ({ row }) => <div className="">{row.getValue('token')}</div>,
    },
    {
      accessorKey: 'expiresAt',
      accessorFn: (row) => row.expiresAt,
      header: ({ column }) => {
        return <DataTableColumnHeader column={column} title="Expires At" />;
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
      accessorKey: 'userAgent',
      accessorFn: (row) => row.userAgent,
      header: ({ column }) => {
        return <DataTableColumnHeader column={column} title="User Agent" />;
      },
      cell: ({ row }) => <div className="">{row.getValue('userAgent')}</div>,
    },
    {
      accessorKey: 'ipAddress',
      accessorFn: (row) => row.ipAddress,
      header: ({ column }) => {
        return <DataTableColumnHeader column={column} title="IP Address" />;
      },
      cell: ({ row }) => <div className="">{row.getValue('ipAddress')}</div>,
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

  const deleteSession = useMutation({
    mutationKey: ['delete-session'],
    mutationFn: deleteSessionFn,
    onMutate: () => {
      toast.loading('Deleting session...', {
        id: 'delete-session',
      });
    },

    onError: (error) => {
      toast.dismiss('delete-session');
      toast.error('Failed to delete session', {
        description: error.message,
      });
      // console.log(error.message);
    },
    onSuccess() {
      toast.dismiss('delete-session');
      toast.success(`Session deleted successfully`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['sessions'],
      });
    },
  });

  return (
    <div className="w-full">
      <DataTable columns={columns} data={unified || []} />
    </div>
  );
}
