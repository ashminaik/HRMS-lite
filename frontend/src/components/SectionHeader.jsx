const SectionHeader = ({ title, subtitle, action }) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h3 className="text-xl font-semibold text-ink">{title}</h3>
        {subtitle ? <p className="text-sm text-slate">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
};

export default SectionHeader;
