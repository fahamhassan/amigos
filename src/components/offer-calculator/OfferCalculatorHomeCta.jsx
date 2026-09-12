import OfferCalculator from "./OfferCalculator";
import styles from "./OfferCalculatorHomeCta.module.css";

export default function OfferCalculatorHomeCta() {
  return (
    <section className={`${styles.section} home-calculator-cta`}>
      <OfferCalculator embedded defaultFlow="SIMPLE" detailedQuoteHref="/offer-calculator" />
    </section>
  );
}
