# Supabase MCP Full Access Configuration

## Steg för att aktivera full access i Supabase MCP

### 1. Hitta din MCP konfigurationsfil
MCP konfigurationen finns vanligtvis i:
- macOS: `~/Library/Application Support/Claude/mcp.json`
- Windows: `%APPDATA%\Claude\mcp.json`
- Linux: `~/.config/claude/mcp.json`

### 2. Uppdatera Supabase MCP konfigurationen

Öppna din `mcp.json` fil och uppdatera Supabase MCP server konfigurationen:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "@supabase/mcp@latest"
      ],
      "env": {
        "SUPABASE_URL": "https://kwxxpypgtdfimmxnipaz.supabase.co",
        "SUPABASE_SERVICE_ROLE_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3eHhweXBndGRmaW1teG5pcGF6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDc4MzU0NiwiZXhwIjoyMDcwMzU5NTQ2fQ.RGnKLFklW3DttV7htZ-vylXorg-JUxNWQhTNb9rcbRs",
        "SUPABASE_READ_ONLY": "false"
      }
    }
  }
}
```

### Viktigt: 
- Sätt `SUPABASE_READ_ONLY` till `"false"` för att aktivera write access
- Använd `SUPABASE_SERVICE_ROLE_KEY` istället för ANON key för full access
- Service role key finns i din `.env.local` fil

### 3. Starta om Claude Code

Efter att du uppdaterat konfigurationen:
1. Stäng Claude Code helt
2. Öppna Claude Code igen
3. MCP servern kommer automatiskt starta med de nya inställningarna

### 4. Verifiera att det fungerar

När Claude Code har startats om, kan vi testa att skapa user profiles direkt via MCP.

## Säkerhetsnotering

⚠️ **Viktigt**: Service role key ger full access till din databas och bypass:ar alla RLS policies. 
- Använd detta endast i utvecklingsmiljö
- Dela aldrig service role key publikt
- Överväg att skapa en separat utvecklingsdatabas för testning