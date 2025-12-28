import { Metadata } from "next";
import PostJobClientPage from "./ClientPage";

export const metadata: Metadata = {
  title: "İş İlanı Ver - Mimariproje.com",
  description: "Mimarlık ve inşaat sektöründe iş ilanı verin, yetenekli profesyonelleri bulun.",
};

export default function PostJobPage() {
  return <PostJobClientPage />;
}
