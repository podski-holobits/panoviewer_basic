/** @type {import('tailwindcss').Config} */

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {},
  },
  plugins: [
    require("@tailwindcss/typography"),
    require('daisyui'),
  ],

  daisyui: {
    themes: [
      {
        panoviewer: {
          'primary': '#059B7E',
          'primary-focus': '#0bad8c',
          'primary-content': '#f1f1f1',

          'secondary': '#ACD0D2',
          'secondary-focus': '#CAD5D7',
          'secondary-content': '#252223',

          'accent': '#FF711B',
          'accent-focus': '#f78036',
          'accent-content': '#f1f1f1',

          'neutral': '#0D0E0E',
          'neutral-focus': '#252223',
          'neutral-content': '#f1f1f1',

          'base-100': '#f1f1f1',
          'base-200': '#dcdfe0',
          'base-300': '#CAD5D7',
          'base-content': '#252223',

          'info': '#90abad',
          'success': '#0bad8c',
          'warning': '#f78036',
          'error': '#ca4821',



          "--rounded-box": ".4rem", // border radius rounded-box utility class, used in card and other large boxes
          "--rounded-btn": "0.4rem", // border radius rounded-btn utility class, used in buttons and similar element
          "--rounded-badge": ".4rem'", // border radius rounded-badge utility class, used in badges and similar
          "--animation-btn": "0.25s", // duration of animation when you click on button
          "--animation-input": "0.2s", // duration of animation for inputs like checkbox, toggle, radio, etc
          "--btn-focus-scale": "0.95", // scale transform of button when you focus on it
          //'--btn-text-case': 'uppercase',   
          '--navbar-padding': '.5rem',
          "--border-btn": "0px", // border width of buttons
          "--tab-border": "1px", // border width of tabs
          "--tab-radius": "0.5rem", // border radius of tabs
        },
      },
      "winter",
      "bumblebee",
    ],
  },
}

