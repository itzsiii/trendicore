import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import styles from './Button.module.css';

/**
 * Standardized Button component for corporate UI consistency.
 */
export default function Button({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'medium',
  fullWidth = false,
  iconLeft,
  iconRight,
  loading = false,
  disabled = false,
  type = 'button',
  className = '',
  href,
  ...props 
}) {
  const baseClass = `${styles.btn} ${styles[variant]} ${styles[size]} ${fullWidth ? styles.fullWidth : ''} ${className}`;

  const content = loading ? (
    <span className={styles.loader}></span>
  ) : (
    <>
      {iconLeft && <span className={styles.icon}>{iconLeft}</span>}
      <span className={styles.content}>{children}</span>
      {iconRight && <span className={styles.icon}>{iconRight}</span>}
    </>
  );

  const motionProps = {
    whileHover: !disabled && !loading ? { scale: 1.02, y: -1 } : {},
    whileTap: !disabled && !loading ? { scale: 0.98 } : {},
    transition: { type: 'spring', stiffness: 400, damping: 25 }
  };

  if (href && !disabled) {
    const MotionLink = motion(Link);
    return (
      <MotionLink href={href} className={baseClass} {...motionProps} {...props}>
        {content}
      </MotionLink>
    );
  }

  return (
    <motion.button
      type={type}
      className={baseClass}
      onClick={!loading && !disabled ? onClick : undefined}
      disabled={disabled || loading}
      {...motionProps}
      {...props}
    >
      {content}
    </motion.button>
  );
}
