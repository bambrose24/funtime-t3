import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, CornerDownLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Form, FormControl, FormField, FormItem } from "~/components/ui/form";
import { cn } from "~/lib/utils";
import { useEffect } from "react";

const schema = z.object({ message: z.string().min(1) });

type Props = {
  onSubmit: (data: z.infer<typeof schema>) => Promise<void>;
  className?: string;
};

export default function MessageComposer({ onSubmit, className }: Props) {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });

  const {
    reset,
    formState: { isSubmitSuccessful },
  } = form;

  useEffect(() => {
    if (isSubmitSuccessful) {
      reset({
        message: "",
      });
    }
  }, [reset, isSubmitSuccessful]);

  const handleKeyPress = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && event.metaKey) {
      event.preventDefault();
      void form.handleSubmit(onSubmit)();
    }
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className={cn(
        "relative overflow-hidden rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring",
        className,
      )}
    >
      <Form {...form}>
        <Label htmlFor="message" className="sr-only">
          Message
        </Label>

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  {...field}
                  onKeyDown={handleKeyPress}
                  placeholder="Type your message here..."
                  className="min-h-12 resize-none border-0 p-3 shadow-none focus-visible:ring-0"
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex items-center p-3 pt-0">
          <Button
            type="submit"
            size="sm"
            className="ml-auto gap-1.5"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Send Message
            <CornerDownLeft className="size-3.5" />
          </Button>
        </div>
      </Form>
    </form>
  );
}
