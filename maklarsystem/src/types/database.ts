export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: 'admin' | 'maklare' | 'koordinator' | 'assistent'
          avatar_url: string | null
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name?: string | null
          role?: 'admin' | 'maklare' | 'koordinator' | 'assistent'
          avatar_url?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: 'admin' | 'maklare' | 'koordinator' | 'assistent'
          avatar_url?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      objekt: {
        Row: {
          id: string
          objektnummer: string
          typ: 'villa' | 'lagenhet' | 'radhus' | 'fritidshus' | 'tomt'
          status: 'kundbearbetning' | 'uppdrag' | 'till_salu' | 'sald' | 'tilltraden'
          adress: string
          postnummer: string
          ort: string
          kommun: string
          lan: string
          utgangspris: number | null
          slutpris: number | null
          boarea: number | null
          biarea: number | null
          tomtarea: number | null
          rum: number | null
          byggaar: number | null
          maklare_id: string
          saljare_id: string | null
          kopare_id: string | null
          beskrivning: string | null
          
          // Ownership and classification
          agare_id: string | null
          agare_typ: 'privatperson' | 'foretag' | 'kommun' | 'stat' | null
          agandekategori: 'agt' | 'bostadsratt' | 'hyresratt' | 'arrende' | null
          
          // Enhanced pricing and bidding
          accepterat_pris: number | null
          budgivning: boolean | null
          budgivningsdatum: string | null
          pristyp: 'fast' | 'forhandling' | 'budgivning' | null
          prisutveckling: string | null
          
          // Detailed monthly fees and costs
          manadsavgift: number | null
          avgift_innefattar: string | null
          kapitaltillskott: number | null
          energikostnad_per_ar: number | null
          drift_per_kvm: number | null
          
          // Enhanced room layout
          antal_sovrum: number | null
          antal_wc: number | null
          antal_vaningar_hus: number | null
          koksstorlek: number | null
          vardagsrumsstorlek: number | null
          kallare_area: number | null
          garage_area: number | null
          
          // Energy certification
          energiprestanda: number | null
          energicertifikat_nummer: string | null
          energicertifikat_utfardad: string | null
          energicertifikat_giltig_till: string | null
          
          // Enhanced amenities
          vinkallare: boolean | null
          hobbyrum: boolean | null
          carport: boolean | null
          bastu: boolean | null
          antal_parkeringsplatser: number | null
          
          // Enhanced descriptions
          maklartext: string | null
          salutext: string | null
          visningsdagar: string | null
          oppet_hus: string | null
          specialbestammelser: string | null
          anmarkningar: string | null
          
          // What's included/excluded
          tillbehor_som_ingaar: string | null
          tillbehor_som_ej_ingaar: string | null
          
          // Legal aspects
          servitut: string | null
          inskrankning: string | null
          belastningar: string | null
          gemensamhetsanlaggning: string | null
          planerad_renovering: string | null
          
          // Enhanced location data
          latitude: number | null
          longitude: number | null
          
          // Document references
          planritning_url: string | null
          energideklaration_url: string | null
          byggnadsbeskrivning_url: string | null
          
          // Marketing and availability
          marknadsforingstext: string | null
          visningsdagar_detaljer: string | null
          oppet_hus_detaljer: string | null
          
          // Timeline and status tracking
          listningsdatum: string | null
          avtal_datum: string | null
          tilltraden_datum: string | null
          
          // Extended property information (existing)
          balkong_terrass: boolean | null
          hiss: boolean | null
          vaning: number | null
          kok: 'kokso' | 'halvoppet' | 'oppet' | 'kokonk' | 'modernt' | 'renoverat' | 'originalskick' | null
          badrum_antal: number | null
          garage: string | null
          forrad: boolean | null
          tradgard: boolean | null
          pool: boolean | null
          kamin: boolean | null
          // Technical information (existing)
          energiklass: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | null
          byggmaterial: 'tegel' | 'trak' | 'betong' | 'puts' | 'panel' | 'natursten' | 'annat' | null
          uppvarmning: 'fjärrvärme' | 'elvärme' | 'pelletsbrännare' | 'vedeldning' | 'olja' | 'gas' | 'bergvärme' | 'luftvärmepump' | 'annat' | null
          ventilation: 'mekanisk_til_och_franluft' | 'mekanisk_franluft' | 'naturlig' | 'balanserad' | 'frånluft' | null
          elnat: 'trefas' | 'enfas' | 'trefas_16A' | 'trefas_25A' | 'trefas_35A' | null
          isolering: 'mineralull' | 'cellulosa' | 'polyuretan' | 'eps' | 'xps' | 'annat' | null
          elforbrukning: number | null
          vattenforbrukning: number | null
          uppvarmningskostnad: number | null
          // Building and construction (existing)
          bygglov: string | null
          senaste_renovering: string | null
          taktyp: 'tegeltak' | 'platt' | 'betongpannor' | 'sadeltak' | 'mansardtak' | 'pulpettak' | 'annat' | null
          fasadmaterial: 'tegel' | 'puts' | 'trak' | 'panel' | 'natursten' | 'betong' | 'eternit' | 'annat' | null
          fonstertyp: 'treglas' | 'tvaglas' | 'traglas_argon' | 'aluminiumkarmar' | 'trakarmar' | 'plastkarmar' | null
          vatten_avlopp: string | null
          // Security and systems (existing)
          brandskydd: string | null
          larm: string | null
          bredband: 'fiber' | 'adsl' | 'kabel' | 'mobilt' | 'satellit' | 'inte_tillgangligt' | null
          kabel_tv: boolean | null
          internet: string | null
          // Location and environment (existing)
          narmaste_skola: string | null
          narmaste_vardcentral: string | null
          narmaste_dagis: string | null
          avstand_centrum: number | null
          havsnara: boolean | null
          sjonara: boolean | null
          skogsnara: boolean | null
          kollektivtrafik: string | null
          parkering: string | null
          // Extended financial (existing)
          driftkostnad: number | null
          avgift: number | null
          pantbrev: number | null
          taxeringsvarde: number | null
          kommunala_avgifter: number | null
          forsakringskostnad: number | null
          reparationsfond: number | null
          // Availability (existing)
          tillgangsdatum: string | null
          visningsinfo: string | null
          
          // Priority 1 - Essential Fields
          fastighetsbeteckning: string | null
          undertyp: 'parhus' | 'kedjehus' | 'radhus_mellan' | 'radhus_gavelbostad' | 'enplansvilla' | 'tvåplansvilla' | 'souterrangvilla' | 'sluttningshus' | 'atriumhus' | 'funkisvilla' | 'herrgård' | 'torp' | 'sjötomt' | 'skogstomt' | 'åkertomt' | null
          andel_i_forening: number | null
          andelstal: number | null
          virtuell_visning_url: string | null
          
          // Priority 2 - Valuable Fields
          boendekalkyl_url: string | null
          standard_niva: 'hög' | 'mycket_hög' | 'normal' | 'låg' | 'renovering_behövs' | 'totalrenovering_krävs' | null
          tillganglighetsanpassad: boolean | null
          laddbox: boolean | null
          solceller: boolean | null
          solceller_kapacitet_kwp: number | null
          laddbox_typ: '1-fas_3.7kW' | '3-fas_11kW' | '3-fas_22kW' | 'dc_snabbladdare' | null
          laddbox_antal: number | null
          
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          objektnummer?: string
          typ: 'villa' | 'lagenhet' | 'radhus' | 'fritidshus' | 'tomt'
          status?: 'kundbearbetning' | 'uppdrag' | 'till_salu' | 'sald' | 'tilltraden'
          adress: string
          postnummer: string
          ort: string
          kommun: string
          lan: string
          utgangspris?: number | null
          slutpris?: number | null
          boarea?: number | null
          biarea?: number | null
          tomtarea?: number | null
          rum?: number | null
          byggaar?: number | null
          maklare_id: string
          saljare_id?: string | null
          kopare_id?: string | null
          beskrivning?: string | null
          
          // Ownership and classification
          agare_id?: string | null
          agare_typ?: 'privatperson' | 'foretag' | 'kommun' | 'stat' | null
          agandekategori?: 'agt' | 'bostadsratt' | 'hyresratt' | 'arrende' | null
          
          // Enhanced pricing and bidding
          accepterat_pris?: number | null
          budgivning?: boolean | null
          budgivningsdatum?: string | null
          pristyp?: 'fast' | 'forhandling' | 'budgivning' | null
          prisutveckling?: string | null
          
          // Detailed monthly fees and costs
          manadsavgift?: number | null
          avgift_innefattar?: string | null
          kapitaltillskott?: number | null
          energikostnad_per_ar?: number | null
          drift_per_kvm?: number | null
          
          // Enhanced room layout
          antal_sovrum?: number | null
          antal_wc?: number | null
          antal_vaningar_hus?: number | null
          koksstorlek?: number | null
          vardagsrumsstorlek?: number | null
          kallare_area?: number | null
          garage_area?: number | null
          
          // Energy certification
          energiprestanda?: number | null
          energicertifikat_nummer?: string | null
          energicertifikat_utfardad?: string | null
          energicertifikat_giltig_till?: string | null
          
          // Enhanced amenities
          vinkallare?: boolean | null
          hobbyrum?: boolean | null
          carport?: boolean | null
          bastu?: boolean | null
          antal_parkeringsplatser?: number | null
          
          // Enhanced descriptions
          maklartext?: string | null
          salutext?: string | null
          visningsdagar?: string | null
          oppet_hus?: string | null
          specialbestammelser?: string | null
          anmarkningar?: string | null
          
          // What's included/excluded
          tillbehor_som_ingaar?: string | null
          tillbehor_som_ej_ingaar?: string | null
          
          // Legal aspects
          servitut?: string | null
          inskrankning?: string | null
          belastningar?: string | null
          gemensamhetsanlaggning?: string | null
          planerad_renovering?: string | null
          
          // Enhanced location data
          latitude?: number | null
          longitude?: number | null
          
          // Document references
          planritning_url?: string | null
          energideklaration_url?: string | null
          byggnadsbeskrivning_url?: string | null
          
          // Marketing and availability
          marknadsforingstext?: string | null
          visningsdagar_detaljer?: string | null
          oppet_hus_detaljer?: string | null
          
          // Timeline and status tracking
          listningsdatum?: string | null
          avtal_datum?: string | null
          tilltraden_datum?: string | null
          
          // Extended property information (existing)
          balkong_terrass?: boolean | null
          hiss?: boolean | null
          vaning?: number | null
          kok?: 'kokso' | 'halvoppet' | 'oppet' | 'kokonk' | 'modernt' | 'renoverat' | 'originalskick' | null
          badrum_antal?: number | null
          garage?: string | null
          forrad?: boolean | null
          tradgard?: boolean | null
          pool?: boolean | null
          kamin?: boolean | null
          // Technical information (existing)
          energiklass?: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | null
          byggmaterial?: 'tegel' | 'trak' | 'betong' | 'puts' | 'panel' | 'natursten' | 'annat' | null
          uppvarmning?: 'fjärrvärme' | 'elvärme' | 'pelletsbrännare' | 'vedeldning' | 'olja' | 'gas' | 'bergvärme' | 'luftvärmepump' | 'annat' | null
          ventilation?: 'mekanisk_til_och_franluft' | 'mekanisk_franluft' | 'naturlig' | 'balanserad' | 'frånluft' | null
          elnat?: 'trefas' | 'enfas' | 'trefas_16A' | 'trefas_25A' | 'trefas_35A' | null
          isolering?: 'mineralull' | 'cellulosa' | 'polyuretan' | 'eps' | 'xps' | 'annat' | null
          elforbrukning?: number | null
          vattenforbrukning?: number | null
          uppvarmningskostnad?: number | null
          // Building and construction (existing)
          bygglov?: string | null
          senaste_renovering?: string | null
          taktyp?: 'tegeltak' | 'platt' | 'betongpannor' | 'sadeltak' | 'mansardtak' | 'pulpettak' | 'annat' | null
          fasadmaterial?: 'tegel' | 'puts' | 'trak' | 'panel' | 'natursten' | 'betong' | 'eternit' | 'annat' | null
          fonstertyp?: 'treglas' | 'tvaglas' | 'traglas_argon' | 'aluminiumkarmar' | 'trakarmar' | 'plastkarmar' | null
          vatten_avlopp?: string | null
          // Security and systems (existing)
          brandskydd?: string | null
          larm?: string | null
          bredband?: 'fiber' | 'adsl' | 'kabel' | 'mobilt' | 'satellit' | 'inte_tillgangligt' | null
          kabel_tv?: boolean | null
          internet?: string | null
          // Location and environment (existing)
          narmaste_skola?: string | null
          narmaste_vardcentral?: string | null
          narmaste_dagis?: string | null
          avstand_centrum?: number | null
          havsnara?: boolean | null
          sjonara?: boolean | null
          skogsnara?: boolean | null
          kollektivtrafik?: string | null
          parkering?: string | null
          // Extended financial (existing)
          driftkostnad?: number | null
          avgift?: number | null
          pantbrev?: number | null
          taxeringsvarde?: number | null
          kommunala_avgifter?: number | null
          forsakringskostnad?: number | null
          reparationsfond?: number | null
          // Availability (existing)
          tillgangsdatum?: string | null
          visningsinfo?: string | null
          
          // Priority 1 - Essential Fields
          fastighetsbeteckning?: string | null
          undertyp?: 'parhus' | 'kedjehus' | 'radhus_mellan' | 'radhus_gavelbostad' | 'enplansvilla' | 'tvåplansvilla' | 'souterrangvilla' | 'sluttningshus' | 'atriumhus' | 'funkisvilla' | 'herrgård' | 'torp' | 'sjötomt' | 'skogstomt' | 'åkertomt' | null
          andel_i_forening?: number | null
          andelstal?: number | null
          virtuell_visning_url?: string | null
          
          // Priority 2 - Valuable Fields
          boendekalkyl_url?: string | null
          standard_niva?: 'hög' | 'mycket_hög' | 'normal' | 'låg' | 'renovering_behövs' | 'totalrenovering_krävs' | null
          tillganglighetsanpassad?: boolean | null
          laddbox?: boolean | null
          solceller?: boolean | null
          solceller_kapacitet_kwp?: number | null
          laddbox_typ?: '1-fas_3.7kW' | '3-fas_11kW' | '3-fas_22kW' | 'dc_snabbladdare' | null
          laddbox_antal?: number | null
          
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          objektnummer?: string
          typ?: 'villa' | 'lagenhet' | 'radhus' | 'fritidshus' | 'tomt'
          status?: 'kundbearbetning' | 'uppdrag' | 'till_salu' | 'sald' | 'tilltraden'
          adress?: string
          postnummer?: string
          ort?: string
          kommun?: string
          lan?: string
          utgangspris?: number | null
          slutpris?: number | null
          boarea?: number | null
          biarea?: number | null
          tomtarea?: number | null
          rum?: number | null
          byggaar?: number | null
          maklare_id?: string
          saljare_id?: string | null
          kopare_id?: string | null
          beskrivning?: string | null
          
          // Ownership and classification
          agare_id?: string | null
          agare_typ?: 'privatperson' | 'foretag' | 'kommun' | 'stat' | null
          agandekategori?: 'agt' | 'bostadsratt' | 'hyresratt' | 'arrende' | null
          
          // Enhanced pricing and bidding
          accepterat_pris?: number | null
          budgivning?: boolean | null
          budgivningsdatum?: string | null
          pristyp?: 'fast' | 'forhandling' | 'budgivning' | null
          prisutveckling?: string | null
          
          // Detailed monthly fees and costs
          manadsavgift?: number | null
          avgift_innefattar?: string | null
          kapitaltillskott?: number | null
          energikostnad_per_ar?: number | null
          drift_per_kvm?: number | null
          
          // Enhanced room layout
          antal_sovrum?: number | null
          antal_wc?: number | null
          antal_vaningar_hus?: number | null
          koksstorlek?: number | null
          vardagsrumsstorlek?: number | null
          kallare_area?: number | null
          garage_area?: number | null
          
          // Energy certification
          energiprestanda?: number | null
          energicertifikat_nummer?: string | null
          energicertifikat_utfardad?: string | null
          energicertifikat_giltig_till?: string | null
          
          // Enhanced amenities
          vinkallare?: boolean | null
          hobbyrum?: boolean | null
          carport?: boolean | null
          bastu?: boolean | null
          antal_parkeringsplatser?: number | null
          
          // Enhanced descriptions
          maklartext?: string | null
          salutext?: string | null
          visningsdagar?: string | null
          oppet_hus?: string | null
          specialbestammelser?: string | null
          anmarkningar?: string | null
          
          // What's included/excluded
          tillbehor_som_ingaar?: string | null
          tillbehor_som_ej_ingaar?: string | null
          
          // Legal aspects
          servitut?: string | null
          inskrankning?: string | null
          belastningar?: string | null
          gemensamhetsanlaggning?: string | null
          planerad_renovering?: string | null
          
          // Enhanced location data
          latitude?: number | null
          longitude?: number | null
          
          // Document references
          planritning_url?: string | null
          energideklaration_url?: string | null
          byggnadsbeskrivning_url?: string | null
          
          // Marketing and availability
          marknadsforingstext?: string | null
          visningsdagar_detaljer?: string | null
          oppet_hus_detaljer?: string | null
          
          // Timeline and status tracking
          listningsdatum?: string | null
          avtal_datum?: string | null
          tilltraden_datum?: string | null
          
          // Extended property information (existing)
          balkong_terrass?: boolean | null
          hiss?: boolean | null
          vaning?: number | null
          kok?: 'kokso' | 'halvoppet' | 'oppet' | 'kokonk' | 'modernt' | 'renoverat' | 'originalskick' | null
          badrum_antal?: number | null
          garage?: string | null
          forrad?: boolean | null
          tradgard?: boolean | null
          pool?: boolean | null
          kamin?: boolean | null
          // Technical information (existing)
          energiklass?: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | null
          byggmaterial?: 'tegel' | 'trak' | 'betong' | 'puts' | 'panel' | 'natursten' | 'annat' | null
          uppvarmning?: 'fjärrvärme' | 'elvärme' | 'pelletsbrännare' | 'vedeldning' | 'olja' | 'gas' | 'bergvärme' | 'luftvärmepump' | 'annat' | null
          ventilation?: 'mekanisk_til_och_franluft' | 'mekanisk_franluft' | 'naturlig' | 'balanserad' | 'frånluft' | null
          elnat?: 'trefas' | 'enfas' | 'trefas_16A' | 'trefas_25A' | 'trefas_35A' | null
          isolering?: 'mineralull' | 'cellulosa' | 'polyuretan' | 'eps' | 'xps' | 'annat' | null
          elforbrukning?: number | null
          vattenforbrukning?: number | null
          uppvarmningskostnad?: number | null
          // Building and construction (existing)
          bygglov?: string | null
          senaste_renovering?: string | null
          taktyp?: 'tegeltak' | 'platt' | 'betongpannor' | 'sadeltak' | 'mansardtak' | 'pulpettak' | 'annat' | null
          fasadmaterial?: 'tegel' | 'puts' | 'trak' | 'panel' | 'natursten' | 'betong' | 'eternit' | 'annat' | null
          fonstertyp?: 'treglas' | 'tvaglas' | 'traglas_argon' | 'aluminiumkarmar' | 'trakarmar' | 'plastkarmar' | null
          vatten_avlopp?: string | null
          // Security and systems (existing)
          brandskydd?: string | null
          larm?: string | null
          bredband?: 'fiber' | 'adsl' | 'kabel' | 'mobilt' | 'satellit' | 'inte_tillgangligt' | null
          kabel_tv?: boolean | null
          internet?: string | null
          // Location and environment (existing)
          narmaste_skola?: string | null
          narmaste_vardcentral?: string | null
          narmaste_dagis?: string | null
          avstand_centrum?: number | null
          havsnara?: boolean | null
          sjonara?: boolean | null
          skogsnara?: boolean | null
          kollektivtrafik?: string | null
          parkering?: string | null
          // Extended financial (existing)
          driftkostnad?: number | null
          avgift?: number | null
          pantbrev?: number | null
          taxeringsvarde?: number | null
          kommunala_avgifter?: number | null
          forsakringskostnad?: number | null
          reparationsfond?: number | null
          // Availability (existing)
          tillgangsdatum?: string | null
          visningsinfo?: string | null
          
          // Priority 1 - Essential Fields
          fastighetsbeteckning?: string | null
          undertyp?: 'parhus' | 'kedjehus' | 'radhus_mellan' | 'radhus_gavelbostad' | 'enplansvilla' | 'tvåplansvilla' | 'souterrangvilla' | 'sluttningshus' | 'atriumhus' | 'funkisvilla' | 'herrgård' | 'torp' | 'sjötomt' | 'skogstomt' | 'åkertomt' | null
          andel_i_forening?: number | null
          andelstal?: number | null
          virtuell_visning_url?: string | null
          
          // Priority 2 - Valuable Fields
          boendekalkyl_url?: string | null
          standard_niva?: 'hög' | 'mycket_hög' | 'normal' | 'låg' | 'renovering_behövs' | 'totalrenovering_krävs' | null
          tillganglighetsanpassad?: boolean | null
          laddbox?: boolean | null
          solceller?: boolean | null
          solceller_kapacitet_kwp?: number | null
          laddbox_typ?: '1-fas_3.7kW' | '3-fas_11kW' | '3-fas_22kW' | 'dc_snabbladdare' | null
          laddbox_antal?: number | null
          
          created_at?: string
          updated_at?: string
        }
      }
      kontakter: {
        Row: {
          id: string
          typ: 'privatperson' | 'foretag'
          fornamn: string | null
          efternamn: string | null
          foretag: string | null
          email: string | null
          telefon: string | null
          mobil: string | null
          adress: string | null
          postnummer: string | null
          ort: string | null
          personnummer: string | null
          organisationsnummer: string | null
          kategori: 'saljare' | 'kopare' | 'spekulant' | 'ovrig'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          typ: 'privatperson' | 'foretag'
          fornamn?: string | null
          efternamn?: string | null
          foretag?: string | null
          email?: string | null
          telefon?: string | null
          mobil?: string | null
          adress?: string | null
          postnummer?: string | null
          ort?: string | null
          personnummer?: string | null
          organisationsnummer?: string | null
          kategori?: 'saljare' | 'kopare' | 'spekulant' | 'ovrig'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          typ?: 'privatperson' | 'foretag'
          fornamn?: string | null
          efternamn?: string | null
          foretag?: string | null
          email?: string | null
          telefon?: string | null
          mobil?: string | null
          adress?: string | null
          postnummer?: string | null
          ort?: string | null
          personnummer?: string | null
          organisationsnummer?: string | null
          kategori?: 'saljare' | 'kopare' | 'spekulant' | 'ovrig'
          created_at?: string
          updated_at?: string
        }
      }
      visningar: {
        Row: {
          id: string
          objekt_id: string
          datum: string
          starttid: string
          sluttid: string
          typ: 'oppen' | 'privat' | 'digital'
          antal_besokare: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          objekt_id: string
          datum: string
          starttid: string
          sluttid: string
          typ: 'oppen' | 'privat' | 'digital'
          antal_besokare?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          objekt_id?: string
          datum?: string
          starttid?: string
          sluttid?: string
          typ?: 'oppen' | 'privat' | 'digital'
          antal_besokare?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      bud: {
        Row: {
          id: string
          objekt_id: string
          spekulant_id: string
          belopp: number
          datum: string
          tid: string
          status: 'aktivt' | 'accepterat' | 'avslaget' | 'tillbakadraget'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          objekt_id: string
          spekulant_id: string
          belopp: number
          datum?: string
          tid?: string
          status?: 'aktivt' | 'accepterat' | 'avslaget' | 'tillbakadraget'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          objekt_id?: string
          spekulant_id?: string
          belopp?: number
          datum?: string
          tid?: string
          status?: 'aktivt' | 'accepterat' | 'avslaget' | 'tillbakadraget'
          created_at?: string
          updated_at?: string
        }
      }
      kalenderhändelser: {
        Row: {
          id: string
          titel: string
          beskrivning: string | null
          starttid: string
          sluttid: string
          typ: 'visning' | 'mote' | 'kontraktsskrivning' | 'tilltraden' | 'fotografering' | 'ovrig'
          plats: string | null
          objekt_id: string | null
          kontakt_id: string | null
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          titel: string
          beskrivning?: string | null
          starttid: string
          sluttid: string
          typ: 'visning' | 'mote' | 'kontraktsskrivning' | 'tilltraden' | 'fotografering' | 'ovrig'
          plats?: string | null
          objekt_id?: string | null
          kontakt_id?: string | null
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          titel?: string
          beskrivning?: string | null
          starttid?: string
          sluttid?: string
          typ?: 'visning' | 'mote' | 'kontraktsskrivning' | 'tilltraden' | 'fotografering' | 'ovrig'
          plats?: string | null
          objekt_id?: string | null
          kontakt_id?: string | null
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      uppgifter: {
        Row: {
          id: string
          titel: string
          beskrivning: string | null
          status: 'ny' | 'pagaende' | 'klar' | 'avbruten'
          prioritet: 'lag' | 'normal' | 'hog' | 'akut'
          deadline: string | null
          objekt_id: string | null
          kontakt_id: string | null
          tilldelad_till: string
          skapad_av: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          titel: string
          beskrivning?: string | null
          status?: 'ny' | 'pagaende' | 'klar' | 'avbruten'
          prioritet?: 'lag' | 'normal' | 'hog' | 'akut'
          deadline?: string | null
          objekt_id?: string | null
          kontakt_id?: string | null
          tilldelad_till: string
          skapad_av: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          titel?: string
          beskrivning?: string | null
          status?: 'ny' | 'pagaende' | 'klar' | 'avbruten'
          prioritet?: 'lag' | 'normal' | 'hog' | 'akut'
          deadline?: string | null
          objekt_id?: string | null
          kontakt_id?: string | null
          tilldelad_till?: string
          skapad_av?: string
          created_at?: string
          updated_at?: string
        }
      }
      notifikationer: {
        Row: {
          id: string
          user_id: string
          titel: string
          meddelande: string
          typ: 'info' | 'varning' | 'success' | 'error'
          last: boolean
          relaterad_till: string | null
          relaterad_typ: 'objekt' | 'kontakt' | 'uppgift' | 'kalender' | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          titel: string
          meddelande: string
          typ?: 'info' | 'varning' | 'success' | 'error'
          last?: boolean
          relaterad_till?: string | null
          relaterad_typ?: 'objekt' | 'kontakt' | 'uppgift' | 'kalender' | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          titel?: string
          meddelande?: string
          typ?: 'info' | 'varning' | 'success' | 'error'
          last?: boolean
          relaterad_till?: string | null
          relaterad_typ?: 'objekt' | 'kontakt' | 'uppgift' | 'kalender' | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 