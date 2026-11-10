import { Suspense } from "react";
import { connection } from "next/server";
import { HomeHero } from "@/components/home/HomeHero";
import { HomeExplore } from "@/components/home/HomeExplore";
import { HomeIndex } from "@/components/home/HomeIndex";
import { HomeSponsorsApproach } from "@/components/home/HomeSponsorsApproach";
import { HomeMission } from "@/components/home/HomeMission";
import { HomeContactStrip } from "@/components/home/HomeContactStrip";
import { getNextEvent, getPastEvents } from "@/lib/events";
import { getPublishedPosts } from "@/lib/posts";
import { getLatestEpisode } from "@/lib/episodes";
import { getOpenDrive } from "@/lib/drives";

async function HomeContent() {
  await connection();
  const nextEvent = await getNextEvent();
  const pastEvents = await getPastEvents();
  const pastEvent = pastEvents[0] ?? null;
  const publishedPosts = await getPublishedPosts();
  const latestPost = publishedPosts[0] ?? null;
  const latestEpisode = await getLatestEpisode();
  const openDrive = await getOpenDrive();

  return (
    <>
      <HomeHero
        recruitingHref={openDrive ? `/join/${openDrive.slug}` : null}
      />
      <HomeExplore />
      <HomeIndex
        nextEvent={nextEvent}
        latestPost={latestPost}
        latestEpisode={latestEpisode}
        pastEvent={pastEvent}
      />
      <HomeSponsorsApproach />
      <HomeMission />
      <HomeContactStrip />
    </>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh]" aria-hidden />}>
      <HomeContent />
    </Suspense>
  );
}
