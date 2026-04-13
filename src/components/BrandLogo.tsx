type BrandLogoProps = {
  subtitle?: string;
  compact?: boolean;
};

export default function BrandLogo({
  subtitle = "Atulyaswar Publication",
  compact = false,
}: BrandLogoProps) {
  void subtitle;

  return (
    <div className={`brand-wrap ${compact ? "compact" : ""}`}>
      <div className="brand-mark" aria-hidden="true">
        <svg
          className="brand-mark-svg"
          viewBox="0 0 600 190"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label="Atulyaswar. A Peer Reviewed Indian Music Research Journal"
        >
          <text
            x="50%"
            y="70"
            textAnchor="middle"
            fontFamily="Playfair Display, Cinzel, serif"
            fontSize="96"
            fontWeight="600"
            fill="#9f2b82"
            letterSpacing="1"
          >
            Atulyaswar
          </text>

          <text
            x="50%"
            y="132"
            textAnchor="middle"
            fontFamily="Inter, sans-serif"
            fontSize="36"
            fontWeight="600"
            fill="#b97dad"
          >
            <tspan x="50%" dy="0">
              A Peer Reviewed Indian Music
            </tspan>
            <tspan x="50%" dy="36">
              Research Journal
            </tspan>
          </text>
        </svg>
      </div>
    </div>
  );
}
