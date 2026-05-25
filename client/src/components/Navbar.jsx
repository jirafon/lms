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

const Navbar = () => {
  const { t } = useTranslation();
  const { user } = useSelector((store) => store.auth);
  const userRole = user?.lmsrole || user?.role;
  const [logoutUser, { data, isSuccess }] = useLogoutUserMutation();
  const navigate = useNavigate();
  
  const logoutHandler = async () => {
    await logoutUser();
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success(data?.message || t('auth.logout_success'));
      navigate("/login");
    }
  }, [isSuccess, data, navigate, t]);

  return (
    <div className="fixed left-0 right-0 top-0 z-10 h-20 border-b border-[#e7dccd]/90 bg-[rgba(250,246,239,0.86)] backdrop-blur-xl duration-300 md:h-24 dark:border-b-gray-800 dark:bg-[#020817]/95">
      {/* Desktop */}
      <div className="mx-auto hidden h-full max-w-7xl items-center justify-between gap-10 px-4 md:flex sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Link to="/" className="inline-flex items-center gap-2">
            <img
              src="/unbiax13.png"
              alt="Unbiax"
              className="h-[5.5rem] w-auto"
            />
            <p className="text-[33px] font-semibold uppercase leading-none tracking-[0.24em] text-amber-800/90">LMS</p>
          </Link>
        </div>
        {/* User icons and dark mode icon  */}
        <div className="flex items-center gap-4">
          <LanguageSelector />
          <DarkMode />
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar>
                  <AvatarImage
                    src={user?.photoUrl || "https://github.com/shadcn.png"}
                    alt="@shadcn"
                  />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 border border-[#e7dccd] bg-[#fffdf9]/95 backdrop-blur dark:border-slate-700 dark:bg-slate-900/95">
                <DropdownMenuLabel>{t('navigation.my_account')}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  {userRole === "instructor" && (
                    <>
                      <DropdownMenuItem>
                        <Link to="/admin/course">{t('admin.manage_courses')}</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Link to="/admin/students">{t('admin.manage_students')}</Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuItem>
                    <Link to="my-learning">{t('navigation.my_learning')}</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link to="profile">{t('navigation.profile')}</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logoutHandler}>
                    {t('navigation.logout')}
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/login">
                <Button variant="outline" className="rounded-full border-[#d6c8b6] bg-white/80 text-slate-900 hover:bg-[#f4ede2] dark:border-slate-700 dark:bg-slate-900/70 dark:text-white dark:hover:bg-slate-800">{t('navigation.login')}</Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile */}
      <div className="flex h-full items-center justify-between px-4 md:hidden">
        <div className="flex items-center gap-3">
          <Link to="/" className="inline-flex items-center gap-2">
            <img
              src="/unbiax13.png"
              alt="Unbiax"
              className="h-[4.5rem] w-auto"
            />
            <p className="text-[33px] font-semibold uppercase leading-none tracking-[0.24em] text-amber-800/90">LMS</p>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSelector />
          <DarkMode />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-full border-[#d6c8b6] bg-white/80 text-slate-900 hover:bg-[#f4ede2] dark:border-slate-700 dark:bg-slate-900/70 dark:text-white dark:hover:bg-slate-800">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent className="border-l border-[#e7dccd] bg-[linear-gradient(180deg,#f8f3ea_0%,#fffdf9_100%)] dark:border-slate-700 dark:bg-slate-950">
              <SheetHeader>
                <SheetTitle>{t('navigation.menu')}</SheetTitle>
              </SheetHeader>
              <Separator className="mr-2" />
              <nav className="mt-6 flex flex-col space-y-4 text-slate-800 dark:text-slate-100">
                {user ? (
                  <>
                    {userRole === "instructor" && (
                      <>
                        <Link to="/admin/course">{t('admin.manage_courses')}</Link>
                        <Link to="/admin/students">{t('admin.manage_students')}</Link>
                      </>
                    )}
                    <Link to="/my-learning">{t('navigation.my_learning')}</Link>
                    <Link to="/profile">{t('navigation.profile')}</Link>
                    <button onClick={logoutHandler}>{t('navigation.logout')}</button>
                  </>
                ) : (
                  <>
                    <Link to="/login">{t('navigation.login')}</Link>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
