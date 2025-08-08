const fs = require('fs-extra');
const path = require('path');

class ComprehensiveGapAnalyzer {
  constructor(projectPath = './maklarsystem') {
    this.projectPath = projectPath;
    this.vitecFeatures = {
      'Objekthantering': {
        features: [
          'create_object', 'edit_object', 'delete_object', 'duplicate_object', 'archive_object',
          'object_types_villa', 'object_types_apartment', 'object_types_land', 'object_types_commercial',
          'status_workflow', 'status_history', 'image_upload', 'image_gallery', 'image_editing',
          'floor_plans', 'virtual_tours', '360_photos', 'drone_footage', 'video_upload',
          'energy_declaration', 'property_documents', 'validation_rules', 'price_calculations'
        ],
        priority: 'critical',
        implemented: []
      },
      'Kontakter (CRM)': {
        features: [
          'create_contact', 'edit_contact', 'delete_contact', 'merge_contacts',
          'contact_types', 'gdpr_consent', 'gdpr_data_export', 'gdpr_right_to_forget',
          'communication_log', 'email_history', 'sms_history', 'call_logging',
          'search_contacts', 'advanced_search', 'duplicate_detection', 'contact_matching',
          'interest_registration', 'contact_export', 'contact_import'
        ],
        priority: 'critical',
        implemented: []
      },
      'Visningshantering': {
        features: [
          'viewing_scheduling', 'calendar_integration', 'time_slot_management',
          'viewing_registration', 'online_booking', 'qr_code_checkin', 'visitor_tracking',
          'viewing_feedback', 'automated_followup', 'interest_rating', 'viewing_statistics',
          'reminder_system', 'sms_reminders', 'email_reminders'
        ],
        priority: 'critical',
        implemented: []
      },
      'Budgivning': {
        features: [
          'bidding_start', 'bid_registration', 'bid_validation', 'bid_increase_rules',
          'realtime_updates', 'websocket_connection', 'push_notifications', 'live_bidding_view',
          'bid_history', 'bid_timeline', 'bidder_verification', 'bankid_verification',
          'sms_notifications', 'email_notifications', 'bidding_close', 'bid_export', 'bidding_protocol'
        ],
        priority: 'critical',
        implemented: []
      },
      'Dokumenthantering': {
        features: [
          'contract_templates', 'template_library', 'custom_templates', 'contract_generation',
          'digital_signing', 'bankid_integration', 'multi_party_signing', 'version_control',
          'document_upload', 'document_categorization', 'document_search', 'document_sharing',
          'document_archiving', 'audit_trail'
        ],
        priority: 'critical',
        implemented: []
      },
      'Marknadsföring': {
        features: [
          'ad_text_generation', 'ai_text_assistant', 'image_optimization', 'social_media_posts',
          'facebook_integration', 'instagram_integration', 'marketing_materials', 'print_materials',
          'brochure_generation', 'window_cards', 'qr_code_generation', 'email_campaigns',
          'newsletter_system', 'campaign_templates'
        ],
        priority: 'high',
        implemented: []
      },
      'Hemnet Integration': {
        features: [
          'object_sync', 'realtime_sync', 'batch_sync', 'selective_sync',
          'image_upload', 'status_updates', 'price_changes', 'viewing_times_sync',
          'bidding_sync', 'error_handling', 'retry_mechanism', 'sync_status_dashboard',
          'bulk_operations', 'mass_publish'
        ],
        priority: 'critical',
        implemented: []
      },
      'Ekonomi': {
        features: [
          'commission_calculation', 'split_commission', 'invoice_generation', 'automatic_invoicing',
          'payment_tracking', 'expense_tracking', 'monthly_reports', 'quarterly_reports',
          'agent_statistics', 'office_statistics', 'custom_reports', 'excel_export'
        ],
        priority: 'high',
        implemented: []
      },
      'Säkerhet': {
        features: [
          'user_authentication', 'bankid_login', 'two_factor_auth', 'role_based_access',
          'permission_system', 'audit_logging', 'access_logs', 'data_encryption',
          'backup_system', 'gdpr_tools'
        ],
        priority: 'critical',
        implemented: []
      },
      'Mobil': {
        features: [
          'ios_app', 'android_app', 'responsive_web', 'offline_mode', 'data_sync',
          'photo_upload', 'camera_integration', 'push_notifications', 'gps_integration'
        ],
        priority: 'medium',
        implemented: []
      }
    };
  }

  async analyze() {
    console.log('🔍 VITEC EXPRESS vs MÄKLARSYSTEM - OMFATTANDE ANALYS\n');
    console.log('=' .repeat(70));
    console.log(`Startar analys: ${new Date().toLocaleString('sv-SE')}\n`);

    // Quick file search for implemented features
    await this.quickFileSearch();
    
    // Calculate statistics
    const stats = this.calculateStatistics();
    
    // Generate report
    this.generateReport(stats);
    
    // Save detailed report
    await this.saveDetailedReport(stats);
  }

  async quickFileSearch() {
    console.log('📂 Skannar implementation...\n');

    // Common patterns to search for
    const searchPatterns = {
      'Objekthantering': ['objekt', 'property', 'PropertyForm', 'ObjektDetail'],
      'Kontakter (CRM)': ['kontakt', 'contact', 'KontaktForm', 'gdpr'],
      'Visningshantering': ['visning', 'viewing', 'booking', 'schedule'],
      'Budgivning': ['bud', 'bid', 'bidding', 'auction'],
      'Dokumenthantering': ['dokument', 'document', 'contract', 'template'],
      'Hemnet Integration': ['hemnet', 'integration', 'sync', 'publish'],
      'Ekonomi': ['ekonomi', 'commission', 'invoice', 'report'],
      'Säkerhet': ['auth', 'security', 'permission', 'role'],
      'Mobil': ['mobile', 'responsive', 'app', 'pwa']
    };

    // Check for files indicating implementation
    const srcPath = path.join(this.projectPath, 'src');
    
    if (await fs.pathExists(srcPath)) {
      for (const [category, patterns] of Object.entries(searchPatterns)) {
        for (const pattern of patterns) {
          const hasFeature = await this.checkForPattern(srcPath, pattern);
          if (hasFeature && this.vitecFeatures[category]) {
            // Mark some features as implemented based on pattern match
            this.vitecFeatures[category].implemented.push(pattern);
          }
        }
      }
    }

    // Specific checks based on previous analysis
    if (await fs.pathExists(path.join(srcPath, 'app/objekt'))) {
      this.vitecFeatures['Objekthantering'].implemented.push('create_object', 'edit_object', 'status_workflow');
    }
    
    if (await fs.pathExists(path.join(srcPath, 'app/kontakter'))) {
      this.vitecFeatures['Kontakter (CRM)'].implemented.push('create_contact', 'gdpr_consent');
    }

    if (await fs.pathExists(path.join(srcPath, 'contexts/AuthContext.tsx'))) {
      this.vitecFeatures['Säkerhet'].implemented.push('user_authentication');
    }

    if (await fs.pathExists(path.join(srcPath, 'components/ui/glass'))) {
      this.vitecFeatures['Mobil'].implemented.push('responsive_web');
    }
  }

  async checkForPattern(dir, pattern) {
    try {
      const files = await fs.readdir(dir, { withFileTypes: true });
      for (const file of files) {
        if (file.name.toLowerCase().includes(pattern.toLowerCase())) {
          return true;
        }
      }
      return false;
    } catch {
      return false;
    }
  }

  calculateStatistics() {
    let totalFeatures = 0;
    let totalImplemented = 0;
    const categoryStats = {};

    for (const [category, data] of Object.entries(this.vitecFeatures)) {
      const categoryTotal = data.features.length;
      const categoryImplemented = data.implemented.length;
      
      totalFeatures += categoryTotal;
      totalImplemented += categoryImplemented;
      
      categoryStats[category] = {
        total: categoryTotal,
        implemented: categoryImplemented,
        coverage: Math.round((categoryImplemented / categoryTotal) * 100),
        priority: data.priority,
        missing: data.features.filter(f => !data.implemented.includes(f))
      };
    }

    return {
      total: totalFeatures,
      implemented: totalImplemented,
      coverage: Math.round((totalImplemented / totalFeatures) * 100),
      categories: categoryStats
    };
  }

  generateReport(stats) {
    console.log('\n📊 SAMMANFATTNING');
    console.log('=' .repeat(70));
    console.log(`Total täckning: ${stats.coverage}% (${stats.implemented}/${stats.total} funktioner)\n`);

    // Progress bar
    const filled = Math.round(stats.coverage / 5);
    const progressBar = '█'.repeat(filled) + '░'.repeat(20 - filled);
    console.log(`[${progressBar}] ${stats.coverage}%\n`);

    // Category breakdown
    console.log('📋 STATUS PER KATEGORI');
    console.log('=' .repeat(70));
    
    const sortedCategories = Object.entries(stats.categories)
      .sort((a, b) => {
        // Sort by priority (critical first) then by name
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        const priorityDiff = priorityOrder[a[1].priority] - priorityOrder[b[1].priority];
        return priorityDiff !== 0 ? priorityDiff : a[0].localeCompare(b[0]);
      });

    for (const [category, data] of sortedCategories) {
      const icon = data.coverage === 0 ? '❌' : data.coverage === 100 ? '✅' : '🔶';
      console.log(`\n${icon} ${category} [${data.priority.toUpperCase()}]`);
      console.log(`   Täckning: ${data.coverage}% (${data.implemented}/${data.total})`);
      
      if (data.missing.length > 0 && data.priority === 'critical') {
        console.log(`   Kritiska funktioner som saknas:`);
        data.missing.slice(0, 5).forEach(f => console.log(`   - ${f}`));
        if (data.missing.length > 5) {
          console.log(`   ... och ${data.missing.length - 5} till`);
        }
      }
    }

    // Priority recommendations
    console.log('\n\n🎯 PRIORITERADE ÅTGÄRDER');
    console.log('=' .repeat(70));
    
    const criticalMissing = sortedCategories
      .filter(([_, data]) => data.priority === 'critical' && data.coverage < 50)
      .slice(0, 3);

    criticalMissing.forEach(([category, data], index) => {
      console.log(`\n${index + 1}. ${category} (${data.coverage}% klart)`);
      console.log(`   Implementera: ${data.missing.slice(0, 3).join(', ')}`);
    });

    console.log('\n\n🚀 NÄSTA STEG');
    console.log('=' .repeat(70));
    console.log('1. Implementera Visningshantering - Digital bokning och QR-checkin');
    console.log('2. Bygga Budgivningssystem - Realtidsuppdateringar med WebSocket');
    console.log('3. Dokumenthantering - Mallar och e-signering med BankID');
    console.log('4. Hemnet Integration - API-koppling för automatisk publicering');
  }

  async saveDetailedReport(stats) {
    const report = {
      generated: new Date().toISOString(),
      projectPath: this.projectPath,
      summary: {
        totalCoverage: stats.coverage,
        totalFeatures: stats.total,
        implementedFeatures: stats.implemented,
        missingFeatures: stats.total - stats.implemented
      },
      categories: stats.categories,
      recommendations: {
        immediate: [
          'Visningshantering - Digital bokning system',
          'Budgivning - Realtidssystem med notifieringar',
          'Dokumenthantering - E-signering integration'
        ],
        shortTerm: [
          'Hemnet API integration',
          'Ekonomi och provisionsberäkning',
          'Avancerad säkerhet med BankID'
        ],
        longTerm: [
          'Mobilapplikationer för iOS/Android',
          'AI-driven textgenerering',
          'Avancerad marknadsanalys'
        ]
      }
    };

    const reportPath = path.join(this.projectPath, '..', 'vitec-gap-analysis-detailed.json');
    await fs.writeJSON(reportPath, report, { spaces: 2 });
    console.log(`\n\n✅ Detaljerad rapport sparad: ${reportPath}`);
  }
}

// Run analysis
async function main() {
  const analyzer = new ComprehensiveGapAnalyzer('./maklarsystem');
  await analyzer.analyze();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { ComprehensiveGapAnalyzer };