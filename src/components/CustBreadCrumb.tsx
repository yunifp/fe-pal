import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Home } from "lucide-react";
import { Fragment } from "react/jsx-runtime";
import { Link } from "react-router-dom"; // Import Link dari react-router-dom

type BreadcrumbItemType = {
  name: string;
  url?: string;
};

interface CustBreadcrumbProps {
  items: BreadcrumbItemType[];
}

const CustBreadcrumb = ({ items }: CustBreadcrumbProps) => {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <div className="flex items-center gap-1.5">
            <Home className="size-3.5" />
            <BreadcrumbLink asChild>
              <Link to="/home" className="text-xs">
                Home
              </Link>
            </BreadcrumbLink>
          </div>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <Fragment key={`${item.name}-${index}`}>
              <BreadcrumbItem>
                {!isLast ? (
                  <BreadcrumbLink asChild>
                    <Link to={item.url || "#"} className="text-xs">
                      {item.name}
                    </Link>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage className="text-xs">
                    {item.name}
                  </BreadcrumbPage>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default CustBreadcrumb;
