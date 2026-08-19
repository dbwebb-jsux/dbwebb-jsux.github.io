// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	site: 'https://dbwebb-jsux.github.io',
	integrations: [
		starlight({
			title: 'JSUX',
			favicon: '/favicon.ico',
			social: [
				{ icon: 'github', label: 'GitHub', href: 'https://github.com/dbwebb-jsux/dbwebb-jsux.github.io' }
			],
			sidebar: [
				{ label: 'Kursöversikt', link: '/' },
				{
					label: "Kursmoment",
					items: [
						'kmom01',
						'kmom02',
						'kmom03',
						'kmom04',
						'kmom05',
						'kmom06',
						'kmom10',
					]
				}
			],
			customCss: [
				// Relative path to your custom CSS file
				'./src/styles/custom.css',
			],
			pagination: false,
		}),
	],
});
