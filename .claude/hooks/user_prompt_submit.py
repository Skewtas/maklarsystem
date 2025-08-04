#!/usr/bin/env python3

import json
import os
import sys
from pathlib import Path
from datetime import datetime

# Svenska fastighetstermer för kontext
SWEDISH_REAL_ESTATE_CONTEXT = """
📍 Svenska fastighetskontext:
- Objekt = Property/Listing
- Kontakter = Contacts (säljare/köpare/spekulant)
- Visning = Showing/Open house
- Bud = Bid/Offer
- Mäklare = Real estate agent
- Uppdrag = Assignment/Mandate
- Tillträde = Closing/Move-in date
"""

# Farliga promptmönster
DANGEROUS_PROMPTS = [
    "delete all",
    "drop database",
    "remove everything",
    "wipe clean",
    "factory reset"
]

def should_add_context(prompt):
    """Determine if we should add Swedish real estate context."""
    keywords = ['objekt', 'kontakt', 'visning', 'bud', 'mäklare', 
                'property', 'listing', 'showing', 'real estate']
    return any(keyword in prompt.lower() for keyword in keywords)

def validate_prompt(prompt):
    """Validate prompt for dangerous patterns."""
    prompt_lower = prompt.lower()
    for pattern in DANGEROUS_PROMPTS:
        if pattern in prompt_lower:
            return False, f"Potentially dangerous prompt pattern: {pattern}"
    return True, None

def log_prompt(session_id, prompt, blocked=False, reason=None):
    """Log user prompt."""
    log_dir = Path("logs")
    log_dir.mkdir(parents=True, exist_ok=True)
    log_file = log_dir / 'user_prompt_submit.json'
    
    # Read existing log data
    if log_file.exists():
        with open(log_file, 'r') as f:
            try:
                log_data = json.load(f)
            except:
                log_data = []
    else:
        log_data = []
    
    # Create log entry
    log_entry = {
        "timestamp": datetime.now().isoformat(),
        "session_id": session_id,
        "prompt": prompt,
        "blocked": blocked,
        "reason": reason
    }
    
    log_data.append(log_entry)
    
    # Write log
    with open(log_file, 'w') as f:
        json.dump(log_data, f, indent=2)

def main():
    # Parse command line arguments
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument('--log-only', action='store_true', help='Only log, no validation')
    parser.add_argument('--validate', action='store_true', help='Enable validation')
    parser.add_argument('--context', action='store_true', help='Add project context')
    args = parser.parse_args()
    
    # Read input from stdin
    try:
        input_data = json.load(sys.stdin)
    except:
        print("Failed to parse input JSON", file=sys.stderr)
        sys.exit(1)
    
    session_id = input_data.get('session_id', 'unknown')
    prompt = input_data.get('prompt', '')
    
    # Validate if enabled
    if args.validate:
        is_valid, reason = validate_prompt(prompt)
        if not is_valid:
            log_prompt(session_id, prompt, blocked=True, reason=reason)
            print(f"⚠️  {reason}", file=sys.stderr)
            print("Please rephrase your request more specifically.", file=sys.stderr)
            sys.exit(2)  # Block the prompt
    
    # Log the prompt
    log_prompt(session_id, prompt, blocked=False)
    
    # Add context if appropriate
    if args.context or should_add_context(prompt):
        print(SWEDISH_REAL_ESTATE_CONTEXT)
        print(f"Timestamp: {datetime.now().isoformat()}")
        print("---")
    
    # Check for Task Master integration
    if "task" in prompt.lower() or "uppgift" in prompt.lower():
        print("💡 Tip: Use 'task-master next' to see next task")
    
    sys.exit(0)

if __name__ == "__main__":
    main()