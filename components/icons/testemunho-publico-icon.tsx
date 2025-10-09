import { MessageCircle } from "lucide-react";

interface TestemunhoPublicoIconProps {
  className?: string;
}

export function TestemunhoPublicoIcon({ className }: TestemunhoPublicoIconProps) {
  return <MessageCircle className={className} />;
}