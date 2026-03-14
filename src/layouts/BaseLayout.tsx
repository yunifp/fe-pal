import { Outlet } from "react-router-dom";

const BaseLayout = () => {
  return (
    <div className="font-inter">
      <Outlet />
    </div>
  );
};

export default BaseLayout;
