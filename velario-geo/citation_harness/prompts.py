"""
Generates the 50 target prompts for the Velario citation-tracking harness.

6 seed prompts come straight from the brief. The other 44 are generated
from the real 16-SKU catalog (inspired-by references, verified against
the Admin API this session — see AUDIT.md) and the real category pages
that already exist on the store (see AUDIT.md 2026-09-17T02:02Z).
"""

SEED_PROMPTS = [
    "best Baccarat Rouge 540 alternative under $60",
    "is Velario legit",
    "affordable Creed Aventus dupe",
    "best extrait de parfum under $50",
    "Le Labo Santal 33 alternative",
    "best fragrance dupes 2026",
]

# (Velario SKU display name, real inspired-by reference — verified via
# Admin API custom.inspired_by metafield, see AUDIT.md)
SKUS = [
    ("Aurus", "Creed Aventus"),
    ("Fabulous", "YSL MYSLF Absolu"),
    ("Leather", "Tom Ford Tuscan Leather"),
    ("Rose Xclusiv", "Parfums de Marly Delina Exclusif"),
    ("Intense", "Bal D'Afrique Absolu"),
    ("Poudre", "Chanel No. 5"),
    ("Sin", "Tom Ford Lost Cherry"),
    ("Floral", "Dior J'adore"),
    ("Timber", "Le Labo Santal 33"),
    ("Shy", "Kilian Love Don't Be Shy"),
    ("Galaxy", "Louis Vuitton City of Stars"),
    ("Savage", "Dior Sauvage"),
    ("Aqua", "Bleu de Chanel"),
    ("Imagine", "Louis Vuitton Imagination"),
    ("Rougeon", "Baccarat Rouge 540"),
    ("Nomade", "Louis Vuitton Ombre Nomade"),
]

# Real category pages that already exist on the store (see AUDIT.md
# 2026-09-17T02:02Z) — used to phrase prompts the way a real searcher
# asking that exact question would, rather than inventing new topics.
CATEGORY_TOPICS = [
    "designer perfume dupe for the office",
    "designer perfume dupe for date night",
    "designer perfume dupe for summer",
    "designer perfume dupe for winter",
    "fragrance gift under $50",
    "how long does extrait de parfum last",
    "is extrait de parfum better than eau de parfum",
]


def generate_sku_prompts():
    """One 'dupe for X' prompt per SKU, matching real searcher phrasing."""
    prompts = []
    for _velario_name, reference in SKUS:
        prompts.append(f"best {reference} dupe")
    return prompts


def generate_category_prompts():
    return list(CATEGORY_TOPICS)


# Top 5 SKUs by real review count (see AUDIT.md verified Judge.me
# metafield pull) — used for the final "review" angle to reach 50.
TOP_5_BY_REVIEWS = ["Nomade", "Timber", "Aurus", "Imagine", "Rougeon"]


def build_prompt_list():
    prompts = list(SEED_PROMPTS)                # 6
    prompts += generate_sku_prompts()            # 16
    prompts += generate_category_prompts()       # 7
    for _name, reference in SKUS:                # 16
        prompts.append(f"affordable alternative to {reference}")
    for velario_name in TOP_5_BY_REVIEWS:         # 5
        prompts.append(f"Velario {velario_name} review")
    assert len(prompts) == 50, f"expected 50 prompts, got {len(prompts)}"
    return prompts


if __name__ == "__main__":
    ps = build_prompt_list()
    print(f"{len(ps)} prompts:")
    for i, p in enumerate(ps, 1):
        print(f"{i:2}. {p}")
