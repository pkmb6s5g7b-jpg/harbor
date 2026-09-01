import { getOffer, templateOffer, type Offer } from "../../config/pricing";
import { getProduct } from "../../data/products";

export function resolveOffer(id: string): Offer | undefined {
  const fromCatalog = getOffer(id);
  if (fromCatalog) return fromCatalog;
  const product = getProduct(id);
  if (product) return templateOffer(product.id, product.name, product.blurb);
  return undefined;
}
