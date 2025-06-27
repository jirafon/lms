import { Menu, School } from "lucide-react";
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
  SheetClose,
  SheetContent,
  SheetFooter,
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
    <div className="h-16 dark:bg-[#020817] bg-white border-b dark:border-b-gray-800 border-b-gray-200 fixed top-0 left-0 right-0 duration-300 z-10">
      {/* Desktop */}
      <div className="max-w-7xl mx-auto hidden md:flex justify-between items-center gap-10 h-full">
        <div className="flex items-center gap-2">
          <School size={"30"} />
          <Link to="/">
            <h1 className="hidden md:block font-extrabold text-2xl">
              Unbiax Learning
            </h1>
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
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>{t('navigation.my_account')}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
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
                {user?.role === "instructor" && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuItem>
                        <Link to="/admin/dashboard">{t('admin.admin_dashboard')}</Link>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/login">
                <Button variant="outline">{t('navigation.login')}</Button>
              </Link>
              <Link to="/register">
                <Button>{t('navigation.register')}</Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile */}
      <div className="md:hidden flex justify-between items-center h-full px-4">
        <div className="flex items-center gap-2">
          <School size={"24"} />
          <Link to="/">
            <h1 className="font-extrabold text-xl">Unbiax Learning</h1>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSelector />
          <DarkMode />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>{t('navigation.menu')}</SheetTitle>
              </SheetHeader>
              <Separator className="mr-2" />
              <nav className="flex flex-col space-y-4">
                {user ? (
                  <>
                    <Link to="/my-learning">{t('navigation.my_learning')}</Link>
                    <Link to="/profile">{t('navigation.profile')}</Link>
                    <button onClick={logoutHandler}>{t('navigation.logout')}</button>
                    {user?.role === "instructor" && (
                      <Link to="/admin/dashboard">{t('admin.admin_dashboard')}</Link>
                    )}
                  </>
                ) : (
                  <>
                    <Link to="/login">{t('navigation.login')}</Link>
                    <Link to="/register">{t('navigation.register')}</Link>
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
