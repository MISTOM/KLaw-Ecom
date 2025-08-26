import prisma from './prisma';

/**
 * Shape of an active promotion record as returned by getActivePromotions.
 */
export interface ActivePromotion {
    id: number;
    name: string;
    discountType: 'PERCENT' | 'AMOUNT';
    discountValue: number;
    priority: number;
    products: { productId: number }[];
    categories: { categoryId: number }[];
}

export interface AppliedPromotion {
    promotionId: number;
    name: string;
    discountType: 'PERCENT' | 'AMOUNT';
    discountValue: number;
    unitPrice: number; // original
    finalUnitPrice: number; // after discount
    discountAmount: number; // unitPrice - finalUnitPrice
}

/**
 * Index structure for faster per-product promotion selection.
 * Reason: Avoid scanning every active promotion for each product when only a subset applies.
 */
export interface PromotionIndex {
    byProduct: Map<number, ActivePromotion[]>;
    byCategory: Map<number, ActivePromotion[]>;
}

/**
 * Compute the best (lowest price) active promotion for a product given its categories.
 * Reason: Centralize promotion logic so product listing, cart pricing & order creation stay consistent.
 */
export function selectBestPromotion(
    basePrice: number,
    productId: number,
    categoryIds: number[],
    activePromotions: ActivePromotion[]
): AppliedPromotion | null {
    // Reason: Iterate active promotions once choosing the one yielding lowest final price; priority is secondary tie-breaker.
    let best: AppliedPromotion | null = null;
    let bestPriority = Number.POSITIVE_INFINITY;
    for (const promo of activePromotions) {
        const appliesToProduct = promo.products.some((p) => p.productId === productId);
        const appliesToCategory = !appliesToProduct && promo.categories.some((c) => categoryIds.includes(c.categoryId));
        if (!appliesToProduct && !appliesToCategory) continue;
        let finalPrice = basePrice;
        if (promo.discountType === 'PERCENT') {
            finalPrice = Math.max(0, basePrice * (1 - promo.discountValue / 100));
        } else {
            finalPrice = Math.max(0, basePrice - promo.discountValue);
        }
        const discountAmount = basePrice - finalPrice;
        if (
            !best ||
            finalPrice < best.finalUnitPrice - 0.0001 ||
            (Math.abs(finalPrice - best.finalUnitPrice) < 0.0001 && promo.priority < bestPriority)
        ) {
            best = {
                promotionId: promo.id,
                name: promo.name,
                discountType: promo.discountType,
                discountValue: promo.discountValue,
                unitPrice: basePrice,
                finalUnitPrice: Number(finalPrice.toFixed(2)),
                discountAmount: Number(discountAmount.toFixed(2))
            };
            bestPriority = promo.priority;
        }
    }
    return best;
}

/**
 * Build in-memory indexes for active promotions keyed by product and category.
 * Complexity: O(N * (p+c)) where (p,c) are counts of linked products/categories per promotion.
 */
export function buildPromotionIndex(activePromotions: ActivePromotion[]): PromotionIndex {
    const byProduct = new Map<number, ActivePromotion[]>();
    const byCategory = new Map<number, ActivePromotion[]>();
    for (const promo of activePromotions) {
        for (const { productId } of promo.products) {
            const arr = byProduct.get(productId);
            if (arr) arr.push(promo); else byProduct.set(productId, [promo]);
        }
        for (const { categoryId } of promo.categories) {
            const arr = byCategory.get(categoryId);
            if (arr) arr.push(promo); else byCategory.set(categoryId, [promo]);
        }
    }
    return { byProduct, byCategory };
}

/**
 * Optimized variant that only evaluates promotions directly associated with the product or its categories.
 * Reason: Avoid full scan of activePromotions for large catalog performance.
 */
export function selectBestPromotionIndexed(
    basePrice: number,
    productId: number,
    categoryIds: number[],
    index: PromotionIndex
): AppliedPromotion | null {
    const candidateMap = new Map<number, ActivePromotion>();
    const direct = index.byProduct.get(productId) || [];
    for (const p of direct) candidateMap.set(p.id, p);
    for (const cid of categoryIds) {
        const arr = index.byCategory.get(cid) || [];
        for (const p of arr) {
            if (!candidateMap.has(p.id)) candidateMap.set(p.id, p);
        }
    }
    if (candidateMap.size === 0) return null;
    return selectBestPromotion(basePrice, productId, categoryIds, Array.from(candidateMap.values()));
}

/**
 * Fetch active promotions snapshot for pricing operations.
 */
export async function getActivePromotions(
    now = new Date(),
    opts?: { productIds?: number[]; categoryIds?: number[] }
): Promise<ActivePromotion[]> {
    const productIds = opts?.productIds?.filter((v, i, a) => a.indexOf(v) === i) || [];
    const categoryIds = opts?.categoryIds?.filter((v, i, a) => a.indexOf(v) === i) || [];
    const where: any = {
        isActive: true,
        startsAt: { lte: now },
        endsAt: { gte: now }
    };
    if (productIds.length || categoryIds.length) {
        const ors: any[] = [];
        if (productIds.length) ors.push({ products: { some: { productId: { in: productIds } } } });
        if (categoryIds.length) ors.push({ categories: { some: { categoryId: { in: categoryIds } } } });
        // Reason: Limit to promotions touching at least one of the relevant products OR categories for efficiency.
        where.OR = ors;
    }
    return prisma.promotion.findMany({
        where,
        select: {
            id: true,
            name: true,
            discountType: true,
            discountValue: true,
            priority: true,
            products: { select: { productId: true } },
            categories: { select: { categoryId: true } }
        },
        orderBy: [{ priority: 'asc' }, { startsAt: 'desc' }]
    }) as any;
}
