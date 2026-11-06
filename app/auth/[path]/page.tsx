import { Auth } from "@/components/auth/auth";

export default async function AuthPage({
  params,
}: {
  params: Promise<{ path: string }>;
}) {
  const { path } = await params;
  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <Auth path={path} />
    </div>
  );
}