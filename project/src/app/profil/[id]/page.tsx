import { Metadata } from "next";
import ArchitectProfileClientPage from "./ClientPage";

export const metadata: Metadata = {
  title: "Mimar Profili - Mimariproje.com",
  description: "Profesyonel mimar profili ve portföy bilgileri.",
};

export default function ArchitectProfilePage({ params }: { params: { id: string } }) {
  return <ArchitectProfileClientPage id={params.id} />;
}