import { Linkedin, Briefcase, Globe, Search, Database } from 'lucide-react';

export const CompanyLogos = () => {
    const logos = [
        { name: 'LinkedIn', icon: Linkedin, color: 'text-blue-600' },
        { name: 'Indeed', icon: Search, color: 'text-blue-500' },
        { name: 'Adzuna', icon: Globe, color: 'text-green-600' },
        { name: 'TheirStack', icon: Database, color: 'text-purple-600' },
        { name: 'Glassdoor', icon: Briefcase, color: 'text-green-500' },
        { name: 'Wellfound', icon: SparklesIcon, color: 'text-slate-800' },
        { name: 'Monster', icon: MonsterIcon, color: 'text-indigo-600' },
    ];

    return (
        <div className="w-full flex flex-nowrap overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_32px,_black_calc(100%-32px),transparent_100%)] md:[mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)] max-w-full">
            <ul className="flex items-center justify-center md:justify-start [&_li]:mx-8 [&_img]:max-w-none animate-infinite-scroll">
                {[...logos, ...logos].map((logo, index) => (
                    <li key={index} className="flex items-center gap-2 grayscale hover:grayscale-0 transition-all duration-300 backdrop-blur-sm">
                        <logo.icon className={`w-8 h-8 ${logo.color}`} fill="currentColor" strokeWidth={0} />
                        <span className={`text-xl font-bold ${logo.color}`}>{logo.name}</span>
                    </li>
                ))}
            </ul>
            <ul className="flex items-center justify-center md:justify-start [&_li]:mx-8 [&_img]:max-w-none animate-infinite-scroll" aria-hidden="true">
                {[...logos, ...logos].map((logo, index) => (
                    <li key={index} className="flex items-center gap-2 grayscale hover:grayscale-0 transition-all duration-300">
                        <logo.icon className={`w-8 h-8 ${logo.color}`} fill="currentColor" opacity={0.8} />
                        <span className={`text-xl font-bold ${logo.color}`}>{logo.name}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

// Simple custom icon components for variety
function SparklesIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
        </svg>
    )
}

function MonsterIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
        >
            <path d="M20 4h-3a1 1 0 0 0-1 1v10.5a.5.5 0 0 1-.5.5.5.5 0 0 1-.5-.5V6a1 1 0 0 0-1-1h-3a1 1 0 0 0-1 1v9.5a.5.5 0 0 1-.5.5.5.5 0 0 1-.5-.5V5a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v15a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-8.5a.5.5 0 0 1 .5-.5.5.5 0 0 1 .5.5V20a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-9.5a.5.5 0 0 1 .5-.5.5.5 0 0 1 .5.5V20a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1z" />
        </svg>
    )
}
