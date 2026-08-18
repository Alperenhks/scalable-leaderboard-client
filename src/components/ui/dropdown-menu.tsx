import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export const DropdownMenu = DropdownMenuPrimitive.Root;
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
export const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

export function DropdownMenuContent({
  className,
  sideOffset = 8,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Content>) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        sideOffset={sideOffset}
        className={cn(
          'z-50 min-w-60 rounded-2xl border-[3px] border-bark bg-gradient-to-b from-gold-2 to-gold-3 p-2',
          'shadow-[inset_0_2px_0_rgb(255_255_255/0.45),0_6px_0_rgb(0_0_0/0.3)]',
          className,
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
}

export function DropdownMenuLabel({
  className,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Label>) {
  return (
    <DropdownMenuPrimitive.Label
      className={cn(
        'px-2 pb-1.5 text-[10px] font-extrabold uppercase tracking-wide text-cocoa/60',
        className,
      )}
      {...props}
    />
  );
}

export function DropdownMenuRadioItem({
  className,
  children,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.RadioItem>) {
  return (
    <DropdownMenuPrimitive.RadioItem
      className={cn(
        'capsule relative mb-1.5 flex cursor-pointer select-none items-center gap-2 px-3 py-1.5 outline-none last:mb-0',
        'data-[state=checked]:border-leaf-d data-[state=checked]:from-mine-1 data-[state=checked]:to-mine-2',
        'data-[highlighted]:brightness-105 data-[disabled]:opacity-50',
        className,
      )}
      {...props}
    >
      {children}
    </DropdownMenuPrimitive.RadioItem>
  );
}
