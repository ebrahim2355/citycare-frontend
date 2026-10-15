"use client";

import { Eye, EyeOff } from "lucide-react";
import { type ComponentProps, type ReactNode, useId, useState } from "react";
import { type Control, Controller, type FieldPath, type FieldValues } from "react-hook-form";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface BaseFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: ReactNode;
  description?: ReactNode;
  className?: string;
}

type InputProps = Omit<ComponentProps<typeof Input>, "name" | "value" | "onChange" | "onBlur" | "defaultValue">;

export function TextField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  className,
  ...inputProps
}: BaseFieldProps<T> & InputProps) {
  const id = useId();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className={className}>
          <FieldLabel htmlFor={id}>{label}</FieldLabel>
          <Input
            {...inputProps}
            {...field}
            value={field.value ?? ""}
            id={id}
            aria-invalid={fieldState.invalid}
            aria-describedby={description ? `${id}-description` : undefined}
          />
          {description && <FieldDescription id={`${id}-description`}>{description}</FieldDescription>}
          <FieldError errors={[fieldState.error]} />
        </Field>
      )}
    />
  );
}

export function PasswordField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  className,
  autoComplete = "current-password",
}: BaseFieldProps<T> & { autoComplete?: string }) {
  const id = useId();
  const [visible, setVisible] = useState(false);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className={className}>
          <FieldLabel htmlFor={id}>{label}</FieldLabel>
          <InputGroup>
            <InputGroupInput
              {...field}
              value={field.value ?? ""}
              id={id}
              type={visible ? "text" : "password"}
              autoComplete={autoComplete}
              aria-invalid={fieldState.invalid}
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                size="icon-xs"
                aria-label={visible ? "Hide password" : "Show password"}
                aria-pressed={visible}
                onClick={() => setVisible((value) => !value)}
              >
                {visible ? <EyeOff /> : <Eye />}
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
          {description && <FieldDescription>{description}</FieldDescription>}
          <FieldError errors={[fieldState.error]} />
        </Field>
      )}
    />
  );
}

type TextareaProps = Omit<ComponentProps<typeof Textarea>, "name" | "value" | "onChange" | "onBlur" | "defaultValue">;

export function TextareaField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  className,
  maxLength,
  ...textareaProps
}: BaseFieldProps<T> & TextareaProps) {
  const id = useId();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const length = String(field.value ?? "").length;

        return (
          <Field data-invalid={fieldState.invalid} className={className}>
            <div className="flex items-end justify-between gap-3">
              <FieldLabel htmlFor={id}>{label}</FieldLabel>
              {maxLength && (
                <span className={cn("text-xs text-muted-foreground tabular-nums", length > maxLength && "text-destructive")}>
                  {length}/{maxLength}
                </span>
              )}
            </div>
            <Textarea {...textareaProps} {...field} value={field.value ?? ""} id={id} aria-invalid={fieldState.invalid} />
            {description && <FieldDescription>{description}</FieldDescription>}
            <FieldError errors={[fieldState.error]} />
          </Field>
        );
      }}
    />
  );
}

interface SelectFieldProps<T extends FieldValues> extends BaseFieldProps<T> {
  options: { value: string; label: string }[];
  placeholder?: string;
  disabled?: boolean;
}

export function SelectField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  className,
  options,
  placeholder = "Choose one",
  disabled,
}: SelectFieldProps<T>) {
  const id = useId();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className={className}>
          <FieldLabel htmlFor={id}>{label}</FieldLabel>
          <Select value={field.value ?? ""} onValueChange={field.onChange} disabled={disabled} name={field.name}>
            <SelectTrigger id={id} ref={field.ref} onBlur={field.onBlur} aria-invalid={fieldState.invalid} className="w-full">
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {description && <FieldDescription>{description}</FieldDescription>}
          <FieldError errors={[fieldState.error]} />
        </Field>
      )}
    />
  );
}
