"use client";

import { useState, useEffect } from "react";
import GangnamAdminManager from "@/components/GangnamAdminManager";

export default function GangnamAdminPage() {
    const [reservations, setReservations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReservations = async () => {
            try {
                const res = await fetch("/api/admin/gangnam");
                const data = await res.json();
                if (Array.isArray(data)) {
                    setReservations(data);
                }
            } catch (err) {
                console.error("Failed to fetch reservations");
            } finally {
                setLoading(false);
            }
        };
        fetchReservations();
    }, []);

    if (loading) {
        return (
            <div style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
                backgroundColor: "#f8fafc",
                color: "#64748b",
                fontSize: "16px"
            }}>
                로딩 중...
            </div>
        );
    }

    return <GangnamAdminManager initialReservations={reservations} />;
}
