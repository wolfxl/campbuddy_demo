"""
CSV data handler for camp information
"""
import pandas as pd
import json
from typing import Dict, Any
import os

class CSVHandler:
    def __init__(self, csv_file_path: str):
        self.csv_file_path = csv_file_path
        self.csv_data = None
        self.csv_json = None
        self.load_csv()
    
    def load_csv(self) -> None:
        """Load CSV file and convert to JSON format"""
        try:
            if not os.path.exists(self.csv_file_path):
                print(f"Warning: CSV file '{self.csv_file_path}' not found. Creating sample file...")
                self._create_sample_csv()
            
            # Load CSV
            self.csv_data = pd.read_csv(self.csv_file_path)
            
            # Clean data
            self.csv_data = self.csv_data.fillna('')  # Replace NaN with empty strings
            
            # Convert to JSON format for LLM
            self.csv_json = self.csv_data.to_dict('records')
            
            print(f"Successfully loaded {len(self.csv_data)} camps from CSV")
            
        except Exception as e:
            print(f"Error loading CSV: {e}")
            self._create_sample_csv()
            self.load_csv()  # Retry with sample data
    
    def _create_sample_csv(self) -> None:
        """Create sample CSV data if file doesn't exist"""
        sample_data = [
            {
                'camp_id': 'CAMP001',
                'camp_name': 'Adventure Arts Camp',
                'activities': 'arts and crafts, painting, sculpture, nature walks',
                'age_range': '6-12',
                'location': 'Austin, TX',
                'price_per_week': 350,
                'duration_weeks': '1-4 weeks available',
                'time_slots': 'Full day (9am-4pm)',
                'available_dates': 'June 1-Aug 15',
                'special_features': 'Art shows, nature integration, small class sizes',
                'requirements': 'None'
            },
            {
                'camp_id': 'CAMP002',
                'camp_name': 'Splash & Swim Academy',
                'activities': 'swimming, water safety, diving, water games',
                'age_range': '5-14',
                'location': 'Dallas, TX',
                'price_per_week': 275,
                'duration_weeks': '1-8 weeks available',
                'time_slots': 'Half day AM (9am-12pm), Half day PM (1pm-4pm)',
                'available_dates': 'May 15-Aug 30',
                'special_features': 'Certified instructors, swim competitions, safety focus',
                'requirements': 'Basic swimming ability preferred'
            },
            {
                'camp_id': 'CAMP003',
                'camp_name': 'Creative Splash Camp',
                'activities': 'swimming, arts and crafts, painting, pottery',
                'age_range': '6-10',
                'location': 'Frisco, TX',
                'price_per_week': 425,
                'duration_weeks': '1-6 weeks available',
                'time_slots': 'Full day (8am-5pm)',
                'available_dates': 'June 15-Aug 1',
                'special_features': 'Art and swim combination, weekly art shows, certified swim instructors',
                'requirements': 'None'
            },
            {
                'camp_id': 'CAMP004',
                'camp_name': 'Tech Innovators Camp',
                'activities': 'coding, robotics, 3D printing, game design',
                'age_range': '8-16',
                'location': 'Plano, TX',
                'price_per_week': 450,
                'duration_weeks': '1-4 weeks available',
                'time_slots': 'Full day (9am-4pm)',
                'available_dates': 'June 1-July 31',
                'special_features': 'Take home projects, tech showcase, industry mentors',
                'requirements': 'Basic computer skills helpful'
            },
            {
                'camp_id': 'CAMP005',
                'camp_name': 'Sports Champions Camp',
                'activities': 'soccer, basketball, tennis, track and field',
                'age_range': '7-15',
                'location': 'Houston, TX',
                'price_per_week': 300,
                'duration_weeks': '1-10 weeks available',
                'time_slots': 'Full day (8am-5pm), Half day AM (8am-12pm)',
                'available_dates': 'May 20-Aug 20',
                'special_features': 'Professional coaches, tournaments, fitness tracking',
                'requirements': 'Medical clearance required'
            },
            {
                'camp_id': 'CAMP006',
                'camp_name': 'Dance Dynamics Studio',
                'activities': 'ballet, jazz, hip-hop, contemporary dance, choreography',
                'age_range': '4-16',
                'location': 'Frisco, TX',
                'price_per_week': 380,
                'duration_weeks': '1-8 weeks available',
                'time_slots': 'Full day (9am-4pm), Half day AM (9am-12pm)',
                'available_dates': 'June 10-Aug 10',
                'special_features': 'End-of-session performance, professional instructors, multiple dance styles',
                'requirements': 'Comfortable dance attire required'
            },
            {
                'camp_id': 'CAMP007',
                'camp_name': 'Rhythm & Movement Academy',
                'activities': 'creative movement, musical theater, dance improvisation, rhythm games',
                'age_range': '3-8',
                'location': 'Allen, TX',
                'price_per_week': 320,
                'duration_weeks': '1-6 weeks available',
                'time_slots': 'Half day AM (9am-12pm), Half day PM (1pm-4pm)',
                'available_dates': 'June 5-July 30',
                'special_features': 'Age-appropriate movement, confidence building, creative expression',
                'requirements': 'None'
            },
            {
                'camp_id': 'CAMP008',
                'camp_name': 'Elite Dance Intensive',
                'activities': 'advanced ballet, modern dance, dance composition, performance training',
                'age_range': '10-18',
                'location': 'Dallas, TX',
                'price_per_week': 520,
                'duration_weeks': '2-4 weeks available',
                'time_slots': 'Full day intensive (8am-5pm)',
                'available_dates': 'July 1-Aug 15',
                'special_features': 'Master classes, guest choreographers, college prep focus',
                'requirements': '2+ years dance experience required'
            }
        ]
        
        # Create DataFrame and save to CSV
        df = pd.DataFrame(sample_data)
        df.to_csv(self.csv_file_path, index=False)
        print(f"Created sample CSV file: {self.csv_file_path}")
    
    def get_csv_as_json_string(self) -> str:
        """Get CSV data formatted as JSON string for LLM prompt"""
        if self.csv_json is None:
            return "No camp data available"
        
        return json.dumps(self.csv_json, indent=2)
    
    def get_csv_summary(self) -> str:
        """Get a summary of the CSV data"""
        if self.csv_data is None:
            return "No data loaded"
        
        return f"""
        CSV Summary:
        - Total camps: {len(self.csv_data)}
        - Columns: {', '.join(self.csv_data.columns.tolist())}
        - Data loaded successfully
        """
    
    def reload_csv(self) -> None:
        """Reload CSV data (useful if file is updated)"""
        self.load_csv()
    
    def search_camps(self, query: str) -> Dict[str, Any]:
        """Simple search functionality (for debugging/testing)"""
        if self.csv_data is None:
            return {"error": "No data loaded"}
        
        # Simple text search across all columns
        mask = self.csv_data.astype(str).apply(
            lambda x: x.str.contains(query, case=False, na=False)
        ).any(axis=1)
        
        results = self.csv_data[mask]
        return {
            "query": query,
            "results_count": len(results),
            "results": results.to_dict('records')
        }
