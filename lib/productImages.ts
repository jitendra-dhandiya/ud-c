/**
 * Which images to show for the colour a customer has picked.
 *
 * The rule, in order:
 *  1. shots tagged with that colour;
 *  2. otherwise the untagged shots, which are the product's default set;
 *  3. otherwise everything.
 *
 * Step 2 is the case the admin actually hits: a product offered in two colours
 * but photographed once. Those photos are left untagged and keep showing for
 * every colour, so adding a second colour never leaves the customer staring at
 * an empty frame. Step 3 covers the opposite mistake — every image tagged, but
 * to colours that no longer exist after a rename — where showing the whole set
 * is far better than showing nothing.
 *
 * Matching is case- and space-insensitive because the colour is typed by hand
 * in two different places: on the variant and on the image.
 */
export interface GalleryImage {
  url: string;
  altText?: string | null;
  color?: string | null;
}

const key = (value?: string | null) => (value || '').trim().toLowerCase();

export const galleryFor = <T extends GalleryImage>(
  images: T[] | undefined | null,
  selectedColor?: string | null
): T[] => {
  const all = images ?? [];
  if (!all.length) return [];

  if (selectedColor) {
    const wanted = key(selectedColor);
    const matching = all.filter(img => key(img.color) === wanted);
    if (matching.length) return matching;
  }

  const untagged = all.filter(img => !key(img.color));
  return untagged.length ? untagged : all;
};

/** Colours that actually have their own shots — used to hint it in the admin. */
export const colorsWithImages = (images: GalleryImage[] | undefined | null): string[] => [
  ...new Set((images ?? []).map(img => (img.color || '').trim()).filter(Boolean)),
];
