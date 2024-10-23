/** @type {import('next').NextConfig} */
const {
    PHASE_PRODUCTION_BUILD,
    PHASE_PRODUCTION_SERVER,
} = require("next/constants");

module.exports = (phase) => {
    let baseConfig = {
        reactStrictMode: true,
    }
    let distDir = "";
    if (phase === PHASE_PRODUCTION_BUILD) {
        distDir = "build";
    }
    else if (phase === PHASE_PRODUCTION_SERVER) {
        distDir = ".next";
    }
    baseConfig.distDir = distDir;
    return baseConfig;
};