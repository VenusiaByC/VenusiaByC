/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Autorise les photos stockées dans Supabase Storage (logo, photos de
    // prestations, etc.). Le domaine exact sera précisé une fois le projet
    // Supabase créé (voir README, section "Configuration").
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
};

export default nextConfig;
