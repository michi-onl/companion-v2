import type { Metadata } from "next";
import Container from "@/components/container";
import Statistics from "@/components/widgets/statistics/statistics";

export const metadata: Metadata = {
  title: "Statistics",
  description:
    "The Current Galaxy War Statistics Like Player Count and Mission Counts.",
};

export default function StatisticsPage() {
  return (
    <Container discussion="Statistics">
      <Statistics />
    </Container>
  );
}
