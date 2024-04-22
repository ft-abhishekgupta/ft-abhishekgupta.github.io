/** @type {import('next').NextConfig} */

module.exports = {
  output: "export",
  images: { unoptimized: true },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.igdb.com",
        port: "",
      },
      {
        protocol: "https",
        hostname: "instagram.fdel27-3.fna.fbcdn.net/v/",
        port: "",
      },
    ],
  },
};
