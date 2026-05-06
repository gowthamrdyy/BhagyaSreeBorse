import { Metadata } from "next";
export const runtime = "edge";
export const metadata: Metadata = {
  title: "Calendar",
  description: "Academic Calendar data",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="w-full h-full ">{children}</div>;
}
