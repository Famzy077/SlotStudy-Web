export default function BrandLogo({ className }: { className?: string }) {
  return (
    <img
      className={className || 'brand-logo'}
      src="/images/slotstudy-logo.png"
      alt="SlotStudy"
    />
  );
}
