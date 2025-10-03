"use client";

import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  useGetSiteInfoQuery,
  useUpdateSiteInfoMutation,
  useGetCitiesQuery,
  useAddCityMutation,
  useUpdateCityMutation,
  useDeleteCityMutation,
  useGetSchoolsQuery,
  useAddSchoolMutation,
  useUpdateSchoolMutation,
  useDeleteSchoolMutation,
  useGetNotificationsQuery,
  useAddNotificationMutation,
  useUpdateNotificationMutation,
  useDeleteNotificationMutation,
  useGetQueueQuery,
  useGetQueueStatsQuery,
  useRetryQueueJobMutation,
  useDeleteQueueJobMutation,
  type City,
  type School,
  type Notification,
  type QueueJob,
} from "@/lib/features/api/systemApi";
import { Edit, Save, X, Plus, Trash2 } from "lucide-react";

interface SiteInfoForm {
  siteName: string;
  companyName: string;
  email: string;
  taxCode: string;
  phone: string;
  address: string;
}

interface CityForm {
  name: string;
}

interface SchoolForm {
  name: string;
  cityId: number | undefined;
}

interface NotificationForm {
  title: string;
  content: string;
  type: string;
}

// Site Information Component
function SiteInfoTab() {
  const [isEditing, setIsEditing] = useState(false);

  const { data: siteInfo, isLoading: siteInfoLoading } = useGetSiteInfoQuery();
  const [updateSiteInfo, { isLoading: updating }] = useUpdateSiteInfoMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SiteInfoForm>({
    defaultValues: siteInfo || {},
  });

  React.useEffect(() => {
    if (siteInfo) {
      reset(siteInfo);
    }
  }, [siteInfo, reset]);

  const onSubmit = async (data: SiteInfoForm) => {
    try {
      await updateSiteInfo(data).unwrap();
      toast.success("Site information updated successfully");
      setIsEditing(false);
    } catch {
      toast.error("Failed to update site information");
    }
  };

  const handleCancel = () => {
    reset(siteInfo || {});
    setIsEditing(false);
  };

  if (siteInfoLoading) {
    return <div>Loading site information...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Site Information</CardTitle>
            <CardDescription>
              Manage basic site and company information
            </CardDescription>
          </div>
          {!isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="siteName">Site Name</Label>
              <Input
                id="siteName"
                {...register("siteName", { required: "Site name is required" })}
                disabled={!isEditing}
              />
              {errors.siteName && (
                <p className="text-sm text-red-500">
                  {errors.siteName.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                {...register("companyName", {
                  required: "Company name is required",
                })}
                disabled={!isEditing}
              />
              {errors.companyName && (
                <p className="text-sm text-red-500">
                  {errors.companyName.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: "Invalid email address",
                  },
                })}
                disabled={!isEditing}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="taxCode">Tax Code</Label>
              <Input
                id="taxCode"
                {...register("taxCode")}
                disabled={!isEditing}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" {...register("phone")} disabled={!isEditing} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              {...register("address")}
              disabled={!isEditing}
            />
          </div>

          {isEditing && (
            <div className="flex space-x-2 pt-4">
              <Button type="submit" disabled={updating}>
                <Save className="h-4 w-4 mr-2" />
                {updating ? "Saving..." : "Save"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={updating}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}

// Cities Management Component
function CitiesTab() {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { data: cities, isLoading: citiesLoading } = useGetCitiesQuery();
  const [addCity, { isLoading: creating }] = useAddCityMutation();
  const [updateCity, { isLoading: updating }] = useUpdateCityMutation();
  const [deleteCity, { isLoading: deleting }] = useDeleteCityMutation();

  const {
    register: registerNew,
    handleSubmit: handleSubmitNew,
    reset: resetNew,
  } = useForm<CityForm>();
  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
  } = useForm<CityForm>();

  const onCreateSubmit = async (data: CityForm) => {
    try {
      await addCity(data).unwrap();
      toast.success("City created successfully");
      resetNew();
      setIsAddingNew(false);
    } catch {
      toast.error("Failed to create city");
    }
  };

  const onUpdateSubmit = async (data: CityForm) => {
    if (!editingId) return;

    try {
      await updateCity({ id: editingId, data }).unwrap();
      toast.success("City updated successfully");
      setEditingId(null);
      resetEdit();
    } catch {
      toast.error("Failed to update city");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this city?")) return;

    try {
      await deleteCity(id).unwrap();
      toast.success("City deleted successfully");
    } catch {
      toast.error("Failed to delete city");
    }
  };

  const startEdit = (city: City) => {
    setEditingId(city.id);
    resetEdit({ name: city.name });
  };

  const cancelEdit = () => {
    setEditingId(null);
    resetEdit();
  };

  if (citiesLoading) {
    return <div>Loading cities...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Cities Management</CardTitle>
            <CardDescription>
              Manage the list of cities in the system
            </CardDescription>
          </div>
          <Button onClick={() => setIsAddingNew(true)} disabled={isAddingNew}>
            <Plus className="h-4 w-4 mr-2" />
            Add City
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isAddingNew && (
            <form
              onSubmit={handleSubmitNew(onCreateSubmit)}
              className="border rounded-lg p-4"
            >
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="City name"
                  {...registerNew("name", {
                    required: "City name is required",
                  })}
                  className="flex-1"
                />
                <Button type="submit" size="sm" disabled={creating}>
                  {creating ? "Creating..." : "Save"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsAddingNew(false);
                    resetNew();
                  }}
                  disabled={creating}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}

          <div className="space-y-2">
            {cities?.map((city: City) => (
              <div
                key={city.id}
                className="flex items-center justify-between border rounded-lg p-3"
              >
                {editingId === city.id ? (
                  <form
                    onSubmit={handleSubmitEdit(onUpdateSubmit)}
                    className="flex items-center space-x-2 flex-1"
                  >
                    <Input
                      {...registerEdit("name", {
                        required: "City name is required",
                      })}
                      className="flex-1"
                    />
                    <Button type="submit" size="sm" disabled={updating}>
                      {updating ? "Saving..." : "Save"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={cancelEdit}
                      disabled={updating}
                    >
                      Cancel
                    </Button>
                  </form>
                ) : (
                  <>
                    <span className="font-medium">{city.name}</span>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEdit(city)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(city.id)}
                        disabled={deleting}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
            {cities?.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No cities found. Add your first city above.
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Schools Management Component
function SchoolsTab() {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { data: cities } = useGetCitiesQuery();
  const { data: schools, isLoading: schoolsLoading } = useGetSchoolsQuery();
  const [addSchool, { isLoading: creating }] = useAddSchoolMutation();
  const [updateSchool, { isLoading: updating }] = useUpdateSchoolMutation();
  const [deleteSchool, { isLoading: deleting }] = useDeleteSchoolMutation();

  const {
    register: registerNew,
    handleSubmit: handleSubmitNew,
    reset: resetNew,
  } = useForm<SchoolForm>();
  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
  } = useForm<SchoolForm>();

  const onCreateSubmit = async (data: SchoolForm) => {
    try {
      await addSchool({
        name: data.name,
        cityId: data.cityId || undefined,
      }).unwrap();
      toast.success("School created successfully");
      resetNew();
      setIsAddingNew(false);
    } catch {
      toast.error("Failed to create school");
    }
  };

  const onUpdateSubmit = async (data: SchoolForm) => {
    if (!editingId) return;

    try {
      await updateSchool({
        id: editingId,
        data: {
          name: data.name,
          cityId: data.cityId || undefined,
        },
      }).unwrap();
      toast.success("School updated successfully");
      setEditingId(null);
      resetEdit();
    } catch {
      toast.error("Failed to update school");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this school?")) return;

    try {
      await deleteSchool(id).unwrap();
      toast.success("School deleted successfully");
    } catch {
      toast.error("Failed to delete school");
    }
  };

  const startEdit = (school: School) => {
    setEditingId(school.id);
    resetEdit({
      name: school.name,
      cityId: school.cityId || undefined,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    resetEdit();
  };

  if (schoolsLoading) {
    return <div>Loading schools...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Schools Management</CardTitle>
            <CardDescription>
              Manage schools and their city associations
            </CardDescription>
          </div>
          <Button onClick={() => setIsAddingNew(true)} disabled={isAddingNew}>
            <Plus className="h-4 w-4 mr-2" />
            Add School
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isAddingNew && (
            <form
              onSubmit={handleSubmitNew(onCreateSubmit)}
              className="border rounded-lg p-4 space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="new-school-name">School Name</Label>
                  <Input
                    id="new-school-name"
                    placeholder="School name"
                    {...registerNew("name", {
                      required: "School name is required",
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-school-city">City</Label>
                  <select
                    id="new-school-city"
                    {...registerNew("cityId")}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select a city (optional)</option>
                    {cities?.map((city) => (
                      <option key={city.id} value={city.id}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button type="submit" size="sm" disabled={creating}>
                  {creating ? "Creating..." : "Save"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsAddingNew(false);
                    resetNew();
                  }}
                  disabled={creating}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}

          <div className="space-y-2">
            {schools?.map((school: School) => (
              <div key={school.id} className="border rounded-lg p-4">
                {editingId === school.id ? (
                  <form
                    onSubmit={handleSubmitEdit(onUpdateSubmit)}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`edit-school-name-${school.id}`}>
                          School Name
                        </Label>
                        <Input
                          id={`edit-school-name-${school.id}`}
                          {...registerEdit("name", {
                            required: "School name is required",
                          })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`edit-school-city-${school.id}`}>
                          City
                        </Label>
                        <select
                          id={`edit-school-city-${school.id}`}
                          {...registerEdit("cityId")}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="">Select a city (optional)</option>
                          {cities?.map((city) => (
                            <option key={city.id} value={city.id}>
                              {city.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button type="submit" size="sm" disabled={updating}>
                        {updating ? "Saving..." : "Save"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={cancelEdit}
                        disabled={updating}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{school.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {school.city
                          ? `City: ${school.city.name}`
                          : "No city assigned"}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEdit(school)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(school.id)}
                        disabled={deleting}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {schools?.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No schools found. Add your first school above.
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Notifications Management Component
function NotificationsTab() {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { data: notifications, isLoading: notificationsLoading } =
    useGetNotificationsQuery();
  const [addNotification, { isLoading: creating }] =
    useAddNotificationMutation();
  const [updateNotification, { isLoading: updating }] =
    useUpdateNotificationMutation();
  const [deleteNotification, { isLoading: deleting }] =
    useDeleteNotificationMutation();

  const {
    register: registerNew,
    handleSubmit: handleSubmitNew,
    reset: resetNew,
  } = useForm<NotificationForm>();
  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
  } = useForm<NotificationForm>();

  const onCreateSubmit = async (data: NotificationForm) => {
    try {
      await addNotification(data).unwrap();
      toast.success("Notification created successfully");
      resetNew();
      setIsAddingNew(false);
    } catch {
      toast.error("Failed to create notification");
    }
  };

  const onUpdateSubmit = async (data: NotificationForm) => {
    if (!editingId) return;

    try {
      await updateNotification({ id: editingId, data }).unwrap();
      toast.success("Notification updated successfully");
      setEditingId(null);
      resetEdit();
    } catch {
      toast.error("Failed to update notification");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this notification?")) return;

    try {
      await deleteNotification(id).unwrap();
      toast.success("Notification deleted successfully");
    } catch {
      toast.error("Failed to delete notification");
    }
  };

  const startEdit = (notification: Notification) => {
    setEditingId(notification.id);
    resetEdit({
      title: notification.title,
      content: notification.content || "",
      type: notification.type || "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    resetEdit();
  };

  if (notificationsLoading) {
    return <div>Loading notifications...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Notifications Management</CardTitle>
            <CardDescription>Manage system notifications</CardDescription>
          </div>
          <Button onClick={() => setIsAddingNew(true)} disabled={isAddingNew}>
            <Plus className="h-4 w-4 mr-2" />
            Add Notification
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isAddingNew && (
            <form
              onSubmit={handleSubmitNew(onCreateSubmit)}
              className="border rounded-lg p-4 space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="new-notification-title">Title</Label>
                <Input
                  id="new-notification-title"
                  placeholder="Notification title"
                  {...registerNew("title", { required: "Title is required" })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-notification-content">Content</Label>
                <textarea
                  id="new-notification-content"
                  placeholder="Notification content"
                  {...registerNew("content")}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-notification-type">Type</Label>
                <select
                  id="new-notification-type"
                  {...registerNew("type")}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select type (optional)</option>
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="error">Error</option>
                  <option value="success">Success</option>
                </select>
              </div>
              <div className="flex space-x-2">
                <Button type="submit" size="sm" disabled={creating}>
                  {creating ? "Creating..." : "Save"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsAddingNew(false);
                    resetNew();
                  }}
                  disabled={creating}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}

          <div className="space-y-2">
            {notifications?.map((notification: Notification) => (
              <div key={notification.id} className="border rounded-lg p-4">
                {editingId === notification.id ? (
                  <form
                    onSubmit={handleSubmitEdit(onUpdateSubmit)}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label
                        htmlFor={`edit-notification-title-${notification.id}`}
                      >
                        Title
                      </Label>
                      <Input
                        id={`edit-notification-title-${notification.id}`}
                        {...registerEdit("title", {
                          required: "Title is required",
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor={`edit-notification-content-${notification.id}`}
                      >
                        Content
                      </Label>
                      <textarea
                        id={`edit-notification-content-${notification.id}`}
                        {...registerEdit("content")}
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor={`edit-notification-type-${notification.id}`}
                      >
                        Type
                      </Label>
                      <select
                        id={`edit-notification-type-${notification.id}`}
                        {...registerEdit("type")}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="">Select type (optional)</option>
                        <option value="info">Info</option>
                        <option value="warning">Warning</option>
                        <option value="error">Error</option>
                        <option value="success">Success</option>
                      </select>
                    </div>
                    <div className="flex space-x-2">
                      <Button type="submit" size="sm" disabled={updating}>
                        {updating ? "Saving..." : "Save"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={cancelEdit}
                        disabled={updating}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium">{notification.title}</h3>
                      {notification.content && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {notification.content}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        {notification.type && (
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              notification.type === "error"
                                ? "bg-red-100 text-red-800"
                                : notification.type === "warning"
                                ? "bg-yellow-100 text-yellow-800"
                                : notification.type === "success"
                                ? "bg-green-100 text-green-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {notification.type}
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {new Date(
                            notification.createdAt
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEdit(notification)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(notification.id)}
                        disabled={deleting}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {notifications?.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No notifications found. Add your first notification above.
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Queue Management Component
function QueueTab() {
  const { data: queueResponse, isLoading: queueLoading } = useGetQueueQuery();
  const { data: stats, isLoading: statsLoading } = useGetQueueStatsQuery();
  const [retryJob, { isLoading: retrying }] = useRetryQueueJobMutation();
  const [deleteJob, { isLoading: deleting }] = useDeleteQueueJobMutation();

  // Extract jobs and pagination from response
  const queue = queueResponse?.jobs || [];
  const pagination = queueResponse?.pagination;

  const handleRetry = async (id: number) => {
    try {
      await retryJob(id).unwrap();
      toast.success("Job retry initiated");
    } catch {
      toast.error("Failed to retry job");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this job?")) return;

    try {
      await deleteJob(id).unwrap();
      toast.success("Job deleted successfully");
    } catch {
      toast.error("Failed to delete job");
    }
  };

  if (queueLoading || statsLoading) {
    return <div>Loading queue information...</div>;
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>Background Jobs Queue</CardTitle>
        <CardDescription>
          Monitor and manage background job queue
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Queue Stats */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-yellow-50 p-3 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {stats.pending}
                </div>
                <div className="text-sm text-yellow-600">Pending</div>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {stats.processing}
                </div>
                <div className="text-sm text-purple-600">Processing</div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {stats.completed}
                </div>
                <div className="text-sm text-green-600">Completed</div>
              </div>
              <div className="bg-red-50 p-3 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {stats.failed}
                </div>
                <div className="text-sm text-red-600">Failed</div>
              </div>
            </div>
          )}

          {/* Job List */}
          <div className="space-y-2">
            {queue?.map((job: QueueJob) => (
              <div key={job.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          job.status === "failed"
                            ? "bg-red-100 text-red-800"
                            : job.status === "processing"
                            ? "bg-purple-100 text-purple-800"
                            : job.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {job.status}
                      </span>
                      {job.type && (
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                          {job.type}
                        </span>
                      )}
                    </div>

                    <div className="text-sm text-muted-foreground space-y-1">
                      <div>ID: {job.id}</div>
                      <div>
                        Retries: {job.retriesCount}/{job.maxRetries}
                      </div>
                      <div>
                        Created: {new Date(job.createdAt).toLocaleString()}
                      </div>
                      <div>
                        Updated: {new Date(job.updatedAt).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-2 ml-4">
                    {job.status === "failed" &&
                      job.retriesCount < job.maxRetries && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRetry(job.id)}
                          disabled={retrying}
                        >
                          Retry
                        </Button>
                      )}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(job.id)}
                      disabled={deleting}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {queue?.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No jobs in queue.
              </div>
            )}
          </div>

          {/* Pagination Info */}
          {pagination && queue.length > 0 && (
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div>
                Showing {(pagination.currentPage - 1) * pagination.limit + 1} to{" "}
                {Math.min(
                  pagination.currentPage * pagination.limit,
                  pagination.totalItems
                )}{" "}
                of {pagination.totalItems} jobs
              </div>
              <div>
                Page {pagination.currentPage} of {pagination.totalPages}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function SystemPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            System Administration
          </h1>
          <p className="text-muted-foreground">
            Manage system settings and locations
          </p>
        </div>
      </div>

      <Tabs defaultValue="siteinfo" className="space-y-4">
        <TabsList>
          <TabsTrigger value="siteinfo">Site Information</TabsTrigger>
          <TabsTrigger value="cities">Cities</TabsTrigger>
          <TabsTrigger value="schools">Schools</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="queue">Background Jobs</TabsTrigger>
        </TabsList>

        <TabsContent value="siteinfo" className="space-y-4">
          <SiteInfoTab />
        </TabsContent>

        <TabsContent value="cities" className="space-y-4">
          <CitiesTab />
        </TabsContent>

        <TabsContent value="schools" className="space-y-4">
          <SchoolsTab />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <NotificationsTab />
        </TabsContent>

        <TabsContent value="queue" className="space-y-4">
          <QueueTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
