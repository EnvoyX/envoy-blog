import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { ShieldCheck, Zap, Globe, ArrowRight, Code2 } from 'lucide-react';

import { getUser } from '@/data/session';

const LandingPage = () => {
  const { data } = useQuery({
    queryKey: ['get-session'],
    queryFn: async () => {
      const data = await getUser();
      return data;
    },
  });
  // throw new Error('Test error');
  return (
    <div>
      <section className="relative pt-20 pb-32 px-8 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-125 bg-emerald-500/10 blur-[120px] rounded-full -z-10" />

        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900  text-xs font-medium text-emerald-400 mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Now in RC: TanStack Start
          </div>
          <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight mb-6 bg-linear-to-b from-white to-slate-400 bg-clip-text text-transparent">
            Envoy <br /> Mindpalace.
          </h1>
          <p className="text-lg text-slate-400 mb-10 max-w-2xl mx-auto">
            This is my own TanStack Start playground to learn and experiment with. Powered by
            TanStack Router, Vite, and with many other TanStack's Ecosystem.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to={data?.user ? '/dashboard' : '/login'}
              className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-8 py-4 rounded-xl font-bold transition-all transform hover:scale-105"
            >
              {data?.user ? 'Dashboard' : 'Login'} <ArrowRight size={18} />
            </Link>
            <a
              href="https://github.com/EnvoyX/envoy-blog"
              target="_blank"
              className="flex items-center justify-center gap-2 bg-slate-900 border border-slate-800 hover:border-slate-700 px-8 py-4 rounded-xl font-bold transition-all"
            >
              <Code2 size={18} /> Github
            </a>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-8 py-24">
        <div className="grid md:grid-cols-3 gap-12">
          <FeatureCard
            icon={<Zap className="text-emerald-400" />}
            title="Blazing Fast SSR"
            description="Built on Vite for lightning-fast HMR and optimized server-side rendering out of the box."
          />
          <FeatureCard
            icon={<ShieldCheck className="text-emerald-400" />}
            title="100% Type-Safe"
            description="End-to-end type safety from server functions to UI components without the boilerplate."
          />
          <FeatureCard
            icon={<Globe className="text-emerald-400" />}
            title="Edge Ready"
            description="Deploy anywhere. Designed to run on the edge, serverless, or traditional Node.js environments."
          />
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => (
  <div className="group p-8 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-emerald-500/50 transition-all">
    <div className="mb-4 p-3 bg-slate-950 w-fit rounded-lg border border-slate-800 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-3">{title}</h3>
    <p className="text-slate-400 leading-relaxed text-sm">{description}</p>
  </div>
);

export default LandingPage;
