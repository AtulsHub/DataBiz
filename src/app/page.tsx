import { Suspense } from "react";
import { connection } from "next/server";
import { HomeHero } from "@/components/home/HomeHero";
import { HomeIndex } from "@/components/home/HomeIndex";
import { HomePathways } from "@/components/home/HomePathways";
import { HomeMission } from "@/components/home/HomeMission";
import { HomeContactStrip } from "@/components/home/HomeContactStrip";
import { getNextEvent, getPastEvents } from "@/lib/events";
import { getPublishedPosts } from "@/content/posts";
import { getLatestEpisode } from "@/content/episodes";
import { getPublishedPathways } from "@/content/pathways";
import { getOpenDrive } from "@/content/drives";

async function HomeContent() {
  await connection();
  const nextEvent = await getNextEvent();
  const pastEvents = await getPastEvents();
  const pastEvent = pastEvents[0] ?? null;
  const latestPost = getPublishedPosts()[0] ?? null;
  const latestEpisode = getLatestEpisode();
  const pathways = getPublishedPathways().slice(0, 3);
  const openDrive = getOpenDrive();

  return (
    <>
      <HomeHero
        recruitingHref={openDrive ? `/join/${openDrive.slug}` : null}
      />
      <HomeIndex
        nextEvent={nextEvent}
        latestPost={latestPost}
        latestEpisode={latestEpisode}
        pastEvent={pastEvent}
      />
      <HomePathways pathways={pathways} />
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
