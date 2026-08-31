const ICONS: Record<string, React.ReactNode> = {
  math: (
    <>
      <path d="M4 4l16 16M20 4L4 20" strokeLinecap="round" />
    </>
  ),
  book: (
    <>
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5v-15Z" />
      <path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20" />
    </>
  ),
  flask: (
    <>
      <path d="M9 2v6.5L4.5 18a2 2 0 0 0 1.8 3h11.4a2 2 0 0 0 1.8-3L15 8.5V2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 2h6" strokeLinecap="round" />
      <path d="M6.5 14h11" />
    </>
  ),
  chat: (
    <>
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5V14a2.5 2.5 0 0 1-2.5 2.5H9l-5 4v-4" strokeLinejoin="round" />
    </>
  ),
  globe: (
    <>
      <circle cx={12} cy={12} r={9} />
      <path d="M3 12h18M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18Z" />
    </>
  ),
  gear: (
    <>
      <circle cx={12} cy={12} r={3} />
      <path d="M19 12a7 7 0 0 0-.1-1.2l2-1.6-2-3.4-2.4 1a7 7 0 0 0-2-1.2L14 3h-4l-.5 2.6a7 7 0 0 0-2 1.2l-2.4-1-2 3.4 2 1.6A7 7 0 0 0 5 12c0 .4 0 .8.1 1.2l-2 1.6 2 3.4 2.4-1a7 7 0 0 0 2 1.2L10 21h4l.5-2.6a7 7 0 0 0 2-1.2l2.4 1 2-3.4-2-1.6c.1-.4.1-.8.1-1.2Z" />
    </>
  ),
  leaf: (
    <>
      <path d="M5 21c8 0 14-6 14-14V4h-3C8 4 5 10 5 18v3Z" strokeLinejoin="round" />
      <path d="M5 21c0-6 3-10 8-13" strokeLinecap="round" />
    </>
  ),
  palette: (
    <>
      <path d="M12 3a9 9 0 1 0 0 18c1.1 0 2-.9 2-2 0-.5-.2-1-.5-1.3-.3-.4-.5-.8-.5-1.2 0-.9.7-1.5 1.5-1.5H16a4 4 0 0 0 4-4c0-4.4-3.6-8-8-8Z" />
      <circle cx={7.5} cy={10.5} r={1} />
      <circle cx={9.5} cy={7} r={1} />
      <circle cx={14.5} cy={7} r={1} />
      <circle cx={16.5} cy={10.5} r={1} />
    </>
  ),
  heart: (
    <>
      <path d="M12 21s-7-4.35-9.5-8.5C.5 8.5 3 5 6.5 5c2 0 3.3 1 5.5 3.2C14.2 6 15.5 5 17.5 5 21 5 23.5 8.5 21.5 12.5 19 16.65 12 21 12 21Z" strokeLinejoin="round" />
    </>
  ),
  music: (
    <>
      <path d="M9 18V5l11-2v13" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={6} cy={18} r={3} />
      <circle cx={17} cy={16} r={3} />
    </>
  ),
};

export function SubjectIcon({ icon, className }: { icon: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
      {ICONS[icon] ?? ICONS.book}
    </svg>
  );
}
