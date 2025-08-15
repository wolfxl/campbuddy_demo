"""
State management for the camp chatbot
"""
import json
from typing import Dict, Any, List

class StateManager:
    def __init__(self):
        self.state = self._initialize_state()
    
    def _initialize_state(self) -> Dict[str, Any]:
        """Initialize empty state structure"""
        return {
            # Basic User Info
            "child_name": "",
            "child_age": None,
            "grade_level": "",
            
            # Preferences
            "preferred_activities": [],
            "budget_range": "",
            "location_preference": "",
            
            # Scheduling
            "scheduling": {
                "available_dates": [],
                "blackout_dates": [],
                "preferred_time_slots": []
            },
            
            # Session Context
            "session_context": {
                "current_search_phase": "exploring",
                "camps_being_considered": [],
                "camps_ruled_out": [],
                "questions_asked": []
            }
        }
    
    def update_state(self, state_updates: Dict[str, Any]) -> None:
        """Update state with new information from LLM response"""
        if not state_updates:
            return
            
        for key, value in state_updates.items():
            if key in self.state:
                if isinstance(self.state[key], dict) and isinstance(value, dict):
                    # Handle nested dictionaries (like scheduling, session_context)
                    self._update_nested_dict(self.state[key], value)
                elif isinstance(self.state[key], list) and isinstance(value, list):
                    # Handle lists - merge unique items
                    self._update_list(self.state[key], value)
                else:
                    # Direct assignment for simple values
                    if value is not None and value != "":
                        self.state[key] = value
    
    def _update_nested_dict(self, current_dict: Dict, updates: Dict) -> None:
        """Update nested dictionary structures"""
        for key, value in updates.items():
            if key in current_dict:
                if isinstance(current_dict[key], list) and isinstance(value, list):
                    self._update_list(current_dict[key], value)
                else:
                    if value is not None and value != "":
                        current_dict[key] = value
    
    def _update_list(self, current_list: List, new_items: List) -> None:
        """Add new unique items to list"""
        for item in new_items:
            if item and item not in current_list:
                current_list.append(item)
    
    def get_state(self) -> Dict[str, Any]:
        """Get current state"""
        return self.state.copy()
    
    def get_compact_state(self) -> Dict[str, Any]:
        """Get state with only non-empty values for efficient prompting"""
        def is_empty(value):
            if value is None or value == "":
                return True
            if isinstance(value, list) and len(value) == 0:
                return True
            if isinstance(value, dict):
                return all(is_empty(v) for v in value.values())
            return False
        
        compact = {}
        for key, value in self.state.items():
            if not is_empty(value):
                if isinstance(value, dict):
                    nested_compact = {k: v for k, v in value.items() if not is_empty(v)}
                    if nested_compact:
                        compact[key] = nested_compact
                else:
                    compact[key] = value
        
        return compact
    
    def reset_state(self) -> None:
        """Reset state to initial empty state"""
        self.state = self._initialize_state()
    
    def get_state_summary(self) -> str:
        """Get a human-readable summary of current state"""
        compact = self.get_compact_state()
        if not compact:
            return "No information collected yet."
        
        summary_parts = []
        
        # Basic info
        if compact.get('child_name') or compact.get('child_age'):
            basic = f"Child: {compact.get('child_name', 'Unknown')}"
            if compact.get('child_age'):
                basic += f", age {compact['child_age']}"
            if compact.get('grade_level'):
                basic += f", {compact['grade_level']} grade"
            summary_parts.append(basic)
        
        # Preferences
        prefs = []
        if compact.get('preferred_activities'):
            prefs.append(f"Activities: {', '.join(compact['preferred_activities'])}")
        if compact.get('budget_range'):
            prefs.append(f"Budget: {compact['budget_range']}")
        if compact.get('location_preference'):
            prefs.append(f"Location: {compact['location_preference']}")
        if prefs:
            summary_parts.append(" | ".join(prefs))
        
        # Session context
        if compact.get('session_context', {}).get('camps_being_considered'):
            camps = compact['session_context']['camps_being_considered']
            summary_parts.append(f"Considering: {', '.join(camps)}")
        
        return " | ".join(summary_parts)
