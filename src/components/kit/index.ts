/**
 * MedCEO Kit — biblioteca de componentes de interface.
 * Padrões inspirados nas referências do 21st.dev, reescritos para
 * TanStack Start (SSR-safe), Motion e os tokens MedCEO Nocturne.
 *
 * Estilos: src/kit.css (importado em src/styles.css).
 * Documentação de padrões: docs/design-system/KIT.md
 */

export { default as MotionBlurText } from "./motion-blur-text";
export { default as TextShimmer } from "./text-shimmer";
export { default as TextEffect } from "./text-effect";
export { default as AnimatedText } from "./animated-text";
export { default as PointerHighlight } from "./pointer-highlight";
export { default as Magnetic } from "./magnetic";
export { default as ShineBorder } from "./shine-border";
export { default as BorderBeam } from "./border-beam";
export { default as HoverBorderGradient } from "./hover-border-gradient";
export { default as MovingDotCard } from "./moving-dot-card";
export { SpotlightMaskedGrid, RadialDarkBackground, BeamsBackground, NoiseOverlay } from "./backgrounds";
export { default as FluidParticlesBackground } from "./fluid-particles-background";
export { default as FloatingPaths } from "./floating-paths";
export { default as Timeline } from "./timeline";
export { default as HowItWorks } from "./how-it-works";
export { default as CardsStack } from "./cards-stack";
export { default as ChapterScrubber } from "./chapter-scrubber";
export { default as ContainerScroll } from "./container-scroll";
export { default as MarqueeCta } from "./marquee-cta";
export { default as TestimonialsSection } from "./testimonials-section";
export { default as Loader } from "./loader";
export { default as NotificationCenter } from "./notification-center";
export { default as HistoryList } from "./history-list";
export { default as MetricCard } from "./metric-card";
export { default as RadioCards } from "./radio-cards";
export { default as FeatureGrid } from "./feature-grid";
export { default as IntegrationsOrbit } from "./integrations-orbit";
export { default as LogoCloud } from "./logo-cloud";

export type { TimelineItem } from "./timeline";
export type { HowItWorksStep } from "./how-it-works";
export type { CardStackItem } from "./cards-stack";
export type { Chapter } from "./chapter-scrubber";
export type { Testimonial } from "./testimonials-section";
export type { NotificationItem } from "./notification-center";
export type { HistoryEntry } from "./history-list";
export type { RadioCardOption } from "./radio-cards";
export type { FeatureItem } from "./feature-grid";
export type { IntegrationNode } from "./integrations-orbit";
export type { LogoItem } from "./logo-cloud";
