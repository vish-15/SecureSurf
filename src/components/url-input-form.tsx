"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  url: z.string().url({ message: "Please enter a valid URL (e.g., https://example.com)" }),
});

type UrlInputFormProps = {
  onSubmit: (url: string) => Promise<void>;
  isLoading: boolean;
  initialUrl?: string;
};

export function UrlInputForm({ onSubmit, isLoading, initialUrl }: UrlInputFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: initialUrl || "",
    },
  });

  React.useEffect(() => {
    if (initialUrl) {
      form.setValue("url", initialUrl);
    }
  }, [initialUrl, form]);

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    await onSubmit(values.url);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="url-input" className="sr-only">Website URL</FormLabel>
              <FormControl>
                <Input 
                  id="url-input"
                  placeholder="https://example.com" 
                  {...field} 
                  aria-describedby="url-form-message"
                  className="text-base"
                />
              </FormControl>
              <FormMessage id="url-form-message" />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            "Analyze URL"
          )}
        </Button>
      </form>
    </Form>
  );
}
