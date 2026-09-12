"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useAmigosTheme } from "@/lib/useAmigosTheme";

const serviceHoverGradients = [
  {
    background: "linear-gradient(135deg, rgba(246, 190, 16, .94), rgba(243, 145, 37, .94))",
    border: "rgba(246, 190, 16, .58)",
  },
  {
    background: "linear-gradient(135deg, rgba(199, 59, 142, .94), rgba(230, 36, 83, .94))",
    border: "rgba(199, 59, 142, .6)",
  },
  {
    background: "linear-gradient(135deg, rgba(230, 36, 83, .94), rgba(199, 59, 142, .94))",
    border: "rgba(230, 36, 83, .6)",
  },
  {
    background: "linear-gradient(135deg, rgba(243, 145, 37, .94), rgba(230, 36, 83, .94))",
    border: "rgba(243, 145, 37, .58)",
  },
];

export default function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [isCustomerLoggedIn, setIsCustomerLoggedIn] = useState(false);
  const { isDark: isDarkTheme, toggleTheme } = useAmigosTheme();
  const lastHoverVariants = useRef(new WeakMap());

  useEffect(() => {
    if (isHome) return undefined;

    const header = document.getElementById("siteHeader");
    if (!header) return;

    const updateHeaderState = () => {
      header.classList.toggle("is-scrolled", window.scrollY > 20);
    };

    updateHeaderState();
    window.addEventListener("scroll", updateHeaderState, { passive: true });

    return () => window.removeEventListener("scroll", updateHeaderState);
  }, []);

  useEffect(() => {
    let active = true;

    fetch("/api/customer/me", { cache: "no-store" })
      .then((response) => {
        if (active) setIsCustomerLoggedIn(response.ok);
      })
      .catch(() => {
        if (active) setIsCustomerLoggedIn(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const setRandomServiceHover = (event) => {
    const item = event.currentTarget;
    const previousVariant = lastHoverVariants.current.get(item);
    let nextVariant = Math.floor(Math.random() * serviceHoverGradients.length);

    if (serviceHoverGradients.length > 1) {
      while (nextVariant === previousVariant) {
        nextVariant = Math.floor(Math.random() * serviceHoverGradients.length);
      }
    }

    lastHoverVariants.current.set(item, nextVariant);
    item.style.setProperty("--dropdown-hover-bg", serviceHoverGradients[nextVariant].background);
    item.style.setProperty("--dropdown-hover-border", serviceHoverGradients[nextVariant].border);
  };

  return (
    <header className={`site-header${isHome ? " home-initial" : ""}`} id="siteHeader">
      <a className="logo" href="/">
        <img src="/New-Logo.png" alt="Amigos Maler" />
      </a>

      <nav className="site-nav">
        <a href="/" data-page="home">
          Home
        </a>
        <a href="/about" data-page="about">
          About
        </a>

        <div className="nav-dropdown">
          <a href="/services" className="dropdown-trigger">
            Services
            <svg className="dropdown-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path
                d="M6 9l6 6 6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
          <div className="dropdown-menu">
            <a href="/interior-painting" className="dropdown-item" onMouseEnter={setRandomServiceHover}>
              <span className="item-num">01</span>
              <div className="item-info">
                <span className="item-title">Interior Painting</span>
                <span className="item-desc">Walls, ceilings, doors and high-quality coatings</span>
              </div>
            </a>
            <a href="/exterior-painting" className="dropdown-item" onMouseEnter={setRandomServiceHover}>
              <span className="item-num">02</span>
              <div className="item-info">
                <span className="item-title">Exterior Painting</span>
                <span className="item-desc">Facades, woodwork and weather-resistant coatings</span>
              </div>
            </a>
            <a href="/Plastering" className="dropdown-item" onMouseEnter={setRandomServiceHover}>
              <span className="item-num">03</span>
              <div className="item-info">
                <span className="item-title">Plastering Work</span>
                <span className="item-desc">Filling, plastering and surface work</span>
              </div>
            </a>
            <a href="/Drywall" className="dropdown-item" onMouseEnter={setRandomServiceHover}>
              <span className="item-num">04</span>
              <div className="item-info">
                <span className="item-title">Drywall/Interior construction</span>
                <span className="item-desc">Walls, ceilings and customized room solutions</span>
              </div>
            </a>
            <a href="/Facade-Renovation" className="dropdown-item" onMouseEnter={setRandomServiceHover}>
              <span className="item-num">05</span>
              <div className="item-info">
                <span className="item-title">Facade Renovation</span>
                <span className="item-desc">Protection, renovation and redesign of facades</span>
              </div>
            </a>
            <a href="/appartment-renovation" className="dropdown-item" onMouseEnter={setRandomServiceHover}>
              <span className="item-num">06</span>
              <div className="item-info">
                <span className="item-title">Appartment Renovation</span>
                <span className="item-desc">Renovations for tenant changes, property sales or personal use</span>
              </div>
            </a>
            <a href="/spray-painting" className="dropdown-item" onMouseEnter={setRandomServiceHover}>
              <span className="item-num">07</span>
              <div className="item-info">
                <span className="item-title">Spray Painting</span>
                <span className="item-desc">Doors, frames, shutters and other components</span>
              </div>
            </a>
            <a href="/color-and-material" className="dropdown-item" onMouseEnter={setRandomServiceHover}>
              <span className="item-num">08</span>
              <div className="item-info">
                <span className="item-title">Color & Material Construction</span>
                <span className="item-desc">Color concepts and suitable coating systems</span>
              </div>
            </a>
            <a href="/water-damage" className="dropdown-item" onMouseEnter={setRandomServiceHover}>
              <span className="item-num">09</span>
              <div className="item-info">
                <span className="item-title">Damage Remediation</span>
                <span className="item-desc">Surface repair after moisture, staining and damage</span>
              </div>
            </a>
            <a href="/services" className="dropdown-item" onMouseEnter={setRandomServiceHover}>
              <span className="item-num">10</span>
              <div className="item-info">
                <span className="item-title">Discover All Services</span>
                <span className="item-desc">Explore More Services</span>
              </div>
            </a>
          </div>
        </div>

        <a href="https://amigos-immo.vercel.app/" data-page="projects" rel="noopener noreferrer" target="_blank">
          Projects
        </a>
        <a href="/partners" data-page="partners">
          Partners
        </a>
        <a href="/property-value-preservation" data-page="werterhalt">
          Property Value Preservation
        </a>
        <a href="/contact" data-page="contact">
          Contact
        </a>
      </nav>

      <div className="header-actions">
        <a
          href={isCustomerLoggedIn ? "/customer/dashboard" : "/customer/login"}
          className="customer-header-btn"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
            <path
              d="M20 21a8 8 0 1 0-16 0M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {isCustomerLoggedIn ? "Customer Portal" : "Customer Login"}
        </a>

        <a href="/contact" className="header-btn">
          Request A Quote
        </a>
      </div>

      <button
        className="theme-toggle"
        type="button"
        aria-label={`Switch to ${isDarkTheme ? "light" : "navy"} theme`}
        aria-pressed={isDarkTheme}
        onClick={toggleTheme}
      >
        <span className="theme-toggle-icon" aria-hidden="true">
          {isDarkTheme ? (
            <svg className="theme-icon theme-icon-moon" viewBox="0 0 24 24" fill="none">
              <path
                d="M20.2 14.2A7.6 7.6 0 0 1 9.8 3.8 8.5 8.5 0 1 0 20.2 14.2Z"
                fill="currentColor"
              />
            </svg>
          ) : (
            <svg className="theme-icon theme-icon-sun" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="4.2" fill="currentColor" />
              <path
                d="M12 2.8v2.4M12 18.8v2.4M21.2 12h-2.4M5.2 12H2.8M18.5 5.5l-1.7 1.7M7.2 16.8l-1.7 1.7M18.5 18.5l-1.7-1.7M7.2 7.2 5.5 5.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          )}
        </span>
      </button>

      <button className="hamburger" aria-label="Toggle menu" aria-expanded="false">
        <span></span>
        <span></span>
        <span></span>
      </button>
    </header>
  );
}
