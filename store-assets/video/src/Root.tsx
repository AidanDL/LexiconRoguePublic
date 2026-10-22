import { Composition, Still } from 'remotion';
import { Promo, PROMO_FRAMES } from './Promo';
import { ShortCompositions } from './Shorts';
import { Thumbnail } from './Thumbnail';

export const RemotionRoot = () => (
  <>
    <Composition id="Promo" component={Promo} durationInFrames={PROMO_FRAMES} fps={30} width={1920} height={1080} />
    <ShortCompositions />
    <Still id="Thumbnail" component={Thumbnail} width={1280} height={720} />
  </>
);
