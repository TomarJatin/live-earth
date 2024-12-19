import AlternatingText from "@/components/LandingPage/AlternatingText";
import Carousel from "@/components/LandingPage/Carousel";
import Hero from "@/components/LandingPage/Hero";
import SkyDive from "@/components/LandingPage/SkyDive";
// import Scene from '../components/Scene'

export default function Home() {
  return (
    <div>
      <Hero />
      <SkyDive />
      <Carousel />
      <AlternatingText />
    </div>
  );
}
