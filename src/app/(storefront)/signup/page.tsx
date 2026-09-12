import Footer from "@/components/footer/Footer";
import Navbar from "@/components/navbar/Navbar";
import AuthForm from "@/components/auth/AuthForm";
import { Suspense } from "react";

export default function SignupPage() { return <><Navbar /><main className="container-glaze max-w-xl py-12 md:py-20"><Suspense fallback={<div className="h-80" />}><AuthForm mode="signup" /></Suspense></main><Footer /></> }
