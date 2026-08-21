import Contact from "@/components/home/Contact";
import Experience from "@/components/home/Experience";
import Hero from "@/components/home/Hero";
import Highlights from "@/components/home/Highlights";
import TechTicker from "@/components/home/TechTicker";
import DefaultLayout from "@/layouts/default";

export default function IndexPage() {
  return (
    <DefaultLayout fullWidth>
      <Hero />
      <TechTicker />
      <Experience />
      <Highlights />
      <Contact />
    </DefaultLayout>
  );
}
