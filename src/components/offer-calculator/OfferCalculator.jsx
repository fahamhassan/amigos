"use client";

import { useMemo, useRef, useState } from "react";
import styles from "./OfferCalculator.module.css";

const propertyTypes = [
  {
    id: "apartment",
    title: "Apartment / Flat",
    subtitle: "Multi-room residential",
    iconKey: "apartment",
    image: "/assets/external/projects/photo-1600607687920-4e2a09cf159d-w1500-q90.jpg"
  },
  {
    id: "house",
    title: "Single-Family House",
    subtitle: "Detached or terraced home",
    iconKey: "house",
    image: "/assets/external/property-value-preservation/photo-1600585154340-be6161a56a0c-w1400-q85.jpg"
  },
  {
    id: "commercial",
    title: "Commercial / Business",
    subtitle: "Office, practice, retail",
    iconKey: "commercial",
    image: "/assets/external/property-value-preservation/photo-1486406146926-c627a92ad1ab-w1400-q85.jpg"
  },
  {
    id: "facade",
    title: "Facade / Exterior",
    subtitle: "Exterior surfaces & masonry",
    iconKey: "facade",
    image: "/assets/services-imags/facade.jpg"
  },
  {
    id: "room",
    title: "Single Room",
    subtitle: "Individual room painting",
    iconKey: "room",
    image: "/assets/external/appartment-renovation/photo-1600210492486-724fe5c67fb0.jpg"
  },
  {
    id: "other",
    title: "Other Property",
    subtitle: "Special projects on request",
    iconKey: "other",
    image: "/assets/drywall/painting.jpg"
  }
];

const quickPropertyTypes = [
  {
    id: "2_5_apartment",
    title: "2½-room",
    subtitle: "Apartment",
    iconKey: "apartment",
    roomCount: 3,
    image: "/assets/external/appartment-renovation/photo-1600210492486-724fe5c67fb0.jpg"
  },
  {
    id: "3_5_apartment",
    title: "3½-room",
    subtitle: "Apartment",
    iconKey: "apartment",
    roomCount: 4,
    image: "/assets/external/projects/photo-1600607687920-4e2a09cf159d-w1500-q90.jpg"
  },
  {
    id: "4_5_apartment",
    title: "4½-room",
    subtitle: "Apartment",
    iconKey: "apartment",
    roomCount: 5,
    image: "/assets/external/property-value-preservation/photo-1600566753086-00f18fb6b3ea-w1200-q85.jpg"
  },
  {
    id: "5_5_apartment",
    title: "5½-room",
    subtitle: "Apartment",
    iconKey: "apartment",
    roomCount: 6,
    image: "/assets/external/appartment-renovation/photo-1600566753190-17f0baa2a6c3.jpg"
  },
  {
    id: "house",
    title: "House",
    subtitle: "(Single-family home)",
    iconKey: "house",
    roomCount: 6,
    image: "/assets/external/property-value-preservation/photo-1600585154340-be6161a56a0c-w1400-q85.jpg"
  },
  {
    id: "commercial",
    title: "Commercial",
    subtitle: "(Office / Practice)",
    iconKey: "commercial",
    roomCount: 4,
    image: "/assets/external/property-value-preservation/photo-1486406146926-c627a92ad1ab-w1400-q85.jpg"
  },
  {
    id: "other",
    title: "Other",
    subtitle: "(on request)",
    iconKey: "other",
    roomCount: 3,
    image: "/assets/drywall/painting.jpg"
  }
];

const roomTypes = ["Living Room", "Bedroom", "Kitchen", "Bathroom", "Hallway", "Other"];

const componentOptions = [
  { id: "ceilings", title: "Ceilings", iconKey: "ceilings", quantityKey: "ceilingArea", label: "Ceiling area", unit: "m²" },
  { id: "walls", title: "Walls", iconKey: "walls", quantityKey: "wallArea", label: "Wall area", unit: "m²" },
  { id: "doors", title: "Doors", iconKey: "doors", quantityKey: "doors", label: "Doors", unit: "pcs" },
  { id: "windows", title: "Windows", iconKey: "windows", quantityKey: "windows", label: "Windows", unit: "pcs" },
  { id: "radiators", title: "Radiators", iconKey: "radiators", quantityKey: "radiators", label: "Radiators", unit: "pcs" },
  { id: "baseboards", title: "Baseboards", iconKey: "baseboards", quantityKey: "baseboards", label: "Baseboards", unit: "lm" },
  { id: "railings", title: "Railings / Balcony", iconKey: "railings", quantityKey: "railingLength", label: "Railing length", unit: "lm" },
  { id: "stairs", title: "Stairs / Steps", iconKey: "stairs", quantityKey: "stairSteps", label: "Stair steps", unit: "steps" },
  { id: "other", title: "Other", iconKey: "other", quantityKey: "otherUnits", label: "Other items", unit: "qty" }
];

const facadeComponent = { id: "facade", title: "Facade / Exterior Surface", iconKey: "facade", quantityKey: "facadeArea", label: "Facade area", unit: "m²" };

const serviceOptions = [
  { id: "ceiling_paint_2_coats", title: "Paint ceilings – 2 coats", components: ["ceilings"] },
  { id: "wall_paint_2_coats", title: "Paint walls – 2 coats", components: ["walls", "facade"] },
  { id: "remove_wallpaper", title: "Remove wallpaper", components: ["walls"] },
  { id: "apply_wallpaper", title: "Apply wallpaper", components: ["walls"] },
  { id: "filling_spackling", title: "Filling / Spackling", components: ["walls", "ceilings", "facade"] },
  { id: "mold_treatment", title: "Mold treatment", components: ["walls", "ceilings", "facade"] },
  { id: "nicotine_treatment", title: "Nicotine treatment", components: ["walls", "ceilings"] },
  { id: "water_damage_repair", title: "Damage remediation", components: ["walls", "ceilings"] },
  { id: "priming_sealing", title: "Priming / Sealing", components: ["walls", "ceilings", "facade"] },
  { id: "paint_railings", title: "Clean, sand & paint railings", components: ["railings"] },
  { id: "paint_stairs", title: "Paint / varnish stairs", components: ["stairs"] },
  { id: "covering_protection", title: "Covering / Protection", components: ["ceilings", "walls", "doors", "windows", "radiators", "baseboards", "railings", "stairs", "facade"] }
];

const simpleServiceOptions = [
  { id: "paint_walls", title: "Paint walls – 2 coats", iconKey: "walls" },
  { id: "paint_ceilings", title: "Paint ceilings – 2 coats", iconKey: "ceilings" },
  { id: "apply_wallpaper", title: "Apply wallpaper", iconKey: "walls" },
  { id: "remove_wallpaper", title: "Remove wallpaper", iconKey: "walls" },
  { id: "filling_spackling", title: "Filling / Spackling", iconKey: "walls" },
  { id: "covering_protection", title: "Covering / Protection", iconKey: "other" }
];

const photoCategories = ["Room overview", "Walls", "Ceiling", "Damage", "Mold", "Water damage", "Facade", "Windows", "Doors", "Other"];

const detailedStepMeta = [
  { number: "01", key: "type", title: "Project Type", icon: "⌂" },
  { number: "02", key: "components", title: "Components", icon: "▦" },
  { number: "03", key: "services", title: "Work & Services", icon: "✦" },
  { number: "04", key: "quantities", title: "Quantities", icon: "↕" },
  { number: "05", key: "result", title: "Result", icon: "◉" },
  { number: "06", key: "verify", title: "Verify E-Mail", icon: "@" },
  { number: "07", key: "price", title: "Price", icon: "✓" }
];

const simpleStepMeta = [
  { number: "01", key: "type", title: "Project Type", icon: "⌂" },
  { number: "02", key: "scope", title: "Scope & Work", icon: "▦" },
  { number: "03", key: "condition", title: "Condition", icon: "◈" },
  { number: "04", key: "location", title: "Location", icon: "◎" },
  { number: "05", key: "contact", title: "Get Price", icon: "✓" }
];

const conditionOptions = [
  { id: "good", title: "Good Condition", desc: "No major preparation work needed.", iconKey: "condition_good" },
  { id: "minor_repairs", title: "Minor Repairs", desc: "Small filling work, hairline cracks.", iconKey: "condition_minor" },
  { id: "renovation", title: "Renovation Required", desc: "More extensive work: peeling, patching, remediation.", iconKey: "condition_renovation" }
];

const workScopeOptions = [
  { id: "walls", title: "Walls Only", desc: "Paint or treat all walls", iconKey: "paint_roller" },
  { id: "ceilings", title: "Ceilings Only", desc: "Paint or treat all ceilings", iconKey: "ceiling_lamp" },
  { id: "walls_ceilings", title: "Walls & Ceilings", desc: "Complete interior painting", iconKey: "apartment" }
];

const customerRequiredFields = ["firstName", "lastName", "phone", "address", "postalCode", "city"];

const initialState = {
  calculatorType: "SELECT", // "SELECT" | "SIMPLE" | "DETAILED"
  mode: "CALCULATE",
  propertyType: "",
  roomType: "",
  components: [],
  services: [],
  quantities: {},
  projectNotes: "",
  email: "",
  code: ["", "", "", ""],
  customerInfo: {
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    postalCode: "",
    city: "",
    company: "",
    propertyManagement: false
  },
  // Simple mode specifics (Customer A)
  roomCount: 3,
  roomSize: "medium",
  simpleServices: ["paint_walls", "paint_ceilings", "covering_protection"],
  workScope: "walls_ceilings",   // "walls" | "ceilings" | "walls_ceilings"
  condition: "good",              // "good" | "minor_repairs" | "renovation"
  postalCode: "",
  locationCity: ""
};

function toggle(list, value) {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function ComponentIcon({ iconKey }) {
  const commonProps = {
    viewBox: "0 0 48 48",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.6",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true"
  };

  switch (iconKey) {
    case "apartment":
      return (
        <svg {...commonProps}>
          <path d="M15 25 24 16l9 9" />
          <path d="M18 23v11h12V23" />
          <path d="M22 34v-7h4v7" />
        </svg>
      );
    case "house":
      return (
        <svg {...commonProps}>
          <path d="M11 24 24 12l13 12" />
          <path d="M15 22v15h18V22" />
          <path d="M21 37v-9h6v9" />
        </svg>
      );
    case "commercial":
      return (
        <svg {...commonProps}>
          <path d="M14 18h20v18H14V18Z" />
          <path d="M18 18v-5h12v5" />
          <path d="M19 24h2M27 24h2M19 30h2M27 30h2" />
        </svg>
      );
    case "room":
      return (
        <svg {...commonProps}>
          <path d="M14 15h20v22H14V15Z" />
          <path d="M20 21h8v8h-8V21Z" />
          <path d="M18 37v-5h12v5" />
        </svg>
      );
    case "ceilings":
    case "ceiling_lamp":
      return (
        <svg {...commonProps}>
          <path d="M12 12h24M24 12v8M16 26h16l-3-6H19l-3 6ZM21 26v2a3 3 0 0 0 6 0v-2M15 34l2-2M33 34l-2-2M24 33v3" />
        </svg>
      );
    case "walls":
    case "paint_roller":
      return (
        <svg {...commonProps}>
          <path d="M14 14h16a3 3 0 0 1 3 3v4a3 3 0 0 1-3 3H14a3 3 0 0 1-3-3v-4a3 3 0 0 1 3-3Z" />
          <path d="M33 18h4v11H25v7" />
          <path d="M22 36h6" />
        </svg>
      );
    case "doors":
      return (
        <svg {...commonProps}>
          <path d="M14 10h20v28H14V10Z" />
          <path d="M23 10v28" />
          <path d="M29 24h1" />
        </svg>
      );
    case "windows":
      return (
        <svg {...commonProps}>
          <path d="M12 12h24v24H12V12Z" />
          <path d="M24 12v24" />
          <path d="M12 24h24" />
        </svg>
      );
    case "radiators":
      return (
        <svg {...commonProps}>
          <path d="M14 34V17a5 5 0 0 1 10 0v17" />
          <path d="M24 34V17a5 5 0 0 1 10 0v17" />
          <path d="M10 34h28" />
          <path d="M10 20h4" />
          <path d="M34 20h4" />
        </svg>
      );
    case "baseboards":
      return (
        <svg {...commonProps}>
          <path d="M10 34h24a6 6 0 0 0 0-12h-3" />
          <path d="M10 34c7-2 11-6 13-12l2-7 11 3-2 6" />
          <path d="M27 15l3-5" />
        </svg>
      );
    case "railings":
      return (
        <svg {...commonProps}>
          <path d="M10 14h28M10 34h28M16 14v20M22 14v20M28 14v20M34 14v20M10 10v28M38 10v28" />
        </svg>
      );
    case "stairs":
      return (
        <svg {...commonProps}>
          <path d="M10 36h7v-6h7v-6h7v-6h7v-6" />
          <path d="M10 36v-6" />
        </svg>
      );
    case "facade":
      return (
        <svg {...commonProps}>
          <path d="M12 36V16l12-6 12 6v20" />
          <path d="M18 36V24h12v12" />
          <path d="M18 18h.01M24 18h.01M30 18h.01" />
        </svg>
      );
    case "condition_good":
      return (
        <svg {...commonProps}>
          <circle cx="24" cy="24" r="14" />
          <path d="m18 24 4 4 8-8" />
        </svg>
      );
    case "condition_minor":
      return (
        <svg {...commonProps}>
          <path d="M14 34l6-6 9 9-6 6-9-9Z" />
          <path d="M26 21l6-6a4 4 0 1 1 6 6l-6 6" />
        </svg>
      );
    case "condition_renovation":
      return (
        <svg {...commonProps}>
          <path d="M15 15l4 4-6 6-4-4 6-6ZM29 19l4-4a4 4 0 1 0-6-6l-4 4 6 6ZM18 30l12-12" />
        </svg>
      );
    case "pin":
      return (
        <svg {...commonProps}>
          <path d="M24 10a8 8 0 0 0-8 8c0 7 8 18 8 18s8-11 8-18a8 8 0 0 0-8-8Z" />
          <circle cx="24" cy="18" r="3" />
        </svg>
      );
    case "shield":
      return (
        <svg {...commonProps}>
          <path d="M24 10s10 3 12 5v10c0 9-7 15-12 17-5-2-12-8-12-17V15c2-2 12-5 12-5Z" />
          <path d="m19 24 4 4 7-7" />
        </svg>
      );
    case "lock":
      return (
        <svg {...commonProps}>
          <rect x="14" y="20" width="20" height="18" rx="3" />
          <path d="M18 20v-5a6 6 0 0 1 12 0v5" />
          <circle cx="24" cy="28" r="2" />
        </svg>
      );
    case "swiss_quality":
      return (
        <svg {...commonProps}>
          <circle cx="24" cy="24" r="15" />
          <path d="M24 16v16M16 24h16" strokeWidth="3" />
        </svg>
      );
    case "other":
    default:
      return (
        <svg {...commonProps}>
          <circle cx="16" cy="24" r="2" />
          <circle cx="24" cy="24" r="2" />
          <circle cx="32" cy="24" r="2" />
        </svg>
      );
  }
}

function titlesFromIds(options, ids) {
  return ids
    .map((id) => options.find((option) => option.id === id)?.title || id)
    .filter(Boolean);
}

export default function OfferCalculator({ embedded = false, defaultFlow = "SELECT" }) {
  const [step, setStep] = useState(0);
  const [state, setState] = useState(() => ({
    ...initialState,
    calculatorType: defaultFlow
  }));
  const [sessionId, setSessionId] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [photos, setPhotos] = useState([]);
  const codeRefs = useRef([]);

  const isSimple = state.calculatorType === "SIMPLE";
  const isSelect = state.calculatorType === "SELECT";
  const currentStepMeta = isSimple ? simpleStepMeta : detailedStepMeta;

  const components = useMemo(() => {
    return state.propertyType === "facade"
      ? [facadeComponent, ...componentOptions.filter((item) => ["windows", "doors", "other"].includes(item.id))]
      : componentOptions;
  }, [state.propertyType]);

  const visibleServices = useMemo(() => {
    return serviceOptions.filter((service) => {
      if (!state.components.length) return true;
      return service.components.some((component) => state.components.includes(component));
    });
  }, [state.components]);

  const visibleQuantities = useMemo(() => {
    const impliedComponents = serviceOptions
      .filter((service) => state.services.includes(service.id))
      .flatMap((service) => service.components);
    const selectedComponents = new Set([...state.components, ...impliedComponents]);

    return components.filter((component) => selectedComponents.has(component.id));
  }, [components, state.components, state.services]);

  const selectedComponentTitles = useMemo(() => {
    return titlesFromIds(components, state.components);
  }, [components, state.components]);

  const selectedServiceTitles = useMemo(() => {
    return titlesFromIds(serviceOptions, state.services);
  }, [state.services]);

  const progress = useMemo(() => {
    if (isSimple) {
      // 5 steps: 0,1,2,3 are the input steps; step >= 10 means post-calculation
      if (step === 0) return 20;
      if (step === 1) return 40;
      if (step === 2) return 60;
      if (step === 3) return 80;
      return 100; // step 4 contact, step 10+ post-calc
    }
    return ((step + 1) / detailedStepMeta.length) * 100;
  }, [isSimple, step]);

  function updateCustomerInfo(key, value) {
    setState((current) => ({
      ...current,
      customerInfo: { ...current.customerInfo, [key]: value }
    }));
  }

  function canContinue() {
    if (isSimple) {
      if (step === 0) return Boolean(state.propertyType);
      if (step === 1) return Boolean(state.workScope);
      if (step === 2) return Boolean(state.condition);
      if (step === 3) return Boolean(state.postalCode && state.postalCode.trim().length >= 4);
      // step 4 = contact form — handled separately (pre-calc submit)
      return true;
    }
    if (step === 0) return Boolean(state.propertyType);
    if (step === 1) return state.components.length > 0;
    if (step === 2) return state.services.length > 0;
    if (step === 3) return visibleQuantities.every((item) => Number(state.quantities[item.quantityKey]) > 0);
    return true;
  }


  async function calculateDetailed() {
    setBusy(true);
    setErrors({});
    setNotice("");

    const response = await fetch("/api/offer-calculator/calculate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: state.mode,
        propertyType: state.propertyType,
        roomType: state.roomType,
        components: state.components,
        services: state.services,
        quantities: state.quantities,
        projectNotes: state.projectNotes
      })
    });
    const data = await response.json();

    setBusy(false);

    if (!response.ok) {
      setErrors(data.errors || { general: data.error || "Please check your project details." });
      return;
    }

    setSessionId(data.sessionId);
    setStep(4);
  }

  async function calculateQuick() {
    setBusy(true);
    setErrors({});
    setNotice("");

    try {
      const response = await fetch("/api/offer-calculator/quick-calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyType: state.propertyType,
          roomType: state.roomType,
          roomCount: state.roomCount,
          roomSize: state.roomSize,
          workScope: state.workScope,
          condition: state.condition,
          postalCode: state.postalCode,
          locationCity: state.locationCity,
          projectNotes: [
            `Location: ${state.postalCode} ${state.locationCity}`.trim(),
            `Condition: ${state.condition}`,
            state.projectNotes
          ].filter(Boolean).join(" | ")
        })
      });
      const data = await response.json();
      setBusy(false);

      if (!response.ok) {
        setErrors(data.errors || { general: data.error || "Please check your project details." });
        return;
      }

      setSessionId(data.sessionId);
      // After calculate, move to email verify (step 10 = verify for simple mode)
      setStep(10);
    } catch (err) {
      setBusy(false);
      setErrors({ general: "Failed to calculate estimate. Please try again." });
    }
  }

  function next() {
    if (isSimple) {
      // Steps 0–3 are inputs; step 4 is the contact+send-code screen (triggered by submitContactAndSendCode)
      if (step === 3) {
        // Move to step 4 = contact + email form
        if (canContinue()) setStep(4);
        return;
      }
      if (canContinue()) setStep((current) => current + 1);
      return;
    }

    if (step === 3) {
      calculateDetailed();
      return;
    }

    if (canContinue()) setStep((current) => Math.min(current + 1, detailedStepMeta.length - 1));
  }

  // For simple flow: collect contact details, then trigger calculate + send code
  async function submitContactAndSendCode() {
    const info = state.customerInfo;
    if (!info.firstName.trim() || !info.lastName.trim() || !state.email.trim()) {
      setErrors({ general: "Please enter your first name, last name, and email address." });
      return;
    }
    // Calculate first, then send code
    setBusy(true);
    setErrors({});
    setNotice("");

    try {
      const calcResponse = await fetch("/api/offer-calculator/quick-calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyType: state.propertyType,
          roomType: state.roomType,
          roomCount: state.roomCount,
          roomSize: state.roomSize,
          workScope: state.workScope,
          condition: state.condition,
          postalCode: state.postalCode,
          locationCity: state.locationCity,
          projectNotes: [
            `Location: ${state.postalCode} ${state.locationCity}`.trim(),
            `Condition: ${state.condition}`
          ].filter(Boolean).join(" | ")
        })
      });
      const calcData = await calcResponse.json();

      if (!calcResponse.ok) {
        setBusy(false);
        setErrors(calcData.errors || { general: calcData.error || "Calculation failed." });
        return;
      }

      const sid = calcData.sessionId;
      setSessionId(sid);

      // Now send verification code
      const codeResponse = await fetch("/api/offer-calculator/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sid, email: state.email })
      });
      const codeData = await codeResponse.json();

      setBusy(false);

      if (!codeResponse.ok) {
        setErrors(codeData.errors || { general: codeData.error || "Could not send verification code." });
        return;
      }

      setCodeSent(true);
      setStep(10); // Move to code entry screen
      setNotice(codeData.developmentCode ? `Development code: ${codeData.developmentCode}` : "Verification code sent. Please check your e-mail.");
    } catch (err) {
      setBusy(false);
      setErrors({ general: "An error occurred. Please try again." });
    }
  }


  async function sendDetailedCode() {
    const info = state.customerInfo;
    if (!info.firstName.trim() || !info.lastName.trim() || !state.email.trim()) {
      setErrors({ general: "Please enter your first name, last name, and email address." });
      return;
    }

    setBusy(true);
    setErrors({});
    setNotice("");

    const response = await fetch("/api/offer-calculator/send-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, email: state.email })
    });
    const data = await response.json();

    setBusy(false);

    if (!response.ok) {
      setErrors(data.errors || { general: data.error || "Could not send verification code." });
      return;
    }

    setCodeSent(true);
    setStep(5);
    setNotice(data.developmentCode ? `Development code: ${data.developmentCode}` : "Verification code sent. Please check your e-mail.");
  }

  async function sendCode() {
    setBusy(true);
    setErrors({});
    setNotice("");

    const response = await fetch("/api/offer-calculator/send-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, email: state.email })
    });
    const data = await response.json();

    setBusy(false);

    if (!response.ok) {
      setErrors(data.errors || { general: data.error || "Could not send verification code." });
      return;
    }

    setCodeSent(true);
    setNotice(data.developmentCode ? `Development code: ${data.developmentCode}` : "Verification code sent. Please check your e-mail.");
  }

  async function verifyCode() {
    setBusy(true);
    setErrors({});
    setNotice("");

    const response = await fetch("/api/offer-calculator/verify-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, code: state.code.join("") })
    });
    const data = await response.json();

    setBusy(false);

    if (!response.ok) {
      setErrors({ general: data.error || "Verification failed." });
      return;
    }

    setPriceRange(data.priceRange);
    // Simple mode → step 11 (simple price reveal); Detailed mode → step 6
    setStep(isSimple ? 11 : 6);
  }

  async function uploadPhoto(file, category) {
    if (!sessionId || !file) return;

    const formData = new FormData();
    formData.set("sessionId", sessionId);
    formData.set("category", category);
    formData.set("photo", file);

    const response = await fetch("/api/offer-calculator/photos", {
      method: "POST",
      body: formData
    });
    const data = await response.json();

    if (response.ok) {
      setPhotos((current) => [...current, data.photo]);
    } else {
      setErrors({ general: data.error || "Photo upload failed." });
    }
  }

  async function submitRequest(requestedAction) {
    const fieldErrors = {};

    for (const field of customerRequiredFields) {
      if (!String(state.customerInfo[field] || "").trim()) fieldErrors[field] = "Required";
    }

    if (Object.keys(fieldErrors).length) {
      setErrors({
        ...fieldErrors,
        general: "Please complete your contact and property details before submitting."
      });
      return;
    }

    setBusy(true);
    setErrors({});
    setNotice("");

    const response = await fetch("/api/offer-calculator/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        customerInfo: {
          ...state.customerInfo,
          email: state.email,
          requestedAction
        }
      })
    });
    const data = await response.json();

    setBusy(false);

    if (!response.ok) {
      setErrors(data.errors || { general: data.error || "Please complete the required details." });
      return;
    }

    setNotice(requestedAction === "CONSULTATION"
      ? "Consultation request received. It is now in the AMIGOS CRM."
      : "Offer request received. It is now in the AMIGOS CRM.");
  }

  function renderPropertyCard(option, selected, onClick) {
    return (
      <button
        key={option.id}
        type="button"
        className={cx(styles.propertyCard, selected && styles.propertyCardSelected)}
        onClick={onClick}
      >
        {selected && <span className={styles.propertyCardBadge}>✓</span>}
        <div className={styles.propertyCardMedia}>
          {option.image ? (
            <img src={option.image} alt={option.title} className={styles.propertyCardImage} />
          ) : (
            <div className={styles.propertyCardFallbackGraphic}>
              <ComponentIcon iconKey={option.iconKey || "other"} />
            </div>
          )}
        </div>
        <div className={styles.propertyCardInfo}>
          <strong className={styles.propertyCardTitle}>{option.title}</strong>
          {option.subtitle && <span className={styles.propertyCardSubtitle}>{option.subtitle}</span>}
        </div>
      </button>
    );
  }

  function renderScopeCard(option, selected, onClick) {
    return (
      <button
        key={option.id}
        type="button"
        className={cx(styles.scopeCard, selected && styles.scopeCardSelected)}
        onClick={onClick}
      >
        {selected && <span className={styles.propertyCardBadge}>✓</span>}
        <div className={styles.scopeCardIcon}>
          <ComponentIcon iconKey={option.iconKey || "walls"} />
        </div>
        <strong className={styles.scopeCardTitle}>{option.title}</strong>
        <span className={styles.scopeCardDesc}>{option.desc}</span>
      </button>
    );
  }

  function renderConditionCard(option, selected, onClick) {
    return (
      <button
        key={option.id}
        type="button"
        className={cx(styles.conditionCard, selected && styles.conditionCardSelected)}
        onClick={onClick}
      >
        {selected && <span className={styles.propertyCardBadge}>✓</span>}
        <div className={styles.conditionCardIcon}>
          <ComponentIcon iconKey={option.iconKey || "condition_good"} />
        </div>
        <div className={styles.conditionCardContent}>
          <strong className={styles.conditionCardTitle}>{option.title}</strong>
          <span className={styles.conditionCardDesc}>{option.desc}</span>
        </div>
      </button>
    );
  }

  function renderSelectionCard(option, selected, onClick) {
    return (
      <button key={option.id} type="button" className={cx(styles.selectionCard, selected && styles.selectedCard)} onClick={onClick}>
        <span className={styles.cardIcon}>{option.iconKey ? <ComponentIcon iconKey={option.iconKey} /> : option.icon || "✦"}</span>
        <span style={{ display: "flex", flexDirection: "column", gap: "2px", textAlign: "left", flex: 1 }}>
          <span style={{ fontWeight: "600", fontSize: "13px", color: "var(--white)" }}>{option.title}</span>
          {option.unit && <small style={{ color: "rgba(253, 251, 246, 0.6)", fontSize: "11px" }}>Unit: {option.unit}</small>}
        </span>
        <i>{selected ? "✓" : "›"}</i>
      </button>
    );
  }

  // --- EMBEDDED HOMEPAGE VERSION ---
  if (embedded) {
    if (isSelect) {
      return (
        <main className={cx(styles.page, styles.embedded, styles.selectionPage, "offerCalculatorEmbedded")}>
          <div className={styles.selectionHeroContainer}>
            {/* 1. Header */}
            <div className={styles.selectionHeader}>
              <span className={styles.selectionKicker}>AMIGOS MALER GMBH · KOMPETENZ VERBINDET</span>
              <h1 className={styles.selectionTitle}>OFFER CALCULATOR &amp; REQUEST</h1>
              <h2 className={styles.selectionSubTitle}>Choose the right calculation for your project.</h2>
              <p className={styles.selectionLead}>
                Select the calculation model that best matches your project requirements.
              </p>
            </div>

            {/* 2. Two Calculator Cards */}
            <div className={styles.selectionTabsGrid}>
              {/* CARD 1: For Homeowners */}
              <div
                role="button"
                tabIndex={0}
                className={cx(styles.selectionTabCard, styles.tabFastEstimate)}
                onClick={() => {
                  setState((curr) => ({ ...curr, calculatorType: "SIMPLE" }));
                  setStep(0);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    setState((curr) => ({ ...curr, calculatorType: "SIMPLE" }));
                    setStep(0);
                  }
                }}
              >
                <div className={styles.tabBadgeRow}>
                  <span className={styles.tabTagFast}>FOR HOMEOWNERS</span>
                </div>

                <h3 className={styles.tabHeadline}>
                  Get an estimate in a few simple steps
                </h3>

                <p className={styles.tabDescription}>
                  Fast, non-binding quote tailored for private homes and flats with no wall measurements needed.
                </p>

                <ul className={styles.tabFeatureList}>
                  <li className={styles.tabFeatureItem}>
                    <span className={styles.tabFeatureIcon}>✓</span>
                    <span>No wall or ceiling m² measuring needed</span>
                  </li>
                  <li className={styles.tabFeatureItem}>
                    <span className={styles.tabFeatureIcon}>✓</span>
                    <span>Room count &amp; condition based estimate</span>
                  </li>
                  <li className={styles.tabFeatureItem}>
                    <span className={styles.tabFeatureIcon}>✓</span>
                    <span>Instant price range delivered via e-mail</span>
                  </li>
                </ul>

                <div className={styles.tabButtonWrapper}>
                  <button type="button" className={styles.tabActionBtn}>
                    <span>Start Quick Estimate</span>
                    <span className={styles.tabActionArrow}>→</span>
                  </button>
                </div>
              </div>

              {/* CARD 2: For Professionals */}
              <div
                role="button"
                tabIndex={0}
                className={cx(styles.selectionTabCard, styles.tabDetailedSpecs)}
                onClick={() => {
                  setState((curr) => ({ ...curr, calculatorType: "DETAILED" }));
                  setStep(0);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    setState((curr) => ({ ...curr, calculatorType: "DETAILED" }));
                    setStep(0);
                  }
                }}
              >
                <div className={styles.tabBadgeRow}>
                  <span className={styles.tabTagDetailed}>FOR PROFESSIONALS</span>
                </div>

                <h3 className={styles.tabHeadline}>
                  Detailed quote for precise planning
                </h3>

                <p className={styles.tabDescription}>
                  Itemized cost estimation designed for property managers, architects, and precision planners.
                </p>

                <ul className={styles.tabFeatureList}>
                  <li className={styles.tabFeatureItem}>
                    <span className={styles.tabFeatureIcon}>✓</span>
                    <span>Exact m² calculations for all surfaces</span>
                  </li>
                  <li className={styles.tabFeatureItem}>
                    <span className={styles.tabFeatureIcon}>✓</span>
                    <span>Doors, windows, radiators &amp; woodwork</span>
                  </li>
                  <li className={styles.tabFeatureItem}>
                    <span className={styles.tabFeatureIcon}>✓</span>
                    <span>Downloadable official PDF quote</span>
                  </li>
                </ul>

                <div className={styles.tabButtonWrapper}>
                  <button type="button" className={cx(styles.tabActionBtn, styles.tabActionBtnDetailed)}>
                    <span>Create Detailed Quote</span>
                    <span className={styles.tabActionArrow}>→</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 3. Reassurance Strip Below Cards */}
            <div className={styles.selectionTrustRow}>
              <div className={styles.selectionTrustItem}>
                <span className={styles.selectionTrustIcon}>
                  <ComponentIcon iconKey="shield" />
                </span>
                <div>
                  <strong>100% Free &amp; Non-Binding</strong>
                  <p>Transparent estimation with zero purchase obligation.</p>
                </div>
              </div>
              <div className={styles.selectionTrustItem}>
                <span className={styles.selectionTrustIcon}>
                  <ComponentIcon iconKey="lock" />
                </span>
                <div>
                  <strong>Prices Are Protected</strong>
                  <p>Secure calculation revealed after quick e-mail verification.</p>
                </div>
              </div>
              <div className={styles.selectionTrustItem}>
                <span className={styles.selectionTrustIcon}>
                  <ComponentIcon iconKey="swiss_quality" />
                </span>
                <div>
                  <strong>Swiss Quality Standards</strong>
                  <p>Certified craftsmanship across Olten and surrounding cantons.</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      );
    }

    return (
      <main className={cx(styles.page, styles.embedded, "offerCalculatorEmbedded")}>
        <aside className={styles.embeddedRail}>
          <div className={styles.heroCopy}>
            <span className={styles.brand}>AMIGOS MALER GMBH</span>
            <strong>Kompetenz verbindet</strong>
            <h1>OFFER CALCULATOR & REQUEST</h1>
            <p>Calculate, see your price – and request your offer.</p>
            <ul>
              <li>Calculate your estimated price in a few steps</li>
              <li>See your result after verifying your e-mail</li>
              <li>Request your personal offer or book a consultation</li>
            </ul>
          </div>

          {/* MODE SWITCH CTA */}
          <div className={styles.sidebarModeCard}>
            <span className={styles.sidebarModeKicker}>
              {isSimple ? "FOR HOMEOWNERS" : "FOR PROFESSIONALS"}
            </span>
            <h3 className={styles.sidebarModeTitle}>
              {isSimple ? "Fast Estimate Mode" : "Detailed Quote Mode"}
            </h3>
            <p className={styles.sidebarModeDesc}>
              {isSimple
                ? "Immediate estimate in 5 simple steps without m² wall measurements."
                : "Exact measurements with doors, windows, radiators & repair surface specs."}
            </p>
            <button
              type="button"
              className={styles.sidebarModeSwitchBtn}
              onClick={() => {
                setState((curr) => ({
                  ...curr,
                  calculatorType: isSimple ? "DETAILED" : "SIMPLE"
                }));
                setStep(0);
              }}
            >
              <span>{isSimple ? "Switch to Detailed Quote" : "Switch to Fast Estimate"}</span>
              <i>→</i>
            </button>
            <button
              type="button"
              className={styles.sidebarBackBtn}
              onClick={() => setState((curr) => ({ ...curr, calculatorType: "SELECT" }))}
            >
              <span>← Back to Selection</span>
            </button>
          </div>

          <div className={styles.securityCard}>
            <span>🔒</span>
            <h2>PRICES ARE PROTECTED</h2>
            <p>The exact price is only visible after e-mail verification.</p>
          </div>
        </aside>

        <div className={styles.embeddedWorkspace}>
          {/* PROGRESS BAR */}
          <nav className={cx(styles.progressNav, isSimple && styles.progressNavSimple)} aria-label="Calculator progress">
            <span className={styles.progressFill} style={{ width: `${progress}%` }} />
            {currentStepMeta.map((item, index) => {
              let isCurrent, isDone;
              if (isSimple) {
                isCurrent = step === index || (index === 4 && (step === 10 || step === 11));
                isDone = step > index && !(index === 4 && step >= 10);
              } else {
                isCurrent = index === step;
                isDone = index < step;
              }

              return (
                <button
                  key={item.key}
                  className={cx(styles.progressStep, isCurrent && styles.currentStep, isDone && styles.doneStep)}
                  type="button"
                  onClick={() => {
                    if (isSimple) {
                      if (step <= 4 && index < step) setStep(index);
                    } else {
                      if (index < step) setStep(index);
                    }
                  }}
                >
                  <span>{item.number}</span>
                  <i>{item.icon}</i>
                  <b>{item.title}</b>
                </button>
              );
            })}
          </nav>

          <section className={cx(styles.embeddedLayout, (isSimple || step < 4) && styles.embeddedLayoutExpanded)}>
            <div className={cx(styles.consultationShell, styles.embeddedLeft)}>
              {errors.general && <p className={styles.error}>{errors.general}</p>}
              {notice && <p className={styles.notice}>{notice}</p>}

              {/* STEP 0: Project Type */}
              {step === 0 && (
                <div className={styles.stepPanel}>
                  <span className={styles.stepKicker}>01 Project Type</span>
                  <h2>{isSimple ? "What type of property would you like us to paint?" : "What type of property is it?"}</h2>
                  <p>Please select your property type below.</p>
                  <div className={styles.propertyGrid}>
                    {(isSimple ? quickPropertyTypes : propertyTypes).map((option) =>
                      renderPropertyCard(option, state.propertyType === option.id, () => {
                        setState((current) => ({
                          ...current,
                          propertyType: option.id,
                          roomCount: option.roomCount || current.roomCount,
                          components: option.id === "facade" ? ["facade"] : current.components.filter((item) => item !== "facade"),
                          services: option.id === "facade" ? current.services.filter((service) => serviceOptions.find((item) => item.id === service)?.components.includes("facade")) : current.services,
                          quantities: option.id === "facade" ? current.quantities : { ...current.quantities, facadeArea: "" }
                        }));
                      })
                    )}
                  </div>
                  {!isSimple && state.propertyType === "room" && (
                    <div className={styles.roomChips}>
                      {roomTypes.map((room) => (
                        <button key={room} type="button" className={state.roomType === room ? styles.activeChip : ""} onClick={() => setState((current) => ({ ...current, roomType: room }))}>{room}</button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* SIMPLE MODE — STEP 1: Scope & Work */}
              {isSimple && step === 1 && (
                <div className={styles.stepPanel}>
                  <span className={styles.stepKicker}>02 Scope & Work</span>
                  <h2>What would you like us to paint?</h2>
                  <p>Select the work scope that best fits your project. No m² calculations needed.</p>

                  <div className={styles.scopeCardGrid}>
                    {workScopeOptions.map((option) =>
                      renderScopeCard(option, state.workScope === option.id, () => {
                        setState((curr) => ({ ...curr, workScope: option.id }));
                      })
                    )}
                  </div>

                  <div style={{ marginTop: "16px" }}>
                    <div style={{ fontSize: "13px", fontWeight: "700", marginBottom: "8px", color: "var(--white)" }}>
                      Number of Rooms: <b style={{ color: "var(--yellow)" }}>{state.roomCount} {state.roomCount === 1 ? "Room" : "Rooms"}</b>
                    </div>
                    <div className={styles.roomChips}>
                      {[1, 2, 3, 4, 5, 6, 8, 10].map((num) => (
                        <button
                          key={num}
                          type="button"
                          className={state.roomCount === num ? styles.activeChip : ""}
                          onClick={() => setState((curr) => ({ ...curr, roomCount: num }))}
                        >
                          {num === 10 ? "10+" : num}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginTop: "14px" }}>
                    <div style={{ fontSize: "13px", fontWeight: "700", marginBottom: "8px", color: "var(--white)" }}>
                      Average Room Size
                    </div>
                    <div className={styles.roomChips}>
                      {[
                        { id: "small", title: "Compact (~10–14 m²)" },
                        { id: "medium", title: "Standard (~15–22 m²)" },
                        { id: "large", title: "Spacious (~25–35+ m²)" }
                      ].map((preset) => (
                        <button
                          key={preset.id}
                          type="button"
                          className={state.roomSize === preset.id ? styles.activeChip : ""}
                          onClick={() => setState((curr) => ({ ...curr, roomSize: preset.id }))}
                        >
                          {preset.title}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* SIMPLE MODE — STEP 2: Condition */}
              {isSimple && step === 2 && (
                <div className={styles.stepPanel}>
                  <span className={styles.stepKicker}>03 Condition</span>
                  <h2>What is the current condition?</h2>
                  <p>This helps us give you the most accurate estimate possible.</p>

                  <div className={styles.conditionCardGrid}>
                    {conditionOptions.map((option) =>
                      renderConditionCard(option, state.condition === option.id, () => {
                        setState((curr) => ({ ...curr, condition: option.id }));
                      })
                    )}
                  </div>
                </div>
              )}

              {/* SIMPLE MODE — STEP 3: Location */}
              {isSimple && step === 3 && (
                <div className={styles.stepPanel}>
                  <span className={styles.stepKicker}>04 Location</span>
                  <h2>Where is the property located?</h2>
                  <p>Your location helps us calculate any travel costs accurately.</p>

                  <div className={styles.quantityGrid} style={{ marginTop: "16px" }}>
                    <label className={styles.quantityField} style={{ gridColumn: "1 / -1" }}>
                      <span>Postal Code (PLZ)</span>
                      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                        <span style={{ position: "absolute", left: "12px", color: "var(--yellow)", pointerEvents: "none", display: "flex", alignItems: "center", width: "20px", height: "20px" }}>
                          <ComponentIcon iconKey="pin" />
                        </span>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={state.postalCode}
                          placeholder="e.g. 4600 (Olten & surroundings)"
                          style={{ paddingLeft: "38px" }}
                          onChange={(event) => setState((curr) => ({ ...curr, postalCode: event.target.value }))}
                        />
                      </div>
                    </label>
                    <label className={styles.quantityField} style={{ gridColumn: "1 / -1" }}>
                      <span>City / Town</span>
                      <div>
                        <input
                          type="text"
                          value={state.locationCity}
                          placeholder="e.g. Olten"
                          onChange={(event) => setState((curr) => ({ ...curr, locationCity: event.target.value }))}
                        />
                      </div>
                    </label>
                  </div>
                </div>
              )}

                  {/* SIMPLE MODE — STEP 4: Contact + Send Code (Price Protection) */}
                  {isSimple && step === 4 && (
                    <div className={styles.stepPanel}>
                      <span className={styles.stepKicker}>05 Receive Your Price</span>
                      <h2>Your estimated quote is ready.</h2>
                      <p>
                        Enter your contact details to receive your personal AMIGOS estimated quotation.
                        Your price will be shown after e-mail verification.
                      </p>

                      <div className={styles.customerGrid} style={{ marginTop: "16px" }}>
                        {[
                          ["firstName", "First Name *"],
                          ["lastName", "Last Name *"],
                          ["phone", "Phone (optional)"]
                        ].map(([key, label]) => (
                          <label key={key}>
                            <span>{label}</span>
                            <input
                              value={state.customerInfo[key]}
                              onChange={(event) => updateCustomerInfo(key, event.target.value)}
                              aria-invalid={Boolean(errors[key])}
                            />
                            {errors[key] && <small>{errors[key]}</small>}
                          </label>
                        ))}
                        <label style={{ gridColumn: "1 / -1" }}>
                          <span>E-Mail Address *</span>
                          <input
                            type="email"
                            value={state.email}
                            placeholder="you@example.com"
                            onChange={(event) => setState((current) => ({ ...current, email: event.target.value }))}
                          />
                        </label>
                      </div>

                      {errors.general && <p className={styles.error}>{errors.general}</p>}
                      {notice && <p className={styles.notice}>{notice}</p>}

                      <div className={styles.navActions} style={{ marginTop: "16px" }}>
                        <button type="button" className={styles.secondaryAction} onClick={() => setStep(3)}>
                          ← BACK
                        </button>
                        <button
                          type="button"
                          className={styles.primaryAction}
                          disabled={busy}
                          onClick={submitContactAndSendCode}
                        >
                          {busy ? "SENDING…" : "SEND VERIFICATION CODE →"}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* SIMPLE MODE — STEP 10: Code Verification */}
                  {isSimple && step === 10 && (
                    <div className={styles.verifyPanel}>
                      <span className={styles.stepKicker}>05 Verify E-Mail</span>
                      <h2>Check your e-mail</h2>
                      <p>We sent a 4-digit code to <strong>{state.email}</strong>. Enter it below to reveal your price.</p>

                      {notice && <p className={styles.notice}>{notice}</p>}
                      {errors.general && <p className={styles.error}>{errors.general}</p>}

                      <div className={styles.codeInputs}>
                        {state.code.map((digit, index) => (
                          <input
                            key={index}
                            ref={(node) => { codeRefs.current[index] = node; }}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(event) => {
                              const value = event.target.value.replace(/\D/g, "").slice(0, 1);
                              setState((current) => {
                                const code = [...current.code];
                                code[index] = value;
                                return { ...current, code };
                              });
                              if (value && codeRefs.current[index + 1]) codeRefs.current[index + 1].focus();
                            }}
                          />
                        ))}
                      </div>
                      <button className={styles.primaryAction} type="button" onClick={verifyCode} disabled={busy}>
                        {busy ? "VERIFYING…" : "REVEAL MY PRICE →"}
                      </button>
                      <button className={styles.textButton} type="button" onClick={submitContactAndSendCode}>
                        Didn't receive a code? Resend code
                      </button>
                    </div>
                  )}

                  {/* SIMPLE MODE — STEP 11: Price Reveal */}
                  {isSimple && step === 11 && (
                    <div className={styles.pricePanel}>
                      <div className={styles.successMark}>✓</div>
                      <span className={styles.stepKicker}>Unverbindlicher Angebotspreis</span>
                      <h2>Your Estimated Offer Price (Angebotspreis)</h2>
                      <strong className={styles.priceRange}>{priceRange}</strong>
                      <p>This is an approximate price range based on your project details. The final price may vary after review or an on-site inspection.</p>

                      <div className={styles.summaryPanel} style={{ marginTop: "16px" }}>
                        <h3>Your project summary</h3>
                        <dl>
                          <div><dt>Property</dt><dd>{propertyTypes.find((o) => o.id === state.propertyType)?.title || "Not selected"}</dd></div>
                          <div><dt>Scope</dt><dd>{workScopeOptions.find((o) => o.id === state.workScope)?.title || state.workScope}</dd></div>
                          <div><dt>Rooms</dt><dd>{state.roomCount} room(s) · {state.roomSize} size</dd></div>
                          <div><dt>Condition</dt><dd>{conditionOptions.find((o) => o.id === state.condition)?.title || state.condition}</dd></div>
                          <div><dt>Location</dt><dd>{state.postalCode} {state.locationCity}</dd></div>
                        </dl>
                      </div>

                      <div className={styles.finalActions} style={{ marginTop: "20px" }}>
                        <button className={styles.primaryAction} type="button" onClick={() => submitRequest("OFFER")} disabled={busy}>REQUEST A FREE OFFER</button>
                        <button className={styles.secondaryAction} type="button" onClick={() => submitRequest("CONSULTATION")} disabled={busy}>REQUEST SITE VISIT</button>
                        {sessionId && (
                          <a
                            href={`/api/offer-calculator/pdf?sessionId=${sessionId}`}
                            download
                            className={styles.secondaryAction}
                            style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", textDecoration: "none", gap: "6px" }}
                          >
                            <span>📄</span>
                            <b>DOWNLOAD PDF QUOTE</b>
                          </a>
                        )}
                      </div>

                      <div style={{ marginTop: "12px", textAlign: "center" }}>
                        <a
                          href="https://wa.me/41441234567?text=Hallo%20AMIGOS%20Maler,%20ich%20habe%20eine%20Offerte%20berechnet"
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.textButton}
                          style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
                        >
                          <span>💬</span>
                          <span>Contact via WhatsApp</span>
                        </a>
                      </div>
                    </div>
                  )}


                  {/* DETAILED MODE — STEP 1: Components */}
                  {!isSimple && step === 1 && (
                    <div className={styles.stepPanel}>
                      <span className={styles.stepKicker}>02 Components</span>
                      <h2>Which components should be worked on?</h2>
                      <p>Select all that apply.</p>
                      <div className={styles.cardGrid}>
                        {components.map((option) => renderSelectionCard(option, state.components.includes(option.id), () => {
                          setState((current) => ({ ...current, components: toggle(current.components, option.id) }));
                        }))}
                      </div>
                    </div>
                  )}

                  {/* DETAILED MODE — STEP 2: Work & Services */}
                  {!isSimple && step === 2 && (
                    <div className={styles.stepPanel}>
                      <span className={styles.stepKicker}>03 Work & Services</span>
                      <h2>What work should we do?</h2>
                      <p>Select multiple services. The catalogue is structured so it can grow with AMIGOS.</p>
                      <div className={styles.serviceGrid}>
                        {visibleServices.map((option) => renderSelectionCard(option, state.services.includes(option.id), () => {
                          setState((current) => ({ ...current, services: toggle(current.services, option.id) }));
                        }))}
                      </div>
                    </div>
                  )}

                  {/* DETAILED MODE — STEP 3: Quantities */}
                  {!isSimple && step === 3 && (
                    <div className={styles.stepPanel}>
                      <span className={styles.stepKicker}>04 Quantities</span>
                      <h2>Enter the quantities</h2>
                      <p>Please enter the areas, lengths and quantities.</p>
                      <div className={styles.quantityGrid}>
                        {visibleQuantities.map((item) => (
                          <label key={item.id} className={styles.quantityField}>
                            <span>{item.label}</span>
                            <div>
                              <input
                                type="number"
                                min="0"
                                inputMode="decimal"
                                value={state.quantities[item.quantityKey] || ""}
                                placeholder={item.unit === "m²" ? "120" : "5"}
                                onChange={(event) => setState((current) => ({
                                  ...current,
                                  quantities: { ...current.quantities, [item.quantityKey]: event.target.value }
                                }))}
                              />
                              <b>{item.unit}</b>
                            </div>
                          </label>
                        ))}
                      </div>
                      <label className={styles.notesField}>
                        <span>Project information</span>
                        <textarea value={state.projectNotes} placeholder="Tell us anything important about access, condition, damage or timing." onChange={(event) => setState((current) => ({ ...current, projectNotes: event.target.value }))} />
                      </label>
                    </div>
                  )}

                  {/* SUMMARY PANEL (When step >= 4 for detailed mode) */}
                  {!isSimple && step >= 4 && (
                    <div className={cx(styles.stepPanel, styles.embeddedComplete)}>
                      <span className={styles.stepKicker}>Selections Complete</span>
                      <h2>Your project details are ready.</h2>
                      <p>Use the panel to verify your e-mail and receive your estimated project price.</p>
                      <div className={styles.summaryPanel}>
                        <h3>Your selected project</h3>
                        <dl>
                          <div>
                            <dt>Property</dt>
                            <dd>{propertyTypes.find((option) => option.id === state.propertyType)?.title || "Not selected"}{state.roomType ? ` · ${state.roomType}` : ""}</dd>
                          </div>
                          <div>
                            <dt>Components</dt>
                            <dd>{selectedComponentTitles.length ? selectedComponentTitles.join(", ") : "Not selected"}</dd>
                          </div>
                          <div>
                            <dt>Services</dt>
                            <dd>{selectedServiceTitles.length ? selectedServiceTitles.join(", ") : "Not selected"}</dd>
                          </div>
                          <div>
                            <dt>Quantities</dt>
                            <dd>{visibleQuantities.map((item) => `${item.label}: ${state.quantities[item.quantityKey] || 0} ${item.unit}`).join(" · ")}</dd>
                          </div>
                        </dl>
                      </div>
                    </div>
                  )}

                  {/* NAV ACTIONS (Back & Continue) */}
                  {step < 4 && (
                    <div className={styles.navActions}>
                      {step > 0 ? (
                        <button type="button" className={styles.secondaryAction} onClick={() => setStep((current) => current - 1)}>
                          ← BACK
                        </button>
                      ) : (
                        <button type="button" className={styles.secondaryAction} onClick={() => setState((curr) => ({ ...curr, calculatorType: "SELECT" }))}>
                          ← BACK TO SELECTION
                        </button>
                      )}
                      <button type="button" className={styles.primaryAction} disabled={!canContinue() || busy} onClick={next}>
                        {isSimple ? "CONTINUE →" : (step === 3 ? "CALCULATE" : "CONTINUE →")}
                      </button>
                    </div>
                  )}

                  {!isSimple && step >= 4 && step < 6 && (
                    <div className={styles.navActions}>
                      <button type="button" className={styles.secondaryAction} onClick={() => setStep(3)}>
                        ← EDIT SELECTIONS
                      </button>
                    </div>
                  )}
                </div>

                {/* UNLOCK / VERIFY / PRICE PANEL (Detailed mode only, Step >= 4) */}
                {!isSimple && step >= 4 && (
                  <aside className={cx(styles.consultationShell, styles.embeddedRight, styles.unlockPanel)}>
                    {step === 4 && (
                      <div className={styles.resultLocked}>
                        <span className={styles.stepKicker}>05 Contact & Price Protection</span>
                        <h2>Your estimated quote is ready.</h2>
                        <p>Enter your contact details to receive your personal AMIGOS estimated quotation. Your price will be shown immediately after e-mail verification.</p>
                        
                        <div className={styles.customerGrid} style={{ marginTop: "14px" }}>
                          <label>
                            <span>First Name *</span>
                            <input
                              value={state.customerInfo.firstName}
                              onChange={(e) => updateCustomerInfo("firstName", e.target.value)}
                            />
                          </label>
                          <label>
                            <span>Last Name *</span>
                            <input
                              value={state.customerInfo.lastName}
                              onChange={(e) => updateCustomerInfo("lastName", e.target.value)}
                            />
                          </label>
                          <label>
                            <span>Phone (optional)</span>
                            <input
                              value={state.customerInfo.phone}
                              onChange={(e) => updateCustomerInfo("phone", e.target.value)}
                            />
                          </label>
                          <label style={{ gridColumn: "1 / -1" }}>
                            <span>E-Mail Address *</span>
                            <input
                              type="email"
                              value={state.email}
                              placeholder="you@example.com"
                              onChange={(e) => setState((curr) => ({ ...curr, email: e.target.value }))}
                            />
                          </label>
                        </div>
                        {errors.general && <p className={styles.error} style={{ marginTop: "10px" }}>{errors.general}</p>}
                        <button className={styles.primaryAction} style={{ marginTop: "14px" }} type="button" onClick={sendDetailedCode} disabled={busy}>
                          {busy ? "SENDING…" : "SEND VERIFICATION CODE →"}
                        </button>
                      </div>
                    )}

                    {step === 5 && (
                      <div className={styles.verifyPanel}>
                        <span className={styles.stepKicker}>04 Verify E-Mail</span>
                        <h2>Verify your e-mail</h2>
                        {!codeSent ? (
                          <>
                            <p>Enter your e-mail address and we will send you a 4-digit verification code.</p>
                            <label className={styles.emailField}>
                              <span>E-Mail</span>
                              <input type="email" value={state.email} placeholder="you@example.com" onChange={(event) => setState((current) => ({ ...current, email: event.target.value }))} />
                            </label>
                            <button className={styles.primaryAction} type="button" onClick={sendCode} disabled={busy}>SEND CODE TO MY E-MAIL</button>
                          </>
                        ) : (
                          <>
                            <p>Enter the 4-digit code we sent to {state.email}.</p>
                            <div className={styles.codeInputs}>
                              {state.code.map((digit, index) => (
                                <input
                                  key={index}
                                  ref={(node) => { codeRefs.current[index] = node; }}
                                  type="text"
                                  inputMode="numeric"
                                  maxLength={1}
                                  value={digit}
                                  onChange={(event) => {
                                    const value = event.target.value.replace(/\D/g, "").slice(0, 1);
                                    setState((current) => {
                                      const code = [...current.code];
                                      code[index] = value;
                                      return { ...current, code };
                                    });
                                    if (value && codeRefs.current[index + 1]) codeRefs.current[index + 1].focus();
                                  }}
                                />
                              ))}
                            </div>
                            <button className={styles.primaryAction} type="button" onClick={verifyCode} disabled={busy}>Unlock Estimated Price</button>
                            <button className={styles.textButton} type="button" onClick={sendCode}>Didn't receive a code? Resend code</button>
                          </>
                        )}
                      </div>
                    )}

                    {step === 6 && (
                      <div className={styles.pricePanel}>
                        <div className={styles.successMark}>✓</div>
                        <span className={styles.stepKicker}>05 Unverbindlicher Angebotspreis</span>
                        <h2>Your Estimated Offer Price (Angebotspreis)</h2>
                        <strong className={styles.priceRange}>{priceRange}</strong>
                        <p>This is an approximate price range based on the information provided. The final price may vary after review and/or an on-site inspection.</p>

                        <div className={styles.customerGrid}>
                          {[
                            ["firstName", "First Name"],
                            ["lastName", "Last Name"],
                            ["phone", "Phone"],
                            ["address", "Street / Property Address"],
                            ["postalCode", "Postal Code"],
                            ["city", "City"],
                            ["company", "Company"]
                          ].map(([key, label]) => (
                            <label key={key}>
                              <span>{label}</span>
                              <input value={state.customerInfo[key]} onChange={(event) => updateCustomerInfo(key, event.target.value)} aria-invalid={Boolean(errors[key])} />
                              {errors[key] && <small>{errors[key]}</small>}
                            </label>
                          ))}
                          <label className={styles.checkboxLine}>
                            <input type="checkbox" checked={state.customerInfo.propertyManagement} onChange={(event) => updateCustomerInfo("propertyManagement", event.target.checked)} />
                            <span>Property Management</span>
                          </label>
                        </div>

                        <div className={styles.summaryPanel}>
                          <h3>Your selected project</h3>
                          <dl>
                            <div>
                              <dt>Property</dt>
                              <dd>{propertyTypes.find((option) => option.id === state.propertyType)?.title || "Not selected"}{state.roomType ? ` · ${state.roomType}` : ""}</dd>
                            </div>
                            {isSimple ? (
                              <>
                                <div>
                                  <dt>Scope</dt>
                                  <dd>{state.roomCount} room(s) · {state.roomSize} size</dd>
                                </div>
                                <div>
                                  <dt>Services</dt>
                                  <dd>{titlesFromIds(simpleServiceOptions, state.simpleServices).join(", ")}</dd>
                                </div>
                              </>
                            ) : (
                              <>
                                <div>
                                  <dt>Components</dt>
                                  <dd>{selectedComponentTitles.length ? selectedComponentTitles.join(", ") : "Not selected"}</dd>
                                </div>
                                <div>
                                  <dt>Services</dt>
                                  <dd>{selectedServiceTitles.length ? selectedServiceTitles.join(", ") : "Not selected"}</dd>
                                </div>
                                <div>
                                  <dt>Quantities</dt>
                                  <dd>{visibleQuantities.map((item) => `${item.label}: ${state.quantities[item.quantityKey] || 0} ${item.unit}`).join(" · ")}</dd>
                                </div>
                              </>
                            )}
                          </dl>
                        </div>

                        <div className={styles.uploadPanel}>
                          <h3>Upload photos of your project</h3>
                          <div className={styles.photoGrid}>
                            {photoCategories.map((category) => (
                              <label key={category} className={styles.photoDrop}>
                                <span>{category}</span>
                                <small>Take Photo or Choose From Library</small>
                                <input type="file" accept="image/*" capture="environment" onChange={(event) => uploadPhoto(event.target.files?.[0], category)} />
                              </label>
                            ))}
                          </div>
                          {photos.length > 0 && <p className={styles.notice}>{photos.length} photo{photos.length === 1 ? "" : "s"} attached to this project.</p>}
                        </div>

                        <div className={styles.finalActions}>
                          <button className={styles.primaryAction} type="button" onClick={() => submitRequest("OFFER")} disabled={busy}>REQUEST A FREE OFFER</button>
                          <button className={styles.secondaryAction} type="button" onClick={() => submitRequest("CONSULTATION")} disabled={busy}>REQUEST SITE VISIT</button>
                          {sessionId && (
                            <a
                              href={`/api/offer-calculator/pdf?sessionId=${sessionId}`}
                              download
                              className={styles.secondaryAction}
                              style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", textDecoration: "none", gap: "6px" }}
                            >
                              <span>📄</span>
                              <b>DOWNLOAD PDF QUOTE</b>
                            </a>
                          )}
                        </div>

                        <div style={{ marginTop: "12px", textAlign: "center" }}>
                          <a
                            href="https://wa.me/41441234567?text=Hallo%20AMIGOS%20Maler,%20ich%20habe%20eine%20Offerte%20berechnet"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.textButton}
                            style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
                          >
                            <span>💬</span>
                            <span>Contact via WhatsApp</span>
                          </a>
                        </div>
                      </div>
                    )}
                  </aside>
                )}
              </section>
        </div>
      </main>
    );
  }

  // --- NON-EMBEDDED STANDALONE PAGE VERSION ---
  if (isSelect) {
    return (
      <main className={cx(styles.page, styles.selectionPage)}>
        <div className={styles.selectionHeroContainer}>
          {/* 1. Header */}
          <div className={styles.selectionHeader}>
            <span className={styles.selectionKicker}>AMIGOS MALER GMBH · KOMPETENZ VERBINDET</span>
            <h1 className={styles.selectionTitle}>OFFER CALCULATOR &amp; REQUEST</h1>
            <h2 className={styles.selectionSubTitle}>Choose the right calculation for your project.</h2>
            <p className={styles.selectionLead}>
              Select the calculation model that best matches your project requirements.
            </p>
          </div>

          {/* 2. Two Calculator Cards */}
          <div className={styles.selectionTabsGrid}>
            {/* CARD 1: For Homeowners */}
            <div
              role="button"
              tabIndex={0}
              className={cx(styles.selectionTabCard, styles.tabFastEstimate)}
              onClick={() => {
                setState((curr) => ({ ...curr, calculatorType: "SIMPLE" }));
                setStep(0);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  setState((curr) => ({ ...curr, calculatorType: "SIMPLE" }));
                  setStep(0);
                }
              }}
            >
              <div className={styles.tabBadgeRow}>
                <span className={styles.tabTagFast}>FOR HOMEOWNERS</span>
              </div>

              <h3 className={styles.tabHeadline}>
                Get an estimate in a few simple steps
              </h3>

              <p className={styles.tabDescription}>
                Fast, non-binding quote tailored for private homes and flats with no wall measurements needed.
              </p>

              <ul className={styles.tabFeatureList}>
                <li className={styles.tabFeatureItem}>
                  <span className={styles.tabFeatureIcon}>✓</span>
                  <span>No wall or ceiling m² measuring needed</span>
                </li>
                <li className={styles.tabFeatureItem}>
                  <span className={styles.tabFeatureIcon}>✓</span>
                  <span>Room count &amp; condition based estimate</span>
                </li>
                <li className={styles.tabFeatureItem}>
                  <span className={styles.tabFeatureIcon}>✓</span>
                  <span>Instant price range delivered via e-mail</span>
                </li>
              </ul>

              <div className={styles.tabButtonWrapper}>
                <button type="button" className={styles.tabActionBtn}>
                  <span>Start Quick Estimate</span>
                  <span className={styles.tabActionArrow}>→</span>
                </button>
              </div>
            </div>

            {/* CARD 2: For Professionals */}
            <div
              role="button"
              tabIndex={0}
              className={cx(styles.selectionTabCard, styles.tabDetailedSpecs)}
              onClick={() => {
                setState((curr) => ({ ...curr, calculatorType: "DETAILED" }));
                setStep(0);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  setState((curr) => ({ ...curr, calculatorType: "DETAILED" }));
                  setStep(0);
                }
              }}
            >
              <div className={styles.tabBadgeRow}>
                <span className={styles.tabTagDetailed}>FOR PROFESSIONALS</span>
              </div>

              <h3 className={styles.tabHeadline}>
                Detailed quote for precise planning
              </h3>

              <p className={styles.tabDescription}>
                Itemized cost estimation designed for property managers, architects, and precision planners.
              </p>

              <ul className={styles.tabFeatureList}>
                <li className={styles.tabFeatureItem}>
                  <span className={styles.tabFeatureIcon}>✓</span>
                  <span>Exact m² calculations for all surfaces</span>
                </li>
                <li className={styles.tabFeatureItem}>
                  <span className={styles.tabFeatureIcon}>✓</span>
                  <span>Doors, windows, radiators &amp; woodwork</span>
                </li>
                <li className={styles.tabFeatureItem}>
                  <span className={styles.tabFeatureIcon}>✓</span>
                  <span>Downloadable official PDF quote</span>
                </li>
              </ul>

              <div className={styles.tabButtonWrapper}>
                <button type="button" className={cx(styles.tabActionBtn, styles.tabActionBtnDetailed)}>
                  <span>Create Detailed Quote</span>
                  <span className={styles.tabActionArrow}>→</span>
                </button>
              </div>
            </div>
          </div>

          {/* 3. Reassurance Strip Below Cards */}
          <div className={styles.selectionTrustRow}>
            <div className={styles.selectionTrustItem}>
              <span className={styles.selectionTrustIcon}>
                <ComponentIcon iconKey="shield" />
              </span>
              <div>
                <strong>100% Free &amp; Non-Binding</strong>
                <p>Transparent estimation with zero purchase obligation.</p>
              </div>
            </div>
            <div className={styles.selectionTrustItem}>
              <span className={styles.selectionTrustIcon}>
                <ComponentIcon iconKey="lock" />
              </span>
              <div>
                <strong>Prices Are Protected</strong>
                <p>Secure calculation revealed after quick e-mail verification.</p>
              </div>
            </div>
            <div className={styles.selectionTrustItem}>
              <span className={styles.selectionTrustIcon}>
                <ComponentIcon iconKey="swiss_quality" />
              </span>
              <div>
                <strong>Swiss Quality Standards</strong>
                <p>Certified craftsmanship across Olten and surrounding cantons.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <span className={styles.brand}>AMIGOS MALER GMBH</span>
          <strong>Kompetenz verbindet</strong>
          <h1>OFFER CALCULATOR & REQUEST</h1>
          <p>Calculate, see your price – and request your offer.</p>
          <ul>
            <li>Calculate your estimated price in a few steps</li>
            <li>See your result after verifying your e-mail</li>
            <li>Request your personal offer or book a consultation</li>
          </ul>
        </div>
        <aside className={styles.securityCard}>
          <span>🔒</span>
          <h2>PRICES ARE PROTECTED</h2>
          <p>The exact price is only visible after e-mail verification.</p>
        </aside>
      </section>

      <nav className={cx(styles.progressNav, isSimple && styles.progressNavSimple)} aria-label="Calculator progress">
        <span className={styles.progressFill} style={{ width: `${progress}%` }} />
        {currentStepMeta.map((item, index) => {
          let isCurrent, isDone;
          if (isSimple) {
            isCurrent = step === index || (index === 4 && (step === 10 || step === 11));
            isDone = step > index && !(index === 4 && step >= 10);
          } else {
            isCurrent = index === step;
            isDone = index < step;
          }

          return (
            <button
              key={item.key}
              className={cx(styles.progressStep, isCurrent && styles.currentStep, isDone && styles.doneStep)}
              type="button"
              onClick={() => {
                if (isSimple) {
                  if (step <= 4 && index < step) setStep(index);
                } else {
                  if (index < step) setStep(index);
                }
              }}
            >
              <span>{item.number}</span>
              <i>{item.icon}</i>
              <b>{item.title}</b>
            </button>
          );
        })}
      </nav>

      <section className={styles.consultationShell}>
        {errors.general && <p className={styles.error}>{errors.general}</p>}
        {notice && <p className={styles.notice}>{notice}</p>}

        {/* STEP 0: Project Type */}
        {step === 0 && (
          <div className={styles.stepPanel}>
            <span className={styles.stepKicker}>01 Project Type</span>
            <h2>What type of property is it?</h2>
            <p>Please select the type of property.</p>
            <div className={styles.propertyGrid}>
              {(isSimple ? quickPropertyTypes : propertyTypes).map((option) =>
                renderPropertyCard(option, state.propertyType === option.id, () => {
                  setState((current) => ({
                    ...current,
                    propertyType: option.id,
                    roomCount: option.roomCount || current.roomCount,
                    components: option.id === "facade" ? ["facade"] : current.components.filter((item) => item !== "facade"),
                    services: option.id === "facade" ? current.services.filter((service) => serviceOptions.find((item) => item.id === service)?.components.includes("facade")) : current.services,
                    quantities: option.id === "facade" ? current.quantities : { ...current.quantities, facadeArea: "" }
                  }));
                })
              )}
            </div>
            {!isSimple && state.propertyType === "room" && (
              <div className={styles.roomChips} style={{ marginTop: "16px" }}>
                {roomTypes.map((room) => (
                  <button key={room} type="button" className={state.roomType === room ? styles.activeChip : ""} onClick={() => setState((current) => ({ ...current, roomType: room }))}>{room}</button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SIMPLE MODE STEP 1: Scope & Work */}
        {isSimple && step === 1 && (
          <div className={styles.stepPanel}>
            <span className={styles.stepKicker}>02 Scope & Work</span>
            <h2>What would you like painted?</h2>
            <p>Select the work scope that best fits your project. No m² calculations needed.</p>

            <div className={styles.scopeCardGrid}>
              {workScopeOptions.map((option) =>
                renderScopeCard(option, state.workScope === option.id, () =>
                  setState((curr) => ({ ...curr, workScope: option.id }))
                )
              )}
            </div>

            <div style={{ margin: "18px 0" }}>
              <div style={{ fontSize: "13px", fontWeight: "700", marginBottom: "8px", color: "var(--white)" }}>
                Number of Rooms: <b style={{ color: "var(--yellow)" }}>{state.roomCount} {state.roomCount === 1 ? "Room" : "Rooms"}</b>
              </div>
              <div className={styles.roomChips}>
                {[1, 2, 3, 4, 5, 6, 8, 10].map((num) => (
                  <button
                    key={num}
                    type="button"
                    className={state.roomCount === num ? styles.activeChip : ""}
                    onClick={() => setState((curr) => ({ ...curr, roomCount: num }))}
                  >
                    {num === 10 ? "10+" : num}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ margin: "18px 0" }}>
              <div style={{ fontSize: "13px", fontWeight: "700", marginBottom: "8px", color: "var(--white)" }}>
                Average Room Size
              </div>
              <div className={styles.roomChips}>
                {[
                  { id: "small", title: "Compact (~10–14 m²)" },
                  { id: "medium", title: "Standard (~15–22 m²)" },
                  { id: "large", title: "Spacious (~25–35+ m²)" }
                ].map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    className={state.roomSize === preset.id ? styles.activeChip : ""}
                    onClick={() => setState((curr) => ({ ...curr, roomSize: preset.id }))}
                  >
                    {preset.title}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SIMPLE MODE STEP 2: Condition */}
        {isSimple && step === 2 && (
          <div className={styles.stepPanel}>
            <span className={styles.stepKicker}>03 Condition</span>
            <h2>What is the current condition?</h2>
            <p>This helps us give you the most accurate estimate possible.</p>

            <div className={styles.conditionCardGrid}>
              {conditionOptions.map((option) =>
                renderConditionCard(option, state.condition === option.id, () =>
                  setState((curr) => ({ ...curr, condition: option.id }))
                )
              )}
            </div>
          </div>
        )}

        {/* SIMPLE MODE STEP 3: Location */}
        {isSimple && step === 3 && (
          <div className={styles.stepPanel}>
            <span className={styles.stepKicker}>04 Location</span>
            <h2>Where is the property located?</h2>
            <p>Your location helps us calculate any travel costs accurately.</p>

            <div className={styles.quantityGrid} style={{ marginTop: "16px" }}>
              <label className={styles.quantityField} style={{ gridColumn: "1 / -1" }}>
                <span>Postal Code (PLZ)</span>
                <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                  <span style={{ position: "absolute", left: "12px", color: "var(--yellow)", pointerEvents: "none", display: "flex", alignItems: "center", width: "20px", height: "20px" }}>
                    <ComponentIcon iconKey="pin" />
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={state.postalCode}
                    placeholder="e.g. 4600 (Olten & surroundings)"
                    style={{ paddingLeft: "38px" }}
                    onChange={(event) => setState((curr) => ({ ...curr, postalCode: event.target.value }))}
                  />
                </div>
              </label>
              <label className={styles.quantityField} style={{ gridColumn: "1 / -1" }}>
                <span>City / Town</span>
                <div>
                  <input
                    type="text"
                    value={state.locationCity}
                    placeholder="e.g. Olten"
                    onChange={(event) => setState((curr) => ({ ...curr, locationCity: event.target.value }))}
                  />
                </div>
              </label>
            </div>
          </div>
        )}

        {/* SIMPLE MODE STEP 4: Contact + Send Code (Price Protection) */}
        {isSimple && step === 4 && (
          <div className={styles.stepPanel}>
            <span className={styles.stepKicker}>05 Receive Your Price</span>
            <h2>Your estimated quote is ready.</h2>
            <p>
              Enter your contact details to receive your personal AMIGOS estimated quotation.
              Your price will be shown after e-mail verification.
            </p>

            <div className={styles.customerGrid} style={{ marginTop: "16px" }}>
              {[
                ["firstName", "First Name *"],
                ["lastName", "Last Name *"],
                ["phone", "Phone (optional)"]
              ].map(([key, label]) => (
                <label key={key}>
                  <span>{label}</span>
                  <input
                    value={state.customerInfo[key]}
                    onChange={(event) => updateCustomerInfo(key, event.target.value)}
                    aria-invalid={Boolean(errors[key])}
                  />
                  {errors[key] && <small>{errors[key]}</small>}
                </label>
              ))}
              <label style={{ gridColumn: "1 / -1" }}>
                <span>E-Mail Address *</span>
                <input
                  type="email"
                  value={state.email}
                  placeholder="you@example.com"
                  onChange={(event) => setState((current) => ({ ...current, email: event.target.value }))}
                />
              </label>
            </div>

            {errors.general && <p className={styles.error}>{errors.general}</p>}
            {notice && <p className={styles.notice}>{notice}</p>}

            <div className={styles.navActions} style={{ marginTop: "16px" }}>
              <button type="button" className={styles.secondaryAction} onClick={() => setStep(3)}>
                ← BACK
              </button>
              <button
                type="button"
                className={styles.primaryAction}
                disabled={busy}
                onClick={submitContactAndSendCode}
              >
                {busy ? "SENDING…" : "SEND VERIFICATION CODE →"}
              </button>
            </div>
          </div>
        )}

        {/* SIMPLE MODE STEP 10: Code Verification */}
        {isSimple && step === 10 && (
          <div className={styles.verifyPanel}>
            <span className={styles.stepKicker}>05 Verify E-Mail</span>
            <h2>Check your e-mail</h2>
            <p>We sent a 4-digit code to <strong>{state.email}</strong>. Enter it below to reveal your price.</p>

            {notice && <p className={styles.notice}>{notice}</p>}
            {errors.general && <p className={styles.error}>{errors.general}</p>}

            <div className={styles.codeInputs}>
              {state.code.map((digit, index) => (
                <input
                  key={index}
                  ref={(node) => { codeRefs.current[index] = node; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(event) => {
                    const value = event.target.value.replace(/\D/g, "").slice(0, 1);
                    setState((current) => {
                      const code = [...current.code];
                      code[index] = value;
                      return { ...current, code };
                    });
                    if (value && codeRefs.current[index + 1]) codeRefs.current[index + 1].focus();
                  }}
                />
              ))}
            </div>
            <button className={styles.primaryAction} type="button" onClick={verifyCode} disabled={busy}>
              {busy ? "VERIFYING…" : "REVEAL MY PRICE →"}
            </button>
            <button className={styles.textButton} type="button" onClick={submitContactAndSendCode}>
              Didn't receive a code? Resend code
            </button>
          </div>
        )}

        {/* SIMPLE MODE STEP 11: Price Reveal */}
        {isSimple && step === 11 && (
          <div className={styles.pricePanel}>
            <div className={styles.successMark}>✓</div>
            <span className={styles.stepKicker}>Unverbindlicher Angebotspreis</span>
            <h2>Your Estimated Offer Price (Angebotspreis)</h2>
            <strong className={styles.priceRange}>{priceRange}</strong>
            <p>This is an approximate price range based on your project details. The final price may vary after review or an on-site inspection.</p>

            <div className={styles.summaryPanel} style={{ marginTop: "16px" }}>
              <h3>Your project summary</h3>
              <dl>
                <div><dt>Property</dt><dd>{propertyTypes.find((o) => o.id === state.propertyType)?.title || "Not selected"}</dd></div>
                <div><dt>Scope</dt><dd>{workScopeOptions.find((o) => o.id === state.workScope)?.title || state.workScope}</dd></div>
                <div><dt>Rooms</dt><dd>{state.roomCount} room(s) · {state.roomSize} size</dd></div>
                <div><dt>Condition</dt><dd>{conditionOptions.find((o) => o.id === state.condition)?.title || state.condition}</dd></div>
                <div><dt>Location</dt><dd>{state.postalCode} {state.locationCity}</dd></div>
              </dl>
            </div>

            <div className={styles.finalActions} style={{ marginTop: "20px" }}>
              <button className={styles.primaryAction} type="button" onClick={() => submitRequest("OFFER")} disabled={busy}>REQUEST A FREE OFFER</button>
              <button className={styles.secondaryAction} type="button" onClick={() => submitRequest("CONSULTATION")} disabled={busy}>REQUEST SITE VISIT</button>
              {sessionId && (
                <a
                  href={`/api/offer-calculator/pdf?sessionId=${sessionId}`}
                  download
                  className={styles.secondaryAction}
                  style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", textDecoration: "none", gap: "6px" }}
                >
                  <span>📄</span>
                  <b>DOWNLOAD PDF QUOTE</b>
                </a>
              )}
            </div>

            <div style={{ marginTop: "12px", textAlign: "center" }}>
              <a
                href="https://wa.me/41441234567?text=Hallo%20AMIGOS%20Maler,%20ich%20habe%20eine%20Offerte%20berechnet"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.textButton}
                style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
              >
                <span>💬</span>
                <span>Contact via WhatsApp</span>
              </a>
            </div>
          </div>
        )}

        {/* DETAILED MODE STEP 1 */}
        {!isSimple && step === 1 && (
          <div className={styles.stepPanel}>
            <span className={styles.stepKicker}>02 Components</span>
            <h2>Which components should be worked on?</h2>
            <p>Select all that apply.</p>
            <div className={styles.cardGrid}>
              {components.map((option) => renderSelectionCard(option, state.components.includes(option.id), () => {
                setState((current) => ({ ...current, components: toggle(current.components, option.id) }));
              }))}
            </div>
          </div>
        )}

        {/* DETAILED MODE STEP 2 */}
        {!isSimple && step === 2 && (
          <div className={styles.stepPanel}>
            <span className={styles.stepKicker}>03 Work & Services</span>
            <h2>What work should we do?</h2>
            <p>Select multiple services. The catalogue is structured so it can grow with AMIGOS.</p>
            <div className={styles.serviceGrid}>
              {visibleServices.map((option) => renderSelectionCard(option, state.services.includes(option.id), () => {
                setState((current) => ({ ...current, services: toggle(current.services, option.id) }));
              }))}
            </div>
          </div>
        )}

        {/* DETAILED MODE STEP 3 */}
        {!isSimple && step === 3 && (
          <div className={styles.stepPanel}>
            <span className={styles.stepKicker}>04 Quantities</span>
            <h2>Enter the quantities</h2>
            <p>Please enter the areas, lengths and quantities.</p>
            <div className={styles.quantityGrid}>
              {visibleQuantities.map((item) => (
                <label key={item.id} className={styles.quantityField}>
                  <span>{item.label}</span>
                  <div>
                    <input
                      type="number"
                      min="0"
                      inputMode="decimal"
                      value={state.quantities[item.quantityKey] || ""}
                      placeholder={item.unit === "m²" ? "120" : "5"}
                      onChange={(event) => setState((current) => ({
                        ...current,
                        quantities: { ...current.quantities, [item.quantityKey]: event.target.value }
                      }))}
                    />
                    <b>{item.unit}</b>
                  </div>
                </label>
              ))}
            </div>
            <label className={styles.notesField}>
              <span>Project information</span>
              <textarea value={state.projectNotes} placeholder="Tell us anything important about access, condition, damage or timing." onChange={(event) => setState((current) => ({ ...current, projectNotes: event.target.value }))} />
            </label>
          </div>
        )}

        {/* DETAILED MODE STEP 4: Contact & Price Protection */}
        {!isSimple && step === 4 && (
          <div className={styles.resultLocked}>
            <span className={styles.stepKicker}>05 Contact & Price Protection</span>
            <h2>Your estimated quote is ready.</h2>
            <p>Enter your contact details to receive your personal AMIGOS estimated quotation. Your price will be shown immediately after e-mail verification.</p>
            
            <div className={styles.customerGrid} style={{ marginTop: "14px" }}>
              <label>
                <span>First Name *</span>
                <input
                  value={state.customerInfo.firstName}
                  onChange={(e) => updateCustomerInfo("firstName", e.target.value)}
                />
              </label>
              <label>
                <span>Last Name *</span>
                <input
                  value={state.customerInfo.lastName}
                  onChange={(e) => updateCustomerInfo("lastName", e.target.value)}
                />
              </label>
              <label>
                <span>Phone (optional)</span>
                <input
                  value={state.customerInfo.phone}
                  onChange={(e) => updateCustomerInfo("phone", e.target.value)}
                />
              </label>
              <label style={{ gridColumn: "1 / -1" }}>
                <span>E-Mail Address *</span>
                <input
                  type="email"
                  value={state.email}
                  placeholder="you@example.com"
                  onChange={(e) => setState((curr) => ({ ...curr, email: e.target.value }))}
                />
              </label>
            </div>
            {errors.general && <p className={styles.error} style={{ marginTop: "10px" }}>{errors.general}</p>}
            <button className={styles.primaryAction} style={{ marginTop: "14px" }} type="button" onClick={sendDetailedCode} disabled={busy}>
              {busy ? "SENDING…" : "SEND VERIFICATION CODE →"}
            </button>
          </div>
        )}

        {/* STEP 5: Verify E-mail */}
        {step === 5 && (
          <div className={styles.verifyPanel}>
            <span className={styles.stepKicker}>06 Verify E-Mail</span>
            <h2>Verify your e-mail</h2>
            {!codeSent ? (
              <>
                <p>Enter your e-mail address and we will send you a 4-digit verification code.</p>
                <label className={styles.emailField}>
                  <span>E-Mail</span>
                  <input type="email" value={state.email} placeholder="you@example.com" onChange={(event) => setState((current) => ({ ...current, email: event.target.value }))} />
                </label>
                <button className={styles.primaryAction} type="button" onClick={sendCode} disabled={busy}>SEND CODE TO MY E-MAIL</button>
              </>
            ) : (
              <>
                <p>Enter the 4-digit code we sent to {state.email}.</p>
                <div className={styles.codeInputs}>
                  {state.code.map((digit, index) => (
                    <input
                      key={index}
                      ref={(node) => { codeRefs.current[index] = node; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(event) => {
                        const value = event.target.value.replace(/\D/g, "").slice(0, 1);
                        setState((current) => {
                          const code = [...current.code];
                          code[index] = value;
                          return { ...current, code };
                        });
                        if (value && codeRefs.current[index + 1]) codeRefs.current[index + 1].focus();
                      }}
                    />
                  ))}
                </div>
                <button className={styles.primaryAction} type="button" onClick={verifyCode} disabled={busy}>Unlock Estimated Price</button>
                <button className={styles.textButton} type="button" onClick={sendCode}>Didn't receive a code? Resend code</button>
              </>
            )}
          </div>
        )}

        {/* STEP 6: Unverbindlicher Angebotspreis */}
        {step === 6 && (
          <div className={styles.pricePanel}>
            <div className={styles.successMark}>✓</div>
            <span className={styles.stepKicker}>07 Unverbindlicher Angebotspreis</span>
            <h2>Your Estimated Offer Price (Angebotspreis)</h2>
            <strong className={styles.priceRange}>{priceRange}</strong>
            <p>This is an approximate price range based on the information provided. The final price may vary after review and/or an on-site inspection.</p>

            <div className={styles.customerGrid}>
              {[
                ["firstName", "First Name"],
                ["lastName", "Last Name"],
                ["phone", "Phone"],
                ["address", "Street / Property Address"],
                ["postalCode", "Postal Code"],
                ["city", "City"],
                ["company", "Company"]
              ].map(([key, label]) => (
                <label key={key}>
                  <span>{label}</span>
                  <input value={state.customerInfo[key]} onChange={(event) => updateCustomerInfo(key, event.target.value)} aria-invalid={Boolean(errors[key])} />
                  {errors[key] && <small>{errors[key]}</small>}
                </label>
              ))}
              <label className={styles.checkboxLine}>
                <input type="checkbox" checked={state.customerInfo.propertyManagement} onChange={(event) => updateCustomerInfo("propertyManagement", event.target.checked)} />
                <span>Property Management</span>
              </label>
            </div>

            <div className={styles.summaryPanel}>
              <h3>Your selected project</h3>
              <dl>
                <div>
                  <dt>Property</dt>
                  <dd>{propertyTypes.find((option) => option.id === state.propertyType)?.title || "Not selected"}{state.roomType ? ` · ${state.roomType}` : ""}</dd>
                </div>
                {isSimple ? (
                  <>
                    <div>
                      <dt>Scope</dt>
                      <dd>{state.roomCount} room(s) · {state.roomSize} size</dd>
                    </div>
                    <div>
                      <dt>Services</dt>
                      <dd>{titlesFromIds(simpleServiceOptions, state.simpleServices).join(", ")}</dd>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <dt>Components</dt>
                      <dd>{selectedComponentTitles.length ? selectedComponentTitles.join(", ") : "Not selected"}</dd>
                    </div>
                    <div>
                      <dt>Services</dt>
                      <dd>{selectedServiceTitles.length ? selectedServiceTitles.join(", ") : "Not selected"}</dd>
                    </div>
                    <div>
                      <dt>Quantities</dt>
                      <dd>{visibleQuantities.map((item) => `${item.label}: ${state.quantities[item.quantityKey] || 0} ${item.unit}`).join(" · ")}</dd>
                    </div>
                  </>
                )}
              </dl>
            </div>

            <div className={styles.uploadPanel}>
              <h3>Upload photos of your project</h3>
              <div className={styles.photoGrid}>
                {photoCategories.map((category) => (
                  <label key={category} className={styles.photoDrop}>
                    <span>{category}</span>
                    <small>Take Photo or Choose From Library</small>
                    <input type="file" accept="image/*" capture="environment" onChange={(event) => uploadPhoto(event.target.files?.[0], category)} />
                  </label>
                ))}
              </div>
              {photos.length > 0 && <p className={styles.notice}>{photos.length} photo{photos.length === 1 ? "" : "s"} attached to this project.</p>}
            </div>

            <div className={styles.finalActions}>
              <button className={styles.primaryAction} type="button" onClick={() => submitRequest("OFFER")} disabled={busy}>REQUEST A FREE OFFER</button>
              <button className={styles.secondaryAction} type="button" onClick={() => submitRequest("CONSULTATION")} disabled={busy}>REQUEST SITE VISIT</button>
              {sessionId && (
                <a
                  href={`/api/offer-calculator/pdf?sessionId=${sessionId}`}
                  download
                  className={styles.secondaryAction}
                  style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", textDecoration: "none", gap: "6px" }}
                >
                  <span>📄</span>
                  <b>DOWNLOAD PDF QUOTE</b>
                </a>
              )}
            </div>

            <div style={{ marginTop: "12px", textAlign: "center" }}>
              <a
                href="https://wa.me/41441234567?text=Hallo%20AMIGOS%20Maler,%20ich%20habe%20eine%20Offerte%20berechnet"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.textButton}
                style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
              >
                <span>💬</span>
                <span>Contact via WhatsApp</span>
              </a>
            </div>
          </div>
        )}

        {/* NON-EMBEDDED NAV ACTIONS */}
        {step < 4 && (
          <div className={styles.navActions}>
            {step > 0 ? (
              <button type="button" className={styles.secondaryAction} onClick={() => setStep((current) => current - 1)}>
                ← BACK
              </button>
            ) : (
              <button type="button" className={styles.secondaryAction} onClick={() => setState((curr) => ({ ...curr, calculatorType: "SELECT" }))}>
                ← BACK TO SELECTION
              </button>
            )}
            <button type="button" className={styles.primaryAction} disabled={!canContinue() || busy} onClick={next}>
              {isSimple ? "CONTINUE →" : (step === 3 ? "CALCULATE" : "CONTINUE →")}
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
