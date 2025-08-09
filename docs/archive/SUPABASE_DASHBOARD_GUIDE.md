# Steg-för-steg Guide: Navigera Supabase Dashboard

## 🚀 Snabbstart

1. **Öppna Supabase Dashboard**: https://supabase.com/dashboard
2. **Logga in** med dina credentials
3. **Välj projekt**: Klicka på ditt projekt (maklarsystem)

## 📍 Navigation i Dashboard

```
┌─────────────────────────────────────────────────────────┐
│  Supabase Dashboard                                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  🏠 Home         ┌────────────────────────────────┐    │
│  📊 Table Editor │                                │    │
│  🔒 Auth        │     Din SQL kommer här         │    │
│  💾 Storage     │                                │    │
│  📝 SQL Editor  │  [Run] [Save] [History]       │    │
│  ⚡ Functions    └────────────────────────────────┘    │
│  🔄 Realtime                                           │
│  ⚙️  Settings                                          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## 🔧 Steg 1: Gå till SQL Editor

1. **Klicka på "SQL Editor"** i vänstra sidomenyn (📝 ikonen)
2. Du kommer se:
   - En lista med "Quick scripts" till vänster
   - Ett tomt SQL-fönster i mitten
   - "Run" knapp längst ner till höger

## 📝 Steg 2: Skapa ny SQL Query

```
┌─────────────────────────────────────────────────────────┐
│  SQL Editor                                             │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Quick scripts:        │  New query                    │
│  ├─ Auth              │  ┌─────────────────────────┐  │
│  ├─ Storage           │  │ -- Klistra in           │  │
│  └─ Functions         │  │ -- FINAL_AUTH_FIX.sql   │  │
│                       │  │ -- här                  │  │
│  [+ New query]        │  └─────────────────────────┘  │
│                       │                               │
│                       │  [▶ Run] [💾 Save]          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Instruktioner:
1. Klicka på **"+ New query"** knappen
2. Ge din query ett namn: "Fix Auth Permissions"
3. **Kopiera hela innehållet** från `FINAL_AUTH_FIX.sql`
4. **Klistra in** i SQL-editorn

## ▶️ Steg 3: Kör SQL Script

1. **Klicka på "Run"** knappen (▶️) eller tryck `Cmd+Enter` (Mac) / `Ctrl+Enter` (Windows)
2. Vänta på resultat...

### Förväntade resultat:

#### ✅ Success scenario:
```
Success. No rows returned
Query 1: Success. No rows affected
Query 2: Success. Function created
...
=== VERIFIERING ===
NOTICE: Användare i auth.users: 4
NOTICE: Användare i public.users: 4
NOTICE: SUCCESS! Rani finns i båda tabellerna.

table_name    | id    | email                    | email_bekräftad | skapad
--------------|-------|--------------------------|-----------------|--------
auth.users    | c65...| rani.shakir@hotmail.com | Ja              | 2025-01-29
public.users  | c65...| rani.shakir@hotmail.com | Rani Shakir     | 2025-01-29
```

#### ❌ Error scenario:
```
ERROR: permission denied for schema auth
```
Om du får detta fel, kontakta Supabase support eller din databas-admin.

## 🔍 Steg 4: Verifiera i Authentication

1. Gå till **"Authentication"** i sidomenyn (🔒 ikonen)
2. Klicka på **"Users"** fliken
3. Sök efter: `rani.shakir@hotmail.com`

```
┌─────────────────────────────────────────────────────────┐
│  Authentication > Users                                 │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  🔍 Search users...                                    │
│                                                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │ Email                    │ Created   │ Actions   │  │
│  ├─────────────────────────────────────────────────┤  │
│  │ rani.shakir@hotmail.com │ Jan 29    │ [···]    │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Åtgärder på användare:
1. Klicka på **[···]** menyn
2. Välj **"Send recovery email"** eller **"Reset password"**
3. Om du väljer "Reset password", sätt: `Test123!`

## 🧪 Steg 5: Testa i Table Editor

1. Gå till **"Table Editor"** (📊 ikonen)
2. Välj **"users"** tabellen
3. Kontrollera att Rani finns där

```
┌─────────────────────────────────────────────────────────┐
│  Table Editor > users                                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  public.users                                          │
│  ┌─────────────────────────────────────────────────┐  │
│  │ id  │ email                   │ full_name      │  │
│  ├─────────────────────────────────────────────────┤  │
│  │ c65 │ rani.shakir@hotmail.com│ Rani Shakir    │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## 🚨 Felsökning

### Problem: "permission denied for schema auth"

**Lösning A**: Kontakta Supabase Support
1. Gå till **Settings** ⚙️
2. Klicka på **Support**
3. Skapa en ticket: "Need help with auth trigger permissions"

**Lösning B**: Använd Database Settings
1. Gå till **Settings** > **Database**
2. Under "Connection string", hitta postgres URL
3. Använd en extern SQL-klient (TablePlus, pgAdmin) med postgres-användaren

### Problem: Användaren syns inte i public.users

Kör detta i SQL Editor:
```sql
-- Manuell synkronisering
INSERT INTO public.users (id, email, full_name, role)
SELECT id, email, email, 'maklare'::user_role
FROM auth.users
WHERE email = 'rani.shakir@hotmail.com'
ON CONFLICT (id) DO NOTHING;
```

## ✅ Bekräfta att allt fungerar

1. **I terminalen**:
```bash
cd /Users/ranishakir/Maklarsystem/maklarsystem
npm run dev
```

2. **I webbläsaren**:
   - Gå till: http://localhost:3000/login
   - Email: `rani.shakir@hotmail.com`
   - Lösenord: `Test123!`

3. **Förväntad resultat**:
   - Inloggning lyckas
   - Omdirigeras till dashboard
   - Inga felmeddelanden

## 📋 Checklista

- [ ] SQL script körd utan fel
- [ ] Användare syns i Authentication > Users
- [ ] Användare syns i Table Editor > users
- [ ] Inloggning fungerar i appen
- [ ] Inga error i browser console

## 🆘 Support

Om något inte fungerar:
1. Kolla browser console (F12) för fel
2. Kolla Supabase logs: **Settings** > **Logs** > **API logs**
3. Kontakta Supabase support med:
   - Project ID
   - Error messages
   - Detta SQL script