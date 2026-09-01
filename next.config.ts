import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Spreadsheet files live in content/spreadsheets and are served only via
     /api/download/[slug] after payment. Do not put paid .xlsx files in public/. */
};

export default nextConfig;
