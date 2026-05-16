export function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;

  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "Hace un momento";
  if (minutes < 60) return `Hace ${minutes} min`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Hace ${hours}h`;

  const days = Math.floor(hours / 24);
  if (days === 1) return "Hace 1 día";
  return `Hace ${days} días`;
}

export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (local.length <= 2) return `${local[0]}***@${domain}`;
  return `${local[0]}${local[1]}***@${domain}`;
}

export function getUserLabel(trustStars: number): string {
  switch (trustStars) {
    case 1: return "Vecino nuevo";
    case 2: return "Vecino activo";
    case 3: return "Vecino confiable";
    case 4: return "Vecino muy confiable";
    case 5: return "Vecino excelente";
    default: return "Vecino";
  }
}

export function starsDisplay(count: number): string {
  return "★".repeat(count) + "☆".repeat(5 - count);
}
