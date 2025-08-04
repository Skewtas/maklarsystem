# Test ElevenLabs TTS

För att testa om ElevenLabs fungerar korrekt, använd work-completion-summary agenten:

```
Använd work-completion-summary agenten för att säga: "Hooks-systemet är nu konfigurerat och klart. Nästa steg är att testa alla funktioner."
```

Eller direkt med MCP:

```
Använd mcp__ElevenLabs__text_to_speech för att säga "Hej Rani, ElevenLabs fungerar perfekt!" på svenska
```

## Felsökning

Om det inte fungerar:

1. Kontrollera att ElevenLabs API-nyckeln är giltig
2. Se till att `uvx` är installerat (del av Astral UV)
3. Kontrollera MCP-serverloggar: `claude --mcp-debug`

## Alternativ röst-ID:n

Nuvarande: "WejK3H1m7MI9CHnIjW9K" 

Andra alternativ från ElevenLabs:
- Svenska röster finns tillgängliga
- Använd `mcp__ElevenLabs__search_voices` för att hitta fler