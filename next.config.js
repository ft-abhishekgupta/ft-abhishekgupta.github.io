/** @type {import('next').NextConfig} */

module.exports = {
  output: "export",
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.igdb.com",
        port: "",
      },
      {
        protocol: "https",
        hostname: "www.instagram.com",
        port: "",
      },
      {
        protocol: "https",
        hostname: "**.fbcdn.net",
        port: "",
      },
      {
        protocol: "https",
        hostname: "a.ltrbxd.com",
        port: "",
      },
      {
        protocol: "https",
        hostname: "s.ltrbxd.com",
        port: "",
      },
    ],
  },
};
