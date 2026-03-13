import { LocaleProvider } from '@/components/providers/LocaleProvider';
import { ThemeProvider } from '@/components/ui/ThemeProvider';

export default function AdminLayout({ children }) {
  return (
    <LocaleProvider>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </LocaleProvider>
  );
}
