import OfferCalculator from "@/components/offer-calculator/OfferCalculator";

export const metadata = {
  title: "Offer Calculator & Request | Amigos Maler",
  description: "Calculate your estimated AMIGOS MALER project price and request a personal offer."
};

export default function OfferCalculatorPage() {
  return <OfferCalculator defaultFlow="DETAILED" />;
}
