import "./LanguageSwitcher.css";

function LanguageSwitcher({
  setLanguage
}) {
  return (
    <div className="language-switcher">
      <button
        onClick={() =>
          setLanguage("en")
        }
      >
        🇬🇧 English
      </button>

      <button
        onClick={() =>
          setLanguage("so")
        }
      >
        🇸🇴 Somali
      </button>
    </div>
  );
}

export default LanguageSwitcher;