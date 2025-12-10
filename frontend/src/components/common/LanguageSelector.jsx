import useTranslation from '../../hooks/useTranslation';

const LanguageSelector = ({ compact = false, isDark = false }) => {
  const { language, setLanguage, supportedLanguages, t } = useTranslation();

  const selectClasses = isDark
    ? 'bg-gray-700 border border-gray-600 text-white text-[10px] sm:text-xs rounded-md px-1.5 sm:px-2 py-0.5 sm:py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500'
    : 'bg-gray-800 border border-gray-700 text-gray-100 text-[10px] sm:text-xs rounded-md px-1.5 sm:px-2 py-0.5 sm:py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500';

  const labelClasses = isDark
    ? 'flex items-center gap-2 text-xs font-medium text-gray-300'
    : 'flex items-center gap-2 text-xs font-medium text-gray-400';

  return (
    <label className={labelClasses}>
      {!compact && <span>{t('common.language')}</span>}
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        className={selectClasses}
      >
        {supportedLanguages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {t(lang.labelKey) || lang.label}
          </option>
        ))}
      </select>
    </label>
  );
};

export default LanguageSelector;

