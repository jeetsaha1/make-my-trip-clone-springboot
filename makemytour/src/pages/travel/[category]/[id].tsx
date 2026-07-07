import { useRouter } from "next/router";
import TravelDetailPage from "@/components/TravelDetailPage";

const TravelCategoryDetailPage = () => {
  const router = useRouter();
  const { category, id } = router.query as { category?: string; id?: string };

  if (!category || !id) {
    return null;
  }

  const detailMap: Record<string, { pageTitle: string; detailType: "stay" | "transport" | "package" | "currency" | "insurance"; entityType: "hotel" | "flight" }> = {
    homestays: { pageTitle: "Homestay", detailType: "stay", entityType: "hotel" },
    holidays: { pageTitle: "Holiday Package", detailType: "package", entityType: "hotel" },
    trains: { pageTitle: "Train Journey", detailType: "transport", entityType: "flight" },
    buses: { pageTitle: "Bus Journey", detailType: "transport", entityType: "flight" },
    cabs: { pageTitle: "Cab Service", detailType: "transport", entityType: "flight" },
    forex: { pageTitle: "Forex", detailType: "currency", entityType: "hotel" },
    insurance: { pageTitle: "Insurance Plan", detailType: "insurance", entityType: "hotel" },
  };

  const config = detailMap[category] || detailMap.homestays;

  return <TravelDetailPage collectionName={category} itemId={id} pageTitle={config.pageTitle} detailType={config.detailType} entityType={config.entityType} />;
};

export default TravelCategoryDetailPage;
