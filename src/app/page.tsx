import Header from "@/components/Header";
import Hero from "@/components/Hero";
import About from "@/components/About";
import FeaturedBooks from "@/components/FeaturedBooks";
import Services from "@/components/Services";
import Testimonials from "@/components/Testimonials";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <Header />
      <Hero />
      <About />
      <FeaturedBooks />
      <Services />
      <Testimonials />
      <Contact />
      <Footer />
    </main>
  );
}
