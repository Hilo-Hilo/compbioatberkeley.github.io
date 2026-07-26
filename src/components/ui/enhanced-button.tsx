import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded font-sans text-sm font-bold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground",
        gold: "bg-gold text-gold-foreground hover:bg-gold/85 hover:text-gold-foreground",
        outline:
          "border border-border bg-button-surface text-heading hover:bg-muted hover:text-heading",
        quiet: "text-link hover:bg-muted hover:text-link",
        link: "text-link underline underline-offset-4 hover:text-link-hover",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:text-destructive-foreground",
        default: "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground",
        hero: "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground",
        "bio-solid":
          "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground",
        "bio-outline":
          "border border-border bg-button-surface text-heading hover:bg-muted hover:text-heading",
        "compute-solid":
          "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground",
        "compute-outline":
          "border border-border bg-button-surface text-heading hover:bg-muted hover:text-heading",
        secondary: "bg-muted text-heading hover:bg-border/60 hover:text-heading",
        ghost: "text-heading hover:bg-muted hover:text-heading",
      },
      size: {
        default: "h-10 px-5",
        sm: "h-9 px-3 text-[13px]",
        lg: "h-11 px-6",
        xl: "h-12 px-7 text-[15px]",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const EnhancedButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);

EnhancedButton.displayName = "EnhancedButton";

export { EnhancedButton };
