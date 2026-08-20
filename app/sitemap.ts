import type { MetadataRoute } from "next";
export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://example.com";
  return ["","/services","/portfolio","/about","/opportunity","/founder/story","/contact","/contact/consultation","/privacy","/terms"].map((route)=>({url:`${base}${route}`,lastModified:new Date()}));
}
