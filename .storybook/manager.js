import { themes } from '@storybook/theming';
import { addons } from '@storybook/addons';

addons.setConfig({
  theme: {
    ...themes.dark,
    brandImage: './icon.svg',
    brandTitle: 'Enea Kuca Components',
    brandUrl: 'https://7f5c5dae.my-portfolio-92p.pages.dev/',
  },
});
