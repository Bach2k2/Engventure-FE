import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  images: {
    domains: ['localhost','cloudinary'],
  },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
