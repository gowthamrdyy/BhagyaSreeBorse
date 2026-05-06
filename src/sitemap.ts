import type { MetadataRoute } from "next";
export const runtime = "edge";
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://timetablex.in",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
      images: ["https://timetablex.in/Landing/BigScreen.png"],
    },
    {
      url: "https://timetablex.in/auth/login",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
      images: ["https://timetablex.in/Landing/BigScreenLogin.png"],
    },
  ];
}
