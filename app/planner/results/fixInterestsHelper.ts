// Fix for interests in planner form data
export function fixInterestsInFormData(formData: any) {
  const childSampleInterests = [
    { name: "Acting & Voice Performance", strength: "love" },
    { name: "Game Development with Unity", strength: "love" },
    { name: "Performing & Literary Arts", strength: "like" }
  ];
  
  // Check if interests are missing or empty
  if (formData && formData.children && Array.isArray(formData.children)) {
    formData.children.forEach((child: any, index: number) => {
      // If interests is missing or empty, add default interests
      if (!child.interests || !Array.isArray(child.interests) || child.interests.length === 0) {
        console.log(`[PlannerLogs] Child ${index + 1} (${child.name || 'unknown'}) has no interests. Adding sample interests.`);
        child.interests = [...childSampleInterests]; // Clone to avoid reference issues
      }
    });
  }
  
  return formData;
}

/**
 * Usage in your page.tsx:
 * 
 * // Import this function
 * import { fixInterestsInFormData } from './fixInterestsHelper';
 * 
 * // Use it when loading form data
 * const savedFormData = sessionStorage.getItem('plannerFormData');
 * if (savedFormData) {
 *   let parsedFormData = JSON.parse(savedFormData);
 *   parsedFormData = fixInterestsInFormData(parsedFormData);
 *   // Continue with the fixed form data
 * }
 */