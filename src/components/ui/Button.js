import React from 'react';
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

  if (href && !disabled) {
    return (
      <Link href={href} className={baseClass} {...props}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={baseClass}
      onClick={!loading && !disabled ? onClick : undefined}
      disabled={disabled || loading}
      {...props}
    >
      {content}
    </button>
  );
}
