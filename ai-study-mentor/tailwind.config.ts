import path from 'path';
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    path.join(__dirname, 'src/app/**/*.{js,ts,jsx,tsx,mdx}'),
    path.join(__dirname, 'src/components/**/*.{js,ts,jsx,tsx,mdx}'),
    path.join(__dirname, 'src/pages/**/*.{js,ts,jsx,tsx,mdx}'),
  ],
  theme: {
    extend: {
      colors: {
        primary: '#10A37F',
      },
    },
  },
  plugins: [],
}
export default config
