"use client";

export function authHeaders(role: "Client" | "Driver"): Record<string, string> {
  const token = role === "Driver"
    ? (localStorage.getItem("rf_driver_token") || localStorage.getItem("repartofacil_driver_token") || localStorage.getItem("repartofacil_token"))
    : (localStorage.getItem("rf_customer_token") || localStorage.getItem("repartofacil_client_token") || localStorage.getItem("repartofacil_token"));
  return token ? { Authorization: `Bearer ${token}` } : {};
}
