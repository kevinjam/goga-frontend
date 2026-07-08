import { BrandedStatusPage } from "@/components/branding/branded-status-page";

export default function NotFound() {
  return (
    <BrandedStatusPage
      title="Page not found"
      description="The page you are looking for does not exist or may have been moved."
      actionLabel="Back to Dashboard"
      actionHref="/dashboard"
    />
  );
}
