/**
 * Mimariproje.com - Custom Form Hook
 * React Hook Form + Zod entegrasyonu için custom hook
 */

import {
  useForm as useReactHookForm,
  UseFormProps,
  FieldValues,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

interface UseFormOptions<T extends FieldValues>
  extends Omit<UseFormProps<T>, "resolver"> {
  schema: z.ZodSchema<T>;
}

export function useForm<T extends FieldValues>({
  schema,
  ...options
}: UseFormOptions<T>) {
  return useReactHookForm<T>({
    resolver: zodResolver(schema),
    ...options,
  });
}

export default useForm;
