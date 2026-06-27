/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { webpack }) => {
    // Ignore the optional 'request' dependency of 'retry-request' (Google Cloud SDKs)
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^request$/,
      })
    );
    return config;
  },
};

export default nextConfig;
