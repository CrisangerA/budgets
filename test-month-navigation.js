import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = 'https://lhcidtiysldiyshwauvp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxoY2lkdGl5c2xkaXlzaHdhdXZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0ODI4MzIsImV4cCI6MjA3NDA1ODgzMn0.wbR5i5hBbUySOhOMho4hCR7HMSzR7IQ8kYqKbYe_9Ic';
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Script para probar la navegación desde MonthDetail
 * Simula exactamente lo que hace WeeksService.getWithPayments()
 */
async function testMonthNavigation() {
  console.log('🔍 Probando navegación desde MonthDetail...');
  
  try {
    // 1. Obtener todos los meses disponibles
    console.log('\n📅 Obteniendo meses disponibles...');
    const { data: months, error: monthsError } = await supabase
      .from('months')
      .select('*')
      .order('year', { ascending: false })
      .order('name', { ascending: false })
      .limit(5);
    
    if (monthsError) {
      console.error('❌ Error al obtener meses:', monthsError);
      return;
    }
    
    console.log(`✅ Encontrados ${months.length} meses:`);
    months.forEach(month => {
      console.log(`  - ${month.name} ${month.year} (ID: ${month.id})`);
    });
    
    if (months.length === 0) {
      console.log('⚠️ No hay meses en la base de datos');
      return;
    }
    
    // 2. Probar con el primer mes encontrado
    const testMonth = months[0];
    console.log(`\n🎯 Probando con mes: ${testMonth.name} ${testMonth.year}`);
    
    // 3. Obtener semanas del mes (simulando WeeksService.getWithPayments)
    console.log('\n📊 Obteniendo semanas con pagos...');
    const { data: weeks, error: weeksError } = await supabase
      .from('weeks')
      .select(`
        *,
        payments (
          id,
          amount,
          description,
          payment_date,
          created_at,
          provider_id,
          providers (
            id,
            name
          )
        )
      `)
      .eq('month_id', testMonth.id)
      .order('week_number', { ascending: true });
    
    if (weeksError) {
      console.error('❌ Error al obtener semanas:', weeksError);
      return;
    }
    
    console.log(`✅ Encontradas ${weeks.length} semanas para ${testMonth.name} ${testMonth.year}:`);
    
    if (weeks.length === 0) {
      console.log('⚠️ No hay semanas para este mes');
      return;
    }
    
    // 4. Mostrar detalles de cada semana
    weeks.forEach(week => {
      const totalPagos = week.payments.reduce((sum, payment) => sum + payment.amount, 0);
      console.log(`\n  📋 Semana ${week.week_number}:`);
      console.log(`     ID: ${week.id}`);
      console.log(`     Crédito: $${week.credit_amount}`);
      console.log(`     Pagos: ${week.payments.length} (Total: $${totalPagos})`);
      console.log(`     Navegación: /week/${week.id}`);
    });
    
    // 5. Probar consulta individual de cada semana
    console.log('\n🔍 Probando consulta individual de cada semana...');
    
    for (const week of weeks) {
      console.log(`\n  🎯 Probando semana ${week.week_number} (ID: ${week.id})`);
      
      // Simular WeeksService.getById()
      const { data: weekData, error: weekError } = await supabase
        .from('weeks')
        .select('*')
        .eq('id', week.id)
        .single();
      
      if (weekError) {
        console.error(`     ❌ Error al obtener semana: ${weekError.message}`);
      } else if (!weekData) {
        console.error(`     ❌ Semana no encontrada`);
      } else {
        console.log(`     ✅ Semana encontrada correctamente`);
        console.log(`     📊 Datos: Semana ${weekData.week_number}, Crédito: $${weekData.credit_amount}`);
      }
    }
    
    console.log('\n🎉 Prueba de navegación completada');
    
  } catch (error) {
    console.error('💥 Error general:', error);
  }
}

// Ejecutar la prueba
testMonthNavigation();