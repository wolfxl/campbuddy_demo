# CampBuddy Planner Module Improvements

This README explains the recent changes to the CampBuddy planner module, specifically focused on:

1. Using real data from the API instead of mock data
2. Adding interest-strength based scoring (loves/likes/wants to try)
3. Filtering camps by interests to improve performance

## Major Changes

### 1. API Endpoint

Created a new `/api/camps` endpoint that properly filters camps by interests. This is critical for performance optimization by reducing the number of camps that need to be scored.

### 2. Interest-Strength Based Scoring

Updated the scoring algorithm to use different multipliers based on the strength of interests:
- "love" interests: 1.5x multiplier
- "like" interests: 1.2x multiplier
- "wants to try" interests: 1.0x multiplier (base score)

This ensures that camps matching a child's favorite activities are prioritized.

### 3. Modular Architecture

Refactored the `ClientScheduleOptimizer` into smaller, more manageable modules:
- Scoring engine
- Matching utilities
- Filter utilities

This makes the code easier to maintain and extend in the future.

## How to Use

### Filtering Camps by Interests

Use the `fetchCampsWithInterests` function to get camps filtered by interests:

```javascript
// Inside your component's loadData function
try {
  // Extract interests from all children
  const filteredCamps = await fetchCampsWithInterests(parsedFormData);
  console.log(`Fetched ${filteredCamps.length} camps matching interests`);
  
  // Pass these filtered camps to the optimizer
  const optimizer = new ClientScheduleOptimizer(
    parsedFormData,
    filteredCamps,
    [], // Sessions will be loaded by the optimizer as needed
    true // Use real data
  );
  
  // Generate schedule options
  const options = await optimizer.generateScheduleOptions();
} catch (error) {
  console.error('Error fetching camps:', error);
}
```

### Match Reasons Display

The match reasons now include more specific details about interest matching:
- "Matches X LOVED interests: [list]"
- "Matches X liked interests: [list]"
- "Opportunity to try X new interests: [list]"

This provides better transparency to users about why certain camps were recommended.

## Debugging

The code includes detailed logging for debugging purposes. These logs provide insights into:
- How many camps were fetched from the API
- Which interests were used for filtering
- Camp scoring details, including interest-strength multipliers
- Why certain camps were chosen for each child/week

You can search for logs tagged with `[PlannerLogs]` in the console to track the planning process.

## Important Note

Mock data has been completely removed as requested. The system now relies entirely on real data from the API. Make sure your API is properly configured and returning the expected data structure.