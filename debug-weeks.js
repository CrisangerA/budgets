// Script de depuración para verificar las semanas en la base de datos
import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = 'https://lhcidtiysldiyshwauvp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxoY2lkdGl5c2xkaXlzaHdhdXZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0ODI4MzIsImV4cCI6MjA3NDA1ODgzMn0.wbR5i5hBbUySOhOMho4hCR7HMSzR7IQ8kYqKbYe_9Ic';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugWeeks() {
  console.log('🔍 Iniciando depuración de semanas...');
  
  try {
    // Verificar todas las semanas
    const { data: allWeeks, error: weeksError } = await supabase
      .from('weeks')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (weeksError) {
      console.error('❌ Error al obtener semanas:', weeksError);
      return;
    }
    
    console.log(`📊 Total de semanas encontradas: ${allWeeks?.length || 0}`);
    
    if (allWeeks && allWeeks.length > 0) {
      console.log('\n📋 Primeras 5 semanas:');
      allWeeks.slice(0, 5).forEach((week, index) => {
        console.log(`${index + 1}. ID: ${week.id}`);
        console.log(`   Semana: ${week.week_number}`);
        console.log(`   Mes ID: ${week.month_id}`);
        console.log(`   Fechas: ${week.start_date} - ${week.end_date}`);
        console.log(`   Crédito: ${week.credit_amount}`);
        console.log('---');
      });
      
      // Probar getById con la primera semana
      const firstWeekId = allWeeks[0].id;
      console.log(`\n🔍 Probando getById con ID: ${firstWeekId}`);
      
      const { data: singleWeek, error: singleError } = await supabase
        .from('weeks')
        .select('*')
        .eq('id', firstWeekId)
        .single();
      
      if (singleError) {
        console.error('❌ Error en getById:', singleError);
      } else {
        console.log('✅ getById exitoso:', singleWeek);
      }
    } else {
      console.log('⚠️ No se encontraron semanas en la base de datos');
      
      // Verificar meses
      const { data: months, error: monthsError } = await supabase
        .from('months')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (monthsError) {
        console.error('❌ Error al obtener meses:', monthsError);
      } else {
        console.log(`📅 Total de meses encontrados: ${months?.length || 0}`);
        if (months && months.length > 0) {
          console.log('Primer mes:', months[0]);
        }
      }
    }
    
  } catch (error) {
    console.error('💥 Error general:', error);
  }
}

// Ejecutar depuración
debugWeeks();