import { Suspense } from "react";
import { connection } from "next/server";
import { HomeHero } from "@/components/home/HomeHero";
import { HomeExplore } from "@/components/home/HomeExplore";
import { HomeIndex } from "@/components/home/HomeIndex";
import { HomeSponsorsApproach } from "@/components/home/HomeSponsorsApproach";
import { HomeMission } from "@/components/home/HomeMission";
import { HomeContactStrip } from "@/components/home/HomeContactStrip";
import { Button } from "@/components/ui/Button";
import { getNextEvent, getPastEvents } from "@/lib/events";
import { getPublishedPosts } from "@/lib/posts";
import { getLatestEpisode } from "@/lib/episodes";
import { getOpenDrive } from "@/lib/drives";

async function RecruitingNote() {
  await connection();
  const openDrive = await getOpenDrive();
  if (!openDrive) return null;

  return (
    <p className="mt-8 border-l-2 border-ember pl-4 text-sm text-ink-soft">
      Applications are open.{" "}
      <Button href={`/join/${openDrive.slug}`} variant="link" className="inline text-sm">
        Apply to the drive
      </Button>
    </p>
  );
}

async function HomeBelow() {
  await connection();
  const nextEvent = await getNextEvent();
  const pastEvents = await getPastEvents();
  const pastEvent = pastEvents[0] ?? null;
  const publishedPosts = await getPublishedPosts();
  const latestPost = publishedPosts[0] ?? null;
  const latestEpisode = await getLatestEpisode();

  return (
    <>
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
    <>
      <HomeHero>
        <Suspense fallback={null}>
          <RecruitingNote />
        </Suspense>
      </HomeHero>
      <Suspense fallback={<div className="min-h-[40vh]" aria-hidden />}>
        <HomeBelow />
      </Suspense>
    </>
  );
}
