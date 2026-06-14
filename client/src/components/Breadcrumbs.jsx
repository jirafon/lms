import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const Breadcrumbs = ({ items = [] }) => {
  if (!items.length) {
    return null;
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className="mb-6 flex flex-wrap items-center gap-1 text-sm text-muted-foreground"
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <span key={`${item.label}-${index}`} className="inline-flex items-center gap-1">
            {index > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-60" />}
            {isLast || !item.to ? (
              <span className={isLast ? "font-medium text-foreground" : ""}>
                {item.label}
              </span>
            ) : (
              <Link
                to={item.to}
                className="transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
};

export default Breadcrumbs;
