"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { useMemo } from "react";

import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { TextProps, View, ViewProps } from "react-native";

function FieldGroup({ className, ...props }: ViewProps) {
  return (
    <View className={cn("flex w-full flex-col gap-6", className)} {...props} />
  );
}

const fieldVariants = cva("flex w-full gap-3", {
  variants: {
    orientation: {
      vertical: "flex-col w-full",
      horizontal: "flex-row items-center",
    },
  },
  defaultVariants: {
    orientation: "vertical",
  },
});

function Field({
  className,
  orientation = "vertical",
  ...props
}: ViewProps & VariantProps<typeof fieldVariants>) {
  return (
    <View
      className={cn(fieldVariants({ orientation }), className)}
      {...props}
    />
  );
}

function FieldContent({ className, ...props }: ViewProps) {
  return (
    <View
      className={cn("flex flex-col gap-1.5 leading-snug", className)}
      {...props}
    />
  );
}

function FieldLabel({
  className,
  ...props
}: React.ComponentProps<typeof Label>) {
  return (
    <Label
      className={cn("flex w-fit gap-2 leading-none", className)}
      {...props}
    />
  );
}

function FieldTitle({ className, ...props }: TextProps) {
  return (
    <Text
      className={cn(
        "flex w-fit items-center gap-2 text-sm leading-snug font-medium group-data-[disabled=true]/field:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

function FieldDescription({ className, ...props }: TextProps) {
  return (
    <Text
      className={cn("text-muted-foreground text-sm font-normal", className)}
      {...props}
    />
  );
}

function FieldSeparator({
  children,
  className,
  ...props
}: ViewProps & {
  children?: React.ReactNode;
}) {
  return (
    <View className={cn("relative h-5", className)} {...props}>
      <Separator
        style={{ position: "absolute", top: "50%", left: 0, right: 0 }}
      />
      {children && (
        <Text
          className="bg-background text-muted-foreground relative mx-auto px-2"
          style={{ alignSelf: "center" }}
        >
          {children}
        </Text>
      )}
    </View>
  );
}

function FieldError({
  className,
  children,
  errors,
  ...props
}: TextProps & {
  errors?: Array<{ message?: string } | undefined>;
}) {
  const content = useMemo(() => {
    if (children) {
      return children;
    }

    if (!errors?.length) {
      return null;
    }

    const uniqueErrors = [
      ...new Map(errors.map((error) => [error?.message, error])).values(),
    ];

    if (uniqueErrors?.length == 1) {
      return uniqueErrors[0]?.message;
    }

    return (
      <View className="ml-4 flex flex-col gap-1">
        {uniqueErrors.map(
          (error, index) =>
            error?.message && <Text key={index}>{error.message}</Text>,
        )}
      </View>
    );
  }, [children, errors]);

  if (!content) {
    return null;
  }

  return (
    <Text
      role="alert"
      data-slot="field-error"
      className={cn("text-destructive text-sm font-normal", className)}
      {...props}
    >
      {content}
    </Text>
  );
}

export {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
  FieldTitle,
};
