"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const C = {
  coralEnd: "#E8527D", creamWarm: "#F2EBD8",
  inkSoft: "#5A5247", inkMute: "#9A9080",
  greenSoft: "#E8EFEC", greenAccent: "#3FA88E",
  border: "#E8DFC8",
};

export function ClientActions({ clientId, isActive }: { clientId: string; isActive: boolean }) {
  const router = useRouter();
  const [active, setActive] = useState(isActive);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function toggleActive() {
    const next = !active;
    setActive(next);
    await fetch(`/api/coach/clients/${clientId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: next }),
    });
    router.refresh();
  }

  async function deleteClient() {
    await fetch(`/api/coach/clients/${clientId}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div style={{ display: "flex", gap: 6, flexShrink: 0 }} onClick={e => e.preventDefault()}>
      <button
        onClick={toggleActive}
        style={{
          padding: "5px 10px", borderRadius: 8, fontSize: 11, fontWeight: 700,
          cursor: "pointer", fontFamily: "inherit", border: `1px solid ${C.border}`,
          background: active ? C.creamWarm : C.greenSoft,
          color: active ? C.inkSoft : C.greenAccent,
        }}
      >
        {active ? "Désactiver" : "Réactiver"}
      </button>
      {confirmDelete ? (
        <div style={{ display: "flex", gap: 4 }}>
          <button
            onClick={deleteClient}
            style={{
              padding: "5px 10px", borderRadius: 8, fontSize: 11, fontWeight: 700,
              cursor: "pointer", fontFamily: "inherit",
              background: C.coralEnd, color: "#FFFFFF", border: "none",
            }}
          >
            Confirmer
          </button>
          <button
            onClick={() => setConfirmDelete(false)}
            style={{
              padding: "5px 8px", borderRadius: 8, fontSize: 11,
              cursor: "pointer", fontFamily: "inherit",
              background: "none", border: `1px solid ${C.border}`, color: C.inkMute,
            }}
          >
            ✕
          </button>
        </div>
      ) : (
        <button
          onClick={() => setConfirmDelete(true)}
          style={{
            padding: "5px 8px", borderRadius: 8, fontSize: 12,
            cursor: "pointer", fontFamily: "inherit",
            background: "none", border: `1px solid ${C.border}`, color: C.inkMute,
          }}
        >
          🗑
        </button>
      )}
    </div>
  );
}
