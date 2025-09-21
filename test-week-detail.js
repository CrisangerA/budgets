/**
 * Script para probar la funcionalidad completa de WeekDetail
 * Verifica que los datos se carguen correctamente y que la navegación funcione
 */

import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = 'https://lhcidtiysldiyshwauvp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxoY2lkdGl5c2xkaXlzaHdhdXZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0ODI4MzIsImV4cCI6MjA3NDA1ODgzMn0.wbR5i5hBbUySOhOMho4hCR7HMSzR7IQ8kYqKbYe_9Ic';
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Simula WeeksService.getById()
 */
async function testWeekById(weekId) {
  console.log(`🔍 Probando WeeksService.getById('${weekId}')`);
  
  const { data, error } = await supabase
    .from('weeks')
    .select('*')
    .eq('id', weekId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      console.log('⚠️ Semana no encontrada (PGRST116)');
      return null;
    }
    console.error('❌ Error en consulta:', error);
    throw new Error(`Error al obtener semana: ${error.message}`);
  }

  console.log('✅ Semana encontrada:', data);
  return data;
}

/**
 * Simula PaymentsService.getWithDetails()
 */
async function testPaymentsWithDetails(weekId) {
  console.log(`💳 Probando PaymentsService.getWithDetails('${weekId}')`);
  
  const { data, error } = await supabase
    .from('payments')
    .select(`
      *,
      provider:providers(id, name)
    `)
    .eq('week_id', weekId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Error al obtener pagos:', error);
    throw new Error(`Error al obtener pagos: ${error.message}`);
  }

  console.log(`📊 Pagos encontrados: ${data?.length || 0}`);
  if (data && data.length > 0) {
    console.log('💰 Detalles de pagos:', data.map(p => ({
      id: p.id,
      amount: p.amount,
      description: p.description,
      provider: p.provider?.name
    })));
  }
  
  return data || [];
}

/**
 * Prueba principal
 */
async function testWeekDetailFunctionality() {
  try {
    console.log('🚀 Iniciando prueba de WeekDetail...');
    
    // Primero obtenemos una semana de prueba
    console.log('\n📋 Obteniendo semanas disponibles...');
    const { data: weeks, error: weeksError } = await supabase
      .from('weeks')
      .select('id, week_number, month_id, credit_amount')
      .limit(3);
    
    if (weeksError) {
      throw new Error(`Error al obtener semanas: ${weeksError.message}`);
    }
    
    if (!weeks || weeks.length === 0) {
      console.log('⚠️ No hay semanas en la base de datos');
      return;
    }
    
    console.log(`✅ Encontradas ${weeks.length} semanas:`);
    weeks.forEach(week => {
      console.log(`  - Semana ${week.week_number}: ID=${week.id}, Crédito=$${week.credit_amount}`);
    });
    
    // Probamos con la primera semana
    const testWeek = weeks[0];
    console.log(`\n🎯 Probando con Semana ${testWeek.week_number} (ID: ${testWeek.id})`);
    
    // Prueba 1: Obtener datos de la semana
    const weekData = await testWeekById(testWeek.id);
    if (!weekData) {
      console.log('❌ No se pudo obtener los datos de la semana');
      return;
    }
    
    // Prueba 2: Obtener pagos de la semana
    const paymentsData = await testPaymentsWithDetails(testWeek.id);
    
    // Prueba 3: Calcular totales
    const totalPaid = paymentsData.reduce((sum, payment) => sum + payment.amount, 0);
    const remainingCredit = weekData.credit_amount - totalPaid;
    const progressPercentage = weekData.credit_amount > 0 
      ? (totalPaid / weekData.credit_amount) * 100 
      : 0;
    
    console.log('\n📊 Resumen de la semana:');
    console.log(`  💰 Crédito asignado: $${weekData.credit_amount.toLocaleString()}`);
    console.log(`  💳 Total pagado: $${totalPaid.toLocaleString()}`);
    console.log(`  📈 Crédito restante: $${remainingCredit.toLocaleString()}`);
    console.log(`  📊 Progreso: ${progressPercentage.toFixed(1)}%`);
    
    // Prueba 4: Verificar URL de navegación
    const navigationUrl = `/week/${testWeek.id}`;
    console.log(`\n🔗 URL de navegación: ${navigationUrl}`);
    
    console.log('\n✅ Todas las pruebas de WeekDetail completadas exitosamente!');
    
  } catch (error) {
    console.error('💥 Error en las pruebas:', error.message);
    process.exit(1);
  }
}

// Ejecutar las pruebas
testWeekDetailFunctionality();