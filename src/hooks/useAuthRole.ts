import { useAuthStore } from "@/stores/authStore";

const BPDP_ROLE_ID = 6;
const LEMBAGA_PENDIDIKAN_OPERATOR_ROLE_ID = 8;
const LEMBAGA_PENDIDIKAN_VERIFIKATOR_ROLE_ID = 9;
const STAFF_DIVISI_BEASISWA_ROLE_ID = 11;
const VERIFIKATOR_PJK_ROLE_ID = 12;
const BENDAHARA_ROLE_ID = 13;
const PPK_ROLE_ID = 14;

export const useAuthRole = () => {
  const user = useAuthStore((state) => state.user);

  const roles = user?.id_role ?? [];

  const hasRole = (roleId: number) => roles.includes(roleId);

  const hasAnyRole = (roleIds: number[]) =>
    roleIds.some((roleId) => roles.includes(roleId));

  const hasAllRoles = (roleIds: number[]) =>
    roleIds.every((roleId) => roles.includes(roleId));

  return {
    roles,
    isLembagaPendidikanOperator: hasRole(LEMBAGA_PENDIDIKAN_OPERATOR_ROLE_ID),
    isLembagaPendidikanVerifikator: hasRole(
      LEMBAGA_PENDIDIKAN_VERIFIKATOR_ROLE_ID,
    ),
    isBpdp: hasRole(BPDP_ROLE_ID),
    isStaffDivisiBeasiswa: hasRole(STAFF_DIVISI_BEASISWA_ROLE_ID),
    isVerifikatorPjk: hasRole(VERIFIKATOR_PJK_ROLE_ID),
    isBendahara: hasRole(BENDAHARA_ROLE_ID),
    isPpk: hasRole(PPK_ROLE_ID),
    hasRole,
    hasAnyRole,
    hasAllRoles,
  };
};
