"use client";

import { useEffect, useRef, useState } from "react";
import type { CompanyStore } from "@/data/mockCompanies";
import type { SeccionTienda } from "../ui/NavegacionTienda";

interface UseTiendaNavegacionProps {
  companies: CompanyStore[];
  catalogStatus: string;
}

export function useTiendaNavegacion({
  companies,
  catalogStatus,
}: UseTiendaNavegacionProps) {
  const [selectedCompany, setSelectedCompany] = useState<CompanyStore | null>(
    null
  );
  const selectedCompanyRef = useRef<CompanyStore | null>(null);
  selectedCompanyRef.current = selectedCompany;

  const [selectedCategory, setSelectedCategory] = useState("todos");
  const [activeBottomTab, setActiveBottomTab] = useState<SeccionTienda>("home");
  const [searchQuery, setSearchQuery] = useState("");

  const companyKey = (company: CompanyStore) => company.slug || company.id;

  const openCompany = (
    company: CompanyStore,
    initialSearch = "",
    { pushHistory = true }: { pushHistory?: boolean } = {}
  ) => {
    setSelectedCompany(company);
    setSelectedCategory("todos");
    setSearchQuery(initialSearch);
    if (pushHistory && typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tienda", companyKey(company));
      window.history.pushState({ tienda: companyKey(company) }, "", url);
    }
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const closeCompany = ({
    pushHistory = true,
  }: { pushHistory?: boolean } = {}) => {
    setSelectedCompany(null);
    setSelectedCategory("todos");
    setSearchQuery("");
    if (pushHistory && typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (url.searchParams.has("tienda")) {
        url.searchParams.delete("tienda");
        window.history.pushState({}, "", url);
      }
    }
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0 });
    }
  };

  const findCompanyByKey = (key: string | null) => {
    if (!key) return null;
    const normalizedKey = key.toLowerCase().trim();
    return (
      companies.find((company) => {
        const id = (company.id || "").toLowerCase();
        const slug = (company.slug || "").toLowerCase();
        const parentId = ((company as any).parentCompanyId || "").toLowerCase();
        const parentSlug = ((company as any).parentSlug || "").toLowerCase();
        const isMaciel =
          normalizedKey === "maciel" || normalizedKey === "rumaul";
        return (
          slug === normalizedKey ||
          id === normalizedKey ||
          id === `empresa-${normalizedKey}` ||
          parentId === normalizedKey ||
          parentSlug === normalizedKey ||
          (isMaciel && (id.includes("maciel") || slug.includes("maciel")))
        );
      }) || null
    );
  };

  useEffect(() => {
    if (catalogStatus !== "ready") return;
    const syncFromUrl = () => {
      const key = new URL(window.location.href).searchParams.get("tienda");
      const company = findCompanyByKey(key);
      if (company && company.id === selectedCompanyRef.current?.id) {
        setSelectedCompany(company);
      } else if (company) {
        openCompany(company, "", { pushHistory: false });
      } else if (selectedCompanyRef.current) {
        closeCompany({ pushHistory: false });
      }
    };
    syncFromUrl();
    window.addEventListener("popstate", syncFromUrl);
    return () => window.removeEventListener("popstate", syncFromUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catalogStatus, companies]);

  return {
    selectedCompany,
    setSelectedCompany,
    selectedCategory,
    setSelectedCategory,
    activeBottomTab,
    setActiveBottomTab,
    searchQuery,
    setSearchQuery,
    openCompany,
    closeCompany,
    findCompanyByKey,
  };
}
