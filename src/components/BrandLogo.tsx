import Image from "next/image";
import logoImage from "../../Asset/Logo1.png";

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
        <Image
          src={logoImage}
          alt="Atulyaswar Publication logo"
          className="brand-mark-image"
          priority
        />
      </div>
      <div className="brand-text">
        <p className="brand-title">{subtitle}</p>
        <p className="brand-city">Pune</p>
      </div>
    </div>
  );
}
