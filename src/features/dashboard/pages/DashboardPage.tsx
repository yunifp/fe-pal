import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "../services/dashboardService";
import useRedirectIfHasNotAccess from "@/hooks/useRedirectIfHasNotAccess";
import CardLogAplikasi from "../components/CardLogAplikasi";
import CustBreadcrumb from "@/components/CustBreadCrumb";
import CardTotalUser from "../components/CardTotalUser";

const DashboardPage = () => {
  useRedirectIfHasNotAccess("R");

  const { data: dashboardResult } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => dashboardService.getData(),
  });

  const dashboardData = dashboardResult?.data;

  return (
    <>
      <CustBreadcrumb items={[{ name: "Dashboard", url: "/dashboard" }]} />

      <p className="text-xl font-semibold mt-4">Dashboard</p>

      <div className="mt-3">
        {dashboardData && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CardLogAplikasi data={dashboardData?.logAplikasi} />
            <CardTotalUser data={dashboardData?.totalUser} />
          </div>
        )}
      </div>
    </>
  );
};

export default DashboardPage;
