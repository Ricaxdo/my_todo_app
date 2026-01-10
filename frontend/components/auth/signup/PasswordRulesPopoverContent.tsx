"use client";

export default function PasswordRulesPopoverContent(props: {
  rules: {
    minLen: boolean;
    uppercase: boolean;
    number: boolean;
    special: boolean;
  };
}) {
  const { rules } = props;

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Tu contraseña debe incluir:</p>

      <ul className="space-y-1 text-sm">
        <li
          className={rules.minLen ? "text-green-500" : "text-muted-foreground"}
        >
          • Mínimo 6 caracteres
        </li>
        <li
          className={
            rules.uppercase ? "text-green-500" : "text-muted-foreground"
          }
        >
          • 1 mayúscula (A-Z)
        </li>
        <li
          className={rules.number ? "text-green-500" : "text-muted-foreground"}
        >
          • 1 número (0-9)
        </li>
        <li
          className={rules.special ? "text-green-500" : "text-muted-foreground"}
        >
          • 1 caracter especial (!@#…)
        </li>
      </ul>
    </div>
  );
}
