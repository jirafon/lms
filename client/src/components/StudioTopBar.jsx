import { Menu } from "lucide-react";
import { useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import DarkMode from "@/DarkMode";
import LanguageSelector from "./LanguageSelector";
import { Link, useNavigate } from "react-router-dom";
import { useLogoutUserMutation } from "@/features/api/authApi";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { ROUTES } from "@/utils/routes";

const StudioAccountMenu = () => {
  const { t } = useTranslation();
  const { user } = useSelector((store) => store.auth);
  const [logoutUser, { data, isSuccess }] = useLogoutUserMutation();
  const navigate = useNavigate();

  useEffect(() => {
    if (isSuccess) {
      toast.success(data?.message || t("auth.logout_success"));
      navigate(ROUTES.home);
    }
  }, [isSuccess, data, navigate, t]);

  if (!user) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="rounded-full ring-2 ring-transparent transition hover:ring-primary/20"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={user?.photoUrl || "https://github.com/shadcn.png"}
              alt={user?.name || "User"}
            />
            <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 border border-border bg-card shadow-lg">
        <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link to={ROUTES.app}>{t("studio.back_to_learning")}</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to={ROUTES.profile}>{t("navigation.profile")}</Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => logoutUser()}>{t("navigation.logout")}</DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const StudioTopBar = ({ onOpenMenu }) => {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-card/95 px-4 backdrop-blur-md lg:hidden">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" className="h-9 w-9 rounded-lg" onClick={onOpenMenu}>
          <Menu className="h-4 w-4" />
        </Button>
        <Link to={ROUTES.studio} className="font-display text-base font-semibold text-foreground">
          Academia Studio
        </Link>
      </div>
      <div className="flex items-center gap-2">
        <LanguageSelector />
        <DarkMode />
        <StudioAccountMenu />
      </div>
    </header>
  );
};

export { StudioAccountMenu, StudioTopBar };
