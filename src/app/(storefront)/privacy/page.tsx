import Footer from "@/components/footer/Footer";
import Navbar from "@/components/navbar/Navbar";
import PageIntro from "@/components/storefront/PageIntro";

export default function PrivacyPage() { return <><Navbar /><main><PageIntro eyebrow="Privacy" title={<>Your information, handled with <span className="font-script text-[var(--caramel)]">care.</span></>}>The completed privacy policy will explain how order, delivery, account and review data is stored, used and deleted after the production database and service providers are chosen.</PageIntro></main><Footer /></> }
