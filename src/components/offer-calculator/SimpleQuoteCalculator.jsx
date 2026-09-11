"use client";

import { useRef, useState } from "react";
import styles from "./SimpleQuoteCalculator.module.css";

const propertyTypes = [
  { id: "apartment", title: "Apartment / Flat", icon: "🏢" },
  { id: "house", title: "Single-Family House", icon: "🏡" },
  { id: "commercial", title: "Commercial / Office", icon: "🏬" },
  { id: "facade", title: "Facade / Exterior", icon: "🏰" },
  { id: "room", title: "Single Room", icon: "🛋️" }
];

const roomCountOptions = [1, 2, 3, 4, 5, 6, 8, 10];

const roomSizePresets = [
  { id: "small", title: "Compact / Small", description: "~10–14 m² floor area (small bedrooms, bathrooms)" },
  { id: "medium", title: "Standard / Medium", description: "~15–22 m² floor area (standard bedrooms, living spaces)" },
  { id: "large", title: "Spacious / Large", description: "~25–35+ m² floor area (large open-plan living rooms)" }
];

const simpleServices = [
  { id: "paint_walls", title: "Paint Walls (2 coats)", defaultChecked: true },
  { id: "paint_ceilings", title: "Paint Ceilings (2 coats)", defaultChecked: true },
  { id: "apply_wallpaper", title: "Wallpaper Installation", defaultChecked: false },
  { id: "remove_wallpaper", title: "Remove Old Wallpaper", defaultChecked: false },
  { id: "filling_spackling", title: "Spackling & Wall Repair", defaultChecked: false },
  { id: "covering_protection", title: "Floor & Furniture Protection", defaultChecked: true }
];

export default function SimpleQuoteCalculator({ onBackToSelector }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [propertyType, setPropertyType] = useState("apartment");
  const [roomCount, setRoomCount] = useState(3);
  const [roomSize, setRoomSize] = useState("medium");
  const [services, setServices] = useState(["paint_walls", "paint_ceilings", "covering_protection"]);
  const [projectNotes, setProjectNotes] = useState("");

  const [sessionId, setSessionId] = useState("");
  const [locked, setLocked] = useState(true);
  const [email, setEmail] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState(["", "", "", ""]);
  const [priceRange, setPriceRange] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const [customerInfo, setCustomerInfo] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    postalCode: "",
    city: ""
  });
  const [submitted, setSubmitted] = useState(false);

  const codeRefs = useRef([]);

  function toggleService(id) {
    setServices((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  async function handleQuickCalculate() {
    setBusy(true);
    setError("");
    setNotice("");

    try {
      const response = await fetch("/api/offer-calculator/quick-calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyType,
          roomCount,
          roomSize,
          services,
          projectNotes
        })
      });

      const data = await response.json();
      setBusy(false);

      if (!response.ok) {
        setError(data.error || "Please check your project details.");
        return;
      }

      setSessionId(data.sessionId);
      setCurrentStep(2);
    } catch (err) {
      setBusy(false);
      setError("An unexpected error occurred. Please try again.");
    }
  }

  async function handleSendCode() {
    if (!email || !email.includes("@")) {
      setError("Please enter a valid e-mail address.");
      return;
    }

    setBusy(true);
    setError("");
    setNotice("");

    try {
      const response = await fetch("/api/offer-calculator/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, email })
      });

      const data = await response.json();
      setBusy(false);

      if (!response.ok) {
        setError(data.error || data.errors?.email || "Could not send verification code.");
        return;
      }

      setCodeSent(true);
      setNotice(
        data.developmentCode
          ? `Code sent! (Dev code: ${data.developmentCode})`
          : `Verification code sent to ${email}. Please check your inbox.`
      );
    } catch (err) {
      setBusy(false);
      setError("Failed to send verification code. Please try again.");
    }
  }

  async function handleVerifyCode() {
    const fullCode = code.join("");
    if (fullCode.length !== 4) {
      setError("Please enter the complete 4-digit code.");
      return;
    }

    setBusy(true);
    setError("");
    setNotice("");

    try {
      const response = await fetch("/api/offer-calculator/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, code: fullCode })
      });

      const data = await response.json();
      setBusy(false);

      if (!response.ok) {
        setError(data.error || "Verification failed. Please check the code.");
        return;
      }

      setPriceRange(data.priceRange);
      setLocked(false);
      setNotice("");
    } catch (err) {
      setBusy(false);
      setError("Verification failed. Please try again.");
    }
  }

  async function handleSubmitOffer(requestedAction = "OFFER") {
    if (!customerInfo.firstName || !customerInfo.lastName || !customerInfo.phone) {
      setError("Please provide at least your first name, last name, and phone number.");
      return;
    }

    setBusy(true);
    setError("");

    try {
      const response = await fetch("/api/offer-calculator/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          customerInfo: {
            ...customerInfo,
            email,
            requestedAction
          }
        })
      });

      const data = await response.json();
      setBusy(false);

      if (!response.ok) {
        setError(data.error || "Could not submit your request.");
        return;
      }

      setSubmitted(true);
      setNotice(
        requestedAction === "CONSULTATION"
          ? "Thank you! Your consultation request has been received. Our team will contact you shortly."
          : "Thank you! Your quote request has been received. We will send your personal offer promptly."
      );
    } catch (err) {
      setBusy(false);
      setError("Could not submit. Please try again.");
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.topBar}>
        {onBackToSelector && (
          <button type="button" className={styles.backToOptionsBtn} onClick={onBackToSelector}>
            ← Back to Calculator Selection
          </button>
        )}
        <span className={styles.modeBadge}>Quick Estimate · No m² Needed</span>
      </div>

      <div className={styles.header}>
        <h2>Your Estimated Quote in Just a Few Steps</h2>
        <p>Simple. Fast. No obligation. Receive your price after entering your e-mail address.</p>
      </div>

      <div className={styles.progressBar}>
        <div
          className={styles.progressFill}
          style={{ width: `${((currentStep + 1) / 3) * 100}%` }}
        />
      </div>

      <div className={styles.stepIndicators}>
        <button
          type="button"
          className={`${styles.stepIndicator} ${currentStep === 0 ? styles.active : ""} ${currentStep > 0 ? styles.done : ""}`}
          onClick={() => currentStep > 0 && setCurrentStep(0)}
        >
          <span className={styles.stepNumber}>1</span>
          <span>Project Type</span>
        </button>
        <button
          type="button"
          className={`${styles.stepIndicator} ${currentStep === 1 ? styles.active : ""} ${currentStep > 1 ? styles.done : ""}`}
          onClick={() => currentStep > 1 && setCurrentStep(1)}
        >
          <span className={styles.stepNumber}>2</span>
          <span>Scope & Services</span>
        </button>
        <button
          type="button"
          className={`${styles.stepIndicator} ${currentStep === 2 ? styles.active : ""}`}
        >
          <span className={styles.stepNumber}>3</span>
          <span>Offer Price</span>
        </button>
      </div>

      <div className={styles.cardShell}>
        {error && <div className={styles.errorMsg}>⚠️ {error}</div>}
        {notice && <div className={styles.noticeMsg}>✓ {notice}</div>}

        {/* STEP 0: Project Type */}
        {currentStep === 0 && (
          <div>
            <h3 className={styles.stepTitle}>What type of property would you like painted?</h3>
            <p className={styles.stepDescription}>Select the option that best matches your space.</p>

            <div className={styles.gridOptions}>
              {propertyTypes.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`${styles.optionCard} ${propertyType === item.id ? styles.selected : ""}`}
                  onClick={() => setPropertyType(item.id)}
                >
                  <span className={styles.cardIcon}>{item.icon}</span>
                  <span className={styles.cardLabel}>{item.title}</span>
                </button>
              ))}
            </div>

            <div className={styles.navActions}>
              <div />
              <button
                type="button"
                className={styles.btnPrimary}
                onClick={() => setCurrentStep(1)}
              >
                Continue to Scope →
              </button>
            </div>
          </div>
        )}

        {/* STEP 1: Scope & Services (No m2 required) */}
        {currentStep === 1 && (
          <div>
            <h3 className={styles.stepTitle}>Tell us about your project scope</h3>
            <p className={styles.stepDescription}>
              No need to measure wall areas! Just tell us roughly how many rooms and what work is desired.
            </p>

            <div className={styles.scopeSection}>
              <div className={styles.scopeLabel}>
                <span>Number of Rooms</span>
                <span style={{ color: "#f6be10" }}>{roomCount} {roomCount === 1 ? "Room" : "Rooms"}</span>
              </div>
              <div className={styles.chipGroup}>
                {roomCountOptions.map((cnt) => (
                  <button
                    key={cnt}
                    type="button"
                    className={`${styles.chip} ${roomCount === cnt ? styles.active : ""}`}
                    onClick={() => setRoomCount(cnt)}
                  >
                    {cnt === 10 ? "10+" : cnt}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.scopeSection}>
              <div className={styles.scopeLabel}>
                <span>Average Room Size</span>
              </div>
              <div className={styles.chipGroup}>
                {roomSizePresets.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    className={`${styles.sizeCard} ${roomSize === preset.id ? styles.active : ""}`}
                    onClick={() => setRoomSize(preset.id)}
                  >
                    <strong>{preset.title}</strong>
                    <small>{preset.description}</small>
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.scopeSection}>
              <div className={styles.scopeLabel}>
                <span>Select Required Services</span>
              </div>
              <div className={styles.serviceGrid}>
                {simpleServices.map((service) => {
                  const checked = services.includes(service.id);
                  return (
                    <div
                      key={service.id}
                      className={`${styles.serviceItem} ${checked ? styles.checked : ""}`}
                      onClick={() => toggleService(service.id)}
                    >
                      <div className={styles.checkboxSquare}>
                        {checked && "✓"}
                      </div>
                      <span>{service.title}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className={styles.navActions}>
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={() => setCurrentStep(0)}
              >
                ← Back
              </button>
              <button
                type="button"
                className={styles.btnPrimary}
                onClick={handleQuickCalculate}
                disabled={busy || services.length === 0}
              >
                {busy ? "Calculating..." : "Calculate My Price →"}
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Price / Unlock / Submit */}
        {currentStep === 2 && (
          <div>
            {locked ? (
              <div className={styles.lockedPanel}>
                <div className={styles.lockIcon}>🔒</div>
                <h3 className={styles.stepTitle}>Your Calculation is Ready!</h3>
                <p className={styles.stepDescription}>
                  To protect our fair market pricing and see your estimated quote immediately, please verify your e-mail address.
                </p>

                <div className={styles.lockedPriceBox}>
                  <span>Estimated Offer Price (Angebotspreis)</span>
                  <strong>CHF ••••.–</strong>
                </div>

                {!codeSent ? (
                  <>
                    <div className={styles.inputField}>
                      <span>Enter your e-mail address</span>
                      <input
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={busy}
                      />
                    </div>
                    <button
                      type="button"
                      className={styles.btnPrimary}
                      onClick={handleSendCode}
                      disabled={busy || !email}
                    >
                      {busy ? "Sending Code..." : "Send Verification Code to E-Mail"}
                    </button>
                  </>
                ) : (
                  <>
                    <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 14 }}>
                      We sent a 4-digit verification code to <b>{email}</b>.
                    </p>
                    <div className={styles.codeInputs}>
                      {code.map((digit, idx) => (
                        <input
                          key={idx}
                          ref={(el) => { codeRefs.current[idx] = el; }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "").slice(0, 1);
                            const nextCode = [...code];
                            nextCode[idx] = val;
                            setCode(nextCode);
                            if (val && codeRefs.current[idx + 1]) {
                              codeRefs.current[idx + 1].focus();
                            }
                          }}
                        />
                      ))}
                    </div>
                    <button
                      type="button"
                      className={styles.btnPrimary}
                      onClick={handleVerifyCode}
                      disabled={busy}
                    >
                      {busy ? "Verifying..." : "Unlock Estimated Price"}
                    </button>
                    <button
                      type="button"
                      style={{
                        background: "none",
                        border: "none",
                        color: "rgba(255,255,255,0.6)",
                        fontSize: 13,
                        marginTop: 14,
                        cursor: "pointer",
                        textDecoration: "underline"
                      }}
                      onClick={handleSendCode}
                    >
                      Didn't get the code? Resend
                    </button>
                  </>
                )}

                <div style={{ marginTop: 24 }}>
                  <button
                    type="button"
                    className={styles.btnSecondary}
                    onClick={() => setCurrentStep(1)}
                  >
                    ← Edit Selections
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.pricePanel}>
                <div style={{ fontSize: 44, color: "#f6be10", marginBottom: 6 }}>✓</div>
                <h3 className={styles.stepTitle}>Your Estimated Quote (Angebotspreis)</h3>
                <p className={styles.stepDescription}>
                  Based on {roomCount} room{roomCount > 1 ? "s" : ""} ({roomSize} size preset) and your chosen services.
                </p>

                <div className={styles.priceDisplayBox}>
                  <span className={styles.kicker}>Unverbindlicher Richtpreis / Estimated Price</span>
                  <strong>{priceRange}</strong>
                </div>

                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", maxWidth: 520, margin: "0 auto 20px" }}>
                  This estimated quote is non-binding and free of obligation. For an exact quote or consultation, enter your contact details below.
                </p>

                {!submitted ? (
                  <>
                    <div className={styles.customerForm}>
                      <label>
                        <span>First Name *</span>
                        <input
                          value={customerInfo.firstName}
                          onChange={(e) => setCustomerInfo({ ...customerInfo, firstName: e.target.value })}
                        />
                      </label>
                      <label>
                        <span>Last Name *</span>
                        <input
                          value={customerInfo.lastName}
                          onChange={(e) => setCustomerInfo({ ...customerInfo, lastName: e.target.value })}
                        />
                      </label>
                      <label>
                        <span>Phone Number *</span>
                        <input
                          type="tel"
                          value={customerInfo.phone}
                          onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                        />
                      </label>
                      <label>
                        <span>Street / Address</span>
                        <input
                          value={customerInfo.address}
                          onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                        />
                      </label>
                      <label>
                        <span>Postal Code</span>
                        <input
                          value={customerInfo.postalCode}
                          onChange={(e) => setCustomerInfo({ ...customerInfo, postalCode: e.target.value })}
                        />
                      </label>
                      <label>
                        <span>City</span>
                        <input
                          value={customerInfo.city}
                          onChange={(e) => setCustomerInfo({ ...customerInfo, city: e.target.value })}
                        />
                      </label>
                    </div>

                    <div className={styles.finalButtons}>
                      <button
                        type="button"
                        className={styles.btnPrimary}
                        onClick={() => handleSubmitOffer("OFFER")}
                        disabled={busy}
                      >
                        {busy ? "Submitting..." : "Request Personal Free Offer"}
                      </button>
                      <button
                        type="button"
                        className={styles.btnSecondary}
                        onClick={() => handleSubmitOffer("CONSULTATION")}
                        disabled={busy}
                      >
                        Schedule Free Consultation
                      </button>
                    </div>
                  </>
                ) : (
                  <div style={{ padding: "20px 0" }}>
                    <div style={{ color: "#f6be10", fontSize: 18, fontWeight: 700, marginBottom: 12 }}>
                      Request Successfully Submitted!
                    </div>
                    <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 14 }}>
                      We have received your details. An Amigos Maler expert will contact you within 24 hours.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
