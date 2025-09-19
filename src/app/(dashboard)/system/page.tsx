"use client";

import { useState } from "react";
import {
  Settings,
  Globe,
  MapPin,
  Building,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  X,
  Server,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

import {
  SiteInfo,
  Social,
  City,
  School,
  useGetSiteSettingsQuery,
  useCreateSiteSettingMutation,
  useUpdateSiteSettingMutation,
  useDeleteSiteSettingMutation,
  useGetSocialLinksQuery,
  useCreateSocialLinkMutation,
  useUpdateSocialLinkMutation,
  useDeleteSocialLinkMutation,
  useGetCitiesQuery,
  useCreateCityMutation,
  useUpdateCityMutation,
  useDeleteCityMutation,
  useGetSchoolsQuery,
  useCreateSchoolMutation,
  useUpdateSchoolMutation,
  useDeleteSchoolMutation,
  useGetBackgroundJobsQuery,
  useRetryBackgroundJobMutation,
  useDeleteBackgroundJobMutation,
  useClearFailedJobsMutation,
} from "@/lib/features/api/systemApi";

export default function SystemPage() {
  const [activeTab, setActiveTab] = useState("settings");

  // Dialog states
  const [settingDialog, setSettingDialog] = useState<{
    isOpen: boolean;
    isEditing: boolean;
    setting?: SiteInfo;
  }>({ isOpen: false, isEditing: false });

  const [socialDialog, setSocialDialog] = useState<{
    isOpen: boolean;
    isEditing: boolean;
    social?: Social;
  }>({ isOpen: false, isEditing: false });

  const [cityDialog, setCityDialog] = useState<{
    isOpen: boolean;
    isEditing: boolean;
    city?: City;
  }>({ isOpen: false, isEditing: false });

  const [schoolDialog, setSchoolDialog] = useState<{
    isOpen: boolean;
    isEditing: boolean;
    school?: School;
  }>({ isOpen: false, isEditing: false });

  // Form states
  const [settingForm, setSettingForm] = useState({ key: "", value: "" });
  const [socialForm, setSocialForm] = useState({ platform: "", url: "" });
  const [cityForm, setCityForm] = useState({ name: "" });
  const [schoolForm, setSchoolForm] = useState({ name: "", cityId: "" });

  // API hooks
  const {
    data: siteSettings,
    isLoading: isLoadingSettings,
    refetch: refetchSettings,
  } = useGetSiteSettingsQuery();
  const {
    data: socialLinks,
    isLoading: isLoadingSocials,
    refetch: refetchSocials,
  } = useGetSocialLinksQuery();
  const {
    data: cities,
    isLoading: isLoadingCities,
    refetch: refetchCities,
  } = useGetCitiesQuery();
  const {
    data: schools,
    isLoading: isLoadingSchools,
    refetch: refetchSchools,
  } = useGetSchoolsQuery({});
  const {
    data: jobsData,
    isLoading: isLoadingJobs,
    refetch: refetchJobs,
  } = useGetBackgroundJobsQuery({
    page: 1,
    limit: 20,
  });

  const [createSiteSetting, { isLoading: isCreatingSetting }] =
    useCreateSiteSettingMutation();
  const [updateSiteSetting, { isLoading: isUpdatingSetting }] =
    useUpdateSiteSettingMutation();
  const [deleteSiteSetting, { isLoading: isDeletingSetting }] =
    useDeleteSiteSettingMutation();

  const [createSocialLink, { isLoading: isCreatingSocial }] =
    useCreateSocialLinkMutation();
  const [updateSocialLink, { isLoading: isUpdatingSocial }] =
    useUpdateSocialLinkMutation();
  const [deleteSocialLink, { isLoading: isDeletingSocial }] =
    useDeleteSocialLinkMutation();

  const [createCity, { isLoading: isCreatingCity }] = useCreateCityMutation();
  const [updateCity, { isLoading: isUpdatingCity }] = useUpdateCityMutation();
  const [deleteCity, { isLoading: isDeletingCity }] = useDeleteCityMutation();

  const [createSchool, { isLoading: isCreatingSchool }] =
    useCreateSchoolMutation();
  const [updateSchool, { isLoading: isUpdatingSchool }] =
    useUpdateSchoolMutation();
  const [deleteSchool, { isLoading: isDeletingSchool }] =
    useDeleteSchoolMutation();

  const [retryJob, { isLoading: isRetryingJob }] =
    useRetryBackgroundJobMutation();
  const [deleteJob, { isLoading: isDeletingJob }] =
    useDeleteBackgroundJobMutation();
  const [clearFailedJobs, { isLoading: isClearingJobs }] =
    useClearFailedJobsMutation();

  // Handle setting operations
  const handleSaveSetting = async () => {
    try {
      if (settingDialog.isEditing) {
        await updateSiteSetting({
          key: settingDialog.setting!.key,
          value: settingForm.value,
        }).unwrap();
        toast.success("Setting updated successfully");
      } else {
        await createSiteSetting(settingForm).unwrap();
        toast.success("Setting created successfully");
      }
      setSettingDialog({ isOpen: false, isEditing: false });
      setSettingForm({ key: "", value: "" });
      refetchSettings();
    } catch {
      toast.error("Failed to save setting");
    }
  };

  const handleDeleteSetting = async (key: string) => {
    if (confirm("Are you sure you want to delete this setting?")) {
      try {
        await deleteSiteSetting(key).unwrap();
        toast.success("Setting deleted successfully");
        refetchSettings();
      } catch {
        toast.error("Failed to delete setting");
      }
    }
  };

  // Handle social operations
  const handleSaveSocial = async () => {
    try {
      if (socialDialog.isEditing) {
        await updateSocialLink({
          id: socialDialog.social!.id,
          ...socialForm,
        }).unwrap();
        toast.success("Social link updated successfully");
      } else {
        await createSocialLink(socialForm).unwrap();
        toast.success("Social link created successfully");
      }
      setSocialDialog({ isOpen: false, isEditing: false });
      setSocialForm({ platform: "", url: "" });
      refetchSocials();
    } catch {
      toast.error("Failed to save social link");
    }
  };

  const handleDeleteSocial = async (id: string) => {
    if (confirm("Are you sure you want to delete this social link?")) {
      try {
        await deleteSocialLink(id).unwrap();
        toast.success("Social link deleted successfully");
        refetchSocials();
      } catch {
        toast.error("Failed to delete social link");
      }
    }
  };

  // Handle city operations
  const handleSaveCity = async () => {
    try {
      if (cityDialog.isEditing) {
        await updateCity({
          id: cityDialog.city!.id,
          name: cityForm.name,
        }).unwrap();
        toast.success("City updated successfully");
      } else {
        await createCity({ name: cityForm.name }).unwrap();
        toast.success("City created successfully");
      }
      setCityDialog({ isOpen: false, isEditing: false });
      setCityForm({ name: "" });
      refetchCities();
    } catch {
      toast.error("Failed to save city");
    }
  };

  const handleDeleteCity = async (id: string) => {
    if (confirm("Are you sure you want to delete this city?")) {
      try {
        await deleteCity(id).unwrap();
        toast.success("City deleted successfully");
        refetchCities();
      } catch {
        toast.error("Failed to delete city");
      }
    }
  };

  // Handle school operations
  const handleSaveSchool = async () => {
    try {
      if (schoolDialog.isEditing) {
        await updateSchool({
          id: schoolDialog.school!.id,
          ...schoolForm,
        }).unwrap();
        toast.success("School updated successfully");
      } else {
        await createSchool(schoolForm).unwrap();
        toast.success("School created successfully");
      }
      setSchoolDialog({ isOpen: false, isEditing: false });
      setSchoolForm({ name: "", cityId: "" });
      refetchSchools();
    } catch {
      toast.error("Failed to save school");
    }
  };

  const handleDeleteSchool = async (id: string) => {
    if (confirm("Are you sure you want to delete this school?")) {
      try {
        await deleteSchool(id).unwrap();
        toast.success("School deleted successfully");
        refetchSchools();
      } catch {
        toast.error("Failed to delete school");
      }
    }
  };

  // Handle job operations
  const handleRetryJob = async (id: string) => {
    try {
      await retryJob(id).unwrap();
      toast.success("Job retry initiated");
      refetchJobs();
    } catch {
      toast.error("Failed to retry job");
    }
  };

  const handleDeleteJob = async (id: string) => {
    if (confirm("Are you sure you want to delete this job?")) {
      try {
        await deleteJob(id).unwrap();
        toast.success("Job deleted successfully");
        refetchJobs();
      } catch {
        toast.error("Failed to delete job");
      }
    }
  };

  const handleClearFailedJobs = async () => {
    if (confirm("Are you sure you want to clear all failed jobs?")) {
      try {
        await clearFailedJobs().unwrap();
        toast.success("Failed jobs cleared successfully");
        refetchJobs();
      } catch {
        toast.error("Failed to clear failed jobs");
      }
    }
  };

  const handleRefreshAll = () => {
    refetchSettings();
    refetchSocials();
    refetchCities();
    refetchSchools();
    refetchJobs();
  };

  const getJobStatusColor = (status: string) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      processing: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            System Administration
          </h1>
          <p className="text-muted-foreground">
            Manage system settings, social links, locations, and background jobs
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefreshAll}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh All
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Site Settings
          </TabsTrigger>
          <TabsTrigger value="socials" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Social Links
          </TabsTrigger>
          <TabsTrigger value="cities" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Cities
          </TabsTrigger>
          <TabsTrigger value="schools" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Schools
          </TabsTrigger>
          <TabsTrigger value="jobs" className="flex items-center gap-2">
            <Server className="h-4 w-4" />
            Background Jobs
          </TabsTrigger>
        </TabsList>

        {/* Site Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Site Configuration</CardTitle>
                  <CardDescription>
                    Manage key-value configuration settings
                  </CardDescription>
                </div>
                <Dialog
                  open={settingDialog.isOpen}
                  onOpenChange={(open) => {
                    setSettingDialog({ isOpen: open, isEditing: false });
                    if (!open) setSettingForm({ key: "", value: "" });
                  }}
                >
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Setting
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {settingDialog.isEditing ? "Edit" : "Add"} Site Setting
                      </DialogTitle>
                      <DialogDescription>
                        {settingDialog.isEditing
                          ? "Update the setting value"
                          : "Add a new site configuration setting"}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="key">Setting Key</Label>
                        <Input
                          id="key"
                          value={settingForm.key}
                          onChange={(e) =>
                            setSettingForm({
                              ...settingForm,
                              key: e.target.value,
                            })
                          }
                          disabled={settingDialog.isEditing}
                          placeholder="e.g., site_name, contact_email"
                        />
                      </div>
                      <div>
                        <Label htmlFor="value">Setting Value</Label>
                        <Textarea
                          id="value"
                          value={settingForm.value}
                          onChange={(e) =>
                            setSettingForm({
                              ...settingForm,
                              value: e.target.value,
                            })
                          }
                          placeholder="Setting value..."
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() =>
                          setSettingDialog({ isOpen: false, isEditing: false })
                        }
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSaveSetting}
                        disabled={
                          isCreatingSetting ||
                          isUpdatingSetting ||
                          !settingForm.key ||
                          !settingForm.value
                        }
                      >
                        {(isCreatingSetting || isUpdatingSetting) && (
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        {settingDialog.isEditing ? "Update" : "Create"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingSettings ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Key</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Updated</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {siteSettings?.map((setting) => (
                      <TableRow key={setting.key}>
                        <TableCell className="font-medium">
                          {setting.key}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {setting.value}
                        </TableCell>
                        <TableCell>
                          {new Date(setting.updatedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSettingDialog({
                                  isOpen: true,
                                  isEditing: true,
                                  setting,
                                });
                                setSettingForm({
                                  key: setting.key,
                                  value: setting.value,
                                });
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteSetting(setting.key)}
                              disabled={isDeletingSetting}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )) ?? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-12">
                          <Settings className="mx-auto h-12 w-12 text-muted-foreground" />
                          <p className="mt-4 text-sm text-muted-foreground">
                            No settings configured yet
                          </p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Social Links Tab */}
        <TabsContent value="socials" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Social Media Links</CardTitle>
                  <CardDescription>
                    Manage social media platform links
                  </CardDescription>
                </div>
                <Dialog
                  open={socialDialog.isOpen}
                  onOpenChange={(open) => {
                    setSocialDialog({ isOpen: open, isEditing: false });
                    if (!open) setSocialForm({ platform: "", url: "" });
                  }}
                >
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Social Link
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {socialDialog.isEditing ? "Edit" : "Add"} Social Link
                      </DialogTitle>
                      <DialogDescription>
                        {socialDialog.isEditing
                          ? "Update the social media link"
                          : "Add a new social media platform link"}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="platform">Platform</Label>
                        <Input
                          id="platform"
                          value={socialForm.platform}
                          onChange={(e) =>
                            setSocialForm({
                              ...socialForm,
                              platform: e.target.value,
                            })
                          }
                          placeholder="e.g., Facebook, YouTube, Instagram"
                        />
                      </div>
                      <div>
                        <Label htmlFor="url">URL</Label>
                        <Input
                          id="url"
                          type="url"
                          value={socialForm.url}
                          onChange={(e) =>
                            setSocialForm({
                              ...socialForm,
                              url: e.target.value,
                            })
                          }
                          placeholder="https://..."
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() =>
                          setSocialDialog({ isOpen: false, isEditing: false })
                        }
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSaveSocial}
                        disabled={
                          isCreatingSocial ||
                          isUpdatingSocial ||
                          !socialForm.platform ||
                          !socialForm.url
                        }
                      >
                        {(isCreatingSocial || isUpdatingSocial) && (
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        {socialDialog.isEditing ? "Update" : "Create"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingSocials ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Platform</TableHead>
                      <TableHead>URL</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {socialLinks?.map((social) => (
                      <TableRow key={social.id}>
                        <TableCell className="font-medium">
                          {social.platform}
                        </TableCell>
                        <TableCell>
                          <a
                            href={social.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline truncate max-w-xs block"
                          >
                            {social.url}
                          </a>
                        </TableCell>
                        <TableCell>
                          {new Date(social.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSocialDialog({
                                  isOpen: true,
                                  isEditing: true,
                                  social,
                                });
                                setSocialForm({
                                  platform: social.platform,
                                  url: social.url,
                                });
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteSocial(social.id)}
                              disabled={isDeletingSocial}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )) ?? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-12">
                          <Globe className="mx-auto h-12 w-12 text-muted-foreground" />
                          <p className="mt-4 text-sm text-muted-foreground">
                            No social links configured yet
                          </p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cities & Schools Tabs */}
        <TabsContent value="cities" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Cities Management</CardTitle>
                  <CardDescription>Manage list of cities</CardDescription>
                </div>
                <Dialog
                  open={cityDialog.isOpen}
                  onOpenChange={(open) => {
                    setCityDialog({ isOpen: open, isEditing: false });
                    if (!open) setCityForm({ name: "" });
                  }}
                >
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add City
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {cityDialog.isEditing ? "Edit" : "Add"} City
                      </DialogTitle>
                      <DialogDescription>
                        {cityDialog.isEditing
                          ? "Update the city name"
                          : "Add a new city to the system"}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="cityName">City Name</Label>
                        <Input
                          id="cityName"
                          value={cityForm.name}
                          onChange={(e) =>
                            setCityForm({ name: e.target.value })
                          }
                          placeholder="City name..."
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() =>
                          setCityDialog({ isOpen: false, isEditing: false })
                        }
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSaveCity}
                        disabled={
                          isCreatingCity || isUpdatingCity || !cityForm.name
                        }
                      >
                        {(isCreatingCity || isUpdatingCity) && (
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        {cityDialog.isEditing ? "Update" : "Create"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingCities ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cities?.map((city) => (
                      <TableRow key={city.id}>
                        <TableCell className="font-medium">
                          {city.name}
                        </TableCell>
                        <TableCell>
                          {new Date(city.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setCityDialog({
                                  isOpen: true,
                                  isEditing: true,
                                  city,
                                });
                                setCityForm({ name: city.name });
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteCity(city.id)}
                              disabled={isDeletingCity}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )) ?? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-12">
                          <MapPin className="mx-auto h-12 w-12 text-muted-foreground" />
                          <p className="mt-4 text-sm text-muted-foreground">
                            No cities configured yet
                          </p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schools" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Schools Management</CardTitle>
                  <CardDescription>
                    Manage list of schools by city
                  </CardDescription>
                </div>
                <Dialog
                  open={schoolDialog.isOpen}
                  onOpenChange={(open) => {
                    setSchoolDialog({ isOpen: open, isEditing: false });
                    if (!open) setSchoolForm({ name: "", cityId: "" });
                  }}
                >
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add School
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {schoolDialog.isEditing ? "Edit" : "Add"} School
                      </DialogTitle>
                      <DialogDescription>
                        {schoolDialog.isEditing
                          ? "Update the school information"
                          : "Add a new school to the system"}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="schoolName">School Name</Label>
                        <Input
                          id="schoolName"
                          value={schoolForm.name}
                          onChange={(e) =>
                            setSchoolForm({
                              ...schoolForm,
                              name: e.target.value,
                            })
                          }
                          placeholder="School name..."
                        />
                      </div>
                      <div>
                        <Label htmlFor="citySelect">City</Label>
                        <Select
                          value={schoolForm.cityId}
                          onValueChange={(value) =>
                            setSchoolForm({ ...schoolForm, cityId: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a city" />
                          </SelectTrigger>
                          <SelectContent>
                            {cities?.map((city) => (
                              <SelectItem key={city.id} value={city.id}>
                                {city.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() =>
                          setSchoolDialog({ isOpen: false, isEditing: false })
                        }
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSaveSchool}
                        disabled={
                          isCreatingSchool ||
                          isUpdatingSchool ||
                          !schoolForm.name ||
                          !schoolForm.cityId
                        }
                      >
                        {(isCreatingSchool || isUpdatingSchool) && (
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        {schoolDialog.isEditing ? "Update" : "Create"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingSchools ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {schools?.map((school) => (
                      <TableRow key={school.id}>
                        <TableCell className="font-medium">
                          {school.name}
                        </TableCell>
                        <TableCell>
                          {school.city?.name || "Unknown City"}
                        </TableCell>
                        <TableCell>
                          {new Date(school.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSchoolDialog({
                                  isOpen: true,
                                  isEditing: true,
                                  school,
                                });
                                setSchoolForm({
                                  name: school.name,
                                  cityId: school.cityId,
                                });
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteSchool(school.id)}
                              disabled={isDeletingSchool}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )) ?? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-12">
                          <Building className="mx-auto h-12 w-12 text-muted-foreground" />
                          <p className="mt-4 text-sm text-muted-foreground">
                            No schools configured yet
                          </p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Background Jobs Tab */}
        <TabsContent value="jobs" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Background Jobs</CardTitle>
                  <CardDescription>
                    Monitor and manage background job queue
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={refetchJobs}
                    disabled={isLoadingJobs}
                  >
                    <RefreshCw
                      className={`mr-2 h-4 w-4 ${
                        isLoadingJobs ? "animate-spin" : ""
                      }`}
                    />
                    Refresh
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleClearFailedJobs}
                    disabled={isClearingJobs}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Clear Failed
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingJobs ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Attempts</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Processed</TableHead>
                      <TableHead className="w-[120px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {jobsData?.data?.map((job) => (
                      <TableRow key={job.id}>
                        <TableCell className="font-medium">
                          {job.type}
                        </TableCell>
                        <TableCell>
                          <Badge className={getJobStatusColor(job.status)}>
                            {job.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {job.attempts}/{job.maxAttempts}
                        </TableCell>
                        <TableCell>
                          {new Date(job.createdAt).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {job.processedAt
                            ? new Date(job.processedAt).toLocaleString()
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            {(job.status === "failed" ||
                              job.status === "pending") && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRetryJob(job.id)}
                                disabled={isRetryingJob}
                                title="Retry Job"
                              >
                                <RefreshCw className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteJob(job.id)}
                              disabled={isDeletingJob}
                              title="Delete Job"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )) ?? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-12">
                          <Server className="mx-auto h-12 w-12 text-muted-foreground" />
                          <p className="mt-4 text-sm text-muted-foreground">
                            No background jobs found
                          </p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
