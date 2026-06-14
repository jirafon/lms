import { Menu } from "lucide-react";
import React, { useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import DarkMode from "@/DarkMode";
import LanguageSelector from "./LanguageSelector";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { Separator } from "@radix-ui/react-dropdown-menu";
import { Link, useNavigate } from "react-router-dom";
import { useLogoutUserMutation } from "@/features/api/authApi";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { getUserRole, isInstructor } from "@/utils/userRole";

const Navbar = () => {
  const { t } = useTranslation();
  const { user } = useSelector((store) => store.auth);
  const userRole = getUserRole(user);
  const [logoutUser, { data, isSuccess }] = useLogoutUserMutation();
  const navigate = useNavigate();

  const logoutHandler = async () => {
    await logoutUser();
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success(data?.message || t("auth.logout_success"));
      navigate("/login");
    }
  }, [isSuccess, data, navigate, t]);

  const brandMark = (
    <Link to="/" className="group inline-flex items-center gap-3">
      <img
        src="/unbiax13.png"
        alt="Unbiax"
        className="h-9 w-auto transition-opacity group-hover:opacity-90 md:h-10"
      />
      <span className="font-display text-[1.35rem] font-semibold leading-none tracking-[-0.02em] text-slate-900 dark:text-white md:text-[1.5rem]">
        Academia
      </span>
    </Link>
  );

  const navActions = (
    <div className="flex items-center gap-2 md:gap-3">
      <LanguageSelector />
      <DarkMode />
      {user ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className="rounded-full ring-2 ring-transparent transition hover:ring-primary/20">
              <Avatar className="h-9 w-9">
                <AvatarImage
                  src={user?.photoUrl || "https://github.com/shadcn.png"}
                  alt={user?.name || "User"}
                />
                <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 border border-border bg-card shadow-lg"
          >
            <DropdownMenuLabel>{t("navigation.my_account")}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {isInstructor(user) && (
                <>
                  <DropdownMenuItem>
                    <Link to="/admin/course">{t("admin.manage_courses")}</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link to="/admin/students">{t("admin.manage_students")}</Link>
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuItem>
                <Link to="my-learning">{t("navigation.my_learning")}</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link to="profile">{t("navigation.profile")}</Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={logoutHandler}>
                {t("navigation.logout")}
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Link to="/login">
          <Button size="sm" className="rounded-lg px-4 font-medium">
            {t("navigation.login")}
          </Button>
        </Link>
      )}
    </div>
  );

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/80 bg-white/90 backdrop-blur-md dark:bg-slate-950/90">
      <div className="mx-auto hidden h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 md:flex">
        {brandMark}
        {navActions}
      </div>

      <div className="mx-auto flex h-16 items-center justify-between px-4 md:hidden">
        {brandMark}
        <div className="flex items-center gap-2">
          <LanguageSelector />
          <DarkMode />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9 rounded-lg">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent className="border-l border-border bg-card">
              <SheetHeader>
                <SheetTitle>{t("navigation.menu")}</SheetTitle>
              </SheetHeader>
              <Separator className="mr-2" />
              <nav className="mt-6 flex flex-col space-y-4 text-foreground">
                {user ? (
                  <>
                    {isInstructor(user) && (
                      <>
                        <Link to="/admin/course">{t("admin.manage_courses")}</Link>
                        <Link to="/admin/students">{t("admin.manage_students")}</Link>
                      </>
                    )}
                    <Link to="/my-learning">{t("navigation.my_learning")}</Link>
                    <Link to="/profile">{t("navigation.profile")}</Link>
                    <button onClick={logoutHandler}>{t("navigation.logout")}</button>
                  </>
                ) : (
                  <Link to="/login">{t("navigation.login")}</Link>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
