export const CATEGORIES = [
  {
    label: 'צלחות',
    slug: 'plates',
    title: 'צלחות הגשה ואירוח',
    description: 'צלחות הגשה, קעריות וסטים לשולחן',
    image: '/images/categories/plates.png',
  },
  {
    label: 'כוסות',
    slug: 'glasses',
    title: 'כוסות וכלי זכוכית',
    description: 'כוסות יין, מים וכלי זכוכית מעוצבים',
    image:
      'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=900&q=80',
  },
  {
    label: 'סכו״ם',
    slug: 'cutlery',
    title: 'סכו״ם וכלי שרת',
    description: 'סטים, כלי שרת וכפות הגשה',
    image: '/images/categories/cutlery.png',
  },
  {
    label: 'מפות',
    slug: 'tablecloths',
    title: 'מפות ואביזרי טקסטיל',
    description: 'מפות, מפיות ופלייסמנטים',
    image: '/images/categories/tablecloths.png',
  },
];

export function getCategoryBySlug(slug) {
  return CATEGORIES.find((category) => category.slug === slug);
}
