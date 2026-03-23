import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";

interface ClanMember {
  id: number;
  eaUsername: string;
  displayName: string;
  kd: string;
  playtimeHours: number;
  kills: number;
  deaths: number;
}

export function ClanMembersCarousel() {
  const { data: members = [] } = trpc.clanMembers.getAll.useQuery();
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    if (members.length === 0) return;

    const interval = setInterval(() => {
      setScrollPosition((prev) => (prev + 1) % (members.length * 2));
    }, 50);

    return () => clearInterval(interval);
  }, [members.length]);

  if (members.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 rounded-lg" style={{ background: "var(--muted)", border: "1px dashed var(--border)" }}>
        <p className="text-sm text-muted-foreground">Üye verileri yükleniyor...</p>
      </div>
    );
  }

  // Duplicate array for seamless loop
  const displayMembers = [...members, ...members];

  return (
    <div className="relative overflow-hidden rounded-lg border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
      <div className="relative h-40 overflow-hidden">
        <div
          className="flex gap-3 absolute transition-transform"
          style={{
            transform: `translateX(-${(scrollPosition / (members.length * 2)) * 100}%)`,
            width: `${(displayMembers.length * 100) / 4}%`,
          }}
        >
          {displayMembers.map((member, idx) => (
            <div
              key={idx}
              className="flex-shrink-0 w-32 p-3 rounded-lg flex flex-col items-center justify-center text-center"
              style={{ background: "var(--muted)" }}
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-2 font-bold text-sm" style={{ background: "linear-gradient(135deg, var(--primary), oklch(0.60 0.12 70))", color: "var(--primary-foreground)" }}>
                {(member.displayName || member.eaUsername).charAt(0).toUpperCase()}
              </div>
              <p className="text-xs font-semibold text-foreground truncate max-w-full">{member.displayName || member.eaUsername}</p>
              <p className="text-xs text-muted-foreground">K/D: {member.kd}</p>
              <p className="text-xs text-muted-foreground">{member.playtimeHours}h</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
