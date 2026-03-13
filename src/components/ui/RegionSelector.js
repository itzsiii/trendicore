'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useLocale } from '@/components/providers/LocaleProvider';
import styles from './RegionSelector.module.css';

export default function RegionSelector() {
    const { region, ready, selectCountry } = useLocale();

    // Don't render until localStorage has been checked
    if (!ready) return null;
    // Hide if region already selected
    if (region) return null;

    return (
        <AnimatePresence>
            <motion.div
                className={styles.overlay}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
            >
                <div className={styles.backdrop} />
                <motion.div
                    className={styles.modal}
                    initial={{ opacity: 0, scale: 0.9, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 30 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                    <div className={styles.glow} />

                    <div className={styles.logo}>⚡</div>
                    <h1 className={styles.title}>Trendicore</h1>

                    <div className={styles.question}>
                        <h2 className={styles.questionTitle}>Where are you shopping from?</h2>
                        <p className={styles.questionSub}>¿Desde dónde compras?</p>
                    </div>

                    <div className={styles.options}>
                        <motion.button
                            className={styles.option}
                            onClick={() => selectCountry('us')}
                            whileHover={{ scale: 1.03, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <span className={styles.flag}>🇺🇸</span>
                            <div className={styles.optionInfo}>
                                <span className={styles.optionName}>United States</span>
                                <span className={styles.optionDesc}>Shop in English</span>
                            </div>
                            <span className={styles.arrow}>→</span>
                        </motion.button>

                        <motion.button
                            className={styles.option}
                            onClick={() => selectCountry('es')}
                            whileHover={{ scale: 1.03, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <span className={styles.flag}>🇪🇸</span>
                            <div className={styles.optionInfo}>
                                <span className={styles.optionName}>España</span>
                                <span className={styles.optionDesc}>Comprar en Español</span>
                            </div>
                            <span className={styles.arrow}>→</span>
                        </motion.button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
