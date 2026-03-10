interface Props {
  icon: string;
  title: string;
  subtitle: string;
}

const EmptyState = ({ icon, title, subtitle }: Props) => (
  <div className="text-center py-16">
    <div className="text-5xl mb-4 opacity-40">{icon}</div>
    <p className="font-display text-foreground text-xl mb-1">{title}</p>
    <p className="font-ui text-sm text-rx-text-secondary">{subtitle}</p>
  </div>
);

export default EmptyState;
