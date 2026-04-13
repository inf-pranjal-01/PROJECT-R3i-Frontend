const GradPill = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={`grad-pill ${className}`}>
    <div className="grad-pill-inner">{children}</div>
  </div>
);

export default GradPill;
