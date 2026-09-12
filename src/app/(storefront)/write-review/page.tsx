import Footer from "@/components/footer/Footer";
import Navbar from "@/components/navbar/Navbar";
import WriteReviewForm from "@/components/reviews/WriteReviewForm";
import { getSessionUser } from "@/lib/auth/session";

export default async function WriteReviewPage() {
  const user = await getSessionUser();

  return <><Navbar /><main className="container-glaze max-w-2xl py-12 md:py-20"><WriteReviewForm profileName={user?.name} /></main><Footer /></>;
}
