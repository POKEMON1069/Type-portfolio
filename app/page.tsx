import { ArrowDown, ArrowRight, ArrowUpRight } from "lucide-react";

import {
  Link000,
  Link001,
  Link002,
  Link003,
  Link004,
  Link005,
} from "@/components/ui/animated-links";
import { CursorDrivenParticleTypography } from "@/components/ui/cursor-driven-particle-typography";
import PixelTrail from "@/components/ui/pixel-trail";
import PolaroidLineCarousel, {
  type Slide,
} from "@/components/ui/polaroid-line-carousel";
import { SterlingGateKineticNavigation } from "@/components/ui/sterling-gate-kinetic-navigation";

const unsplash = (photoId: string) =>
  `https://images.unsplash.com/${photoId}?q=80&w=1800&auto=format&fit=crop`;

const selectedSlides: Slide[] = [
  {
    image: unsplash("photo-1506905925346-21bda4d32df4"),
    title: "Above the Clouds",
    caption: "Valais, Switzerland — sunrise at 3,100 m.",
    alt: "Mountain peaks above a sea of clouds at sunrise",
  },
  {
    image: unsplash("photo-1501785888041-af3ef285b470"),
    title: "Glass Lake",
    caption: "Lago di Braies, a rowboat at noon.",
    alt: "A quiet alpine lake surrounded by forested mountains",
  },
  {
    image: unsplash("photo-1469474968028-56623f02e42e"),
    title: "Gold Valley",
    caption: "Late light pouring over the ridge.",
    alt: "Sunlight falling across a layered mountain valley",
  },
  {
    image: unsplash("photo-1464822759023-fed622ff2c3b"),
    title: "Snow Line",
    caption: "Pines, river flats and the high range.",
    alt: "Snow-covered mountain peaks in clear afternoon light",
  },
  {
    image: unsplash("photo-1500534314209-a25ddb2bd429"),
    title: "Blue Ridges",
    caption: "Seven layers of haze before dusk.",
    alt: "Blue mountain ridges fading into the distance",
  },
  {
    image: unsplash("photo-1433086966358-54859d0ed716"),
    title: "Falls Bridge",
    caption: "Multnomah Falls after the rain.",
    alt: "A waterfall dropping through a green forest",
  },
];

const services = [
  {
    number: "01",
    title: "Find the story",
    text: "Positioning, direction, and a clear idea to carry through every interaction.",
  },
  {
    number: "02",
    title: "Give it a shape",
    text: "A tactile visual system, confident typography, and details with a point of view.",
  },
  {
    number: "03",
    title: "Make it move",
    text: "Responsive front-end craft that feels considered, fast, and a little bit alive.",
  },
];

export default function Home() {
  return (
    <>
      <SterlingGateKineticNavigation />
      <main id="top">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-pixel-layer" aria-hidden="true">
            <PixelTrail
              pixelSize={34}
              fadeDuration={680}
              delay={45}
              pixelClassName="bg-[#d8e577]"
            />
          </div>
          <div className="hero-noise" aria-hidden="true" />

          <div className="hero-shell page-shell">
            <div className="hero-topline">
              <span>INDEPENDENT DESIGN / DEVELOPMENT</span>
              <span className="availability">
                <i aria-hidden="true" />
                OPEN FOR SELECT PROJECTS
              </span>
            </div>

            <div className="hero-main">
              <div className="hero-copy">
                <p className="eyebrow hero-eyebrow">
                  <span>01</span> A CREATIVE PRACTICE
                </p>
                <h1 id="hero-title">
                  Good ideas
                  <br />
                  deserve a little
                  <br />
                  <em>feeling.</em>
                </h1>
                <p className="hero-description">
                  Thoughtful digital experiences, built with curiosity, clarity,
                  and a human touch.
                </p>
                <a className="hero-inline-link" href="#about">
                  A little about the approach <ArrowRight aria-hidden="true" />
                </a>
              </div>

              <div
                className="hero-motion"
                aria-label="Interactive particle typography: move your cursor over the word"
              >
                <div
                  className="motion-orbit motion-orbit--outer"
                  aria-hidden="true"
                />
                <div
                  className="motion-orbit motion-orbit--inner"
                  aria-hidden="true"
                />
                <div
                  className="motion-cross motion-cross--one"
                  aria-hidden="true"
                />
                <div
                  className="motion-cross motion-cross--two"
                  aria-hidden="true"
                />
                <p className="motion-note motion-note--top">
                  A SMALL STUDY IN MOVEMENT
                </p>
                <CursorDrivenParticleTypography
                  text="MOVE"
                  fontSize={230}
                  particleSize={1.65}
                  particleDensity={5}
                  dispersionStrength={13}
                  returnSpeed={0.065}
                  color="#d8e577"
                  className="hero-particle-canvas"
                />
                <p className="motion-note motion-note--bottom">
                  <span>01 / 03</span>
                  <span>MOVE YOUR CURSOR</span>
                </p>
              </div>
            </div>

            <div className="hero-bottomline">
              <a href="#work" className="hero-scroll-link">
                SCROLL TO EXPLORE <ArrowDown aria-hidden="true" />
              </a>
              <p>
                Made with care,
                <br />
                for the long way around.
              </p>
              <span className="hero-coordinate">MADE FOR WHAT&apos;S NEXT</span>
            </div>
          </div>
        </section>

        <section
          className="about-section"
          id="about"
          aria-labelledby="about-title"
        >
          <div className="page-shell">
            <div className="section-marker">
              <span>01 / THE APPROACH</span>
              <span>GOOD FORM FOLLOWS GOOD FEELING</span>
            </div>
            <div className="about-grid">
              <h2 id="about-title">
                Make it useful.
                <br />
                Make it <em>felt.</em>
              </h2>
              <div className="about-copy">
                <p className="about-lede">
                  The best digital work earns its place in someone&apos;s day.
                  It&apos;s clear before it&apos;s clever, considered in the
                  details, and joyful to use.
                </p>
                <p>
                  From the first sketch to the last tiny transition, I bring
                  strategy, visual design, and front-end development into one
                  continuous process. The result is a little less noise—and a
                  lot more meaning.
                </p>
                <Link000 href="#practice" className="about-link">
                  How I can help <ArrowUpRight aria-hidden="true" />
                </Link000>
              </div>
            </div>
            <div className="about-footnote">
              <span>DESIGN WITH INTENTION</span>
              <span>BUILD WITH FEELING</span>
              <span>LEAVE ROOM FOR PLAY</span>
            </div>
          </div>
        </section>

        <section
          className="work-section"
          id="work"
          aria-labelledby="work-title"
        >
          <div className="page-shell work-heading">
            <div className="section-marker section-marker--work">
              <span>02 / SELECTED WORK</span>
              <span>A FEW PLACES TO WANDER</span>
            </div>
            <div className="work-heading-grid">
              <h2 id="work-title">
                Collected
                <br />
                <em>light &amp; place.</em>
              </h2>
              <p>
                A small collection of landscapes, moments, and visual notes.
                Drag the line, pick a print, or let the afternoon drift by.
              </p>
            </div>
          </div>
          <PolaroidLineCarousel
            slides={selectedSlides}
            height="min(78svh, 760px)"
            cardWidth={310}
            sag={54}
            swing={0.95}
            autoplay={5200}
            string="#8d887a"
            background="#e8e6dd"
            ink="#282a23"
            ariaLabel="Selected landscape photographs"
            className="portfolio-carousel"
          />
          <div className="page-shell work-caption">
            <span>FIELD NOTES / VOL. 01</span>
            <span>DRAG THE PRINTS OR USE THE ARROWS</span>
          </div>
        </section>

        <section
          className="practice-section"
          id="practice"
          aria-labelledby="practice-title"
        >
          <div className="page-shell">
            <div className="section-marker section-marker--practice">
              <span>03 / FROM FIRST THOUGHT TO FINISH</span>
              <span>STRATEGY · DESIGN · CODE</span>
            </div>
            <div className="practice-heading">
              <h2 id="practice-title">
                Thoughtful from first sketch
                <br />
                to <em>last detail.</em>
              </h2>
              <p>
                One joined-up process for brands and people who want their
                digital presence to feel unmistakably theirs.
              </p>
            </div>
            <div className="service-grid">
              {services.map((service) => (
                <article className="service-card" key={service.number}>
                  <span className="service-number">{service.number}</span>
                  <div className="service-card-bottom">
                    <h3>{service.title}</h3>
                    <p>{service.text}</p>
                  </div>
                  <ArrowUpRight className="service-arrow" aria-hidden="true" />
                </article>
              ))}
            </div>
          </div>
        </section>

        <footer
          className="contact-section"
          id="contact"
          aria-labelledby="contact-title"
        >
          <div className="page-shell">
            <div className="section-marker section-marker--contact">
              <span>04 / YOUR TURN</span>
              <span>GOOD THINGS START WITH A HELLO</span>
            </div>
            <div className="contact-main">
              <h2 id="contact-title">
                Have a good
                <br />
                <em>one in mind?</em>
              </h2>
              <div className="contact-aside">
                <p>
                  For a new project, a collaboration, or a conversation about
                  the web.
                </p>
                <a className="contact-email" href="mailto:hello@example.com">
                  hello@example.com <ArrowUpRight aria-hidden="true" />
                </a>
                <span className="contact-placeholder-note">
                  Replace this demo email with your own address.
                </span>
              </div>
            </div>

            <div className="micro-links">
              <div className="micro-links-heading">
                <span>SMALL DETAILS / BIG FEELING</span>
                <span>LINK STUDIES — 01 TO 05</span>
              </div>
              <div className="micro-links-row">
                <Link001 href="#about">The approach</Link001>
                <Link002 href="#work">Selected work</Link002>
                <Link003 href="#practice">The practice</Link003>
                <Link004 href="#contact">Say hello</Link004>
                <Link005 href="#top">Back to top</Link005>
              </div>
            </div>

            <div className="footer-bottom">
              <Link000 href="#top" className="footer-back-top">
                PORTFOLIO / 2026
              </Link000>
              <span>DESIGNED WITH INTENTION, BUILT WITH CARE.</span>
              <span>© 2026</span>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
