import { Metadata } from "next";
import AdminDashboard from "@/components/admin/admin-dashboard";

export const metadata: Metadata = {
  title: "Admin Panel - Mimariproje.com",
  description: "Platform yönetim paneli - İstatistikler, kullanıcı yönetimi ve sistem kontrolü.",
};

export default function AdminPage() {
  return <AdminDashboard />;
}