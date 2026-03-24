const GlassCard = ({ children, className = '', padded = true, neonColor = 'none' }) => {
  const neonClass = neonColor !== 'none' ? `neon-border-${neonColor}` : '';
  const paddingClass = padded ? 'p-6' : '';
  
  return (
    <div className={`glass-panel ${paddingClass} ${neonClass} ${className}`}>
      {children}
    </div>
  );
};

export default GlassCard;
