import SmoothScroll from "@/components/SmoothScroll";
import Preloader from "@/components/Preloader";
import Nav from "@/components/Nav";
import ProgressRail from "@/components/ProgressRail";
import Cursor from "@/components/Cursor";
import Arrive from "@/components/scenes/Arrive";
import GoldHall from "@/components/scenes/GoldHall";
import Craft from "@/components/scenes/Craft";
import Collections from "@/components/scenes/Collections";
import Floors from "@/components/scenes/Floors";
import House from "@/components/scenes/House";
import Visit from "@/components/scenes/Visit";

export default function Page() {
  return (
    <>
      <SmoothScroll />
      <Preloader />
      <Nav />
      <ProgressRail />
      <Cursor />
      <main>
        <Arrive />
        <GoldHall />
        <Craft />
        <Collections />
        <Floors />
        <House />
        <Visit />
      </main>
    </>
  );
}
