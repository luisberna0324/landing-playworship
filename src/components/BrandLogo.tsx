/** Keep the original wordmark shape with colors suited to a white surface. */
export function BrandLogo({ className = '', priority = false }: { className?: string; priority?: boolean }) {
  return <span className={`brand-wordmark ${className}`.trim()}>
    <img
      src="/assets/img/pwLogoSinFondo.png"
      alt="Play Worship"
      width="1920"
      height="709"
      decoding="async"
      fetchPriority={priority ? 'high' : undefined}
    />
  </span>;
}
