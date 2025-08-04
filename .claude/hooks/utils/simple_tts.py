#!/usr/bin/env python3

import os
import sys
import subprocess
from datetime import datetime

def text_to_speech_mac(text, output_file=None):
    """Use macOS built-in 'say' command for TTS."""
    try:
        if output_file:
            # Save to file
            subprocess.run(['say', '-o', output_file, text], check=True)
            print(f"Audio saved to: {output_file}")
        else:
            # Just speak
            subprocess.run(['say', text], check=True)
        return True
    except subprocess.CalledProcessError:
        print("Failed to generate speech", file=sys.stderr)
        return False
    except FileNotFoundError:
        print("'say' command not found - are you on macOS?", file=sys.stderr)
        return False

def main():
    if len(sys.argv) < 2:
        print("Usage: simple_tts.py 'text to speak' [output_file]")
        sys.exit(1)
    
    text = sys.argv[1]
    output_file = sys.argv[2] if len(sys.argv) > 2 else None
    
    if text_to_speech_mac(text, output_file):
        sys.exit(0)
    else:
        sys.exit(1)

if __name__ == "__main__":
    main()