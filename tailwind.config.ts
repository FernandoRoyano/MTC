import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta MTC: tonos cálidos, bienestar, naturaleza
        beige: {
          50: '#fdf8f0',
          100: '#f5ead6',
          200: '#eddcb8',
          300: '#e0c896',
          400: '#d4b274',
          500: '#c89b52',
        },
        salvia: {
          50: '#f0f5f0',
          100: '#dae6da',
          200: '#b8d0b8',
          300: '#8fb58f',
          400: '#6b9a6b',
          500: '#4f7f4f',
          600: '#3d6b3d',
          700: '#2d532d',
        },
        terracota: {
          50: '#fdf2ef',
          100: '#f5d6cc',
          200: '#e8b5a4',
          300: '#d4886e',
          400: '#c06a4a',
          500: '#a85535',
          600: '#8b4429',
        },
        arena: {
          50: '#faf8f5',
          100: '#f2ede5',
          200: '#e8dfd2',
          300: '#d9ccb8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
