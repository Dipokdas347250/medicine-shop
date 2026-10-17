import { Baby, BriefcaseMedical, Droplet, Hand, HeartPulse, Package, ShieldPlus, Soup, Sparkles, Stethoscope, Thermometer, Wind } from "lucide-react";

const ICONS = { Baby, BriefcaseMedical, Droplet, Hand, HeartPulse, ShieldPlus, Soup, Sparkles, Stethoscope, Thermometer, Wind };

export default function CategoryIcon({ name, ...props }) {
  const Icon = ICONS[name] || Package;
  return <Icon {...props} />;
}
