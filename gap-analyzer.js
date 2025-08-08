const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

class MaklarsystemGapAnalyzer {
  constructor(projectPath = './maklarsystem') {
    this.projectPath = projectPath;
    this.analysis = {
      implemented: {},
      partial: {},
      missing: {},
      statistics: {
        totalFeatures: 0,
        implemented: 0,
        partial: 0,
        missing: 0
      }
    };
    
    // KOMPLETT feature-lista baserad på ALLT från Vitec Express
    this.requiredFeatures = {
      core: {
        objekthantering: {
          features: [
            // Grundläggande CRUD
            'create_object',
            'edit_object',
            'delete_object',
            'duplicate_object',
            'archive_object',
            
            // Objekttyper
            'object_types_villa',
            'object_types_apartment',
            'object_types_land',
            'object_types_commercial',
            'object_types_fritidshus',
            'object_types_project_nyproduktion',
            'object_types_utland',
            
            // Statushantering
            'status_workflow',
            'status_kommande',
            'status_till_salu',
            'status_budgivning',
            'status_kontrakt',
            'status_sald',
            'status_makulerad',
            'status_history',
            
            // Mediahantering
            'image_upload',
            'image_gallery',
            'image_editing',
            'image_watermark',
            'image_sorting',
            'floor_plans',
            'virtual_tours',
            '360_photos',
            'drone_footage',
            'video_upload',
            
            // Dokument
            'energy_declaration',
            'property_documents',
            'technical_documents',
            'area_calculations',
            
            // Validering & Beräkningar
            'validation_rules',
            'price_calculations',
            'area_validation',
            'address_validation',
            'coordinate_mapping'
          ],
          priority: 'critical'
        },
        kundregister: {
          features: [
            // CRUD
            'create_contact',
            'edit_contact',
            'delete_contact',
            'merge_contacts',
            
            // Kontakttyper
            'contact_types',
            'contact_type_saljare',
            'contact_type_kopare',
            'contact_type_spekulant',
            'contact_type_uppdragsgivare',
            
            // GDPR & Compliance
            'gdpr_consent',
            'gdpr_data_export',
            'gdpr_right_to_forget',
            'consent_tracking',
            'data_retention_policy',
            
            // Kommunikation
            'communication_log',
            'email_history',
            'sms_history',
            'call_logging',
            'meeting_notes',
            
            // Sök & Matchning
            'search_contacts',
            'advanced_search',
            'duplicate_detection',
            'contact_matching',
            'interest_registration',
            'search_preferences',
            'automatic_matching',
            
            // Export & Import
            'contact_export',
            'contact_import',
            'csv_import',
            'outlook_sync'
          ],
          priority: 'critical'
        },
        budgivning: {
          features: [
            // Grundläggande
            'bidding_start',
            'bid_registration',
            'bid_validation',
            'bid_increase_rules',
            'minimum_bid_increase',
            
            // Realtid
            'realtime_updates',
            'websocket_connection',
            'push_notifications',
            'live_bidding_view',
            
            // Historik & Spårning
            'bid_history',
            'bid_timeline',
            'bidder_activity',
            'bid_statistics',
            
            // Verifiering
            'bidder_verification',
            'bankid_verification',
            'identity_check',
            'financing_verification',
            
            // Kommunikation
            'sms_notifications',
            'email_notifications',
            'bid_confirmation',
            'bid_rejection',
            'outbid_notifications',
            'bidding_reminder',
            
            // Avslut & Export
            'bidding_close',
            'bid_export',
            'bidding_protocol',
            'winner_selection',
            'reserve_price_handling'
          ],
          priority: 'critical'
        },
        kontrakt: {
          features: [
            // Mallar
            'contract_templates',
            'template_library',
            'custom_templates',
            'template_versioning',
            'legal_updates',
            
            // Generering
            'contract_generation',
            'variable_replacement',
            'conditional_sections',
            'clause_management',
            'appendix_handling',
            
            // Signering
            'digital_signing',
            'bankid_integration',
            'multi_party_signing',
            'signing_order',
            'signing_reminders',
            
            // Hantering
            'contract_storage',
            'version_control',
            'contract_history',
            'amendment_tracking',
            
            // Export & Arkivering
            'contract_export',
            'pdf_generation',
            'email_distribution',
            'archive_integration'
          ],
          priority: 'critical'
        },
        tilltradeprocess: {
          features: [
            'tilltradeprotokoll',
            'key_handover',
            'inspection_checklist',
            'final_payment',
            'document_collection',
            'meter_readings',
            'defect_reporting',
            'handover_photos'
          ],
          priority: 'high'
        }
      },
      documents: {
        templates: {
          features: [
            // Säljdokument
            'uppdragsavtal',
            'objektsbeskrivning',
            'saljobjektsbeskrivning',
            'kopeavtal',
            'overlatelsekontrakt',
            
            // Budgivning
            'budgivningslista',
            'budprotokoll',
            'budbekraftelse',
            
            // Tillträde
            'tilltradesprotokoll',
            'nyckelkvitto',
            'besiktningsprotokoll',
            
            // Övrigt
            'depositionsavtal',
            'energideklaration',
            'fullmakt',
            'sekretessavtal',
            'custom_templates',
            
            // Versionshantering
            'template_versioning',
            'legal_compliance_check',
            'template_approval_workflow'
          ],
          priority: 'high'
        },
        handling: {
          features: [
            'document_upload',
            'drag_drop_upload',
            'bulk_upload',
            'document_categorization',
            'auto_categorization',
            'ocr_scanning',
            'document_search',
            'full_text_search',
            'metadata_search',
            'document_sharing',
            'share_links',
            'access_control',
            'document_archiving',
            'retention_policies',
            'gdpr_compliance',
            'audit_trail'
          ],
          priority: 'high'
        }
      },
      marketing: {
        annonsering: {
          features: [
            // Textgenerering
            'ad_text_generation',
            'ai_text_assistant',
            'chatgpt_integration',
            'seo_optimization',
            'keyword_suggestions',
            
            // Bildhantering
            'image_optimization',
            'automatic_cropping',
            'hdr_processing',
            'virtual_staging',
            
            // Kanaler
            'social_media_posts',
            'facebook_integration',
            'instagram_integration',
            'linkedin_posts',
            
            // Material
            'marketing_materials',
            'print_materials',
            'brochure_generation',
            'window_cards',
            'qr_code_generation'
          ],
          priority: 'medium'
        },
        visningar: {
          features: [
            // Schemaläggning
            'viewing_scheduling',
            'calendar_integration',
            'google_calendar',
            'outlook_calendar',
            'time_slot_management',
            'double_booking_prevention',
            
            // Registrering
            'viewing_registration',
            'online_booking',
            'qr_code_checkin',
            'visitor_tracking',
            'gdpr_compliant_registration',
            
            // Uppföljning
            'viewing_feedback',
            'automated_followup',
            'interest_rating',
            'viewing_statistics',
            
            // Påminnelser
            'reminder_system',
            'sms_reminders',
            'email_reminders',
            'calendar_invites'
          ],
          priority: 'high'
        },
        kampanjer: {
          features: [
            'email_campaigns',
            'newsletter_system',
            'campaign_templates',
            'ab_testing',
            'open_rate_tracking',
            'click_tracking',
            'unsubscribe_handling'
          ],
          priority: 'medium'
        }
      },
      integrations: {
        hemnet: {
          features: [
            // Synkronisering
            'object_sync',
            'realtime_sync',
            'batch_sync',
            'selective_sync',
            
            // Mediahantering
            'image_upload',
            'image_order_sync',
            'floorplan_sync',
            'video_sync',
            
            // Status
            'status_updates',
            'price_changes',
            'viewing_times_sync',
            'sold_status_sync',
            
            // Budgivning
            'bidding_sync',
            'bidder_count_sync',
            'highest_bid_sync',
            
            // Felhantering
            'error_handling',
            'retry_mechanism',
            'error_notifications',
            'sync_status_dashboard',
            
            // Bulk
            'bulk_operations',
            'mass_publish',
            'mass_unpublish',
            'bulk_price_update'
          ],
          priority: 'critical'
        },
        booli: {
          features: [
            'price_valuation',
            'automated_valuation',
            'area_statistics',
            'sold_prices',
            'market_analysis',
            'trend_reports',
            'comparable_sales',
            'neighborhood_data'
          ],
          priority: 'medium'
        },
        blocket: {
          features: [
            'ad_publishing',
            'sync_status',
            'bulk_upload',
            'category_mapping',
            'pricing_sync',
            'lead_capture'
          ],
          priority: 'medium'
        },
        ekonomi: {
          features: [
            // Fortnox
            'fortnox_integration',
            'customer_sync',
            'invoice_sync',
            'payment_sync',
            'accounting_export',
            
            // Fakturering
            'invoice_generation',
            'credit_invoices',
            'reminder_invoices',
            'invoice_templates',
            
            // Provision
            'commission_calculation',
            'split_commission',
            'tiered_commission',
            'commission_reports',
            
            // Utgifter
            'expense_tracking',
            'receipt_scanning',
            'mileage_tracking',
            'expense_reports'
          ],
          priority: 'high'
        },
        banker: {
          features: [
            'mortgage_calculator',
            'loan_pre_approval',
            'bank_integration',
            'interest_rate_feed',
            'affordability_check'
          ],
          priority: 'low'
        },
        fastighetsregister: {
          features: [
            'lantmateriet_integration',
            'property_info_fetch',
            'ownership_verification',
            'encumbrance_check',
            'map_integration'
          ],
          priority: 'medium'
        },
        extern_kommunikation: {
          features: [
            // SMS
            'sms_gateway',
            'bulk_sms',
            'sms_templates',
            'delivery_reports',
            
            // Email
            'smtp_integration',
            'email_templates',
            'email_tracking',
            'bounce_handling',
            
            // Telefoni
            'telephony_integration',
            'call_recording',
            'click_to_call',
            'call_statistics'
          ],
          priority: 'medium'
        }
      },
      economy: {
        provision: {
          features: [
            // Beräkning
            'commission_calculation',
            'percentage_based',
            'fixed_fee',
            'tiered_structure',
            'minimum_fee',
            
            // Fördelning
            'commission_split',
            'agent_split',
            'office_split',
            'referral_fee',
            'team_split',
            
            // Skatt & Moms
            'vat_calculation',
            'tax_reporting',
            'employer_fees',
            
            // Fakturering
            'invoice_generation',
            'automatic_invoicing',
            'payment_tracking',
            'payment_reminders'
          ],
          priority: 'high'
        },
        rapporter: {
          features: [
            // Period
            'monthly_reports',
            'quarterly_reports',
            'annual_reports',
            'custom_periods',
            
            // Typ
            'agent_statistics',
            'office_statistics',
            'commission_reports',
            'pipeline_reports',
            'performance_reports',
            
            // Format
            'pdf_reports',
            'excel_export',
            'dashboard_widgets',
            'email_reports',
            
            // Anpassning
            'custom_reports',
            'report_builder',
            'saved_reports',
            'scheduled_reports'
          ],
          priority: 'medium'
        },
        budget: {
          features: [
            'budget_planning',
            'revenue_forecasting',
            'expense_budgeting',
            'variance_analysis',
            'cash_flow_projection'
          ],
          priority: 'low'
        }
      },
      mobile: {
        app: {
          features: [
            // Plattformar
            'ios_app',
            'android_app',
            'responsive_web',
            'pwa_support',
            
            // Funktionalitet
            'offline_mode',
            'data_sync',
            'conflict_resolution',
            
            // Media
            'photo_upload',
            'camera_integration',
            'photo_editing',
            'document_scanning',
            'pdf_creation',
            
            // Kommunikation
            'push_notifications',
            'in_app_messaging',
            'call_integration',
            
            // Navigation
            'gps_integration',
            'route_planning',
            'nearby_properties'
          ],
          priority: 'low'
        }
      },
      analytics: {
        dashboard: {
          features: [
            // Realtid
            'realtime_stats',
            'live_visitor_count',
            'active_biddings',
            'today_activities',
            
            // KPIer
            'kpi_tracking',
            'conversion_rates',
            'average_selling_time',
            'price_achievement',
            'customer_satisfaction',
            
            // Prestanda
            'agent_performance',
            'office_performance',
            'team_comparison',
            'ranking_lists',
            
            // Marknad
            'market_trends',
            'price_development',
            'inventory_levels',
            'competitor_analysis',
            
            // Visualisering
            'charts_graphs',
            'heat_maps',
            'trend_lines',
            'custom_widgets'
          ],
          priority: 'medium'
        },
        forecasting: {
          features: [
            'sales_prediction',
            'revenue_forecast',
            'market_forecast',
            'seasonal_analysis',
            'ai_predictions'
          ],
          priority: 'low'
        }
      },
      security: {
        auth: {
          features: [
            // Autentisering
            'user_authentication',
            'username_password',
            'bankid_login',
            'sso_integration',
            'oauth_support',
            
            // Auktorisering
            'role_based_access',
            'permission_system',
            'data_access_control',
            'feature_toggles',
            
            // Säkerhet
            'two_factor_auth',
            'ip_whitelisting',
            'session_management',
            'password_policy',
            
            // Loggning
            'audit_logging',
            'access_logs',
            'change_tracking',
            'compliance_reporting',
            
            // Dataskydd
            'data_encryption',
            'backup_system',
            'disaster_recovery',
            'gdpr_tools'
          ],
          priority: 'critical'
        }
      },
      administration: {
        anvandare: {
          features: [
            'user_management',
            'user_creation',
            'user_deactivation',
            'password_reset',
            'profile_management',
            'team_management',
            'office_hierarchy'
          ],
          priority: 'high'
        },
        installningar: {
          features: [
            'system_settings',
            'company_info',
            'branding_setup',
            'email_configuration',
            'notification_rules',
            'workflow_customization',
            'field_customization'
          ],
          priority: 'medium'
        },
        support: {
          features: [
            'help_documentation',
            'video_tutorials',
            'in_app_support',
            'ticket_system',
            'remote_assistance'
          ],
          priority: 'low'
        }
      },
      specialfunktioner: {
        ai_copilot: {
          features: [
            'text_generation',
            'chatgpt_integration',
            'auto_descriptions',
            'translation_service',
            'content_suggestions',
            'smart_pricing',
            'market_insights'
          ],
          priority: 'medium'
        },
        nyproduktion: {
          features: [
            'project_management',
            'unit_management',
            'reservation_system',
            'queue_management',
            'project_marketing',
            'buyer_communication',
            'construction_updates'
          ],
          priority: 'low'
        },
        utlandsforsaljning: {
          features: [
            'multi_language',
            'currency_conversion',
            'international_marketing',
            'legal_compliance',
            'tax_handling'
          ],
          priority: 'low'
        },
        auktion: {
          features: [
            'online_auktion',
            'auction_catalog',
            'bidder_registration',
            'live_bidding',
            'auction_settlement'
          ],
          priority: 'low'
        }
      }
    };
  }

  async analyze() {
    console.log('🔍 Analyserar mäklarsystem projekt...\n');
    
    // Kontrollera om projektet finns
    if (!await fs.pathExists(this.projectPath)) {
      console.error(`❌ Projektet hittades inte på: ${this.projectPath}`);
      return;
    }
    
    // Analysera projektstruktur
    await this.analyzeProjectStructure();
    
    // Analysera källkod
    await this.analyzeSourceCode();
    
    // Analysera databas
    await this.analyzeDatabaseSchema();
    
    // Analysera API endpoints
    await this.analyzeAPIEndpoints();
    
    // Analysera frontend komponenter
    await this.analyzeFrontendComponents();
    
    // Generera rapport
    await this.generateReport();
  }

  async analyzeProjectStructure() {
    console.log('📁 Analyserar projektstruktur...');
    
    const structure = {
      backend: await fs.pathExists(path.join(this.projectPath, 'backend')),
      frontend: await fs.pathExists(path.join(this.projectPath, 'frontend')),
      mobile: await fs.pathExists(path.join(this.projectPath, 'mobile')),
      database: await fs.pathExists(path.join(this.projectPath, 'database')),
      api: await fs.pathExists(path.join(this.projectPath, 'api')),
      docs: await fs.pathExists(path.join(this.projectPath, 'docs'))
    };
    
    console.log('Hittade:', Object.entries(structure).filter(([k,v]) => v).map(([k]) => k).join(', '));
  }

  async analyzeSourceCode() {
    console.log('\n💻 Analyserar källkod...');
    
    // Sök efter implementerade features i koden
    const searchPatterns = {
      objekthantering: ['createProperty', 'PropertyModel', 'property-form', 'ObjectController'],
      budgivning: ['Bidding', 'createBid', 'BidModel', 'bidding-component'],
      kundregister: ['Contact', 'Customer', 'ClientModel', 'contact-form'],
      kontrakt: ['Contract', 'Agreement', 'contract-template', 'signing'],
      hemnet: ['hemnet', 'HemnetAPI', 'hemnet-sync'],
      ekonomi: ['Commission', 'Invoice', 'commission-calculator'],
      auth: ['auth', 'login', 'jwt', 'authentication']
    };
    
    for (const [feature, patterns] of Object.entries(searchPatterns)) {
      const found = await this.searchInCode(patterns);
      if (found.length > 0) {
        console.log(`✅ Hittade ${feature}: ${found.length} filer`);
        this.markFeatureStatus(feature, 'implemented');
      }
    }
  }

  async searchInCode(patterns) {
    const foundFiles = [];
    
    try {
      for (const pattern of patterns) {
        // Använd grep för att söka (fungerar på Unix-system)
        const command = `find ${this.projectPath} -type f \\( -name "*.js" -o -name "*.ts" -o -name "*.jsx" -o -name "*.tsx" \\) -exec grep -l "${pattern}" {} \\; 2>/dev/null`;
        const result = execSync(command, { encoding: 'utf-8' });
        if (result) {
          foundFiles.push(...result.split('\n').filter(f => f));
        }
      }
    } catch (e) {
      // Grep returnerar error om inget hittas, det är ok
    }
    
    return [...new Set(foundFiles)];
  }

  async analyzeDatabaseSchema() {
    console.log('\n🗄️  Analyserar databas...');
    
    // Kolla efter migrations eller schema-filer
    const schemaLocations = [
      'database/schema.sql',
      'backend/database/schema.sql',
      'migrations/',
      'backend/migrations/',
      'prisma/schema.prisma'
    ];
    
    for (const location of schemaLocations) {
      const fullPath = path.join(this.projectPath, location);
      if (await fs.pathExists(fullPath)) {
        console.log(`✅ Hittade databasschema: ${location}`);
        
        // Analysera schema
        if (location.includes('.sql')) {
          await this.analyzeSQLSchema(fullPath);
        } else if (location.includes('prisma')) {
          await this.analyzePrismaSchema(fullPath);
        }
      }
    }
  }

  async analyzeSQLSchema(schemaPath) {
    const content = await fs.readFile(schemaPath, 'utf-8');
    
    const tables = {
      properties: /CREATE TABLE.*properties/i.test(content),
      contacts: /CREATE TABLE.*contacts/i.test(content),
      bids: /CREATE TABLE.*bids/i.test(content),
      contracts: /CREATE TABLE.*contracts/i.test(content),
      users: /CREATE TABLE.*users/i.test(content)
    };
    
    for (const [table, exists] of Object.entries(tables)) {
      if (exists) {
        console.log(`  ✅ Tabell: ${table}`);
      }
    }
  }

  async analyzeAPIEndpoints() {
    console.log('\n🔌 Analyserar API endpoints...');
    
    // Sök efter route-definitioner
    const routeFiles = await this.searchInCode(['router.', 'app.get', 'app.post', '@Get', '@Post']);
    
    if (routeFiles.length > 0) {
      console.log(`Hittade ${routeFiles.length} route-filer`);
      
      // Analysera varje route-fil
      for (const file of routeFiles.slice(0, 5)) { // Begränsa för demo
        const content = await fs.readFile(file, 'utf-8');
        const endpoints = this.extractEndpoints(content);
        if (endpoints.length > 0) {
          console.log(`  📍 ${path.basename(file)}: ${endpoints.join(', ')}`);
        }
      }
    }
  }

  extractEndpoints(content) {
    const endpoints = [];
    const patterns = [
      /router\.(get|post|put|delete)\(['"]([^'"]+)['"]/g,
      /app\.(get|post|put|delete)\(['"]([^'"]+)['"]/g,
      /@(Get|Post|Put|Delete)\(['"]([^'"]+)['"]/g
    ];
    
    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        endpoints.push(`${match[1].toUpperCase()} ${match[2]}`);
      }
    }
    
    return endpoints;
  }

  async analyzeFrontendComponents() {
    console.log('\n🎨 Analyserar frontend-komponenter...');
    
    const componentPatterns = {
      PropertyList: 'objekthantering',
      BiddingComponent: 'budgivning',
      ContactForm: 'kundregister',
      ContractViewer: 'kontrakt',
      Dashboard: 'analytics'
    };
    
    for (const [component, feature] of Object.entries(componentPatterns)) {
      const found = await this.searchInCode([component]);
      if (found.length > 0) {
        console.log(`✅ ${component} implementerad`);
      }
    }
  }

  markFeatureStatus(feature, status) {
    // Hitta feature i strukturen och markera status
    for (const [category, subcategories] of Object.entries(this.requiredFeatures)) {
      for (const [subcategory, config] of Object.entries(subcategories)) {
        if (subcategory === feature || config.features?.includes(feature)) {
          if (!this.analysis[status][category]) {
            this.analysis[status][category] = {};
          }
          this.analysis[status][category][subcategory] = true;
          return;
        }
      }
    }
  }

  calculateCompleteness() {
    let total = 0;
    let implemented = 0;
    let partial = 0;
    
    for (const [category, subcategories] of Object.entries(this.requiredFeatures)) {
      for (const [subcategory, config] of Object.entries(subcategories)) {
        total += config.features.length;
        
        // Räkna implementerade
        if (this.analysis.implemented[category]?.[subcategory]) {
          implemented += config.features.length;
        } else if (this.analysis.partial[category]?.[subcategory]) {
          partial += config.features.length;
        }
      }
    }
    
    const missing = total - implemented - partial;
    
    return {
      total,
      implemented,
      partial,
      missing,
      completeness: Math.round((implemented / total) * 100)
    };
  }

  async generateReport() {
    console.log('\n📊 Genererar rapport...\n');
    
    const stats = this.calculateCompleteness();
    const report = [];
    
    report.push('# Mäklarsystem - Gap Analys\n');
    report.push(`Genererad: ${new Date().toLocaleString('sv-SE')}\n`);
    
    report.push('## Sammanfattning\n');
    report.push(`- **Total funktionalitet**: ${stats.total} features`);
    report.push(`- **Implementerat**: ${stats.implemented} (${stats.completeness}%)`);
    report.push(`- **Delvis implementerat**: ${stats.partial}`);
    report.push(`- **Saknas**: ${stats.missing}\n`);
    
    report.push('## Implementeringsstatus per kategori\n');
    
    // Detaljerad status per kategori
    for (const [category, subcategories] of Object.entries(this.requiredFeatures)) {
      report.push(`### ${category.toUpperCase()}\n`);
      
      for (const [subcategory, config] of Object.entries(subcategories)) {
        const status = this.getFeatureStatus(category, subcategory);
        const icon = status === 'implemented' ? '✅' : status === 'partial' ? '🔶' : '❌';
        
        report.push(`#### ${icon} ${subcategory} (${config.priority})`);
        report.push('Features:');
        
        for (const feature of config.features) {
          const featureImplemented = await this.isFeatureImplemented(feature);
          const featureIcon = featureImplemented ? '✓' : '✗';
          report.push(`- [${featureIcon}] ${feature}`);
        }
        report.push('');
      }
    }
    
    // Prioriterade åtgärder
    report.push('\n## 🎯 Prioriterade åtgärder\n');
    
    const criticalMissing = this.getCriticalMissing();
    if (criticalMissing.length > 0) {
      report.push('### Kritiska features som saknas:');
      criticalMissing.forEach(f => report.push(`- ${f}`));
    }
    
    // Spara rapport
    const reportPath = path.join(this.projectPath, 'gap-analysis-report.md');
    await fs.writeFile(reportPath, report.join('\n'));
    
    console.log(`✅ Rapport sparad: ${reportPath}`);
    console.log(`\n📈 Completion: ${stats.completeness}%`);
    
    // Visa progress bar
    const progressBar = this.createProgressBar(stats.completeness);
    console.log(`\n${progressBar}`);
  }

  getFeatureStatus(category, subcategory) {
    if (this.analysis.implemented[category]?.[subcategory]) return 'implemented';
    if (this.analysis.partial[category]?.[subcategory]) return 'partial';
    return 'missing';
  }

  async isFeatureImplemented(feature) {
    // Enkel check - kan göras mer sofistikerad
    const found = await this.searchInCode([feature]);
    return found.length > 0;
  }

  getCriticalMissing() {
    const missing = [];
    
    for (const [category, subcategories] of Object.entries(this.requiredFeatures)) {
      for (const [subcategory, config] of Object.entries(subcategories)) {
        if (config.priority === 'critical') {
          const status = this.getFeatureStatus(category, subcategory);
          if (status === 'missing') {
            missing.push(`${category}/${subcategory}`);
          }
        }
      }
    }
    
    return missing;
  }

  createProgressBar(percentage) {
    const filled = Math.round(percentage / 5);
    const empty = 20 - filled;
    return `[${'█'.repeat(filled)}${'░'.repeat(empty)}] ${percentage}%`;
  }
}

// Kör analysen
async function runGapAnalysis() {
  // Du kan ändra sökvägen till ditt projekt
  const analyzer = new MaklarsystemGapAnalyzer('./maklarsystem');
  await analyzer.analyze();
}

// Export för användning
module.exports = { MaklarsystemGapAnalyzer };

// Kör om filen körs direkt
if (require.main === module) {
  runGapAnalysis().catch(console.error);
}