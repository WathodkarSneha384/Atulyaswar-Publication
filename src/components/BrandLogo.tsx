type BrandLogoProps = {
  subtitle?: string;
  compact?: boolean;
};

export default function BrandLogo({
  subtitle = "Atulyaswar Publication",
  compact = false,
}: BrandLogoProps) {
  return (
    <div className={`brand-wrap ${compact ? "compact" : ""}`}>
      <div className="brand-mark" aria-hidden="true">
        <span className="brand-mark-main">AP</span>
        <span className="brand-mark-sub">
          <span className="brand-mark-sub-line">ATULYASWAR</span>
          <span className="brand-mark-sub-line">PUBLICATION</span>
        </span>
        <span className="brand-mark-strip" />
      </div>
      <div className="brand-text">
        <p className="brand-title">{subtitle}</p>
        <p className="brand-city">Pune</p>
      </div>
    </div>
  );
}
