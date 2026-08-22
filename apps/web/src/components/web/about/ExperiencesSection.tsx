import { Calendar, MapPin, Briefcase, GraduationCap } from 'lucide-react';
import { motion } from 'motion/react';

const timelineData = [
  {
    company: 'Institute of Technology Bandung',
    location: 'Bandung, Jawa Barat',
    category: 'Education',
    positions: [
      {
        role: 'Mechanical Engineering',
        period: 'Aug 2023 - Aug 2027',
        description: 'Education',
      },
    ],
  },
  {
    company: 'Himpunan Mahasiswa Mesin (HMM) ITB',
    location: 'Bandung, Jawa Barat',
    category: 'Organization',
    positions: [
      {
        role: 'Head of Information and Technology Development Sub Bureau',
        period: 'Present',
        description:
          'Leading digital transformation and optimizing information flow across organizational stakeholders.',
      },
      {
        role: 'Web Development Engineer',
        period: 'Aug 2025 - Jul 2026',
        description:
          'Served as a technical bridge for digital platforms and front-end engineering.',
      },
      {
        role: 'Member',
        period: 'Oct 2024 - Jul 2027',
        description: 'Active engagement in internal departments and organizational operations.',
      },
    ],
  },
  {
    company: 'GIM ITB',
    location: 'Bandung, Jawa Barat',
    category: 'Organization',
    positions: [
      {
        role: 'Frontend Web Developer Staff',
        period: 'Jan 2025 - Jul 2026',
        description:
          'Contributed to the development of frontend web applications for the organization.',
      },
    ],
  },
  {
    company: 'Amateur Radio Club ITB',
    location: 'Bandung, Jawa Barat',
    category: 'Organization',
    positions: [
      {
        role: 'Member',
        period: 'Aug 2025 - Present',
        description:
          'Learned wide variety of web technologies and contributed to internal projects.',
      },
    ],
  },
  {
    company: 'Mechanical Festival 2026',
    location: 'Bandung, Jawa Barat',
    category: 'Organization',
    positions: [
      {
        role: 'Vice Head of Web Development Divison',
        period: 'Jun 2025 - Aug 2025',
        description:
          'Leading development and engineered of the official website for Mechanical Festival 2026.',
      },
    ],
  },
];

export default function ExperiencesSection() {
  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  } as const;

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-5xl font-bold text-white text-center mb-12">Experience</h2>

        {/* container */}
        <main className="relative border-l border-slate-700 ml-12 sm:ml-6">
          {timelineData.map((item, idx) => {
            const isEducation = item.category.toLowerCase() === 'education';

            return (
              <motion.div
                key={idx}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: false, margin: '-100px' }}
                className="mb-10 ml-6 relative"
              >
                <span
                  className={`absolute left-[-36.5px] top-1.5 flex items-center justify-center w-6 h-6 rounded-full ${
                    isEducation ? 'bg-blue-900 text-blue-300' : 'bg-emerald-900 text-emerald-300'
                  }`}
                >
                  {isEducation ? <GraduationCap size={14} /> : <Briefcase size={14} />}
                </span>

                <div className="bg-slate-800/10 p-5 rounded-xl border border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                  <header className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <h3 className="text-lg font-bold text-slate-100">{item.company}</h3>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        isEducation
                          ? 'bg-blue-900/40 text-blue-400'
                          : 'bg-emerald-900/40 text-emerald-400'
                      }`}
                    >
                      {item.category}
                    </span>
                  </header>

                  <article className="flex items-center text-xs text-slate-400 gap-1 mb-4">
                    <MapPin size={12} />
                    <span>{item.location}</span>
                  </article>

                  {/* positions/roles conntainer */}
                  <section className="space-y-4 relative border-l-2 border-slate-700/60 pl-4 ml-1">
                    {item.positions.map((pos, pIdx) => (
                      <div key={pIdx} className="relative group">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                          <h4 className="text-sm font-semibold text-slate-300 group-hover:text-emerald-400 transition-colors">
                            {pos.role}
                          </h4>
                          <span className="inline-flex items-center text-xs font-medium text-slate-500 gap-1 shrink-0">
                            <Calendar size={11} />
                            {pos.period}
                          </span>
                        </div>

                        {pos.description !== 'Education' && (
                          <p className="text-xs text-slate-400 leading-relaxed">
                            {pos.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </section>
                </div>
              </motion.div>
            );
          })}
        </main>
      </div>
    </div>
  );
}
