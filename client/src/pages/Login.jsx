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
import { useLoginUserMutation, useRegisterUserMutation } from "@/features/api/authApi";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

const Login = () => {
  const { t } = useTranslation();
  const [authMode, setAuthMode] = useState("login");
  const [loginInput, setLoginInput] = useState({ email: "", password: "" });
  const [registerInput, setRegisterInput] = useState({ name: "", email: "", password: "" });
  const [
    loginUser,
    {
      data: loginData,
      error: loginError,
      isLoading: loginIsLoading,
      isSuccess: loginIsSuccess,
    },
  ] = useLoginUserMutation();
  const [
    registerUser,
    {
      data: registerData,
      error: registerError,
      isLoading: registerIsLoading,
      isSuccess: registerIsSuccess,
    },
  ] = useRegisterUserMutation();
  const navigate = useNavigate();

  const changeInputHandler = (e) => {
    const { name, value } = e.target;
    setLoginInput({ ...loginInput, [name]: value });
  };

  const changeRegisterInputHandler = (e) => {
    const { name, value } = e.target;
    setRegisterInput({ ...registerInput, [name]: value });
  };

  const registerSubmitHandler = async () => {
    if (!registerInput.name || !registerInput.email || !registerInput.password) {
      toast.error("Completa nombre, email y contrasena.");
      return;
    }

    if (registerInput.password.length < 6) {
      toast.error("La contrasena debe tener al menos 6 caracteres.");
      return;
    }

    try {
      await registerUser({
        name: registerInput.name.trim(),
        email: registerInput.email.trim(),
        password: registerInput.password,
        lmsrole: "student",
      }).unwrap();
    } catch {
      return;
    }
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

useEffect(() => {
  if (registerIsSuccess && registerData) {
    toast.success(registerData.message ?? "Cuenta creada exitosamente.");
    const credentials = {
      email: registerInput.email,
      password: registerInput.password,
    };
    setLoginInput(credentials);
    loginUser(credentials);
    setRegisterInput({ name: "", email: "", password: "" });
  }

  if (registerError) {
    const registerMsg =
      registerError?.data?.message ??
      registerError?.error?.message ??
      "No se pudo crear la cuenta.";
    toast.error(registerMsg);
  }
}, [
  registerIsSuccess,
  registerData,
  registerError,
  registerInput.email,
  registerInput.password,
  loginUser,
]);


  return (
    <div className="flex items-center w-full justify-center mt-20">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>{authMode === "login" ? t("auth.login") : "Crear cuenta"}</CardTitle>
          <CardDescription>
            {authMode === "login" ? t("auth.login_description") : "Crea tu usuario con perfil student para comprar y tomar cursos."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-2 pb-3">
            <Button type="button" variant={authMode === "login" ? "default" : "outline"} onClick={() => setAuthMode("login")}>
              Ingresar
            </Button>
            <Button type="button" variant={authMode === "register" ? "default" : "outline"} onClick={() => setAuthMode("register")}>
              Crear usuario
            </Button>
          </div>

          {authMode === "register" && (
            <div className="space-y-1">
              <Label htmlFor="register-name">Nombre completo</Label>
              <Input
                id="register-name"
                type="text"
                name="name"
                value={registerInput.name}
                onChange={changeRegisterInputHandler}
                placeholder="Tu nombre"
                required
              />
            </div>
          )}

          <div className="space-y-1">
            <Label htmlFor={authMode === "login" ? "login-email" : "register-email"}>{t("auth.email")}</Label>
            <Input
              id={authMode === "login" ? "login-email" : "register-email"}
              type="email"
              name="email"
              value={authMode === "login" ? loginInput.email : registerInput.email}
              onChange={authMode === "login" ? changeInputHandler : changeRegisterInputHandler}
              placeholder={t("auth.email_placeholder")}
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor={authMode === "login" ? "login-password" : "register-password"}>{t("auth.password")}</Label>
            <Input
              id={authMode === "login" ? "login-password" : "register-password"}
              type="password"
              name="password"
              value={authMode === "login" ? loginInput.password : registerInput.password}
              onChange={authMode === "login" ? changeInputHandler : changeRegisterInputHandler}
              placeholder={t("auth.password_placeholder")}
              required
            />
          </div>
        </CardContent>
        <CardFooter>
          <div className="flex w-full flex-col gap-3">
            {authMode === "login" ? (
              <>
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
              </>
            ) : (
              <Button
                disabled={registerIsLoading}
                onClick={registerSubmitHandler}
              >
                {registerIsLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t("auth.please_wait")}
                  </>
                ) : (
                  "Crear cuenta student"
                )}
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};
export default Login;
