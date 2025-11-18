import { useLanguageContext } from '../context/LanguageContext';

const useTranslation = () => {
  const context = useLanguageContext();
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};

export default useTranslation;




