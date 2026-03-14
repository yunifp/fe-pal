import CustBreadcrumb from "@/components/CustBreadCrumb";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import useRedirectIfHasNotAccess from "@/hooks/useRedirectIfHasNotAccess";
import { menuService } from "@/services/menuService";
import { useMenuStore } from "@/stores/menuStore";
import type { IMenu } from "@/types/menu";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";

const RoleAccessPage = () => {
  useRedirectIfHasNotAccess("U");

  const { idRole } = useParams();
  const queryClient = useQueryClient();
  const setMenus = useMenuStore((state) => state.setMenus);

  const { data } = useQuery({
    queryKey: ["role_access", idRole],
    refetchOnWindowFocus: false,
    queryFn: () => menuService.getMenuAccess(parseInt(idRole ?? "")),
  });

  const result = data?.data;

  const mutation = useMutation({
    mutationFn: async ({
      idMenu,
      idRole,
      access,
    }: {
      idMenu: number;
      idRole: number;
      access: string;
    }) => {
      const response = await menuService.updateMenuAccess(
        idMenu,
        idRole,
        access
      );
      return response.data;
    },
    onSuccess: (updatedMenus) => {
      queryClient.invalidateQueries({ queryKey: ["role_access", idRole] });
      const menus = updatedMenus?.menus ?? [];
      if (updatedMenus?.update) {
        setMenus(menus);
      }
    },
  });

  const handleCheckboxChangeRecursive = (
    menuItems: IMenu[],
    menuId: number,
    permission: string,
    checked: boolean
  ) => {
    const findMenuById = (menus: IMenu[], id: number): IMenu | undefined => {
      for (const menu of menus) {
        if (menu.id === id) return menu;
        if (menu.children) {
          const found = findMenuById(menu.children, id);
          if (found) return found;
        }
      }
      return undefined;
    };

    const queue: IMenu[] = [];
    const menu = findMenuById(menuItems, menuId);

    if (!menu) return;

    queue.push(menu);

    while (queue.length > 0) {
      const current = queue.shift();
      if (!current) continue;

      let newAccess = current.access ? [...current.access] : [];

      if (checked) {
        if (!newAccess.includes(permission)) {
          newAccess.push(permission);
        }
      } else {
        newAccess = newAccess.filter((p) => p !== permission);
      }

      mutation.mutate({
        idMenu: current.id,
        idRole: Number(idRole),
        access: newAccess.join(""),
      });

      if (current.children && current.children.length > 0) {
        queue.push(...current.children);
      }
    }
  };

  const renderRows = (items: IMenu[], level = 0): React.ReactNode[] => {
    return items.flatMap((item) => {
      const row = (
        <TableRow key={item.id}>
          <TableCell className="text-center">
            <Checkbox
              checked={item.access !== null}
              onCheckedChange={(checked) =>
                handleCheckboxChangeRecursive(
                  result || [],
                  item.id,
                  "R",
                  checked === true
                )
              }
            />
          </TableCell>
          <TableCell
            className="font-medium"
            style={{ paddingLeft: level * 20 + 8 }}
          >
            {"-".repeat(level)}
            {item.nama}
          </TableCell>
          <TableCell className="text-center">
            <Checkbox
              checked={item.access?.includes("C") || false}
              onCheckedChange={(checked) =>
                handleCheckboxChangeRecursive(
                  result || [],
                  item.id,
                  "C",
                  checked === true
                )
              }
            />
          </TableCell>
          <TableCell className="text-center">
            <Checkbox
              checked={item.access?.includes("U") || false}
              onCheckedChange={(checked) =>
                handleCheckboxChangeRecursive(
                  result || [],
                  item.id,
                  "U",
                  checked === true
                )
              }
            />
          </TableCell>
          <TableCell className="text-center">
            <Checkbox
              checked={item.access?.includes("D") || false}
              onCheckedChange={(checked) =>
                handleCheckboxChangeRecursive(
                  result || [],
                  item.id,
                  "D",
                  checked === true
                )
              }
            />
          </TableCell>
        </TableRow>
      );

      if (item.children && item.children.length > 0) {
        return [row, ...renderRows(item.children, level + 1)];
      }

      return [row];
    });
  };

  // Di dalam JSX

  return (
    <>
      <CustBreadcrumb
        items={[{ name: "Role", url: "/roles" }, { name: "Hak Akses" }]}
      />

      <p className="text-xl font-semibold mt-4">Hak Akses</p>

      <div className="mt-3 flex">
        <Table className="border rounded-full">
          <TableHeader>
            <TableRow>
              <TableHead className="text-center"></TableHead>
              <TableHead>Nama Menu</TableHead>
              <TableHead className="text-center">Create</TableHead>
              <TableHead className="text-center">Update</TableHead>
              <TableHead className="text-center">Delete</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>{renderRows(result || [])}</TableBody>
        </Table>
      </div>
    </>
  );
};

export default RoleAccessPage;
