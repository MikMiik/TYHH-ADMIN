interface CourseDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function CourseDetailPage({
  params,
}: CourseDetailPageProps) {
  const { slug } = await params;

  // TODO: Implement course detail page
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Course Detail: {slug}</h1>
      <p>Course detail page - to be implemented</p>
    </div>
  );
}
