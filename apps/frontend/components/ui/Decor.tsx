export function Decor() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 select-none overflow-hidden"
    >
      <span className="float-slow absolute -left-10 top-[8%] hidden font-serif text-[220px] leading-none text-ink/[0.045] md:block">
        é
      </span>
      <span className="absolute -right-6 top-[6%] font-serif text-[150px] leading-none text-coral/[0.07] sm:text-[210px]">
        ç
      </span>
      <span className="float-slow absolute -left-4 bottom-[4%] hidden font-serif text-[180px] leading-none text-cobalt/[0.07] sm:block">
        œ
      </span>
      <span className="absolute right-[8%] top-[46%] hidden font-serif text-[140px] leading-none text-butter/[0.14] lg:block">
        à
      </span>

      <span className="absolute left-[3%] top-[62%] hidden h-3 w-3 rounded-full bg-coral/25 sm:block sm:h-4 sm:w-4" />
      <span className="absolute right-[5%] top-[62%] h-16 w-16 rounded-full border-[3px] border-cobalt/10 sm:h-24 sm:w-24" />
      <span className="absolute bottom-[12%] left-[46%] h-2.5 w-2.5 rotate-45 bg-butter/40 sm:h-3.5 sm:w-3.5" />
      <span className="absolute right-[28%] top-[14%] h-2 w-2 rounded-full bg-ink/15" />
    </div>
  )
}
