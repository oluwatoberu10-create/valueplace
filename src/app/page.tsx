import Image from "next/image";
import Link from "next/link";
import { ContactSection } from "@/components/ContactSection";
import { FoodCard } from "@/components/FoodCard";
import { Gallery } from "@/components/Gallery";
import { SampleNotice, SectionHeading, StripeBand } from "@/components/ui";
import { menu } from "@/config/menu";

function Hero() {
  return (
    <section className="facade relative overflow-hidden">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-14 sm:px-6 sm:py-20 lg:min-h-[calc(100dvh-4.5rem)] lg:grid-cols-[1.1fr_1fr] lg:py-16">
        <div>
          <h1 className="font-display text-[3.4rem] leading-[0.98] text-cream sm:text-7xl xl:text-[5.75rem]">
            <span className="rise block">Good Food.</span>
            <span className="rise block [--d:.1s]">Great Taste.</span>
            <span className="rise block text-gold [--d:.2s]">Value Plus.</span>
          </h1>
          <p className="rise mt-7 max-w-lg text-lg leading-relaxed text-cream/85 [--d:.35s] sm:text-xl">
            Enjoy delicious meals, freshly prepared and served with care. Discover your favorites and order directly
            from Value Plus Place Restaurant.
          </p>
          <div className="rise mt-9 flex flex-col gap-3 [--d:.45s] sm:flex-row">
            <Link href="/menu" className="btn btn-gold !min-h-14 !px-8 !text-lg">
              Explore Our Menu
            </Link>
            <Link href="/menu" className="btn btn-outline-light !min-h-14 !px-8 !text-lg">
              Order Now
            </Link>
          </div>
        </div>

        <div className="rise relative mx-auto w-full max-w-md pb-14 [--d:.25s] sm:max-w-lg lg:pb-20">
          <div className="relative aspect-[6/7] w-[86%] border border-gold/60 p-2 sm:p-3">
            <div className="relative h-full w-full overflow-hidden">
              <Image
                src="/images/menu/glazed-wings.webp"
                alt="Glazed chicken wings on a white plate"
                fill
                priority
                sizes="(min-width: 1024px) 440px, 80vw"
                className="object-cover"
              />
            </div>
          </div>
          <div className="absolute right-0 bottom-0 w-[58%] border-[6px] border-wine-900 shadow-[0_24px_50px_-20px_rgba(0,0,0,.7)]">
            <div className="relative aspect-[1000/846]">
              <Image
                src="/images/menu/peppered-fish.webp"
                alt="Peppered fish with a wedge of lime"
                fill
                priority
                sizes="(min-width: 1024px) 300px, 55vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturedMeals() {
  const featured = menu.filter((m) => m.featured);
  return (
    <section className="bg-cream py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading eyebrow="From our kitchen" title="Featured meals" />
          <Link href="/menu" className="btn btn-ghost">
            See the full menu
          </Link>
        </div>
        <SampleNotice className="mt-6" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {featured.map((item) => (
            <FoodCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}

function About() {
  return (
    <section id="about" className="bg-paper py-20 sm:py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-20">
        <div className="relative mr-4 mb-4">
          <div aria-hidden="true" className="facade absolute inset-0 translate-x-4 translate-y-4" />
          <div className="relative aspect-[1036/899]">
            <Image
              src="/images/restaurant/exterior-front.webp"
              alt="The front of the striped Value Plus Place building, with its entrance gate and sign"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
        <div>
          <SectionHeading eyebrow="About us" title="More Than Just a Meal. It's an Experience." />
          <p className="mt-6 text-lg leading-relaxed text-ink-soft">
            You can&apos;t miss us. Value Plus Place is the tall striped building, with a bakery and a restaurant under
            one roof. Whether you&apos;re stopping in for lunch or dinner, or ordering ahead from your phone, we&apos;re
            glad to feed you.
          </p>
          <dl className="mt-8 grid gap-6 border-t border-wine-800/15 pt-6 sm:grid-cols-2">
            <div>
              <dt className="font-display text-2xl text-wine-800">Bakery</dt>
              <dd className="mt-1 text-ink-soft">Hygienic bread</dd>
            </div>
            <div>
              <dt className="font-display text-2xl text-wine-800">Restaurant</dt>
              <dd className="mt-1 text-ink-soft">Healthy food, lunch &amp; dinner</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}

function GallerySection() {
  return (
    <section id="gallery" className="bg-wine-900 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading eyebrow="Gallery" title="Take a look around" light />
        <div className="mt-10">
          <Gallery />
        </div>
      </div>
    </section>
  );
}

function CallToAction() {
  return (
    <section className="grid bg-paper md:grid-cols-2">
      <div className="relative min-h-72 md:min-h-[28rem]">
        <Image
          src="/images/menu/beef-skewers.webp"
          alt="Beef skewers with green pepper, red onion and cherry tomato"
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-cover"
        />
      </div>
      <div className="flex flex-col items-start justify-center bg-gold/20 px-6 py-16 sm:px-12 lg:px-20">
        <h2 className="font-display text-4xl leading-[1.05] text-wine-800 sm:text-6xl">Craving Something Delicious?</h2>
        <p className="mt-4 text-xl text-ink-soft">Your next favorite meal is just a few clicks away.</p>
        <Link href="/menu" className="btn btn-primary mt-8 !min-h-14 !px-8 !text-lg">
          Order Your Meal
        </Link>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <main>
      <Hero />
      <StripeBand />
      <FeaturedMeals />
      <About />
      <GallerySection />
      <CallToAction />
      <ContactSection />
    </main>
  );
}
