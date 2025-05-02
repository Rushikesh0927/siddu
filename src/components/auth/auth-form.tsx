import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { UserRole } from "@/types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface AuthFormProps {
  type: "login" | "register";
}

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

const registerSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  role: z.enum([UserRole.STUDENT, UserRole.EMPLOYER]),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export const AuthForm = ({ type }: AuthFormProps) => {
  const isLogin = type === "login";
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: UserRole.STUDENT,
    },
  });

  const form = isLogin ? loginForm : registerForm;

  const onSubmit = async (values: LoginFormValues | RegisterFormValues) => {
    setIsLoading(true);
    
    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: values.email,
          password: values.password,
        });

        if (error) {
          throw error;
        }

        // Check user role from profiles table
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user?.id)
          .single();

        if (profileError) {
          throw profileError;
        }

        toast.success("Logged in successfully!");
        
        // Redirect based on role
        if (profile.role === UserRole.STUDENT) {
          navigate("/student-dashboard");
        } else if (profile.role === UserRole.EMPLOYER) {
          navigate("/employer-dashboard");
        } else if (profile.role === UserRole.ADMIN) {
          navigate("/admin-dashboard");
        }
      } else {
        // This is for registration
        const registerValues = values as RegisterFormValues;
        
        // Register user
        const { data, error } = await supabase.auth.signUp({
          email: registerValues.email,
          password: registerValues.password,
          options: {
            data: {
              name: registerValues.name,
              role: registerValues.role,
            }
          }
        });

        if (error) {
          throw error;
        }

        if (data.user) {
          // Check if profile already exists
          const { data: existingProfile } = await supabase
            .from("profiles")
            .select("id")
            .eq("id", data.user.id)
            .single();

          if (!existingProfile) {
            // Create profile only if it doesn't exist
            const { error: profileError } = await supabase
              .from("profiles")
              .insert({
                id: data.user.id,
                name: registerValues.name,
                role: registerValues.role,
              });

            if (profileError) {
              throw profileError;
            }
          }

          toast.success("Registration successful!");
          // Redirect based on role
          if (registerValues.role === UserRole.STUDENT) {
            navigate("/student-dashboard");
          } else if (registerValues.role === UserRole.EMPLOYER) {
            navigate("/employer-dashboard");
          }
        } else {
          toast.success("Registration successful! Please check your email for verification before logging in.");
          navigate("/login");
        }
      }
    } catch (error: any) {
      console.error("Authentication error:", error);
      toast.error(error.message || "An error occurred during authentication");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          {isLogin ? "Log In" : "Create an Account"}
        </CardTitle>
        <CardDescription className="text-center">
          {isLogin
            ? "Enter your credentials to access your account"
            : "Sign up to connect with opportunities"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {!isLogin && (
              <FormField
                control={registerForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Enter your email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Enter your password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {!isLogin && (
              <FormField
                control={registerForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>I am a:</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1 sm:flex-row sm:space-y-0 sm:space-x-4"
                      >
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <RadioGroupItem value={UserRole.STUDENT} />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">
                            Student
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <RadioGroupItem value={UserRole.EMPLOYER} />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">
                            Employer
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <Button type="submit" className="w-full bg-job-600 hover:bg-job-700" disabled={isLoading}>
              {isLoading ? "Processing..." : isLogin ? "Log In" : "Sign Up"}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <div className="text-center text-sm">
          {isLogin ? (
            <>
              Don't have an account?{" "}
              <Link to="/register" className="text-job-600 hover:underline">
                Sign up
              </Link>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <Link to="/login" className="text-job-600 hover:underline">
                Log in
              </Link>
            </>
          )}
        </div>
        {isLogin && (
          <Link to="/forgot-password" className="text-center text-sm text-job-600 hover:underline">
            Forgot password?
          </Link>
        )}
      </CardFooter>
    </Card>
  );
};

export default AuthForm;
