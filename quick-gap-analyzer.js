const fs = require('fs');
const path = require('path');

// Snabbare version av gap analyzer som fokuserar på huvudfunktioner
class QuickGapAnalyzer {
  constructor() {
    this.projectPath = './maklarsystem';
    
    // Vitec Express huvudfunktioner
    this.vitecFeatures = {
      'Objekthantering': ['Skapa objekt', 'Bildgalleri', 'Statushantering', 'Prishistorik', 'Visningsschema'],
      'Kontakter (CRM)': ['Säljare/köpare register', 'GDPR-samtycke', 'Kommunikationslogg', 'Intresseanmälan'],
      'Visningshantering': ['Digital bokning', 'QR-kod checkin', 'Påminnelser', 'Visningsrapport'],
      'Budgivning': ['Digital budgivning', 'Budlogg', 'SMS-bekräftelser', 'BankID-verifiering'],
      'Dokumenthantering': ['Mallar', 'E-signering', 'Versionshantering', 'Automatisk ifyllning'],
      'Marknadsföring': ['Hemnet-integration', 'Booli-integration', 'Social media', 'Annonsmallar'],
      'Ekonomi': ['Provisionsberäkning', 'Fakturering', 'Rapporter', 'Ekonomiexport'],
      'Säkerhet': ['BankID-inloggning', '2FA', 'GDPR-verktyg', 'Aktivitetslogg']
    };
    
    // Vad som finns i Mäklarsystem (baserat på tidigare analys)
    this.implemented = {
      'Objekthantering': ['Skapa objekt', 'Statushantering'],
      'Kontakter (CRM)': ['Säljare/köpare register', 'GDPR-samtycke'],
      'Visningshantering': [],
      'Budgivning': [],
      'Dokumenthantering': [],
      'Marknadsföring': [],
      'Ekonomi': [],
      'Säkerhet': ['GDPR-verktyg']
    };
  }
  
  analyze() {
    console.log('🔍 VITEC EXPRESS vs MÄKLARSYSTEM - SNABB ANALYS\n');
    console.log('=' .repeat(60));
    
    let totalFeatures = 0;
    let implementedCount = 0;
    
    // Visa status per kategori
    Object.keys(this.vitecFeatures).forEach(category => {
      const vitecList = this.vitecFeatures[category];
      const implList = this.implemented[category] || [];
      
      totalFeatures += vitecList.length;
      implementedCount += implList.length;
      
      const coverage = Math.round((implList.length / vitecList.length) * 100);
      
      console.log(`\n📋 ${category}`);
      console.log(`Täckning: ${coverage}% (${implList.length}/${vitecList.length})`);
      
      // Visa vad som saknas
      const missing = vitecList.filter(f => !implList.includes(f));
      if (missing.length > 0) {
        console.log('\nSaknas:');
        missing.forEach(f => console.log(`  ❌ ${f}`));
      }
    });
    
    // Total sammanfattning
    const totalCoverage = Math.round((implementedCount / totalFeatures) * 100);
    console.log('\n\n📊 TOTAL SAMMANFATTNING');
    console.log('=' .repeat(60));
    console.log(`Total täckning: ${totalCoverage}% (${implementedCount}/${totalFeatures} funktioner)`);
    
    // Progress bar
    const filled = Math.round(totalCoverage / 5);
    const progressBar = '█'.repeat(filled) + '░'.repeat(20 - filled);
    console.log(`\n[${progressBar}] ${totalCoverage}%`);
    
    // Prioriteringar
    console.log('\n\n🎯 HÖGSTA PRIORITET (MVP)');
    console.log('=' .repeat(60));
    console.log('1. Visningshantering - 0% implementerat');
    console.log('   → Digital bokning, QR-checkin, påminnelser');
    console.log('\n2. Budgivning - 0% implementerat');
    console.log('   → Digital budgivning, budlogg, SMS-bekräftelser');
    console.log('\n3. Dokumenthantering - 0% implementerat');
    console.log('   → Mallar, e-signering, automatisk ifyllning');
    
    // Nästa steg
    console.log('\n\n🚀 NÄSTA STEG');
    console.log('=' .repeat(60));
    console.log('1. Implementera visningsbokning (mest kritisk)');
    console.log('2. Bygga budgivningssystem med realtidsuppdateringar');
    console.log('3. Skapa dokumentmallar och e-signering');
    console.log('4. Integrera med Hemnet API');
  }
}

// Kör analysen
const analyzer = new QuickGapAnalyzer();
analyzer.analyze();