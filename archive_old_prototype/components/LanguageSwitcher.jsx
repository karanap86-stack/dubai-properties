// LanguageSwitcher.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const changeLanguage = lng => i18n.changeLanguage(lng);

  return (
    <div className="flex gap-2 items-center">
      <span>{t('language')}:</span>
      <button onClick={() => changeLanguage('en')} className="px-2 py-1 bg-slate-700 rounded text-white">{t('english')}</button>
      <button onClick={() => changeLanguage('ar')} className="px-2 py-1 bg-slate-700 rounded text-white">{t('arabic')}</button>
      {/* Add more buttons for other languages */}
    </div>
  );
}
