import { Link } from '~/components/link';
import { StoryContainer } from '../../../.storybook/story-container';

export default {
  title: 'Link',
};

export const Default = () => (
  <StoryContainer style={{ fontSize: 18 }}>
    <Link href="https://7f5c5dae.my-portfolio-92p.pages.dev/">Primary link</Link>
    <Link secondary href="https://7f5c5dae.my-portfolio-92p.pages.dev/">
      Secondary link
    </Link>
  </StoryContainer>
);
