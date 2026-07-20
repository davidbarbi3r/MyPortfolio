const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,md,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        primary: 'var(--aw-color-primary)',
        secondary: 'var(--aw-color-secondary)',
        accent: 'var(--aw-color-accent)',
        default: 'var(--aw-color-text-default)',
        muted: 'var(--aw-color-text-muted)',
        cream: 'rgb(var(--mg-cream-rgb) / <alpha-value>)',
        sand: 'rgb(var(--mg-sand-rgb) / <alpha-value>)',
        sage: 'rgb(var(--mg-sage-rgb) / <alpha-value>)',
        'sage-dark': 'rgb(var(--mg-sage-dark-rgb) / <alpha-value>)',
        charcoal: 'rgb(var(--mg-charcoal-rgb) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['var(--aw-font-sans)', ...defaultTheme.fontFamily.sans],
        serif: ['var(--aw-font-serif)', ...defaultTheme.fontFamily.serif],
        heading: ['var(--aw-font-heading)', ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
  darkMode: 'class',
};
