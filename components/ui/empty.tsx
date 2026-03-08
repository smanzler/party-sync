import { cva, type VariantProps } from "class-variance-authority";

import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { TextProps, View, ViewProps } from "react-native";

function Empty({ className, ...props }: ViewProps) {
  return (
    <View
      data-slot="empty"
      className={cn(
        "flex min-w-0 flex-1 flex-col items-center justify-center gap-6 rounded-lg border-dashed p-6 md:p-12",
        className,
      )}
      {...props}
    />
  );
}

function EmptyHeader({ className, ...props }: ViewProps) {
  return (
    <View
      data-slot="empty-header"
      className={cn("flex max-w-sm flex-col items-center gap-2", className)}
      {...props}
    />
  );
}

const emptyMediaVariants = cva(
  "flex shrink-0 items-center justify-center mb-2 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        icon: "bg-muted text-foreground flex size-10 shrink-0 items-center justify-center rounded-lg [&_svg:not([class*='size-'])]:size-6",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function EmptyMedia({
  className,
  variant = "default",
  ...props
}: ViewProps & VariantProps<typeof emptyMediaVariants>) {
  return (
    <View
      data-slot="empty-icon"
      data-variant={variant}
      className={cn(emptyMediaVariants({ variant, className }))}
      {...props}
    />
  );
}

function EmptyTitle({ className, ...props }: TextProps) {
  return (
    <Text
      data-slot="empty-title"
      className={cn(
        "text-lg font-medium tracking-tight text-center",
        className,
      )}
      {...props}
    />
  );
}

function EmptyDescription({ className, ...props }: TextProps) {
  return (
    <Text
      data-slot="empty-description"
      className={cn(
        "text-muted-foreground [&>a:hover]:text-primary text-sm/relaxed [&>a]:underline [&>a]:underline-offset-4 text-center text-balance",
        className,
      )}
      {...props}
    />
  );
}

function EmptyContent({ className, ...props }: ViewProps) {
  return (
    <View
      data-slot="empty-content"
      className={cn(
        "flex w-full max-w-sm min-w-0 flex-col items-center gap-4 text-sm text-balance",
        className,
      )}
      {...props}
    />
  );
}

export {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
};
