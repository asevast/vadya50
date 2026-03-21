import CongratulationForm from "@/components/congratulation-form/CongratulationForm";
import HeroSection from "@/components/hero/HeroSection";

export default function Home() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <section className="container mx-auto px-4 py-16">
        <CongratulationForm />
      </section>
    </main>
  );
}
