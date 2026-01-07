import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="bg-card border-b border-border">
      <div className="max-w-7xl mx-auto px-4 py-2">
        <ol className="flex items-center gap-2 text-sm">
          <li>
            <a href="/" className="text-muted-foreground hover:text-foreground flex items-center gap-1">
              <Home className="h-4 w-4" />
              Hjem
            </a>
          </li>
          {items.map((item, index) => (
            <li key={index} className="flex items-center gap-2">
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              {item.href ? (
                <a href={item.href} className="text-muted-foreground hover:text-foreground">
                  {item.label}
                </a>
              ) : (
                <span className="text-primary font-medium">{item.label}</span>
              )}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}
