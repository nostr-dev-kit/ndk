module.exports = {
    content: [
        // app content
        `src/**/*.{js,ts,jsx,tsx,svelte}`,
        // include packages if not transpiling
        "../../packages/**/*.{js,ts,jsx,tsx,svelte}",
    ],
    theme: {
        extend: {},
    },
    plugins: [require("@tailwindcss/typography"), require("daisyui")],
    daisyui: {
        themes: ["dark", "light"],
        base: true,
        styled: true,
        utils: true,
        //rtl: false,
        //prefix: "",
        //logs: true,
    },
};
