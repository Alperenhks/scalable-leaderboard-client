import * as TabsPrimitive from '@radix-ui/react-tabs';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export const Tabs = TabsPrimitive.Root;

/** Sekmeler kabartma düğme şeridi olarak dizilir. */
export function TabsList({
  className,
  ...props
}: ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={cn(
        'flex items-stretch gap-2 rounded-full border-[3px] border-bark bg-gold-4/60 p-1.5',
        'shadow-[inset_0_2px_6px_rgb(0_0_0/0.25)]',
        className,
      )}
      {...props}
    />
  );
}

export function TabsTrigger({
  className,
  ...props
}: ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        'inline-flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-1.5',
        'text-[12px] font-extrabold uppercase tracking-wide text-cocoa/60 transition-all',
        'hover:text-cocoa',
        // Etkin sekme kabartma sarı düğme olur
        'data-[state=active]:border-[3px] data-[state=active]:border-bark',
        'data-[state=active]:bg-gradient-to-b data-[state=active]:from-[#fff2cf] data-[state=active]:to-gold-2',
        'data-[state=active]:text-cocoa data-[state=active]:shadow-[inset_0_2px_0_rgb(255_255_255/0.7),0_3px_0_rgb(0_0_0/0.25)]',
        className,
      )}
      {...props}
    />
  );
}

export function TabsContent({
  className,
  ...props
}: ComponentProps<typeof TabsPrimitive.Content>) {
  return <TabsPrimitive.Content className={cn('mt-3', className)} {...props} />;
}
