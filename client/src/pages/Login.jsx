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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useLoginUserMutation,
  useRegisterUserMutation,
} from "@/features/api/authApi";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

const Login = () => {
  const { t } = useTranslation();
  const [signupInput, setSignupInput] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loginInput, setLoginInput] = useState({ email: "", password: "" });

  const [
    registerUser,
    {
      data: registerData,
      error: registerError,
      isLoading: registerIsLoading,
      isSuccess: registerIsSuccess,
    },
  ] = useRegisterUserMutation();
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

  const changeInputHandler = (e, type) => {
    const { name, value } = e.target;
    if (type === "signup") {
      setSignupInput({ ...signupInput, [name]: value });
    } else {
      setLoginInput({ ...loginInput, [name]: value });
    }
  };

  const handleRegistration = async (type) => {
    const inputData = type === "signup" ? signupInput : loginInput;
    const action = type === "signup" ? registerUser : loginUser;
    await action(inputData);
  };

useEffect(() => {
  if (registerIsSuccess && registerData) {
    toast.success(registerData.message ?? t("auth.register_success"));
  }
  if (registerError) {
    const signupMsg =
      registerError?.data?.message ??    // RTK Query “data” payload
      registerError?.error?.message ??   // fallback shape
      t("auth.register_failed");
    toast.error(signupMsg);
  }

  if (loginIsSuccess && loginData) {
    toast.success(loginData.message ?? t("auth.login_success"));
    navigate(loginData.user?.role === "instructor" ? "/admin" : "/");
  }
  if (loginError) {
    const loginMsg =
      loginError?.data?.message ??
      loginError?.error?.message ??
      t("auth.login_failed");
    toast.error(loginMsg);
  }
}, [
  registerIsSuccess,
  registerData,
  registerError,
  loginIsSuccess,
  loginData,
  loginError,
  navigate,
  t
]);


  return (
    <div className="flex items-center w-full justify-center mt-20">
      <Tabs defaultValue="login" className="w-[400px]">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="signup">{t("auth.register")}</TabsTrigger>
          <TabsTrigger value="login">{t("auth.login")}</TabsTrigger>
        </TabsList>
        <TabsContent value="signup">
          <Card>
            <CardHeader>
              <CardTitle>{t("auth.register")}</CardTitle>
              <CardDescription>
                {t("auth.signup_description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="name">{t("auth.name")}</Label>
                <Input
                  type="text"
                  name="name"
                  value={signupInput.name}
                  onChange={(e) => changeInputHandler(e, "signup")}
                  placeholder={t("auth.name_placeholder")}
                  required="true"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="username">{t("auth.email")}</Label>
                <Input
                  type="email"
                  name="email"
                  value={signupInput.email}
                  onChange={(e) => changeInputHandler(e, "signup")}
                  placeholder={t("auth.email_placeholder")}
                  required="true"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="username">{t("auth.password")}</Label>
                <Input
                  type="password"
                  name="password"
                  value={signupInput.password}
                  onChange={(e) => changeInputHandler(e, "signup")}
                  placeholder={t("auth.password_placeholder")}
                  required="true"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                disabled={registerIsLoading}
                onClick={() => handleRegistration("signup")}
              >
                {registerIsLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t("auth.please_wait")}
                  </>
                ) : (
                  t("auth.register")
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="login">
          <Card>
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
                  onChange={(e) => changeInputHandler(e, "login")}
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
                  onChange={(e) => changeInputHandler(e, "login")}
                  placeholder={t("auth.password_placeholder")}
                  required="true"
                />
              </div>
            </CardContent>
            <CardFooter>
              <div className="flex w-full flex-col gap-3">
                <Button
                  disabled={loginIsLoading}
                  onClick={() => handleRegistration("login")}
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
        </TabsContent>
      </Tabs>
    </div>
  );
};
export default Login;
