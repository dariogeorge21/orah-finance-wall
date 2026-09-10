'use client';

export function AboutSection() {
  return (
    <section className="w-full py-16 sm:py-24 px-6 sm:px-12 border-t border-white/[0.08] relative">
      <div className="max-w-5xl mx-auto space-y-16">
        <div className="space-y-4 max-w-2xl">
          <div className="text-[10px] font-mono tracking-widest text-amber-400 uppercase">
            The Purpose / ORAH 2026
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold font-serif text-white tracking-tight leading-tight">
            &ldquo;Arise, shine, for your light has come.&rdquo;
          </h2>
          <p className="text-sm sm:text-base text-neutral-400 leading-relaxed font-light">
            In the ancient tongue, <span className="text-white font-normal font-serif">ORAH</span> (א֤וֹרָה) signifies light, radiant clarity, and spiritual illumination. Organized by Jesus Youth Pala, this meet marks a collective milestone in forming youth missionaries for our Jesus Youth Movement. Through prayer, fellowship, and service, we aim to ignite a transformative spark in the hearts of young delegates, empowering them to become beacons of faith and hope in their communities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12 pt-4 border-t border-white/[0.06]">
          <div className="space-y-2.5">
            <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
              01 / Missionary Formation
            </span>
            <h3 className="text-base font-bold font-serif text-white">Equipping the Youth</h3>
            <p className="text-xs text-neutral-400 leading-relaxed font-light">
              Providing holistic training, spiritual mentorship, and leadership formation to hundreds of young delegates, preparing them for active service in parishes and colleges.
            </p>
          </div>

          <div className="space-y-2.5">
            <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
              02 / Communal Fellowship
            </span>
            <h3 className="text-base font-bold font-serif text-white">Sacred Gathering</h3>
            <p className="text-xs text-neutral-400 leading-relaxed font-light">
              Three days of profound prayer, sacred liturgy, dynamic keynotes, and fellowship designed to kindle an enduring flame of faith in Jesus Christ.
            </p>
          </div>

          <div className="space-y-2.5">
            <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
              03 / Radical Generosity
            </span>
            <h3 className="text-base font-bold font-serif text-white">Direct Sponsoring</h3>
            <p className="text-xs text-neutral-400 leading-relaxed font-light">
              Every tile unlocked directly subsidizes delegate food, lodging, and conference resources so that no young person is hindered from experiencing this renewal.
            </p>
          </div>
        </div>

        </div>
    </section>
  );
}
