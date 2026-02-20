import slugify from "slugify";
import { Model } from "mongoose";

export const generateUniqueSlug = async <T>(
  model: Model<T>,
  value: string,
  field: string = "slug",
): Promise<string> => {
  const baseSlug = slugify(value, {
    lower: true,
    strict: true,
    trim: true,
  });

  let slug = baseSlug;
  let counter = 1;

  while (await model.exists({ [field]: slug })) {
    slug = `${baseSlug}-${counter++}`;
  }

  return slug;
};
