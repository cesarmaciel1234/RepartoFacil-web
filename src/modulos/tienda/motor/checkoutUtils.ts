export function normalizeWhatsAppPhone(rawPhone?: string): string {
  if (!rawPhone) return "";
  const digits = rawPhone.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("549")) return digits;
  if (digits.startsWith("54")) return `549${digits.slice(2)}`;
  if (digits.startsWith("0")) return `549${digits.replace(/^0+/, "")}`;
  if (digits.length === 10) return `549${digits}`;
  if (digits.length === 8) return `54911${digits}`;
  return digits;
}

export function parseAddressParts(raw: string) {
  if (!raw) return { street: "", number: "", unit: "", city: "" };
  const commaParts = raw.split(",").map((s) => s.trim());
  const first = commaParts[0] || "";
  const match = first.match(/^(.*?)(?:\s+(\d+[\w-]*))$/);
  let street = first;
  let number = "";
  if (match) {
    street = match[1].trim();
    number = match[2].trim();
  }
  let unit = "";
  const otherParts: string[] = [];
  for (let i = 1; i < commaParts.length; i++) {
    const part = commaParts[i];
    if (!number && /^\d+$/.test(part)) {
      number = part;
    } else if (/^(piso|depto|dto|departamento|timbre)/i.test(part)) {
      unit = part;
    } else {
      otherParts.push(part);
    }
  }
  const city = otherParts.join(", ");
  return { street, number, unit, city };
}
