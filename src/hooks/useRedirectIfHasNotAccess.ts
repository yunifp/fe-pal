import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useHasAccess from "./useHasAccess";

function useRedirectIfHasNotAccess(access: "C" | "R" | "U" | "D") {
  const hasAccess = useHasAccess(access);

  const navigate = useNavigate();

  useEffect(() => {
    if (!hasAccess) {
      navigate("/not-authorized", { replace: true });
    }
  }, [hasAccess, navigate]);
}

export default useRedirectIfHasNotAccess;
