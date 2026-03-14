import LFooter from "@/features/landing/components/LFooter";
import LNavbar from "@/features/landing/components/LNavbar";
import { Outlet } from "react-router-dom";

const LandingPageLayout = () => {
  return (
    <div className="font-inter">
      <LNavbar />
      <Outlet />
      <LFooter />
    </div>
  );
};

export default LandingPageLayout;
