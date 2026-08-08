/**
 * Picked once per page render on the server — a Server Component's output
 * is never re-run or diffed on the client, so Math.random() here carries
 * no hydration-mismatch risk (unlike a "use client" component).
 */
function pick<T>(options: T[]): T {
  return options[Math.floor(Math.random() * options.length)];
}

function timeOfDayLabel(date: Date): string {
  const hour = date.getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
}

export function pickGreeting(name: string, date: Date = new Date()): string {
  const options = [
    `${timeOfDayLabel(date)}, ${name} 👋`,
    `Welcome Back, ${name} 👋`,
    "Ready to Level Up? 🚀",
    "Let's Crush Today's Goals 💪",
  ];
  return pick(options);
}

const SUBTITLES = [
  "Every rep gets you closer — keep going!",
  "Consistency beats intensity.",
  "Transformation happens one workout at a time.",
  "Your future self is watching.",
  "Small improvements become big results.",
];

export function pickSubtitle(): string {
  return pick(SUBTITLES);
}
