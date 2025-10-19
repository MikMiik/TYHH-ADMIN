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
  useGetSocialsQuery,
  useAddSocialMutation,
  useUpdateSocialMutation,
  useDeleteSocialMutation,
  useGetCitiesQuery,
  useAddCityMutation,
  useUpdateCityMutation,
  useDeleteCityMutation,
  useGetTopicsQuery,
  useAddTopicMutation,
  useUpdateTopicMutation,
  useDeleteTopicMutation,
  useGetNotificationsQuery,
  useAddNotificationMutation,
  useUpdateNotificationMutation,
  useDeleteNotificationMutation,
  useGetQueueQuery,
  useGetQueueStatsQuery,
  useRetryQueueJobMutation,
  useDeleteQueueJobMutation,
  type Social,
  type City,
  type Topic,
  type Notification,
  type QueueJob,
} from "@/lib/features/api/systemApi";
import { Edit, Plus, Trash2 } from "lucide-react";

interface SocialForm {
  platform: string;
  url: string;
}

interface CityForm {
  name: string;
}

interface TopicForm {
  title: string;
}

interface NotificationForm {
  title: string;
  message: string;
}

// Socials Management Component
function SocialsTab() {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { data: socials, isLoading: socialsLoading } = useGetSocialsQuery();
  const [addSocial, { isLoading: creating }] = useAddSocialMutation();
  const [updateSocial, { isLoading: updating }] = useUpdateSocialMutation();
  const [deleteSocial, { isLoading: deleting }] = useDeleteSocialMutation();

  const {
    register: registerNew,
    handleSubmit: handleSubmitNew,
    reset: resetNew,
  } = useForm<SocialForm>();
  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
  } = useForm<SocialForm>();

  const onCreateSubmit = async (data: SocialForm) => {
    try {
      await addSocial(data).unwrap();
      toast.success("Social created successfully");
      resetNew();
      setIsAddingNew(false);
    } catch {
      toast.error("Failed to create social");
    }
  };

  const onUpdateSubmit = async (data: SocialForm) => {
    if (!editingId) return;

    try {
      await updateSocial({ id: editingId, data }).unwrap();
      toast.success("Social updated successfully");
      setEditingId(null);
      resetEdit();
    } catch {
      toast.error("Failed to update social");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this social link?")) return;

    try {
      await deleteSocial(id).unwrap();
      toast.success("Social deleted successfully");
    } catch {
      toast.error("Failed to delete social");
    }
  };

  const startEdit = (social: Social) => {
    setEditingId(social.id);
    resetEdit({ platform: social.platform, url: social.url });
  };

  const cancelEdit = () => {
    setEditingId(null);
    resetEdit();
  };

  if (socialsLoading) {
    return <div>Loading socials...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Social Media Links</CardTitle>
            <CardDescription>
              Manage social media platform links
            </CardDescription>
          </div>
          <Button onClick={() => setIsAddingNew(true)} disabled={isAddingNew}>
            <Plus className="h-4 w-4 mr-2" />
            Add Social Link
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
                  <Label htmlFor="new-social-platform">Platform</Label>
                  <Input
                    id="new-social-platform"
                    placeholder="e.g. Facebook, Twitter, Instagram"
                    {...registerNew("platform", {
                      required: "Platform is required",
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-social-url">URL</Label>
                  <Input
                    id="new-social-url"
                    placeholder="https://..."
                    {...registerNew("url", {
                      required: "URL is required",
                    })}
                  />
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
            {socials?.map((social: Social) => (
              <div
                key={social.id}
                className="flex items-center justify-between border rounded-lg p-3"
              >
                {editingId === social.id ? (
                  <form
                    onSubmit={handleSubmitEdit(onUpdateSubmit)}
                    className="flex items-center space-x-2 flex-1 gap-2"
                  >
                    <Input
                      {...registerEdit("platform", {
                        required: "Platform is required",
                      })}
                      placeholder="Platform"
                      className="flex-1"
                    />
                    <Input
                      {...registerEdit("url", {
                        required: "URL is required",
                      })}
                      placeholder="URL"
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
                    <div>
                      <span className="font-medium">{social.platform}</span>
                      <p className="text-sm text-muted-foreground">{social.url}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEdit(social)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(social.id)}
                        disabled={deleting}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
            {socials?.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No social links found. Add your first social link above.
              </div>
            )}
          </div>
        </div>
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

// Topics Management Component
function TopicsTab() {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { data: topics, isLoading: topicsLoading } = useGetTopicsQuery();
  const [addTopic, { isLoading: creating }] = useAddTopicMutation();
  const [updateTopic, { isLoading: updating }] = useUpdateTopicMutation();
  const [deleteTopic, { isLoading: deleting }] = useDeleteTopicMutation();

  const {
    register: registerNew,
    handleSubmit: handleSubmitNew,
    reset: resetNew,
  } = useForm<TopicForm>();
  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
  } = useForm<TopicForm>();

  const onCreateSubmit = async (data: TopicForm) => {
    try {
      await addTopic(data).unwrap();
      toast.success("Topic created successfully");
      resetNew();
      setIsAddingNew(false);
    } catch {
      toast.error("Failed to create topic");
    }
  };

  const onUpdateSubmit = async (data: TopicForm) => {
    if (!editingId) return;

    try {
      await updateTopic({ id: editingId, data }).unwrap();
      toast.success("Topic updated successfully");
      setEditingId(null);
      resetEdit();
    } catch {
      toast.error("Failed to update topic");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this topic?")) return;

    try {
      await deleteTopic(id).unwrap();
      toast.success("Topic deleted successfully");
    } catch {
      toast.error("Failed to delete topic");
    }
  };

  const startEdit = (topic: Topic) => {
    setEditingId(topic.id);
    resetEdit({ title: topic.title });
  };

  const cancelEdit = () => {
    setEditingId(null);
    resetEdit();
  };

  if (topicsLoading) {
    return <div>Loading topics...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Topics Management</CardTitle>
            <CardDescription>
              Manage course topics and categories
            </CardDescription>
          </div>
          <Button onClick={() => setIsAddingNew(true)} disabled={isAddingNew}>
            <Plus className="h-4 w-4 mr-2" />
            Add Topic
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
                  placeholder="Topic title"
                  {...registerNew("title", {
                    required: "Topic title is required",
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
            {topics?.map((topic: Topic) => (
              <div
                key={topic.id}
                className="flex items-center justify-between border rounded-lg p-3"
              >
                {editingId === topic.id ? (
                  <form
                    onSubmit={handleSubmitEdit(onUpdateSubmit)}
                    className="flex items-center space-x-2 flex-1"
                  >
                    <Input
                      {...registerEdit("title", {
                        required: "Topic title is required",
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
                    <div>
                      <span className="font-medium">{topic.title}</span>
                      {topic.slug && (
                        <p className="text-sm text-muted-foreground">
                          Slug: {topic.slug}
                        </p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEdit(topic)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(topic.id)}
                        disabled={deleting}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
            {topics?.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No topics found. Add your first topic above.
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

  const { data: notificationsResponse, isLoading: notificationsLoading } =
    useGetNotificationsQuery();
  const [addNotification, { isLoading: creating }] =
    useAddNotificationMutation();
  const [updateNotification, { isLoading: updating }] =
    useUpdateNotificationMutation();
  const [deleteNotification, { isLoading: deleting }] =
    useDeleteNotificationMutation();

  // Extract notifications and pagination from response
  const notifications = notificationsResponse?.notifications || [];
  const pagination = notificationsResponse?.pagination;

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
      message: notification.message || "",
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
                <Label htmlFor="new-notification-message">Content</Label>
                <textarea
                  id="new-notification-message"
                  placeholder="Notification message"
                  {...registerNew("message")}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
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
                        htmlFor={`edit-notification-message-${notification.id}`}
                      >
                        Message
                      </Label>
                      <textarea
                        id={`edit-notification-message-${notification.id}`}
                        {...registerEdit("message")}
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      />
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
                      {notification.message && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-muted-foreground">
                          {new Date(
                            notification.createdAt
                          ).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-muted-foreground font-medium text-primary">
                          {notification.teacher? `Teacher: ${notification.teacher.name}` : "System Notification"}
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

          {/* Pagination Info */}
          {pagination && notifications.length > 0 && (
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div>
                Showing {(pagination.currentPage - 1) * pagination.limit + 1} to{" "}
                {Math.min(
                  pagination.currentPage * pagination.limit,
                  pagination.totalItems
                )}{" "}
                of {pagination.totalItems} notifications
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
                        Created: {job.createdAt ? new Date(job.createdAt).toLocaleString() : 'N/A'}
                      </div>
                      <div>
                        Updated: {job.updatedAt ? new Date(job.updatedAt).toLocaleString() : 'N/A'}
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
            Manage system settings, topics, and content
          </p>
        </div>
      </div>

      <Tabs defaultValue="socials" className="space-y-4">
        <TabsList>
          <TabsTrigger value="socials">Social Media</TabsTrigger>
          <TabsTrigger value="cities">Cities</TabsTrigger>
          <TabsTrigger value="topics">Topics</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="queue">Background Jobs</TabsTrigger>
        </TabsList>

        <TabsContent value="socials" className="space-y-4">
          <SocialsTab />
        </TabsContent>

        <TabsContent value="cities" className="space-y-4">
          <CitiesTab />
        </TabsContent>

        <TabsContent value="topics" className="space-y-4">
          <TopicsTab />
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
