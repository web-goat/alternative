import { InstagramCTA } from "@/components/InstagramCTA";
import { PosterGallery } from "@/components/PosterGallery";
import { LandingSplash } from "@/components/LandingSplash";
import { HomeClientLayer } from "@/components/HomeClientLayer";

export default function Home() {
    return (
        <main className="min-h-screen bg-[#003B70] text-white">
            <LandingSplash />
            <PosterGallery />
            <InstagramCTA />

            <HomeClientLayer />
        </main>
    );
}