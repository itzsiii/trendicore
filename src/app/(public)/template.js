'use client';

import { m } from 'framer-motion';

export default function Template({ children }) {
  return (
    <m.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5, 
        ease: [0.22, 1, 0.36, 1] 
      }}
    >
      {children}
    </m.div>
  );
}
