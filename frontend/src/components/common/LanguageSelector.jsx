import useTranslation from '../../hooks/useTranslation';

const LanguageSelector = ({ compact = false }) => {
  const { language, setLanguage, supportedLanguages, t } = useTranslation();

  return (
    <label className="flex items-center gap-2 text-xs font-medium text-gray-400">
      {!compact && <span>{t('common.language')}</span>}
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        className="bg-gray-800 border border-gray-700 text-gray-100 text-xs rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
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

