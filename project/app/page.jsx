"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Search,
  MapPin,
  ChefHat,
  Users,
  Star,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import ProviderCard from "@/components/ProviderCard";
import HowItWorks from "@/components/HowItWorks";
import PricingSection from "@/components/PricingSection";
import Footer from "@/components/Footer";
import AskMe from "@/components/AskMe";
import { providers as providersApi } from "@/lib/api";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";

const SERVICE_CITIES = [
  "Bhubaneswar",
  "Mumbai",
  "Delhi",
  "Bengaluru",
  "Hyderabad",
  "Chennai",
  "Pune",
  "Ahmedabad",
  "Jaipur",
  "Gurgaon",
];

const CITY_ALIASES = {
  bhubaneswar: "Bhubaneswar",
  mumbai: "Mumbai",
  bombay: "Mumbai",
  delhi: "Delhi",
  newdelhi: "Delhi",
  bangalore: "Bengaluru",
  bengaluru: "Bengaluru",
  hyderabad: "Hyderabad",
  hydrabad: "Hyderabad",
  chennai: "Chennai",
  pune: "Pune",
  ahmedabad: "Ahmedabad",
  jaipur: "Jaipur",
  gurgaon: "Gurgaon",
  gurugram: "Gurgaon",
};

const DEFAULT_CITY = "Bhubaneswar";

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "veg", label: "Veg Only", apiParam: { veg: "true" } },
  { id: "nonveg", label: "Non-Veg", apiParam: { nonveg: "true" } },
];

const STATS = [
  {
    icon: ChefHat,
    value: "500+",
    label: "Home Cooks",
    color: "text-[#EA580C]",
  },
  {
    icon: Users,
    value: "12,000+",
    label: "Happy Customers",
    color: "text-[#2563EB]",
  },
  { icon: Star, value: "4.7", label: "Avg Rating", color: "text-amber-500" },
  {
    icon: TrendingUp,
    value: "₹60–₹100",
    label: "Per Meal",
    color: "text-green-600",
  },
];

function ProviderSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-[#FCEAE1] overflow-hidden animate-pulse">
      <div className="h-28 sm:h-40 bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
          <div className="h-5 bg-gray-200 rounded w-16" />
          <div className="h-8 bg-gray-200 rounded-xl w-24" />
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState(DEFAULT_CITY);
  const [autocompleteResults, setAutocompleteResults] = useState([]);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [providerList, setProviderList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const initialLoaded = useRef(false);
  const searchAbortControllerRef = useRef(null);
  const locationSearchTimeoutRef = useRef(null);

  const normalizeCityKey = (value) =>
    String(value || "").trim().toLowerCase().replace(/[^a-z]/g, "");

  const resolveServiceCity = (value) => {
    const raw = String(value || "").toLowerCase();
    if (!raw.trim()) return null;

    for (const [alias, city] of Object.entries(CITY_ALIASES)) {
      if (raw.includes(alias)) return city;
    }

    for (const city of SERVICE_CITIES) {
      if (raw.includes(normalizeCityKey(city))) return city;
    }

    const key = normalizeCityKey(value);
    return CITY_ALIASES[key] || SERVICE_CITIES.find((city) => normalizeCityKey(city) === key) || null;
  };

  const resolveServiceCityFromOSMResult = (result) => {
    const address = result?.address || {};
    const candidates = [
      address.city,
      address.town,
      address.village,
      address.county,
      address.state_district,
      address.state,
      address.region,
      result?.display_name,
    ].filter(Boolean);

    for (const candidate of candidates) {
      const matchedCity = resolveServiceCity(candidate);
      if (matchedCity) return matchedCity;
    }

    const allAddressParts = Object.values(address).filter(Boolean);
    for (const part of allAddressParts) {
      const matchedCity = resolveServiceCity(part);
      if (matchedCity) return matchedCity;
    }

    return null;
  };

  const fetchLocationSuggestions = async (query) => {
    if (!query) return;
    if (locationSearchTimeoutRef.current) {
      clearTimeout(locationSearchTimeoutRef.current);
      locationSearchTimeoutRef.current = null;
    }
    if (searchAbortControllerRef.current) {
      searchAbortControllerRef.current.abort();
      searchAbortControllerRef.current = null;
    }

    const controller = new AbortController();
    searchAbortControllerRef.current = controller;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=6&countrycodes=in&q=${encodeURIComponent(
          query,
        )}`,
        { signal: controller.signal },
      );
      if (!response.ok) throw new Error("Search failed");
      const results = await response.json();
      setAutocompleteResults(
        results.map((item) => ({
          id: item.place_id,
          display_name: item.display_name,
          address: item.address,
          lat: item.lat,
          lon: item.lon,
        })),
      );
    } catch (error) {
      if (error.name !== "AbortError") {
        setAutocompleteResults([]);
      }
    }
  };

  const handleLocationInput = (value) => {
    setLocationQuery(value);
    setLocationError("");
    setAutocompleteResults([]);

    const matchedCity = resolveServiceCity(value);
    if (matchedCity) {
      setSelectedCity(matchedCity);
    } else if (!value) {
      setSelectedCity(DEFAULT_CITY);
    } else {
      setSelectedCity("");
    }

    if (locationSearchTimeoutRef.current) {
      clearTimeout(locationSearchTimeoutRef.current);
    }
    if (value.trim().length >= 3) {
      locationSearchTimeoutRef.current = setTimeout(() => {
        fetchLocationSuggestions(value.trim());
      }, 250);
    }
  };

  const handlePredictionSelect = (prediction) => {
    const selectedText = prediction.display_name || "";
    const matchedCity = resolveServiceCityFromOSMResult(prediction) || resolveServiceCity(selectedText);

    setLocationQuery(selectedText);
    setAutocompleteResults([]);
    setLocationError("");

    if (matchedCity) {
      setSelectedCity(matchedCity);
    } else {
      setSelectedCity("");
      setLocationError(
        "We are sorry currently we are not providing our service to this location, we will be there soon",
      );
    }
  };

  const fetchProviders = useCallback(async () => {
    if (!initialLoaded.current) setLoading(true);
    setError(null);
    try {
      const catConfig = CATEGORIES.find((c) => c.id === activeCategory);
      const resolvedCity = resolveServiceCity(locationQuery) || selectedCity;
      if (!resolvedCity) {
        setProviderList([]);
        setError(
          "we are sorry currently we are not providing our service to this location, we will be there soon",
        );
        setLoading(false);
        return;
      }
      setSelectedCity(resolvedCity);
      const params = {
        ...(catConfig?.apiParam || {}),
        city: resolvedCity,
        ...(searchQuery ? { search: searchQuery } : {}),
      };
      const data = await providersApi.list(params);
      setProviderList(data.providers || []);
      initialLoaded.current = true;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [activeCategory, searchQuery, selectedCity, locationQuery]);

  useEffect(() => {
    initialLoaded.current = false;
    const debounce = setTimeout(fetchProviders, 300);
    return () => clearTimeout(debounce);
  }, [fetchProviders]);

  async function handleUseMyLocation() {
    if (typeof window === "undefined") return;
    setLocationError("");

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported on this device.");
      return;
    }

    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          const res = await fetch(
            `/api/geo/reverse?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`,
          );
          const data = await res.json().catch(() => ({}));
          if (!res.ok) throw new Error(data?.error || "Could not detect city");

          const rawCity = String(data?.city || "").trim();
          if (!rawCity) throw new Error("Could not detect city");

          const matchedCity = resolveServiceCity(rawCity);
          if (!matchedCity) {
            setSelectedCity("");
            setLocationError(
              "We are sorry currently we are not providing our service to this location, we will be there soon",
            );
            return;
          }

          setSelectedCity(matchedCity);
          setLocationQuery(matchedCity);
        } catch (e) {
          setLocationError(e?.message || "Could not detect city");
        } finally {
          setLocating(false);
        }
      },
      (err) => {
        setLocating(false);
        if (err?.code === 1) setLocationError("Location permission denied.");
        else setLocationError("Could not fetch your location.");
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 30000 },
    );
  }

  useAutoRefresh(fetchProviders);

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF7ED]">
      <Navbar />

      <main id="main-content">
        {/* Hero */}
        <section
          className="relative py-16 sm:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden"
          style={{
            backgroundImage: "url(/hero_background.jpeg)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
          aria-labelledby="hero-heading"
        >
          <div className="absolute inset-0 bg-gray-900/40" aria-hidden="true" />
          <div className="relative max-w-3xl mx-auto text-center">
            <span className="inline-block bg-[#EA580C]/10 text-[#EA580C] text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-5">
              Home-cooked. Delivered daily.
            </span>
            <h1
              id="hero-heading"
              className="font-heading font-bold text-4xl sm:text-5xl lg:text-6xl text-[#f8f8fa] leading-tight mb-4"
            >
              Taste of home, <br />
              <span className="text-[#EA580C]">right at your door</span>
            </h1>
            <p className="text-[#f1f2f3] text-base sm:text-lg leading-relaxed mb-8 max-w-xl mx-auto">
              Find verified home cooks near you and get freshly cooked meals
              delivered every day — just like Ma used to make.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
              <div className="relative flex-1">
                <div className="flex items-center gap-2 bg-white border border-[#FCEAE1] rounded-xl px-4 py-3 shadow-sm focus-within:border-[#EA580C] focus-within:ring-2 focus-within:ring-[#EA580C]/20 transition-all">
                  <MapPin
                    size={18}
                    className="text-[#EA580C] shrink-0"
                    aria-hidden="true"
                  />
                  <input
                    id="location-search"
                    type="text"
                    value={locationQuery}
                    onChange={(e) => handleLocationInput(e.target.value)}
                    placeholder="Start typing your city or area…"
                    className="flex-1 bg-transparent text-sm text-[#0F172A] placeholder-[#64748B] outline-none"
                    aria-label="Search for location"
                  />
                  <button
                    type="button"
                    onClick={handleUseMyLocation}
                    disabled={locating}
                    className="shrink-0 text-xs font-semibold text-[#EA580C] hover:text-[#C2410C] disabled:opacity-60"
                    aria-label="Use my current location"
                  >
                    {locating ? "Locating…" : "Use location"}
                  </button>
                </div>

                {autocompleteResults.length > 0 && (
                  <ul className="absolute z-50 mt-2 w-full overflow-hidden rounded-3xl border border-[#FCEAE1] bg-white shadow-xl">
                    {autocompleteResults.map((prediction) => (
                      <li
                        key={prediction.id}
                        onClick={() => handlePredictionSelect(prediction)}
                        className="cursor-pointer px-4 py-3 text-left text-sm text-[#0F172A] hover:bg-[#F8F8F8]"
                      >
                        <span className="font-semibold">
                          {prediction.display_name.split(",")[0]}
                        </span>
                        <span className="block text-xs text-[#64748B]">
                          {prediction.display_name}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <button
                onClick={fetchProviders}
                className="flex items-center justify-center gap-2 bg-[#EA580C] text-white font-semibold px-6 py-[10px] rounded-xl hover:bg-[#C2410C] active:scale-95 transition-all cursor-pointer shadow-sm"
                aria-label="Search for kitchens"
              >
                <Search size={18} aria-hidden="true" />
                Find Kitchens
              </button>
            </div>
            <div className="mt-4 text-sm text-white/90 max-w-2xl mx-auto text-center">
              <p className="font-semibold">Our service locations:</p>
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                {SERVICE_CITIES.map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => {
                      setLocationQuery(city);
                      setSelectedCity(city);
                      setLocationError("");
                      setAutocompleteResults([]);
                    }}
                    className="rounded-full border border-white/30 bg-white/10 px-3 py-2 text-xs text-white hover:bg-white hover:text-[#0F172A] transition-colors"
                  >
                    {city}
                  </button>
                ))}
              </div>
              {locationError ? (
                <p className="mt-3 text-sm text-red-200/90" role="status">
                  {locationError}
                </p>
              ) : (
                <p className="mt-3 text-sm text-white/80">
                  Search and select one of the cities above for nearby student kitchens.
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Stats */}
        <section
          className="bg-white border-y border-[#FCEAE1]"
          aria-label="Platform stats"
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <dl className="grid grid-cols-2 md:grid-cols-4 divide-x divide-[#FCEAE1]">
              {STATS.map(({ icon: Icon, value, label, color }) => (
                <div
                  key={label}
                  className="flex flex-col items-center py-6 px-4 gap-2"
                >
                  <Icon size={22} className={color} aria-hidden="true" />
                  <dt className="sr-only">{label}</dt>
                  <dd className="font-heading font-bold text-2xl text-[#0F172A]">
                    {value}
                  </dd>
                  <p className="text-xs text-[#64748B] text-center">{label}</p>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* Provider listings */}
        <section
          className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
          aria-labelledby="kitchens-heading"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2
              id="kitchens-heading"
              className="font-heading font-bold text-2xl sm:text-3xl text-[#0F172A]"
            >
              Kitchens near you
            </h2>
            <div className="flex items-center gap-2 bg-white border border-[#FCEAE1] rounded-xl px-3 py-2 w-full sm:w-64 focus-within:border-[#EA580C] focus-within:ring-2 focus-within:ring-[#EA580C]/20 transition-all">
              <Search
                size={15}
                className="text-[#64748B] shrink-0"
                aria-hidden="true"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter kitchens…"
                className="flex-1 bg-transparent text-sm text-[#0F172A] placeholder-[#64748B] outline-none"
                aria-label="Filter kitchens"
              />
            </div>
          </div>

          <div
            className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none"
            role="group"
            aria-label="Filter by category"
          >
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`shrink-0 text-sm font-medium px-4 py-2 rounded-full border transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EA580C] ${
                  activeCategory === cat.id
                    ? "bg-[#EA580C] text-white border-[#EA580C]"
                    : "bg-white text-[#64748B] border-[#FCEAE1] hover:border-[#EA580C] hover:text-[#EA580C]"
                }`}
                aria-pressed={activeCategory === cat.id}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {error && (
            <div
              className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6"
              role="alert"
            >
              <AlertCircle size={18} className="text-red-500 shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
              <button
                onClick={fetchProviders}
                className="ml-auto text-sm font-semibold text-red-600 hover:underline cursor-pointer"
              >
                Retry
              </button>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
              {[...Array(6)].map((_, i) => (
                <ProviderSkeleton key={i} />
              ))}
            </div>
          ) : providerList.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
              {providerList.map((provider) => (
                <ProviderCard key={provider.id} provider={provider} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16" role="status">
              <div className="w-16 h-16 bg-[#FDF4F0] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Search
                  size={28}
                  className="text-[#EA580C]"
                  aria-hidden="true"
                />
              </div>
              <p className="font-heading font-bold text-xl text-[#0F172A] mb-2">
                No kitchens found
              </p>
              <p className="text-[#64748B] text-sm">
                Try a different search or be the first to list your kitchen!
              </p>
            </div>
          )}
        </section>

        <HowItWorks />

        <PricingSection />

        {/* Provider CTA */}
        <section
          className="bg-linear-to-r from-[#EA580C] to-[#F97316] py-14 px-4 sm:px-6 lg:px-8"
          aria-labelledby="provider-cta-heading"
        >
          <div className="max-w-3xl mx-auto text-center text-white">
            <h2
              id="provider-cta-heading"
              className="font-heading font-bold text-3xl sm:text-4xl mb-3"
            >
              Cook from home. Earn every day.
            </h2>
            <p className="text-white/80 text-base sm:text-lg mb-8 leading-relaxed">
              Join home cooks already earning on Mom&apos;s Magic. No setup cost
              — list your kitchen for free and start getting orders today.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/register?role=provider"
                className="inline-flex items-center justify-center gap-2 bg-white text-[#EA580C] font-bold text-sm px-8 py-3.5 rounded-xl hover:bg-orange-50 active:scale-95 transition-all cursor-pointer"
              >
                <ChefHat size={18} aria-hidden="true" />
                List your kitchen — it&apos;s free
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 border-2 border-white/60 text-white font-semibold text-sm px-8 py-3.5 rounded-xl hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
              >
                Learn how it works
              </a>
            </div>
          </div>
        </section>
      </main>

      <AskMe />
      <Footer />
    </div>
  );
}
