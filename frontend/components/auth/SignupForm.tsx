"use client";

import { AppLink } from "@/components/AppLink";
import ErrorBanner from "@/components/ErrorBanner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@/components/ui/popover";
import { useAuth } from "@/state/auth/auth-context";
import { CheckCircle2, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import type React from "react";
import { useRef, useState } from "react";

export default function SignupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { signup, isAuthLoading, error, clearError } = useAuth();

  type FieldKey =
    | "name"
    | "lastName"
    | "phone"
    | "email"
    | "password"
    | "confirmPassword";

  const [showFeedback, setShowFeedback] = useState<Record<FieldKey, boolean>>({
    name: false,
    lastName: false,
    phone: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  // timers por campo (no causa re-renders)
  const feedbackTimers = useRef<Partial<Record<FieldKey, number>>>({});

  const passwordRules = {
    minLen: password.length >= 6,
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    const cleanName = name.trim();
    const cleanLastName = lastName.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.replace(/\D/g, ""); // por si acaso

    if (!cleanName) newErrors.name = "Solo letras";
    if (!cleanLastName) newErrors.lastName = "Solo letras";

    if (!cleanEmail) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) {
      newErrors.email = "Email no es válido";
    }

    if (!cleanPhone) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(cleanPhone)) {
      newErrors.phone = "Debe tener 10 dígitos";
    }

    if (password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    if (password !== confirmPassword)
      newErrors.confirmPassword = "No coinciden";

    setErrors(newErrors);

    // Opcional: si quieres guardar ya normalizado
    // setEmail(cleanEmail);
    // setPhone(cleanPhone);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    clearError();
    if (!validateForm()) return;

    await signup({
      name: name.trim(),
      lastName: lastName.trim(),
      phone: phone.replace(/\D/g, ""),
      email: email.trim().toLowerCase(),
      password,
    });

    router.replace("/login");
  };

  const inputBorderClass = (
    key: FieldKey,
    hasValue: boolean,
    error?: string
  ) => {
    // Base: SIEMPRE transición + border/ring base
    const base = "transition-colors duration-500 ease-in-out border-border";

    // Sin valor o aún no toca mostrar feedback
    if (!hasValue || !showFeedback[key]) return base;

    // Con error
    if (error) return `${base} border-red-500 `;

    // Válido
    return `${base} border-green-500`;
  };

  const validateEmail = (value: string) => {
    const clean = value.trim().toLowerCase();
    if (!clean) return "";
    return /^\S+@\S+\.\S+$/.test(clean) ? "" : "Email no es válido";
  };

  const validatePassword = (value: string) => {
    if (!value) return "";
    const rulesOk =
      value.length >= 6 &&
      /[A-Z]/.test(value) &&
      /\d/.test(value) &&
      /[^A-Za-z0-9]/.test(value);

    return rulesOk ? "" : "No cumple los requisitos";
  };

  const validatePhone = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (!digits) return "";
    return /^\d{10}$/.test(digits) ? "" : "Debe tener 10 dígitos";
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    clearError();

    const value = e.target.value;
    setName(value);
    scheduleFeedback("name");

    if (!value) {
      setErrors((prev) => ({ ...prev, name: "" }));
      return;
    }

    if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]*$/.test(value)) {
      setErrors((prev) => ({
        ...prev,
        name: "Solo esta permitido letras",
      }));
    } else {
      setErrors((prev) => ({ ...prev, name: "" }));
    }
  };

  const handleLastNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    clearError();

    const value = e.target.value;
    setLastName(value);
    scheduleFeedback("lastName");

    if (!value) {
      setErrors((prev) => ({ ...prev, lastName: "" }));
      return;
    }

    if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]*$/.test(value)) {
      setErrors((prev) => ({
        ...prev,
        lastName: "Solo esta permitido letras",
      }));
    } else {
      setErrors((prev) => ({ ...prev, lastName: "" }));
    }
  };

  const validateConfirmPassword = (pwd: string, confirm: string) => {
    if (!confirm) return ""; // no mostrar error si está vacío
    return confirm !== pwd ? "No coinciden" : "";
  };

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 10);

    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;

    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    clearError();

    const formatted = formatPhone(e.target.value);
    setPhone(formatted);
    scheduleFeedback("phone", formatted);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    clearError();
    const value = e.target.value;
    setEmail(value);
    scheduleFeedback("email", value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    clearError();

    const value = e.target.value;
    setPassword(value);
    scheduleFeedback("password", value);
  };

  const handleConfirmPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    clearError();

    const value = e.target.value;
    setConfirmPassword(value);
    scheduleFeedback("confirmPassword", value);
  };

  const scheduleFeedback = (key: FieldKey, value?: string) => {
    setShowFeedback((prev) => ({ ...prev, [key]: false }));

    const existing = feedbackTimers.current[key];
    if (existing) window.clearTimeout(existing);

    feedbackTimers.current[key] = window.setTimeout(() => {
      setShowFeedback((prev) => ({ ...prev, [key]: true }));

      setErrors((prev) => {
        const next = { ...prev };

        if (key === "email") {
          next.email = validateEmail(value ?? email);
        }

        if (key === "phone") {
          next.phone = validatePhone(value ?? phone);
        }

        if (key === "password") {
          const pwd = value ?? password;
          next.password = validatePassword(pwd);
          next.confirmPassword = validateConfirmPassword(pwd, confirmPassword);
        }

        if (key === "confirmPassword") {
          next.confirmPassword = validateConfirmPassword(
            password,
            value ?? confirmPassword
          );
        }

        return next;
      });
    }, 800);
  };

  const isFormValid =
    // valores obligatorios
    name.trim().length > 0 &&
    lastName.trim().length > 0 &&
    phone.replace(/\D/g, "").length === 10 &&
    email.trim().length > 0 &&
    password.length > 0 &&
    confirmPassword.length > 0 &&
    // sin errores
    !errors.name &&
    !errors.lastName &&
    !errors.phone &&
    !errors.email &&
    !errors.password &&
    !errors.confirmPassword &&
    // reglas de contraseña reales
    passwordRules.minLen &&
    passwordRules.uppercase &&
    passwordRules.number &&
    passwordRules.special &&
    password === confirmPassword;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex items-center justify-center p-4">
      {/* Background grid */}
      <div className="fixed inset-0 bg-grid-white pointer-events-none opacity-[0.05] " />

      {/* Signup card */}
      <div className="relative w-full max-w-150 shadow-[0_0_24px_rgba(255,255,255,0.2)] rounded-2xl">
        <div className="bg-card border border-border rounded-2xl p-8 ">
          {/* Logo/Brand */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center gap-3">
              <div
                className="
                w-10 h-10
                rounded-xl
                flex items-center justify-center
                bg-gradient-to-b
                from-white
                via-zinc-200
                to-zinc-400
                shadow-sm
              "
              >
                <CheckCircle2 className="w-6 h-6 text-zinc-700" />
              </div>

              <h1
                className="
                text-4xl md:text-4xl
                font-extrabold
                bg-gradient-to-b
                from-white
                via-gray-200
                to-gray-600
                bg-clip-text
                text-transparent
                tracking-tight
              "
              >
                StaiFocus
              </h1>
            </div>
          </div>

          {/* Welcome text */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold mb-2 text-balance">
              Crea tu cuenta
            </h2>
            <p className="text-muted-foreground text-pretty">
              Únete a Focus y comienza a gestionar tus tareas
            </p>
          </div>
          <ErrorBanner
            title="No se pudo crear la cuenta"
            message={error}
            onClose={clearError}
          />
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 gap-4 min-[437px]:grid-cols-2">
              <div className="space-y-2 flex flex-col w-full">
                <div className="flex flex-row justify-between">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Nombre
                  </Label>
                  {errors.name && (
                    <p className="text-xs text-red-500">{errors.name}</p>
                  )}
                </div>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={handleNameChange}
                  required
                  disabled={isAuthLoading}
                  placeholder="Juanito"
                  className={`h-11 ${inputBorderClass(
                    "name",
                    !!name,
                    errors.name
                  )}`}
                />
                <div className="flex flex-row justify-between">
                  <Label htmlFor="lastName" className="text-sm font-medium">
                    Apellido
                  </Label>
                  {errors.lastName && (
                    <p className="text-xs text-red-500">{errors.lastName}</p>
                  )}
                </div>
                <Input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={handleLastNameChange}
                  disabled={isAuthLoading}
                  required
                  placeholder="Peregrino"
                  className={`h-11 ${inputBorderClass(
                    "lastName",
                    !!lastName,
                    errors.lastName
                  )}`}
                />

                <div className="flex flex-row justify-between">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email
                  </Label>
                  {errors.email && (
                    <p className="text-xs text-red-500">{errors.email}</p>
                  )}
                </div>
                <Input
                  id="email"
                  type="email"
                  disabled={isAuthLoading}
                  value={email}
                  onChange={handleEmailChange}
                  required
                  placeholder="you@example.com"
                  className={`h-11 ${inputBorderClass(
                    "email",
                    !!email,
                    errors.email
                  )}`}
                />
              </div>

              <div className="space-y-2 flex flex-col w-full">
                <div className="flex flex-row justify-between">
                  <Label htmlFor="phone" className="text-sm font-medium">
                    Número de teléfono
                  </Label>
                  {errors.phone && (
                    <p className="text-xs text-red-500">{errors.phone}</p>
                  )}
                </div>

                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={handlePhoneChange}
                  disabled={isAuthLoading}
                  required
                  placeholder="000-000-0000"
                  className={`h-11 ${inputBorderClass(
                    "phone",
                    !!phone,
                    errors.phone
                  )}`}
                />
                <div className="flex flex-col md:flex-row md:justify-between">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Contraseña
                  </Label>
                  {errors.password && (
                    <p className="text-xs text-red-500">{errors.password}</p>
                  )}
                </div>
                <Popover open={passwordOpen} onOpenChange={setPasswordOpen}>
                  <PopoverAnchor asChild>
                    <div className="relative">
                      <Input
                        id="password"
                        disabled={isAuthLoading}
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={handlePasswordChange}
                        onFocus={() => setPasswordOpen(true)}
                        onBlur={(e) => {
                          const next = e.relatedTarget as HTMLElement | null;
                          if (next?.dataset?.pwToggle === "true") return;
                          setPasswordOpen(false);
                        }}
                        required
                        className={`h-11 pr-10 ${inputBorderClass(
                          "password",
                          !!password,
                          errors.password
                        )}`}
                      />

                      <button
                        type="button"
                        data-pw-toggle="true"
                        onMouseDown={(e) => e.preventDefault()}
                        disabled={isAuthLoading}
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </PopoverAnchor>

                  <PopoverContent
                    align="start"
                    side="top"
                    sideOffset={8}
                    className="w-72 bg-black text-white rounded-md shadow-lg p-4"
                    onOpenAutoFocus={(e) => e.preventDefault()}
                    onInteractOutside={(e) => {
                      // Si hacen click en el botón del ojito, no lo cierres
                      const target = e.target as HTMLElement;
                      if (target?.closest("[data-pw-toggle='true']")) {
                        e.preventDefault();
                      }
                    }}
                  >
                    <div className="space-y-2">
                      <p className="text-sm font-medium">
                        Tu contraseña debe incluir:
                      </p>

                      <ul className="space-y-1 text-sm">
                        <li
                          className={
                            passwordRules.minLen
                              ? "text-green-500"
                              : "text-muted-foreground"
                          }
                        >
                          • Mínimo 6 caracteres
                        </li>
                        <li
                          className={
                            passwordRules.uppercase
                              ? "text-green-500"
                              : "text-muted-foreground"
                          }
                        >
                          • 1 mayúscula (A-Z)
                        </li>
                        <li
                          className={
                            passwordRules.number
                              ? "text-green-500"
                              : "text-muted-foreground"
                          }
                        >
                          • 1 número (0-9)
                        </li>
                        <li
                          className={
                            passwordRules.special
                              ? "text-green-500"
                              : "text-muted-foreground"
                          }
                        >
                          • 1 caracter especial (!@#…)
                        </li>
                      </ul>
                    </div>
                  </PopoverContent>
                </Popover>

                <div className="flex flex-row justify-between">
                  <Label
                    htmlFor="confirmPassword"
                    className="text-sm font-medium"
                  >
                    Confirmar Contraseña
                  </Label>
                  {errors.confirmPassword && (
                    <p className="text-xs text-red-500">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    placeholder="••••••••"
                    disabled={isAuthLoading}
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    required
                    className={`h-11 pr-10 ${inputBorderClass(
                      "confirmPassword",
                      !!confirmPassword,
                      errors.confirmPassword
                    )}`}
                  />

                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    disabled={isAuthLoading}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={!isFormValid || isAuthLoading}
              className="
    w-full h-11 font-medium
    transition-all duration-300
    disabled:opacity-20
    disabled:cursor-not-allowed
    disabled:pointer-events-none
  "
            >
              {isAuthLoading ? "Creando..." : "Crea tu cuenta"}
            </Button>
          </form>

          {/* Sign in link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {"¿Ya tienes una cuenta? "}
              <AppLink
                href="/login"
                className="text-foreground hover:text-primary font-medium transition-colors"
              >
                Inicia sesión
              </AppLink>
            </p>
          </div>
        </div>

        {/* Subtle accent decorations */}
        <div className="absolute -top-24 -right-24 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      </div>
    </div>
  );
}
