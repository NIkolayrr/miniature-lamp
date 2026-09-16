import { memo, useEffect, useRef, useState } from "react";
import { cubicBezier } from "motion";
import { MotionConfig, motion, useMotionTemplate, useMotionValue, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { ArrowDown, ArrowUp, ArrowUpRight, Blocks, Construction, DraftingCompass, Factory, Menu, Plus, Workflow, X } from "lucide-react";

import framecadMachine from "../assets/framecad-machine.png";
import heroImage from "../assets/hero-lgs-structure.png";
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
const assemblyRevealEnd = 0.28;
const revealEase = [0.16, 1, 0.3, 1];
const revealViewport = { once: true, amount: 0.12, margin: "0px 0px -32px 0px" };

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

function useSectionScroll(offset = ["start end", "end start"]) {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset });
  const progress = useSpring(scrollYProgress, {
    stiffness: 150,
    damping: 26,
    mass: 0.65,
    restDelta: 0.0001,
    restSpeed: 0.0001,
    skipInitialAnimation: true,
  });
  return { sectionRef, progress };
}

function useCompactLayout() {
  const [compact, setCompact] = useState(() => window.matchMedia("(max-width: 1024px)").matches);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 1024px)");
    const update = () => setCompact(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return compact;
}

function SideReveal({ children, className, from = "left", delay = 0, reducedMotion, ...props }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: reducedMotion ? 1 : 0, x: reducedMotion ? 0 : from === "left" ? -48 : 48 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.16 }}
      transition={{ duration: reducedMotion ? 0 : 0.9, delay, ease: revealEase }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

function usePageMotion() {
  const [state, setState] = useState(() => ({
    activeSection: "system",
    headerHidden: false,
    reducedMotion: getInitialMotionPreference(),
  }));

  useEffect(() => {
    const root = document.documentElement;
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sectionIds = [...navItems.map((item) => item.id), "contact"];
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
          previous.reducedMotion === reducedMotion
        ) {
          return previous;
        }

        return {
          activeSection,
          headerHidden,
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

function StageList({ activeStageIndex, reducedMotion, onStageSelect, animatedSelection }) {
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
    <ol className={`stage-list${animatedSelection ? " has-animated-selection" : ""}`} aria-label="Assembly stages" ref={listRef}>
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
          {animatedSelection && activeStageIndex === index && (
            <motion.span
              className="stage-indicator"
              layoutId="assembly-active-stage"
              aria-hidden="true"
              transition={{ duration: reducedMotion ? 0 : 0.4, ease: revealEase }}
            />
          )}
          <button
            className="stage-button"
            type="button"
            aria-current={activeStageIndex === index ? "step" : undefined}
            aria-label={`${stage.label}: ${stage.description}`}
            onClick={() => onStageSelect(index)}
          >
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{stage.label}</strong>
            <small>{stage.description}</small>
          </button>
        </motion.li>
      ))}
    </ol>
  );
}

function ConstructionFrame({ index, alt = "", scale }) {
  return (
    <motion.div className="construction-viewport" style={{ scale }}>
      <div className="construction-frame">
        <img
          className="construction-sheet"
          src={constructionSheet}
          alt={alt}
          width={1024}
          height={1536}
          loading="eager"
          fetchPriority="low"
          decoding="async"
          style={{ transform: `translateY(${(-index * 100) / stages.length}%)` }}
        />
      </div>
    </motion.div>
  );
}

const ConstructionLayer = memo(function ConstructionLayer({ stage, index, position, isActive, directional }) {
  const opacity = useTransform(position, (value) => clamp(value - index + 1));
  const visibility = useTransform(position, (value) => value >= index - 1 && value < index + 1 ? "visible" : "hidden");
  const willChange = useTransform(visibility, (value) => value === "visible" ? directional ? "opacity, clip-path" : "opacity" : "auto");
  const clipPath = useTransform(position, (value) => {
    const inset = (1 - clamp(value - index + 1)) * 100;
    return index % 2 ? `inset(0% ${inset}% 0% 0%)` : `inset(0% 0% 0% ${inset}%)`;
  });

  return (
    <motion.div
      className="construction-layer"
      data-stage={index}
      aria-hidden={!isActive}
      style={{ opacity, visibility, willChange, clipPath: directional ? clipPath : "none" }}
    >
      <ConstructionFrame index={index} alt={`${stage.label}: ${stage.description}`} />
    </motion.div>
  );
});

function ConstructionScene({ activeStageIndex, progress, directional }) {
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
          directional={directional}
        />
      ))}
    </div>
  );
}

function AssemblyReveal({ progress }) {
  const expansion = useTransform(progress, [0.04, 0.64], [0, 1], { ease: cubicBezier(0.4, 0, 0.2, 1) });
  const remaining = useTransform(expansion, (value) => 1 - value);
  const imageScale = useTransform(expansion, [0, 1], [0.72, 1]);
  const verticalInset = useTransform(remaining, (value) => value * 18);
  const centerInset = useTransform(remaining, (value) => 49.98 + value * 0.82);
  const leftClip = useMotionTemplate`inset(${verticalInset}% ${centerInset}% ${verticalInset}% calc(var(--assembly-inset) * ${remaining}))`;
  const rightClip = useMotionTemplate`inset(${verticalInset}% calc(var(--assembly-inset) * ${remaining}) ${verticalInset}% ${centerInset}%)`;
  const leftY = useTransform(remaining, (value) => `${value * 3.5}%`);
  const rightY = useTransform(remaining, (value) => `${value * -3.5}%`);
  const opacity = useTransform(progress, [0.86, 1], [1, 0]);
  const visibility = useTransform(progress, (value) => value >= 1 ? "hidden" : "visible");
  const titleOpacity = useTransform(progress, [0.38, 0.64, 0.82, 0.96], [0, 1, 1, 0]);
  const titleY = useTransform(progress, [0.38, 0.68], [32, 0]);
  const captionOpacity = useTransform(progress, [0.04, 0.2], [1, 0]);

  return (
    <motion.div className="assembly-reveal" aria-hidden="true" style={{ opacity, visibility }}>
      {/* Both masks share the same image coordinates, so the halves meet without a camera jump. */}
      <motion.div className="assembly-reveal-panel is-left" style={{ clipPath: leftClip, y: leftY }}>
        <ConstructionFrame index={stages.length - 1} scale={imageScale} />
      </motion.div>
      <motion.div className="assembly-reveal-panel is-right" style={{ clipPath: rightClip, y: rightY }}>
        <ConstructionFrame index={stages.length - 1} scale={imageScale} />
      </motion.div>
      <motion.p className="assembly-reveal-caption" style={{ opacity: captionOpacity }}>
        From components to a complete building.
      </motion.p>
      <motion.p className="assembly-reveal-title" style={{ opacity: titleOpacity, y: titleY }}>
        Assembly
      </motion.p>
    </motion.div>
  );
}

const AssemblySection = memo(function AssemblySection({ reducedMotion }) {
  const compactLayout = useCompactLayout();
  const sectionRef = useRef(null);
  const selectedProgress = useMotionValue(1);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 150,
    damping: 26,
    mass: 0.65,
    restDelta: 0.0001,
    restSpeed: 0.0001,
    skipInitialAnimation: true,
  });
  const revealProgress = useTransform(smoothProgress, (value) => clamp(value / assemblyRevealEnd));
  const progress = useTransform(() => {
    if (reducedMotion) return selectedProgress.get();
    return clamp((smoothProgress.get() - assemblyRevealEnd) / (1 - assemblyRevealEnd));
  });
  const contentOpacity = useTransform(smoothProgress, [assemblyRevealEnd, assemblyRevealEnd + 0.045], [0, 1]);
  const contentVisibility = useTransform(contentOpacity, (value) => value < 0.001 ? "hidden" : "visible");
  const progressLabel = useTransform(progress, (value) => `${Math.round(value * 100).toString().padStart(2, "0")}%`);
  const [activeStageIndex, setActiveStageIndex] = useState(() => getActiveStageIndex(progress.get()));

  // Only stage changes enter React state; continuous motion stays on Motion values.
  useMotionValueEvent(progress, "change", (value) => setActiveStageIndex(getActiveStageIndex(value)));

  function selectStage(index) {
    const stage = stages[index];
    const stageProgress = (stage.start + stage.end) / 2;
    if (reducedMotion) {
      selectedProgress.set(index === 0 ? 0 : index === stages.length - 1 ? 1 : stageProgress);
      return;
    }
    const section = sectionRef.current;
    const targetProgress = assemblyRevealEnd + stageProgress * (1 - assemblyRevealEnd);
    window.scrollTo({
      top: window.scrollY + section.getBoundingClientRect().top + (section.offsetHeight - window.innerHeight) * targetProgress,
      behavior: "smooth",
    });
  }

  return (
    <section className="assembly-section" id="assembly" data-assembly aria-labelledby="assembly-title" ref={sectionRef}>
      <div className="assembly-sticky">
        <div className="assembly-media">
          <div className="assembly-visual" aria-label="Construction stages">
            <ConstructionScene activeStageIndex={activeStageIndex} progress={progress} directional={compactLayout && !reducedMotion} />
          </div>
          {!reducedMotion && <AssemblyReveal progress={revealProgress} />}
        </div>
        <motion.div className="assembly-copy" style={{ "--assembly-content-opacity": reducedMotion ? 1 : contentOpacity }}>
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
        </motion.div>
        <motion.div className="assembly-timeline" style={{ "--assembly-content-opacity": reducedMotion ? 1 : contentOpacity, "--assembly-content-visibility": reducedMotion ? "visible" : contentVisibility }}>
          <div className="blueprint-meta">
            <span>Assembly Progress</span>
            <motion.strong>{progressLabel}</motion.strong>
          </div>
          <StageList activeStageIndex={activeStageIndex} reducedMotion={reducedMotion} onStageSelect={selectStage} animatedSelection={compactLayout} />
        </motion.div>
      </div>
    </section>
  );
});

function ManufacturingSection({ reducedMotion }) {
  const { sectionRef, progress } = useSectionScroll();
  const mediaClip = useTransform(progress, [0.08, 0.42], ["inset(0% 100% 0% 0%)", "inset(0% 0% 0% 0%)"]);
  const imageX = useTransform(progress, [0.08, 0.48], ["-10%", "0%"]);

  return (
    <section className="manufacturing-section" aria-labelledby="manufacturing-title" ref={sectionRef}>
      <motion.div className="manufacturing-media" style={{ clipPath: reducedMotion ? "none" : mediaClip }}>
        <motion.img src={framecadMachine} alt="FRAMECAD profile manufacturing machine" loading="lazy" style={{ x: reducedMotion ? 0 : imageX }} />
      </motion.div>
      <SideReveal className="manufacturing-copy" from="right" reducedMotion={reducedMotion}>
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
          </Reveal>
          <Reveal delay={0.2}>
            <strong>mm</strong>
            <span>installation-level precision</span>
          </Reveal>
        </div>
      </SideReveal>
    </section>
  );
}

function SystemsSection({ reducedMotion }) {
  return (
    <section className="systems-section" aria-labelledby="systems-title">
      <div className="section-heading">
        <Reveal className="section-label">Structural Systems</Reveal>
        <SplitReveal id="systems-title" text="Light steel components for repeatable delivery." />
      </div>
      <div className="system-cards">
        {systemCards.map((card, index) => (
          <SideReveal delay={index * 0.08} from={index % 2 ? "right" : "left"} reducedMotion={reducedMotion} key={card.title}>
            <article>
              <span className="card-index">{String(index + 1).padStart(2, "0")}</span>
              <h3>{card.title}</h3>
              <p>{card.body}</p>
            </article>
          </SideReveal>
        ))}
      </div>
    </section>
  );
}

function ApplicationsSection({ reducedMotion }) {
  const compactLayout = useCompactLayout();
  const staticLayout = reducedMotion || compactLayout;
  const { sectionRef, progress } = useSectionScroll();
  const mediaClip = useTransform(progress, [0.12, 0.45], ["inset(12% 24% 12% 24%)", "inset(0% 0% 0% 0%)"]);
  const imageScale = useTransform(progress, [0.12, 0.45], [0.88, 1]);
  const titleOpacity = useTransform(progress, [0.32, 0.46], [0, 1]);
  const detailsOpacity = useTransform(progress, [0.4, 0.48], [0, 1]);

  return (
    <section className="applications-section" id="applications" aria-labelledby="applications-title" ref={sectionRef}>
      <div className="applications-stage">
        <motion.div className="application-image" style={{ clipPath: staticLayout ? "none" : mediaClip }}>
          <ConstructionFrame index={1} alt="Steel structure ready for a range of building applications" scale={staticLayout ? 1 : imageScale} />
        </motion.div>
        <motion.div className="applications-heading" style={{ opacity: staticLayout ? 1 : titleOpacity }}>
          <p className="section-label">Applications</p>
          <h2 id="applications-title">Spaces for<br /><em>every possibility.</em></h2>
        </motion.div>
        <motion.div className="application-grid" style={{ "--application-details-opacity": staticLayout ? 1 : detailsOpacity }}>
          {applications.map((application, index) => (
            <SideReveal delay={index * 0.08} from={index % 2 ? "right" : "left"} reducedMotion={reducedMotion} key={application.title}>
              <h3>{application.title}</h3>
              <p>{application.body}</p>
            </SideReveal>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function ProcessSection({ reducedMotion }) {
  return (
    <section className="process-section" id="process" aria-labelledby="process-title">
      <div className="section-heading">
        <Reveal className="section-label">The Process</Reveal>
        <SplitReveal
          id="process-title"
          text="Integrated workflow from engineering to installation."
        />
      </div>
      <ol className="process-track">
        {processSteps.map((step, index) => (
          <li key={step.title}>
            <SideReveal from={index % 2 ? "right" : "left"} reducedMotion={reducedMotion}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </SideReveal>
          </li>
        ))}
      </ol>
    </section>
  );
}

function AboutSection({ reducedMotion }) {
  return (
    <section className="about-section" aria-labelledby="about-title">
      <Reveal className="section-label">About INNOSTAL</Reveal>
      <div className="about-grid">
        <SideReveal reducedMotion={reducedMotion}>
          <SplitReveal
            id="about-title"
            text="A technology-driven company specialised in light gauge steel systems and industrialized construction workflows."
          />
        </SideReveal>
        <SideReveal from="right" delay={0.1} reducedMotion={reducedMotion}>
          <p>
            Structural engineering, detailing, CNC production, digital configuration, and assembly
            operate within one coordinated system.
          </p>
          <p>
            The result is faster execution, reduced errors, and greater control throughout the
            project lifecycle.
          </p>
        </SideReveal>
      </div>
    </section>
  );
}

function ContactSection({ reducedMotion }) {
  const compactLayout = useCompactLayout();
  const staticLayout = reducedMotion || compactLayout;
  const { sectionRef, progress } = useSectionScroll(["start start", "end end"]);
  const mediaClip = useTransform(progress, [0.08, 0.78], ["inset(0% 0% 0% 0%)", "inset(8% 22% 54% 22%)"], { ease: cubicBezier(0.4, 0, 0.2, 1) });
  const imageScale = useTransform(progress, [0.08, 0.78], [1, 0.58], { ease: cubicBezier(0.4, 0, 0.2, 1) });
  const imageY = useTransform(progress, [0.08, 0.78], ["0%", "-23%"], { ease: cubicBezier(0.4, 0, 0.2, 1) });
  const invitationOpacity = useTransform(progress, [0.08, 0.34], [1, 0]);
  const invitationVisibility = useTransform(invitationOpacity, (value) => value < 0.001 ? "hidden" : "visible");
  const invitationY = useTransform(progress, [0.08, 0.4], [0, -40]);
  const connectOpacity = useTransform(progress, [0.48, 0.76], [0, 1]);
  const connectVisibility = useTransform(connectOpacity, (value) => value < 0.001 ? "hidden" : "visible");
  const connectY = useTransform(progress, [0.48, 0.8], [40, 0]);

  return (
    <section className="contact-section" id="contact" aria-labelledby="contact-title">
      <div className="contact-outro" ref={sectionRef}>
        <div className="contact-stage">
          <motion.div className="contact-media" style={{ clipPath: staticLayout ? "none" : mediaClip }}>
            <motion.div className="contact-photo" style={{ scale: staticLayout ? 1 : imageScale, y: staticLayout ? "0%" : imageY }}>
              <ConstructionFrame index={5} alt="Completed glass-fronted building at sunset" />
            </motion.div>
          </motion.div>
          <motion.div className="contact-invitation" style={{ opacity: staticLayout ? 1 : invitationOpacity, visibility: staticLayout ? "visible" : invitationVisibility, y: staticLayout ? 0 : invitationY }}>
            <p className="section-label">Your Next Project</p>
            <h2 id="contact-title">Let's build<br /><em>what's next.</em></h2>
            <a className="contact-project-link" href="mailto:office@innostal.com?subject=Project%20inquiry">
              Start a project <ArrowUpRight size={22} strokeWidth={1.25} aria-hidden="true" />
            </a>
          </motion.div>
          <motion.div className="contact-connect" style={{ opacity: staticLayout ? 1 : connectOpacity, visibility: staticLayout ? "visible" : connectVisibility, y: staticLayout ? 0 : connectY }}>
            <DraftingCompass size={36} strokeWidth={1} aria-hidden="true" />
            <p className="section-label">A Conversation Starts Here</p>
            <a className="contact-email" href="mailto:office@innostal.com">office@innostal.com</a>
            <p>From your first idea to the final connection.</p>
          </motion.div>
        </div>
      </div>
      <div className="contact-grid">
        <SideReveal reducedMotion={reducedMotion}>
          <address>
            <span>Sofia</span>
            12 Vishneva Str., Office 5<br />Lozenets 1164, Bulgaria
          </address>
        </SideReveal>
        <SideReveal delay={0.08} reducedMotion={reducedMotion}>
          <address>
            <span>Bucharest</span>
            Soseaua Stefanesti<br />077010 Stefanestii de Jos, Romania
          </address>
        </SideReveal>
        <SideReveal from="right" delay={0.16} reducedMotion={reducedMotion}>
          <span>General Inquiries</span>
          <a href="mailto:hello@innostal.com">hello@innostal.com <ArrowUpRight size={18} aria-hidden="true" /></a>
        </SideReveal>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <span>INNOSTAL</span>
      <span>Copyright 2026</span>
      <a href="#top" aria-label="Back to top" title="Back to top"><ArrowUp size={22} strokeWidth={1.25} aria-hidden="true" /></a>
    </footer>
  );
}

export default function App() {
  const { activeSection, headerHidden, reducedMotion } = usePageMotion();

  return (
    <MotionConfig reducedMotion="user">
      <Header activeSection={activeSection} isHidden={headerHidden} />
      <main id="top">
        <HeroIntro />
        <AssemblySection reducedMotion={reducedMotion} />
        <ManufacturingSection reducedMotion={reducedMotion} />
        <SystemsSection reducedMotion={reducedMotion} />
        <ApplicationsSection reducedMotion={reducedMotion} />
        <ProcessSection reducedMotion={reducedMotion} />
        <AboutSection reducedMotion={reducedMotion} />
        <ContactSection reducedMotion={reducedMotion} />
      </main>
      <Footer />
    </MotionConfig>
  );
}
