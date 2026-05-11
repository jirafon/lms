// McgPr7oX7v1mMcbN
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLoginUserMutation } from "@/features/api/authApi";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

const Login = () => {
  const { t } = useTranslation();
  const [loginInput, setLoginInput] = useState({ email: "", password: "" });
  const [
    loginUser,
    {
      data: loginData,
      error: loginError,
      isLoading: loginIsLoading,
      isSuccess: loginIsSuccess,
    },
  ] = useLoginUserMutation();
  const navigate = useNavigate();

  const changeInputHandler = (e) => {
    const { name, value } = e.target;
    setLoginInput({ ...loginInput, [name]: value });
  };

useEffect(() => {
  if (loginIsSuccess && loginData) {
    toast.success(loginData.message ?? t("auth.login_success"));
    const userRole = loginData.user?.lmsrole || loginData.user?.role;
    navigate(userRole === "instructor" ? "/admin" : "/my-learning");
  }
  if (loginError) {
    const loginMsg =
      loginError?.data?.message ??
      loginError?.error?.message ??
      t("auth.login_failed");
    toast.error(loginMsg);
  }
}, [
  loginIsSuccess,
  loginData,
  loginError,
  navigate,
  t
]);


  return (
    <div className="flex items-center w-full justify-center mt-20">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>{t("auth.login")}</CardTitle>
          <CardDescription>
            {t("auth.login_description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="space-y-1">
            <Label htmlFor="current">{t("auth.email")}</Label>
            <Input
              type="email"
              name="email"
              value={loginInput.email}
              onChange={changeInputHandler}
              placeholder={t("auth.email_placeholder")}
              required="true"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="new">{t("auth.password")}</Label>
            <Input
              type="password"
              name="password"
              value={loginInput.password}
              onChange={changeInputHandler}
              placeholder={t("auth.password_placeholder")}
              required="true"
            />
          </div>
        </CardContent>
        <CardFooter>
          <div className="flex w-full flex-col gap-3">
            <Button
              disabled={loginIsLoading}
              onClick={() => loginUser(loginInput)}
            >
              {loginIsLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t("auth.please_wait")}
                </>
              ) : (
                t("auth.login")
              )}
            </Button>
            <Link
              to="/forgot-password"
              className="text-center text-sm font-medium text-blue-600 hover:underline"
            >
              {t("auth.forgot_password")}
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};
export default Login;
