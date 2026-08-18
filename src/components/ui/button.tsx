import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

/** Kabartma oyun düğmesi: üstten ışık, alttan gölge, basınca iner. */
const buttonVariants = cva(
  'btn3d btn3d-press inline-flex items-center justify-center gap-2 font-extrabold uppercase tracking-wide text-cream disabled:pointer-events-none disabled:opacity-50 whitespace-nowrap',
  {
    variants: {
      variant: {
        sky: 'bg-gradient-to-b from-sky to-sky-d [--btn-shadow:var(--color-sky-d)]',
        rose: 'bg-gradient-to-b from-rose to-rose-d [--btn-shadow:var(--color-rose-d)]',
        leaf: 'bg-gradient-to-b from-leaf to-leaf-d [--btn-shadow:var(--color-leaf-d)]',
        gold: 'bg-gradient-to-b from-gold-2 to-gold-4 text-cocoa [--btn-shadow:var(--color-gold-4)]',
      },
      size: {
        sm: 'h-8 px-3.5 text-xs',
        md: 'h-10 px-5 text-sm',
        lg: 'h-12 px-7 text-base',
      },
    },
    defaultVariants: { variant: 'sky', size: 'md' },
  },
);

interface ButtonProps
  extends ComponentProps<'button'>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : 'button';
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
