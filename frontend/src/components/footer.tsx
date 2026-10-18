'use client';

import React from 'react';

interface FooterProps {
  className?: string;
}

export function Footer({ className = '' }: FooterProps) {
  const [currentYear, setCurrentYear] = React.useState<number>(2026);

  React.useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <footer
      className={`brand-footer text-center py-5 mt-8 border-t border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs sm:text-[0.85rem] ${className}`}
    >
      © {currentYear} All rights reserved. Powered by{' '}
      <strong className="brand-name text-[#6366f1] font-semibold">
        Diradz Solutions
      </strong>
    </footer>
  );
}

export default Footer;
