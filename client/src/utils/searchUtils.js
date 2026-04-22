// Search utility functions for restaurants and dishes

export const searchRestaurants = (restaurants, query) => {
  if (!query || !restaurants) return [];
  
  const searchTerm = query.toLowerCase().trim();
  
  return restaurants.filter(restaurant => {
    const info = restaurant.info || {};
    
    // Search in restaurant name
    const nameMatch = info.name?.toLowerCase().includes(searchTerm);
    
    // Search in cuisines
    const cuisineMatch = info.cuisines?.some(cuisine => 
      cuisine.toLowerCase().includes(searchTerm)
    );
    
    // Search in area name
    const areaMatch = info.areaName?.toLowerCase().includes(searchTerm);
    
    // Search in locality
    const localityMatch = info.locality?.toLowerCase().includes(searchTerm);
    
    return nameMatch || cuisineMatch || areaMatch || localityMatch;
  });
};

export const generateSearchSuggestions = (restaurants, query) => {
  if (!query || !restaurants) return [];
  
  const searchTerm = query.toLowerCase().trim();
  const suggestions = new Set();
  
  restaurants.forEach(restaurant => {
    const info = restaurant.info || {};
    
    // Add restaurant name suggestions
    if (info.name?.toLowerCase().includes(searchTerm)) {
      suggestions.add({
        type: 'restaurant',
        text: info.name,
        subTitle: info.cuisines?.slice(0, 2).join(', '),
        id: info.id
      });
    }
    
    // Add cuisine suggestions
    info.cuisines?.forEach(cuisine => {
      if (cuisine.toLowerCase().includes(searchTerm)) {
        suggestions.add({
          type: 'cuisine',
          text: cuisine,
          subTitle: 'Cuisine',
          id: `cuisine_${cuisine}`
        });
      }
    });
    
    // Add area suggestions
    if (info.areaName?.toLowerCase().includes(searchTerm)) {
      suggestions.add({
        type: 'area',
        text: info.areaName,
        subTitle: 'Area',
        id: `area_${info.areaName}`
      });
    }
  });
  
  return Array.from(suggestions).slice(0, 10);
};

export const getPopularSearches = () => {
  return [
    { text: 'Pizza', type: 'cuisine' },
    { text: 'Burger', type: 'cuisine' },
    { text: 'Biryani', type: 'cuisine' },
    { text: 'Chinese', type: 'cuisine' },
    { text: 'South Indian', type: 'cuisine' },
    { text: 'North Indian', type: 'cuisine' },
    { text: 'Desserts', type: 'cuisine' },
    { text: 'Ice Cream', type: 'cuisine' }
  ];
};

export const searchByCategory = (restaurants, category) => {
  if (!category || !restaurants) return [];
  
  const categoryLower = category.toLowerCase();
  
  return restaurants.filter(restaurant => {
    const info = restaurant.info || {};
    return info.cuisines?.some(cuisine => 
      cuisine.toLowerCase().includes(categoryLower)
    );
  });
};
