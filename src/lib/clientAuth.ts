"use client";

export function authHeaders(role: "Client" | "Driver"): Record<string, string> {
  if (typeof window === "undefined") return {};
  if (role === "Driver") {
    const token =
      localStorage.getItem("rf_driver_token") ||
      localStorage.getItem("repartofacil_driver_token");
    if (token) return { Authorization: `Bearer ${token}` };

    const profile = localStorage.getItem("repartofacil_driver_profile");
    if (profile) {
      const legacyToken = localStorage.getItem("repartofacil_token");
      if (legacyToken) return { Authorization: `Bearer ${legacyToken}` };
    }
    return {};
  } else {
    const token =
      localStorage.getItem("rf_customer_token") ||
      localStorage.getItem("repartofacil_client_token");
    if (token) return { Authorization: `Bearer ${token}` };

    const clientProfile = localStorage.getItem("repartofacil_client_profile");
    if (clientProfile) {
      const legacyToken = localStorage.getItem("repartofacil_token");
      if (legacyToken) return { Authorization: `Bearer ${legacyToken}` };
    }
    return {};
  }
}
