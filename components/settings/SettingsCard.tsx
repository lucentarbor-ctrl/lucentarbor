'use client';

interface SettingsCardProps {
  icon: string;
  title: string;
  description: string;
  buttonText: string;
  onButtonClick: () => void;
}

export default function SettingsCard({
  icon,
  title,
  description,
  buttonText,
  onButtonClick,
}: SettingsCardProps) {
  return (
    <div className="settings-card">
      <div className="settings-icon">
        <i className={icon}></i>
      </div>
      <div className="settings-title">{title}</div>
      <div className="settings-description">{description}</div>
      <button className="settings-btn" onClick={onButtonClick}>
        {buttonText}
      </button>
    </div>
  );
}
