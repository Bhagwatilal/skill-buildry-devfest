import React, { useState, useEffect, useRef, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Sparkles, ArrowRight, Compass, Hammer, Award,
  CheckCircle2, Layers, ChevronRight, ChevronLeft, ChevronDown,
  Cpu, Check, Quote, Users, Zap, Target, Flame, HelpCircle,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

/* ─── Props ──────────────────────────────────────────────────────────────── */
interface LandingPageProps {
  onStartOnboarding: () => void;
  onExploreDemo: () => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onEnterWorkspace?: () => void;
  onLogout?: () => void;
  isLoggedIn?: boolean;
  userName?: string;
  userEmail?: string;
}

/* ─── 3D Tilt Hook ───────────────────────────────────────────────────────── */
function use3DTilt(strength = 10) {
  const ref = useRef<HTMLDivElement>(null);
  const raf = useRef<number | null>(null);

  const onMove = useCallback((e: MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const dx = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
    const dy = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
    if (raf.current) cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      gsap.to(el, {
        rotateY: dx * strength,
        rotateX: -dy * strength,
        transformPerspective: 800,
        ease: 'power2.out',
        duration: 0.35,
      });
    });
  }, [strength]);

  const onLeave = useCallback(() => {
    gsap.to(ref.current, {
      rotateY: 0, rotateX: 0,
      duration: 0.7, ease: 'elastic.out(1, 0.5)',
    });
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.addEventListener('mousemove', onMove as EventListener);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      el.removeEventListener('mousemove', onMove as EventListener);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, [onMove, onLeave]);

  return ref;
}

/* ─── Tilt Card Wrapper ──────────────────────────────────────────────────── */
const TiltCard = React.forwardRef<
  HTMLDivElement,
  { children: React.ReactNode; className?: string; strength?: number; style?: React.CSSProperties; onClick?: () => void }
>(({ children, className = '', strength = 9, style, onClick }, forwardedRef) => {
  const internalRef = use3DTilt(strength);
  const ref = (forwardedRef as React.RefObject<HTMLDivElement>) || internalRef;
  return (
    <div
      ref={internalRef}
      className={className}
      style={{ transformStyle: 'preserve-3d', willChange: 'transform', ...style }}
      onClick={onClick}
    >
      {children}
    </div>
  );
});
TiltCard.displayName = 'TiltCard';

/* ─── DATA ───────────────────────────────────────────────────────────────── */
const pillars = [
  {
    icon: Cpu, num: '01',
    accent: '#6d28d9', bg: 'rgba(109,40,217,0.07)', border: 'rgba(109,40,217,0.15)',
    tag: 'Gemini 3.8 Flash', title: 'AI Gap Radar',
    desc: 'Deep-scan your skills against real production hiring bars — not generic checklists.',
    tags: ['Semantic Analysis', 'Role Matching', 'Priority Scoring'],
  },
  {
    icon: Compass, num: '02',
    accent: '#059669', bg: 'rgba(5,150,105,0.07)', border: 'rgba(5,150,105,0.15)',
    tag: 'Adaptive Daily Plans', title: 'Sprint Roadmaps',
    desc: 'Sequenced milestones that flex around your real schedule and sharpen as you grow.',
    tags: ['10-Week Sprints', 'Daily Tasks', 'Auto-Adjust'],
  },
  {
    icon: Hammer, num: '03',
    accent: '#d97706', bg: 'rgba(217,119,6,0.07)', border: 'rgba(217,119,6,0.15)',
    tag: 'Build Real Artifacts', title: 'Project Challenges',
    desc: 'Architect production-grade systems with verifiable benchmarks and architecture diagrams.',
    tags: ['GitHub Linked', 'Benchmark Data', 'Peer Reviewed'],
  },
  {
    icon: Award, num: '04',
    accent: '#dc2626', bg: 'rgba(220,38,38,0.07)', border: 'rgba(220,38,38,0.15)',
    tag: 'Career Readiness Score', title: 'Proof Vault',
    desc: 'AI-scored mock interviews and tamper-proof evidence portfolios that silence skeptics.',
    tags: ['0–100 Rubric', 'Shareable Link', 'SQLite Local'],
  },
];

const storySteps = [
  {
    step: '01', color: '#6d28d9', lightBg: 'rgba(109,40,217,0.06)',
    tag: 'The Problem',
    title: 'The Resume Paradox',
    headline: 'Traditional resumes claim skills. Modern teams demand proof.',
    body: 'Over 74% of software engineering applicants list keywords like "Distributed Systems" without a single artifact of evidence. Candidates get ghosted without ever understanding why.',
    stat: '74%', statLabel: 'Resume claims rejected in initial screenings',
    visual: ['gap-analysis', 'radar', 'score'],
  },
  {
    step: '02', color: '#059669', lightBg: 'rgba(5,150,105,0.06)',
    tag: 'The Diagnosis',
    title: 'Gemini 3.8 Skill Radar',
    headline: 'Compare your real skills against production hiring bars.',
    body: 'Our AI analyzes your target role, experience, and self-assessments against real engineering expectations — pinpointing exact high-priority gaps you need to close.',
    stat: '03', statLabel: 'Critical competency gaps isolated per profile',
    visual: ['analysis', 'chart', 'gaps'],
  },
  {
    step: '03', color: '#d97706', lightBg: 'rgba(217,119,6,0.06)',
    tag: 'The Sprint',
    title: 'Adaptive Weekly Roadmaps',
    headline: 'Transform gaps into structured daily milestones.',
    body: 'Whether you study 1 hour a day or 4, Skill Buildry generates a sequenced milestone plan with estimated completion times, real-world deliverables, and automated SQLite progress tracking.',
    stat: '10 Wks', statLabel: 'Average time to bridge Junior → Senior competency',
    visual: ['roadmap', 'tasks', 'progress'],
  },
  {
    step: '04', color: '#dc2626', lightBg: 'rgba(220,38,38,0.06)',
    tag: 'The Proof',
    title: 'Verifiable Proof Vault',
    headline: 'Build tamper-proof portfolios that interviewers can\'t ignore.',
    body: 'Every skill is backed by GitHub links, architecture diagrams, and AI-evaluated technical interview answers scored against hiring rubrics from 0–100 with actionable feedback.',
    stat: '84/100', statLabel: 'Production Career Readiness Score with auditable proof',
    visual: ['vault', 'score', 'cert'],
  },
];

const careerTracks = [
  { title: 'Senior Distributed Systems Architect', category: 'Backend & Cloud', salary: '$180k–$240k', timeline: '10 Weeks', gain: '+34 pts', color: '#6d28d9', tags: ['Raft Consensus', 'Go / Rust', 'SQLite', 'Kafka', 'eBPF'] },
  { title: 'Production AI Platform Engineer', category: 'AI & ML', salary: '$190k–$260k', timeline: '8 Weeks', gain: '+42 pts', color: '#059669', tags: ['Gemini 3.8', 'Vector DBs', 'vLLM', 'Agentic Loops', 'Rubrics'] },
  { title: 'Staff Full-Stack & Systems Lead', category: 'Full-Stack', salary: '$175k–$230k', timeline: '9 Weeks', gain: '+38 pts', color: '#d97706', tags: ['React 19', 'TypeScript 5.8', 'Node.js', 'WebSocket', 'E2E'] },
  { title: 'Principal Cloud & Reliability Engineer', category: 'SRE & Infra', salary: '$185k–$250k', timeline: '11 Weeks', gain: '+36 pts', color: '#dc2626', tags: ['Kubernetes', 'Terraform', 'ArgoCD', 'Prometheus', 'Zero-Trust'] },
];

const testimonials = [
  { name: 'Priya Sharma', role: 'Staff Infrastructure Engineer', company: 'Fintech Unicorn', initials: 'PS', color: '#6d28d9', quote: 'Skill Buildry diagnosed my exact gap. Following my sprint got me 3 Staff offers in one month.', metric: '3 Offers', timeline: '6 Weeks', readiness: '92/100' },
  { name: 'Marcus Vance', role: 'Senior Backend Architect', company: 'Enterprise Cloud', initials: 'MV', color: '#059669', quote: 'The VP of Engineering skipped whiteboard coding entirely — spent 45 minutes on my Proof Vault.', metric: 'WB Skipped', timeline: '8 Weeks', readiness: '88/100' },
  { name: 'Elena Rostova', role: 'Principal AI Systems Lead', company: 'Generative AI Lab', initials: 'ER', color: '#d97706', quote: 'Gemini interview evaluations gave sharper feedback than most human mock interviewers ever did.', metric: '+$65k Salary', timeline: '9 Weeks', readiness: '95/100' },
  { name: 'David Chen', role: 'Lead Full-Stack Architect', company: 'HealthTech', initials: 'DC', color: '#dc2626', quote: 'Adaptive daily sprints kept me consistent without burning out during a brutal 50-hour work week.', metric: 'Got Promoted', timeline: '10 Weeks', readiness: '89/100' },
];

const faqItems = [
  { q: 'How does Skill Buildry verify real skills vs. resumes?', a: 'Every competency ties to an Auditable Proof Record verified GitHub PRs, architecture diagrams, benchmark results, and AI-scored interviews against rigorous rubrics.' },
  { q: 'Can I use it alongside a full-time job?', a: 'Absolutely. Configure your weekly availability (3–10 hrs/week). The engine breaks complex topics into 30–45 minute daily sprints with clear checkpoints.' },
  { q: 'Where is my career data stored?', a: 'All data lives 100% locally in embedded SQLite on your instance. Zero third-party telemetry. Your profile is never sold to recruiter networks.' },
  { q: 'How does Gemini 3.8 evaluate interview answers?', a: 'Answers are scored against multi-factor rubrics: Architectural Soundness, Trade-Off Reasoning, Failure Mode Handling, and Technical Precision — 0–100 with actionable feedback.' },
  { q: 'What happens after I complete my sprint?', a: 'Your Career Readiness Score climbs toward 100/100, generating an auditable portfolio you can share with hiring managers to bypass preliminary screening.' },
];

/* ─── COMPONENT ──────────────────────────────────────────────────────────── */
export const LandingPage: React.FC<LandingPageProps> = ({
  onStartOnboarding, onExploreDemo, onOpenAuth, onEnterWorkspace, onLogout,
  isLoggedIn = false, userName = 'Alex Chen',
}) => {
  const [activeTrack, setActiveTrack] = useState(0);
  const [activeTesti, setActiveTesti] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const navRef = useRef<HTMLElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);
  const heroCardsRef = useRef<HTMLDivElement>(null);
  const breathRef = useRef<HTMLDivElement>(null);
  const storyContainerRef = useRef<HTMLDivElement>(null);
  const waveCardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const statRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const handleEnter = () => { if (onEnterWorkspace) onEnterWorkspace(); else onExploreDemo(); };

  /* ── GSAP master setup ────────────────────────────────────────────────── */
  useEffect(() => {
    const ctx = gsap.context(() => {

      /* Nav slide-down */
      gsap.fromTo(navRef.current,
        { y: -80, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.1, ease: 'power4.out', delay: 0.05 }
      );

      /* Hero text 3D reveal */
      gsap.fromTo('.hero-word',
        { y: 80, opacity: 0, rotateX: 30, transformOrigin: '50% 100%' },
        { y: 0, opacity: 1, rotateX: 0, duration: 1.2, ease: 'power4.out', stagger: 0.1, delay: 0.2 }
      );
      gsap.fromTo('.hero-sub',
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: 'power3.out', delay: 0.7 }
      );
      gsap.fromTo('.hero-cta',
        { y: 30, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 0.9, ease: 'back.out(1.5)', delay: 0.9 }
      );

      /* Hero cards flying-in staggered with 3D */
      gsap.fromTo('.hero-card',
        { y: 100, opacity: 0, rotateX: 20, rotateY: -10, scale: 0.85 },
        { y: 0, opacity: 1, rotateX: 0, rotateY: 0, scale: 1, duration: 1.3, ease: 'power4.out', stagger: 0.15, delay: 0.5 }
      );

      /* Breathing hero halo */
      gsap.to(breathRef.current, {
        scale: 1.08, opacity: 0.9,
        duration: 3.2, ease: 'sine.inOut',
        repeat: -1, yoyo: true,
      });

      /* ── Wave cards on scroll ────────────────────────────────────────── */
      waveCardsRef.current.forEach((card, i) => {
        if (!card) return;
        const isEven = i % 2 === 0;
        gsap.fromTo(card,
          {
            x: isEven ? -80 : 80,
            y: 60,
            opacity: 0,
            rotateY: isEven ? 25 : -25,
            rotateX: 8,
            scale: 0.9,
          },
          {
            x: 0, y: 0, opacity: 1, rotateY: 0, rotateX: 0, scale: 1,
            duration: 1.1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 85%',
              end: 'top 50%',
              toggleActions: 'play none none reverse',
            },
          }
        );

        /* Subtle perpetual float on scroll cards */
        gsap.to(card, {
          y: i % 2 === 0 ? -8 : 8,
          duration: 2.5 + i * 0.3,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
          delay: i * 0.2,
        });
      });

      /* ── Section fade-up reveals ─────────────────────────────────────── */
      gsap.utils.toArray<HTMLElement>('.reveal-up').forEach((el) => {
        gsap.fromTo(el,
          { y: 60, opacity: 0, rotateX: 6 },
          {
            y: 0, opacity: 1, rotateX: 0, duration: 1, ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' },
          }
        );
      });

      /* ── Pillar cards stagger ────────────────────────────────────────── */
      gsap.fromTo('.pillar-card',
        { y: 70, opacity: 0, rotateY: 20, scale: 0.88 },
        {
          y: 0, opacity: 1, rotateY: 0, scale: 1,
          duration: 0.95, ease: 'power3.out', stagger: 0.12,
          scrollTrigger: { trigger: '.pillars-grid', start: 'top 82%' },
        }
      );

      /* ── Stat counters ───────────────────────────────────────────────── */
      const statData = [12400, 38, 94, 86];
      statRefs.current.forEach((el, i) => {
        if (!el) return;
        const target = statData[i];
        gsap.fromTo({ v: 0 }, { v: target }, {
          duration: 2.2, ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none none' },
          onUpdate: function () { if (el) el.textContent = Math.floor(this.targets()[0].v).toLocaleString(); },
        });
      });

      /* ── Horizontal scroll line under story ─────────────────────────── */
      gsap.fromTo('.story-line',
        { scaleX: 0, transformOrigin: 'left center' },
        {
          scaleX: 1, duration: 1.5, ease: 'power3.inOut',
          scrollTrigger: { trigger: '.story-line', start: 'top 85%' },
        }
      );

    });
    return () => ctx.revert();
  }, []);

  const track = careerTracks[activeTrack];

  /* ─── RENDER ─────────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen w-full font-sans overflow-x-clip" style={{ background: '#FAFAF8', color: '#111215' }}>

      {/* ── Soft ambient background blobs ─────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(109,40,217,0.07) 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(5,150,105,0.07) 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute -bottom-32 left-1/4 w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(217,119,6,0.05) 0%, transparent 70%)', filter: 'blur(60px)' }} />
        {/* Subtle dot grid */}
        <div className="absolute inset-0 opacity-40"
          style={{ backgroundImage: 'radial-gradient(circle, #d1d5db 1px, transparent 1px)', backgroundSize: '36px 36px' }} />
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          NAVBAR
      ════════════════════════════════════════════════════════════════════ */}
      <nav ref={navRef} className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between"
          style={{
            background: 'rgba(255,255,255,0.82)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(0,0,0,0.07)',
            borderRadius: '9999px',
            padding: '10px 22px',
            boxShadow: '0 4px 30px rgba(0,0,0,0.05), 0 1px 0 rgba(255,255,255,0.8) inset',
          }}>
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm"
              style={{ background: 'linear-gradient(135deg, #111215, #374151)', color: '#E2F86B' }}>✦</div>
            <span className="font-black text-base tracking-tight" style={{ color: '#111215' }}>Skill Buildry</span>
            <span className="hidden sm:inline text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: '#E2F86B', color: '#111215', border: '1px solid rgba(0,0,0,0.1)' }}>3D Studio</span>
          </div>

          {/* Nav links */}
          <div className="hidden lg:flex items-center gap-1 text-xs font-semibold">
            {[['The Story', 'story-section'], ['Career Tracks', 'tracks-section'], ['4 Pillars', 'pillars-section'], ['FAQ', 'faq-section']].map(([label, id]) => (
              <button key={label}
                className="px-3.5 py-1.5 rounded-full transition-all cursor-pointer"
                style={{ color: '#6b7280' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#111215'; (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.05)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#6b7280'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })}>
                {label}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold"
              style={{ background: 'rgba(5,150,105,0.1)', color: '#059669', border: '1px solid rgba(5,150,105,0.2)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />Live
            </div>
            {isLoggedIn ? (
              <>
                <span className="text-xs font-semibold" style={{ color: '#374151' }}>{userName}</span>
                <button onClick={handleEnter}
                  className="flex items-center gap-1.5 text-xs font-black px-5 py-2 rounded-full transition-all cursor-pointer active:scale-95"
                  style={{ background: '#111215', color: '#E2F86B', boxShadow: '0 4px 16px rgba(0,0,0,0.18)' }}>
                  Enter <ArrowRight size={12} />
                </button>
              </>
            ) : (
              <>
                <button onClick={() => onOpenAuth('login')} className="text-xs font-semibold px-3 py-2 rounded-full transition-all cursor-pointer"
                  style={{ color: '#6b7280' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#111215'; (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.05)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#6b7280'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                  Sign In
                </button>
                <button onClick={() => onOpenAuth('register')}
                  className="flex items-center gap-1.5 text-xs font-black px-5 py-2 rounded-full transition-all cursor-pointer active:scale-95"
                  style={{ background: '#111215', color: '#E2F86B', boxShadow: '0 4px 16px rgba(0,0,0,0.18)' }}>
                  Get Started <ArrowRight size={12} />
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ════════════════════════════════════════════════════════════════════
          HERO
      ════════════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 pt-28 pb-20 overflow-hidden">

        {/* Breathing halo */}
        <div ref={breathRef} className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="w-[700px] h-[700px] rounded-full"
            style={{ background: 'radial-gradient(ellipse, rgba(109,40,217,0.08) 0%, rgba(226,248,107,0.12) 40%, transparent 70%)', filter: 'blur(30px)' }} />
        </div>

        {/* Headline */}
        <div className="overflow-hidden mb-2" style={{ perspective: 1000 }}>
          <h1 className="hero-word text-center font-black leading-[1.05] tracking-tight"
            style={{ fontSize: 'clamp(3rem, 8vw, 7.5rem)', color: '#111215' }}>
            From Skill Gap
          </h1>
        </div>
        <div className="overflow-hidden mb-6" style={{ perspective: 1000 }}>
          <h1 className="hero-word text-center font-black leading-[1.05] tracking-tight"
            style={{ fontSize: 'clamp(3rem, 8vw, 7.5rem)', background: 'linear-gradient(135deg, #6d28d9 0%, #059669 50%, #d97706 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            to Verifiable Proof
          </h1>
        </div>

        <p className="hero-sub text-center mb-10 max-w-xl"
          style={{ color: '#6b7280', fontSize: 'clamp(1rem, 2vw, 1.2rem)', lineHeight: 1.75 }}>
          AI-powered career intelligence that turns unverifiable resume claims into auditable proof portfolios for engineers who are serious about climbing.
        </p>

        <div className="hero-cta flex flex-wrap items-center justify-center gap-3">
          <button onClick={onStartOnboarding}
            className="flex items-center gap-2.5 font-black text-white px-8 py-4 rounded-2xl transition-all cursor-pointer active:scale-[0.97]"
            style={{ background: 'linear-gradient(135deg, #111215 0%, #374151 100%)', boxShadow: '0 8px 30px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.06)', fontSize: '1rem' }}
            onMouseEnter={e => gsap.to(e.currentTarget, { scale: 1.04, duration: 0.25, ease: 'power2.out' })}
            onMouseLeave={e => gsap.to(e.currentTarget, { scale: 1, duration: 0.5, ease: 'elastic.out(1, 0.5)' })}>
            Start Free Sprint
            <span style={{ color: '#E2F86B' }}><ArrowRight size={17} /></span>
          </button>
          <button onClick={onExploreDemo}
            className="flex items-center gap-2.5 font-semibold px-8 py-4 rounded-2xl transition-all cursor-pointer"
            style={{ background: 'white', border: '1px solid rgba(0,0,0,0.1)', color: '#374151', fontSize: '1rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#6d28d9'; (e.currentTarget as HTMLElement).style.color = '#6d28d9'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,0,0,0.1)'; (e.currentTarget as HTMLElement).style.color = '#374151'; }}>
            Explore Demo
          </button>
        </div>

        {/* ── Hero 3D Card Cluster ───────────────────────────────────────── */}
        <div ref={heroCardsRef} className="mt-16 w-full max-w-5xl relative" style={{ perspective: 1200 }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            {/* Card 1 – Gap Radar */}
            <TiltCard strength={10}
              className="hero-card rounded-3xl p-6 relative overflow-hidden"
              style={{
                background: 'white',
                border: '1px solid rgba(109,40,217,0.12)',
                boxShadow: '0 20px 60px rgba(109,40,217,0.08), 0 4px 12px rgba(0,0,0,0.04)',
              }}>
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full -mr-8 -mt-8 pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(109,40,217,0.12) 0%, transparent 70%)' }} />
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: 'rgba(109,40,217,0.1)', border: '1px solid rgba(109,40,217,0.15)' }}>
                <Cpu size={18} style={{ color: '#6d28d9' }} />
              </div>
              <div className="text-[10px] font-bold tracking-widest uppercase mb-1" style={{ color: '#6d28d9' }}>AI Gap Radar</div>
              <div className="font-black text-sm mb-3" style={{ color: '#111215' }}>3 Critical Gaps Found</div>
              <div className="space-y-2 mb-4">
                {['Distributed Locks', 'Chaos Engineering', 'CDC Streams'].map((g, i) => (
                  <div key={g} className="flex items-center gap-2 text-xs" style={{ color: '#6b7280' }}>
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: ['#6d28d9', '#059669', '#d97706'][i] }} />
                    {g}
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
                <div className="flex justify-between text-xs mb-1.5"><span style={{ color: '#9ca3af' }}>Readiness Score</span><span className="font-black" style={{ color: '#6d28d9' }}>84/100</span></div>
                <div className="h-2 rounded-full" style={{ background: '#f3f4f6' }}>
                  <div className="h-full rounded-full" style={{ width: '84%', background: 'linear-gradient(90deg, #6d28d9, #8b5cf6)' }} />
                </div>
              </div>
            </TiltCard>

            {/* Card 2 – Sprint (center, slightly elevated) */}
            <TiltCard strength={7}
              className="hero-card rounded-3xl p-6 relative overflow-hidden"
              style={{
                background: '#111215',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 30px 80px rgba(0,0,0,0.25), 0 8px 24px rgba(0,0,0,0.15)',
                transform: 'translateY(-12px)',
              }}>
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(226,248,107,0.15) 0%, transparent 70%)' }} />
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: 'rgba(226,248,107,0.15)', border: '1px solid rgba(226,248,107,0.2)' }}>
                <Compass size={18} style={{ color: '#E2F86B' }} />
              </div>
              <div className="text-[10px] font-bold tracking-widest uppercase mb-1" style={{ color: '#E2F86B' }}>Week 3 of 10 Sprint</div>
              <div className="font-black text-sm text-white mb-1">Senior Distributed<br />Systems Architect</div>
              <div className="text-xs mb-4" style={{ color: 'rgba(255,255,255,0.45)' }}>$180k–$240k · +34 pts projected</div>
              <div className="space-y-2">
                {['Implement Raft Heartbeat Mechanism', 'Write K6 Load-Test Scenarios', 'Simulate Leader Partition'].map((task, i) => (
                  <div key={task} className="flex items-start gap-2 p-2.5 rounded-xl" style={{ background: i === 0 ? 'rgba(226,248,107,0.1)' : 'rgba(255,255,255,0.04)', border: i === 0 ? '1px solid rgba(226,248,107,0.15)' : '1px solid rgba(255,255,255,0.05)' }}>
                    {i === 0 ? <CheckCircle2 size={13} style={{ color: '#E2F86B', marginTop: 1 }} /> : <div className="w-3 h-3 rounded-full border mt-0.5" style={{ borderColor: 'rgba(255,255,255,0.2)' }} />}
                    <span className="text-[11px] leading-tight" style={{ color: i === 0 ? '#E2F86B' : 'rgba(255,255,255,0.45)' }}>{task}</span>
                  </div>
                ))}
              </div>
            </TiltCard>

            {/* Card 3 – Score */}
            <TiltCard strength={10}
              className="hero-card rounded-3xl p-6 relative overflow-hidden"
              style={{
                background: 'white',
                border: '1px solid rgba(220,38,38,0.12)',
                boxShadow: '0 20px 60px rgba(220,38,38,0.07), 0 4px 12px rgba(0,0,0,0.04)',
              }}>
              <div className="absolute top-0 left-0 w-32 h-32 rounded-full -ml-8 -mt-8 pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(220,38,38,0.1) 0%, transparent 70%)' }} />
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.12)' }}>
                <Award size={18} style={{ color: '#dc2626' }} />
              </div>
              <div className="text-[10px] font-bold tracking-widest uppercase mb-1" style={{ color: '#dc2626' }}>Proof Vault Score</div>
              <div className="flex items-end gap-1 mb-4">
                <span className="font-black text-5xl" style={{ color: '#111215' }}>84</span>
                <span className="text-xl mb-1" style={{ color: '#9ca3af' }}>/100</span>
              </div>
              {[['Architectural Soundness', 92], ['Trade-Off Reasoning', 88], ['Failure Mode Handling', 76]].map(([label, score]) => (
                <div key={String(label)} className="mb-2">
                  <div className="flex justify-between text-[11px] mb-1"><span style={{ color: '#9ca3af' }}>{label}</span><span className="font-bold" style={{ color: '#111215' }}>{score}</span></div>
                  <div className="h-1.5 rounded-full" style={{ background: '#f3f4f6' }}>
                    <div className="h-full rounded-full" style={{ width: `${score}%`, background: 'linear-gradient(90deg, #dc2626, #f97316)' }} />
                  </div>
                </div>
              ))}
            </TiltCard>
          </div>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <span className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: '#9ca3af' }}>Scroll</span>
          <ChevronDown size={16} style={{ color: '#9ca3af' }} />
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          STATS
      ════════════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 px-4 sm:px-6 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 reveal-up">
            {[
              { suffix: '+', label: 'Engineers Launched', color: '#6d28d9' },
              { suffix: ' pts', label: 'Avg Readiness Gain', color: '#059669' },
              { suffix: '%', label: 'Offers via Proof Vault', color: '#d97706' },
              { suffix: '/100', label: 'Avg Interview Score', color: '#dc2626' },
            ].map((s, i) => (
              <TiltCard key={s.label} strength={6}
                className="rounded-2xl p-6 text-center"
                style={{ background: 'white', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
                <div className="font-black text-3xl mb-1" style={{ color: s.color }}>
                  <span ref={el => { statRefs.current[i] = el; }}>0</span>{s.suffix}
                </div>
                <div className="text-xs font-medium" style={{ color: '#9ca3af' }}>{s.label}</div>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          3D STORY SECTION — Wave Scroll Cards
      ════════════════════════════════════════════════════════════════════ */}
      <section id="story-section" ref={storyContainerRef} className="relative z-10 px-4 sm:px-6 py-24">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <div className="text-center mb-20 reveal-up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-6"
              style={{ background: 'rgba(109,40,217,0.08)', border: '1px solid rgba(109,40,217,0.15)', color: '#6d28d9' }}>
              <Layers size={12} /> How It Works
            </div>
            <h2 className="font-black mb-4" style={{ fontSize: 'clamp(2.2rem, 5vw, 4rem)', lineHeight: 1.08, color: '#111215' }}>
              From Resume to{' '}
              <span style={{ background: 'linear-gradient(135deg, #6d28d9, #059669)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Undeniable Proof</span>
            </h2>
            <p className="max-w-xl mx-auto" style={{ color: '#6b7280', fontSize: '1.05rem', lineHeight: 1.75 }}>
              Four acts. One outcome: a verifiable career portfolio that speaks before you even walk in the room.
            </p>
            {/* Story timeline line */}
            <div className="story-line mt-10 h-0.5 max-w-2xl mx-auto rounded-full" style={{ background: 'linear-gradient(90deg, #6d28d9, #059669, #d97706, #dc2626)' }} />
          </div>

          {/* Wave story cards */}
          <div className="space-y-10" style={{ perspective: 1400 }}>
            {storySteps.map((story, i) => {
              const isLeft = i % 2 === 0;
              return (
                <div
                  key={story.step}
                  ref={el => { waveCardsRef.current[i] = el; }}
                  className={`flex flex-col ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-8 md:gap-12`}
                  style={{ transformStyle: 'preserve-3d' }}>

                  {/* Text side */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="font-black text-5xl leading-none" style={{ color: `${story.color}15`, WebkitTextStroke: `2px ${story.color}30` }}>
                        {story.step}
                      </span>
                      <div className="px-3 py-1 rounded-full text-xs font-bold"
                        style={{ background: `${story.color}10`, border: `1px solid ${story.color}20`, color: story.color }}>
                        {story.tag}
                      </div>
                    </div>
                    <h3 className="font-black mb-3" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', lineHeight: 1.15, color: '#111215' }}>
                      {story.title}
                    </h3>
                    <p className="text-base font-semibold mb-3" style={{ color: '#374151' }}>{story.headline}</p>
                    <p className="text-sm leading-relaxed mb-6" style={{ color: '#6b7280' }}>{story.body}</p>
                    <div className="flex items-end gap-3">
                      <span className="font-black text-4xl" style={{ color: story.color }}>{story.stat}</span>
                      <span className="text-xs font-medium pb-1.5 max-w-[180px]" style={{ color: '#9ca3af' }}>{story.statLabel}</span>
                    </div>
                  </div>

                  {/* Visual card side */}
                  <TiltCard strength={12}
                    className="flex-shrink-0 w-full md:w-[340px] rounded-3xl p-6 relative overflow-hidden"
                    style={{
                      background: 'white',
                      border: `1px solid ${story.color}18`,
                      boxShadow: `0 30px 80px ${story.color}12, 0 8px 24px rgba(0,0,0,0.06)`,
                      minHeight: 260,
                    }}>
                    {/* Decorative bg */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
                      <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full" style={{ background: `radial-gradient(circle, ${story.color}10 0%, transparent 70%)` }} />
                      <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full" style={{ background: `radial-gradient(circle, ${story.color}08 0%, transparent 70%)` }} />
                    </div>

                    <div className="relative z-10">
                      {/* Step label */}
                      <div className="flex items-center gap-2 mb-5">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-black text-xs"
                          style={{ background: story.color }}>{story.step}</div>
                        <div className="text-xs font-bold" style={{ color: story.color }}>{story.tag}</div>
                      </div>

                      {/* Visual content per step */}
                      {i === 0 && (
                        <div className="space-y-3">
                          <div className="h-8 rounded-xl flex items-center px-3 gap-2" style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.12)' }}>
                            <div className="w-2 h-2 rounded-full bg-red-400" />
                            <span className="text-xs" style={{ color: '#dc2626' }}>Unverified: "Distributed Systems"</span>
                          </div>
                          <div className="h-8 rounded-xl flex items-center px-3 gap-2" style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.12)' }}>
                            <div className="w-2 h-2 rounded-full bg-red-400" />
                            <span className="text-xs" style={{ color: '#dc2626' }}>Unverified: "CI/CD Expert"</span>
                          </div>
                          <div className="h-8 rounded-xl flex items-center px-3 gap-2" style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.12)' }}>
                            <div className="w-2 h-2 rounded-full bg-red-400" />
                            <span className="text-xs" style={{ color: '#dc2626' }}>Unverified: "Clean Architecture"</span>
                          </div>
                          <div className="mt-3 px-3 py-2 rounded-xl text-xs font-bold text-center" style={{ background: 'rgba(220,38,38,0.06)', color: '#dc2626', border: '1px dashed rgba(220,38,38,0.2)' }}>
                            ✗ Resume rejected in ATS screening
                          </div>
                        </div>
                      )}
                      {i === 1 && (
                        <div>
                          <div className="flex justify-between text-xs mb-3"><span style={{ color: '#6b7280' }}>Skill Radar</span><span className="font-bold" style={{ color: story.color }}>84/100</span></div>
                          {[['Distributed Concurrency', 58], ['Chaos Engineering', 42], ['CDC Streams', 35], ['System Design', 76]].map(([skill, val]) => (
                            <div key={String(skill)} className="mb-2">
                              <div className="flex justify-between text-[11px] mb-0.5"><span style={{ color: '#9ca3af' }}>{skill}</span><span style={{ color: '#374151' }}>{val}%</span></div>
                              <div className="h-1.5 rounded-full" style={{ background: '#f3f4f6' }}>
                                <div className="h-full rounded-full" style={{ width: `${val}%`, background: `linear-gradient(90deg, ${story.color}, ${story.color}88)` }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      {i === 2 && (
                        <div className="space-y-2.5">
                          {['🗓 Week 3 · Raft Heartbeat Mechanism', '🗓 Week 4 · K6 Load Testing at 10k RPS', '🗓 Week 5 · Leader Election Chaos Test', '🗓 Week 6 · SQLite Benchmark Suite'].map((t, j) => (
                            <div key={t} className="flex items-center gap-2 p-2 rounded-xl" style={{ background: j < 2 ? `${story.color}08` : '#f9fafb', border: `1px solid ${j < 2 ? story.color + '18' : 'rgba(0,0,0,0.05)'}` }}>
                              <span className="text-[11px] font-medium" style={{ color: j < 2 ? story.color : '#9ca3af' }}>{t}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {i === 3 && (
                        <div>
                          <div className="flex items-end gap-2 mb-4">
                            <span className="font-black text-4xl" style={{ color: story.color }}>84</span>
                            <span style={{ color: '#9ca3af' }}>/100 Verified Score</span>
                          </div>
                          {[['Architectural Soundness', 92], ['Trade-Off Reasoning', 88], ['Failure Modes', 76]].map(([l, v]) => (
                            <div key={String(l)} className="mb-2">
                              <div className="flex justify-between text-[11px] mb-0.5"><span style={{ color: '#9ca3af' }}>{l}</span><span className="font-bold" style={{ color: '#374151' }}>{v}</span></div>
                              <div className="h-1.5 rounded-full" style={{ background: '#f3f4f6' }}>
                                <div className="h-full rounded-full" style={{ width: `${v}%`, background: `linear-gradient(90deg, ${story.color}, ${story.color}88)` }} />
                              </div>
                            </div>
                          ))}
                          <div className="mt-3 py-2 px-3 rounded-xl text-center text-xs font-bold" style={{ background: `${story.color}08`, color: story.color, border: `1px solid ${story.color}18` }}>🏆 Production-Ready Certified</div>
                        </div>
                      )}
                    </div>
                  </TiltCard>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          4 PILLARS
      ════════════════════════════════════════════════════════════════════ */}
      <section id="pillars-section" className="relative z-10 px-4 sm:px-6 py-24" style={{ background: '#F4F3F0' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14 reveal-up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-5"
              style={{ background: 'white', border: '1px solid rgba(0,0,0,0.08)', color: '#374151', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <Zap size={12} style={{ color: '#d97706' }} /> 4 Pillars of Proof
            </div>
            <h2 className="font-black mb-4" style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.75rem)', lineHeight: 1.08, color: '#111215' }}>
              How Skill Buildry <span style={{ color: '#6d28d9' }}>Works</span>
            </h2>
          </div>

          <div className="pillars-grid grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {pillars.map((p, i) => (
              <TiltCard key={p.title} strength={11}
                className="pillar-card rounded-3xl p-6 relative overflow-hidden flex flex-col"
                style={{ background: 'white', border: `1px solid ${p.border}`, boxShadow: `0 20px 50px ${p.accent}10, 0 4px 12px rgba(0,0,0,0.04)`, minHeight: 260 }}>
                <div className="absolute top-0 right-0 w-24 h-24 rounded-full pointer-events-none -mr-4 -mt-4"
                  style={{ background: `radial-gradient(circle, ${p.accent}18 0%, transparent 70%)` }} />
                <div className="absolute bottom-4 right-4 font-black text-6xl pointer-events-none select-none" style={{ color: `${p.accent}08`, lineHeight: 1 }}>{p.num}</div>
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-4" style={{ background: p.bg, border: `1px solid ${p.border}` }}>
                  <p.icon size={20} style={{ color: p.accent }} />
                </div>
                <div className="text-[10px] font-bold tracking-widest uppercase mb-1" style={{ color: p.accent }}>{p.tag}</div>
                <div className="font-black text-base mb-2" style={{ color: '#111215' }}>{p.title}</div>
                <p className="text-xs leading-relaxed mb-4 flex-1" style={{ color: '#6b7280' }}>{p.desc}</p>
                <div className="flex flex-wrap gap-1">
                  {p.tags.map(tag => (
                    <span key={tag} className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: p.bg, color: p.accent, border: `1px solid ${p.border}` }}>{tag}</span>
                  ))}
                </div>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          CAREER TRACKS
      ════════════════════════════════════════════════════════════════════ */}
      <section id="tracks-section" className="relative z-10 px-4 sm:px-6 py-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 reveal-up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-5"
              style={{ background: 'rgba(5,150,105,0.08)', border: '1px solid rgba(5,150,105,0.15)', color: '#059669' }}>
              <Target size={12} /> Career Tracks
            </div>
            <h2 className="font-black mb-4" style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.75rem)', lineHeight: 1.08, color: '#111215' }}>
              Choose Your <span style={{ color: '#059669' }}>Ascent Track</span>
            </h2>
          </div>

          {/* Track tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-8 reveal-up">
            {careerTracks.map((t, i) => (
              <button key={t.category} onClick={() => setActiveTrack(i)}
                className="text-xs font-bold px-4 py-2 rounded-full transition-all cursor-pointer"
                style={{
                  background: i === activeTrack ? t.color : 'white',
                  color: i === activeTrack ? 'white' : '#6b7280',
                  border: `1px solid ${i === activeTrack ? t.color : 'rgba(0,0,0,0.08)'}`,
                  boxShadow: i === activeTrack ? `0 4px 16px ${t.color}30` : '0 2px 6px rgba(0,0,0,0.03)',
                }}>
                {t.category}
              </button>
            ))}
          </div>

          <TiltCard strength={4}
            className="reveal-up rounded-3xl p-8 relative overflow-hidden"
            style={{ background: 'white', border: `1px solid ${track.color}15`, boxShadow: `0 30px 80px ${track.color}10, 0 6px 20px rgba(0,0,0,0.05)` }}>
            <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse at 90% 10%, ${track.color}06 0%, transparent 60%)` }} />
            <div className="flex flex-wrap items-start justify-between gap-6 relative z-10">
              <div className="flex-1 min-w-[220px]">
                <div className="text-[10px] font-bold tracking-widest uppercase mb-2" style={{ color: track.color }}>{track.category}</div>
                <h3 className="font-black mb-4 leading-tight" style={{ fontSize: 'clamp(1.3rem, 2.5vw, 1.9rem)', color: '#111215' }}>{track.title}</h3>
                <div className="flex flex-wrap gap-2 mb-5">
                  {[{ icon: '💰', val: track.salary, col: '#6d28d9' }, { icon: '⏱', val: track.timeline, col: track.color }, { icon: '🚀', val: track.gain, col: '#059669' }].map(b => (
                    <div key={b.val} className="text-xs font-bold px-3 py-1.5 rounded-full"
                      style={{ background: `${b.col}08`, border: `1px solid ${b.col}18`, color: b.col }}>
                      {b.icon} {b.val}
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {track.tags.map(tag => (
                    <span key={tag} className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                      style={{ background: '#f9fafb', border: '1px solid rgba(0,0,0,0.08)', color: '#6b7280' }}>{tag}</span>
                  ))}
                </div>
              </div>
              <div className="flex-shrink-0 flex flex-col items-center justify-center rounded-2xl p-6 text-center"
                style={{ background: `${track.color}06`, border: `1px solid ${track.color}15`, minWidth: 150 }}>
                <div className="font-black text-5xl mb-1" style={{ color: track.color }}>{track.gain.replace('+', '').replace(' pts', '')}</div>
                <div className="text-xs font-semibold mb-4" style={{ color: '#9ca3af' }}>readiness pts</div>
                <button onClick={onStartOnboarding}
                  className="text-xs font-black text-white px-5 py-2.5 rounded-xl cursor-pointer transition-all active:scale-95"
                  style={{ background: track.color, boxShadow: `0 4px 16px ${track.color}40` }}>
                  Start Track →
                </button>
              </div>
            </div>
            <div className="flex gap-2 mt-6 justify-end relative z-10">
              <button onClick={() => setActiveTrack(p => (p - 1 + careerTracks.length) % careerTracks.length)}
                className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer transition-all"
                style={{ border: '1px solid rgba(0,0,0,0.1)', background: 'white' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = track.color}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,0,0,0.1)'}>
                <ChevronLeft size={16} style={{ color: '#374151' }} />
              </button>
              <button onClick={() => setActiveTrack(p => (p + 1) % careerTracks.length)}
                className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer transition-all"
                style={{ border: '1px solid rgba(0,0,0,0.1)', background: 'white' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = track.color}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,0,0,0.1)'}>
                <ChevronRight size={16} style={{ color: '#374151' }} />
              </button>
            </div>
          </TiltCard>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          TESTIMONIALS
      ════════════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 px-4 sm:px-6 py-24" style={{ background: '#F4F3F0' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 reveal-up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-5"
              style={{ background: 'white', border: '1px solid rgba(0,0,0,0.08)', color: '#d97706', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <Users size={12} style={{ color: '#d97706' }} /> Real Stories
            </div>
            <h2 className="font-black mb-4" style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.75rem)', lineHeight: 1.08, color: '#111215' }}>
              Engineers Who <span style={{ color: '#d97706' }}>Broke Through</span>
            </h2>
          </div>

          {(() => {
            const t = testimonials[activeTesti];
            return (
              <TiltCard strength={4}
                className="reveal-up rounded-3xl p-8 mb-6 relative overflow-hidden"
                style={{ background: 'white', border: `1px solid ${t.color}15`, boxShadow: `0 30px 80px ${t.color}08, 0 6px 20px rgba(0,0,0,0.05)` }}>
                <div className="absolute top-0 left-0 w-56 h-56 rounded-full pointer-events-none -ml-12 -mt-12"
                  style={{ background: `radial-gradient(circle, ${t.color}08 0%, transparent 70%)` }} />
                <Quote size={28} className="mb-5" style={{ color: `${t.color}25` }} />
                <p className="text-lg font-medium mb-8 leading-relaxed relative z-10 max-w-3xl" style={{ color: '#111215' }}>
                  "{t.quote}"
                </p>
                <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm text-white"
                      style={{ background: t.color, boxShadow: `0 4px 16px ${t.color}40` }}>
                      {t.initials}
                    </div>
                    <div>
                      <div className="font-black" style={{ color: '#111215' }}>{t.name}</div>
                      <div className="text-xs" style={{ color: '#9ca3af' }}>{t.role} · {t.company}</div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    {[{ label: 'Result', val: t.metric }, { label: 'Timeline', val: t.timeline }, { label: 'Readiness', val: t.readiness }].map(m => (
                      <div key={m.label} className="text-center px-4 py-2 rounded-xl"
                        style={{ background: '#f9fafb', border: '1px solid rgba(0,0,0,0.06)' }}>
                        <div className="font-black text-sm" style={{ color: t.color }}>{m.val}</div>
                        <div className="text-[10px]" style={{ color: '#9ca3af' }}>{m.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </TiltCard>
            );
          })()}

          <div className="flex justify-center gap-2">
            {testimonials.map((t, i) => (
              <button key={i} onClick={() => setActiveTesti(i)} className="rounded-full transition-all cursor-pointer"
                style={{ width: i === activeTesti ? 28 : 8, height: 8, background: i === activeTesti ? testimonials[i].color : 'rgba(0,0,0,0.12)' }} />
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          CTA BANNER
      ════════════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 px-4 sm:px-6 py-24 overflow-hidden">
        {/* Large decorative text behind */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
          <span className="font-black text-[14vw] leading-none"
            style={{ color: 'rgba(0,0,0,0.03)', letterSpacing: '-0.05em' }}>PROOF</span>
        </div>

        <div className="max-w-4xl mx-auto relative z-10">
          <TiltCard strength={3}
            className="reveal-up rounded-3xl p-10 md:p-16 text-center relative overflow-hidden"
            style={{
              background: '#111215',
              boxShadow: '0 60px 120px rgba(0,0,0,0.2), 0 20px 40px rgba(0,0,0,0.1)',
            }}>
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
              <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full" style={{ background: 'radial-gradient(circle, rgba(226,248,107,0.12) 0%, transparent 70%)' }} />
              <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full" style={{ background: 'radial-gradient(circle, rgba(109,40,217,0.12) 0%, transparent 70%)' }} />
              {/* Dot grid on dark */}
              <div className="absolute inset-0 opacity-20"
                style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
            </div>

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-6"
                style={{ background: 'rgba(226,248,107,0.12)', border: '1px solid rgba(226,248,107,0.2)', color: '#E2F86B' }}>
                <Flame size={12} /> Ready to Prove Your Worth?
              </div>
              <h2 className="font-black text-white mb-4" style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', lineHeight: 1.05 }}>
                Your Sprint<br />
                <span style={{ background: 'linear-gradient(135deg, #E2F86B, #a3e635)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Starts Today
                </span>
              </h2>
              <p className="max-w-xl mx-auto mb-10" style={{ color: 'rgba(255,255,255,0.55)', fontSize: '1.1rem', lineHeight: 1.7 }}>
                Join 12,400+ engineers who stopped claiming skills and started proving them.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <button onClick={onStartOnboarding}
                  className="flex items-center gap-2.5 font-black text-black px-10 py-5 rounded-2xl transition-all cursor-pointer active:scale-95"
                  style={{ background: 'linear-gradient(135deg, #E2F86B 0%, #c8e855 100%)', boxShadow: '0 10px 40px rgba(226,248,107,0.4), inset 0 1px 0 rgba(255,255,255,0.4)', fontSize: '1.05rem' }}
                  onMouseEnter={e => gsap.to(e.currentTarget, { scale: 1.04, duration: 0.25, ease: 'power2.out' })}
                  onMouseLeave={e => gsap.to(e.currentTarget, { scale: 1, duration: 0.5, ease: 'elastic.out(1, 0.5)' })}>
                  <Sparkles size={18} /> Start Free Sprint <ArrowRight size={18} />
                </button>
                <button onClick={onExploreDemo}
                  className="font-bold px-8 py-5 rounded-2xl transition-all cursor-pointer"
                  style={{ color: 'rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', fontSize: '1.05rem' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#fff'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(226,248,107,0.3)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.6)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)'; }}>
                  Explore Demo
                </button>
              </div>
              <div className="flex flex-wrap justify-center gap-5 mt-10 text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.35)' }}>
                {['No credit card required', 'SQLite local — fully private', 'Free forever plan'].map(f => (
                  <div key={f} className="flex items-center gap-1.5"><Check size={12} style={{ color: '#E2F86B' }} /> {f}</div>
                ))}
              </div>
            </div>
          </TiltCard>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          FAQ
      ════════════════════════════════════════════════════════════════════ */}
      <section id="faq-section" className="relative z-10 px-4 sm:px-6 py-24" style={{ background: '#F4F3F0' }}>
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12 reveal-up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-5"
              style={{ background: 'white', border: '1px solid rgba(0,0,0,0.08)', color: '#6b7280', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <HelpCircle size={12} /> Questions
            </div>
            <h2 className="font-black" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', lineHeight: 1.1, color: '#111215' }}>
              Frequently Asked <span style={{ color: '#6d28d9' }}>Questions</span>
            </h2>
          </div>

          <div className="space-y-3 reveal-up">
            {faqItems.map((item, i) => (
              <div key={i}
                className="rounded-2xl overflow-hidden transition-all cursor-pointer"
                style={{
                  background: 'white',
                  border: `1px solid ${openFaq === i ? 'rgba(109,40,217,0.2)' : 'rgba(0,0,0,0.07)'}`,
                  boxShadow: openFaq === i ? '0 8px 30px rgba(109,40,217,0.08)' : '0 2px 8px rgba(0,0,0,0.03)',
                }}
                onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <div className="flex items-center justify-between p-5">
                  <span className="font-bold text-sm pr-4" style={{ color: openFaq === i ? '#6d28d9' : '#111215' }}>{item.q}</span>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${openFaq === i ? 'rotate-180' : ''}`}
                    style={{ background: openFaq === i ? 'rgba(109,40,217,0.08)' : '#f9fafb', border: `1px solid ${openFaq === i ? 'rgba(109,40,217,0.15)' : 'rgba(0,0,0,0.06)'}` }}>
                    <ChevronDown size={14} style={{ color: openFaq === i ? '#6d28d9' : '#9ca3af' }} />
                  </div>
                </div>
                {openFaq === i && (
                  <div className="px-5 pb-5 text-sm leading-relaxed" style={{ color: '#6b7280' }}>{item.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          FOOTER
      ════════════════════════════════════════════════════════════════════ */}
      <footer className="relative z-10 px-4 sm:px-6 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6"
            style={{ background: 'white', border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm" style={{ background: '#111215', color: '#E2F86B' }}>✦</div>
              <div>
                <div className="font-black text-sm" style={{ color: '#111215' }}>Skill Buildry</div>
                <div className="text-[10px]" style={{ color: '#9ca3af' }}>From Skill Gap to Verifiable Proof</div>
              </div>
            </div>
            <div className="text-xs font-medium text-center md:text-left" style={{ color: '#9ca3af' }}>
              © 2026 Skill Buildry · Made with ❤️ by <span className="font-bold" style={{ color: '#111215' }}>Bhagwatilal Joshi</span>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => onOpenAuth('login')} className="text-xs font-semibold px-4 py-2 rounded-full transition-all cursor-pointer"
                style={{ color: '#6b7280', border: '1px solid rgba(0,0,0,0.08)' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#111215'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#6b7280'}>
                Sign In
              </button>
              <button onClick={onStartOnboarding}
                className="text-xs font-black text-white px-5 py-2 rounded-full cursor-pointer transition-all active:scale-95"
                style={{ background: '#111215', boxShadow: '0 4px 14px rgba(0,0,0,0.2)' }}>
                Start Free
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
