"use client";
import dynamic from "next/dynamic";

const DashboardBoard = dynamic(
    () => import("@/components/dashboard/DashboardBoard"),
    { ssr: false }
);

export default function Page() {
    return (
        <div className="min-h-screen bg-gray-100">
            <h1 className="text-2xl font-bold p-6">Dashboard</h1>
            <DashboardBoard />
        </div>
    )
}
