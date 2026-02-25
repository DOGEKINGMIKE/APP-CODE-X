import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Code2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background p-4">
      <div className="text-center max-w-md">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Code2 className="w-6 h-6 text-primary" />
          <span className="text-sm font-bold text-foreground">Code Studio X-11</span>
        </div>
        <h1 className="mb-2 text-6xl font-bold text-foreground">404</h1>
        <p className="mb-6 text-lg text-muted-foreground">The page you are looking for does not exist.</p>
        <Button asChild>
          <Link to="/">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to IDE
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
