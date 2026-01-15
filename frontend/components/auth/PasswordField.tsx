"use client";

import { Eye, EyeOff } from "lucide-react";
import * as React from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type PasswordFieldProps = {
  id: string;
  label: string;

  value: string;
  onChange: (next: string) => void;

  placeholder?: string;
  disabled?: boolean;

  /** error string (si existe, se muestra a la derecha del label) */
  error?: string;

  /** clases extra para el input (por ej: bordes verdes/rojos) */
  inputClassName?: string;

  /** para forms */
  required?: boolean;
  name?: string;

  /** UX/Browser */
  autoComplete?: string;

  /** eventos opcionales (útiles para tu popover) */
  onFocus?: React.FocusEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;

  /**
   * Si necesitas anclar popovers/tooltips alrededor del input,
   * puedes envolver el bloque completo desde afuera,
   * o usar rightSlot para meter UI extra cerca del input.
   */
  rightSlot?: React.ReactNode;

  /**
   * Por defecto es password; si quieres confirm password igual funciona.
   */
  ariaLabelShow?: string;
  ariaLabelHide?: string;
};

export default function PasswordField({
  id,
  label,
  value,
  onChange,
  placeholder = "••••••••",
  disabled,
  error,
  inputClassName,
  required,
  name,
  autoComplete = "current-password",
  onFocus,
  onBlur,
  rightSlot,
  ariaLabelShow = "Mostrar contraseña",
  ariaLabelHide = "Ocultar contraseña",
}: PasswordFieldProps) {
  const [show, setShow] = React.useState(false);

  return (
    <div className="space-y-2">
      {/* Label row + error */}
      <div className="flex flex-row justify-between items-center">
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
        </Label>

        {!!error && <p className="text-xs text-red-500">{error}</p>}
      </div>

      <div className="relative">
        <Input
          id={id}
          name={name}
          type={show ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          required={required}
          autoComplete={autoComplete}
          onFocus={onFocus}
          onBlur={onBlur}
          className={`h-11 pr-10 ${inputClassName ?? ""}`}
        />

        {/* Toggle show/hide */}
        <button
          type="button"
          data-pw-toggle="true"
          onMouseDown={(e) => e.preventDefault()} // evita perder focus por click (importante para popovers)
          onClick={() => setShow((p) => !p)}
          disabled={disabled}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition disabled:opacity-50"
          aria-label={show ? ariaLabelHide : ariaLabelShow}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>

        {/* Slot opcional por si quieres meter algo más al lado */}
        {rightSlot}
      </div>
    </div>
  );
}
