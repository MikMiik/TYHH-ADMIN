"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from "@/lib/schemas/auth";
import { useSendForgotPasswordEmailMutation } from "@/lib/features/api/authApi";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [sendForgotPasswordEmail, { isLoading, error }] =
    useSendForgotPasswordEmailMutation();

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const handleGoBack = () => {
    router.push("/login");
  };

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      await sendForgotPasswordEmail(data).unwrap();
      setIsSubmitted(true);
    } catch (err) {
      console.error("Failed to send reset email:", err);
    }
  };

  // Success state
  if (isSubmitted) {
    return (
      <div className="w-full">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={handleGoBack}
            className="flex items-center text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to login
          </Button>
        </div>

        <Card className="w-full border-0 shadow-xl bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/95">
          <CardHeader className="space-y-1 text-center pb-8">
            <div className="mx-auto h-16 w-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl font-bold">
              Check your email
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              We&apos;ve sent password reset instructions to your email address.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="text-center text-sm text-muted-foreground">
              <p>
                If you don&apos;t see the email, check your spam folder or try
                again with a different email address.
              </p>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 pt-6">
            <Button
              onClick={handleGoBack}
              className="w-full h-11"
              variant="default"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to login
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Form state
  return (
    <div className="w-full">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={handleGoBack}
          className="flex items-center text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to login
        </Button>
      </div>

      <Card className="w-full border-0 shadow-xl bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/95">
        <CardHeader className="space-y-1 text-center pb-8">
          <div className="mx-auto h-12 w-12 bg-primary rounded-lg flex items-center justify-center text-white text-xl font-bold mb-4">
            <Mail className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-bold">Forgot password?</CardTitle>
          <CardDescription className="text-muted-foreground">
            Enter your email address and we&apos;ll send you a link to reset
            your password.
          </CardDescription>
        </CardHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {"data" in error &&
                    error.data &&
                    typeof error.data === "object" &&
                    "message" in error.data
                      ? String(error.data.message)
                      : "Failed to send email. Please try again."}
                  </AlertDescription>
                </Alert>
              )}

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email address</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="Enter your email"
                        disabled={isLoading}
                        className="h-11"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>

            <CardFooter className="flex flex-col space-y-4 pt-6">
              <Button
                type="submit"
                className="w-full h-11"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Send reset link
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
