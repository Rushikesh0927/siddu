
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { UserRole } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Loader } from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const generalSettingsSchema = z.object({
  siteName: z.string().min(2, { message: "Site name must be at least 2 characters" }),
  siteDescription: z.string().optional(),
  maintenanceMode: z.boolean().default(false),
  maxJobsPerEmployer: z.number().int().min(1).default(10),
  maxApplicantsPerJob: z.number().int().min(1).default(100),
  defaultJobDuration: z.number().int().min(1).default(30),
});

const notificationSettingsSchema = z.object({
  emailNotifications: z.boolean().default(true),
  applicationUpdates: z.boolean().default(true),
  jobPostingUpdates: z.boolean().default(true),
  marketingEmails: z.boolean().default(false),
  emailFrequency: z.enum(["immediate", "daily", "weekly"]).default("immediate"),
  emailTemplate: z.string().optional(),
});

type GeneralSettingsFormValues = z.infer<typeof generalSettingsSchema>;
type NotificationSettingsFormValues = z.infer<typeof notificationSettingsSchema>;

const AdminSettingsPage = () => {
  const [isSavingGeneral, setIsSavingGeneral] = useState(false);
  const [isSavingNotifications, setIsSavingNotifications] = useState(false);
  
  const generalForm = useForm<GeneralSettingsFormValues>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: {
      siteName: "Career Connect",
      siteDescription: "A platform connecting students with job opportunities",
      maintenanceMode: false,
      maxJobsPerEmployer: 10,
      maxApplicantsPerJob: 100,
      defaultJobDuration: 30,
    },
  });

  const notificationForm = useForm<NotificationSettingsFormValues>({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: {
      emailNotifications: true,
      applicationUpdates: true,
      jobPostingUpdates: true,
      marketingEmails: false,
      emailFrequency: "daily",
      emailTemplate: `Hello {{name}},

Thank you for using Career Connect.

{{message}}

Best regards,
The Career Connect Team`,
    },
  });

  const onSubmitGeneral = async (values: GeneralSettingsFormValues) => {
    setIsSavingGeneral(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log("Saving general settings:", values);
      toast.success("General settings saved successfully");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setIsSavingGeneral(false);
    }
  };

  const onSubmitNotifications = async (values: NotificationSettingsFormValues) => {
    setIsSavingNotifications(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log("Saving notification settings:", values);
      toast.success("Notification settings saved successfully");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setIsSavingNotifications(false);
    }
  };

  return (
    <DashboardLayout userRole={UserRole.ADMIN}>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-6">Settings</h2>
          
          <Card>
            <CardHeader>
              <CardTitle>Platform Configuration</CardTitle>
              <CardDescription>
                Manage general settings and customize the platform experience.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="general" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="general">General</TabsTrigger>
                  <TabsTrigger value="notifications">Notifications</TabsTrigger>
                </TabsList>
                
                <TabsContent value="general" className="space-y-4">
                  <Form {...generalForm}>
                    <form onSubmit={generalForm.handleSubmit(onSubmitGeneral)} className="space-y-6">
                      <FormField
                        control={generalForm.control}
                        name="siteName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Site Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Career Connect" {...field} />
                            </FormControl>
                            <FormDescription>
                              This is the name that appears in the browser tab and throughout the site.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={generalForm.control}
                        name="siteDescription"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Site Description</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="A platform connecting students with job opportunities"
                                className="resize-none"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Briefly describe your platform to help users understand its purpose.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={generalForm.control}
                        name="maintenanceMode"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel>Maintenance Mode</FormLabel>
                              <FormDescription>
                                Enable to prevent access to the site and display a maintenance message.
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <Separator />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={generalForm.control}
                          name="maxJobsPerEmployer"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Max Jobs per Employer</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="10" {...field} />
                              </FormControl>
                              <FormDescription>
                                Set the maximum number of job postings an employer can have.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={generalForm.control}
                          name="maxApplicantsPerJob"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Max Applicants per Job</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="100" {...field} />
                              </FormControl>
                              <FormDescription>
                                Limit the number of applications a job posting can receive.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={generalForm.control}
                          name="defaultJobDuration"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Default Job Duration (days)</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="30" {...field} />
                              </FormControl>
                              <FormDescription>
                                Set the default duration for which a job posting remains active.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <Button type="submit" disabled={isSavingGeneral}>
                        {isSavingGeneral ? (
                          <>
                            <Loader className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : "Save General Settings"}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
                
                <TabsContent value="notifications" className="space-y-4">
                  <Form {...notificationForm}>
                    <form onSubmit={notificationForm.handleSubmit(onSubmitNotifications)} className="space-y-6">
                      <FormField
                        control={notificationForm.control}
                        name="emailNotifications"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel>Enable Email Notifications</FormLabel>
                              <FormDescription>
                                Allow the platform to send email notifications to users.
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <Separator />
                      
                      <FormField
                        control={notificationForm.control}
                        name="applicationUpdates"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel>Application Updates</FormLabel>
                              <FormDescription>
                                Notify users about updates to their job applications.
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={notificationForm.control}
                        name="jobPostingUpdates"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel>Job Posting Updates</FormLabel>
                              <FormDescription>
                                Inform users about new job postings that match their preferences.
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={notificationForm.control}
                        name="marketingEmails"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel>Marketing Emails</FormLabel>
                              <FormDescription>
                                Send promotional emails to users about new features or partnerships.
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <Separator />
                      
                      <FormField
                        control={notificationForm.control}
                        name="emailFrequency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Frequency</FormLabel>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-col space-y-1"
                            >
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="immediate" id="immediate" />
                                </FormControl>
                                <FormLabel htmlFor="immediate">Immediate</FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="daily" id="daily" />
                                </FormControl>
                                <FormLabel htmlFor="daily">Daily</FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="weekly" id="weekly" />
                                </FormControl>
                                <FormLabel htmlFor="weekly">Weekly</FormLabel>
                              </FormItem>
                            </RadioGroup>
                            <FormDescription>
                              Choose how often users receive email notifications.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={notificationForm.control}
                        name="emailTemplate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Template</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Hello {{name}}, Thank you for using Career Connect. {{message}} Best regards, The Career Connect Team"
                                className="resize-none"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Customize the default email template used for notifications. Use 
                              {" "}<code>{"{{name}}"}</code>{" "}and{" "}<code>{"{{message}}"}</code>{" "}as placeholders.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button type="submit" disabled={isSavingNotifications}>
                        {isSavingNotifications ? (
                          <>
                            <Loader className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : "Save Notification Settings"}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminSettingsPage;
