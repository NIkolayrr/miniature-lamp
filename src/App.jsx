import { memo, useEffect, useRef, useState } from "react";
import { MotionConfig, motion, useMotionTemplate, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { ArrowDown, ArrowUpRight, Blocks, Construction, DraftingCompass, Factory, Menu, Plus, Workflow, X } from "lucide-react";

import framecadMachine from "../assets/framecad-machine.png";
import heroImage from "../assets/hero-lgs-structure.png";
import roofTrusses from "../assets/roof-trusses.jpg";
import constructionSheet from "../construction.png";

const navItems = [
  { href: "#system", id: "system", label: "System" },
  { href: "#assembly", id: "assembly", label: "Assembly" },
  { href: "#applications", id: "applications", label: "Applications" },
  { href: "#process", id: "process", label: "Process" },
];

const deliveryItems = [
  {
    id: "structure",
    title: "Light gauge steel structural systems",
    description: "Wall panels, floors and roof structures engineered to work together, right down to the connection.",
    icon: Blocks,
  },
  {
    id: "manufacturing",
    title: "CNC manufacturing and prefabrication",
    description: "Digital fabrication data drives profile production. Components are prepared for assembly before they reach the site.",
    icon: Factory,
  },
  {
    id: "engineering",
    title: "BIM-based engineering workflows",
    description: "The structural model, detailing and fabrication data come together in one coordinated engineering workflow.",
    icon: DraftingCompass,
  },
  {
    id: "assembly",
    title: "Off-site and on-site assembly",
    description: "Factory-prepared components arrive in a planned sequence, connecting off-site preparation with on-site installation.",
    icon: Construction,
  },
  {
    id: "delivery",
    title: "Industrialized construction solutions",
    description: "Engineering, manufacturing, logistics and assembly share one coordinated process, from design through delivery.",
    icon: Workflow,
  },
];

const stages = [
  {
    label: "Foundation",
    description: "Piles and podium set the grid",
    start: 0,
    end: 0.18,
  },
  {
    label: "Frame",
    description: "Primary structure rises into place",
    start: 0.18,
    end: 0.34,
  },
  {
    label: "Slabs",
    description: "Floor plates complete each level",
    start: 0.34,
    end: 0.56,
  },
  {
    label: "Facade",
    description: "Glazed modules seal the envelope",
    start: 0.56,
    end: 0.8,
  },
  {
    label: "Roof",
    description: "Deck, room, and top layer finish the crown",
    start: 0.8,
    end: 0.92,
  },
  {
    label: "Handover",
    description: "Facade system locked in place",
    start: 0.92,
    end: 1,
  },
];

const systemCards = [
  {
    title: "Wall Panels",
    body: "Cold-formed S350GD+AZ galvanised steel wall systems pre-assembled for rapid installation.",
  },
  {
    title: "Floor Systems",
    body: "Lightweight structural floor systems designed for efficient spans and reduced structural load.",
  },
  {
    title: "Roof Structures",
    body: "Prefabricated roof framing systems optimised for precision manufacturing and fast assembly.",
  },
  {
    title: "Staircases",
    body: "Integrated steel stair systems manufactured within the same structural and production logic.",
  },
];

const applications = [
  {
    title: "Residential",
    body: "Single-storey houses, two-storey buildings, and modular housing.",
  },
  {
    title: "Commercial",
    body: "Retail parks, pavilions, and relocatable commercial structures.",
  },
  {
    title: "Industrial",
    body: "Industrial halls and lightweight facilities for logistics or manufacturing.",
  },
  {
    title: "Prefabricated Systems",
    body: "Partition walls, facade panels, bathroom pods, and repeatable assemblies.",
  },
];

const processSteps = [
  {
    title: "Design",
    body: "Development of a new project or integration of an existing architectural concept.",
  },
  {
    title: "Engineering",
    body: "Structural calculations, detailing, and BIM coordination within a fully digital workflow.",
  },
  {
    title: "BIM Modelling",
    body: "Creation of a coordinated digital twin connecting design, production, and assembly.",
  },
  {
    title: "CNC Manufacturing",
    body: "Automated profile production using FRAMECAD technology.",
  },
  {
    title: "Prefabrication",
    body: "Factory assembly of structural components for faster and more controlled installation.",
  },
  {
    title: "Logistics",
    body: "Coordinated transportation and sequencing of prefabricated elements.",
  },
  {
    title: "Assembly",
    body: "Rapid on-site installation with reduced labour requirements and minimal waste.",
  },
];

const clamp = (value, min = 0, max = 1) => Math.min(Math.max(value, min), max);
const revealEase = [0.16, 1, 0.3, 1];
const revealViewport = { once: true, amount: 0.22, margin: "0px 0px -18% 0px" };

const fadeUpVariants = {
  hidden: { opacity: 0, y: 48 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay, duration: 0.95, ease: revealEase },
  }),
};

const wordGroupVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.035,
      delayChildren: 0.05,
    },
  },
};

const wordVariants = {
  hidden: { opacity: 0, y: "112%" },
  visible: {
    opacity: 1,
    y: "0%",
    transition: { duration: 0.9, ease: revealEase },
  },
};

function getInitialMotionPreference() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getActiveStageIndex(progress) {
  const explicitIndex = stages.findIndex((stage) => progress >= stage.start && progress < stage.end);
  return explicitIndex >= 0
    ? explicitIndex
    : Math.min(stages.length - 1, Math.floor(progress * stages.length));
}

function getConstructionPosition(progress) {
  for (let index = 1; index < stages.length; index += 1) {
    const start = stages[index].start - 0.045;
    const end = stages[index].start + 0.045;
    if (progress <= start) return index - 1;
    if (progress < end) {
      const blend = (progress - start) / (end - start);
      return index - 1 + blend * blend * (3 - 2 * blend);
    }
  }
  return stages.length - 1;
}

function Reveal({ as = "div", children, className = "", delay = 0, ...props }) {
  const Component = motion[as];

  return (
    <Component
      className={className}
      custom={delay}
      initial="hidden"
      variants={fadeUpVariants}
      viewport={revealViewport}
      whileInView="visible"
      {...props}
    >
      {children}
    </Component>
  );
}

function SplitReveal({ as = "h2", text, className = "", id }) {
  const Component = motion[as];
  const words = text.split(" ");

  return (
    <Component
      aria-label={text}
      className={`split-title ${className}`.trim()}
      id={id}
      initial="hidden"
      variants={wordGroupVariants}
      viewport={revealViewport}
      whileInView="visible"
    >
      {words.map((word, index) => (
        <span aria-hidden="true" className="word-wrap" key={`${word}-${index}`}>
          <motion.span variants={wordVariants}>{word}</motion.span>
        </span>
      ))}
    </Component>
  );
}

function ScrollMask({ delay = 0 }) {
  return (
    <motion.div
      aria-hidden="true"
      className="scroll-mask"
      initial={{ height: "100%" }}
      transition={{ delay, duration: 1.15, ease: revealEase }}
      viewport={revealViewport}
      whileInView={{ height: "0%" }}
    />
  );
}

function usePageMotion() {
  const [state, setState] = useState(() => ({
    activeSection: "system",
    headerHidden: false,
    parallaxY: 0,
    reducedMotion: getInitialMotionPreference(),
  }));

  useEffect(() => {
    const root = document.documentElement;
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sectionIds = navItems.map((item) => item.id);
    let lastScrollY = window.scrollY;
    let ticking = false;

    function update() {
      ticking = false;
      const reducedMotion = motionQuery.matches;
      const currentScrollY = window.scrollY;
      const maxScroll = Math.max(1, root.scrollHeight - window.innerHeight);
      const scrollProgress = clamp(currentScrollY / maxScroll);
      const headerHidden =
        !reducedMotion && currentScrollY > lastScrollY && currentScrollY > window.innerHeight * 0.22;

      root.style.setProperty("--scroll-progress", scrollProgress.toFixed(4));

      const parallaxItem = document.querySelector("[data-parallax]");
      let parallaxY = 0;

      if (!reducedMotion && parallaxItem) {
        const rect = parallaxItem.getBoundingClientRect();
        const speed = Number(parallaxItem.dataset.speed || 0);
        const viewportMiddle = window.innerHeight / 2;
        const itemMiddle = rect.top + rect.height / 2;
        parallaxY = (itemMiddle - viewportMiddle) * speed;
      }

      const marker = window.innerHeight * 0.42;
      let activeSection = sectionIds[0];

      sectionIds.forEach((id) => {
        const section = document.getElementById(id);
        if (!section) return;

        const rect = section.getBoundingClientRect();
        if (rect.top <= marker && rect.bottom >= marker) {
          activeSection = id;
        }
      });

      setState((previous) => {
        if (
          previous.activeSection === activeSection &&
          previous.headerHidden === headerHidden &&
          previous.reducedMotion === reducedMotion &&
          Math.abs(previous.parallaxY - parallaxY) < 0.2
        ) {
          return previous;
        }

        return {
          activeSection,
          headerHidden,
          parallaxY,
          reducedMotion,
        };
      });

      lastScrollY = currentScrollY <= 0 ? 0 : currentScrollY;
    }

    function requestUpdate() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    window.addEventListener("load", update);
    motionQuery.addEventListener("change", requestUpdate);
    update();

    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      window.removeEventListener("load", update);
      motionQuery.removeEventListener("change", requestUpdate);
    };
  }, []);

  return state;
}

function Header({ activeSection, isHidden }) {
  const menuRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(() => window.scrollY > window.innerHeight - 100);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (value) => {
    setScrolled(value > window.innerHeight - 100);
  });

  useEffect(() => {
    if (!menuOpen) return;
    const dialog = menuRef.current;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
      if (dialog.open) dialog.close();
    };
  }, [menuOpen]);

  return (
    <>
      <header className={`site-header ${isHidden && !menuOpen ? "is-hide" : ""} ${scrolled ? "is-scrolled" : ""}`.trim()}>
        <button
          className="menu-toggle"
          type="button"
          aria-haspopup="dialog"
          aria-label="Open menu"
          aria-controls="site-menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(true)}
        >
          <Menu size={16} strokeWidth={1.5} aria-hidden="true" />
          <span>Menu</span>
        </button>
        <a className="brand" href="#top" aria-label="INNOSTAL home">
          <span className="brand-mark">INNOSTAL</span>
        </a>
        <a className="header-cta" href="#contact">
          <span className="contact-label">Get in touch</span>
          <span className="contact-label-short">Contact</span>
        </a>
      </header>
      <dialog
        className="site-menu"
        id="site-menu"
        ref={menuRef}
        aria-label="Site navigation"
        onClose={() => setMenuOpen(false)}
      >
        <div className="menu-top">
          <a className="brand" href="#top" onClick={() => setMenuOpen(false)}>
            <span className="brand-mark">INNOSTAL</span>
          </a>
          <button className="menu-close" type="button" aria-label="Close menu" title="Close menu" onClick={() => setMenuOpen(false)}>
            <X size={24} strokeWidth={1.5} aria-hidden="true" />
          </button>
        </div>
        <nav className="primary-nav" aria-label="Primary navigation">
          {[...navItems, { href: "#contact", id: "contact", label: "Contact" }].map((item, index) => (
            <a
              aria-current={activeSection === item.id ? "location" : undefined}
              href={item.href}
              key={item.id}
              onClick={() => setMenuOpen(false)}
            >
              <span className="menu-index" aria-hidden="true">0{index + 1}</span>
              <span>{item.label}</span>
              <ArrowUpRight size={24} strokeWidth={1} aria-hidden="true" />
            </a>
          ))}
        </nav>
        <a className="menu-email" href="mailto:office@innostal.com">office@innostal.com</a>
      </dialog>
    </>
  );
}

function HeroIntro() {
  const introRef = useRef(null);
  // Measure the moving section to keep the pinned hero and expanding edge in sync.
  const { scrollYProgress } = useScroll({
    target: introRef,
    offset: ["start end", "start start"],
  });

  return (
    <div className="hero-intro">
      <Hero scrollYProgress={scrollYProgress} />
      <IntroSection sectionRef={introRef} scrollYProgress={scrollYProgress} />
    </div>
  );
}

function Hero({ scrollYProgress }) {
  const shouldReduceMotion = useReducedMotion();
  const imageScale = useTransform(scrollYProgress, [0, 1], [1.03, 1]);
  const contentY = useTransform(scrollYProgress, [0, 0.5], [0, -40]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.42], [1, 0]);
  const scrollOpacity = useTransform(scrollYProgress, [0, 0.12], [0.75, 0]);

  return (
    <motion.section className="hero" aria-labelledby="hero-title">
      <motion.img
        className="hero-image"
        src={heroImage}
        alt="Light gauge steel house frame at sunset"
        width={1536}
        height={1024}
        loading="eager"
        fetchPriority="high"
        style={shouldReduceMotion ? undefined : { scale: imageScale }}
      />
      <div className="hero-shade" aria-hidden="true" />
      <motion.div
        className="hero-content"
        style={shouldReduceMotion ? undefined : { opacity: contentOpacity, y: contentY }}
      >
        <motion.p className="hero-kicker" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.1 }}>
          Design / Production / Assembly
        </motion.p>
        <motion.h1
          id="hero-title"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 1.1, ease: revealEase }}
        >
          <span>Light gauge steel.</span>
          <span>Beautifully engineered.</span>
        </motion.h1>
        <motion.p className="hero-description" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45, duration: 1 }}>
          From design to assembly. One integrated system.
        </motion.p>
      </motion.div>
      <motion.a className="hero-scroll" href="#system" aria-label="Explore our steel systems" title="Explore our steel systems" style={shouldReduceMotion ? undefined : { opacity: scrollOpacity }}>
        <ArrowDown size={22} strokeWidth={1} aria-hidden="true" />
      </motion.a>
    </motion.section>
  );
}

function DeliveryList() {
  const [openItem, setOpenItem] = useState(0);
  const [isDesktop, setIsDesktop] = useState(() => window.matchMedia("(min-width: 1121px)").matches);
  const listRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();
  const transition = { duration: shouldReduceMotion ? 0 : 0.4, ease: revealEase };

  useEffect(() => {
    const query = window.matchMedia("(min-width: 1121px)");
    const updateLayout = () => setIsDesktop(query.matches);
    updateLayout();
    query.addEventListener("change", updateLayout);
    return () => query.removeEventListener("change", updateLayout);
  }, []);

  function handleKeyDown(event, index) {
    const nextIndex = {
      ArrowDown: (index + 1) % deliveryItems.length,
      ArrowRight: (index + 1) % deliveryItems.length,
      ArrowUp: (index - 1 + deliveryItems.length) % deliveryItems.length,
      ArrowLeft: (index - 1 + deliveryItems.length) % deliveryItems.length,
      Home: 0,
      End: deliveryItems.length - 1,
    }[event.key];

    if (nextIndex === undefined) return;
    event.preventDefault();
    listRef.current?.querySelectorAll(".delivery-trigger")[nextIndex]?.focus();
  }

  return (
    <ol className="delivery-list" aria-label="Integrated construction capabilities" ref={listRef}>
      {deliveryItems.map((item, index) => {
        const isOpen = openItem === index;
        const Icon = item.icon;
        const triggerId = `delivery-${item.id}-trigger`;
        const panelId = `delivery-${item.id}-panel`;

        return (
          <motion.li
            className={isOpen ? "is-open" : undefined}
            initial={shouldReduceMotion ? false : { opacity: 0, x: 16 }}
            key={item.id}
            animate={{ flexGrow: isDesktop && isOpen ? 2 : 1 }}
            transition={{
              opacity: { delay: index * 0.06, duration: shouldReduceMotion ? 0 : 0.65, ease: revealEase },
              x: { delay: index * 0.06, duration: shouldReduceMotion ? 0 : 0.65, ease: revealEase },
              flexGrow: transition,
            }}
            viewport={{ once: true, amount: 0.15 }}
            whileInView={{ opacity: 1, x: 0 }}
          >
            <h3>
              <button
                className="delivery-trigger"
                id={triggerId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenItem(isOpen ? null : index)}
                onKeyDown={(event) => handleKeyDown(event, index)}
              >
                <span className="delivery-index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                <span className="delivery-title">{item.title}</span>
                <span className="delivery-toggle" aria-hidden="true">
                  <motion.span
                    initial={false}
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={transition}
                  >
                    <Plus size={18} strokeWidth={1.25} />
                  </motion.span>
                </span>
              </button>
            </h3>
            <motion.div
              className="delivery-panel"
              id={panelId}
              role="region"
              aria-labelledby={triggerId}
              aria-hidden={!isOpen}
              inert={!isOpen}
              initial={false}
              animate={{
                height: isDesktop || isOpen ? "auto" : 0,
                flexGrow: isDesktop && isOpen ? 1 : 0,
                opacity: isOpen ? 1 : 0,
              }}
              transition={transition}
            >
              <div className="delivery-detail">
                <Icon className="delivery-icon" size={28} strokeWidth={1.25} aria-hidden="true" />
                <p>{item.description}</p>
              </div>
            </motion.div>
            <motion.div
              className="delivery-rule"
              aria-hidden="true"
              initial={false}
              animate={{ scaleX: isOpen ? 1 : 0 }}
              transition={transition}
            />
          </motion.li>
        );
      })}
    </ol>
  );
}

function IntroSection({ sectionRef, scrollYProgress }) {
  const shouldReduceMotion = useReducedMotion();
  const inset = useTransform(scrollYProgress, [0, 0.72, 1], [10, 0, 0]);
  const curve = useTransform(scrollYProgress, [0, 0.55, 1], [48, 40, 0]);
  const clipPath = useMotionTemplate`inset(0 ${inset}% 0 ${inset}% round 50% 50% 0 0 / min(${curve}svh, ${curve}vw) min(${curve}svh, ${curve}vw) 0 0)`;
  const contentOpacity = useTransform(scrollYProgress, [0.18, 0.5], [0, 1]);
  const detailsOpacity = useTransform(scrollYProgress, [0.62, 0.9], [0, 1]);

  return (
    <motion.section
      className="intro-section"
      id="system"
      aria-labelledby="system-title"
      ref={sectionRef}
      style={{ clipPath: shouldReduceMotion ? "none" : clipPath }}
    >
      <motion.div className="intro-inner" style={{ opacity: shouldReduceMotion ? 1 : contentOpacity }}>
        <Reveal className="section-label">A New Construction Model</Reveal>
        <motion.div className="intro-grid" style={{ opacity: shouldReduceMotion ? 1 : detailsOpacity }}>
          <SplitReveal
            id="system-title"
            text="Construction is moving from fragmented site work to coordinated industrial systems."
          />
          <Reveal className="intro-copy" delay={0.12}>
            <p>
              INNOSTAL develops integrated light gauge steel solutions that connect BIM-based
              engineering, CNC production, prefabrication, logistics, and on-site assembly inside
              one controlled workflow.
            </p>
          </Reveal>
          <DeliveryList />
        </motion.div>
      </motion.div>
    </motion.section>
  );
}

function StageList({ activeStageIndex, reducedMotion }) {
  const listRef = useRef(null);
  const previousStageRef = useRef(-1);

  useEffect(() => {
    if (activeStageIndex === previousStageRef.current) return;
    previousStageRef.current = activeStageIndex;

    const list = listRef.current;
    const activeItem = list?.querySelector(`[data-step="${activeStageIndex}"]`);

    if (!list || !activeItem || list.scrollWidth <= list.clientWidth) return;

    const left = activeItem.offsetLeft - (list.clientWidth - activeItem.offsetWidth) / 2;
    list.scrollTo({
      left: Math.max(0, left),
      behavior: reducedMotion ? "auto" : "smooth",
    });
  }, [activeStageIndex, reducedMotion]);

  return (
    <ol className="stage-list" aria-label="Assembly stages" ref={listRef}>
      {stages.map((stage, index) => (
        <motion.li
          className={activeStageIndex === index ? "is-active" : undefined}
          data-step={index}
          data-stage-start={stage.start}
          data-stage-end={stage.end}
          initial={{ opacity: 0, x: -20 }}
          key={stage.label}
          transition={{ delay: index * 0.04, duration: 0.65, ease: revealEase }}
          viewport={{ once: true, amount: 0.1 }}
          whileInView={{ opacity: 1, x: 0 }}
        >
          <span>{String(index + 1).padStart(2, "0")}</span>
          <strong>{stage.label}</strong>
          <small>{stage.description}</small>
        </motion.li>
      ))}
    </ol>
  );
}

const ConstructionLayer = memo(function ConstructionLayer({ stage, index, position, isActive }) {
  const opacity = useTransform(position, (value) => clamp(value - index + 1));
  const visibility = useTransform(position, (value) => value >= index - 1 && value < index + 1 ? "visible" : "hidden");
  const willChange = useTransform(visibility, (value) => value === "visible" ? "opacity" : "auto");

  return (
    <motion.div
      className="construction-layer"
      data-stage={index}
      aria-hidden={!isActive}
      style={{ opacity, visibility, willChange }}
    >
      <div className="construction-viewport">
        <div className="construction-frame">
          <img
            className="construction-sheet"
            src={constructionSheet}
            alt={`${stage.label}: ${stage.description}`}
            width={1024}
            height={1536}
            loading="eager"
            fetchPriority="low"
            decoding="async"
            style={{ transform: `translateY(${(-index * 100) / stages.length}%)` }}
          />
        </div>
      </div>
    </motion.div>
  );
});

function ConstructionScene({ activeStageIndex, progress }) {
  // Keep the outgoing stage opaque; fading both layers would darken the image midway.
  const position = useTransform(progress, getConstructionPosition);

  return (
    <div className="construction-scene">
      {stages.map((stage, index) => (
        <ConstructionLayer
          key={stage.label}
          stage={stage}
          index={index}
          position={position}
          isActive={index === activeStageIndex}
        />
      ))}
    </div>
  );
}

const AssemblySection = memo(function AssemblySection({ reducedMotion }) {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 150,
    damping: 26,
    mass: 0.65,
    restDelta: 0.0001,
    restSpeed: 0.0001,
    skipInitialAnimation: true,
  });
  const progress = useTransform(smoothProgress, (value) => reducedMotion ? 1 : clamp(value));
  const progressLabel = useTransform(progress, (value) => `${Math.round(value * 100).toString().padStart(2, "0")}%`);
  const [activeStageIndex, setActiveStageIndex] = useState(() => getActiveStageIndex(progress.get()));

  // Only stage changes enter React state; continuous motion stays on Motion values.
  useMotionValueEvent(progress, "change", (value) => setActiveStageIndex(getActiveStageIndex(value)));

  return (
    <section className="assembly-section" id="assembly" data-assembly aria-labelledby="assembly-title" ref={sectionRef}>
      <div className="assembly-sticky">
        <div className="assembly-visual" aria-label="Construction stages">
          <ConstructionScene activeStageIndex={activeStageIndex} progress={progress} />
        </div>
        <div className="assembly-copy">
          <div className="assembly-heading">
            <Reveal className="section-label">The System</Reveal>
            <SplitReveal
              id="assembly-title"
              text="A building assembled as a controlled sequence."
            />
            <Reveal as="p" delay={0.1}>
              Engineering data becomes manufactured components, then structured panels, roof
              trusses, envelope elements, and rapid installation on site.
            </Reveal>
          </div>
        </div>
        <div className="assembly-timeline">
          <div className="blueprint-meta">
            <span>Assembly Progress</span>
            <motion.strong>{progressLabel}</motion.strong>
          </div>
          <StageList activeStageIndex={activeStageIndex} reducedMotion={reducedMotion} />
        </div>
      </div>
    </section>
  );
});

function ManufacturingSection() {
  return (
    <section className="manufacturing-section" aria-labelledby="manufacturing-title">
      <div className="manufacturing-media">
        <img src={framecadMachine} alt="FRAMECAD profile manufacturing machine" loading="lazy" />
        <ScrollMask />
      </div>
      <div className="manufacturing-copy">
        <Reveal className="section-label">Precision Through Digital Manufacturing</Reveal>
        <SplitReveal
          id="manufacturing-title"
          text="BIM-based workflows connect engineering directly to CNC production."
        />
        <Reveal as="p" delay={0.1}>
          Automated profile production reduces delays, minimises errors, and improves
          predictability across the entire project lifecycle.
        </Reveal>
        <div className="metric-row">
          <Reveal delay={0.14}>
            <strong>95%</strong>
            <span>recyclable material potential</span>
            <ScrollMask delay={0.12} />
          </Reveal>
          <Reveal delay={0.2}>
            <strong>mm</strong>
            <span>installation-level precision</span>
            <ScrollMask delay={0.18} />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function SystemsSection() {
  return (
    <section className="systems-section" aria-labelledby="systems-title">
      <div className="section-heading">
        <Reveal className="section-label">Structural Systems</Reveal>
        <SplitReveal id="systems-title" text="Light steel components for repeatable delivery." />
      </div>
      <div className="system-cards">
        {systemCards.map((card, index) => (
          <Reveal as="article" delay={index * 0.05} key={card.title}>
            <span className="card-index">{String(index + 1).padStart(2, "0")}</span>
            <h3>{card.title}</h3>
            <p>{card.body}</p>
            <ScrollMask delay={index * 0.05} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function ApplicationsSection({ parallaxY }) {
  return (
    <section className="applications-section" id="applications" aria-labelledby="applications-title">
      <div className="application-image" data-parallax data-speed="0.08" style={{ "--parallax-y": `${parallaxY}px` }}>
        <img src={roofTrusses} alt="Close-up of light steel roof trusses" loading="lazy" />
        <ScrollMask />
      </div>
      <div className="applications-copy">
        <Reveal className="section-label">Applications</Reveal>
        <SplitReveal
          id="applications-title"
          text="Residential. Commercial. Industrial. Modular."
        />
        <div className="application-grid">
          {applications.map((application, index) => (
            <Reveal delay={index * 0.05} key={application.title}>
              <h3>{application.title}</h3>
              <p>{application.body}</p>
              <ScrollMask delay={index * 0.05} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProcessSection() {
  return (
    <section className="process-section" id="process" aria-labelledby="process-title">
      <div className="section-heading">
        <Reveal className="section-label">The Process</Reveal>
        <SplitReveal
          id="process-title"
          text="Integrated workflow from engineering to installation."
        />
      </div>
      <div className="process-track">
        {processSteps.map((step, index) => (
          <Reveal as="article" delay={index * 0.04} key={step.title}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <h3>{step.title}</h3>
            <p>{step.body}</p>
            <ScrollMask delay={index * 0.04} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function AboutSection() {
  return (
    <section className="about-section" aria-labelledby="about-title">
      <Reveal className="section-label">About INNOSTAL</Reveal>
      <div className="about-grid">
        <SplitReveal
          id="about-title"
          text="A technology-driven company specialised in light gauge steel systems and industrialized construction workflows."
        />
        <Reveal delay={0.1}>
          <p>
            Structural engineering, detailing, CNC production, digital configuration, and assembly
            operate within one coordinated system.
          </p>
          <p>
            The result is faster execution, reduced errors, and greater control throughout the
            project lifecycle.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

function ContactSection() {
  return (
    <section className="contact-section" id="contact" aria-labelledby="contact-title">
      <div className="contact-panel">
        <div>
          <Reveal className="section-label">Contact</Reveal>
          <SplitReveal
            id="contact-title"
            text="Start a project with a controlled construction system."
          />
        </div>
        <div className="contact-grid">
          <Reveal as="a" delay={0.04} href="mailto:office@innostal.com">
            <span>Project Inquiries</span>
            office@innostal.com
            <ScrollMask delay={0.04} />
          </Reveal>
          <Reveal as="a" delay={0.08} href="mailto:hello@innostal.com">
            <span>General Information</span>
            hello@innostal.com
            <ScrollMask delay={0.08} />
          </Reveal>
          <Reveal as="address" delay={0.12}>
            <span>Sofia</span>
            12 Vishneva Str., Office 5
            <br />
            Lozenets 1164, Bulgaria
            <ScrollMask delay={0.12} />
          </Reveal>
          <Reveal as="address" delay={0.16}>
            <span>Bucharest</span>
            Soseaua Stefanesti
            <br />
            077010 Stefanestii de Jos, Romania
            <ScrollMask delay={0.16} />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <span>INNOSTAL</span>
      <span>Copyright 2026</span>
    </footer>
  );
}

export default function App() {
  const { activeSection, headerHidden, parallaxY, reducedMotion } = usePageMotion();

  return (
    <MotionConfig reducedMotion="user">
      <Header activeSection={activeSection} isHidden={headerHidden} />
      <main id="top">
        <HeroIntro />
        <AssemblySection reducedMotion={reducedMotion} />
        <ManufacturingSection />
        <SystemsSection />
        <ApplicationsSection parallaxY={parallaxY} />
        <ProcessSection />
        <AboutSection />
        <ContactSection />
      </main>
      <Footer />
    </MotionConfig>
  );
}
